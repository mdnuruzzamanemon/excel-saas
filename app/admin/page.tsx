'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Eye, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

interface Workbook {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  metadata: {
    rows: number;
    cols: number;
    fileName: string;
  };
}

export default function AdminPage() {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workbookName, setWorkbookName] = useState('');

  useEffect(() => {
    loadWorkbooks();
  }, []);

  const loadWorkbooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/workbooks');
      const data = await response.json();
      
      if (data.success) {
        setWorkbooks(data.workbooks);
      }
    } catch (error) {
      console.error('Error loading workbooks:', error);
      toast.error('Failed to load workbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setWorkbookName(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an Excel file');
      return;
    }

    if (!workbookName.trim()) {
      toast.error('Please enter a workbook name');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', workbookName);

      const response = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Excel file uploaded successfully!');
        setSelectedFile(null);
        setWorkbookName('');
        loadWorkbooks();
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workbook?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/workbooks?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Workbook deleted');
        loadWorkbooks();
      } else {
        toast.error('Failed to delete workbook');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete workbook');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Upload and manage your Excel calculators</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View User Page
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>
              Upload your Excel file with formulas. The system will automatically detect input cells and formula cells.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workbook Name
                </label>
                <input
                  type="text"
                  value={workbookName}
                  onChange={(e) => setWorkbookName(e.target.value)}
                  placeholder="e.g., Beam Calculator"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excel File (.xlsx, .xls, .xlsm)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700">
                  <strong>How it works:</strong> Upload your Excel file and the system will:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                  <li>Extract all formulas (kept secure on server)</li>
                  <li>Identify input cells (numeric values without formulas)</li>
                  <li>Detect label cells (text descriptions)</li>
                  <li>Create a user-friendly interface</li>
                </ul>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading || !selectedFile}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Excel File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workbooks List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Your Workbooks
            </CardTitle>
            <CardDescription>
              Manage your uploaded Excel calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : workbooks.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No workbooks uploaded yet</p>
                <p className="text-sm text-gray-400 mt-2">Upload your first Excel file to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workbooks.map((workbook) => (
                  <div
                    key={workbook.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{workbook.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{workbook.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>📊 {workbook.metadata.rows} rows × {workbook.metadata.cols} cols</span>
                        <span>📁 {workbook.metadata.fileName}</span>
                        <span>📅 {new Date(workbook.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/?workbookId=${workbook.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(workbook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
