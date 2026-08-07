import { env, hasMailProvider } from '../env';
import type { MailSender, OutgoingEmail } from './types';

export type { MailSender, OutgoingEmail } from './types';

const brevoSender: MailSender = {
  send: async (email) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY ?? '',
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: env.MAIL_FROM, name: 'Mi Colección de Camisetas' },
        to: [{ email: email.to }],
        subject: email.subject,
        textContent: email.text,
        htmlContent: email.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo rejected the message with status ${String(response.status)}.`);
    }
  },
};

/**
 * Without a provider key the message is written to the server log instead of being sent, so the
 * whole reset flow is exercisable locally. Only the link is logged, never the recipient's data.
 */
const consoleSender: MailSender = {
  send: (email: OutgoingEmail) => {
    console.warn(`[mail] ${email.subject} -> ${email.to}\n${email.text}`);
    return Promise.resolve();
  },
};

export const mailSender: MailSender = hasMailProvider ? brevoSender : consoleSender;
