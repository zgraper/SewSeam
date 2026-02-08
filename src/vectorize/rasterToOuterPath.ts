import { extractOuterBoundary } from '../utils/rasterBoundaryExtractor';

/**
 * Converts a raster image to an SVG path representing the detected boundary.
 * This uses a simple contour tracing strategy that prioritizes enclosed
 * interior regions for white-background line art.
 */

export interface VectorizeResult {
  pathData: string;
  width: number;
  height: number;
}

/**
 * Extracts the outer boundary path from a raster image
 * @param imageUrl - Data URL of the image to vectorize
 * @returns Promise with the SVG path data and dimensions
 */
export async function rasterToOuterPath(imageUrl: string): Promise<VectorizeResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      try {
        const { pathString, success } = await extractOuterBoundary(imageUrl);
        if (success && pathString) {
          resolve({ pathData: pathString, width, height });
          return;
        }
      } catch (error) {
        console.error('Boundary extraction failed, using fallback.', error);
      }

      const pathData = `M 20 0 
        L ${width - 20} 0 
        Q ${width} 0 ${width} 20 
        L ${width} ${height - 20} 
        Q ${width} ${height} ${width - 20} ${height} 
        L 20 ${height} 
        Q 0 ${height} 0 ${height - 20} 
        L 0 20 
        Q 0 0 20 0 Z`;

      resolve({
        pathData,
        width,
        height,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image for vectorization'));
    img.src = imageUrl;
  });
}
