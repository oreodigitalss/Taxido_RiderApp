import { vehicleType,allvehicle } from '../endpoints/vehicleTypeEndPoint';
import { VehicleFareRequest } from '../interface/vehicleTypeInterface';
import { POST_API, GET_API } from '../methods';

export const vehicleTypes = async (data: VehicleFareRequest) => {
  return POST_API(data, vehicleType)
    .then(res => {
      return res;
    })
    .catch(e => {
      return e?.response;
    });
};

export const allVehicleData = async () => {
  return GET_API(allvehicle)
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      return e?.response;
    });
};


const vehicleTypeServices = {
  vehicleTypes,
  allVehicleData
};

export default vehicleTypeServices;
