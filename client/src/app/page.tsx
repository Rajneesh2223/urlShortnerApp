'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Trash2, BarChart2, Copy, ExternalLink, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LinkData {
  _id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      const res = await api.get('/api/links');
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links', err);
    }
  };

  useEffect(() => {
    fetchLinks();

    const onFocus = () => {
      fetchLinks();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/links', { originalUrl, customCode });
      setOriginalUrl('');
      setCustomCode('');
      fetchLinks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.delete(`/api/links/${code}`);
      setLinks(links.filter((link) => link.code !== code));
    } catch (err) {
      console.error('Failed to delete link', err);
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create a new short link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Original URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="url"
                id="url"
                required
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="https://example.com/very-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="customCode" className="block text-sm font-medium text-gray-700">
              Custom Code (Optional)
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="customCode"
                id="customCode"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="my-custom-link"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Shorten URL'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Links</h3>
        </div>
        <div className="border-t border-gray-200">
          {links.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No links created yet.</div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200">
              {links.map((link) => (
                <li key={link._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-indigo-600 truncate">{link.code}</p>
                        <button
                          onClick={() => copyToClipboard(link.code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy Short Link"
                        >
                          {copiedCode === link.code ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${link.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                          title="Open Link"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                      <div className="mt-2 flex">
                        <p className="text-sm text-gray-500 truncate max-w-md" title={link.originalUrl}>
                          {link.originalUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500 text-right hidden sm:block">
                        <p>Clicks: {link.clicks}</p>
                        <p className="text-xs">
                          {link.lastClickedAt
                            ? `Last: ${formatDistanceToNow(new Date(link.lastClickedAt))} ago`
                            : 'Never clicked'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/code/${link.code}`}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="View Stats"
                        >
                          <BarChart2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Delete Link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
