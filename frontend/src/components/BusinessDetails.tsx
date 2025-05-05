import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Globe, ArrowLeft, FileText } from 'lucide-react';
import { Business } from '../types';

export default function BusinessDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBusinessDetails = async () => {
            setLoading(true);
            try {
                // In a real app, you would fetch from your API with the business ID
                // For this example, we'll simulate fetching details from the OpenStreetMap API
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/details?format=json&place_id=${id}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch business details');
                }

                const data = await response.json();

                // Transform the data to match our Business type
                const businessData: Business = {
                    id: data.place_id || id || '',
                    name: data.name || data.addresstags?.name || 'Unknown Business',
                    type: data.category || (data.name?.toLowerCase().includes('hotel') ? 'hotel' : 'restaurant'),
                    address: data.display_name || 'No address available',
                    location: {
                        lat: data.lat ? parseFloat(data.lat) : 0,
                        lon: data.lon ? parseFloat(data.lon) : 0
                    },
                    rating: Math.floor(Math.random() * 5) + 1, // Mock rating
                    description: 'This is a mock description for the business. In a real application, this would be fetched from your API.',
                    contact: data.extratags?.phone || data.extratags?.['contact:phone'] || 'No contact information available',
                    website: data.extratags?.website || data.extratags?.['contact:website'] || '#'
                };

                setBusiness(businessData);
            } catch (error) {
                console.error('Error fetching business details:', error);
                // Fallback to a mock business if API fails
                setBusiness({
                    id: id || '0',
                    name: 'Business Information',
                    type: 'restaurant',
                    address: 'Address information not available',
                    location: { lat: 0, lon: 0 },
                    rating: 4,
                    description: 'Business details could not be loaded. Please try again later.',
                    contact: 'N/A',
                    website: '#'
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBusinessDetails();
        }
    }, [id]);

    const handleGenerateProposal = () => {
        if (business) {
            navigate(`/generate-proposal/${business.id}`);
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Business not found</p>
                <button
                    onClick={goBack}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={goBack}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold">{business.name}</h1>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold text-lg mb-2">Business Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                            <p className="text-gray-700">{business.address}</p>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-5 w-5 text-gray-500 mr-2" />
                            <p className="text-gray-700">{business.contact}</p>
                        </div>
                        {business.website && business.website !== '#' && (
                            <div className="flex items-center">
                                <Globe className="h-5 w-5 text-gray-500 mr-2" />
                                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {business.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold text-lg mb-2">Description</h2>
                    <p className="text-gray-700">{business.description}</p>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleGenerateProposal}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <FileText className="h-5 w-5" />
                        Generate Proposal for this Business
                    </button>
                </div>
            </div>
        </div>
    );
}