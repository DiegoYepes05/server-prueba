export interface CreateTransactionResponse {
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      extra: {
        bin: string;
        name: string;
        brand: string;
        last_four: string;
        card_holder: string;
      };
      installments: number;
    };
    status: string;
    status_message: string | null;
    redirect_url: string;
    customer_data: {
      legal_id: string;
      full_name: string;
      phone_number: string;
      legal_id_type: string;
    };
  };
}
