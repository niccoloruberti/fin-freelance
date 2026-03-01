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

    const transactions = await this.transactionRepository
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere('YEAR(t.date) = :year', { year })
      .getMany();

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const taxCoefficientIncome = Number(user.taxCoefficientIncome);
    const taxRateSubstitutive = Number(user.taxRateSubstitutive);

    // Reddito imponibile lordo (fatturato × coefficiente)
    const taxableIncome = totalIncome * (taxCoefficientIncome / 100);

    // Contributi INPS (calcolati sul reddito lordo, con aliquote dell'anno fiscale)
    const inpsRates = getInpsRatesForYear(year);
    let inpsContributions = 0;
    let inpsRate = 0;

    switch (user.inpsManagement) {
      case 'gestione_separata': {
        const { rate, ceiling } = inpsRates.gestione_separata;
        inpsRate = rate;
        const cappedIncome = Math.min(taxableIncome, ceiling);
        inpsContributions = cappedIncome * inpsRate;
        break;
      }
      case 'artigiani_commercianti': {
        const { rate, minimum, minThreshold } = inpsRates.artigiani_commercianti;
        inpsRate = rate;
        if (taxableIncome <= minThreshold) {
          inpsContributions = minimum;
        } else {
          inpsContributions = minimum + (taxableIncome - minThreshold) * inpsRate;
        }
        break;
      }
      case 'cassa_professionale': {
        inpsRate = inpsRates.cassa_professionale.rate;
        inpsContributions = taxableIncome * inpsRate;
        break;
      }
    }

    // Reddito netto imponibile: i contributi INPS versati si deducono dal lordo
    // prima di applicare l'imposta sostitutiva (L. 190/2014, art. 1 c. 64)
    const netTaxableIncome = Math.max(0, taxableIncome - inpsContributions);
    const substitutiveTax = netTaxableIncome * (taxRateSubstitutive / 100);
    const totalTax = substitutiveTax + inpsContributions;
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
      taxRegime: user.taxRegime,
      inpsManagement: user.inpsManagement,
      monthlyBreakdown: Array.from(monthlyMap.values()),
    };
  }
}
