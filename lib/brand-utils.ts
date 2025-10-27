import { DeviceBrandSelection } from './types';

export const formatBrandSummary = (
  selection?: DeviceBrandSelection | null,
  fallback?: string
): string | null => {
  if (!selection) {
    return fallback ?? null;
  }

  const baseParts: string[] = [];

  if (selection.source === 'brand') {
    if (selection.brandName) {
      baseParts.push(selection.brandName);
    }
    if (selection.model) {
      baseParts.push(selection.model);
    }
    baseParts.push(selection.sizeLabel);
    return baseParts.join(' • ');
  }

  baseParts.push('Generic');
  baseParts.push(selection.sizeLabel);
  return baseParts.join(' • ');
};

export const getBrandSelection = (
  selection?: DeviceBrandSelection | null,
  fallback?: DeviceBrandSelection | null
): DeviceBrandSelection | null => {
  return selection ?? fallback ?? null;
};
