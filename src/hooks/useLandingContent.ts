import { useQuery } from "@tanstack/react-query";
import { fetchLandingContent, LandingPageContent } from "@/lib/landingContentApi";
import { fetchPublicOpeningHours, FacilityOpeningHours } from "@/lib/publicApi";

export const useLandingContent = () => {
  return useQuery<LandingPageContent | null>({
    queryKey: ["landing-content"],
    queryFn: fetchLandingContent,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to fetch opening hours from Railway backend
export const usePublicOpeningHours = () => {
  return useQuery<FacilityOpeningHours | null>({
    queryKey: ["public-opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
