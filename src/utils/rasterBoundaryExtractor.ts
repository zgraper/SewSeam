// Custom utility for extracting outer boundaries from raster pattern images
// Converts PNG/JPG to clean SVG path representing the fillable shape

interface Point2D {
  col: number;
  row: number;
}

interface BoundaryResult {
  pathString: string;
  success: boolean;
}

/**
 * Analyzes a raster image and extracts the outer boundary as an SVG path
 */
export async function extractOuterBoundary(
  imageDataUrl: string
): Promise<BoundaryResult> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        resolve({ pathString: '', success: false });
        return;
      }

      // Set canvas to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get pixel data
      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Build occupancy grid
      const occupancyGrid = buildOccupancyGrid(pixelData);
      
      // Find starting point on perimeter
      const startPoint = findPerimeterStart(occupancyGrid);
      
      if (!startPoint) {
        resolve({ pathString: '', success: false });
        return;
      }
      
      // Walk the perimeter to collect boundary points
      const perimeterPoints = walkPerimeter(occupancyGrid, startPoint);
      
      // Simplify points to reduce complexity
      const simplified = simplifyPointSequence(perimeterPoints);
      
      // Convert to SVG path string
      const pathString = pointsToSvgPath(simplified);
      
      resolve({ pathString, success: true });
    };
    
    img.onerror = () => {
      resolve({ pathString: '', success: false });
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Creates a 2D grid marking which pixels are occupied (non-transparent)
 */
function buildOccupancyGrid(pixelData: ImageData): boolean[][] {
  const { width, height, data } = pixelData;
  const grid: boolean[][] = [];
  
  // Alpha threshold for considering a pixel as occupied
  const ALPHA_THRESHOLD = 30;
  
  for (let row = 0; row < height; row++) {
    grid[row] = [];
    for (let col = 0; col < width; col++) {
      const pixelIndex = (row * width + col) * 4;
      const alpha = data[pixelIndex + 3];
      
      // Check if pixel is visible (has some opacity)
      grid[row][col] = alpha > ALPHA_THRESHOLD;
    }
  }
  
  return grid;
}

/**
 * Locates the first occupied pixel to start boundary tracing
 */
function findPerimeterStart(grid: boolean[][]): Point2D | null {
  const rows = grid.length;
  if (rows === 0) return null;
  
  const cols = grid[0].length;
  
  // Scan from top-left to find first occupied pixel
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col]) {
        return { col, row };
      }
    }
  }
  
  return null;
}

/**
 * Traces around the perimeter of the shape collecting boundary coordinates
 * Uses a modified Moore-Neighbor contour following algorithm
 */
function walkPerimeter(grid: boolean[][], start: Point2D): Point2D[] {
  const points: Point2D[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Moore neighborhood: 8 directions in clockwise order starting from right
  const directions = [
    { col: 1, row: 0 },   // E
    { col: 1, row: 1 },   // SE
    { col: 0, row: 1 },   // S
    { col: -1, row: 1 },  // SW
    { col: -1, row: 0 },  // W
    { col: -1, row: -1 }, // NW
    { col: 0, row: -1 },  // N
    { col: 1, row: -1 },  // NE
  ];
  
  let current = start;
  let dirIndex = 0; // Start searching from right
  let iterations = 0;
  const maxIterations = rows * cols; // Prevent infinite loops
  
  do {
    points.push({ ...current });
    
    // Search for next boundary pixel in clockwise order
    let found = false;
    for (let i = 0; i < 8; i++) {
      const searchDir = (dirIndex + i) % 8;
      const neighborCol = current.col + directions[searchDir].col;
      const neighborRow = current.row + directions[searchDir].row;
      
      // Check if neighbor is within bounds and occupied
      if (
        neighborCol >= 0 && neighborCol < cols &&
        neighborRow >= 0 && neighborRow < rows &&
        grid[neighborRow][neighborCol]
      ) {
        // Move to this neighbor
        current = { col: neighborCol, row: neighborRow };
        // Update search direction for next iteration
        dirIndex = (searchDir + 6) % 8; // Look back counter-clockwise
        found = true;
        break;
      }
    }
    
    if (!found) break; // No more boundary pixels found
    
    iterations++;
    if (iterations > maxIterations) {
      console.warn('Perimeter walk exceeded max iterations');
      break;
    }
    
    // Stop when we return to start position
  } while (current.col !== start.col || current.row !== start.row || iterations < 2);
  
  return points;
}

/**
 * Reduces the number of points while preserving shape
 */
function simplifyPointSequence(points: Point2D[]): Point2D[] {
  if (points.length <= 3) return points;
  
  // Use adaptive step size based on total points
  const targetPoints = Math.min(200, Math.max(20, Math.floor(points.length / 10)));
  const stepSize = Math.max(1, Math.floor(points.length / targetPoints));
  
  const simplified: Point2D[] = [];
  
  // Sample points at regular intervals
  for (let i = 0; i < points.length; i += stepSize) {
    simplified.push(points[i]);
  }
  
  // Always include last point if not already included
  const lastPoint = points[points.length - 1];
  const lastSimplified = simplified[simplified.length - 1];
  if (lastSimplified.col !== lastPoint.col || lastSimplified.row !== lastPoint.row) {
    simplified.push(lastPoint);
  }
  
  return simplified;
}

/**
 * Converts point array to SVG path data string
 */
function pointsToSvgPath(points: Point2D[]): string {
  if (points.length === 0) return '';
  
  let pathData = `M ${points[0].col} ${points[0].row}`;
  
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].col} ${points[i].row}`;
  }
  
  // Close the path
  pathData += ' Z';
  
  return pathData;
}
