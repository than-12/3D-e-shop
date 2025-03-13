import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  CreditCard, 
  Package, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "Valid ZIP code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  
  // Payment details
  cardName: z.string().min(3, { message: "Name on card is required" }),
  cardNumber: z.string().min(13, { message: "Valid card number is required" })
    .max(19, { message: "Card number is too long" })
    .refine((val) => /^[0-9]+$/.test(val), { 
      message: "Card number can only contain digits" 
    }),
  expiryDate: z.string().min(5, { message: "Valid expiry date is required (MM/YY)" })
    .refine((val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
      message: "Expiry date should be in MM/YY format"
    }),
  cvv: z.string().min(3, { message: "Valid CVV is required" })
    .max(4, { message: "CVV is too long" })
    .refine((val) => /^[0-9]+$/.test(val), { 
      message: "CVV can only contain digits" 
    }),
  
  saveInfo: z.boolean().default(false),
  marketing: z.boolean().default(false),
  shippingNotes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['/api/cart'],
  });
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "GR",
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      saveInfo: false,
      marketing: false,
      shippingNotes: "",
    },
  });
  
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price.toString());
      return total + (price * item.quantity);
    }, 0);
  };
  
  const calculateTaxes = (subtotal: number) => {
    // Example tax rate of 7%
    return subtotal * 0.07; 
  };
  
  const calculateShipping = (subtotal: number) => {
    // Free shipping over €100, otherwise €12.95
    // Based in Greece, serving all of Europe
    return subtotal > 100 ? 0 : 12.95;
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    const shipping = calculateShipping(subtotal);
    
    return subtotal + taxes + shipping;
  };
  
  const onSubmit = async (values: CheckoutFormValues) => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      });
      setLocation("/products");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create order
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      const shippingAddress = `${values.address}, ${values.city}, ${values.state} ${values.zipCode}, ${values.country}`;
      
      await apiRequest('POST', '/api/orders', {
        order: {
          totalAmount: calculateTotal().toString(),
          shippingAddress,
          contactEmail: values.email,
          contactPhone: values.phone,
          status: 'pending',
        },
        items: orderItems,
      });
      
      // Clear cart
      await apiRequest('DELETE', '/api/cart', undefined);
      
      // Invalidate cart query
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      // Show success message
      setCompleted(true);
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-200 rounded-lg h-96 mb-4"></div>
            </div>
            <div>
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (completed) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="text-center">
          <CardHeader>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>Thank you for your purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your order has been received and is being processed. You will receive a confirmation 
              email shortly with your order details.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium">Order Number: ORD-{Math.floor(Math.random() * 10000)}</p>
              <p className="text-sm text-gray-500">Please save this for your reference</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => setLocation("/")}>
              Return to Home
            </Button>
            <Button onClick={() => setLocation("/products")}>
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const isEmpty = !cartItems || cartItems.length === 0;
  
  if (isEmpty) {
    setLocation("/cart");
    return null;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="pl-0" 
          onClick={() => setLocation("/cart")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Checkout</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>
                Enter your details for shipping your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, Apt 4B" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GR">Greece</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="IT">Italy</SelectItem>
                              <SelectItem value="ES">Spain</SelectItem>
                              <SelectItem value="PT">Portugal</SelectItem>
                              <SelectItem value="BE">Belgium</SelectItem>
                              <SelectItem value="NL">Netherlands</SelectItem>
                              <SelectItem value="AT">Austria</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="IE">Ireland</SelectItem>
                              <SelectItem value="DK">Denmark</SelectItem>
                              <SelectItem value="SE">Sweden</SelectItem>
                              <SelectItem value="FI">Finland</SelectItem>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shippingNotes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Shipping Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Special delivery instructions" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="cardName"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Name on Card</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input placeholder="1234 5678 9012 3456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormDescription>
                              3 or 4 digit code on the back of your card
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="saveInfo"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Save this information for next time</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="marketing"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Email me about new products, offers, and 3D printing tips
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-1">
                      <span className="text-gray-900 font-medium">
                        {item.quantity} x {item.product.name}
                      </span>
                    </div>
                    <div className="text-right">
                      €{(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>€{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {calculateShipping(calculateSubtotal()) === 0 
                      ? 'Free' 
                      : `€${calculateShipping(calculateSubtotal()).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (estimated)</span>
                  <span>${calculateTaxes(calculateSubtotal()).toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <Package className="h-4 w-4" />
                <span>Free shipping on orders over €100</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>We accept all major credit cards</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
