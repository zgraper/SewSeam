import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { MouseEvent, TouchEvent, WheelEvent } from 'react';
import { useStore } from '../store';

interface WorkspaceStageProps {
  children: React.ReactNode;
  viewBox?: string;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface WorkspaceStageHandle {
  fitToContent: () => void;
  resetView: () => void;
}

const WorkspaceStage = forwardRef<WorkspaceStageHandle, WorkspaceStageProps>(
  function WorkspaceStage({ children, viewBox }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const regions = useStore((state) => state.regions);
    const selectedRegionId = useStore((state) => state.selectedRegionId);
    const { fabrics, updateRegion, setSelectedRegionId, removeRegion, addRegion, activeTool } = useStore();
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [startTransform, setStartTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
    const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

    // Track initial distance for pinch zoom
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [initialPinchScale, setInitialPinchScale] = useState(1);

    const toWorkspaceCoordinates = useCallback((clientX: number, clientY: number) => {
      if (!svgRef.current) return null;

      const svgPoint = svgRef.current.createSVGPoint();
      svgPoint.x = clientX;
      svgPoint.y = clientY;

      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return null;

      const point = svgPoint.matrixTransform(ctm.inverse());
      return {
        x: (point.x - transform.x) / transform.scale,
        y: (point.y - transform.y) / transform.scale,
      };
    }, [transform.scale, transform.x, transform.y]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      fitToContent: () => {
        if (!svgRef.current || regions.length === 0) return;

        // Get bounding box of all regions
        let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;

        regions.forEach((region) => {
          const pathElement = svgRef.current?.querySelector(`[data-region-id="${region.id}"]`) as SVGPathElement;
          if (pathElement) {
            try {
              const bbox = pathElement.getBBox();
              minX = Math.min(minX, bbox.x);
              minY = Math.min(minY, bbox.y);
              maxX = Math.max(maxX, bbox.x + bbox.width);
              maxY = Math.max(maxY, bbox.y + bbox.height);
            } catch {
              // getBBox can fail on some browsers/invalid paths - skip this region
              console.warn(`Failed to get bounding box for region ${region.id}`);
            }
          }
        });

        if (!isFinite(minX)) return;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const contentCenterX = (minX + maxX) / 2;
        const contentCenterY = (minY + maxY) / 2;

        const svgRect = svgRef.current.getBoundingClientRect();
        const padding = 40; // Leave some padding
        const availableWidth = svgRect.width - padding * 2;
        const availableHeight = svgRect.height - padding * 2;

        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 2); // Cap at 2x

        // Calculate translation to center the content
        const newX = svgRect.width / 2 - contentCenterX * newScale;
        const newY = svgRect.height / 2 - contentCenterY * newScale;

        setTransform({ x: newX, y: newY, scale: newScale });
      },
      resetView: () => {
        setTransform({ x: 0, y: 0, scale: 1 });
      },
    }), [regions]);

    // Ensure every region has an editable clip rectangle.
    useEffect(() => {
      if (!svgRef.current) return;

      regions.forEach((region) => {
        if (region.clipRect) return;

        const pathElement = svgRef.current?.querySelector(`[data-region-id="${region.id}"]`) as SVGPathElement;
        if (!pathElement) return;

        try {
          const bbox = pathElement.getBBox();
          if (bbox.width <= 0 || bbox.height <= 0) return;

          updateRegion(region.id, {
            clipRect: {
              x: bbox.x,
              y: bbox.y,
              width: bbox.width,
              height: bbox.height,
            },
          });
        } catch {
          // Ignore invalid path bounds.
        }
      });
    }, [regions, updateRegion]);

    // Helper function to get distance between two touch points
    const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Mouse pan handlers
    const handleMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return; // Only left click

      const target = e.target as SVGElement;
      const clickedRegionId = target.getAttribute('data-region-id');

      if (activeTool === 'split' && clickedRegionId) {
        const clickedRegion = regions.find((region) => region.id === clickedRegionId);
        const clickPoint = toWorkspaceCoordinates(e.clientX, e.clientY);
        if (!clickedRegion || !clickPoint) return;

        const bounds = clickedRegion.clipRect;
        if (!bounds) return;

        const splitX = Math.max(bounds.x + 4, Math.min(bounds.x + bounds.width - 4, clickPoint.x));
        const leftWidth = splitX - bounds.x;
        const rightWidth = bounds.x + bounds.width - splitX;
        if (leftWidth < 4 || rightWidth < 4) return;

        const leftRegionId = crypto.randomUUID();
        const rightRegionId = crypto.randomUUID();

        const sharedRegionData = {
          pathData: clickedRegion.pathData,
          transform: clickedRegion.transform,
          fabricTransform: { ...clickedRegion.fabricTransform },
          fabricId: clickedRegion.fabricId,
        };

        addRegion({
          id: leftRegionId,
          name: `${clickedRegion.name} A`,
          ...sharedRegionData,
          clipRect: {
            x: bounds.x,
            y: bounds.y,
            width: leftWidth,
            height: bounds.height,
          },
        });

        addRegion({
          id: rightRegionId,
          name: `${clickedRegion.name} B`,
          ...sharedRegionData,
          clipRect: {
            x: splitX,
            y: bounds.y,
            width: rightWidth,
            height: bounds.height,
          },
        });

        removeRegion(clickedRegion.id);
        setSelectedRegionId(rightRegionId);
        return;
      }

      if (clickedRegionId) {
        if (activeTool === 'select') {
          setSelectedRegionId(clickedRegionId);
          return;
        }

        return;
      }

      // Clicked on empty canvas, clear selection and allow panning.
      setSelectedRegionId(null);
      setIsPanning(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      setStartTransform({ ...transform });
    }, [activeTool, addRegion, regions, removeRegion, setSelectedRegionId, toWorkspaceCoordinates, transform]);

    const handleMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
      if (!isPanning) return;

      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;

      setTransform({
        ...startTransform,
        x: startTransform.x + dx,
        y: startTransform.y + dy,
      });
    }, [isPanning, startPoint, startTransform]);

    const handleMouseUp = useCallback(() => {
      setIsPanning(false);
    }, []);

    // Touch pan handlers
    const handleTouchStart = useCallback((e: TouchEvent<SVGSVGElement>) => {
      if (e.touches.length === 1) {
        // Single touch - pan
        const touch = e.touches[0];
        setIsPanning(true);
        setStartPoint({ x: touch.clientX, y: touch.clientY });
        setStartTransform({ ...transform });
        setInitialPinchDistance(null);
      } else if (e.touches.length === 2) {
        // Two touches - pinch zoom
        setIsPanning(false);
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        setInitialPinchDistance(distance);
        setInitialPinchScale(transform.scale);
      }
    }, [transform]);

    const handleTouchMove = useCallback((e: TouchEvent<SVGSVGElement>) => {
      if (e.touches.length === 1 && isPanning) {
        // Single touch pan
        const touch = e.touches[0];
        const dx = touch.clientX - startPoint.x;
        const dy = touch.clientY - startPoint.y;

        setTransform({
          ...startTransform,
          x: startTransform.x + dx,
          y: startTransform.y + dy,
        });
      } else if (e.touches.length === 2 && initialPinchDistance !== null) {
        // Pinch zoom
        e.preventDefault(); // Prevent page zoom
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = (distance / initialPinchDistance) * initialPinchScale;

        // Clamp scale between 0.1 and 10
        const clampedScale = Math.max(0.1, Math.min(10, scale));

        setTransform(prev => ({
          ...prev,
          scale: clampedScale,
        }));
      }
    }, [isPanning, startPoint, startTransform, initialPinchDistance, initialPinchScale]);

    const handleTouchEnd = useCallback(() => {
      setIsPanning(false);
      setInitialPinchDistance(null);
    }, []);

    // Mouse wheel zoom handler
    const handleWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();

      const delta = -e.deltaY;
      const scaleFactor = delta > 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.1, Math.min(10, transform.scale * scaleFactor));

      setTransform(prev => ({
        ...prev,
        scale: newScale,
      }));
    }, [transform.scale]);

    const handleDragOver = useCallback((e: React.DragEvent<SVGSVGElement>) => {
      if (e.dataTransfer.types.includes('text/fabric-id')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<SVGSVGElement>) => {
      const fabricId = e.dataTransfer.getData('text/fabric-id');
      if (!fabricId) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const pathElement = target?.closest?.('[data-region-id]') as SVGPathElement | null;
      const regionId = pathElement?.getAttribute('data-region-id');
      if (!regionId) return;
      e.preventDefault();
      updateRegion(regionId, { fabricId });
      setSelectedRegionId(regionId);
    }, [setSelectedRegionId, updateRegion]);

    // Update SVG viewBox dimensions when container size changes (only when no explicit viewBox)
    useEffect(() => {
      if (!svgRef.current) return;
      if (viewBox) {
        svgRef.current.setAttribute('viewBox', viewBox);
        return;
      }

      const updateViewBox = () => {
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          svgRef.current.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
        }
      };

      updateViewBox();
      window.addEventListener('resize', updateViewBox);
      return () => window.removeEventListener('resize', updateViewBox);
    }, [viewBox]);

    return (
      <svg
        ref={svgRef}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <defs>
          {/* Define fabric patterns for each region */}
          {regions.map((region) => {
            const fabric = fabrics.find((item) => item.id === region.fabricId);
            if (!fabric) return null;
            const ft = region.fabricTransform;
            const patternWidth = fabric.width || 100;
            const patternHeight = fabric.height || 100;
            return (
              <pattern
                key={`pattern-${region.id}`}
                id={`fabric-pattern-${region.id}`}
                patternUnits="userSpaceOnUse"
                width={patternWidth}
                height={patternHeight}
                patternTransform={`translate(${ft.x}, ${ft.y}) scale(${ft.scale}) rotate(${ft.rotation} ${patternWidth / 2} ${patternHeight / 2})`}
              >
                <image
                  href={fabric.imageUrl}
                  width={patternWidth}
                  height={patternHeight}
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            );
          })}

          {regions.map((region) => {
            if (!region.clipRect) return null;
            return (
              <clipPath key={`clip-${region.id}`} id={`region-clip-${region.id}`}>
                <rect
                  x={region.clipRect.x}
                  y={region.clipRect.y}
                  width={region.clipRect.width}
                  height={region.clipRect.height}
                />
              </clipPath>
            );
          })}
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {children}

          {/* Render regions as SVG paths */}
          {regions.map((region) => {
            const fabric = fabrics.find((item) => item.id === region.fabricId);
            const isSelected = selectedRegionId === region.id;
            const isHovered = hoveredRegionId === region.id;

            return (
              <path
                key={region.id}
                d={region.pathData}
                transform={region.transform}
                data-region-id={region.id}
                clipPath={region.clipRect ? `url(#region-clip-${region.id})` : undefined}
                fill={fabric ? `url(#fabric-pattern-${region.id})` : 'transparent'}
                fillOpacity={fabric ? 0.75 : 1}
                stroke={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : '#93c5fd'}
                strokeWidth={isSelected ? '3' : isHovered ? '2.5' : '2'}
                className="cursor-pointer transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTool === 'select') {
                    setSelectedRegionId(region.id);
                  }
                }}
                onMouseEnter={() => setHoveredRegionId(region.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
                style={{ pointerEvents: 'all' }}
              />
            );
          })}
        </g>
      </svg>
    );
  },
);

export default WorkspaceStage;
