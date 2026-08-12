import { startOfDay } from "date-fns";

/**
 * Anläggningar som stängs ner för bokning.
 * Sista bokningsbara dag anges som 'YYYY-MM-DD' (inklusive).
 */
interface FacilityClosure {
  /** Matchas mot anläggningens namn/stad (case-insensitivt, delsträng) */
  match: string;
  lastBookableDate: string;
  message: string;
}

export const FACILITY_CLOSURES: FacilityClosure[] = [
  {
    match: "borlänge",
    lastBookableDate: "2026-08-03",
    message:
      "Bokningen för Borlänge är stängd. Inga nya tider kan bokas efter 3 augusti 2026.",
  },
];

const matchesFacility = (
  facility: { name?: string; city?: string } | undefined,
  match: string
) => {
  if (!facility) return false;
  const haystack = `${facility.name ?? ""} ${facility.city ?? ""}`.toLowerCase();
  return haystack.includes(match.toLowerCase());
};

export const getFacilityClosure = (
  facility: { name?: string; city?: string } | undefined
): FacilityClosure | undefined =>
  FACILITY_CLOSURES.find((c) => matchesFacility(facility, c.match));

/** True om anläggningen inte kan bokas på det angivna datumet */
export const isFacilityClosedOnDate = (
  facility: { name?: string; city?: string } | undefined,
  date: Date | undefined
): boolean => {
  const closure = getFacilityClosure(facility);
  if (!closure || !date) return false;
  const [y, m, d] = closure.lastBookableDate.split("-").map(Number);
  const last = startOfDay(new Date(y, m - 1, d));
  return startOfDay(date).getTime() > last.getTime();
};
