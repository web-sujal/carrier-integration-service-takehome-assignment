/** Subset of UPS Rating API success payload we rely on (`RateResponse` root). Fields optional for runtime safety. */
export interface UpsMonetaryCharges {
  CurrencyCode?: string;
  MonetaryValue?: string;
}

export interface UpsEstimatedArrival {
  BusinessDaysInTransit?: string;
  TotalTransitDays?: string;
}

export interface UpsTimeInTransit {
  ServiceSummary?: {
    EstimatedArrival?: UpsEstimatedArrival;
  };
}

export interface UpsGuaranteedDelivery {
  BusinessDaysInTransit?: string;
}

/** One rated-service option UPS may return as an object or a one-element variant. */
export interface UpsRatedShipment {
  TransportationCharges?: UpsMonetaryCharges;
  TotalCharges?: UpsMonetaryCharges;
  Service?: { Code?: string; Description?: string };
  TimeInTransit?: UpsTimeInTransit;
  GuaranteedDelivery?: UpsGuaranteedDelivery;
}

export interface UpsResponseStatusBlock {
  Code?: string;
  Description?: string;
}

export interface UpsRateResponseEnvelope {
  RateResponse?: {
    Response?: {
      ResponseStatus?: UpsResponseStatusBlock;
    };
    /** UPS may emit one object or an array of rated services. */
    RatedShipment?: UpsRatedShipment | UpsRatedShipment[];
  };
}
