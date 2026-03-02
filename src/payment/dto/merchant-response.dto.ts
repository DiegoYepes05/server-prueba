export interface MerchantResponse {
  data: {
    id: number;
    name: string;
    email: string;
    contact_name: string;
    phone_number: string;
    active: boolean;
    logo_url: string | null;
    legal_name: string;
    legal_id_type: string;
    legal_id: string;
    public_key: string;
    accepted_currencies: string[];
    payment_methods: {
      name: string;
      payment_processors: { name: string }[];
    }[];
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
  };
}
