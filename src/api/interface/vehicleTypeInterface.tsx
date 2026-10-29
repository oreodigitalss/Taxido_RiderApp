

export interface VehicleTypeInterface {
    success?: boolean;
    vehicleTypedata?: VehicleTypeDataInterface[];
    allVehicle?: VehicleTypeDataInterface[];
    loading?: boolean;
    token?: string | undefined | null;
    fcmToken?: string | undefined | null;
    statusCode?: null | number | undefined
}

export interface VehicleTypeDataInterface {
    id: number,
    name: string,
    vehicle_image_id: number,
    slug: string,
    created_by_id: string,
    capacity: number,
    min_fare: number,
    min_distance: number,
    per_distance: number,
    cancellation_charge: number,
    waiting_time_limit: number,
    status: number,
    created_at: string,
    updated_at: string,
    deleted_at: null,
    vehicle_image: vehicleImageInterface,
    zones: zoneInterface[]
}

export interface vehicleImageInterface {
    id: number,
    name: string,
    file_name: string,
    mime_type: string,
    disk: string,
    size: string,
    created_by_id: null,
    created_at: string,
    original_url: string,
    preview_url: string
}

export interface zoneInterface {
    id: number,
    name: string,
    place_points: placePointInterface
}

export interface placePointInterface {
    type: string,
    coordinates: number
}

export interface vehicleInterface {
    normal_image?: { original_url?: string };
    vehicle_per_day_price?: number;
    driver_per_day_charge?: number;
    vehicle_subtype?: string;
    fuel_type?: string;
    mileage?: string | number;
    gear_type?: string;
    seatingCapacity?: string | number;
    vehicle_speed?: string | number;
    interior?: string[];
    model: number;
    vehicle_image: vehicleImageInterface
    plate_number: number
    description: string
    name: string
}
export interface driverInfo {
    vehicle_info: vehicleInterface
    rental_vehicle: vehicleInterface

}
export interface taxidetailsObject {
    service?: { service_type?: string; slug?: string };
    ambulance_image_url?: string;
    vehicle_type?: { vehicle_image_url?: string };
    color?: string;
    vehicle_model?: string;
    plate_number?: string | number;
    driver?: driverInfo;
    rental_vehicle?: vehicleInterface;
}




export interface VehicleFareRequest {
    locations: Array<{ lat: number; lng: number }>;
    service_id: number | string;
    service_category_id: number | string;
}
