import { Upload, MousePointer, Scissors, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { useRef } from 'react';
import { extractOuterBoundary } from '../utils/rasterBoundaryExtractor';
import PanelHeader from './ui/PanelHeader';
import Section from './ui/Section';
import Divider from './ui/Divider';

const loadImageSize = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    img.onerror = reject;
    img.src = src;
  });

const parseSvgMetadata = (svgText: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  if (!svgElement) {
    return { viewBox: undefined, width: undefined, height: undefined };
  }

  const viewBox = svgElement.getAttribute('viewBox') || undefined;
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');
  const width = widthAttr ? Number.parseFloat(widthAttr) : undefined;
  const height = heightAttr ? Number.parseFloat(heightAttr) : undefined;

  return { viewBox, width, height };
};

export default function ToolsPanel() {
  const {
    addPattern,
    addFabric,
    reset,
    setSelectedFabricId,
    setSelectedPatternId,
    activeTool,
    setActiveTool,
  } = useStore();
  const patternInputRef = useRef<HTMLInputElement>(null);
  const fabricInputRef = useRef<HTMLInputElement>(null);

  const handlePatternUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      reader.onload = (event) => {
        const svgText = event.target?.result as string;
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
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;

        // Extract boundary from raster image
        const [boundaryResult, imageSize] = await Promise.all([
          extractOuterBoundary(imageUrl),
          loadImageSize(imageUrl),
        ]);
        const patternId = crypto.randomUUID();

        addPattern({
          id: patternId,
          name: file.name,
          type: 'image',
          imageUrl,
          convertedPathData: boundaryResult.success ? boundaryResult.pathString : undefined,
          width: imageSize.width,
          height: imageSize.height,
          viewBox: `0 0 ${imageSize.width} ${imageSize.height}`,
        });
        setSelectedPatternId(patternId);
      };
      reader.readAsDataURL(file);
    }

    // Reset input so the same file can be uploaded again
    e.target.value = '';
  };

  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      const imageSize = await loadImageSize(imageUrl);
      const fabricId = crypto.randomUUID();
      addFabric({
        id: fabricId,
        name: file.name,
        imageUrl,
        width: imageSize.width,
        height: imageSize.height,
      });
      setSelectedFabricId(fabricId);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div className="p-4">
      <Section>
        <PanelHeader>Tools</PanelHeader>

        <button
          onClick={() => patternInputRef.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
        >
          <Upload size={16} />
          Upload Pattern
        </button>
        <input
          ref={patternInputRef}
          type="file"
          accept=".svg,image/*"
          onChange={handlePatternUpload}
          className="hidden"
        />

        <button
          onClick={() => fabricInputRef.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
        >
          <Upload size={16} />
          Upload Fabric
        </button>
        <input
          ref={fabricInputRef}
          type="file"
          accept="image/*"
          onChange={handleFabricUpload}
          className="hidden"
        />

        <button
          onClick={() => setActiveTool('select')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors shadow-sm ${
            activeTool === 'select'
              ? 'text-blue-700 bg-blue-50 border-blue-300'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <MousePointer size={16} />
          Select Tool
        </button>

        <button
          onClick={() => setActiveTool('split')}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors shadow-sm ${
            activeTool === 'split'
              ? 'text-blue-700 bg-blue-50 border-blue-300'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <Scissors size={16} />
          Split Tool
        </button>

        <p className="text-xs text-gray-500 px-1">
          Split tool: click inside a region to split it into left/right pieces.
        </p>

        <Divider />

        <button
          onClick={reset}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors shadow-sm"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </Section>
    </div>
  );
}
