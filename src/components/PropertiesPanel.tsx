import { useState } from 'react';
import { useStore } from '../store';
import type { FabricTransform } from '../store';
import PanelHeader from './ui/PanelHeader';
import Section from './ui/Section';
import Divider from './ui/Divider';
import { ChevronDown, ChevronRight, RotateCcw, Trash2 } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm font-medium text-gray-700"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && <div className="p-3 space-y-3 bg-white">{children}</div>}
    </div>
  );
}

export default function PropertiesPanel() {
  const { regions, fabrics, selectedRegionId, updateRegion, removeRegion } = useStore();
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const selectedFabric = selectedRegion?.fabricId
    ? fabrics.find((f) => f.id === selectedRegion.fabricId)
    : null;

  const handleFabricTransformChange = (property: keyof FabricTransform, value: number | boolean) => {
    if (!selectedRegion) return;
    updateRegion(selectedRegion.id, {
      fabricTransform: {
        ...selectedRegion.fabricTransform,
        [property]: value,
      },
    });
  };

  const handleNameChange = (newName: string) => {
    if (!selectedRegion) return;
    updateRegion(selectedRegion.id, { name: newName });
  };

  const handleResetTransform = () => {
    if (!selectedRegion) return;
    updateRegion(selectedRegion.id, {
      fabricTransform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    });
  };

  const handleDeleteRegion = () => {
    if (!selectedRegion) return;
    if (confirm(`Delete region "${selectedRegion.name}"?`)) {
      removeRegion(selectedRegion.id);
    }
  };

  return (
    <div className="p-4">
      <Section>
        <PanelHeader>Properties</PanelHeader>

        {selectedRegion ? (
          <div className="space-y-4">
            {/* Region Header */}
            <div className="pb-3 border-b border-gray-200">
              <div className="flex items-start gap-3">
                {/* Fabric Thumbnail */}
                <div className="w-12 h-12 rounded border border-gray-300 bg-gray-100 flex-shrink-0 overflow-hidden">
                  {selectedFabric ? (
                    <img
                      src={selectedFabric.imageUrl}
                      alt={selectedFabric.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No fabric
                    </div>
                  )}
                </div>

                {/* Region Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {selectedRegion.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono truncate" title={selectedRegion.id}>
                    {selectedRegion.id}
                  </p>
                  {selectedFabric && (
                    <p className="text-xs text-gray-600 mt-0.5 truncate" title={selectedFabric.name}>
                      Fabric: {selectedFabric.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-3">
              {/* Region Section */}
              <CollapsibleSection title="Region">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Region Name
                  </label>
                  <input
                    type="text"
                    value={selectedRegion.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleDeleteRegion}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Region
                </button>
              </CollapsibleSection>

              {/* Fabric Transform Section */}
              <CollapsibleSection title="Fabric Transform">
                {/* Offset X */}
                <div>
                  <label className="text-xs text-gray-500 flex justify-between mb-1">
                    <span>Offset X</span>
                    <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.x}</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedRegion.fabricTransform.x}
                      onChange={(e) => handleFabricTransformChange('x', Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={selectedRegion.fabricTransform.x}
                      onChange={(e) => handleFabricTransformChange('x', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Offset Y */}
                <div>
                  <label className="text-xs text-gray-500 flex justify-between mb-1">
                    <span>Offset Y</span>
                    <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.y}</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedRegion.fabricTransform.y}
                      onChange={(e) => handleFabricTransformChange('y', Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={selectedRegion.fabricTransform.y}
                      onChange={(e) => handleFabricTransformChange('y', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <label className="text-xs text-gray-500 flex justify-between mb-1">
                    <span>Scale</span>
                    <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.scale.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={selectedRegion.fabricTransform.scale}
                    onChange={(e) => handleFabricTransformChange('scale', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <label className="text-xs text-gray-500 flex justify-between mb-1">
                    <span>Rotation</span>
                    <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.rotation}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedRegion.fabricTransform.rotation}
                    onChange={(e) => handleFabricTransformChange('rotation', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Flip Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRegion.fabricTransform.flipX}
                      onChange={(e) => handleFabricTransformChange('flipX', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Flip X</span>
                  </label>

                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRegion.fabricTransform.flipY}
                      onChange={(e) => handleFabricTransformChange('flipY', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Flip Y</span>
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleResetTransform}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Fabric Transform
                </button>
              </CollapsibleSection>

              {/* Appearance Section */}
              <CollapsibleSection title="Appearance" defaultOpen={false}>
                <p className="text-xs text-gray-500 italic">
                  Appearance controls (fill opacity, stroke width) coming soon...
                </p>
              </CollapsibleSection>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">No region selected</p>
            <p className="text-xs text-gray-500 mt-1">Click a region to inspect its properties</p>
          </div>
        )}

        <Divider />

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Regions</h3>
          {regions.length === 0 ? (
            <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">No regions defined</p>
              <p className="text-xs text-gray-500 mt-1">Upload a pattern to create regions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {regions.map((region) => (
                <div
                  key={region.id}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    selectedRegionId === region.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-300 font-medium'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => useStore.getState().setSelectedRegionId(region.id)}
                >
                  {region.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
