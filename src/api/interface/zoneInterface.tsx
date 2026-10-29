export interface ZoneInterface {
    zoneValue?: ZoneDataInterface;
    token?: string;
    loading?: boolean;
    success?: boolean;
    fcmToken?: string;
}

export interface ZoneDataInterface {
    id?: number,
    currency_symbol?: string;
    currency_code?: string;
    exchange_rate?: number;
    data?: Array<{ id: number; name?: string }>;
    name?: string
}
