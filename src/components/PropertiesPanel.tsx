import { useStore } from '../store';
import type { FabricTransform } from '../store';
import PanelHeader from './ui/PanelHeader';
import Section from './ui/Section';
import Divider from './ui/Divider';

export default function PropertiesPanel() {
  const { regions, selectedRegionId, updateRegion } = useStore();
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  const handleFabricTransformChange = (property: keyof FabricTransform, value: number) => {
    if (!selectedRegion) return;
    updateRegion(selectedRegion.id, {
      fabricTransform: {
        ...selectedRegion.fabricTransform,
        [property]: value,
      },
    });
  };

  return (
    <div className="p-4">
      <Section>
        <PanelHeader>Properties</PanelHeader>

        {selectedRegion ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Region Name</label>
              <input
                type="text"
                value={selectedRegion.name}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-600 block">Fabric Transform</label>
              
              <div>
                <label className="text-xs text-gray-500 flex justify-between mb-1">
                  <span>X Position</span>
                  <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.x}</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={selectedRegion.fabricTransform.x}
                  onChange={(e) => handleFabricTransformChange('x', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 flex justify-between mb-1">
                  <span>Y Position</span>
                  <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.y}</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={selectedRegion.fabricTransform.y}
                  onChange={(e) => handleFabricTransformChange('y', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 flex justify-between mb-1">
                  <span>Scale</span>
                  <span className="font-mono text-gray-700">{selectedRegion.fabricTransform.scale.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={selectedRegion.fabricTransform.scale}
                  onChange={(e) => handleFabricTransformChange('scale', Number(e.target.value))}
                  className="w-full"
                />
              </div>

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
            </div>
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">No region selected</p>
            <p className="text-xs text-gray-500 mt-1">Click a region to edit its properties</p>
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
