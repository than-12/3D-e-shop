import { useCallback, useState, useEffect } from "react";
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
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";

// Schema for the lithophane form
const formSchema = z.object({
  imageFile: z.instanceof(File),
  size: z.enum(["small", "medium", "large"]),
  shape: z.enum(["sphere", "flat"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function LithophanePage() {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: "medium",
      shape: "flat",
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
  }, [form, toast]);
  
  const getCost = (size: string, shape: string) => {
    const costTable = {
      small: { flat: 17, sphere: 30 },
      medium: { flat: 25, sphere: 40 },
      large: { flat: 35, sphere: 50 },
    };
    return costTable[size as keyof typeof costTable][shape as keyof typeof costTable.small];
  };
  
  const submitLithophaneOrder = useCallback(async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert the image to base64 for preview with compression
      const imageFile = values.imageFile;
      const reader = new FileReader();
      
      // Create a canvas to compress the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Δεν ήταν δυνατή η δημιουργία του canvas context");
      }
      
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Set maximum dimensions
          const maxWidth = 800;
          const maxHeight = 800;
          
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          const cost = getCost(values.size, values.shape);
          
          // Get dimensions based on size
          const dimensions = {
            small: { width: "10", height: "10" },
            medium: { width: "15", height: "15" },
            large: { width: "20", height: "20" }
          };
          
          // Prepare the data for cart
          const lithophaneData = {
            id: `lithophane-${Date.now()}`,
            name: `Custom Lithophane (${values.size} ${values.shape})`,
            price: cost,
            image: compressedBase64,
            imageName: values.imageFile.name,
            imageSize: values.imageFile.size,
            imageFormat: "jpeg",
            thickness: "3",
            width: dimensions[values.size as keyof typeof dimensions].width,
            height: dimensions[values.size as keyof typeof dimensions].height,
            baseThickness: "2",
            material: "PLA",
            quality: "high",
            infill: 100,
            type: "lithophane"
          };
          
          console.log("Προσθήκη lithophane στο καλάθι:", {
            ...lithophaneData,
            image: "base64_data_truncated"
          });
          
          // Add to cart
          await addItem(lithophaneData);
          
          toast({
            title: "Προστέθηκε στο Καλάθι",
            description: "Το lithophane σας προστέθηκε στο καλάθι σας!",
          });
          
          // Reset the form
          form.reset();
          setPreviewUrl(null);
        } catch (error) {
          console.error("Σφάλμα κατά την επεξεργασία της εικόνας:", error);
          toast({
            title: "Σφάλμα",
            description: "Αποτυχία επεξεργασίας της εικόνας. Παρακαλώ δοκιμάστε ξανά.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        }
      };
      
      // Error handling for image loading
      img.onerror = () => {
        console.error("Σφάλμα φόρτωσης εικόνας");
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία φόρτωσης της εικόνας. Παρακαλώ δοκιμάστε με άλλη εικόνα.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      };
      
      // Start the process
      reader.readAsDataURL(imageFile);
      reader.onload = () => {
        img.src = reader.result as string;
      };
      
      // Error handling for file reading
      reader.onerror = () => {
        console.error("Σφάλμα ανάγνωσης αρχείου");
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία ανάγνωσης του αρχείου εικόνας. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      };
    } catch (error) {
      console.error("Σφάλμα προσθήκης lithophane στο καλάθι:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία προσθήκης του lithophane στο καλάθι. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }, [form, toast, addItem]);
  
  const onSubmit = async (values: FormValues) => {
    console.log("Form submitted with values:", values);
    console.log("Form state:", form.formState);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form is dirty:", form.formState.isDirty);
    await submitLithophaneOrder(values);
  };
  
  // Add effect to log form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form field changed:", { name, type, value });
      console.log("Form state:", form.formState);
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    form.reset();
    setPreviewUrl(null);
  };
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-6">{t('lithophane.title')}</h1>
      <p className="text-center mb-12 text-lg max-w-3xl mx-auto">
        {t('lithophane.description')}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Sample Images */}
        <Card className="shadow-md h-max">
          <CardHeader>
            <CardTitle>{t('lithophane.sample_examples')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <img src="/path/to/sample1.jpg" alt="Sample 1" className="w-full h-auto object-cover" />
              <img src="/path/to/sample2.jpg" alt="Sample 2" className="w-full h-auto object-cover" />
              <img src="/path/to/sample3.jpg" alt="Sample 3" className="w-full h-auto object-cover" />
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column - Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('lithophane.lithophane_options')}</CardTitle>
            <CardDescription>
              {t('lithophane.customize_options')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{t('lithophane.lithophane_size')}</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="small"
                            id="size-small"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="size-small"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-center font-medium">{t('lithophane.small')}</span>
                            <span className="text-[0.7rem] text-center text-muted-foreground">
                              10cm x 10cm
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="medium"
                            id="size-medium"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="size-medium"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-center font-medium">{t('lithophane.medium')}</span>
                            <span className="text-[0.7rem] text-center text-muted-foreground">
                              15cm x 15cm
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="large"
                            id="size-large"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="size-large"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-center font-medium">{t('lithophane.large')}</span>
                            <span className="text-[0.7rem] text-center text-muted-foreground">
                              20cm x 20cm
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>{t('lithophane.lithophane_style')}</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="flat"
                            id="shape-flat"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="shape-flat"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-center font-medium">{t('lithophane.flat')}</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="sphere"
                            id="shape-sphere"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="shape-sphere"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="text-center font-medium">{t('lithophane.curved')}</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Label>{t('lithophane.upload_image')}</Label>
                  <div className="grid w-full items-center gap-1.5">
                    <div
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="object-contain w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              resetForm();
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-500"
                            >
                              <path d="M18 6 6 18"></path>
                              <path d="m6 6 12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">{t('lithophane.drag_drop_image')}</p>
                          <p className="text-xs text-gray-400 mt-1">{t('lithophane.image_requirements')}</p>
                        </>
                      )}
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  disabled={isSubmitting || !form.formState.isValid || !previewUrl}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    t('lithophane.add_to_cart_lithophane')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}