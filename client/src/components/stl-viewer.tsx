import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface STLViewerProps {
  stlFile: File | null;
  onLoad?: (geometry: THREE.BufferGeometry) => void;
}

const STLViewer = ({ stlFile, onLoad }: STLViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !stlFile) return;
    
    setLoading(true);
    setError(null);
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 20);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    
    // Load STL file
    const loader = new STLLoader();
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        try {
          const geometry = loader.parse(event.target.result as ArrayBuffer);
          
          // Center geometry
          geometry.computeBoundingBox();
          const boundingBox = geometry.boundingBox as THREE.Box3;
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);
          
          // Fit camera to object
          const size = boundingBox.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
          
          // Add a margin
          cameraZ *= 1.5;
          camera.position.z = cameraZ;
          
          // Set camera near and far planes
          const minZ = boundingBox.min.z;
          const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;
          camera.far = cameraToFarEdge * 3;
          camera.near = cameraZ / 100;
          camera.updateProjectionMatrix();
          
          // Create material and mesh
          const material = new THREE.MeshPhongMaterial({
            color: 0x3080e8,
            specular: 0x111111,
            shininess: 200
          });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          
          // Provide geometry to parent component if needed
          if (onLoad) {
            onLoad(geometry);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error loading STL', err);
          setError('Failed to load the STL file. Make sure it is a valid STL file.');
          setLoading(false);
        }
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(stlFile);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      scene.clear();
      renderer.dispose();
    };
  }, [stlFile, onLoad]);
  
  return (
    <Card>
      <CardContent className="p-0 relative">
        <div 
          ref={containerRef} 
          className="w-full h-80 rounded-md overflow-hidden"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <span className="ml-2 text-lg font-medium">Loading model...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <p className="text-red-500 font-medium">{error}</p>
                <p className="mt-2 text-sm text-gray-600">Try uploading a different STL file.</p>
              </div>
            </div>
          )}
          
          {!stlFile && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <p className="text-gray-500 font-medium">Upload an STL file to view the 3D model</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default STLViewer;
