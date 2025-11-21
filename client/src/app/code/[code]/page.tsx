'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LinkData {
    _id: string;
    code: string;
    originalUrl: string;
    clicks: number;
    lastClickedAt: string | null;
    createdAt: string;
}

export default function StatsPage() {
    const { code } = useParams();
    const [link, setLink] = useState<LinkData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!code) return;

        const fetchLink = async () => {
            try {
                const res = await api.get(`/api/links/${code}`);
                setLink(res.data);
            } catch (err) {
                setError('Link not found');
            } finally {
                setLoading(false);
            }
        };

        fetchLink();
    }, [code]);

    if (loading) return <div className="text-center py-10">Loading stats...</div>;
    if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
    if (!link) return null;

    return (
        <div className="space-y-6">
            <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-900">
                <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Link Statistics</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Details for code: <span className="font-mono font-bold">{link.code}</span></p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Original URL</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{link.originalUrl}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Short Link</dt>
                            <dd className="mt-1 text-sm text-indigo-600 sm:mt-0 sm:col-span-2">
                                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${link.code}`} target="_blank" rel="noopener noreferrer">
                                    {`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${link.code}`}
                                </a>
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Clicks</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-2xl font-semibold">{link.clicks}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Created At</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {format(new Date(link.createdAt), 'PPpp')}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Last Clicked</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {link.lastClickedAt ? format(new Date(link.lastClickedAt), 'PPpp') : 'Never'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
