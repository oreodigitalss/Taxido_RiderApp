import {
  rentalVehicle,
  rental_vehicle,
  rentalRideRequest,
} from '../endpoints/rentalEndPoint';
import {
  RentalBookinginterface,
  RentalVehicleDiscoveryRequest,
  RentalVehicleListRequest,
} from '../interface/rentalinterface';
import { POST_API, GET_API } from '../methods';

export const rentalvehicleRequest = async (data: RentalVehicleDiscoveryRequest) => {
  const response = await POST_API(data, rentalVehicle);
  if (
    !response ||
    !Number.isInteger(response.status) ||
    response.status < 200 ||
    response.status >= 300
  ) {
    throw new Error(
      response?.data?.message || 'Unable to find rental vehicles for this pickup location.',
    );
  }
  return response;
};

export const rentalRideRequests = async (data: RentalBookinginterface) => {
  return POST_API(data, rentalRideRequest)
    .then(res => {
      return res;
    })
    .catch(e => {
      return e?.response;
    });
};

export const rentalVehicleList = async ({
  start_time,
  end_time,
  vehicle_type_id,
  lat,
  lng,
  is_with_driver,
}: RentalVehicleListRequest) => {
  const response = await GET_API(
    `${rental_vehicle}?start_time=${encodeURIComponent(start_time)}&end_time=${encodeURIComponent(end_time)}&vehicle_type_id=${vehicle_type_id}&lat=${lat}&lng=${lng}&is_with_driver=${is_with_driver}`,
  );
  if (
    !response ||
    !Number.isInteger(response.status) ||
    response.status < 200 ||
    response.status >= 300
  ) {
    throw new Error(
      response?.data?.message || 'Unable to load rental vehicles for the selected dates.',
    );
  }
  return response;
};

export const rentalVehicleListDetsils = async ({
  vehicle_type_id,
  no_of_days,
  is_with_driver,
}: {
  vehicle_type_id: number;
  no_of_days: any;
  is_with_driver: number;
}) => {
  return GET_API(
    `${rental_vehicle}/${vehicle_type_id}?no_of_days=${no_of_days}&is_with_driver=${is_with_driver}`,
  )
    .then(res => {
      return res;
    })
    .catch(e => {
      return e?.response;
    });
};

const rentalVehicleServices = {
  rentalvehicleRequest,
  rentalVehicleList,
  rentalRideRequests,
  rentalVehicleListDetsils,
};

export default rentalVehicleServices;
