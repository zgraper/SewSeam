import { useState } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';

type TabType = 'patterns' | 'fabrics';

export default function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('patterns');
  const { 
    patterns, 
    fabrics, 
    selectedPatternId, 
    selectedFabricId,
    setSelectedPatternId,
    setSelectedFabricId,
    removePattern,
    removeFabric
  } = useStore();

  const renderPatterns = () => {
    if (patterns.length === 0) {
      return (
        <p className="text-xs text-gray-500 text-center py-8">
          No patterns uploaded yet
        </p>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
              selectedPatternId === pattern.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPatternId(pattern.id)}
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
              {pattern.type === 'svg' && pattern.svgText ? (
                <div 
                  className="w-full h-full p-2"
                  dangerouslySetInnerHTML={{ __html: pattern.svgText }}
                />
              ) : pattern.type === 'image' && pattern.imageUrl ? (
                <img
                  src={pattern.imageUrl}
                  alt={pattern.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs">No preview</span>
              )}
            </div>

            {/* Name */}
            <div className="px-2 py-1.5 bg-white rounded-b-lg">
              <p className="text-xs text-gray-700 truncate" title={pattern.name}>
                {pattern.name}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removePattern(pattern.id);
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete pattern"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderFabrics = () => {
    if (fabrics.length === 0) {
      return (
        <p className="text-xs text-gray-500 text-center py-8">
          No fabrics uploaded yet
        </p>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {fabrics.map((fabric) => (
          <div
            key={fabric.id}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
              selectedFabricId === fabric.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedFabricId(fabric.id)}
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={fabric.imageUrl}
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name */}
            <div className="px-2 py-1.5 bg-white rounded-b-lg">
              <p className="text-xs text-gray-700 truncate" title={fabric.name}>
                {fabric.name}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFabric(fabric.id);
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete fabric"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Library</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'patterns'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Patterns ({patterns.length})
        </button>
        <button
          onClick={() => setActiveTab('fabrics')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'fabrics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Fabrics ({fabrics.length})
        </button>
      </div>

      {/* Tab content */}
      <div className="pt-2">
        {activeTab === 'patterns' ? renderPatterns() : renderFabrics()}
      </div>
    </div>
  );
}
