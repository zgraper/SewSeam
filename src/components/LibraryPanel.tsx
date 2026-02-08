import { useState, useRef, useMemo } from 'react';
import { useStore } from '../store';
import { X, Upload, GripVertical, Search } from 'lucide-react';
import PanelHeader from './ui/PanelHeader';
import Section from './ui/Section';
import { 
  readFileAsText, 
  readFileAsDataUrl, 
  loadImageDimensions,
  parseSvgMetadata,
  isSvgFile,
  isImageFile,
} from '../utils/fileReaders';

type TabType = 'patterns' | 'fabrics';

export default function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('patterns');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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

  // Filter items based on search query
  const filteredPatterns = useMemo(() => {
    if (!searchQuery) return patterns;
    const query = searchQuery.toLowerCase();
    return patterns.filter((p) => p.name.toLowerCase().includes(query));
  }, [patterns, searchQuery]);

  const filteredFabrics = useMemo(() => {
    if (!searchQuery) return fabrics;
    const query = searchQuery.toLowerCase();
    return fabrics.filter((f) => f.name.toLowerCase().includes(query));
  }, [fabrics, searchQuery]);

  const clearError = () => {
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handlePatternUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (isSvgFile(file)) {
        const svgText = await readFileAsText(file);
        const metadata = parseSvgMetadata(svgText);
        const viewBox = metadata.viewBox || (metadata.width && metadata.height
          ? `0 0 ${metadata.width} ${metadata.height}`
          : undefined);
        const patternId = crypto.randomUUID();
        addPattern({
          id: patternId,
          name: file.name,
          type: 'svg',
          svgText,
          width: metadata.width,
          height: metadata.height,
          viewBox,
        });
        setSelectedPatternId(patternId);
      } else if (isImageFile(file)) {
        const imageUrl = await readFileAsDataUrl(file);
        const dimensions = await loadImageDimensions(imageUrl);
        const patternId = crypto.randomUUID();
        addPattern({
          id: patternId,
          name: file.name,
          type: 'image',
          imageUrl,
          width: dimensions.width,
          height: dimensions.height,
          viewBox: `0 0 ${dimensions.width} ${dimensions.height}`,
        });
        setSelectedPatternId(patternId);
      } else {
        setErrorMessage('Invalid file type. Please upload an SVG or image file.');
        clearError();
      }
    } catch (error) {
      setErrorMessage(`Failed to upload pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
      clearError();
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleFabricUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    if (!isImageFile(file)) {
      setErrorMessage('Invalid file type. Please upload an image file.');
      clearError();
      e.target.value = '';
      return;
    }

    setIsProcessing(true);

    try {
      const imageUrl = await readFileAsDataUrl(file);
      const dimensions = await loadImageDimensions(imageUrl);
      const fabricId = crypto.randomUUID();
      addFabric({
        id: fabricId,
        name: file.name,
        imageUrl,
        width: dimensions.width,
        height: dimensions.height,
      });
      setSelectedFabricId(fabricId);
    } catch (error) {
      setErrorMessage(`Failed to upload fabric: ${error instanceof Error ? error.message : 'Unknown error'}`);
      clearError();
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, type: 'pattern' | 'fabric') => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (type === 'pattern') {
      // Create a synthetic event to reuse the existing upload handler
      const event = { target: { files: [file], value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handlePatternUpload(event);
    } else {
      const event = { target: { files: [file], value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFabricUpload(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const renderPatterns = () => {
    const items = filteredPatterns;

    if (patterns.length === 0) {
      return (
        <div
          className={`text-center py-8 px-4 rounded-lg border-2 border-dashed transition-colors ${
            isDraggingOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDrop={(e) => handleDrop(e, 'pattern')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-3">
            {isDraggingOver ? 'Drop pattern file here' : 'No patterns uploaded yet'}
          </p>
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

    if (items.length === 0 && searchQuery) {
      return (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">No patterns match "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {items.map((pattern) => (
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

              {/* Name and metadata */}
              <div className="px-2 py-1.5 bg-white rounded-b-lg">
                <p className="text-xs text-gray-700 truncate font-medium" title={pattern.name}>
                  {pattern.name}
                </p>
                {pattern.width && pattern.height && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pattern.width} × {pattern.height}
                  </p>
                )}
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
      </div>
    );
  };

  const renderFabrics = () => {
    const items = filteredFabrics;

    if (fabrics.length === 0) {
      return (
        <div
          className={`text-center py-8 px-4 rounded-lg border-2 border-dashed transition-colors ${
            isDraggingOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDrop={(e) => handleDrop(e, 'fabric')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-3">
            {isDraggingOver ? 'Drop fabric image here' : 'No fabrics uploaded yet'}
          </p>
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

    if (items.length === 0 && searchQuery) {
      return (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">No fabrics match "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((fabric) => (
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
            {/* Drag Handle */}
            <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <GripVertical size={16} className="text-gray-600" />
            </div>

            {/* Thumbnail */}
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={fabric.imageUrl}
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name and metadata */}
            <div className="px-2 py-1.5 bg-white rounded-b-lg">
              <p className="text-xs text-gray-700 truncate font-medium" title={fabric.name}>
                {fabric.name}
              </p>
              {fabric.width && fabric.height && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {fabric.width} × {fabric.height}
                </p>
              )}
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

        {/* Error message */}
        {errorMessage && (
          <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Loading indicator */}
        {isProcessing && (
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-xs text-blue-700">Processing...</p>
          </div>
        )}

        {/* Search bar */}
        {(patterns.length > 0 || fabrics.length > 0) && (
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

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
