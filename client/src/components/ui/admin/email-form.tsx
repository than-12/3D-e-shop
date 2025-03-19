import React, { useState } from 'react';
import apiClient from '@/lib/api';
import { Input } from '../input';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';

interface EmailFormProps {
  type: 'order-confirmation' | 'order-shipped' | 'welcome' | 'reset-password' | 'newsletter';
  orderId?: string;
  userId?: string;
}

export const EmailForm: React.FC<EmailFormProps> = ({ type, orderId, userId }) => {
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('newsletter');
  const [data, setData] = useState('{}');

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      switch (type) {
        case 'order-confirmation':
          response = await apiClient.sendOrderConfirmationEmail(orderId!, userId!);
          break;
        case 'order-shipped':
          response = await apiClient.sendOrderShippedEmail(orderId!, userId!, trackingNumber);
          break;
        case 'welcome':
          response = await apiClient.sendWelcomeEmail(userId!);
          break;
        case 'reset-password':
          response = await apiClient.sendPasswordResetEmail(email);
          break;
        case 'newsletter':
          response = await apiClient.sendNewsletter(
            subject,
            template,
            JSON.parse(data)
          );
          break;
      }

      if (response?.success) {
        toast.success('Το email στάλθηκε επιτυχώς');
      } else {
        toast.error('Υπήρξε πρόβλημα κατά την αποστολή του email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Σφάλμα κατά την αποστολή του email');
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    switch (type) {
      case 'order-confirmation':
        return (
          <div className="text-center">
            <p className="mb-4">Αποστολή επιβεβαίωσης παραγγελίας στον πελάτη.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Αριθμός Παραγγελίας: #{orderId} | ID Χρήστη: {userId}
            </p>
          </div>
        );
      case 'order-shipped':
        return (
          <div>
            <p className="mb-4 text-center">Αποστολή ειδοποίησης ότι η παραγγελία έχει αποσταλεί.</p>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Αριθμός Παραγγελίας: #{orderId} | ID Χρήστη: {userId}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="trackingNumber">
                Αριθμός Παρακολούθησης
              </label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Εισάγετε τον αριθμό παρακολούθησης"
                required
              />
            </div>
          </div>
        );
      case 'welcome':
        return (
          <div className="text-center">
            <p className="mb-4">Αποστολή email καλωσορίσματος στον χρήστη.</p>
            <p className="text-sm text-muted-foreground mb-4">ID Χρήστη: {userId}</p>
          </div>
        );
      case 'reset-password':
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Εισάγετε το email του χρήστη"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ένας σύνδεσμος επαναφοράς κωδικού θα σταλεί σε αυτό το email.
              </p>
            </div>
          </div>
        );
      case 'newsletter':
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="subject">
                Θέμα
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Εισάγετε το θέμα του newsletter"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="template">
                Template
              </label>
              <select 
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="newsletter">Γενικό Newsletter</option>
                <option value="newsletter-promotion">Προσφορές</option>
                <option value="newsletter-new-products">Νέα Προϊόντα</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="data">
                Δεδομένα (JSON)
              </label>
              <Textarea
                id="data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder='{"key": "value"}'
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Εισάγετε τα δεδομένα σε μορφή JSON που θα χρησιμοποιηθούν για το template.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'order-confirmation': return 'Αποστολή Επιβεβαίωσης Παραγγελίας';
      case 'order-shipped': return 'Αποστολή Ειδοποίησης Αποστολής';
      case 'welcome': return 'Αποστολή Email Καλωσορίσματος';
      case 'reset-password': return 'Αποστολή Επαναφοράς Κωδικού';
      case 'newsletter': return 'Αποστολή Newsletter';
      default: return 'Αποστολή Email';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'order-confirmation': return 'Αποστολή επιβεβαίωσης παραγγελίας στον πελάτη';
      case 'order-shipped': return 'Ενημέρωση πελάτη ότι η παραγγελία του έχει αποσταλεί';
      case 'welcome': return 'Αποστολή email καλωσορίσματος σε νέο χρήστη';
      case 'reset-password': return 'Αποστολή συνδέσμου επαναφοράς κωδικού πρόσβασης';
      case 'newsletter': return 'Αποστολή newsletter σε όλους τους εγγεγραμμένους χρήστες';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendEmail}>
          {renderFormContent()}
          <CardFooter className="flex justify-end px-0 pb-0 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Αποστολή...' : 'Αποστολή Email'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}; 