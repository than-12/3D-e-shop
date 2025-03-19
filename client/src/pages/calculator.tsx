import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import * as THREE from "three";
import { Upload, ArrowRight, Calculator, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import STLViewerBasic from "@/components/stl-viewer-basic";
import { calculatePrintCost, PrintEstimate, formatDuration, formatFileSize } from "@/lib/stl-processor";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { formatPrice } from "@/lib/utils";

const CalculatorPage = () => {
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stlGeometry, setStlGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState("pla");
  const [quality, setQuality] = useState("standard");
  const [infill, setInfill] = useState(20);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimate, setEstimate] = useState<PrintEstimate | null>(null);
  const [modelScreenshot, setModelScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an STL file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file extension
      if (!file.name.toLowerCase().endsWith('.stl')) {
        toast({
          title: "Invalid file format",
          description: "Please upload a valid STL file.",
          variant: "destructive",
        });
        return;
      }
      
      setStlFile(file);
      setEstimate(null);
    }
  };
  
  const handleGeometryLoaded = (geometry: THREE.BufferGeometry, screenshot?: string) => {
    console.log("STL geometry loaded successfully");
    
    // Αποθηκεύουμε το στιγμιότυπο του μοντέλου εάν παρέχεται
    if (screenshot) {
      console.log("Received 3D model screenshot");
      setModelScreenshot(screenshot);
    }
    
    // Βεβαιωνόμαστε ότι η γεωμετρία έχει έγκυρα δεδομένα
    if (!geometry || !geometry.attributes || !geometry.attributes.position) {
      console.error("Invalid geometry received:", geometry);
      toast({
        title: "Σφάλμα",
        description: "Το 3D μοντέλο δεν μπορεί να επεξεργαστεί σωστά. Παρακαλώ δοκιμάστε διαφορετικό αρχείο.",
        variant: "destructive",
      });
      setStlGeometry(null); // Καθαρίζουμε το state για να αποφύγουμε προβλήματα
      return;
    }
    
    try {
      // Υπολογίζουμε μερικά βασικά στατιστικά για τη γεωμετρία
      const triangleCount = geometry.attributes.position.count / 3;
      console.log(`3D model has ${triangleCount} triangles`);
      
      if (triangleCount <= 0) {
        console.error("Geometry has no triangles");
        toast({
          title: "Μη έγκυρο μοντέλο",
          description: "Το αρχείο που ανεβάσατε δεν περιέχει έγκυρα 3D δεδομένα.",
          variant: "destructive",
        });
        setStlGeometry(null);
        return;
      }
      
      // Βεβαιωνόμαστε ότι υπάρχει bounding box
      if (!geometry.boundingBox) {
        console.log("Computing bounding box for geometry");
        geometry.computeBoundingBox();
      }
      
      if (!geometry.boundingBox) {
        console.error("Failed to compute bounding box");
        toast({
          title: "Επεξεργασία προβλήματος",
          description: "Αδυναμία υπολογισμού διαστάσεων του μοντέλου.",
          variant: "destructive",
        });
        setStlGeometry(null);
        return;
      }
      
      // Δημιουργούμε αντίγραφο της γεωμετρίας για να αποφύγουμε προβλήματα με αναφορές
      const geometryClone = geometry.clone();
      
      // Αποθηκεύουμε τη γεωμετρία για μελλοντική χρήση
      setStlGeometry(geometryClone);
      console.log("Geometry stored in state");
      
      toast({
        title: "Επιτυχής φόρτωση",
        description: "Το 3D μοντέλο φορτώθηκε επιτυχώς και είναι έτοιμο για υπολογισμό κόστους.",
      });
    } catch (error) {
      console.error("Error processing geometry:", error);
      toast({
        title: "Σφάλμα επεξεργασίας",
        description: "Προέκυψε σφάλμα κατά την ανάλυση του 3D μοντέλου.",
        variant: "destructive",
      });
      setStlGeometry(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an STL file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file extension
      if (!file.name.toLowerCase().endsWith('.stl')) {
        toast({
          title: "Invalid file format",
          description: "Please upload a valid STL file.",
          variant: "destructive",
        });
        return;
      }
      
      setStlFile(file);
      setEstimate(null);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const clearFile = () => {
    setStlFile(null);
    setStlGeometry(null);
    setEstimate(null);
    setModelScreenshot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const calculateCost = async () => {
    if (!stlFile || !stlGeometry) {
      toast({
        title: "No file uploaded",
        description: "Please upload an STL file first.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Starting cost calculation for:", stlFile.name);
    setIsCalculating(true);
    
    try {
      // Έλεγχος αν η γεωμετρία έχει έγκυρα δεδομένα
      if (!stlGeometry.attributes || !stlGeometry.attributes.position) {
        throw new Error("Invalid geometry data");
      }
      
      console.log("Calling calculatePrintCost with params:", {
        fileName: stlFile.name,
        fileSize: stlFile.size,
        material,
        quality,
        infill,
        triangles: stlGeometry.attributes.position.count / 3
      });
      
      const estimateResult = await calculatePrintCost(
        stlFile, 
        stlGeometry, 
        material, 
        quality, 
        infill
      );
      
      console.log("Received cost estimate:", estimateResult);
      setEstimate(estimateResult);
      
      toast({
        title: "Calculation complete",
        description: `Estimated cost: $${estimateResult.totalCost.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Error calculating cost:", error);
      
      let errorMessage = "Failed to calculate print cost.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof Response) {
        errorMessage = `Server error: ${error.status}`;
      }
      
      toast({
        title: "Calculation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const addToCart = async () => {
    if (!estimate) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ υπολογίστε πρώτα το κόστος εκτύπωσης.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Αποθήκευση του screenshot σε τοπική μεταβλητή για καλύτερο έλεγχο
      const currentScreenshot = modelScreenshot;
      console.log("Screenshot before sending to API:", currentScreenshot ? `${currentScreenshot.substring(0, 50)}...` : 'No screenshot');
      
      // Δημιουργία του custom print με τα metadata
      const response = await apiRequest('POST', '/api/custom-prints', {
        fileName: estimate.fileName,
        fileSize: estimate.fileSize,
        material: estimate.material,
        quality: estimate.quality,
        infill: estimate.infill,
        volume: estimate.volume.toString(),
        weight: estimate.weight.toString(),
        printTime: estimate.printTime,
        complexity: estimate.complexity,
        materialCost: estimate.materialCost.toString(),
        printTimeCost: estimate.printTimeCost.toString(),
        setupFee: estimate.setupFee.toString(),
        totalCost: estimate.totalCost.toString(),
        stlMetadata: estimate.stlMetadata,
        photoUrl: currentScreenshot || undefined, // Προσθήκη του στιγμιότυπου, εάν υπάρχει
        status: 'pending'
      });
      
      const customPrint = await response.json();
      console.log("Created custom print:", customPrint);
      
      if (!customPrint || !customPrint.id) {
        throw new Error("Δεν ήταν δυνατή η δημιουργία του custom print");
      }
      
      // Δημιουργία των δεδομένων για το καλάθι
      const cartData = {
        customPrintId: customPrint.id,
        quantity: 1,
        productId: null, // Ρητά στέλνουμε null για το productId
        photoUrl: currentScreenshot || undefined // Αποστολή του στιγμιότυπου και στο καλάθι για ασφάλεια
      };
      
      console.log("Sending data to /api/cart:", {
        ...cartData,
        photoUrl: cartData.photoUrl ? "Data URL exists (truncated for logs)" : undefined
      });
      
      try {
        // Χρήση του apiRequest αντί για απευθείας fetch
        const cartResponse = await apiRequest('POST', '/api/cart', cartData);
        const cartResult = await cartResponse.json();
        console.log("Cart response:", cartResult);
        
        // Επιτυχής προσθήκη στο καλάθι
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        
        toast({
          title: "Προστέθηκε στο καλάθι",
          description: "Η προσαρμοσμένη 3D εκτύπωσή σας προστέθηκε στο καλάθι.",
        });
        
        // Καθαρισμός της φόρμας
        setStlFile(null);
        setStlGeometry(null);
        setEstimate(null);
        setModelScreenshot(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία προσθήκης στο καλάθι. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating custom print:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας προσαρμοσμένης εκτύπωσης. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    }
  };
  
  const requestQuote = () => {
    if (!estimate) return;
    
    toast({
      title: "Quote Requested",
      description: "We'll contact you shortly with a detailed quote for your custom print.",
    });
  };
  
  return (
    <section id="calculator" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-base font-semibold text-primary uppercase tracking-wide">Pricing</span>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('calculator.title')}</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Upload your STL file to get an accurate cost estimate based on size, material, and complexity.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="lg:grid lg:grid-cols-2">
            {/* File Upload Section */}
            <div className="p-6 sm:p-10 lg:border-r lg:border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('calculator.upload_stl')}</h2>
              
              {/* File Uploader */}
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                
                {!stlFile ? (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle className="text-xl">{t('calculator.upload_stl')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept=".stl"
                          onChange={handleFileChange}
                        />
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t('calculator.drag_drop')}</h3>
                        <p className="text-sm text-gray-500">{t('calculator.file_requirements')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="relative mb-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-3 truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">{stlFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(stlFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* STL Viewer */}
              <div className="mt-6 mb-8">
                <STLViewerBasic stlFile={stlFile} onLoad={handleGeometryLoaded} />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('calculator.material_selection')}</h3>
                <RadioGroup 
                  value={material} 
                  onValueChange={setMaterial}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="relative">
                    <RadioGroupItem value="pla" id="material-pla" className="peer sr-only" />
                    <Label 
                      htmlFor="material-pla"
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer border-gray-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50"
                    >
                      <span className="w-3 h-3 mr-2 rounded-full bg-blue-500"></span>
                      <div>
                        <div className="font-medium">{t('calculator.pla')}</div>
                        <div className="text-xs text-gray-500">Standard Strength</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem value="abs" id="material-abs" className="peer sr-only" />
                    <Label 
                      htmlFor="material-abs"
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer border-gray-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50"
                    >
                      <span className="w-3 h-3 mr-2 rounded-full bg-red-500"></span>
                      <div>
                        <div className="font-medium">{t('calculator.abs')}</div>
                        <div className="text-xs text-gray-500">High Durability</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem value="petg" id="material-petg" className="peer sr-only" />
                    <Label 
                      htmlFor="material-petg"
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer border-gray-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50"
                    >
                      <span className="w-3 h-3 mr-2 rounded-full bg-green-500"></span>
                      <div>
                        <div className="font-medium">{t('calculator.petg')}</div>
                        <div className="text-xs text-gray-500">Food Safe</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <RadioGroupItem value="tpu" id="material-tpu" className="peer sr-only" />
                    <Label 
                      htmlFor="material-tpu"
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer border-gray-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50"
                    >
                      <span className="w-3 h-3 mr-2 rounded-full bg-purple-500"></span>
                      <div>
                        <div className="font-medium">{t('calculator.tpu')}</div>
                        <div className="text-xs text-gray-500">Flexible</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('calculator.quality_selection')}</h3>
                <div className="mb-6">
                  <RadioGroup value={quality} onValueChange={setQuality}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Layer Height</span>
                      <span className="text-sm text-gray-500">
                        {quality === 'draft' ? '0.3mm (Draft)' : 
                         quality === 'standard' ? '0.2mm (Standard)' : '0.1mm (Fine)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <RadioGroupItem value="draft" id="quality-draft" className="sr-only" />
                      <RadioGroupItem value="standard" id="quality-standard" className="sr-only" />
                      <RadioGroupItem value="fine" id="quality-fine" className="sr-only" />
                      
                      <Label
                        htmlFor="quality-draft"
                        className={`cursor-pointer px-4 py-2 text-xs rounded-l-md border ${
                          quality === 'draft' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t('calculator.draft')}
                      </Label>
                      <Label
                        htmlFor="quality-standard"
                        className={`cursor-pointer px-4 py-2 text-xs border-t border-b ${
                          quality === 'standard' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t('calculator.standard')}
                      </Label>
                      <Label
                        htmlFor="quality-fine"
                        className={`cursor-pointer px-4 py-2 text-xs rounded-r-md border ${
                          quality === 'fine' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t('calculator.fine')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('calculator.infill_density')}</h3>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Strength</span>
                    <span className="text-sm text-gray-500">{infill}% {infill <= 20 ? '(Light)' : infill <= 50 ? '(Standard)' : '(Strong)'}</span>
                  </div>
                  <Slider
                    value={[infill]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(value) => setInfill(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                    <span>10%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button 
                    type="button" 
                    onClick={calculateCost}
                    disabled={isCalculating || !stlFile}
                    className="w-full py-3 font-medium text-lg flex justify-center items-center"
                  >
                    {isCalculating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('calculator.calculating')}
                      </span>
                    ) : estimate ? (
                      t('calculator.recalculate_button')
                    ) : (
                      t('calculator.calculate_button')
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Cost Estimate Section */}
            <div className="p-6 sm:p-10 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('calculator.estimated_cost')}</h2>
              
              {/* No file uploaded state */}
              {!estimate && (
                <div id="no-file-state" className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900">{t('calculator.no_file_analyzed')}</h4>
                  <p className="mt-2 text-gray-500">
                    {t('calculator.upload_file_instructions')}
                  </p>
                </div>
              )}
              
              {/* Results state */}
              {estimate && (
                <div id="results-state">
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg">{estimate.fileName}</h4>
                          <p className="text-sm text-gray-500">{formatFileSize(estimate.fileSize)}</p>
                        </div>
                        <button 
                          type="button" 
                          className="text-gray-400 hover:text-gray-500"
                          onClick={clearFile}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">{t('calculator.volume')}:</span>
                          <span className="font-medium ml-1">{estimate.volume.toFixed(1)} cm³</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('calculator.estimated_weight')}:</span>
                          <span className="font-medium ml-1">{estimate.weight.toFixed(1)} g</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('calculator.estimated_print_time')}:</span>
                          <span className="font-medium ml-1">{formatDuration(estimate.printTime, currentLanguage)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('calculator.complexity')}:</span>
                          <span className="font-medium ml-1">{estimate.complexity}</span>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h5 className="font-medium">Cost Breakdown</h5>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('calculator.material_cost')}:</span>
                            <span>{formatPrice(estimate.materialCost, { locale: currentLanguage === 'el' ? 'el-GR' : 'en-GB' })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('calculator.printing_cost')}:</span>
                            <span>{formatPrice(estimate.printTimeCost, { locale: currentLanguage === 'el' ? 'el-GR' : 'en-GB' })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">{t('calculator.setup_fee')}:</span>
                            <span>{formatPrice(estimate.setupFee, { locale: currentLanguage === 'el' ? 'el-GR' : 'en-GB' })}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-lg">{t('calculator.total_cost')}:</span>
                          <span className="font-bold text-xl text-primary">{formatPrice(estimate.totalCost, { locale: currentLanguage === 'el' ? 'el-GR' : 'en-GB' })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col space-y-4">
                    <Button 
                      type="button"
                      onClick={addToCart}
                      className="py-3 font-medium text-lg flex justify-center items-center bg-amber-500 hover:bg-amber-600"
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      {t('calculator.add_to_cart_estimate')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={requestQuote}
                      className="py-3 font-medium text-lg"
                    >
                      {t('calculator.request_custom_quote')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorPage;


