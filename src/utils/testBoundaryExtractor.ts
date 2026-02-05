// Manual test for rasterBoundaryExtractor
// Run this in browser console to test the boundary extraction

import { extractOuterBoundary } from './rasterBoundaryExtractor';

export async function testBoundaryExtraction() {
  // Create a canvas with a simple shape
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  // Draw a simple rectangle
  ctx.fillStyle = 'blue';
  ctx.fillRect(20, 20, 60, 60);

  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/png');
  
  console.log('Testing boundary extraction...');
  const result = await extractOuterBoundary(dataUrl);
  
  if (result.success) {
    console.log('✓ Extraction successful!');
    console.log('Path data:', result.pathString.substring(0, 200) + '...');
    console.log('Path length:', result.pathString.length);
  } else {
    console.error('✗ Extraction failed');
  }
  
  return result;
}
