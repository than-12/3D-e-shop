import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface STLViewerProps {
  stlFile: File | null;
  onLoad?: (geometry: THREE.BufferGeometry, screenshot?: string) => void;
}

// Σταθερά για τη διάρκεια ισχύος της φόρτωσης σε ms
const FILE_LOAD_VALIDITY_PERIOD = 24 * 60 * 60 * 1000; // 24 ώρες

// Βοηθητική συνάρτηση για δημιουργία μοναδικού ID αρχείου
const createFileID = (file: File): string => {
  return `${file.name}_${file.size}_${file.lastModified}`;
};

const STLViewerBasic = ({ stlFile, onLoad }: STLViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  
  // Στατικό αναγνωριστικό αρχείου που προστατεύει από αλλαγές αναφοράς
  const currentFileId = useMemo(() => 
    stlFile ? createFileID(stlFile) : null, 
    [stlFile ? stlFile.name + stlFile.size + stlFile.lastModified : null]
  );
  
  // Μηχανισμός debounce για την αποφυγή πολλαπλών renders
  const debounceRef = useRef<{
    timeoutId: number | null;
    isProcessing: boolean;
    lastLoadTime: number;
    lastLoadedFileId: string | null;
    geometryLoadedCallback: boolean;
  }>({ 
    timeoutId: null, 
    isProcessing: false, 
    lastLoadTime: 0,
    lastLoadedFileId: null,
    geometryLoadedCallback: false
  });
  
  // Αναφορά για το τρέχον αρχείο που έχει φορτωθεί
  const loadedFileRef = useRef<{
    id: string | null;
    name: string | null;
    loaded: boolean;
    timestamp: number;
  }>({ id: null, name: null, loaded: false, timestamp: 0 });
  
  // Three.js objects ref
  const threeRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    mesh?: THREE.Mesh;
    animationId?: number;
    modelSize?: number;
    modelCenter?: THREE.Vector3;
  }>({});
  
  // Καθαρισμός Three.js πόρων
  const cleanupThreeJS = () => {
    console.log('Καθαρισμός πόρων Three.js');
    
    const { renderer, scene, controls, mesh, animationId } = threeRef.current;
    
    // Ακύρωση animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      threeRef.current.animationId = undefined;
    }
    
    // Καθαρισμός mesh
    if (mesh && scene) {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
      
      threeRef.current.mesh = undefined;
    }
    
    // Καθαρισμός controls
    if (controls) {
      controls.dispose();
      threeRef.current.controls = undefined;
    }
    
    // Καθαρισμός renderer (χωρίς να αφαιρούμε το canvas)
    if (renderer) {
      renderer.dispose();
      threeRef.current.renderer = undefined;
    }
    
    // Καθαρισμός σκηνής
    if (scene) {
      while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
      }
      threeRef.current.scene = undefined;
    }
    
    threeRef.current.camera = undefined;
    setInitialized(false);
    setModelReady(false);
    // Επαναφορά της αναφοράς του αρχείου
    loadedFileRef.current = { id: null, name: null, loaded: false, timestamp: 0 };
    
    // Ακύρωση τυχόν εκκρεμών timeouts
    if (debounceRef.current.timeoutId !== null) {
      window.clearTimeout(debounceRef.current.timeoutId);
      debounceRef.current.timeoutId = null;
    }
    debounceRef.current.isProcessing = false;
  };
  
  // Αρχικοποίηση Three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    
    try {
      console.log('Αρχικοποίηση Three.js');
      
      // Καθαρισμός προηγούμενων πόρων
      cleanupThreeJS();
      
      const width = containerRef.current?.clientWidth || 400;
      const height = containerRef.current?.clientHeight || 320;
      
      // Δημιουργία σκηνής
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      threeRef.current.scene = scene;
      
      // Φωτισμός
      const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);
      
      // Κάμερα
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      camera.position.set(0, 0, 50);
      threeRef.current.camera = camera;
      
      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default'
      });
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Προσθήκη renderer στο div που χρησιμοποιεί το React
      canvasRef.current.innerHTML = '';
      canvasRef.current.appendChild(renderer.domElement);
      threeRef.current.renderer = renderer;
      
      // Controls με διορθωμένη συμπεριφορά
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1; // Μειωμένο για λιγότερο τρεμόπαιγμα
      controls.enableZoom = true;
      controls.zoomSpeed = 0.7; // Αυξημένη ταχύτητα zoom
      controls.autoRotate = false;
      controls.rotateSpeed = 0.5; // Πιο αργή περιστροφή
      controls.enablePan = true;
      controls.panSpeed = 0.7; // Αυξημένη ταχύτητα μετακίνησης
      controls.minDistance = 1; // Μικρότερη ελάχιστη απόσταση για καλύτερο zoom-in
      controls.maxDistance = 1000; // Πολύ μεγαλύτερη μέγιστη απόσταση για zoom-out
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }; // Διαχωρισμός λειτουργιών του ποντικιού
      threeRef.current.controls = controls;
      
      // Animation loop - με σταθερό ρυθμό ανανέωσης
      let lastTime = 0;
      const animate = (time: number) => {
        threeRef.current.animationId = requestAnimationFrame(animate);
        
        // Περιορισμός σε 60fps για σταθερότητα
        const delta = time - lastTime;
        if (delta < 16.7) { // περίπου 60fps
          return;
        }
        lastTime = time;
        
        if (threeRef.current.controls) {
          threeRef.current.controls.update();
        }
        
        if (threeRef.current.renderer && threeRef.current.scene && threeRef.current.camera) {
          threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
        }
      };
      
      animate(0);
      setInitialized(true);
      
      // Resize handler
      const handleResize = () => {
        if (!containerRef.current || !threeRef.current.camera || !threeRef.current.renderer) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        threeRef.current.camera.aspect = width / height;
        threeRef.current.camera.updateProjectionMatrix();
        
        threeRef.current.renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        console.log('Component unmounting, cleaning up');
        window.removeEventListener('resize', handleResize);
        cleanupThreeJS();
      };
      
    } catch (err) {
      console.error('Error initializing Three.js:', err);
      setError(`Σφάλμα αρχικοποίησης 3D: ${err instanceof Error ? err.message : 'Άγνωστο σφάλμα'}`);
      cleanupThreeJS();
    }
  }, [canvasRef.current]);
  
  // Helper function για έλεγχο αν το αρχείο έχει ήδη φορτωθεί
  const hasFileBeenLoaded = useCallback((fileID: string): boolean => {
    const now = Date.now();
    return (
      // Έλεγχος με το μόνιμο σύστημα αναφοράς
      (debounceRef.current.lastLoadedFileId === fileID && 
       now - debounceRef.current.lastLoadTime < FILE_LOAD_VALIDITY_PERIOD) ||
      // Έλεγχος με το σύστημα αναφοράς φόρτωσης
      (loadedFileRef.current.id === fileID && 
       loadedFileRef.current.loaded && 
       now - loadedFileRef.current.timestamp < FILE_LOAD_VALIDITY_PERIOD)
    );
  }, []);
  
  // Βασικός χειριστής φόρτωσης STL αρχείου - μεταφέρθηκε σε useCallback για αποφυγή επαναδημιουργίας
  const loadSTLFile = useCallback((file: File) => {
    if (!initialized || !threeRef.current.scene || !threeRef.current.camera) {
      console.log('ThreeJS δεν είναι αρχικοποιημένο. Αναβολή φόρτωσης STL.');
      return;
    }
    
    if (debounceRef.current.isProcessing) {
      console.log('Ήδη σε εξέλιξη επεξεργασία STL. Παράλειψη...');
      return;
    }
    
    // Δημιουργία μοναδικού ID για το αρχείο
    const fileID = createFileID(file);
    
    // Έλεγχος αν το αρχείο έχει ήδη φορτωθεί με το βελτιωμένο σύστημα ελέγχου
    if (hasFileBeenLoaded(fileID)) {
      console.log(`Το αρχείο ${file.name} έχει ήδη φορτωθεί (ID: ${fileID}). Παραλείπεται η επαναφόρτωση.`);
      
      // Ενημερώνουμε το modelReady αν χρειάζεται
      if (!modelReady && threeRef.current.mesh) {
        setModelReady(true);
      }
      
      // Ενημερώνουμε το timestamp για να παρατείνουμε την εγκυρότητα
      loadedFileRef.current.timestamp = Date.now();
      debounceRef.current.lastLoadTime = Date.now();
      
      return;
    }
    
    console.log(`=== Έναρξη φόρτωσης STL αρχείου: ${file.name} (ID: ${fileID}) ===`);
    
    // Σημειώνουμε ότι έχουμε ξεκινήσει διαδικασία
    debounceRef.current.isProcessing = true;
    debounceRef.current.geometryLoadedCallback = false;
    
    setLoading(true);
    setModelReady(false);
    setError(null);
    
    // Ενημέρωση αναφοράς αρχείου που φορτώνεται
    loadedFileRef.current.id = fileID;
    loadedFileRef.current.name = file.name;
    loadedFileRef.current.loaded = false;
    loadedFileRef.current.timestamp = Date.now();
    
    // Αφαίρεση προηγούμενου mesh
    if (threeRef.current.mesh && threeRef.current.scene) {
      threeRef.current.scene.remove(threeRef.current.mesh);
      
      if (threeRef.current.mesh.geometry) {
        threeRef.current.mesh.geometry.dispose();
      }
      
      if (threeRef.current.mesh.material) {
        if (Array.isArray(threeRef.current.mesh.material)) {
          threeRef.current.mesh.material.forEach(m => m.dispose());
        } else {
          threeRef.current.mesh.material.dispose();
        }
      }
      
      threeRef.current.mesh = undefined;
    }
    
    // Φόρτωση STL
    const loader = new STLLoader();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!threeRef.current.scene || !threeRef.current.camera) {
        console.error('Scene or camera not available');
        setError('Σφάλμα: Η σκηνή 3D δεν είναι διαθέσιμη.');
        setLoading(false);
        debounceRef.current.isProcessing = false;
        return;
      }
      
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file data');
        }
        
        const arrayBuffer = e.target.result as ArrayBuffer;
        const geometry = loader.parse(arrayBuffer);
        
        console.log('STL parsed successfully:', geometry.attributes.position.count / 3, 'triangles');
        
        // Callback - Καλείται μόνο μία φορά
        if (onLoad && !debounceRef.current.geometryLoadedCallback) {
          try {
            const geometryClone = geometry.clone();
            // Θα προσθέσουμε καθυστέρηση για να εξασφαλίσουμε ότι το μοντέλο θα έχει φορτωθεί πλήρως
            setTimeout(() => {
              // Λήψη του στιγμιότυπου μόνο αφού σιγουρευτούμε ότι το μοντέλο έχει φορτωθεί
              const screenshot = captureScreenshot();
              // Κλήση του callback με το στιγμιότυπο (εάν είναι διαθέσιμο)
              onLoad(geometryClone, screenshot || undefined);
            }, 1500); // Καθυστέρηση 1.5 δευτερόλεπτα για να εξασφαλιστεί η σωστή απόδοση
            
            // Σημειώνουμε ότι το callback έχει κληθεί
            debounceRef.current.geometryLoadedCallback = true;
            loadedFileRef.current.loaded = true;
          } catch (callbackError) {
            console.error('Error during onLoad callback:', callbackError);
          }
        }
        
        // Κεντράρισμα και προσαρμογή μεγέθους
        geometry.computeBoundingBox();
        
        if (!geometry.boundingBox) {
          console.warn('No bounding box computed');
          
          // Default material & mesh
          const material = new THREE.MeshStandardMaterial({
            color: 0x3080e8,
            metalness: 0.1,
            roughness: 0.8
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          threeRef.current.scene.add(mesh);
          threeRef.current.mesh = mesh;
          
          // Default camera position
          threeRef.current.camera.position.z = 50;
          
          if (threeRef.current.controls) {
            threeRef.current.controls.target.set(0, 0, 0);
            threeRef.current.controls.update();
          }
        } else {
          // Κεντράρισμα
          const boundingBox = geometry.boundingBox;
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);
          
          // Υπολογισμός κατάλληλης απόστασης κάμερας
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          
          // Αποθήκευση διαστάσεων στο threeRef για να χρησιμοποιηθούν στο resetView
          threeRef.current.modelSize = maxDim;
          threeRef.current.modelCenter = new THREE.Vector3(0, 0, 0);
          
          const fov = threeRef.current.camera.fov * (Math.PI / 180);
          // Ο πολλαπλασιαστής βασίζεται στο μέγεθος του μοντέλου
          const sizeBasedMultiplier = maxDim > 200 ? 1.5 : (maxDim > 100 ? 2 : 2.5);
          let cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
          cameraDistance *= sizeBasedMultiplier; 
          
          // Βεβαιωνόμαστε ότι η απόσταση είναι εντός των ορίων του OrbitControls
          if (threeRef.current.controls) {
            cameraDistance = Math.max(
              threeRef.current.controls.minDistance, 
              Math.min(cameraDistance, threeRef.current.controls.maxDistance * 0.8)
            );
          }
          
          threeRef.current.camera.position.z = cameraDistance;
          
          // Ενημέρωση controls
          if (threeRef.current.controls) {
            threeRef.current.controls.target.set(0, 0, 0);
            threeRef.current.controls.update();
          }
          
          // Material & mesh
          const material = new THREE.MeshStandardMaterial({
            color: 0x3080e8,
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          threeRef.current.scene.add(mesh);
          threeRef.current.mesh = mesh;
        }
        
        // Ενημέρωση των αναφορών φόρτωσης
        const now = Date.now();
        loadedFileRef.current.timestamp = now;
        debounceRef.current.lastLoadTime = now;
        debounceRef.current.lastLoadedFileId = fileID;
        
        // Χρονοκαθυστέρηση για να σταθεροποιηθεί η σκηνή πριν καταργηθεί ο φορτωτής
        setTimeout(() => {
          setLoading(false);
          
          // Καθυστέρηση στην αλλαγή του modelReady για να αποφευχθεί το τρεμόπαιγμα
          setTimeout(() => {
            setModelReady(true);
            debounceRef.current.isProcessing = false;
            console.log(`=== Ολοκλήρωση φόρτωσης STL αρχείου: ${file.name} (ID: ${fileID}) ===`);
          }, 300);
        }, 1000); // Αυξημένος χρόνος αναμονής για πλήρη σταθεροποίηση
        
      } catch (err) {
        console.error('Error processing STL:', err);
        setError(`Σφάλμα επεξεργασίας STL: ${err instanceof Error ? err.message : 'Άγνωστο σφάλμα'}`);
        setLoading(false);
        // Επαναφορά αναφοράς αρχείου σε περίπτωση σφάλματος
        loadedFileRef.current.loaded = false;
        debounceRef.current.isProcessing = false;
      }
    };
    
    reader.onerror = () => {
      setError('Σφάλμα ανάγνωσης αρχείου');
      setLoading(false);
      // Επαναφορά αναφοράς αρχείου σε περίπτωση σφάλματος
      loadedFileRef.current.loaded = false;
      debounceRef.current.isProcessing = false;
    };
    
    reader.readAsArrayBuffer(file);
  }, [initialized, onLoad, hasFileBeenLoaded, modelReady]);
  
  // Φόρτωση STL αρχείου - με μηχανισμό debounce
  useEffect(() => {
    if (!stlFile || !currentFileId) return;
    
    // Ακύρωση τυχόν υπάρχοντος timeout
    if (debounceRef.current.timeoutId !== null) {
      window.clearTimeout(debounceRef.current.timeoutId);
    }
    
    // Έλεγχος αν το αρχείο έχει ήδη φορτωθεί με το βελτιωμένο σύστημα ελέγχου
    if (hasFileBeenLoaded(currentFileId)) {
      console.log(`Το αρχείο ${stlFile.name} έχει ήδη φορτωθεί (ID: ${currentFileId}). Παραλείπεται η επαναφόρτωση στο useEffect.`);
      return;
    }
    
    // Ορίζουμε ένα μικρό timeout για να αποφύγουμε πολλαπλά renders
    debounceRef.current.timeoutId = window.setTimeout(() => {
      console.log(`Ενεργοποίηση φόρτωσης μετά από debounce για το αρχείο: ${stlFile.name}`);
      loadSTLFile(stlFile);
      debounceRef.current.timeoutId = null;
    }, 150); // 150ms debounce
    
    return () => {
      if (debounceRef.current.timeoutId !== null) {
        window.clearTimeout(debounceRef.current.timeoutId);
        debounceRef.current.timeoutId = null;
      }
    };
  }, [stlFile, currentFileId, loadSTLFile, hasFileBeenLoaded]);
  
  // Συνάρτηση επαναφοράς προβολής
  const resetView = useCallback(() => {
    if (!threeRef.current.camera || !threeRef.current.controls) return;
    
    // Επαναφορά κάμερας στην αρχική της θέση
    if (threeRef.current.modelSize) {
      const fov = threeRef.current.camera.fov * (Math.PI / 180);
      const maxDim = threeRef.current.modelSize;
      
      // Ο πολλαπλασιαστής βασίζεται στο μέγεθος του μοντέλου
      const sizeBasedMultiplier = maxDim > 200 ? 1.5 : (maxDim > 100 ? 2 : 2.5);
      let cameraDistance = (maxDim / 2) / Math.tan(fov / 2);
      cameraDistance *= sizeBasedMultiplier;
      
      // Ομαλή μετάβαση στην αρχική θέση
      threeRef.current.camera.position.set(0, 0, cameraDistance);
    } else {
      threeRef.current.camera.position.set(0, 0, 50);
    }
    
    // Επαναφορά του target στο κέντρο
    if (threeRef.current.modelCenter) {
      threeRef.current.controls.target.copy(threeRef.current.modelCenter);
    } else {
      threeRef.current.controls.target.set(0, 0, 0);
    }
    
    threeRef.current.controls.update();
    
    console.log('Προβολή επαναφέρθηκε στο κέντρο');
  }, []);
  
  // Συνάρτηση λήψης στιγμιότυπου του 3D μοντέλου
  const captureScreenshot = useCallback((): string | null => {
    if (!threeRef.current.renderer || !modelReady || !threeRef.current.mesh) {
      console.log('Δεν είναι δυνατή η λήψη στιγμιότυπου: Το μοντέλο δεν είναι έτοιμο');
      return null;
    }
    
    try {
      console.log('Λήψη στιγμιότυπου 3D μοντέλου...');
      
      // Εξασφαλίζουμε ότι η σκηνή έχει ενημερωθεί
      if (threeRef.current.controls) {
        threeRef.current.controls.update();
      }
      
      if (threeRef.current.scene && threeRef.current.camera) {
        // Render την τρέχουσα κατάσταση της σκηνής
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
        
        // Λήψη του στιγμιότυπου ως data URL
        const dataURL = threeRef.current.renderer.domElement.toDataURL('image/png');
        console.log('Στιγμιότυπο δημιουργήθηκε επιτυχώς');
        return dataURL;
      }
    } catch (err) {
      console.error('Σφάλμα κατά τη λήψη στιγμιότυπου:', err);
    }
    
    return null;
  }, [modelReady]);
  
  return (
    <Card>
      <CardContent className="p-0 relative">
        <div 
          ref={containerRef} 
          className="w-full h-80 rounded-md overflow-hidden bg-white"
        >
          {/* Three.js Canvas Container - Το canvasRef χρησιμοποιείται για την προσθήκη του canvas του Three.js */}
          <div ref={canvasRef} className="w-full h-full"></div>
          
          {/* Κουμπί επαναφοράς προβολής - Εμφανίζεται μόνο όταν το μοντέλο είναι έτοιμο */}
          {modelReady && stlFile && !error && (
            <button
              onClick={resetView}
              className="absolute top-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded-md shadow-sm text-sm text-gray-700 hover:bg-opacity-100 z-20"
              title="Επαναφορά προβολής"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          )}
          
          {/* Εμφάνιση οθόνης φόρτωσης - Με opacity 90% για καλύτερη ορατότητα και z-index 30 */}
          {stlFile && loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <span className="ml-2 text-lg font-medium">Φόρτωση μοντέλου...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-30">
              <div className="text-center p-4">
                <p className="text-red-500 font-medium">{error}</p>
                <p className="mt-2 text-sm text-gray-600">Δοκιμάστε να ανανεώσετε τη σελίδα ή να ανεβάσετε διαφορετικό STL αρχείο.</p>
              </div>
            </div>
          )}
          
          {!stlFile && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-30">
              <div className="text-center p-4">
                <p className="text-gray-500 font-medium">Ανεβάστε ένα STL αρχείο για να δείτε το 3D μοντέλο</p>
              </div>
            </div>
          )}
          
          {/* Οδηγίες χρήσης - Σταθερή θέση στο κάτω μέρος, εμφανίζεται μόνο όταν το μοντέλο είναι έτοιμο */}
          {modelReady && stlFile && !error && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-center z-10 pointer-events-none">
              <div className="bg-white bg-opacity-80 px-3 py-1 rounded-md shadow-sm text-sm text-gray-700 pointer-events-auto">
                <strong>{stlFile.name}</strong> - <span className="font-semibold">Περιστροφή:</span> αριστερό κλικ | <span className="font-semibold">Zoom:</span> ροδέλα ποντικιού | <span className="font-semibold">Μετακίνηση:</span> δεξί κλικ
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default STLViewerBasic; 