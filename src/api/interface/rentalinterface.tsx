export interface RentalInterface {
    success?: boolean;
    rentalVehicleData?: RentalvehicleDataInterface;
    rentalVehicleLists?: RentalvehicleDataInterface;
    rentalRideRequestData?: any[];
    rentalVehicleListsDetails: RentalVehicleDetails;
    loading?: boolean;
    statusCode?: number | null | undefined
}

export interface RentalvehicleDataInterface {
    data?: any[];
}



export interface RentalBookinginterface {
    location_coordinates: locationInterface[]
    locations: string[],
    service_id: string,
    service_category_id: string,
    vehicle_type_id: string,
    rental_vehicle_id: string,
    is_with_driver: string,
    payment_method: string,
    start_time: string,
    end_time: string,
    currency_code: string
}

export interface RentalVehicleDiscoveryRequest {
    locations: Array<{
        lat: number;
        lng: number;
    }>;
    service_id: number;
    service_category_id: number;
}

export interface RentalVehicleListRequest {
    start_time: string;
    end_time: string;
    vehicle_type_id: number;
    lat: number;
    lng: number;
    is_with_driver: number;
}


export interface locationInterface {
    lat: string,
    lng: string,
}
export interface RentalVehicleDetails {
  id?: number;
  vehicle_type_id?: number;
  vehicle_subtype?: string;
  fuel_type?: string;
  mileage?: string | number;
  gear_type?: string;
  seatingCapacity?: string | number;
  vehicle_speed?: string | number;
  is_ac?: boolean | number;
  bag_count?: number;
  rental_vehicle_galleries?: string[];
  normal_image_url?: string;
  name?: string;
  description?: string;
  vehicle_per_day_price?: number;
  driver_per_day_charge?: number;
  driver?: { rating_count?: number };
  interior?: string[];
  currency_symbol?: string;
  charge?: Partial<Record<'vehicle_rent' | 'no_of_days' | 'driver_rent' | 'platform_fee' | 'tax' | 'commission' | 'total', number>>;
}
