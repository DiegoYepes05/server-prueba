export class Transaction {
  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly amountInCents: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly customerEmail: string,
    public readonly createdAt?: Date,
  ) {}
}
