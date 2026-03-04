import nodemailer from 'nodemailer';
import { config } from '@config/env';

/**
 * Email Service – Nodemailer-based email sending
 * Supports Gmail, SendGrid, and custom SMTP
 */

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using configured SMTP
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        await transporter.sendMail({
            from: `"GuiGui Pâtisserie" <${config.email.from}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || '',
        });
        console.log(`📧 Email sent to: ${options.to}`);
        return true;
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return false;
    }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
    email: string,
    orderNumber: string,
    totalCents: number
): Promise<boolean> => {
    const total = (totalCents / 100).toLocaleString('fr-FR');
    return sendEmail({
        to: email,
        subject: `GuiGui - Commande #${orderNumber} confirmée`,
        html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8B1A2B; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">GuiGui Pâtisserie</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1A1A2E;">Merci pour votre commande ! 🎉</h2>
          <p>Votre commande <strong>#${orderNumber}</strong> a bien été reçue.</p>
          <p style="font-size: 24px; color: #8B1A2B; font-weight: bold;">${total} FCFA</p>
          <p>Nous vous tiendrons informé(e) de l'avancement de votre commande.</p>
          <hr style="border: 1px solid #eee; margin: 24px 0;">
          <p style="color: #666; font-size: 12px;">GuiGui – Pause sucrée et salée | Douala, Cameroun</p>
        </div>
      </div>
    `,
    });
};

/**
 * Send order status change email
 */
export const sendOrderStatusEmail = async (
    email: string,
    orderNumber: string,
    status: string
): Promise<boolean> => {
    const statusLabels: Record<string, string> = {
        en_preparation: '🍳 En préparation',
        validee: '✅ Validée',
        livree: '🚗 Livrée',
        cancelled: '❌ Annulée',
    };

    return sendEmail({
        to: email,
        subject: `GuiGui - Commande #${orderNumber} : ${statusLabels[status] || status}`,
        html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8B1A2B; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">GuiGui Pâtisserie</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1A1A2E;">Mise à jour commande #${orderNumber}</h2>
          <p style="font-size: 20px;">${statusLabels[status] || status}</p>
          <p>Votre commande a changé de statut. Connectez-vous pour voir les détails.</p>
          <hr style="border: 1px solid #eee; margin: 24px 0;">
          <p style="color: #666; font-size: 12px;">GuiGui – Pause sucrée et salée | Douala, Cameroun</p>
        </div>
      </div>
    `,
    });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string
): Promise<boolean> => {
    const resetUrl = `${config.server.frontendUrl}/auth/reset-password?token=${resetToken}`;
    return sendEmail({
        to: email,
        subject: 'GuiGui - Réinitialisation mot de passe',
        html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8B1A2B; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">GuiGui Pâtisserie</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <h2 style="color: #1A1A2E;">Mot de passe oublié ?</h2>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #8B1A2B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      </div>
    `,
    });
};
