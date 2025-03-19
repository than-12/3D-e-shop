import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface STLViewerProps {
  stlFile: File | null;
  onLoad?: (geometry: THREE.BufferGeometry) => void;
}

const STLViewerIframe = ({ stlFile, onLoad }: STLViewerProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Δημιουργεί URL για το STL αρχείο όταν το αρχείο αλλάζει
  useEffect(() => {
    if (stlFile) {
      setLoading(true);
      setError(null);
      
      // Καθαρίζουμε τυχόν προηγούμενο URL
      if (url) {
        URL.revokeObjectURL(url);
      }
      
      try {
        // Δημιουργούμε νέο URL για το αρχείο
        const fileUrl = URL.createObjectURL(stlFile);
        console.log("Created URL for STL file:", fileUrl);
        setUrl(fileUrl);
        
        // Φορτώνουμε το STL και εξάγουμε πληροφορίες γεωμετρίας
        if (onLoad) {
          const loader = new STLLoader();
          const reader = new FileReader();
          
          reader.onload = (event) => {
            if (event.target && event.target.result) {
              try {
                const arrayBuffer = event.target.result as ArrayBuffer;
                const geometry = loader.parse(arrayBuffer);
                console.log("STL parsed successfully");
                
                // Κλωνοποιούμε τη γεωμετρία για να αποφύγουμε προβλήματα αναφοράς
                const geometryClone = geometry.clone();
                onLoad(geometryClone);
                setLoading(false);
              } catch (parseError) {
                console.error("Failed to parse STL file:", parseError);
                setError("Σφάλμα στην ανάλυση του STL αρχείου. Δοκιμάστε άλλο αρχείο.");
                setLoading(false);
              }
            }
          };
          
          reader.onerror = () => {
            console.error("Error reading STL file");
            setError("Σφάλμα κατά την ανάγνωση του αρχείου.");
            setLoading(false);
          };
          
          reader.readAsArrayBuffer(stlFile);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error creating URL for STL file:", error);
        setError("Σφάλμα δημιουργίας προεπισκόπησης για το STL αρχείο.");
        setLoading(false);
      }
    } else {
      // Καθαρίζουμε το URL όταν δεν υπάρχει αρχείο
      if (url) {
        URL.revokeObjectURL(url);
        setUrl(null);
      }
    }
    
    // Cleanup function
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [stlFile, onLoad]);
  
  // Χειρισμός φόρτωσης του iframe
  const handleIframeLoad = () => {
    if (loading) {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-0 relative">
        <div className="w-full h-80 rounded-md overflow-hidden bg-white">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <span className="ml-2 text-lg font-medium">Φόρτωση μοντέλου...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center p-4">
                <p className="text-red-500 font-medium">{error}</p>
                <p className="mt-2 text-sm text-gray-600">Δοκιμάστε να ανεβάσετε διαφορετικό STL αρχείο.</p>
              </div>
            </div>
          )}
          
          {!stlFile && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center p-4">
                <p className="text-gray-500 font-medium">Ανεβάστε ένα STL αρχείο για να δείτε το 3D μοντέλο</p>
              </div>
            </div>
          )}
          
          {url && !error && (
            <iframe 
              ref={iframeRef}
              src={`https://viewstl.com/?url=${url}`}
              onLoad={handleIframeLoad}
              style={{ width: "100%", height: "100%", border: "none" }} 
              title="STL Viewer"
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default STLViewerIframe; 