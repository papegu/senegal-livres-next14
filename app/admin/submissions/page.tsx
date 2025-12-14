'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  title: string;
  author: string;
  price: number;
  description: string;
  category: string;
  eBook: boolean;
  pdfPath: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  coverImage?: string;
}

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [coverImageInput, setCoverImageInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch submissions');
      }

      const { submissions: subs } = await res.json();
      setSubmissions(subs || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    if (statusFilter === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(s => s.status === statusFilter));
    }
  };

  const approveSubmission = async (submission: Submission) => {
    const coverImage = coverImageInput[submission.id];
    
    if (!coverImage) {
      alert('Please enter a cover image URL before approving');
      return;
    }

    setProcessingId(submission.id);
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          action: 'approve',
          coverImage,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to approve submission');
      }

      const result = await res.json();
      setSubmissions(prev =>
        prev.map(s =>
          s.id === submission.id ? { ...s, status: 'approved' } : s
        )
      );
      setCoverImageInput(prev => ({ ...prev, [submission.id]: '' }));
      alert(`✓ Book "${submission.title}" added to catalog!`);
    } catch (err) {
      console.error('Error approving submission:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve submission');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to reject this submission?')) {
      return;
    }

    setProcessingId(submissionId);
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'x-admin-token': localStorage.getItem('admin_token') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action: 'reject',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reject submission');
      }

      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId ? { ...s, status: 'rejected' } : s
        )
      );
      alert('Submission rejected');
    } catch (err) {
      console.error('Error rejecting submission:', err);
      alert('Failed to reject submission');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4E9CE] flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4E9CE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#C0392B]">📋 Book Submissions Review</h1>
          <a
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Dashboard
          </a>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Filter by Status</h2>
          <div className="flex gap-2 flex-wrap">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded transition ${
                  statusFilter === status
                    ? 'bg-[#C0392B] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'All' : status === 'pending' ? '⏳ Pending' : status === 'approved' ? '✅ Approved' : '❌ Rejected'}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No {statusFilter !== 'all' ? statusFilter : ''} submissions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Book Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{submission.title}</h3>
                    <p className="text-gray-600 mb-1"><strong>Author:</strong> {submission.author}</p>
                    <p className="text-gray-600 mb-1"><strong>Category:</strong> {submission.category}</p>
                    <p className="text-gray-600 mb-1"><strong>Price:</strong> {submission.price} FCFA</p>
                    {submission.eBook && <p className="text-green-600 mb-1">📱 <strong>Available as eBook</strong></p>}
                    
                    {submission.description && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-700 font-semibold mb-2">Description:</p>
                        <p className="text-gray-600 text-sm line-clamp-3">{submission.description}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-4">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                    </p>

                    <a
                      href={submission.pdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-[#128A41] hover:underline font-semibold"
                    >
                      📄 View PDF
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    {submission.status === 'pending' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cover Image URL *
                          </label>
                          <input
                            type="url"
                            placeholder="https://example.com/cover.jpg"
                            value={coverImageInput[submission.id] || ''}
                            onChange={(e) => setCoverImageInput(prev => ({
                              ...prev,
                              [submission.id]: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#128A41]"
                          />
                        </div>

                        <button
                          onClick={() => approveSubmission(submission)}
                          disabled={processingId === submission.id}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold disabled:opacity-50"
                        >
                          {processingId === submission.id ? 'Processing...' : '✅ Approve & Add'}
                        </button>

                        <button
                          onClick={() => rejectSubmission(submission.id)}
                          disabled={processingId === submission.id}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold disabled:opacity-50"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {submission.status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                        <p className="text-green-700 font-semibold">✅ Approved</p>
                        <p className="text-xs text-green-600">Added to catalog</p>
                      </div>
                    )}

                    {submission.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                        <p className="text-red-700 font-semibold">❌ Rejected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <a
            href="/admin"
            className="text-[#128A41] hover:underline font-semibold"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
