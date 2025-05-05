import { useNavigate } from 'react-router-dom';
import { MapPin, Info, FileText } from 'lucide-react';
import { Business } from '../types';

interface BusinessListProps {
    businesses: Business[];
    loading: boolean;
    selectedArea: number;
    onSelectBusiness: (business: Business) => void;
}

export default function BusinessList({
                                         businesses,
                                         loading,
                                         selectedArea,
                                         onSelectBusiness
                                     }: BusinessListProps) {
    const navigate = useNavigate();

    const handleViewDetails = (business: Business) => {
        onSelectBusiness(business);
        navigate(`/business/${business.id}`);
    };

    const handleGenerateProposal = (business: Business) => {
        onSelectBusiness(business);
        navigate(`/generate-proposal/${business.id}`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            <div className="text-lg font-semibold mb-4">
                Selected Area: {selectedArea.toFixed(2)} km²
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : businesses.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                        {selectedArea > 0
                            ? "No restaurants or hotels found in this area. Try selecting a larger area."
                            : "Select an area on the map to find restaurants and hotels."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    {businesses.map((business) => (
                        <div
                            key={business.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{business.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {business.type.charAt(0).toUpperCase() + business.type.slice(1)}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                        {business.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleViewDetails(business)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                                >
                                    <Info className="h-4 w-4" />
                                    Details
                                </button>
                                <button
                                    onClick={() => handleGenerateProposal(business)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                                >
                                    <FileText className="h-4 w-4" />
                                    Generate Proposal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}