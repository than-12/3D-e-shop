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
import STLViewer from "@/components/stl-viewer";
import { calculatePrintCost, PrintEstimate, formatDuration, formatFileSize } from "@/lib/stl-processor";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CalculatorPage = () => {
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stlGeometry, setStlGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState("pla");
  const [quality, setQuality] = useState("standard");
  const [infill, setInfill] = useState(20);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimate, setEstimate] = useState<PrintEstimate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
  
  const handleGeometryLoaded = (geometry: THREE.BufferGeometry) => {
    setStlGeometry(geometry);
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
    
    setIsCalculating(true);
    
    try {
      const estimateResult = await calculatePrintCost(
        stlFile, 
        stlGeometry, 
        material, 
        quality, 
        infill
      );
      
      setEstimate(estimateResult);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate print cost.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const addToCart = async () => {
    if (!estimate) return;
    
    try {
      await apiRequest('POST', '/api/custom-prints', {
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
        status: 'pending'
      });
      
      await apiRequest('POST', '/api/cart', {
        productId: null,
        customPrintId: estimate.id,
        quantity: 1
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Added to Cart",
        description: "Your custom print has been added to the cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add custom print to cart. Please try again.",
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
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">Get an Instant Cost Estimate</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Upload your STL file to get an accurate cost estimate based on size, material, and complexity.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="lg:grid lg:grid-cols-2">
            {/* File Upload Section */}
            <div className="p-6 sm:p-10 lg:border-r lg:border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your STL File</h2>
              
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
                  <div 
                    className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
                    onClick={triggerFileInput}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700">
                          <span>Upload a file</span>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        STL files up to 50MB
                      </p>
                    </div>
                  </div>
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
                <STLViewer stlFile={stlFile} onLoad={handleGeometryLoaded} />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Selection</h3>
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
                        <div className="font-medium">PLA</div>
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
                        <div className="font-medium">ABS</div>
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
                        <div className="font-medium">PETG</div>
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
                        <div className="font-medium">TPU</div>
                        <div className="text-xs text-gray-500">Flexible</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Settings</h3>
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
                        Draft
                      </Label>
                      <Label
                        htmlFor="quality-standard"
                        className={`cursor-pointer px-4 py-2 text-xs border-t border-b ${
                          quality === 'standard' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Standard
                      </Label>
                      <Label
                        htmlFor="quality-fine"
                        className={`cursor-pointer px-4 py-2 text-xs rounded-r-md border ${
                          quality === 'fine' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Fine
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Infill Density</h3>
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
                      <>Calculating...</>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-5 w-5" />
                        Calculate Cost
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Cost Estimate Section */}
            <div className="p-6 sm:p-10 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Estimate</h2>
              
              {/* No file uploaded state */}
              {!estimate && (
                <div id="no-file-state" className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900">No File Analyzed Yet</h4>
                  <p className="mt-2 text-gray-500">
                    Upload your STL file and click "Calculate Cost" to get an instant cost estimate 
                    based on volume, material, and print settings.
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
                          <span className="text-gray-500">Volume:</span>
                          <span className="font-medium ml-1">{estimate.volume.toFixed(1)} cm³</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Weight:</span>
                          <span className="font-medium ml-1">{estimate.weight.toFixed(1)} g</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Print Time:</span>
                          <span className="font-medium ml-1">{formatDuration(estimate.printTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Complexity:</span>
                          <span className="font-medium ml-1">{estimate.complexity}</span>
                        </div>
                      </div>

                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h5 className="font-medium">Cost Breakdown</h5>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Material Cost:</span>
                            <span>${estimate.materialCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Print Time Cost:</span>
                            <span>${estimate.printTimeCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Setup Fee:</span>
                            <span>${estimate.setupFee.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-lg">Total Estimate:</span>
                          <span className="font-bold text-xl text-primary">${estimate.totalCost.toFixed(2)}</span>
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
                      Add to Cart
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={requestQuote}
                      className="py-3 font-medium text-lg"
                    >
                      Request Custom Quote
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
