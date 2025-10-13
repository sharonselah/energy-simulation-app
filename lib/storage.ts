import { SelectedDevice, MultiDeviceState } from './types';

const STORAGE_KEY = 'energy-simulation-comparison-history';
const CURRENT_COMPARISON_KEY = 'energy-simulation-current';
const MAX_HISTORY_ITEMS = 10;

export interface ComparisonHistoryItem {
  id: string;
  timestamp: number;
  devices: SelectedDevice[];
  name?: string; // User-defined name for the comparison
  monthlySavings: number;
  annualSavings: number;
}

/**
 * Save current comparison to browser storage
 */
export function saveCurrentComparison(devices: SelectedDevice[], multiDeviceState: MultiDeviceState): void {
  try {
    const { aggregatedCosts } = multiDeviceState;
    const monthlySavings = aggregatedCosts.scenarioA.total.monthly - aggregatedCosts.scenarioC.total.monthly;
    const annualSavings = aggregatedCosts.scenarioA.total.annual - aggregatedCosts.scenarioC.total.annual;

    const comparison = {
      devices,
      timestamp: Date.now(),
      monthlySavings,
      annualSavings,
    };

    localStorage.setItem(CURRENT_COMPARISON_KEY, JSON.stringify(comparison));
  } catch (error) {
    console.error('Failed to save current comparison:', error);
  }
}

/**
 * Load current comparison from browser storage
 */
export function loadCurrentComparison(): SelectedDevice[] | null {
  try {
    const stored = localStorage.getItem(CURRENT_COMPARISON_KEY);
    if (!stored) return null;

    const comparison = JSON.parse(stored);
    return comparison.devices || null;
  } catch (error) {
    console.error('Failed to load current comparison:', error);
    return null;
  }
}

/**
 * Clear current comparison from storage
 */
export function clearCurrentComparison(): void {
  try {
    localStorage.removeItem(CURRENT_COMPARISON_KEY);
  } catch (error) {
    console.error('Failed to clear current comparison:', error);
  }
}

/**
 * Save comparison to history
 */
export function saveComparisonToHistory(
  devices: SelectedDevice[],
  multiDeviceState: MultiDeviceState,
  name?: string
): string {
  try {
    const { aggregatedCosts } = multiDeviceState;
    const monthlySavings = aggregatedCosts.scenarioA.total.monthly - aggregatedCosts.scenarioC.total.monthly;
    const annualSavings = aggregatedCosts.scenarioA.total.annual - aggregatedCosts.scenarioC.total.annual;

    const historyItem: ComparisonHistoryItem = {
      id: `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      devices,
      name: name || `Comparison ${new Date().toLocaleDateString()}`,
      monthlySavings,
      annualSavings,
    };

    const history = getComparisonHistory();
    history.unshift(historyItem);

    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    return historyItem.id;
  } catch (error) {
    console.error('Failed to save comparison to history:', error);
    return '';
  }
}

/**
 * Get all comparison history
 */
export function getComparisonHistory(): ComparisonHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load comparison history:', error);
    return [];
  }
}

/**
 * Get a specific comparison from history
 */
export function getComparisonById(id: string): ComparisonHistoryItem | null {
  try {
    const history = getComparisonHistory();
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Failed to get comparison by ID:', error);
    return null;
  }
}

/**
 * Delete a comparison from history
 */
export function deleteComparisonFromHistory(id: string): void {
  try {
    const history = getComparisonHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete comparison from history:', error);
  }
}

/**
 * Clear all comparison history
 */
export function clearComparisonHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear comparison history:', error);
  }
}

/**
 * Update comparison name in history
 */
export function updateComparisonName(id: string, newName: string): void {
  try {
    const history = getComparisonHistory();
    const updated = history.map(item =>
      item.id === id ? { ...item, name: newName } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update comparison name:', error);
  }
}

/**
 * Export comparison history as JSON
 */
export function exportComparisonHistory(): string {
  try {
    const history = getComparisonHistory();
    return JSON.stringify(history, null, 2);
  } catch (error) {
    console.error('Failed to export comparison history:', error);
    return '[]';
  }
}

/**
 * Import comparison history from JSON
 */
export function importComparisonHistory(jsonData: string): boolean {
  try {
    const imported = JSON.parse(jsonData);
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected an array');
    }

    const currentHistory = getComparisonHistory();
    const merged = [...imported, ...currentHistory];
    const trimmed = merged.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('Failed to import comparison history:', error);
    return false;
  }
}



