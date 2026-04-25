export interface Deal {
  date: Date
  dateStr: string
  symbol: string
  securityName: string
  clientName: string
  buySell: 'BUY' | 'SELL'
  quantity: number
  tradePrice: number
  dealValue: number
  month: string
}

export interface EventStudyRecord {
  date: Date
  symbol: string
  return1D: number
  return5D: number
  return10D: number
  return30D: number
  label: 0 | 1
}