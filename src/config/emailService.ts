import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    // Create a test account if no email credentials provided
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not found. Using test account.');
      this.initializeWithTestAccount();
    } else {
      this.initializeWithCredentials();
    }
  }

  private async initializeWithTestAccount() {
    // Create test account
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('Test email account created:', testAccount.user);
  }

  private initializeWithCredentials() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Equipment Rental <no-reply@equipment-rental.com>',
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Log email URL for test accounts
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send email confirmation
  async sendConfirmationEmail(email: string, token: string): Promise<boolean> {
    const confirmationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirm-email/${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Confirm Your Email - Equipment Rental',
      html: `
        <h1>Welcome to Equipment Rental!</h1>
        <p>Thank you for registering. Please confirm your email by clicking the link below:</p>
        <p><a href="${confirmationLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Confirm Email</a></p>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${confirmationLink}</p>
        <p>This link will expire in 24 hours.</p>
      `
    });
  }

  // Send password to user
  async sendPasswordEmail(email: string, password: string): Promise<boolean> {
    const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    
    return this.sendEmail({
      to: email,
      subject: 'Your Account Password - Equipment Rental',
      html: `
        <h1>Your Account is Ready!</h1>
        <p>Your account has been confirmed. You can now log in with the following credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><a href="${loginLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Login Now</a></p>
        <p>For security reasons, we recommend changing your password after logging in.</p>
      `
    });
  }

  // Send booking confirmation to user
  async sendBookingConfirmationToUser(email: string, bookingDetails: any): Promise<boolean> {
    const { id, equipment_name, start_date, end_date } = bookingDetails;
    const startDate = new Date(start_date).toLocaleDateString();
    const endDate = new Date(end_date).toLocaleDateString();
    
    return this.sendEmail({
      to: email,
      subject: 'Booking Confirmation - Equipment Rental',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Your booking has been successfully created.</p>
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Booking ID:</strong> ${id}</li>
          <li><strong>Equipment:</strong> ${equipment_name}</li>
          <li><strong>Start Date:</strong> ${startDate}</li>
          <li><strong>End Date:</strong> ${endDate}</li>
        </ul>
        <p>You can view your booking details in your account dashboard.</p>
      `
    });
  }

  // Notify admin about new booking
  async notifyAdminAboutBooking(adminEmail: string, bookingDetails: any): Promise<boolean> {
    const { id, equipment_name, user_email, start_date, end_date } = bookingDetails;
    const startDate = new Date(start_date).toLocaleDateString();
    const endDate = new Date(end_date).toLocaleDateString();
    const adminDashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/bookings`;
    
    return this.sendEmail({
      to: adminEmail,
      subject: 'New Booking Alert - Equipment Rental',
      html: `
        <h1>New Booking Alert</h1>
        <p>A new booking has been created and requires your attention.</p>
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Booking ID:</strong> ${id}</li>
          <li><strong>Equipment:</strong> ${equipment_name}</li>
          <li><strong>User:</strong> ${user_email}</li>
          <li><strong>Start Date:</strong> ${startDate}</li>
          <li><strong>End Date:</strong> ${endDate}</li>
        </ul>
        <p><a href="${adminDashboardLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Review Booking</a></p>
      `
    });
  }

  // Add sendPasswordResetLink method
  async sendPasswordResetLink(email: string, resetUrl: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: email,
        subject: 'Сброс пароля',
        html: `
          <h1>Сброс пароля</h1>
          <p>Вы получили это письмо, потому что был запрошен сброс пароля для вашей учетной записи.</p>
          <p>Для установки нового пароля, перейдите по следующей ссылке:</p>
          <a href="${resetUrl}" target="_blank">Сбросить пароль</a>
          <p>Ссылка действительна в течение 1 часа.</p>
          <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь с администратором.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }
}

export default new EmailService(); 