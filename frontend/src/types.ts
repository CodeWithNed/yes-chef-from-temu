export interface Business {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | string;
  address: string;
  location: {
    lat: number;
    lon: number;
  };
  rating?: number;
  description?: string;
  contact?: string;
  website?: string;
  photos?: string[];
}

export interface ProposalData {
  businessId: string;
  businessName: string;
  proposalType: string;
  budget?: number;
  timeline?: string;
  goals?: string[];
  content?: string;
}