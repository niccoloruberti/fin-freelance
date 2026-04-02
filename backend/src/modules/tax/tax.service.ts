import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { getInpsRatesForYear } from './inps-rates.config';

export interface MonthlyData {
  month: number;
  income: number;
  expenses: number;
}

export interface TaxSummaryResult {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  taxableIncome: number;       // reddito lordo: fatturato × coefficiente
  netTaxableIncome: number;    // reddito netto: taxableIncome − contributi INPS (base imposta sostitutiva)
  taxCoefficientIncome: number;
  inpsContributions: number;
  inpsRate: number;
  substitutiveTax: number;
  taxRateSubstitutive: number;
  totalTax: number;
  netIncome: number;
  quarterlyReserve: number;
  junePayment: number;         // 1° acconto (40%) — scadenza 30 giugno
  novemberPayment: number;     // 2° acconto (60%) — scadenza 30 novembre
  accontiMethod: 'storico' | 'previsionale';
  taxRegime: string;
  inpsManagement: string;
  monthlyBreakdown: MonthlyData[];
}

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSummary(userId: string, year: number): Promise<TaxSummaryResult> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const [transactions, prevTransactions] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.category', 'category')
        .where('t.userId = :userId', { userId })
        .andWhere('YEAR(t.date) = :year', { year })
        .getMany(),
      this.transactionRepository
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.category', 'category')
        .where('t.userId = :userId', { userId })
        .andWhere('YEAR(t.date) = :year', { year: year - 1 })
        .getMany(),
    ]);

    const totalIncome = transactions
      .filter((t) => t.type === 'income' && (t.category === null || t.category.isTaxable !== false))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const taxCoefficientIncome = Number(user.taxCoefficientIncome);
    const taxRateSubstitutive = Number(user.taxRateSubstitutive);

    const { totalTax, taxableIncome, netTaxableIncome, substitutiveTax, inpsContributions, inpsRate } =
      this.computeTax(totalIncome, user, year);

    // Metodo storico: usa le tasse dell'anno precedente se disponibili
    const prevIncome = prevTransactions
      .filter((t) => t.type === 'income' && (t.category === null || t.category.isTaxable !== false))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    let accontiMethod: 'storico' | 'previsionale';
    let accontiBase: number;

    if (prevIncome > 0) {
      accontiMethod = 'storico';
      accontiBase = this.computeTax(prevIncome, user, year - 1).totalTax;
    } else {
      accontiMethod = 'previsionale';
      accontiBase = totalTax;
    }

    const junePayment = accontiBase * 0.4;
    const novemberPayment = accontiBase * 0.6;

    const netIncome = totalIncome - totalExpenses - totalTax;
    const quarterlyReserve = totalTax / 4;

    // Breakdown mensile
    const monthlyMap = new Map<number, MonthlyData>();
    for (let m = 1; m <= 12; m++) {
      monthlyMap.set(m, { month: m, income: 0, expenses: 0 });
    }
    for (const t of transactions) {
      const month = new Date(t.date).getMonth() + 1;
      const entry = monthlyMap.get(month);
      if (t.type === 'income') {
        entry.income += Number(t.amount);
      } else {
        entry.expenses += Number(t.amount);
      }
    }

    return {
      year,
      totalIncome,
      totalExpenses,
      taxableIncome,
      netTaxableIncome,
      taxCoefficientIncome,
      inpsContributions,
      inpsRate,
      substitutiveTax,
      taxRateSubstitutive,
      totalTax,
      netIncome,
      quarterlyReserve,
      junePayment,
      novemberPayment,
      accontiMethod,
      taxRegime: user.taxRegime,
      inpsManagement: user.inpsManagement,
      monthlyBreakdown: Array.from(monthlyMap.values()),
    };
  }

  private computeTax(
    totalIncome: number,
    user: User,
    year: number,
  ): { totalTax: number; taxableIncome: number; netTaxableIncome: number; substitutiveTax: number; inpsContributions: number; inpsRate: number } {
    const taxCoefficientIncome = Number(user.taxCoefficientIncome);
    const taxRateSubstitutive = Number(user.taxRateSubstitutive);
    const taxableIncome = totalIncome * (taxCoefficientIncome / 100);

    const inpsRates = getInpsRatesForYear(year);
    let inpsContributions = 0;
    let inpsRate = 0;

    switch (user.inpsManagement) {
      case 'gestione_separata': {
        const { rate, ceiling } = inpsRates.gestione_separata;
        inpsRate = rate;
        inpsContributions = Math.min(taxableIncome, ceiling) * inpsRate;
        break;
      }
      case 'artigiani_commercianti': {
        const { rate, minimum, minThreshold } = inpsRates.artigiani_commercianti;
        inpsRate = rate;
        inpsContributions =
          taxableIncome <= minThreshold
            ? minimum
            : minimum + (taxableIncome - minThreshold) * inpsRate;
        break;
      }
      case 'cassa_professionale': {
        inpsRate = inpsRates.cassa_professionale.rate;
        inpsContributions = taxableIncome * inpsRate;
        break;
      }
    }

    const netTaxableIncome = Math.max(0, taxableIncome - inpsContributions);
    const substitutiveTax = netTaxableIncome * (taxRateSubstitutive / 100);
    const totalTax = substitutiveTax + inpsContributions;

    return { totalTax, taxableIncome, netTaxableIncome, substitutiveTax, inpsContributions, inpsRate };
  }
}
