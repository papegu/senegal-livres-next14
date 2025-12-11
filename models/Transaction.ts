// models/Transaction.ts
export interface Transaction {
  id: string;
  orderId?: string;
  userId: string;
  bookId?: string;
  amount: number;
  paymentMethod?: string;
  providerTxId?: string;
  status: "pending" | "paid" | "failed" | string;
  rawPayload?: any;
  createdAt?: string;
  updatedAt?: string;
}
