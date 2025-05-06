import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader, Download, Clipboard, Check } from 'lucide-react';
import { Business } from '../types';

interface ProposalResponse {
    status: string;
    result: {
        raw: string;
        tasks_output: Array<{
            raw: string;
        }>;
    };
}

export default function ProposalGenerator() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(false);
    const [proposal, setProposal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch business details
    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                // This assumes your App component stores businesses in localStorage
                // or you have another way to retrieve the business by ID
                const storedBusinesses = localStorage.getItem('businesses');
                if (storedBusinesses) {
                    const businesses: Business[] = JSON.parse(storedBusinesses);
                    const foundBusiness = businesses.find(b => b.id === id);
                    if (foundBusiness) {
                        setBusiness(foundBusiness);
                    } else {
                        setError('Business not found');
                    }
                }
            } catch (error) {
                console.error('Error fetching business details:', error);
                setError('Failed to load business details');
            }
        };

        fetchBusiness();
    }, [id]);

    // Generate the proposal
    useEffect(() => {
        if (!business) return;

        const generateProposal = async () => {
            setLoading(true);
            setError(null);

            try {
                // Prepare the payload for the API
                const payload = {
                    restaurant_name: business.name,
                    restaurant_location: business.address,
                    restaurant_cuisine: business.type,
                    supplier_name: "Gulf of Mexico and both coasts",
                    supplier_specialty: "Fresh fish and oysters",
                    supplier_usp: "Daily flown-in seafood with an emphasis on Gulf sourcing"
                };

                // Make the API call with CORS handling
                const response = await axios.post<ProposalResponse>(
                    'http://127.0.0.1:8000/run-crew/',
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // Handle CORS issues for development
                        withCredentials: false
                    }
                );

                // Extract the raw proposal text from the response
                if (response.data.status === 'success' && response.data.result.raw) {
                    setProposal(response.data.result.raw);
                } else {
                    // Try to find the proposal in the tasks_output array
                    const proposalTask = response.data.result.tasks_output?.find(
                        task => task.raw && task.raw.includes('Supplier Proposal')
                    );

                    if (proposalTask && proposalTask.raw) {
                        setProposal(proposalTask.raw);
                    } else {
                        setError('Failed to generate proposal: No proposal data found in response');
                    }
                }
            } catch (error) {
                console.error('Error generating proposal:', error);
                setError('Failed to generate proposal. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        generateProposal();
    }, [business]);

    const handleCopyToClipboard = () => {
        if (proposal) {
            navigator.clipboard.writeText(proposal);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (proposal) {
            const blob = new Blob([proposal], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `proposal-${business?.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 mb-6 text-blue-600 hover:text-blue-800"
            >
                <ArrowLeft className="h-4 w-4" /> Back to results
            </button>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-2">
                    {business ? `Supplier Proposal for ${business.name}` : 'Loading...'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {business?.address || ''}
                </p>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500">Generating custom supplier proposal...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        <p>{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                            Go Back
                        </button>
                    </div>
                ) : proposal ? (
                    <div>
                        <div className="flex justify-end gap-2 mb-4">
                            <button
                                onClick={handleCopyToClipboard}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        </div>

                        <div className="border rounded-lg p-6 whitespace-pre-wrap">
                            {proposal}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}