export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  vatNumber?: string
  fiscalCode?: string
  taxRegime: 'forfettario' | 'ordinario'
  taxCoefficientIncome: number
  taxRateSubstitutive: number
  inpsManagement: 'gestione_separata' | 'cassa_professionale' | 'artigiani_commercianti'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  firstName: string
  lastName: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  invoiceNumber?: string
  isRecurring: boolean
  recurringTransactionId?: string
  userId: string
  categoryId?: string
  clientId?: string
  category?: Category
  client?: Client
  createdAt: string
  updatedAt: string
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  frequency: RecurringFrequency
  dayOfPeriod?: number
  startDate: string
  endDate?: string
  active: boolean
  lastGeneratedDate?: string
  userId: string
  categoryId?: string
  clientId?: string
  category?: Category
  client?: Client
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
  icon?: string
  color?: string
  isDefault: boolean
  isTaxable: boolean
}

export type ClientStatus = 'lead' | 'active' | 'archived'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  vatNumber?: string
  fiscalCode?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
  status: ClientStatus
  userId: string
}

export interface TaxSummary {
  year: number
  totalIncome: number
  taxableIncome: number
  substitutiveTax: number
  netIncome: number
  totalExpenses: number
  totalTaxes: number
}

export interface MonthlyTaxData {
  month: number
  income: number
  expenses: number
}

export interface TaxSummaryDetail {
  year: number
  totalIncome: number
  totalExpenses: number
  taxableIncome: number       // reddito lordo: fatturato × coefficiente
  netTaxableIncome: number    // reddito netto: taxableIncome − contributi INPS
  taxCoefficientIncome: number
  inpsContributions: number
  inpsRate: number
  substitutiveTax: number
  taxRateSubstitutive: number
  totalTax: number
  netIncome: number
  quarterlyReserve: number
  junePayment: number
  novemberPayment: number
  accontiMethod: 'storico' | 'previsionale'
  taxRegime: string
  inpsManagement: string
  monthlyBreakdown: MonthlyTaxData[]
}
