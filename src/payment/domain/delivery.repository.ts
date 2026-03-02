export interface Delivery {
  id: string;
  address: string;
  city: string;
  department: string;
  status: string;
  userId: string;
  transactionId: string;
}

export interface DeliveryRepository {
  create(data: Omit<Delivery, 'id'>): Promise<Delivery>;
}

export const DELIVERY_REPOSITORY = 'DELIVERY_REPOSITORY';
