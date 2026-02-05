import { useStore } from '../store';
import { FileImage } from 'lucide-react';

export default function Workspace() {
  const pattern = useStore((state) => state.pattern);

  return (
    <div className="flex-1 p-4 bg-gray-50 overflow-auto">
      <div className="h-full border-2 border-gray-300 rounded bg-white flex items-center justify-center">
        {!pattern ? (
          <div className="text-center text-gray-400">
            <FileImage size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pattern loaded</p>
            <p className="text-xs mt-1">Upload a pattern to get started</p>
          </div>
        ) : pattern.type === 'svg' && pattern.svgText ? (
          <div 
            className="w-full h-full p-4 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: pattern.svgText }}
          />
        ) : pattern.type === 'image' && pattern.imageUrl ? (
          <img
            src={pattern.imageUrl}
            alt={pattern.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}
