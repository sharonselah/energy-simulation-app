'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/shared/Button';
import { 
  History, 
  Trash2, 
  Edit2, 
  Download, 
  Upload,
  Clock,
  TrendingUp,
  X,
  Check
} from 'lucide-react';
import {
  getComparisonHistory,
  deleteComparisonFromHistory,
  clearComparisonHistory,
  updateComparisonName,
  exportComparisonHistory,
  importComparisonHistory,
  ComparisonHistoryItem,
} from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';

interface ComparisonHistoryProps {
  onLoadComparison?: (comparison: ComparisonHistoryItem) => void;
}

export default function ComparisonHistory({ onLoadComparison }: ComparisonHistoryProps) {
  const [history, setHistory] = useState<ComparisonHistoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = getComparisonHistory();
    setHistory(items);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this comparison from history?')) {
      deleteComparisonFromHistory(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all comparison history?')) {
      clearComparisonHistory();
      loadHistory();
    }
  };

  const handleStartEdit = (item: ComparisonHistoryItem) => {
    setEditingId(item.id);
    setEditingName(item.name || '');
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateComparisonName(editingId, editingName.trim());
      loadHistory();
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleExport = () => {
    const jsonData = exportComparisonHistory();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `comparison-history-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (importComparisonHistory(content)) {
            loadHistory();
            alert('Comparison history imported successfully!');
          } else {
            alert('Failed to import comparison history. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLoadComparison = (item: ComparisonHistoryItem) => {
    if (onLoadComparison) {
      onLoadComparison(item);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          onClick={() => setIsOpen(true)}
          className="shadow-xl"
        >
          <History className="w-5 h-5 mr-2" />
          View History ({history.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Comparison History</h2>
                <p className="text-blue-100 text-sm">
                  {history.length} saved comparison{history.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={history.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="ml-auto text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-600">
                Your saved comparisons will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Name/Title */}
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            autoFocus
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveEdit}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {item.name || 'Unnamed Comparison'}
                          </h3>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Edit name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(item.timestamp).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div>
                          {item.devices.length} device{item.devices.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Savings */}
                      <div className="flex gap-3">
                        <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 mb-1">Monthly Savings</p>
                          <p className="text-lg font-bold text-green-900">
                            {formatCurrency(item.monthlySavings)}
                          </p>
                        </div>
                        <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Annual Savings</p>
                          <p className="text-lg font-bold text-blue-900">
                            {formatCurrency(item.annualSavings)}
                          </p>
                        </div>
                      </div>

                      {/* Device List */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1">Devices:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.devices.map((device) => (
                            <span
                              key={device.id}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {device.device.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {onLoadComparison && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleLoadComparison(item)}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

