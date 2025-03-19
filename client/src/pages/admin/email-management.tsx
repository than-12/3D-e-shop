import React, { useState } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailForm } from '@/components/ui/admin/email-form';
import { SEO } from '@/components/ui/seo';

export default function EmailManagement() {
  const [activeTab, setActiveTab] = useState('newsletter');

  return (
    <AdminLayout title="Διαχείριση Emails" description="Αποστολή emails και newsletters">
      <SEO 
        title="Διαχείριση Emails | Admin Panel | 3D PrintCraft" 
        description="Διαχείριση αποστολής emails και newsletters σε πελάτες"
      />
      
      <div className="container mx-auto py-8">
        <Tabs 
          defaultValue="newsletter" 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="order-confirmation">Επιβεβαίωση Παραγγελίας</TabsTrigger>
            <TabsTrigger value="order-shipped">Αποστολή Παραγγελίας</TabsTrigger>
            <TabsTrigger value="welcome">Καλωσόρισμα</TabsTrigger>
            <TabsTrigger value="reset-password">Επαναφορά Κωδικού</TabsTrigger>
          </TabsList>
          
          <TabsContent value="newsletter">
            <EmailForm type="newsletter" />
          </TabsContent>
          
          <TabsContent value="order-confirmation">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h2 className="text-lg font-medium mb-2">Οδηγίες</h2>
              <p className="text-sm text-muted-foreground">
                Συμπληρώστε τον αριθμό παραγγελίας και το ID του χρήστη για να στείλετε email επιβεβαίωσης παραγγελίας.
                Συνήθως αυτό το email αποστέλλεται αυτόματα όταν δημιουργείται μια νέα παραγγελία.
              </p>
            </div>
            <EmailForm 
              type="order-confirmation" 
              orderId="12345" 
              userId="user123" 
            />
          </TabsContent>
          
          <TabsContent value="order-shipped">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h2 className="text-lg font-medium mb-2">Οδηγίες</h2>
              <p className="text-sm text-muted-foreground">
                Συμπληρώστε τον αριθμό παραγγελίας, το ID του χρήστη και τον αριθμό παρακολούθησης αποστολής για να ενημερώσετε τον πελάτη ότι η παραγγελία του έχει αποσταλεί.
              </p>
            </div>
            <EmailForm 
              type="order-shipped" 
              orderId="12345" 
              userId="user123" 
            />
          </TabsContent>
          
          <TabsContent value="welcome">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h2 className="text-lg font-medium mb-2">Οδηγίες</h2>
              <p className="text-sm text-muted-foreground">
                Συμπληρώστε το ID του χρήστη για να στείλετε email καλωσορίσματος. Συνήθως αυτό το email αποστέλλεται αυτόματα όταν εγγράφεται ένας νέος χρήστης.
              </p>
            </div>
            <EmailForm 
              type="welcome" 
              userId="user123" 
            />
          </TabsContent>
          
          <TabsContent value="reset-password">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h2 className="text-lg font-medium mb-2">Οδηγίες</h2>
              <p className="text-sm text-muted-foreground">
                Συμπληρώστε το email του χρήστη για να του στείλετε σύνδεσμο επαναφοράς κωδικού πρόσβασης.
              </p>
            </div>
            <EmailForm type="reset-password" />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 