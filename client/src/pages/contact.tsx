import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });
  
  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/contact', values);
      
      setSubmitted(true);
      form.reset();
      
      toast({
        title: t('contact.message_sent'),
        description: t('contact.message_sent'),
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('contact.contact_title')}</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.contact_description')}
          </p>
        </div>
        
        <div className="mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Contact Information */}
          <div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('contact.address_title')}</h3>
                    <p className="mt-1 text-gray-600">
                      123 Printing Way<br />
                      New York, NY 10001
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('contact.phone_title')}</h3>
                    <p className="mt-1 text-gray-600">
                      (123) 456-7890
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Mon-Fri, 9am-6pm EST
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('contact.email_title')}</h3>
                    <p className="mt-1 text-gray-600">
                      info@3dprintcraft.com
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      We aim to respond within 24 hours
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('contact.hours_title')}</h3>
                    <div className="mt-1 text-gray-600 space-y-1">
                      <p>{t('contact.hours_content')}</p>
                      <p>Saturday: 10am - 4pm</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="mt-12 lg:mt-0 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.contact_form')}</CardTitle>
                <CardDescription>
                  {t('contact.contact_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('contact.message_sent')}</h3>
                    <p className="text-gray-600 max-w-md">
                      {t('contact.message_sent')}
                    </p>
                    <Button className="mt-6" onClick={() => setSubmitted(false)}>
                      {t('contact.send_message')}
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('contact.your_name')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('contact.your_name')} {...field} />
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
                              <FormLabel>{t('contact.your_email')}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={t('contact.your_email')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>{t('contact.subject')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('contact.subject')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>{t('contact.message')}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={t('contact.message')} 
                                  className="min-h-32" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            t('common.processing')
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              {t('contact.send_message')}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Map */}
        <div className="mt-16">
          <div className="bg-gray-300 rounded-lg overflow-hidden h-96">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6046.883533273385!2d-73.9923783275073!3d40.75064631550304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9f775f259%3A0x999668d0d7c3fd7d!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1639007467685!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              title="3D PrintCraft Store Location"
            ></iframe>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('footer.faq')}</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              {t('contact.faq_description')}
            </p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                q: t('contact.faq.file_formats.q'),
                a: t('contact.faq.file_formats.a')
              },
              {
                q: t('contact.faq.print_time.q'),
                a: t('contact.faq.print_time.a')
              },
              {
                q: t('contact.faq.materials.q'),
                a: t('contact.faq.materials.a')
              },
              {
                q: t('contact.faq.shipping.q'),
                a: t('contact.faq.shipping.a')
              },
              {
                q: t('contact.faq.design.q'),
                a: t('contact.faq.design.a')
              },
              {
                q: t('contact.faq.return.q'),
                a: t('contact.faq.return.a')
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
