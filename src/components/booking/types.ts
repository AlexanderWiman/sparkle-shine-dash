export interface TimeSlot {
  time: string;
  bookedCount: number;
  available: number;
}

export type ServiceType = "complete-basic" | "exterior-basic" | "interior-basic" | "complete-recond";

export type Addon = {
  id: string;
  name: string;
  price: number;
  availableFor: ServiceType[];
};

export type Extra = {
  id: string;
  name: string;
  price: number | "on-request";
  percentage?: number;
  availableFor: ServiceType[];
};

export type VehicleSize = "small" | "suv";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export const SERVICES: Service[] = [
  { 
    id: "complete-basic", 
    name: "In- och utvändig tvätt – Bas", 
    price: 690, 
    duration: 90,
    description: "Kombinerar utvändig och invändig bastvätt"
  },
  { 
    id: "exterior-basic", 
    name: "Utvändigt – Bas", 
    price: 370, 
    duration: 45,
    description: "Exteriör ångtvätt av kaross, glas, fälgar och dörrgångar"
  },
  { 
    id: "interior-basic", 
    name: "Invändigt – Bas", 
    price: 370, 
    duration: 45,
    description: "Dammsugning, avtorkning av paneler, fönsterputs invändigt, avspolning av gummimattor/dammsugning av textilmattor"
  },
  { 
    id: "complete-recond", 
    name: "Invändig rekond med utvändig tvätt", 
    price: 2500, 
    duration: 120,
    description: "Komplett rekonditionering av hela bilen"
  },
];

export const ADDONS: Addon[] = [
  { id: "asphalt", name: "Asfaltsborttagning", price: 80, availableFor: ["exterior-basic", "complete-basic"] },
  { id: "trunk", name: "Baklucka", price: 50, availableFor: ["exterior-basic", "complete-basic"] },
  { id: "spray-wax", name: "Sprayvax", price: 150, availableFor: ["exterior-basic", "complete-basic"] },
  { id: "seat-front", name: "Sätestvätt framstol", price: 250, availableFor: ["interior-basic", "complete-basic"] },
  { id: "seat-back", name: "Sätestvätt baksäte", price: 450, availableFor: ["interior-basic", "complete-basic"] },
];

export const VEHICLE_SIZES = [
  { id: "small", name: "Personbil", percentage: 0 },
  { id: "suv", name: "SUV", percentage: 25 },
];

export const EXTRAS: Extra[] = [
  { id: "engine", name: "Motortvätt", price: 395, availableFor: ["exterior-basic", "complete-basic", "complete-recond"] },
  { id: "extra-dirty", name: "Extra smutsig bil", price: 0, percentage: 25, availableFor: ["exterior-basic", "complete-basic", "interior-basic"] },
  { id: "sanitation", name: "Sanering av hund-/katthår", price: "on-request", availableFor: ["interior-basic", "complete-basic"] },
];

export interface BookingFormData {
  selectedFacility: string;
  date: Date | undefined;
  time: string;
  serviceType: ServiceType | "";
  selectedAddons: string[];
  selectedExtras: string[];
  vehicleSize: VehicleSize | "";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
}
