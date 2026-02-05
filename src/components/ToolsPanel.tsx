import { Upload, MousePointer, Scissors, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { useRef } from 'react';

export default function ToolsPanel() {
  const { setPattern, setFabric, reset } = useStore();
  const patternInputRef = useRef<HTMLInputElement>(null);
  const fabricInputRef = useRef<HTMLInputElement>(null);

  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      reader.onload = (event) => {
        const svgText = event.target?.result as string;
        setPattern({
          name: file.name,
          type: 'svg',
          svgText,
        });
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setPattern({
          name: file.name,
          type: 'image',
          imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setFabric({
        name: file.name,
        imageUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Tools</h2>
      
      <button
        onClick={() => patternInputRef.current?.click()}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <MousePointer size={16} />
        Select Tool
      </button>

      <button
        disabled
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
      >
        <Scissors size={16} />
        Split Tool
      </button>

      <div className="border-t border-gray-200 my-3 pt-3">
        <button
          onClick={reset}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
