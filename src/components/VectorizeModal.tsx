import { useState } from 'react';
import { useStore } from '../store';
import { X, Wand2 } from 'lucide-react';
import { rasterToOuterPath } from '../vectorize/rasterToOuterPath';

export default function VectorizeModal() {
  const { 
    patterns, 
    ui, 
    setShowVectorizeModal, 
    setVectorizingPatternId,
    updatePattern,
    addRegion,
  } = useStore();
  
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  
  const pattern = patterns.find(p => p.id === ui.vectorizingPatternId);
  
  if (!ui.showVectorizeModal || !pattern || pattern.type !== 'image' || !pattern.imageUrl) {
    return null;
  }

  const handleClose = () => {
    setShowVectorizeModal(false);
    setVectorizingPatternId(null);
    setPreviewPath(null);
  };

  const handleConvertToOutline = async () => {
    if (!pattern.imageUrl) return;
    
    setIsVectorizing(true);
    try {
      const result = await rasterToOuterPath(pattern.imageUrl);
      setPreviewPath(result.pathData);
    } catch (error) {
      console.error('Vectorization failed:', error);
    } finally {
      setIsVectorizing(false);
    }
  };

  const handleConfirm = () => {
    if (!previewPath) return;
    
    // Update the pattern with the converted path
    updatePattern(pattern.id, {
      convertedPathData: previewPath,
      needsVectorization: false,
    });
    
    // Create a region from the path
    addRegion({
      id: crypto.randomUUID(),
      name: 'Pattern Boundary',
      pathData: previewPath,
      transform: '',
      fabricId: null,
      fabricTransform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    });
    
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Vectorize Outer Boundary (Beta)</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Note:</span> This feature converts your raster image to a vector outline.
                It detects enclosed regions inside dark line art (ideal for white backgrounds) and falls back to the outer boundary if needed.
              </p>
            </div>

            {/* Preview Area */}
            <div className="border-2 border-gray-300 rounded-lg bg-gray-50 p-4 min-h-[300px] flex items-center justify-center relative">
              <svg
                viewBox={pattern.viewBox || `0 0 ${pattern.width || 800} ${pattern.height || 600}`}
                className="max-w-full max-h-[400px]"
              >
                {/* Original image */}
                <image
                  href={pattern.imageUrl}
                  x="0"
                  y="0"
                  width={pattern.width || 800}
                  height={pattern.height || 600}
                  preserveAspectRatio="xMidYMid meet"
                  opacity={previewPath ? 0.4 : 1}
                />
                
                {/* Preview path overlay */}
                {previewPath && (
                  <path
                    d={previewPath}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!previewPath ? (
                <button
                  onClick={handleConvertToOutline}
                  disabled={isVectorizing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVectorizing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      Convert to Outline
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setPreviewPath(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Confirm & Use This Outline
                  </button>
                </>
              )}
            </div>

            {previewPath && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  ✓ Preview shows the detected boundary in blue. Click "Confirm" to use this outline or "Try Again" to regenerate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip Vectorization
          </button>
        </div>
      </div>
    </div>
  );
}
