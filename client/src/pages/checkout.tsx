import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State/Province must be at least 2 characters.",
  }),
  zipCode: z.string().min(5, {
    message: "ZIP/Postal code must be at least 5 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  paymentMethod: z.enum(["credit_card", "paypal"]),
  cardName: z.string().min(2, {
    message: "Name on card must be at least 2 characters.",
  }).optional(),
  cardNumber: z.string().regex(/^[0-9]{16}$/, {
    message: "Card number must be 16 digits.",
  }).optional(),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, {
    message: "Expiry date must be in MM/YY format.",
  }).optional(),
  cvv: z.string().regex(/^[0-9]{3,4}$/, {
    message: "CVV must be 3 or 4 digits.",
  }).optional(),
  saveInfo: z.boolean().default(false).optional(),
  marketingEmails: z.boolean().default(false).optional(),
  specialInstructions: z.string().optional(),
});

const Checkout = () => {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const formRef = useRef(null);
  
  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/cart'],
  });
  
  console.log("Cart data in checkout component:", cartItems);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      paymentMethod: "credit_card",
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      saveInfo: false,
      marketingEmails: false,
      specialInstructions: ""
    },
  });
  
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price.toString());
      return total + (price * item.quantity);
    }, 0);
  };
  
  const calculateTaxes = (subtotal) => {
    // Example tax rate of 7%
    return subtotal * 0.07; 
  };
  
  const calculateShipping = (subtotal) => {
    // Free shipping over $75, otherwise $8.95
    return subtotal > 75 ? 0 : 8.95;
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    const shipping = calculateShipping(subtotal);
    
    return subtotal + taxes + shipping;
  };
  
  const onSubmit = async (data) => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: t('checkout.empty_cart'),
        description: t('checkout.add_items_before_checkout'),
        variant: "destructive",
      });
      return;
    }
    
    console.log("Form data:", data);
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Success scenario
      setOrderComplete(true);
      setIsSubmitting(false);
      
      // Clear cart after successful order
      apiRequest('DELETE', '/api/cart', undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      // Scroll to top to show order confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast({
        title: t('checkout.order_placed'),
        description: t('checkout.order_success_message'),
      });
    }, 1500);
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
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.error_loading')}</h2>
            <p className="text-gray-600 mb-6">
              {t('checkout.error_message')}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cart'] })}>
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.thank_you')}</h2>
            <p className="text-gray-600 mb-6">
              {t('checkout.order_confirmation_message')}
            </p>
            <Button onClick={() => setLocation("/")}>
              {t('checkout.continue_shopping')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isEmpty = !cartItems || cartItems.length === 0;
  
  if (isEmpty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('checkout.empty_cart')}</h2>
            <p className="text-gray-600 mb-6">
              {t('checkout.add_items_before_checkout')}
            </p>
            <Button onClick={() => setLocation("/products")}>
              {t('checkout.browse_products')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLocation("/cart")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('checkout.back_to_cart')}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{t('checkout.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('checkout.description')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.shipping_info')}</CardTitle>
              <CardDescription>
                {t('checkout.shipping_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.full_name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('checkout.full_name_placeholder')} {...field} />
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
                          <FormLabel>{t('checkout.email')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('checkout.email_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('checkout.phone_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('checkout.address')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('checkout.address_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.city')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('checkout.city_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.state')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('checkout.state_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.zip_code')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('checkout.zip_code_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.country')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('checkout.select_country')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="greece">Ελλάδα</SelectItem>
                              <SelectItem value="cyprus">Κύπρος</SelectItem>
                              <SelectItem value="usa">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                              <SelectItem value="germany">Germany</SelectItem>
                              <SelectItem value="france">France</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('checkout.payment_info')}</h3>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t('checkout.payment_method')}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="credit_card" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t('checkout.credit_card')}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="paypal" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  PayPal
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch("paymentMethod") === "credit_card" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="cardName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.card_name')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('checkout.card_name_placeholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.card_number')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1234 5678 9012 3456" 
                                {...field} 
                                maxLength={16}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('checkout.expiry_date')}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="MM/YY" 
                                  {...field} 
                                  maxLength={5}
                                />
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
                              <FormLabel>{t('checkout.cvv')}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="123" 
                                  {...field} 
                                  maxLength={4}
                                  type="password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.special_instructions')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t('checkout.special_instructions_placeholder')} 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {t('checkout.special_instructions_description')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="saveInfo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                {t('checkout.save_info')}
                              </FormLabel>
                              <FormDescription>
                                {t('checkout.save_info_description')}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                {t('checkout.marketing_emails')}
                              </FormLabel>
                              <FormDescription>
                                {t('checkout.marketing_emails_description')}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('checkout.processing') : t('checkout.place_order')}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.order_summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 mr-3">
                          {item.product.images && item.product.images[0] && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{t('common.currency')}{parseFloat(item.product.price) * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('common.subtotal')}</span>
                  <span>{t('common.currency')}{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('common.shipping')}</span>
                  <span>
                    {calculateShipping(calculateSubtotal()) === 0 
                      ? t('checkout.free_shipping') 
                      : `${t('common.currency')}${calculateShipping(calculateSubtotal()).toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.estimated_tax')}</span>
                  <span>{t('common.currency')}{calculateTaxes(calculateSubtotal()).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('common.total')}</span>
                  <span>{t('common.currency')}{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 items-start">
              <div className="text-sm text-gray-600">
                <p className="mb-1 font-medium">{t('checkout.shipping_policy')}</p>
                <p>{t('checkout.free_shipping_policy')}</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-1 font-medium">{t('checkout.secure_payment')}</p>
                <p>{t('checkout.payment_security_message')}</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
