# PNG/JPG to SVG Conversion Feature

## Overview
This feature automatically converts uploaded PNG and JPG pattern images into SVG vector paths representing the outer boundary of the pattern.

## How It Works

### 1. Upload Process
When a user uploads a PNG or JPG file:
- The image is loaded into memory as a data URL
- The `extractOuterBoundary()` function is called to analyze the image
- The converted SVG path is stored in the pattern's `convertedPathData` property

### 2. Boundary Extraction Algorithm
The extraction process follows these steps:

1. **Canvas Rendering**: Image is drawn to an offscreen canvas
2. **Pixel Grid Analysis**: Creates a 2D boolean grid marking occupied (visible) pixels
3. **Perimeter Detection**: Walks through pixels to find boundary points
4. **Point Simplification**: Reduces point count while preserving shape
5. **SVG Path Generation**: Converts coordinates to SVG path format

### 3. Region Creation
After conversion:
- The Workspace component detects the `convertedPathData` property
- Automatically creates a fillable region from the converted path
- Region can be filled with fabric patterns just like SVG paths

## Implementation Files

- `src/utils/rasterBoundaryExtractor.ts` - Core conversion logic
- `src/components/ToolsPanel.tsx` - Triggers conversion on upload
- `src/components/Workspace.tsx` - Creates regions from converted paths
- `src/store.ts` - Stores converted path data

## Usage

1. Click "Upload Pattern" button
2. Select a PNG or JPG file with a clear pattern shape
3. The app automatically extracts the boundary
4. Pattern appears in the Library panel
5. Click the pattern to load it in the workspace
6. A fillable region is created from the outer boundary
7. Upload a fabric and it will fill the pattern region

## Limitations (v1)

- Extracts only the outer boundary (ignores internal details)
- Text, seam allowances, and markings are ignored
- Works best with high-contrast patterns
- Prioritizes clean geometry over perfect detail
