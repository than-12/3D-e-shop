import * as THREE from "three";
import { formatPrice } from "./utils";

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
  try {
    console.log("Starting STL analysis");
    
    // Επαλήθευση ότι η γεωμετρία είναι έγκυρη
    if (!geometry.attributes || !geometry.attributes.position) {
      throw new Error("Invalid geometry data: missing position attributes");
    }
    
    // Ensure the geometry's bounding box is computed
    if (!geometry.boundingBox) {
      console.log("Computing bounding box");
      geometry.computeBoundingBox();
    }
    
    const boundingBox = geometry.boundingBox;
    if (!boundingBox) {
      throw new Error("Failed to compute bounding box");
    }
    
    // Get dimensions in millimeters
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    console.log("Model size (mm):", size);
    
    // Count triangles
    const positions = geometry.getAttribute('position');
    const triangleCount = positions.count / 3;
    console.log("Triangle count:", triangleCount);
    
    if (triangleCount <= 0) {
      throw new Error("Model has no triangles");
    }
    
    // Calculate surface area and volume
    let surfaceArea = 0;
    let volume = 0;
    
    console.log("Calculating surface area and volume");
    
    if (geometry.index) {
      // For indexed geometry
      console.log("Processing indexed geometry");
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
      console.log("Processing non-indexed geometry");
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
    
    // Check for valid results
    if (isNaN(volume) || volume === 0) {
      console.error("Invalid volume calculated:", volume);
      // Εναλλακτικός υπολογισμός όγκου
      const sizes = size.x * size.y * size.z;
      volume = sizes * 0.3 / 1000; // Χονδρική προσέγγιση (30% του περικλείοντος κύβου)
      console.log("Using fallback volume estimation:", volume);
    }
    
    if (isNaN(surfaceArea) || surfaceArea === 0) {
      console.error("Invalid surface area calculated:", surfaceArea);
      // Εναλλακτικός υπολογισμός επιφάνειας
      surfaceArea = Math.pow(volume * 1000, 2/3) * 6; // Χονδρική προσέγγιση
      console.log("Using fallback surface area estimation:", surfaceArea);
    }
    
    // Convert to cm^3
    volume /= 1000; // mm³ to cm³
    surfaceArea /= 100; // mm² to cm²
    
    console.log("Final calculations - Volume (cm³):", volume, "Surface Area (cm²):", surfaceArea);
    
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
  } catch (error) {
    console.error("Error analyzing STL:", error);
    // Επιστρέφουμε βασικά δεδομένα για να αποφύγουμε το σφάλμα
    return {
      triangles: 0,
      volume: 1, // Ένα λογικό μέγεθος για να συνεχιστεί ο υπολογισμός
      surfaceArea: 6,
      dimensions: {
        width: 10,
        height: 10,
        depth: 10
      }
    };
  }
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
  try {
    // Επαλήθευση ότι η γεωμετρία είναι έγκυρη
    if (!geometry || !geometry.attributes || !geometry.attributes.position) {
      console.error("Invalid geometry object:", geometry);
      throw new Error("Invalid 3D model data");
    }
    
    // Analyze the STL geometry
    console.log("Analyzing STL geometry...");
    const stlMetadata = analyzeSTL(geometry);
    console.log("STL analysis results:", stlMetadata);
    
    // Έλεγχος αν οι διαστάσεις είναι λογικές
    if (stlMetadata.volume <= 0) {
      console.error("Invalid volume calculated:", stlMetadata.volume);
      throw new Error("Could not determine model volume");
    }
    
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
    
    console.log("Sending cost calculation request:", requestData);
    
    // Send request to API to calculate the cost
    try {
      const response = await fetch('/api/custom-prints/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        console.error("API error:", response.status, response.statusText);
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          // Προσπαθούμε να διαβάσουμε το μήνυμα σφάλματος από την απάντηση
          const errorData = await response.text();
          console.error("Error response:", errorData);
          
          // Αν έχουμε ένα μήνυμα JSON, το αναλύουμε
          if (errorData && errorData.startsWith('{')) {
            const parsedError = JSON.parse(errorData);
            if (parsedError && parsedError.message) {
              errorMessage = parsedError.message;
            }
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const estimate = await response.json();
      console.log("Received estimate from API:", estimate);
      
      if (!estimate || typeof estimate !== 'object') {
        throw new Error("Invalid response from server");
      }
      
      // Format the estimate for display and validate all fields are present
      return {
        id: estimate.id,
        fileName: estimate.fileName || stlFile.name, // Fallback to file name if not provided
        fileSize: estimate.fileSize || stlFile.size, // Fallback to file size if not provided
        material: estimate.material || material,
        quality: estimate.quality || quality,
        infill: estimate.infill || infill,
        volume: parseFloat(estimate.volume) || stlMetadata.volume,
        weight: parseFloat(estimate.weight) || (stlMetadata.volume * 1.24), // Simple density approximation for PLA
        printTime: estimate.printTime || 60, // Default to 1 hour if not provided
        complexity: estimate.complexity || "medium",
        materialCost: parseFloat(estimate.materialCost) || 0,
        printTimeCost: parseFloat(estimate.printTimeCost) || 0,
        setupFee: parseFloat(estimate.setupFee) || 0,
        totalCost: parseFloat(estimate.totalCost) || 0,
        stlMetadata: estimate.stlMetadata || stlMetadata
      };
    } catch (apiError) {
      console.error("API request failed:", apiError);
      
      // Σε περίπτωση αποτυχίας επικοινωνίας με το API, κάνουμε έναν τοπικό υπολογισμό
      console.log("Falling back to local cost calculation");
      
      // Υπολογισμός βάρους (υποθέτουμε PLA με πυκνότητα 1.24 g/cm³)
      const density = material === 'abs' ? 1.04 : material === 'petg' ? 1.27 : material === 'tpu' ? 1.21 : 1.24;
      const weight = stlMetadata.volume * density;
      
      // Υπολογισμός χρόνου εκτύπωσης (απλή εκτίμηση)
      const qualityFactor = quality === 'draft' ? 0.6 : quality === 'fine' ? 1.5 : 1;
      const infillFactor = infill / 100 * 0.8 + 0.2; // 20% χρόνος για το περίγραμμα
      const printTime = Math.round(stlMetadata.volume * 2 * qualityFactor * infillFactor);
      
      // Υπολογισμός κόστους σε EUR
      const materialCost = weight * 0.045; // ~4.5 cents per gram
      const printTimeCost = printTime * 0.09 / 60; // ~€5.40 per hour
      const setupFee = 4.5; // €4.50 setup fee
      
      // Complexity based on triangle count
      let complexity = "medium";
      if (stlMetadata.triangles < 5000) complexity = "simple";
      else if (stlMetadata.triangles > 50000) complexity = "complex";
      
      const totalCost = materialCost + printTimeCost + setupFee;
      
      console.log("Local cost calculation:", {
        weight,
        printTime,
        materialCost,
        printTimeCost,
        setupFee,
        totalCost
      });
      
      return {
        id: undefined,
        fileName: stlFile.name,
        fileSize: stlFile.size,
        material,
        quality,
        infill,
        volume: stlMetadata.volume,
        weight,
        printTime,
        complexity,
        materialCost,
        printTimeCost,
        setupFee,
        totalCost,
        stlMetadata
      };
    }
  } catch (error) {
    console.error("Error in calculatePrintCost:", error);
    throw error;
  }
};

export const formatDuration = (minutes: number, locale: string = 'el'): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (locale === 'el') {
    if (hours > 0) {
      return `${hours}ώ ${remainingMinutes}λ`;
    }
    return `${remainingMinutes}λ`;
  } else {
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  }
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
