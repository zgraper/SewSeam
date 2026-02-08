import { useStore } from '../store';
import { FileImage } from 'lucide-react';
import WorkspaceStage from './WorkspaceStage';
import { useRef, useEffect } from 'react';

export default function Workspace() {
  const { patterns, selectedPatternId, addRegion } = useStore();
  const pattern = patterns.find((p) => p.id === selectedPatternId);
  const patternViewBox = pattern?.viewBox
    || (pattern?.width && pattern?.height ? `0 0 ${pattern.width} ${pattern.height}` : undefined);
  const svgContainerRef = useRef<SVGGElement>(null);
  const prevPatternRef = useRef<string | null>(null);

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

        // Initialize region from the first path element (outer boundary)
        // Only create a region if this is a new pattern (different from previous)
        const patternKey = pattern.id + '|svg|' + pattern.name;
        if (prevPatternRef.current !== patternKey) {
          prevPatternRef.current = patternKey;
          
          const firstPath = svgElement.querySelector('path');
          if (firstPath) {
            const pathData = firstPath.getAttribute('d');
            const transform = firstPath.getAttribute('transform') || '';
            
            if (pathData) {
              addRegion({
                id: crypto.randomUUID(),
                name: 'Outer Boundary',
                pathData,
                transform,
                fabricId: null,
                fabricTransform: {
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                },
              });
            }
          }
        }
      }
    } else if (pattern?.type === 'image' && pattern.convertedPathData) {
      // For raster images with converted path data, create a region
      const patternKey = pattern.id + '|raster|' + pattern.name;
      if (prevPatternRef.current !== patternKey) {
        prevPatternRef.current = patternKey;
        
        addRegion({
          id: crypto.randomUUID(),
          name: 'Pattern Boundary',
          pathData: pattern.convertedPathData,
          transform: '',
          fabricId: null,
          fabricTransform: {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
          },
        });
      }
    }
  }, [pattern, addRegion]);

  return (
    <div className="w-full h-full p-4 bg-gray-50">
      <div className="w-full h-full min-h-[600px] border-2 border-gray-300 rounded bg-white flex items-center justify-center">
        {!pattern ? (
          <div className="text-center text-gray-400">
            <FileImage size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pattern loaded</p>
            <p className="text-xs mt-1">Upload a pattern to get started</p>
          </div>
        ) : pattern.type === 'svg' && pattern.svgText ? (
          <WorkspaceStage viewBox={patternViewBox}>
            <g ref={svgContainerRef} />
          </WorkspaceStage>
        ) : pattern.type === 'image' && pattern.imageUrl ? (
          <WorkspaceStage viewBox={patternViewBox}>
            <image
              href={pattern.imageUrl}
              x="0"
              y="0"
              width={pattern.width || 800}
              height={pattern.height || 600}
              preserveAspectRatio="xMidYMid meet"
            />
          </WorkspaceStage>
        ) : null}
      </div>
    </div>
  );
}
