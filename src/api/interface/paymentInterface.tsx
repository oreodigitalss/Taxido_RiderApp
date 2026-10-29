export interface PaymentMethodInterface {
    success?: boolean;
    paymentMethodData?: PaymentMethodDataInterface[];
    paymentVerifyData?: PaymentVerifyInterface | [];
    loading?: boolean;
    token?: string | null | undefined;
    fcmToken?: string | null | undefined;
    statusCode?: number | null | undefined
}

export interface PaymentMethodDataInterface {
    id?: number | string;
    name: string,
    slug: string,
    image: string,
    status: boolean
}


export interface PaymentVerifyInterface {
    item_id: number,
    type: string,
    transaction_id?: string
}