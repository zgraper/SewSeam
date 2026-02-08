import { useState, useRef } from 'react';
import { useStore } from '../store';
import { X, Upload } from 'lucide-react';
import PanelHeader from './ui/PanelHeader';
import Section from './ui/Section';

type TabType = 'patterns' | 'fabrics';

export default function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('patterns');
  const patternInputRef = useRef<HTMLInputElement>(null);
  const fabricInputRef = useRef<HTMLInputElement>(null);
  const { 
    patterns, 
    fabrics, 
    selectedPatternId, 
    selectedFabricId,
    setSelectedPatternId,
    setSelectedFabricId,
    removePattern,
    removeFabric,
    addPattern,
    addFabric,
  } = useStore();

  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      reader.onload = (event) => {
        const svgText = event.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        
        const viewBox = svgElement?.getAttribute('viewBox') || undefined;
        const widthAttr = svgElement?.getAttribute('width');
        const heightAttr = svgElement?.getAttribute('height');
        const width = widthAttr ? Number.parseFloat(widthAttr) : undefined;
        const height = heightAttr ? Number.parseFloat(heightAttr) : undefined;
        
        const patternId = crypto.randomUUID();
        addPattern({
          id: patternId,
          name: file.name,
          type: 'svg',
          svgText,
          width,
          height,
          viewBox,
        });
        setSelectedPatternId(patternId);
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const patternId = crypto.randomUUID();
          addPattern({
            id: patternId,
            name: file.name,
            type: 'image',
            imageUrl,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            viewBox: `0 0 ${img.naturalWidth || img.width} ${img.naturalHeight || img.height}`,
          });
          setSelectedPatternId(patternId);
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
    
    e.target.value = '';
  };

  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const fabricId = crypto.randomUUID();
        addFabric({
          id: fabricId,
          name: file.name,
          imageUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
        setSelectedFabricId(fabricId);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  };

  const renderPatterns = () => {
    if (patterns.length === 0) {
      return (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">No patterns uploaded yet</p>
          <button
            onClick={() => patternInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload size={14} />
            Upload Pattern
          </button>
        </div>
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
                <img
                  src={`data:image/svg+xml;base64,${btoa(pattern.svgText)}`}
                  alt={pattern.name}
                  className="w-full h-full object-contain p-2"
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
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">No fabrics uploaded yet</p>
          <button
            onClick={() => fabricInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload size={14} />
            Upload Fabric
          </button>
        </div>
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
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/fabric-id', fabric.id);
              event.dataTransfer.effectAllowed = 'copy';
            }}
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
    <div className="p-4">
      <Section>
        <PanelHeader>Library</PanelHeader>

        {/* Hidden file inputs */}
        <input
          ref={patternInputRef}
          type="file"
          accept=".svg,image/*"
          onChange={handlePatternUpload}
          className="hidden"
        />
        <input
          ref={fabricInputRef}
          type="file"
          accept="image/*"
          onChange={handleFabricUpload}
          className="hidden"
        />

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
      </Section>
    </div>
  );
}
