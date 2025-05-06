export interface Business {
  id: string;
  name: string;
  type: string;
  address: string;
  location: {
    lat: number;
    lon: number;
  };
}

export interface ProposalData {
  businessId: string;
  businessName: string;
  proposalType: string;
  budget: number;
  timeline: string;
  goals: string[];
  // Additional fields for CrewAI integration
  restaurant_name?: string;
  restaurant_location?: string;
  restaurant_cuisine?: string;
  supplier_name?: string;
  supplier_specialty?: string;
  supplier_usp?: string;
}