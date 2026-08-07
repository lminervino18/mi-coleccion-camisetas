import { RESET_TOKEN_TTL_MINUTES } from '@camisetas/core';
import type { OutgoingEmail } from './types';

export const passwordResetEmail = (
  to: string,
  username: string,
  resetUrl: string,
): OutgoingEmail => ({
  to,
  subject: 'Restablecer tu contraseña',
  text: [
    `Hola ${username},`,
    '',
    'Pediste restablecer la contraseña de tu cuenta en Mi Colección de Camisetas.',
    `Abrí este enlace para elegir una nueva: ${resetUrl}`,
    '',
    `El enlace vence en ${String(RESET_TOKEN_TTL_MINUTES)} minutos y se puede usar una sola vez.`,
    'Si no fuiste vos, podés ignorar este mensaje: tu contraseña no cambia.',
  ].join('\n'),
  html: `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#17181a">
      <p>Hola ${username},</p>
      <p>Pediste restablecer la contraseña de tu cuenta en <strong>Mi Colección de Camisetas</strong>.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;background:#007bff;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
          Elegir una nueva contraseña
        </a>
      </p>
      <p style="color:#6c757d;font-size:14px">
        El enlace vence en ${String(RESET_TOKEN_TTL_MINUTES)} minutos y se puede usar una sola vez.
        Si no fuiste vos, ignorá este mensaje: tu contraseña no cambia.
      </p>
    </div>
  `.trim(),
});
