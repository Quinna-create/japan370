'use client';

/**
 * Course Sharing Component - Generate codes, URLs, and QR codes
 */

import { useState } from 'react';
import { Copy, Check, Download, QrCode, Link as LinkIcon } from 'lucide-react';
import { Course } from '@/types/kanji';
import { generateCourseCode, generateShareableURL, createStudentPackage } from '@/lib/courseSharing';

interface CourseSharingProps {
  course: Course;
}

export default function CourseSharing({ course }: CourseSharingProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedURL, setCopiedURL] = useState(false);

  const courseCode = generateCourseCode(course);
  const shareableURL = generateShareableURL(course);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(courseCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(shareableURL);
    setCopiedURL(true);
    setTimeout(() => setCopiedURL(false), 2000);
  };

  const handleDownloadPackage = () => {
    const { json, instructions } = createStudentPackage(course);
    
    // Create a blob with the instructions and JSON
    const content = `${instructions}\n\n---\n\nCOURSE DATA (JSON):\n\n${json}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.name.replace(/\s+/g, '_')}_student_package.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Course</h2>

      <div className="space-y-6">
        {/* Course Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Code
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={courseCode}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
            />
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              {copiedCode ? <Check size={18} /> : <Copy size={18} />}
              <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Students can paste this code on the "Join Course" page
          </p>
        </div>

        {/* Shareable URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shareable URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareableURL}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyURL}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              {copiedURL ? <Check size={18} /> : <LinkIcon size={18} />}
              <span>{copiedURL ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this link directly with students (e.g., via email or Canvas)
          </p>
        </div>

        {/* QR Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code
          </label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Generate a QR code for in-class distribution
            </p>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareableURL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <QrCode size={18} />
              <span>Generate QR Code</span>
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Students can scan the QR code to instantly access the join page
          </p>
        </div>

        {/* Download Student Package */}
        <div>
          <button
            onClick={handleDownloadPackage}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Download size={20} />
            <span>Download Student Package</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Includes course data and instructions for students
          </p>
        </div>
      </div>

      {/* Course Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Course Information</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Name:</strong> {course.name}</p>
          <p><strong>Lessons:</strong> {course.lessons.length}</p>
          <p><strong>Active Lessons:</strong> {course.lessons.filter(l => l.isActive).length}</p>
          <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
