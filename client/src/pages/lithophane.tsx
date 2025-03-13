import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Schema for the lithophane form
const formSchema = z.object({
  imageFile: z.instanceof(File),
  width: z.number().min(50).max(200),
  height: z.number().min(50).max(200),
  thickness: z.number().min(1).max(5),
  baseThickness: z.number().min(0.5).max(3),
  material: z.enum(["PLA", "ABS", "PETG", "TPU"]),
  quality: z.enum(["draft", "standard", "fine"]),
  infill: z.number().min(10).max(100),
  border: z.boolean().default(true),
  borderWidth: z.number().min(1).max(10).optional(),
  borderHeight: z.number().min(1).max(10).optional(),
  invertImage: z.boolean().default(false),
  negative: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function LithophanePage() {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      width: 100,
      height: 100,
      thickness: 3,
      baseThickness: 1,
      material: "PLA",
      quality: "fine",
      infill: 15,
      border: true,
      borderWidth: 5,
      borderHeight: 5,
      invertImage: false,
      negative: false,
    },
  });
  
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Preview the image
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Set the value in the form
    form.setValue("imageFile", file);
    
    // Reset cost estimate when a new file is selected
    setCostEstimate(null);
  }, [form, toast]);
  
  const calculateCost = useCallback(async (values: FormValues) => {
    setIsCalculating(true);
    try {
      // Create form data with image file and lithophane parameters
      const imageFile = values.imageFile;
      
      // Basic lithophane details for cost calculation
      const lithophaneDetails = {
        imageName: imageFile.name,
        imageSize: imageFile.size,
        imageFormat: imageFile.type.split('/')[1],
        width: values.width,
        height: values.height,
        thickness: values.thickness,
        baseThickness: values.baseThickness,
        material: values.material,
        quality: values.quality,
        infill: values.infill,
        border: values.border,
        borderWidth: values.border ? values.borderWidth : null,
        borderHeight: values.border ? values.borderHeight : null,
        invertImage: values.invertImage,
        negative: values.negative,
      };
      
      // Call the lithophane cost calculation API
      const estimate = await apiRequest('/api/lithophanes/calculate', 'POST', lithophaneDetails);
      
      setCostEstimate(estimate);
    } catch (error) {
      console.error("Error calculating lithophane cost:", error);
      toast({
        title: "Error",
        description: "Failed to calculate the lithophane cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  }, [toast]);
  
  const submitLithophaneOrder = useCallback(async (values: FormValues) => {
    if (!costEstimate) {
      toast({
        title: "Calculate cost first",
        description: "Please calculate the cost before submitting your order",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert the image to base64 for preview
      const imageFile = values.imageFile;
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onload = async () => {
        const imagePreview = reader.result as string;
        
        // Prepare the data for submission
        const lithophaneData = {
          ...costEstimate,
          imagePreview
        };
        
        delete lithophaneData.id; // Remove the preview ID
        
        // Submit the lithophane order
        const response = await apiRequest('/api/lithophanes', 'POST', lithophaneData);
        
        toast({
          title: "Order Submitted",
          description: "Your lithophane order has been successfully submitted!",
        });
        
        // Reset the form
        form.reset();
        setPreviewUrl(null);
        setCostEstimate(null);
      };
    } catch (error) {
      console.error("Error submitting lithophane order:", error);
      toast({
        title: "Error",
        description: "Failed to submit your lithophane order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [costEstimate, form, toast]);
  
  const onSubmit = async (values: FormValues) => {
    if (costEstimate) {
      await submitLithophaneOrder(values);
    } else {
      await calculateCost(values);
    }
  };
  
  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    form.reset();
    setPreviewUrl(null);
    setCostEstimate(null);
  };
  
  const showBorderControls = form.watch("border");
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-6">Create Custom Lithophane</h1>
      <p className="text-center mb-12 text-lg max-w-3xl mx-auto">
        Upload your favorite photo and create a beautiful 3D lithophane. A lithophane is a 3D printed image 
        that reveals its detail when backlit. Perfect for unique gifts, night lights, or window decorations.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Lithophane Preview */}
        <Card className="shadow-md h-max">
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
            <CardDescription>
              Upload your image to create a lithophane
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden"
              style={{ height: "300px" }}
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain" 
                />
              ) : (
                <div className="text-center p-8">
                  <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Drag and drop an image or click to upload
                  </p>
                </div>
              )}
            </div>
            
            <Input 
              type="file" 
              id="imageUpload"
              accept="image/*"
              className="mt-4"
              onChange={handleImageChange}
            />
            
            {costEstimate && (
              <div className="mt-6 bg-muted p-4 rounded-lg">
                <h3 className="font-bold mb-2">Cost Estimate</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Material Cost:</div>
                  <div className="text-right">${costEstimate.materialCost}</div>
                  
                  <div>Print Time Cost:</div>
                  <div className="text-right">${costEstimate.printTimeCost}</div>
                  
                  <div>Setup Fee:</div>
                  <div className="text-right">${costEstimate.setupFee}</div>
                  
                  <Separator className="col-span-2 my-1" />
                  
                  <div className="font-bold">Total Cost:</div>
                  <div className="text-right font-bold">${costEstimate.totalCost}</div>
                  
                  <div className="col-span-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Estimated print time: {Math.floor(costEstimate.printTime / 60)} hours {costEstimate.printTime % 60} minutes
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Right Column - Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lithophane Details</CardTitle>
            <CardDescription>
              Customize your lithophane settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (mm)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={50}
                              max={200}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="text-center">{field.value} mm</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (mm)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={50}
                              max={200}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="text-center">{field.value} mm</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="thickness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Thickness (mm)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={1}
                              max={5}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="text-center">{field.value} mm</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="baseThickness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Thickness (mm)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={0.5}
                              max={3}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="text-center">{field.value} mm</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PLA" id="pla" />
                            <Label htmlFor="pla">PLA</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ABS" id="abs" />
                            <Label htmlFor="abs">ABS</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PETG" id="petg" />
                            <Label htmlFor="petg">PETG</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TPU" id="tpu" />
                            <Label htmlFor="tpu">TPU</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Print Quality</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="draft" id="draft" />
                            <Label htmlFor="draft">Draft</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard">Standard</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fine" id="fine" />
                            <Label htmlFor="fine">Fine</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Fine quality is recommended for lithophanes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="infill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Infill Percentage</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={10}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                          <div className="text-center">{field.value}%</div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        15-20% is recommended for lithophanes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="border"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Add Border</FormLabel>
                        <FormDescription>
                          Add a raised border around the lithophane
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {showBorderControls && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="borderWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Border Width (mm)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value || 5]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                              <div className="text-center">{field.value || 5} mm</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="borderHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Border Height (mm)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value || 5]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                              <div className="text-center">{field.value || 5} mm</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invertImage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Invert Image</FormLabel>
                          <FormDescription>
                            Invert light and dark areas
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="negative"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Negative Image</FormLabel>
                          <FormDescription>
                            Create a negative of the image
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={isCalculating || isSubmitting}
                  >
                    Reset
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={!form.getValues().imageFile || isCalculating || isSubmitting}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : costEstimate ? (
                      "Order Lithophane"
                    ) : (
                      "Calculate Cost"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}