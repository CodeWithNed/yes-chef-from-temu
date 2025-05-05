import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, FileText, CheckCircle } from 'lucide-react';
import { Business, ProposalData } from '../types';

const proposalTypes = [
    'Business Partnership',
    'Marketing Campaign',
    'Event Hosting',
    'Supply Contract',
    'Franchise Opportunity'
];

export default function ProposalGenerator() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [proposal, setProposal] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState<ProposalData>({
        businessId: id || '',
        businessName: '',
        proposalType: proposalTypes[0],
        budget: 10000,
        timeline: '3 months',
        goals: ['Increase visibility', 'Generate new customers', 'Establish long-term partnership']
    });

    useEffect(() => {
        const fetchBusinessDetails = async () => {
            setLoading(true);
            try {
                // In a real app, you would fetch from your API with the business ID
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
                    }
                };

                setBusiness(businessData);
                setFormData(prev => ({
                    ...prev,
                    businessName: businessData.name
                }));
            } catch (error) {
                console.error('Error fetching business details:', error);
                // Fallback to a mock business
                const mockBusiness: Business = {
                    id: id || '0',
                    name: 'Business Name',
                    type: 'restaurant',
                    address: 'Address not available',
                    location: { lat: 0, lon: 0 }
                };
                setBusiness(mockBusiness);
                setFormData(prev => ({
                    ...prev,
                    businessName: mockBusiness.name
                }));
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBusinessDetails();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const goalsArray = e.target.value.split('\n').filter(goal => goal.trim() !== '');
        setFormData(prev => ({
            ...prev,
            goals: goalsArray
        }));
    };

    const generateProposal = () => {
        setGenerating(true);

        // Simulate API call delay
        setTimeout(() => {
            const currentDate = new Date().toLocaleDateString();
            const proposalText = `
# Business Proposal

## ${formData.proposalType} for ${formData.businessName}

**Date:** ${currentDate}

### Executive Summary
We are pleased to present this ${formData.proposalType.toLowerCase()} proposal to ${formData.businessName}. This document outlines our proposed collaboration approach, estimated budget, timeline, and expected outcomes.

### Goals
${formData.goals?.map(goal => `- ${goal}`).join('\n') || 'No specific goals provided.'}

### Proposed Budget
$${formData.budget?.toLocaleString() || 'TBD'}

### Timeline
${formData.timeline || 'To be determined'}

### Approach
Our approach will be tailored specifically to the needs and opportunities presented by ${formData.businessName}. We will begin with a thorough analysis of your current position in the market, followed by the development of a customized strategy that aligns with your business objectives.

### Expected Outcomes
- Increased visibility and brand awareness
- Enhanced customer engagement
- Improved market position
- Measurable return on investment

### Next Steps
1. Review this proposal
2. Schedule a meeting to discuss details
3. Finalize agreement terms
4. Begin implementation

We look forward to the opportunity to collaborate with ${formData.businessName} and are confident that our partnership will yield significant benefits for both parties.

---

Prepared by: [Your Company Name]
Contact: [Your Contact Information]
      `;

            setProposal(proposalText);
            setGenerating(false);
        }, 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generateProposal();
    };

    const copyToClipboard = () => {
        if (proposal) {
            navigator.clipboard.writeText(proposal);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadProposal = () => {
        if (!proposal) return;

        const element = document.createElement('a');
        const file = new Blob([proposal], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${formData.proposalType.replace(/\s+/g, '-').toLowerCase()}-for-${formData.businessName.replace(/\s+/g, '-').toLowerCase()}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={goBack}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold">Generate Proposal for {business?.name}</h1>
                </div>

                {!proposal ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Type</label>
                            <select
                                name="proposalType"
                                value={formData.proposalType}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {proposalTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                            <input
                                type="text"
                                name="timeline"
                                value={formData.timeline}
                                onChange={handleChange}
                                placeholder="e.g., 3 months, 1 year"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goals (one per line)</label>
                            <textarea
                                name="goals"
                                value={formData.goals?.join('\n')}
                                onChange={handleGoalsChange}
                                rows={4}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={generating}
                                className={`w-full flex justify-center items-center gap-2 p-3 rounded-md ${
                                    generating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                                } text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                            >
                                {generating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-5 w-5" />
                                        Generate Proposal
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={downloadProposal}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg border shadow-sm">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {proposal}
              </pre>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setProposal(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Edit Proposal Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}