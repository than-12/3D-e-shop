import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/admin-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Store, 
  CreditCard, 
  Truck, 
  Bell, 
  Globe, 
  Share2, 
  FileText, 
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react';

// Δοκιμαστικά δεδομένα
const mockSettings = {
  siteInfo: {
    siteName: "3D Print Shop",
    siteDescription: "Υψηλής ποιότητας 3D εκτυπώσεις για όλους",
    contactEmail: "info@3dprintshop.gr",
    contactPhone: "+30 210 1234567",
    address: "Λεωφ. Αθηνών 100, Αθήνα 12345",
    logoUrl: "/assets/logo.png",
    faviconUrl: "/assets/favicon.ico"
  },
  payment: {
    currencyCode: "EUR",
    currencySymbol: "€",
    vatRate: 24,
    paymentMethods: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery"],
    stripeEnabled: true,
    stripePublicKey: "pk_test_123456",
    stripeSecretKey: "sk_test_123456"
  },
  shipping: {
    freeShippingThreshold: 50,
    standardShippingCost: 5,
    expressShippingCost: 12,
    internationalShippingEnabled: true,
    internationalShippingCountries: ["GR", "CY", "DE", "FR", "IT"],
    defaultShippingMethod: "standard"
  },
  notifications: {
    emailNotificationsEnabled: true,
    notifyOnOrder: true,
    notifyOnShipment: true,
    notifyOnReview: true,
    orderConfirmationTemplate: "Αγαπητέ/ή {customer_name},\n\nΣας ευχαριστούμε για την παραγγελία σας #{order_id}. Θα σας ενημερώσουμε μόλις αποσταλεί.",
    shipmentConfirmationTemplate: "Αγαπητέ/ή {customer_name},\n\nΗ παραγγελία σας #{order_id} έχει αποσταλεί και αναμένεται να παραδοθεί στις {delivery_date}."
  },
  seo: {
    metaTitle: "3D Print Shop - Υψηλής ποιότητας 3D εκτυπώσεις",
    metaDescription: "Υψηλής ποιότητας 3D εκτυπώσεις και μοντέλα για επαγγελματίες και χομπίστες. Μετατρέψτε τις ιδέες σας σε πραγματικότητα.",
    googleAnalyticsId: "UA-123456789-1",
    googleTagManagerId: "GTM-ABCDEF"
  },
  social: {
    facebookUrl: "https://facebook.com/3dprintshop",
    instagramUrl: "https://instagram.com/3dprintshop",
    twitterUrl: "https://twitter.com/3dprintshop",
    youtubeUrl: "",
    linkedinUrl: ""
  },
  legal: {
    termsOfService: "Αναλυτικοί όροι χρήσης της υπηρεσίας μας...",
    privacyPolicy: "Αναλυτική πολιτική απορρήτου...",
    cookiePolicy: "Αναλυτική πολιτική cookies...",
    returnPolicy: "Αναλυτική πολιτική επιστροφών..."
  }
};

export default function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState(mockSettings);
  const [tab, setTab] = useState("general");
  
  // Γενικές λειτουργίες
  const handleChange = (section: string, field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value
      }
    });
  };
  
  const handleSave = () => {
    // Εδώ θα γινόταν το API call για αποθήκευση των ρυθμίσεων
    toast({
      title: "Οι ρυθμίσεις αποθηκεύτηκαν",
      description: "Οι αλλαγές στις ρυθμίσεις αποθηκεύτηκαν επιτυχώς.",
    });
  };
  
  // Διαχείριση πολλαπλών τιμών (π.χ. για τις μεθόδους πληρωμής)
  const toggleArrayValue = (section: string, field: string, value: string) => {
    const currentArray = settings[section as keyof typeof settings][field as keyof (typeof settings)[keyof typeof settings]] as string[];
    
    if (currentArray.includes(value)) {
      handleChange(
        section, 
        field, 
        currentArray.filter(item => item !== value)
      );
    } else {
      handleChange(section, field, [...currentArray, value]);
    }
  };
  
  return (
    <AdminLayout title={t('admin.settings')} description="Διαχείριση ρυθμίσεων καταστήματος">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="general">Γενικά</TabsTrigger>
          <TabsTrigger value="payment">Πληρωμές</TabsTrigger>
          <TabsTrigger value="shipping">Αποστολή</TabsTrigger>
          <TabsTrigger value="notifications">Ειδοποιήσεις</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
          <TabsTrigger value="legal">Νομικά</TabsTrigger>
        </TabsList>
        
        {/* Γενικές Ρυθμίσεις */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Πληροφορίες Καταστήματος</CardTitle>
              <CardDescription>
                Βασικές πληροφορίες για το ηλεκτρονικό σας κατάστημα
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Όνομα Καταστήματος</Label>
                  <Input 
                    id="siteName" 
                    value={settings.siteInfo.siteName} 
                    onChange={(e) => handleChange("siteInfo", "siteName", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Επικοινωνίας</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={settings.siteInfo.contactEmail}
                    onChange={(e) => handleChange("siteInfo", "contactEmail", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Τηλέφωνο Επικοινωνίας</Label>
                  <Input 
                    id="contactPhone" 
                    value={settings.siteInfo.contactPhone}
                    onChange={(e) => handleChange("siteInfo", "contactPhone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Διεύθυνση</Label>
                  <Input 
                    id="address" 
                    value={settings.siteInfo.address}
                    onChange={(e) => handleChange("siteInfo", "address", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Περιγραφή Καταστήματος</Label>
                <Textarea 
                  id="siteDescription" 
                  rows={3}
                  value={settings.siteInfo.siteDescription}
                  onChange={(e) => handleChange("siteInfo", "siteDescription", e.target.value)}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL Λογοτύπου</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="logoUrl" 
                      value={settings.siteInfo.logoUrl}
                      onChange={(e) => handleChange("siteInfo", "logoUrl", e.target.value)}
                    />
                    <Button variant="outline">Ανέβασμα</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">URL Favicon</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="faviconUrl" 
                      value={settings.siteInfo.faviconUrl}
                      onChange={(e) => handleChange("siteInfo", "faviconUrl", e.target.value)}
                    />
                    <Button variant="outline">Ανέβασμα</Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Κοινωνικά Δίκτυα</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input 
                      id="facebookUrl" 
                      value={settings.social.facebookUrl}
                      onChange={(e) => handleChange("social", "facebookUrl", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input 
                      id="instagramUrl" 
                      value={settings.social.instagramUrl}
                      onChange={(e) => handleChange("social", "instagramUrl", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input 
                      id="twitterUrl" 
                      value={settings.social.twitterUrl}
                      onChange={(e) => handleChange("social", "twitterUrl", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input 
                      id="linkedinUrl" 
                      value={settings.social.linkedinUrl}
                      onChange={(e) => handleChange("social", "linkedinUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSave}>Αποθήκευση Αλλαγών</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Ρυθμίσεις Πληρωμών */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Ρυθμίσεις Πληρωμών</CardTitle>
              <CardDescription>
                Διαχειριστείτε τους τρόπους πληρωμής και τις σχετικές ρυθμίσεις
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Κωδικός Νομίσματος</Label>
                  <Select 
                    value={settings.payment.currencyCode}
                    onValueChange={(value) => handleChange("payment", "currencyCode", value)}
                  >
                    <SelectTrigger id="currencyCode">
                      <SelectValue placeholder="Επιλέξτε νόμισμα" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Ευρώ (EUR)</SelectItem>
                      <SelectItem value="USD">Δολάριο ΗΠΑ (USD)</SelectItem>
                      <SelectItem value="GBP">Λίρα Αγγλίας (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Σύμβολο Νομίσματος</Label>
                  <Input 
                    id="currencySymbol" 
                    value={settings.payment.currencySymbol}
                    onChange={(e) => handleChange("payment", "currencySymbol", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vatRate">Συντελεστής ΦΠΑ (%)</Label>
                  <Input 
                    id="vatRate" 
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payment.vatRate}
                    onChange={(e) => handleChange("payment", "vatRate", Number(e.target.value))}
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Διαθέσιμοι Τρόποι Πληρωμής</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="paymentCreditCard"
                      checked={settings.payment.paymentMethods.includes("credit_card")}
                      onCheckedChange={(checked) => toggleArrayValue("payment", "paymentMethods", "credit_card")}
                    />
                    <Label htmlFor="paymentCreditCard">Πιστωτική/Χρεωστική Κάρτα</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="paymentPaypal"
                      checked={settings.payment.paymentMethods.includes("paypal")}
                      onCheckedChange={(checked) => toggleArrayValue("payment", "paymentMethods", "paypal")}
                    />
                    <Label htmlFor="paymentPaypal">PayPal</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="paymentBankTransfer"
                      checked={settings.payment.paymentMethods.includes("bank_transfer")}
                      onCheckedChange={(checked) => toggleArrayValue("payment", "paymentMethods", "bank_transfer")}
                    />
                    <Label htmlFor="paymentBankTransfer">Τραπεζική Κατάθεση</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="paymentCashOnDelivery"
                      checked={settings.payment.paymentMethods.includes("cash_on_delivery")}
                      onCheckedChange={(checked) => toggleArrayValue("payment", "paymentMethods", "cash_on_delivery")}
                    />
                    <Label htmlFor="paymentCashOnDelivery">Αντικαταβολή</Label>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="stripeEnabled"
                    checked={settings.payment.stripeEnabled}
                    onCheckedChange={(checked) => handleChange("payment", "stripeEnabled", checked)}
                  />
                  <Label htmlFor="stripeEnabled">Ενεργοποίηση Stripe</Label>
                </div>
                
                {settings.payment.stripeEnabled && (
                  <div className="grid grid-cols-1 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                      <Input 
                        id="stripePublicKey" 
                        value={settings.payment.stripePublicKey}
                        onChange={(e) => handleChange("payment", "stripePublicKey", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input 
                        id="stripeSecretKey" 
                        type="password"
                        value={settings.payment.stripeSecretKey}
                        onChange={(e) => handleChange("payment", "stripeSecretKey", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSave}>Αποθήκευση Αλλαγών</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Ρυθμίσεις Αποστολής */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Ρυθμίσεις Αποστολής</CardTitle>
              <CardDescription>
                Διαχειριστείτε τις ρυθμίσεις αποστολής και τα έξοδα μεταφορικών
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Όριο Δωρεάν Αποστολής (€)</Label>
                  <Input 
                    id="freeShippingThreshold" 
                    type="number"
                    min="0"
                    value={settings.shipping.freeShippingThreshold}
                    onChange={(e) => handleChange("shipping", "freeShippingThreshold", Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">Ορίστε 0 για να απενεργοποιήσετε τη δωρεάν αποστολή</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultShippingMethod">Προεπιλεγμένη Μέθοδος Αποστολής</Label>
                  <Select 
                    value={settings.shipping.defaultShippingMethod}
                    onValueChange={(value) => handleChange("shipping", "defaultShippingMethod", value)}
                  >
                    <SelectTrigger id="defaultShippingMethod">
                      <SelectValue placeholder="Επιλέξτε μέθοδο" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Κανονική Αποστολή</SelectItem>
                      <SelectItem value="express">Αποστολή Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="standardShippingCost">Κόστος Κανονικής Αποστολής (€)</Label>
                  <Input 
                    id="standardShippingCost" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.shipping.standardShippingCost}
                    onChange={(e) => handleChange("shipping", "standardShippingCost", Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expressShippingCost">Κόστος Αποστολής Express (€)</Label>
                  <Input 
                    id="expressShippingCost" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.shipping.expressShippingCost}
                    onChange={(e) => handleChange("shipping", "expressShippingCost", Number(e.target.value))}
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="internationalShippingEnabled"
                    checked={settings.shipping.internationalShippingEnabled}
                    onCheckedChange={(checked) => handleChange("shipping", "internationalShippingEnabled", checked)}
                  />
                  <Label htmlFor="internationalShippingEnabled">Ενεργοποίηση Διεθνούς Αποστολής</Label>
                </div>
                
                {settings.shipping.internationalShippingEnabled && (
                  <div className="pt-4 pl-6">
                    <Label>Χώρες Διεθνούς Αποστολής</Label>
                    <p className="text-sm text-gray-500 mb-2">Επιλέξτε τις χώρες στις οποίες πραγματοποιείτε αποστολές</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {["GR", "CY", "DE", "FR", "IT", "ES", "UK"].map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <Switch 
                            id={`country_${country}`}
                            checked={settings.shipping.internationalShippingCountries.includes(country)}
                            onCheckedChange={(checked) => {
                              const updatedCountries = checked 
                                ? [...settings.shipping.internationalShippingCountries, country]
                                : settings.shipping.internationalShippingCountries.filter(c => c !== country);
                              handleChange("shipping", "internationalShippingCountries", updatedCountries);
                            }}
                          />
                          <Label htmlFor={`country_${country}`}>{country}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSave}>Αποθήκευση Αλλαγών</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Ρυθμίσεις Ειδοποιήσεων */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Ρυθμίσεις Ειδοποιήσεων</CardTitle>
              <CardDescription>
                Διαχειριστείτε τις ειδοποιήσεις που στέλνονται σε εσάς και τους πελάτες σας
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="emailNotificationsEnabled"
                  checked={settings.notifications.emailNotificationsEnabled}
                  onCheckedChange={(checked) => handleChange("notifications", "emailNotificationsEnabled", checked)}
                />
                <Label htmlFor="emailNotificationsEnabled">Ενεργοποίηση Ειδοποιήσεων Email</Label>
              </div>
              
              {settings.notifications.emailNotificationsEnabled && (
                <>
                  <div className="pl-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notifyOnOrder"
                        checked={settings.notifications.notifyOnOrder}
                        onCheckedChange={(checked) => handleChange("notifications", "notifyOnOrder", checked)}
                      />
                      <Label htmlFor="notifyOnOrder">Ειδοποίηση για νέες παραγγελίες</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notifyOnShipment"
                        checked={settings.notifications.notifyOnShipment}
                        onCheckedChange={(checked) => handleChange("notifications", "notifyOnShipment", checked)}
                      />
                      <Label htmlFor="notifyOnShipment">Ειδοποίηση για αποστολές παραγγελιών</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notifyOnReview"
                        checked={settings.notifications.notifyOnReview}
                        onCheckedChange={(checked) => handleChange("notifications", "notifyOnReview", checked)}
                      />
                      <Label htmlFor="notifyOnReview">Ειδοποίηση για νέες αξιολογήσεις</Label>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Πρότυπα Email</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="orderConfirmationTemplate">Email Επιβεβαίωσης Παραγγελίας</Label>
                      <Textarea 
                        id="orderConfirmationTemplate" 
                        rows={4}
                        value={settings.notifications.orderConfirmationTemplate}
                        onChange={(e) => handleChange("notifications", "orderConfirmationTemplate", e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Χρησιμοποιήστε {"{customer_name}"}, {"{order_id}"}, {"{total_amount}"} για δυναμικά πεδία</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shipmentConfirmationTemplate">Email Επιβεβαίωσης Αποστολής</Label>
                      <Textarea 
                        id="shipmentConfirmationTemplate" 
                        rows={4}
                        value={settings.notifications.shipmentConfirmationTemplate}
                        onChange={(e) => handleChange("notifications", "shipmentConfirmationTemplate", e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Χρησιμοποιήστε {"{customer_name}"}, {"{order_id}"}, {"{delivery_date}"} για δυναμικά πεδία</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSave}>Αποθήκευση Αλλαγών</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Ρυθμίσεις SEO & Analytics */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Analytics</CardTitle>
              <CardDescription>
                Βελτιστοποιήστε την προβολή του καταστήματός σας στις μηχανές αναζήτησης
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input 
                  id="metaTitle" 
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleChange("seo", "metaTitle", e.target.value)}
                />
                <p className="text-sm text-gray-500">Προτεινόμενο μήκος: έως 60 χαρακτήρες</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea 
                  id="metaDescription" 
                  rows={3}
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleChange("seo", "metaDescription", e.target.value)}
                />
                <p className="text-sm text-gray-500">Προτεινόμενο μήκος: 120-160 χαρακτήρες</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input 
                    id="googleAnalyticsId" 
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => handleChange("seo", "googleAnalyticsId", e.target.value)}
                    placeholder="π.χ. UA-123456789-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input 
                    id="googleTagManagerId" 
                    value={settings.seo.googleTagManagerId}
                    onChange={(e) => handleChange("seo", "googleTagManagerId", e.target.value)}
                    placeholder="π.χ. GTM-ABCDEF"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSave}>Αποθήκευση Αλλαγών</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Νομικά Κείμενα */}
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Νομικά Κείμενα</CardTitle>
              <CardDescription>
                Διαχειριστείτε τα νομικά κείμενα του καταστήματός σας
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="termsOfService">Όροι Χρήσης</Label>
                <Textarea 
                  id="termsOfService" 
                  rows={6}
                  value={settings.legal.termsOfService}
                  onChange={(e) => handleChange("legal", "termsOfService", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacyPolicy">Πολιτική Απορρήτου</Label>
                <Textarea 
                  id="privacyPolicy" 
                  rows={6}
                  value={settings.legal.privacyPolicy}
                  onChange={(e) => handleChange("legal", "privacyPolicy", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cookiePolicy">Πολιτική Cookies</Label>
                <Textarea 
                  id="cookiePolicy" 
                  rows={6}
                  value={settings.legal.cookiePolicy}
                  onChange={(e) => handleChange("legal", "cookiePolicy", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="returnPolicy">Πολιτική Επιστροφών</Label>
                <Textarea 
                  id="returnPolicy" 
                  rows={6}
                  value={settings.legal.returnPolicy}
                  onChange={(e) => handleChange("legal", "returnPolicy", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSave}>Αποθήκευση Αλλαγών</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
} 