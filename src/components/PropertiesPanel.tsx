import { useStore } from '../store';
import type { FabricTransform } from '../store';

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
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Properties</h2>

      {selectedRegion ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Region Name</label>
            <input
              type="text"
              value={selectedRegion.name}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 block">Fabric Transform</label>
            
            <div>
              <label className="text-xs text-gray-500 flex justify-between">
                <span>X Position</span>
                <span className="font-mono">{selectedRegion.fabricTransform.x}</span>
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
              <label className="text-xs text-gray-500 flex justify-between">
                <span>Y Position</span>
                <span className="font-mono">{selectedRegion.fabricTransform.y}</span>
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
              <label className="text-xs text-gray-500 flex justify-between">
                <span>Scale</span>
                <span className="font-mono">{selectedRegion.fabricTransform.scale.toFixed(1)}</span>
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
              <label className="text-xs text-gray-500 flex justify-between">
                <span>Rotation</span>
                <span className="font-mono">{selectedRegion.fabricTransform.rotation}°</span>
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
        <p className="text-xs text-gray-500">No region selected</p>
      )}

      <div className="border-t border-gray-200 pt-3 mt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Regions</h3>
        {regions.length === 0 ? (
          <p className="text-xs text-gray-500">No regions defined</p>
        ) : (
          <div className="space-y-1">
            {regions.map((region) => (
              <div
                key={region.id}
                className={`px-2 py-1.5 text-xs rounded cursor-pointer ${
                  selectedRegionId === region.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => useStore.getState().setSelectedRegionId(region.id)}
              >
                {region.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
