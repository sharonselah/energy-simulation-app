'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Device,
  AlternativeFuel,
  DeviceBrandSelection,
  BrandSelectionSource,
  BrandAttributeValue,
} from '@/lib/types';
import { ALTERNATIVE_FUELS, FUEL_DAILY_CONSUMPTION } from '@/lib/constants';
import { BRAND_CATALOG, DeviceBrandEntry } from '@/data/brands';
import Button from '@/components/shared/Button';
import { X, Info, Clock, Flame, UtensilsCrossed } from 'lucide-react';

interface DeviceConfigProps {
  device: Device;
  onClose: () => void;
  onConfirm: (config: {
    duration: number;
    mealsPerDay?: number;
    alternativeFuel?: AlternativeFuel;
    wattage: number;
    brandSelection?: DeviceBrandSelection;
  }) => void;
}

const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8];
const MEAL_OPTIONS = [1, 2, 3, 4];

export default function DeviceConfig({ device, onClose, onConfirm }: DeviceConfigProps) {
  const brandKey = device.brandKey ?? device.type;
  const brandEntry: DeviceBrandEntry | undefined = BRAND_CATALOG[brandKey];
  const brandOptions = useMemo(() => brandEntry?.brands ?? [], [brandEntry]);
  const genericOptions = useMemo(() => brandEntry?.generic_sizes ?? [], [brandEntry]);
  const hasBrandOptions = brandOptions.length > 0;
  const hasGenericOptions = genericOptions.length > 0;

  const [duration, setDuration] = useState<number>(device.typicalUsageHours || 1);
  const [mealsPerDay, setMealsPerDay] = useState<number>(2);
  const [selectedFuelType, setSelectedFuelType] = useState<string>('charcoal');
  const [customWattage, setCustomWattage] = useState<number>(device.wattage);
  const [wattageError, setWattageError] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<BrandSelectionSource>(() => {
    if (device.brandSelection) {
      return device.brandSelection.source;
    }
    if (hasGenericOptions) {
      return 'generic';
    }
    return hasBrandOptions ? 'brand' : 'generic';
  });
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<number>(() => {
    if (!hasGenericOptions) {
      return 0;
    }
    if (device.brandSelection?.source === 'generic') {
      const matchingIndex = genericOptions.findIndex(
        (option) => option.label === device.brandSelection?.sizeLabel
      );
      return matchingIndex >= 0 ? matchingIndex : 0;
    }
    return 0;
  });
  const [selectedBrandName, setSelectedBrandName] = useState<string>(() => {
    if (device.brandSelection?.source === 'brand' && device.brandSelection.brandName) {
      return device.brandSelection.brandName;
    }
    return brandOptions[0]?.name ?? '';
  });
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(() => {
    if (device.brandSelection?.source === 'brand') {
      const initialBrand =
        brandOptions.find((brand) => brand.name === device.brandSelection?.brandName) ??
        brandOptions[0];
      if (initialBrand) {
        const modelIndex = initialBrand.models.findIndex((model) => {
          const matchesSize = model.size === device.brandSelection?.sizeLabel;
          const matchesModel = device.brandSelection?.model
            ? model.model === device.brandSelection.model
            : true;
          return matchesSize && matchesModel;
        });
        if (modelIndex >= 0) {
          return modelIndex;
        }
      }
    }
    return 0;
  });

  const isCookingDevice = device.requiresAlternativeFuel;
  const isAlwaysOn = device.id === 'fridge';

  const currentBrand = useMemo(() => {
    if (!hasBrandOptions) {
      return undefined;
    }
    return brandOptions.find((brand) => brand.name === selectedBrandName) ?? brandOptions[0];
  }, [brandOptions, hasBrandOptions, selectedBrandName]);

  const currentModels = currentBrand?.models ?? [];
  const currentModel = currentModels[selectedModelIndex] ?? currentModels[0];

  const formatAttributeKey = (key: string) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    if (isAlwaysOn) {
      setDuration(24);
    }
  }, [isAlwaysOn]);

  useEffect(() => {
    if (!currentBrand) {
      if (selectedModelIndex !== 0) {
        setSelectedModelIndex(0);
      }
      return;
    }
    const modelCount = currentBrand.models.length;
    if (modelCount === 0) {
      if (selectedModelIndex !== 0) {
        setSelectedModelIndex(0);
      }
      return;
    }
    if (selectedModelIndex >= modelCount) {
      setSelectedModelIndex(0);
    }
  }, [currentBrand, selectedModelIndex]);

  useEffect(() => {
    const existingSelection = device.brandSelection;
    const defaultSource: BrandSelectionSource = existingSelection
      ? existingSelection.source
      : hasGenericOptions
      ? 'generic'
      : hasBrandOptions
      ? 'brand'
      : 'generic';

    setSelectionSource(defaultSource);

    if (hasGenericOptions) {
      const initialGenericIndex =
        existingSelection?.source === 'generic'
          ? genericOptions.findIndex((option) => option.label === existingSelection.sizeLabel)
          : 0;
      setSelectedGenericIndex(initialGenericIndex >= 0 ? initialGenericIndex : 0);
    } else {
      setSelectedGenericIndex(0);
    }

    if (hasBrandOptions) {
      const initialBrandName =
        existingSelection?.source === 'brand' && existingSelection.brandName
          ? existingSelection.brandName
          : brandOptions[0]?.name ?? '';
      setSelectedBrandName(initialBrandName);

      const matchedBrand =
        brandOptions.find((brand) => brand.name === initialBrandName) ?? brandOptions[0];

      if (matchedBrand) {
        const initialModelIndex =
          existingSelection?.source === 'brand'
            ? matchedBrand.models.findIndex((model) => {
                const matchesSize = model.size === existingSelection.sizeLabel;
                const matchesModel = existingSelection.model
                  ? model.model === existingSelection.model
                  : true;
                return matchesSize && matchesModel;
              })
            : 0;
        setSelectedModelIndex(initialModelIndex >= 0 ? initialModelIndex : 0);
      } else {
        setSelectedModelIndex(0);
      }
    } else {
      setSelectedBrandName('');
      setSelectedModelIndex(0);
    }

    if (existingSelection) {
      setCustomWattage(existingSelection.wattage);
    } else if (defaultSource === 'brand') {
      const fallback = brandOptions[0]?.models[0]?.wattage;
      setCustomWattage(fallback ?? device.wattage);
    } else if (defaultSource === 'generic') {
      const fallback = genericOptions[0]?.wattage;
      setCustomWattage(fallback ?? device.wattage);
    } else {
      setCustomWattage(device.wattage);
    }

    setWattageError(null);
  }, [
    device,
    brandOptions,
    genericOptions,
    hasBrandOptions,
    hasGenericOptions,
  ]);

  useEffect(() => {
    if (!brandEntry) {
      return;
    }

    if (selectionSource === 'brand' && currentModel) {
      if (Number.isFinite(currentModel.wattage)) {
        setCustomWattage(currentModel.wattage);
        setWattageError(null);
      }
      return;
    }

    if (selectionSource === 'generic') {
      const option = genericOptions[selectedGenericIndex] ?? genericOptions[0];
      if (option && Number.isFinite(option.wattage)) {
        setCustomWattage(option.wattage);
        setWattageError(null);
      }
    }
  }, [
    brandEntry,
    currentModel,
    genericOptions,
    selectedGenericIndex,
    selectionSource,
  ]);

  const handleWattageChange = (value: string) => {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      setCustomWattage(NaN);
      setWattageError('Enter a valid number');
      return;
    }

    if (parsed <= 0) {
      setCustomWattage(parsed);
      setWattageError('Wattage must be greater than 0');
      return;
    }

    setCustomWattage(parsed);
    setWattageError(null);
  };

  const handleConfirm = () => {
    if (wattageError || !Number.isFinite(customWattage) || customWattage <= 0) {
      setWattageError('Enter a valid wattage before continuing');
      return;
    }

    const config: {
      duration: number;
      mealsPerDay?: number;
      alternativeFuel?: AlternativeFuel;
      wattage: number;
      brandSelection?: DeviceBrandSelection;
    } = { duration, wattage: customWattage };

    if (brandEntry) {
      if (selectionSource === 'brand' && currentBrand && currentModel) {
        const { size, wattage, model: modelName, ...rest } = currentModel;
        const attributeEntries = Object.entries(rest).filter(
          ([, value]) => value !== undefined
        );
        const attributes =
          attributeEntries.length > 0
            ? (Object.fromEntries(attributeEntries) as Record<string, BrandAttributeValue>)
            : undefined;

        const brandSelection: DeviceBrandSelection = {
          source: 'brand',
          brandName: currentBrand.name,
          model: modelName,
          sizeLabel: size,
          wattage: Number(wattage),
          attributes,
        };
        config.brandSelection = brandSelection;
      } else if (selectionSource === 'generic') {
        const genericOption = genericOptions[selectedGenericIndex] ?? genericOptions[0];
        if (genericOption) {
          const { label, wattage, ...rest } = genericOption;
          const attributeEntries = Object.entries(rest).filter(
            ([, value]) => value !== undefined
          );
          const attributes =
            attributeEntries.length > 0
              ? (Object.fromEntries(attributeEntries) as Record<string, BrandAttributeValue>)
              : undefined;

          const brandSelection: DeviceBrandSelection = {
            source: 'generic',
            sizeLabel: label,
            wattage: Number(wattage),
            attributes,
          };
          config.brandSelection = brandSelection;
        }
      }
    }

    if (isCookingDevice) {
      config.mealsPerDay = mealsPerDay;

      const fuelData = ALTERNATIVE_FUELS[selectedFuelType];
      config.alternativeFuel = {
        ...fuelData,
        dailyConsumption: FUEL_DAILY_CONSUMPTION[selectedFuelType],
      } as AlternativeFuel;
    }

    onConfirm(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="bg-primary text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Configure {device.name}</h2>
            <p className="text-blue-100 text-sm">
              {(Number.isFinite(customWattage) && customWattage > 0 ? customWattage : device.wattage)}W - {device.category}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {brandEntry && (hasGenericOptions || hasBrandOptions) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">Select Appliance Profile</label>
              </div>
              <p className="text-sm text-gray-600">
                Choose a generic size or your exact brand/model. The wattage will update automatically—you can still fine-tune it manually below.
              </p>
              <div className="flex flex-wrap gap-3">
                {hasGenericOptions && (
                  <button
                    type="button"
                    onClick={() => setSelectionSource('generic')}
                    className={`px-4 py-2 rounded-xl border transition-all text-sm font-semibold ${
                      selectionSource === 'generic'
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    Generic sizes
                  </button>
                )}
                {hasBrandOptions && (
                  <button
                    type="button"
                    onClick={() => setSelectionSource('brand')}
                    className={`px-4 py-2 rounded-xl border transition-all text-sm font-semibold ${
                      selectionSource === 'brand'
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    Brand &amp; model
                  </button>
                )}
              </div>

              {selectionSource === 'generic' && hasGenericOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {genericOptions.map((option, index) => {
                    const isSelected = selectedGenericIndex === index;
                    const attributeEntries = Object.entries(option).filter(
                      ([key, value]) =>
                        !['label', 'wattage'].includes(key) && value !== undefined
                    );
                    return (
                      <button
                        type="button"
                        key={option.label}
                        onClick={() => {
                          setSelectionSource('generic');
                          setSelectedGenericIndex(index);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-gray-200 bg-white hover:border-primary hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{option.label}</span>
                          <span className="text-sm font-medium text-primary">{option.wattage}W</span>
                        </div>
                        {attributeEntries.length > 0 && (
                          <div className="mt-2 space-y-1 text-xs text-gray-600">
                            {attributeEntries.map(([key, value]) => (
                              <div key={key} className="flex items-center gap-1">
                                <span className="font-semibold">
                                  {formatAttributeKey(key)}:
                                </span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectionSource === 'brand' && hasBrandOptions && currentBrand && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-1 block">Brand</label>
                    <select
                      value={selectedBrandName}
                      onChange={(event) => {
                        setSelectionSource('brand');
                        setSelectedBrandName(event.target.value);
                        setSelectedModelIndex(0);
                      }}
                      className="w-full md:w-72 border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {brandOptions.map((brand) => (
                        <option key={brand.name} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentModels.map((model, index) => {
                      const isSelected = selectedModelIndex === index;
                      const attributeEntries = Object.entries(model).filter(
                        ([key, value]) =>
                          !['size', 'wattage', 'model'].includes(key) && value !== undefined
                      );
                      return (
                        <button
                          type="button"
                          key={`${currentBrand.name}-${model.size}-${model.model ?? index}`}
                          onClick={() => {
                            setSelectionSource('brand');
                            setSelectedModelIndex(index);
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-md'
                              : 'border-gray-200 bg-white hover:border-primary hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{model.size}</div>
                              {model.model && (
                                <div className="text-xs text-gray-600 mt-0.5">Model {model.model}</div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-primary">{model.wattage}W</span>
                          </div>
                          {attributeEntries.length > 0 && (
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              {attributeEntries.map(([key, value]) => (
                                <div key={key} className="flex items-center gap-1">
                                  <span className="font-semibold">
                                    {formatAttributeKey(key)}:
                                  </span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="font-semibold text-gray-900 flex items-center gap-2">
              <span>Device Wattage</span>
              <span className="text-xs text-gray-500 font-normal">Enter the rated power for your appliance (in watts)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                min={1}
                value={Number.isNaN(customWattage) ? '' : customWattage}
                onChange={(event) => handleWattageChange(event.target.value)}
                className={`w-full md:w-48 border rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  wattageError ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                }`}
                aria-label="Device wattage in watts"
              />
              <span className="text-sm text-gray-600 font-medium">Watts</span>
            </div>
            {wattageError ? (
              <p className="text-sm text-red-600">{wattageError}</p>
            ) : (
              <p className="text-xs text-gray-500">Default catalog value: {device.wattage}W. Adjust if your device differs.</p>
            )}
          </div>

          {isAlwaysOn && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl shadow-sm p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">24/7 Operation</h4>
                <p className="text-sm text-blue-700">This device runs continuously and cannot be scheduled. It will consume power 24 hours a day.</p>
              </div>
            </div>
          )}

          {!isAlwaysOn && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">Usage Duration per Day</label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {DURATION_OPTIONS.map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setDuration(hours)}
                    className={`py-3 px-2 rounded-xl border font-semibold transition-all text-sm ${
                      duration === hours
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">Selected: <strong>{duration} hours per day</strong></p>
            </div>
          )}

          {isCookingDevice && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">Meals Prepared Per Day</label>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {MEAL_OPTIONS.map((meals) => (
                  <button
                    key={meals}
                    onClick={() => setMealsPerDay(meals)}
                    className={`py-3 px-4 rounded-xl border font-semibold transition-all ${
                      mealsPerDay === meals
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    {meals} meal{meals > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCookingDevice && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">Current Cooking Fuel</label>
              </div>
              <p className="text-sm text-gray-600">Select what you currently use for cooking (for cost comparison)</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ALTERNATIVE_FUELS).map(([key, fuel]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFuelType(key)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      selectedFuelType === key
                        ? 'bg-primary text-white border-primary shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                    }`}
                  >
                    <div className="font-semibold capitalize mb-1">{key}</div>
                    <div className={`text-sm ${selectedFuelType === key ? 'text-blue-100' : 'text-gray-600'}`}>
                      KES {fuel.costPerUnit}/{fuel.unit}
                    </div>
                    <div className={`text-xs mt-1 ${selectedFuelType === key ? 'text-blue-100' : 'text-gray-500'}`}>
                      ~{FUEL_DAILY_CONSUMPTION[key]} {fuel.unit}/day
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3">Configuration Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium text-gray-900">{device.name}</span>
              </div>
              {brandEntry && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {selectionSource === 'brand' && currentBrand && currentModel
                      ? `${currentBrand.name}${currentModel.model ? ` • ${currentModel.model}` : ''} • ${currentModel.size}`
                      : selectionSource === 'generic' && genericOptions[selectedGenericIndex]
                      ? `Generic • ${genericOptions[selectedGenericIndex].label}`
                      : 'Custom'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Power:</span>
                <span className="font-medium text-gray-900">{(Number.isFinite(customWattage) && customWattage > 0 ? customWattage : device.wattage)}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usage per day:</span>
                <span className="font-medium text-gray-900">{duration} hours</span>
              </div>
              {isCookingDevice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals per day:</span>
                    <span className="font-medium text-gray-900">{mealsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current fuel:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedFuelType}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={handleConfirm}
              className="flex-1"
              disabled={Boolean(wattageError) || !Number.isFinite(customWattage) || customWattage <= 0}
            >
              Continue to Time Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
