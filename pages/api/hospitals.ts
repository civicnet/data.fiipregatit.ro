import type { NextApiRequest, NextApiResponse } from "next";
import inpatients from "../../data/inpatients.json";
import icu from "../../data/icu.json";
import { Feature, Polygon, MultiPolygon } from "@turf/helpers";
import { getNewestData } from "../../lib/getNewestData";

//const icu = require("../../data/icu.json");
//const inpatients = require("../../data/inpatients.json");

type ErrorResponse = { error: boolean };

export type Hospital = {
  name: string;
  county: string;
  locality?: Feature<
    Polygon | MultiPolygon,
    {
      natcode: string;
      name: string;
      county: string;
    }
  >;
  address: string;
  data: {
    icu: Record<string, unknown>;
    inpatient: Record<string, unknown>;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type HospitalsResponse = {
  hospitals: Hospital[];
  statistics: {
    minICU: number;
    maxICU: number;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HospitalsResponse | ErrorResponse>
) {
  const { county, siruta } = req.query;
  const listing: Hospital[] = [];

  const numberize = (
    data?: Record<string, string | number>
  ): Record<string, number> => {
    if (!data) {
      return {};
    }

    return Object.entries(data).reduce((acc, [k, v]) => {
      return {
        ...acc,
        [k]: typeof v === "string" ? 0 : Number(v),
      };
    }, {});
  };

  for (const hospital of inpatients) {
    if (siruta && hospital.locality?.properties.natcode !== siruta) {
      continue;
    }

    if (county && hospital.locality?.properties.county !== county) {
      continue;
    }

    const icuData = icu.find(
      (h) => h.hospital === hospital.hospital && h.county === hospital.county
    );

    const numIcuData = numberize(icuData?.data);
    const numInpatientData = numberize(hospital.data);

    listing.push({
      name: hospital.hospital,
      county: hospital.county,
      locality: hospital.locality as any,
      address: hospital.potentialLocations.results[0].formatted_address,
      data: {
        icu: numIcuData,
        inpatient: numInpatientData,
      },
      coordinates: hospital.potentialLocations.results[0].geometry.location,
    });
  }

  for (const icuHospital of icu) {
    if (siruta && icuHospital.locality?.properties.natcode !== siruta) {
      continue;
    }
    
    if (county && icuHospital.locality?.properties.county !== county) {
      continue;
    }

    const hospitalData = inpatients.find(
      (h) =>
        h.hospital === icuHospital.hospital && h.county === icuHospital.county
    );

    if (hospitalData) {
      continue;
    }

    listing.push({
      name: icuHospital.hospital,
      county: icuHospital.county,
      locality: icuHospital.locality as any,
      address: icuHospital.potentialLocations.results[0].formatted_address,
      data: {
        icu: numberize(icuHospital.data),
        inpatient: {},
      },
      coordinates: icuHospital.potentialLocations.results[0].geometry.location,
    });
  }

  let minICU: number | undefined = undefined;
  let maxICU: number | undefined = undefined;

  for (const hospital of listing) {
    let count = getNewestData(hospital.data.icu);
    if (count === undefined) {
      count = 0;
    }

    const numCount = Number(typeof count === "string" ? 0 : count);

    if (minICU === undefined) {
      minICU = numCount;
    } else if (minICU > numCount) {
      minICU = numCount;
    }

    if (maxICU === undefined) {
      maxICU = numCount;
      continue;
    } else if (maxICU < numCount) {
      maxICU = numCount;
    }
  }

  return res.status(200).json({
    hospitals: listing,
    statistics: {
      minICU: Number(minICU),
      maxICU: Number(maxICU),
    },
  });
}
