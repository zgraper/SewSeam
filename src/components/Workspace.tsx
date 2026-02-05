import { useStore } from '../store';
import { FileImage } from 'lucide-react';
import WorkspaceStage from './WorkspaceStage';
import { useRef, useEffect } from 'react';

export default function Workspace() {
  const pattern = useStore((state) => state.pattern);
  const svgContainerRef = useRef<SVGGElement>(null);

  // Parse and extract SVG content when pattern changes
  useEffect(() => {
    if (pattern?.type === 'svg' && pattern.svgText && svgContainerRef.current) {
      // Clear previous content
      svgContainerRef.current.innerHTML = '';
      
      // Parse the SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(pattern.svgText, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (svgElement) {
        // Clone all children of the SVG into our container
        Array.from(svgElement.children).forEach(child => {
          svgContainerRef.current?.appendChild(child.cloneNode(true));
        });
      }
    }
  }, [pattern]);

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
          <WorkspaceStage>
            <g ref={svgContainerRef} />
          </WorkspaceStage>
        ) : pattern.type === 'image' && pattern.imageUrl ? (
          <WorkspaceStage>
            <image href={pattern.imageUrl} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
          </WorkspaceStage>
        ) : null}
      </div>
    </div>
  );
}
