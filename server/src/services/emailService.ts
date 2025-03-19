import nodemailer from 'nodemailer';
import { Order } from '../models/order';
import { User } from '../models/user';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  bcc?: string[];
  attachments?: { filename: string; path: string; }[];
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;
  private emailFrom: string;
  private adminEmail: string;

  constructor() {
    // Αρχικοποίηση του nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASSWORD || 'password',
      },
    });

    // Διαδρομή προς τα template emails
    this.templatesDir = path.join(__dirname, '../templates');
    
    // Email αποστολέα
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@3dprintcraft.gr';
    
    // Email διαχειριστή
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@3dprintcraft.gr';
  }

  /**
   * Στέλνει ένα email
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        bcc: options.bcc,
        attachments: options.attachments,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Φορτώνει ένα template email και συμπληρώνει τις μεταβλητές
   */
  private async getEmailTemplate(templateName: string, data: any): Promise<string> {
    try {
      const filePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const source = fs.readFileSync(filePath, 'utf8');
      const template = handlebars.compile(source);
      return template(data);
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      throw new Error(`Failed to load email template: ${error}`);
    }
  }

  // ======= Email ειδοποιήσεις σχετικά με παραγγελίες =======

  /**
   * Στέλνει επιβεβαίωση παραγγελίας στον πελάτη
   */
  public async sendOrderConfirmation(order: Order, user: User): Promise<void> {
    const template = await this.getEmailTemplate('order-confirmation', {
      order,
      user,
      orderDate: new Date(order.createdAt).toLocaleDateString('el-GR'),
      estimatedDelivery: this.calculateEstimatedDelivery(),
      shopName: '3D PrintCraft',
      shopPhone: '210-1234567',
      shopEmail: 'info@3dprintcraft.gr',
      trackingLink: `https://3dprintcraft.gr/orders/${order.id}/track`,
    });

    await this.sendEmail({
      to: user.email,
      subject: `Επιβεβαίωση παραγγελίας #${order.id}`,
      html: template,
    });

    // Ειδοποίηση και για τον διαχειριστή
    await this.notifyAdminForNewOrder(order, user);
  }

  /**
   * Στέλνει ειδοποίηση αποστολής παραγγελίας
   */
  public async sendOrderShipped(order: Order, user: User, trackingNumber: string): Promise<void> {
    const template = await this.getEmailTemplate('order-shipped', {
      order,
      user,
      trackingNumber,
      trackingLink: `https://courier-tracking.gr/${trackingNumber}`,
      estimatedDelivery: this.calculateEstimatedDelivery(3),
      shopName: '3D PrintCraft',
      shopPhone: '210-1234567',
      shopEmail: 'info@3dprintcraft.gr',
    });

    await this.sendEmail({
      to: user.email,
      subject: `Η παραγγελία σας #${order.id} έχει αποσταλεί`,
      html: template,
    });
  }

  /**
   * Στέλνει ειδοποίηση ακύρωσης παραγγελίας
   */
  public async sendOrderCancelled(order: Order, user: User, reason: string): Promise<void> {
    const template = await this.getEmailTemplate('order-cancelled', {
      order,
      user,
      reason,
      shopName: '3D PrintCraft',
      shopPhone: '210-1234567',
      shopEmail: 'info@3dprintcraft.gr',
    });

    await this.sendEmail({
      to: user.email,
      subject: `Η παραγγελία σας #${order.id} έχει ακυρωθεί`,
      html: template,
    });
  }

  /**
   * Ειδοποιεί τον διαχειριστή για νέα παραγγελία
   */
  private async notifyAdminForNewOrder(order: Order, user: User): Promise<void> {
    const template = await this.getEmailTemplate('admin-new-order', {
      order,
      user,
      orderDate: new Date(order.createdAt).toLocaleDateString('el-GR'),
      shopName: '3D PrintCraft',
      adminDashboardLink: 'https://3dprintcraft.gr/admin/orders',
    });

    await this.sendEmail({
      to: this.adminEmail,
      subject: `Νέα παραγγελία #${order.id}`,
      html: template,
    });
  }

  // ======= Email ειδοποιήσεις σχετικά με χρήστες =======

  /**
   * Στέλνει email καλωσορίσματος μετά την εγγραφή
   */
  public async sendWelcomeEmail(user: User): Promise<void> {
    const template = await this.getEmailTemplate('welcome', {
      user,
      shopName: '3D PrintCraft',
      shopPhone: '210-1234567',
      shopEmail: 'info@3dprintcraft.gr',
      loginLink: 'https://3dprintcraft.gr/login',
    });

    await this.sendEmail({
      to: user.email,
      subject: 'Καλώς ήρθατε στο 3D PrintCraft!',
      html: template,
    });
  }

  /**
   * Στέλνει email για επαναφορά κωδικού
   */
  public async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const resetLink = `https://3dprintcraft.gr/reset-password?token=${resetToken}`;
    
    const template = await this.getEmailTemplate('password-reset', {
      user,
      resetLink,
      expiryTime: '24 ώρες',
      shopName: '3D PrintCraft',
      shopPhone: '210-1234567',
      shopEmail: 'info@3dprintcraft.gr',
    });

    await this.sendEmail({
      to: user.email,
      subject: 'Επαναφορά κωδικού πρόσβασης',
      html: template,
    });
  }

  // ======= Βοηθητικές μέθοδοι =======

  /**
   * Υπολογίζει την εκτιμώμενη ημερομηνία παράδοσης
   */
  private calculateEstimatedDelivery(daysToAdd: number = 5): string {
    const today = new Date();
    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + daysToAdd);
    
    // Αν πέφτει σε Σαββατοκύριακο, μετακίνησε στη Δευτέρα
    const dayOfWeek = estimatedDate.getDay();
    if (dayOfWeek === 0) { // Κυριακή
      estimatedDate.setDate(estimatedDate.getDate() + 1);
    } else if (dayOfWeek === 6) { // Σάββατο
      estimatedDate.setDate(estimatedDate.getDate() + 2);
    }
    
    return estimatedDate.toLocaleDateString('el-GR');
  }

  /**
   * Στέλνει μαζικό newsletter σε εγγεγραμμένους χρήστες
   */
  public async sendNewsletterToSubscribers(
    subscribers: string[], 
    subject: string, 
    templateName: string, 
    data: any
  ): Promise<void> {
    // Χωρίζουμε τους παραλήπτες σε μικρότερες ομάδες για να αποφύγουμε όρια του email provider
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const template = await this.getEmailTemplate(templateName, data);
      
      await this.sendEmail({
        to: this.emailFrom,
        bcc: batch,
        subject,
        html: template,
      });
      
      // Μικρή καθυστέρηση για να αποφύγουμε περιορισμούς ρυθμού αποστολής
      if (subscribers.length > batchSize) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log(`Newsletter sent to ${subscribers.length} subscribers`);
  }
}

export const emailService = new EmailService(); 