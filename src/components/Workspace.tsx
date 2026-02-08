import { useStore } from '../store';
import { FileImage, Maximize2, RotateCcw } from 'lucide-react';
import WorkspaceStage from './WorkspaceStage';
import { useRef, useEffect } from 'react';

export default function Workspace() {
  const { patterns, selectedPatternId, addRegion } = useStore();
  const pattern = patterns.find((p) => p.id === selectedPatternId);
  const patternViewBox = pattern?.viewBox
    || (pattern?.width && pattern?.height ? `0 0 ${pattern.width} ${pattern.height}` : undefined);
  const svgContainerRef = useRef<SVGGElement>(null);
  const prevPatternRef = useRef<string | null>(null);
  const workspaceStageRef = useRef<{ fitToContent: () => void; resetView: () => void } | null>(null);

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
              
              // Auto-fit to content after a short delay to let the region render
              setTimeout(() => {
                workspaceStageRef.current?.fitToContent();
              }, 100);
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
        
        // Auto-fit to content after a short delay to let the region render
        setTimeout(() => {
          workspaceStageRef.current?.fitToContent();
        }, 100);
      }
    }
  }, [pattern, addRegion]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Workspace Header */}
      {pattern && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-800">{pattern.name}</h3>
            <span className="text-xs text-gray-500">
              {pattern.width && pattern.height ? `${pattern.width} × ${pattern.height}` : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => workspaceStageRef.current?.fitToContent()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
              title="Fit to View"
            >
              <Maximize2 size={14} />
              Fit to View
            </button>
            <button
              onClick={() => workspaceStageRef.current?.resetView()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Workspace Canvas */}
      <div className="flex-1 p-4 bg-gray-50 overflow-hidden relative">
        {/* Background grid pattern */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0'
          }}
        />
        
        <div className="relative w-full h-full border border-gray-300 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden">
          {!pattern ? (
            <div className="text-center text-gray-400">
              <FileImage size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No pattern loaded</p>
              <p className="text-xs mt-1">Upload a pattern to get started</p>
            </div>
          ) : pattern.type === 'svg' && pattern.svgText ? (
            <WorkspaceStage ref={workspaceStageRef} viewBox={patternViewBox}>
              <g ref={svgContainerRef} />
            </WorkspaceStage>
          ) : pattern.type === 'image' && pattern.imageUrl ? (
            <WorkspaceStage ref={workspaceStageRef} viewBox={patternViewBox}>
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
    </div>
  );
}
