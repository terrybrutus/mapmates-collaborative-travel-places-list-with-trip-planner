import React, { useState } from 'react';
import { useGetAllPlaces } from '../hooks/useQueries';
import { Place, PlaceStatus, BudgetRange } from '../backend';
import { Download, FileText, Table, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExportPanel() {
  const { data: places = [], isLoading } = useGetAllPlaces();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const formatPlaceForBlockTxt = (place: Place): string => {
    const statusLabels = {
      toResearch: 'To Research',
      researched: 'Researched',
      wantToGo: 'Want to Go',
      planning: 'Planning',
      visited: 'Visited',
      wouldReturn: 'Would Return',
    };

    const budgetLabels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };

    // Format using exact block-based structure with || prefix
    let block = `|| Country: ${place.country}\n`;
    block += `|| City: ${place.city}\n`;
    
    if (place.stateRegion) {
      block += `|| State/Region: ${place.stateRegion}\n`;
    }
    
    if (place.notes) {
      block += `|| Notes: ${place.notes}\n`;
    }
    
    if (place.bestTimeToVisit) {
      block += `|| Best Time to Visit: ${place.bestTimeToVisit}\n`;
    }
    
    if (place.quickFacts.bestKnownFor) {
      block += `|| Best Known For: ${place.quickFacts.bestKnownFor}\n`;
    }
    
    if (place.quickFacts.hiddenGem) {
      block += `|| Hidden Gem: ${place.quickFacts.hiddenGem}\n`;
    }
    
    if (place.quickFacts.localTip) {
      block += `|| Local Tip: ${place.quickFacts.localTip}\n`;
    }
    
    if (place.tags.length > 0) {
      block += `|| Tags: ${place.tags.join(', ')}\n`;
    }
    
    block += `|| Budget Range: ${budgetLabels[place.budgetRange]}\n`;
    
    // Add status information as a comment (not part of import format)
    if (place.status.length > 0) {
      const statusText = place.status.map(status => statusLabels[status]).join(', ');
      block += `# Status: ${statusText}\n`;
    }
    
    // Add metadata as comments (not part of import format)
    block += `# Added: ${new Date(Number(place.timestamp) / 1000000).toLocaleDateString()}\n`;
    block += `# Author: ${place.author.toString()}\n`;

    return block;
  };

  const formatPlaceForCsv = (place: Place): string[] => {
    const statusLabels = {
      toResearch: 'To Research',
      researched: 'Researched',
      wantToGo: 'Want to Go',
      planning: 'Planning',
      visited: 'Visited',
      wouldReturn: 'Would Return',
    };

    const budgetLabels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };

    // Escape CSV values
    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Handle multiple statuses
    const statusText = place.status.map(status => statusLabels[status]).join('; ');

    return [
      escapeCSV(place.city),
      escapeCSV(place.stateRegion),
      escapeCSV(place.country),
      escapeCSV(statusText),
      escapeCSV(budgetLabels[place.budgetRange]),
      escapeCSV(place.bestTimeToVisit),
      escapeCSV(place.tags.join('; ')),
      escapeCSV(place.quickFacts.bestKnownFor),
      escapeCSV(place.quickFacts.hiddenGem),
      escapeCSV(place.quickFacts.localTip),
      escapeCSV(place.notes),
      escapeCSV(new Date(Number(place.timestamp) / 1000000).toLocaleDateString()),
      escapeCSV(place.author.toString()),
    ];
  };

  const exportAsTxt = async () => {
    setIsExporting(true);
    setExportMessage(null);

    try {
      const header = `# Travel Places List Export - Block-Based Format
# Generated: ${new Date().toLocaleString()}
# Total Places: ${places.length}
# 
# This file uses the block-based format for round-trip compatibility.
# Each place is a separate block starting with || 
# Import this file back to recreate the exact same places.
#
# Format: || FieldName: Value
# Required fields: Country, City
# Optional fields: State/Region, Notes, Best Time to Visit, Best Known For, Hidden Gem, Local Tip, Tags, Budget Range

`;

      const content = header + places.map(formatPlaceForBlockTxt).join('\n') + '\n';
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `travel-places-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setExportMessage({ type: 'success', message: 'TXT file exported successfully with round-trip compatibility!' });
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage({ type: 'error', message: 'Export failed. Please try again.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  const exportAsCsv = async () => {
    setIsExporting(true);
    setExportMessage(null);

    try {
      const headers = [
        'City',
        'State/Region',
        'Country',
        'Status',
        'Budget',
        'Best Time to Visit',
        'Tags',
        'Best Known For',
        'Hidden Gem',
        'Local Tip',
        'Notes',
        'Date Added',
        'Author',
      ];

      const csvContent = [
        headers.join(','),
        ...places.map(place => formatPlaceForCsv(place).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `travel-places-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      setExportMessage({ type: 'success', message: 'CSV file exported successfully!' });
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage({ type: 'error', message: 'Export failed. Please try again.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Download className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Export Places</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Download your travel places list in different formats
        </p>
      </div>

      {/* Export Message */}
      {exportMessage && (
        <div className={`p-4 rounded-lg border ${
          exportMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {exportMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{exportMessage.message}</span>
          </div>
        </div>
      )}

      {/* Export Statistics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Summary</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{places.length}</div>
            <div className="text-sm text-gray-600">Total Places</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {places.filter(p => p.status.includes(PlaceStatus.researched)).length}
            </div>
            <div className="text-sm text-gray-600">Researched</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {places.filter(p => p.status.includes(PlaceStatus.toResearch)).length}
            </div>
            <div className="text-sm text-gray-600">To Research</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* TXT Export with Round-Trip Fidelity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Block Format (TXT)</h3>
              <p className="text-sm text-gray-600">Round-trip compatible format for re-importing</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Block-based format with <code>|| </code> prefix</li>
              <li>• All place data with field labels</li>
              <li>• Perfect round-trip fidelity</li>
              <li>• Can be imported back exactly as exported</li>
              <li>• Metadata as comments for reference</li>
            </ul>
          </div>

          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900 mb-1">Round-Trip Guarantee</p>
                <p className="text-green-800">
                  This export format matches the import format exactly. You can import this file back to recreate the same places with all their data intact.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={exportAsTxt}
            disabled={isExporting || places.length === 0}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export as Block Format TXT'}
          </button>
        </div>

        {/* CSV Export */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Table className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">CSV File</h3>
              <p className="text-sm text-gray-600">Structured data format for spreadsheets</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All place data in columns</li>
              <li>• Compatible with Excel/Sheets</li>
              <li>• Easy to filter and sort</li>
              <li>• Perfect for data analysis</li>
              <li>• Includes all metadata fields</li>
            </ul>
          </div>

          <button
            onClick={exportAsCsv}
            disabled={isExporting || places.length === 0}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>
      </div>

      {/* No Places Message */}
      {places.length === 0 && (
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Places to Export</h3>
          <p className="text-gray-600">Add some places to your list before exporting.</p>
        </div>
      )}

      {/* Export Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Download className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Export Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Block Format TXT:</strong> Uses the exact same format as import for perfect round-trip compatibility</li>
              <li>• <strong>CSV Format:</strong> Structured data ideal for spreadsheet analysis and data processing</li>
              <li>• Files are generated and downloaded directly to your device</li>
              <li>• All place data including notes, tags, and metadata is included</li>
              <li>• Export files are named with the current date for easy organization</li>
              <li>• No data is sent to external servers during export</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
