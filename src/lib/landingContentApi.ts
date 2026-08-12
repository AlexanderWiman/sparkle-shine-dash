import { supabase } from "@/integrations/supabase/client";

export interface HeroContent {
  title: string;
  highlightedText: string;
  subtitle: string;
  ctaText: string;
  secondaryCtaText: string;
  backgroundImage: string | null;
  backgroundVideo: string | null;
  backgroundVideoUrl: string | null;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
  popular?: boolean;
}

export interface ServicesContent {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface BenefitsContent {
  title: string;
  items: BenefitItem[];
}

export interface CTAContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface PricingAddon {
  name: string;
  price: number;
}

export interface PricingServiceContent {
  title: string;
  price: number;
  description: string;
  addons: PricingAddon[];
}

export interface PricingComboService {
  title: string;
  price: string;
  numericPrice: number;
  description: string;
  popular: boolean;
}

export interface PricingExtraService {
  name: string;
  price: string;
}

export interface PricingContent {
  heroTitle: string;
  heroSubtitle: string;
  exteriorService: PricingServiceContent;
  interiorService: PricingServiceContent;
  comboServices: PricingComboService[];
  extraServices: PricingExtraService[];
  note: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
}

export interface AboutStorySection {
  icon: string;
  title: string;
  description: string;
}

export interface AboutValue {
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  storySections: AboutStorySection[];
  valuesTitle: string;
  values: AboutValue[];
  locationTitle: string;
  locationDescription: string;
  tagline: string;
  taglineAuthor: string;
}

export interface PressArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  dateFormatted: string;
  description: string;
  url: string;
}

export interface PressContent {
  heroTitle: string;
  heroSubtitle: string;
  articlesTitle: string;
  articles: PressArticle[];
  contactTitle: string;
  contactDescription: string;
  contactCompany: string;
  contactEmail: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQContent {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

export interface ContactAddress {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  mapsUrl: string;
}

export interface ContactOpeningHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface ContactSocialMedia {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface ContactContent {
  companyName: string;
  phone: string;
  email: string;
  address: ContactAddress;
  openingHours: ContactOpeningHours;
  socialMedia: ContactSocialMedia;
  footerTagline?: string;
  footerLinks?: FooterLink[];
}

export interface LandingPageContent {
  hero: HeroContent;
  services: ServicesContent;
  benefits: BenefitsContent;
  cta: CTAContent;
  pricing?: PricingContent;
  about?: AboutContent;
  press?: PressContent;
  faq?: FAQContent;
  contact?: ContactContent;
}

export const fetchLandingContent = async (): Promise<LandingPageContent | null> => {
  const { data, error } = await supabase
    .from("landing_page_content")
    .select("section_key, content");

  if (error) {
    console.error("Error fetching landing content:", error);
    return null;
  }

  const contentMap: Record<string, unknown> = {};
  data.forEach((row) => {
    contentMap[row.section_key] = row.content;
  });

  return {
    hero: contentMap.hero as HeroContent,
    services: contentMap.services as ServicesContent,
    benefits: contentMap.benefits as BenefitsContent,
    cta: contentMap.cta as CTAContent,
    pricing: contentMap.pricing as PricingContent | undefined,
    about: contentMap.about as AboutContent | undefined,
    press: contentMap.press as PressContent | undefined,
    faq: contentMap.faq as FAQContent | undefined,
    contact: contentMap.contact as ContactContent | undefined,
  };
};

export const fetchContactContent = async (): Promise<ContactContent | null> => {
  const { data, error } = await supabase
    .from("landing_page_content")
    .select("content")
    .eq("section_key", "contact")
    .maybeSingle();

  if (error) {
    console.error("Error fetching contact content:", error);
    return null;
  }

  return data?.content as unknown as ContactContent | null;
};

export const fetchFAQContent = async (): Promise<FAQContent | null> => {
  const { data, error } = await supabase
    .from("landing_page_content")
    .select("content")
    .eq("section_key", "faq")
    .maybeSingle();

  if (error) {
    console.error("Error fetching FAQ content:", error);
    return null;
  }

  return data?.content as unknown as FAQContent | null;
};

export const fetchPricingContent = async (): Promise<PricingContent | null> => {
  const { data, error } = await supabase
    .from("landing_page_content")
    .select("content")
    .eq("section_key", "pricing")
    .maybeSingle();

  if (error) {
    console.error("Error fetching pricing content:", error);
    return null;
  }

  return data?.content as unknown as PricingContent | null;
};

export const fetchAboutContent = async (): Promise<AboutContent | null> => {
  const { data, error } = await supabase
    .from("landing_page_content")
    .select("content")
    .eq("section_key", "about")
    .maybeSingle();

  if (error) {
    console.error("Error fetching about content:", error);
    return null;
  }

  return data?.content as unknown as AboutContent | null;
};

export const fetchPressContent = async (): Promise<PressContent | null> => {
  const { data, error } = await supabase
    .from("landing_page_content")
    .select("content")
    .eq("section_key", "press")
    .maybeSingle();

  if (error) {
    console.error("Error fetching press content:", error);
    return null;
  }

  return data?.content as unknown as PressContent | null;
};

export const updateLandingSection = async <T extends object>(
  sectionKey: string,
  content: T
): Promise<boolean> => {
  const { error } = await supabase
    .from("landing_page_content")
    .update({ content: content as unknown as import("@/integrations/supabase/types").Json })
    .eq("section_key", sectionKey);

  if (error) {
    console.error("Error updating landing content:", error);
    return false;
  }

  return true;
};

export const uploadLandingImage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("landing-images")
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return null;
  }

  const { data } = supabase.storage.from("landing-images").getPublicUrl(fileName);

  return data.publicUrl;
};
