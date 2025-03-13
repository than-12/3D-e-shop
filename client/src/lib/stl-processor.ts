import * as THREE from "three";

interface STLMetadata {
  triangles: number;
  volume: number; // in cubic centimeters
  surfaceArea: number; // in square centimeters
  dimensions: {
    width: number; // in millimeters
    height: number; // in millimeters
    depth: number; // in millimeters
  };
}

export interface PrintEstimate {
  id?: number;
  fileName: string;
  fileSize: number;
  material: string;
  quality: string;
  infill: number;
  volume: number;
  weight: number;
  printTime: number;
  complexity: string;
  materialCost: number;
  printTimeCost: number;
  setupFee: number;
  totalCost: number;
  stlMetadata: STLMetadata;
}

export const analyzeSTL = (geometry: THREE.BufferGeometry): STLMetadata => {
  // Ensure the geometry's bounding box is computed
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox as THREE.Box3;
  
  // Get dimensions in millimeters
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // Count triangles
  const positions = geometry.getAttribute('position');
  const triangleCount = positions.count / 3;
  
  // Calculate surface area and volume
  let surfaceArea = 0;
  let volume = 0;
  
  if (geometry.index) {
    // For indexed geometry
    const indices = geometry.index.array;
    const positions = geometry.getAttribute('position').array;
    
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
      
      const v0 = new THREE.Vector3(positions[i0], positions[i0 + 1], positions[i0 + 2]);
      const v1 = new THREE.Vector3(positions[i1], positions[i1 + 1], positions[i1 + 2]);
      const v2 = new THREE.Vector3(positions[i2], positions[i2 + 1], positions[i2 + 2]);
      
      // Calculate triangle area
      const triangleArea = getTriangleArea(v0, v1, v2);
      surfaceArea += triangleArea;
      
      // Calculate signed volume contribution of this triangle
      volume += getSignedVolumeContribution(v0, v1, v2);
    }
  } else {
    // For non-indexed geometry
    const positions = geometry.getAttribute('position').array;
    
    for (let i = 0; i < positions.length; i += 9) {
      const v0 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const v1 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
      const v2 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);
      
      // Calculate triangle area
      const triangleArea = getTriangleArea(v0, v1, v2);
      surfaceArea += triangleArea;
      
      // Calculate signed volume contribution of this triangle
      volume += getSignedVolumeContribution(v0, v1, v2);
    }
  }
  
  // Take absolute value of volume (in case the mesh is not properly oriented)
  volume = Math.abs(volume);
  
  // Convert to cm^3
  volume /= 1000; // mm³ to cm³
  surfaceArea /= 100; // mm² to cm²
  
  return {
    triangles: triangleCount,
    volume,
    surfaceArea,
    dimensions: {
      width: size.x,
      height: size.y,
      depth: size.z
    }
  };
};

// Helper function to calculate the area of a triangle
function getTriangleArea(v0: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3): number {
  const side1 = new THREE.Vector3().subVectors(v1, v0);
  const side2 = new THREE.Vector3().subVectors(v2, v0);
  const cross = new THREE.Vector3().crossVectors(side1, side2);
  return 0.5 * cross.length();
}

// Helper function to calculate the signed volume contribution of a triangle
function getSignedVolumeContribution(v0: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3): number {
  const cross = new THREE.Vector3().crossVectors(
    new THREE.Vector3().subVectors(v1, v0),
    new THREE.Vector3().subVectors(v2, v0)
  );
  return v0.dot(cross) / 6.0;
}

export const calculatePrintCost = async (
  stlFile: File,
  geometry: THREE.BufferGeometry,
  material: string,
  quality: string,
  infill: number
): Promise<PrintEstimate> => {
  // Analyze the STL geometry
  const stlMetadata = analyzeSTL(geometry);
  
  // Prepare the request data
  const requestData = {
    fileName: stlFile.name,
    fileSize: stlFile.size,
    material,
    quality,
    infill,
    volume: stlMetadata.volume,
    stlMetadata
  };
  
  try {
    // Send request to API to calculate the cost
    const response = await fetch('/api/custom-prints/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const estimate = await response.json();
    
    // Format the estimate for display
    return {
      id: estimate.id,
      fileName: estimate.fileName,
      fileSize: estimate.fileSize,
      material: estimate.material,
      quality: estimate.quality,
      infill: estimate.infill,
      volume: parseFloat(estimate.volume),
      weight: parseFloat(estimate.weight),
      printTime: estimate.printTime,
      complexity: estimate.complexity,
      materialCost: parseFloat(estimate.materialCost),
      printTimeCost: parseFloat(estimate.printTimeCost),
      setupFee: parseFloat(estimate.setupFee),
      totalCost: parseFloat(estimate.totalCost),
      stlMetadata: estimate.stlMetadata
    };
  } catch (error) {
    console.error('Error calculating print cost:', error);
    throw new Error('Failed to calculate print cost. Please try again later.');
  }
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${remainingMinutes}m`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
