export interface Transaction {
  id: string;
  wompiId?: string;
  reference: string;
  amountInCents: number;
  currency: string;
  status: string;
  installments: number;
  productId: string;
  userId: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingDepartment?: string;
}

export interface TransactionRepository {
  create(data: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateStatus(
    id: string,
    status: string,
    wompiId?: string,
  ): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByWompiId(wompiId: string): Promise<Transaction | null>;
  findAllWithUser(): Promise<any[]>;
}

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
