import { Dimensions, ServicePreference, StdShippingRatesResBody } from "../types";

const getShippingRates = async (origin: string, destination: string, package_type: string, dimensions: Dimensions, weight: number, service_preference?: ServicePreference) => {

  // const shippingRates = await shippingRatesRepository.getShippingRates(origin, destination, package_type, dimensions, weight, service_preference);
  const shippingRates: StdShippingRatesResBody[] = [
    {
      rate: 100,
      provider_name: "UPS",
      currency: "USD",
      estimated_delivery_days: 3,
    },
  ];
  return shippingRates;
};

export const shippingRatesService = {
  getShippingRates,
};