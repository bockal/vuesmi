export const MAX_GUESTS = 12;
export const MIN_NIGHTS = 2;
export const FIRST_GUEST_NIGHTLY_CENTS = 19_900;
export const ADDITIONAL_GUEST_NIGHTLY_CENTS = 5_000;
export const CHILD_NIGHTLY_CENTS = 2_500;
export const MAX_SUMMER_NIGHTLY_CENTS = 69_900;
export const SHOULDER_DISCOUNT_BASIS_POINTS = 2_500;
export const STANDARD_CLEANING_CENTS = 9_900;
export const MICHIGAN_LODGING_TAX_BASIS_POINTS = 600;
export const BOAT_RENTAL_DAILY_CENTS = 10_000;
export const PET_FEE_CENTS = 9_900;

export type Quote = {
  nights: number;
  guests: number;
  nightlyCents: number;
  summerNights: number;
  shoulderNights: number;
  lodgingCents: number;
  cleaningCents: number;
  boatRentalCents: number;
  petCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

export function dateNights(arrival: string, departure: string) {
  const start = Date.parse(`${arrival}T12:00:00Z`);
  const end = Date.parse(`${departure}T12:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.round((end - start) / 86_400_000);
}

export function calculateQuote(arrival: string, departure: string, adults: number, children: number, boatRental = false, pets = 0): Quote {
  const nights = dateNights(arrival, departure);
  const guests = adults + children;
  const summerNightlyCents = Math.min(MAX_SUMMER_NIGHTLY_CENTS,FIRST_GUEST_NIGHTLY_CENTS + Math.max(0, adults - 1) * ADDITIONAL_GUEST_NIGHTLY_CENTS + children * CHILD_NIGHTLY_CENTS);
  let summerNights=0,shoulderNights=0,lodgingCents=0;
  const start=new Date(`${arrival}T12:00:00Z`);
  for(let i=0;i<nights;i++){const d=new Date(start);d.setUTCDate(start.getUTCDate()+i);const summer=d.getUTCMonth()>=5&&d.getUTCMonth()<=7;if(summer){summerNights++;lodgingCents+=summerNightlyCents}else{shoulderNights++;lodgingCents+=Math.round(summerNightlyCents*(10_000-SHOULDER_DISCOUNT_BASIS_POINTS)/10_000)}}
  const nightlyCents=nights>0?Math.round(lodgingCents/nights):summerNightlyCents;
  const cleaningCents = STANDARD_CLEANING_CENTS;
  const boatRentalCents = boatRental ? BOAT_RENTAL_DAILY_CENTS * nights : 0;
  const petCents = pets > 0 ? PET_FEE_CENTS : 0;
  const subtotalCents = lodgingCents + cleaningCents + boatRentalCents + petCents;
  const taxCents = Math.round(subtotalCents * MICHIGAN_LODGING_TAX_BASIS_POINTS / 10_000);
  return { nights, guests, nightlyCents, summerNights, shoulderNights, lodgingCents, cleaningCents, boatRentalCents, petCents, subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
