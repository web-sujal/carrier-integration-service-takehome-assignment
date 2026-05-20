/**
 * Shape aligned with UPS Rating REST examples (“RateRequest” root).
 * We only model what we populate; UPS accepts additional optional nodes.
 */

export interface UpsRatedAddress {
  AddressLine?: string[];
  City: string;
  StateProvinceCode: string;
  PostalCode: string;
  CountryCode: string;
}

export interface UpsShipmentParty {
  Name: string;
  ShipperNumber?: string;
  Address: UpsRatedAddress;
}

/** Document-style payload for POST body (UPS Rating Request). */
export interface UpsRatingRequestPayload {
  RateRequest: {
    Request?: {
      TransactionReference?: {
        CustomerContext?: string;
      };
    };
    Shipment: {
      Shipper: UpsShipmentParty;
      ShipTo: {
        Name: string;
        Address: UpsRatedAddress;
      };
      ShipFrom: {
        Name: string;
        Address: UpsRatedAddress;
      };
      PaymentDetails: {
        ShipmentCharge: Array<{
          Type: string;
          BillShipper: { AccountNumber: string };
        }>;
      };
      Service: { Code: string; Description?: string };
      NumOfPieces: string;
      Package: {
        PackagingType: { Code: string; Description: string };
        Dimensions: {
          UnitOfMeasurement: { Code: string; Description?: string };
          Length: string;
          Width: string;
          Height: string;
        };
        PackageWeight: {
          UnitOfMeasurement: { Code: string; Description?: string };
          Weight: string;
        };
      };
    };
  };
}
