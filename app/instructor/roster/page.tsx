'use client';

/**
 * Roster Management Page - Upload and manage student roster
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Download, Users, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { getRoster, uploadRoster, getRosterStats, toggleRosterActive, exportRosterCSV } from '@/lib/rosterData';
import { getStudentSession } from '@/lib/storage';
import { Student } from '@/types/kanji';

export default function RosterManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = getStudentSession();
    if (!session || !session.isMasterAccess) {
      router.push('/login');
      return;
    }

    loadRoster();
  }, []);

  const loadRoster = () => {
    const roster = getRoster();
    if (roster) {
      setStudents(roster.students);
      setIsActive(roster.isActive);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    try {
      const content = await file.text();
      const result = uploadRoster(content);

      if (result.success) {
        setUploadSuccess(`Successfully uploaded ${result.count} students`);
        loadRoster();
      } else {
        setUploadError(result.error || 'Failed to upload roster');
      }
    } catch (error: any) {
      setUploadError('Error reading file: ' + error.message);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleToggleActive = () => {
    toggleRosterActive();
    loadRoster();
  };

  const handleExportRoster = () => {
    const csv = exportRosterCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `roster_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = getRosterStats();
  
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.pantherId.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/instructor"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Roster Management</h1>
          <div className="w-40"></div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Accessed</p>
            <p className="text-3xl font-bold text-green-600">{stats.accessed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Not Accessed</p>
            <p className="text-3xl font-bold text-red-600">{stats.notAccessed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Access Rate</p>
            <p className="text-3xl font-bold text-purple-600">{stats.accessRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload size={20} />
              <span>Upload Canvas CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExportRoster}
              disabled={students.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              <span>Export Roster</span>
            </button>

            <button
              onClick={handleToggleActive}
              disabled={students.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isActive
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              <span>{isActive ? 'Roster Active' : 'Roster Inactive'}</span>
            </button>
          </div>

          {uploadError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              {uploadSuccess}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Upload a Canvas gradebook CSV to extract student roster. The roster must be activated for students to login.
          </p>
        </div>

        {/* Search */}
        {students.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, Panther ID, or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Student List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Students ({filteredStudents.length})
            </h2>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">
                {students.length === 0 ? 'No roster uploaded' : 'No students found'}
              </p>
              <p className="text-sm">
                {students.length === 0
                  ? 'Upload a Canvas gradebook CSV to get started'
                  : 'Try adjusting your search query'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Panther ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.pantherId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.pantherId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {student.totalAccess > 0 ? (
                            <span className="text-green-600 font-medium">
                              {student.totalAccess}x
                            </span>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </div>
                        {student.lastAccess && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(student.lastAccess).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
