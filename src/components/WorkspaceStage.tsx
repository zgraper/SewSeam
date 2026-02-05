import { useRef, useState, useCallback, useEffect } from 'react';
import type { MouseEvent, TouchEvent, WheelEvent } from 'react';

interface WorkspaceStageProps {
  children: React.ReactNode;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export default function WorkspaceStage({ children }: WorkspaceStageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [startTransform, setStartTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

  // Track initial distance for pinch zoom
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchScale, setInitialPinchScale] = useState(1);

  // Helper function to get distance between two touch points
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Mouse pan handlers
  const handleMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsPanning(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setStartTransform({ ...transform });
  }, [transform]);

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

  // Update SVG viewBox dimensions when container size changes
  useEffect(() => {
    const updateViewBox = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        svgRef.current.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      }
    };

    updateViewBox();
    window.addEventListener('resize', updateViewBox);
    return () => window.removeEventListener('resize', updateViewBox);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
        {children}
      </g>
    </svg>
  );
}
