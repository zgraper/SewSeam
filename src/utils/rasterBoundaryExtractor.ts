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
  
  for (let row = 0; row < height; row++) {
    grid[row] = [];
    for (let col = 0; col < width; col++) {
      const pixelIndex = (row * width + col) * 4;
      const alpha = data[pixelIndex + 3];
      
      // Check if pixel is visible (has some opacity)
      grid[row][col] = alpha > 30;
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
 */
function walkPerimeter(grid: boolean[][], start: Point2D): Point2D[] {
  const points: Point2D[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  
  const visited = new Set<string>();
  const queue: Point2D[] = [start];
  
  // Directions: right, down, left, up, and diagonals
  const directions = [
    { col: 1, row: 0 },   // right
    { col: 0, row: 1 },   // down
    { col: -1, row: 0 },  // left
    { col: 0, row: -1 },  // up
    { col: 1, row: 1 },   // down-right
    { col: -1, row: 1 },  // down-left
    { col: 1, row: -1 },  // up-right
    { col: -1, row: -1 }, // up-left
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.col},${current.row}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    // Check if this is a boundary pixel (has at least one empty neighbor)
    let isBoundary = false;
    for (const dir of directions) {
      const neighborCol = current.col + dir.col;
      const neighborRow = current.row + dir.row;
      
      if (
        neighborCol < 0 || neighborCol >= cols ||
        neighborRow < 0 || neighborRow >= rows ||
        !grid[neighborRow][neighborCol]
      ) {
        isBoundary = true;
        break;
      }
    }
    
    if (isBoundary) {
      points.push(current);
    }
    
    // Add occupied neighbors to queue
    for (const dir of directions) {
      const neighborCol = current.col + dir.col;
      const neighborRow = current.row + dir.row;
      
      if (
        neighborCol >= 0 && neighborCol < cols &&
        neighborRow >= 0 && neighborRow < rows &&
        grid[neighborRow][neighborCol]
      ) {
        const neighborKey = `${neighborCol},${neighborRow}`;
        if (!visited.has(neighborKey)) {
          queue.push({ col: neighborCol, row: neighborRow });
        }
      }
    }
  }
  
  return points;
}

/**
 * Reduces the number of points while preserving shape
 */
function simplifyPointSequence(points: Point2D[]): Point2D[] {
  if (points.length <= 3) return points;
  
  const simplified: Point2D[] = [];
  
  // Keep every Nth point and points where direction changes significantly
  for (let i = 0; i < points.length; i += 5) {
    simplified.push(points[i]);
  }
  
  // Always include last point
  if (simplified[simplified.length - 1] !== points[points.length - 1]) {
    simplified.push(points[points.length - 1]);
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
