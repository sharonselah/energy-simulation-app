'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { EmptyStateProps } from './types';

export const LoadProfileEmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="text-center">
    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500">{message}</p>
  </div>
);
