'use client';

import { useState, useEffect } from 'react';

interface Token {
  id: string;
  token: string;
  createdFor: string;
  email: string | null;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export default function RegistrationTokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adminId, setAdminId] = useState('');
  
  const [formData, setFormData] = useState({
    role: 'TECHNICIAN' as 'TECHNICIAN' | 'SUPERVISOR',
    email: ''
  });

  const [generatingToken, setGeneratingToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Get admin ID from session/localStorage
  useEffect(() => {
    const sessionStr = localStorage.getItem('user_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setAdminId(session.id);
      } catch (e) {
        console.error('Failed to parse session');
      }
    }
    fetchTokens();
  }, []);

  // Fetch tokens
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) {
        setError('Session tidak ditemukan');
        return;
      }
      
      const session = JSON.parse(sessionStr);
      const response = await fetch(`/api/admin/registration-tokens?adminId=${session.id}`);
      if (!response.ok) throw new Error('Gagal mengambil tokens');
      
      const data = await response.json();
      if (data.success) {
        setTokens(data.tokens || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil tokens');
    } finally {
      setLoading(false);
    }
  };

  // Generate new token
  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNewToken('');

    if (!adminId) {
      setError('Admin ID tidak ditemukan');
      return;
    }

    try {
      setGeneratingToken(true);
      const response = await fetch('/api/auth/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          role: formData.role,
          email: formData.email || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat token');
      }

      setNewToken(data.token);
      setSuccess(data.message || 'Token berhasil dibuat!');
      setFormData({ role: 'TECHNICIAN', email: '' });
      
      // Refresh token list
      setTimeout(fetchTokens, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat token');
    } finally {
      setGeneratingToken(false);
    }
  };

  // Copy token
  const handleCopyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  // Delete token
  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm('Yakin ingin menghapus token ini?')) return;

    try {
      const response = await fetch('/api/admin/registration-tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, adminId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus token');
      }

      setSuccess('Token dihapus');
      fetchTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus token');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Token Registrasi</h1>
            <p className="text-gray-600 mt-1">Kelola token untuk pendaftaran Teknisi dan Supervisor</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Buat Token Baru
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Info Box - New Token Generated */}
        {newToken && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">✅ Token Berhasil Dibuat!</h3>
            <p className="text-sm text-blue-800 mb-3">
              Bagikan token ini kepada {formData.role === 'TECHNICIAN' ? 'teknisi' : 'supervisor'} yang ingin mendaftar. Token berlaku 7 hari.
            </p>
            <div className="bg-white p-3 rounded border border-blue-200 flex items-center justify-between">
              <code className="text-xs font-mono text-gray-700 break-all">{newToken}</code>
              <button
                onClick={handleCopyToken}
                className={`ml-2 px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition ${
                  copiedToken
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {copiedToken ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Tokens Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="font-bold text-lg">Token Aktif</h2>
            <p className="text-sm text-gray-600">Total: {tokens.filter(t => !t.isUsed && !isTokenExpired(t.expiresAt)).length} token aktif</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : tokens.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada token dibuat</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Token</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Dibuat</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Expire</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => {
                    const expired = isTokenExpired(token.expiresAt);
                    return (
                      <tr key={token.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {token.createdFor}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {token.token.substring(0, 16)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {token.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(token.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(token.expiresAt)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {token.isUsed ? (
                            <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-medium">
                              Terpakai ({formatDate(token.usedAt!)})
                            </span>
                          ) : expired ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Aktif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteToken(token.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Generate Token */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Buat Token Registrasi Baru</h2>

            <form onSubmit={handleGenerateToken} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'TECHNICIAN' | 'SUPERVISOR' })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TECHNICIAN">Teknisi</option>
                  <option value="SUPERVISOR">Supervisor</option>
                </select>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">Email (Opsional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Jika diisi, token hanya bisa digunakan email ini</p>
              </div>

              {/* Info */}
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-900">
                <p className="font-medium mb-1">ℹ️ Informasi Token:</p>
                <ul className="text-xs space-y-1">
                  <li>• Berlaku selama 7 hari</li>
                  <li>• Hanya bisa digunakan sekali</li>
                  <li>• Bagikan ke {formData.role === 'TECHNICIAN' ? 'teknisi' : 'supervisor'} yang dituju</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={generatingToken}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
                >
                  {generatingToken ? 'Membuat...' : 'Buat Token'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
