import type { ImageMimeType, ImageUploadTicket } from '@camisetas/contracts';
import { ApiRequestError, apiRequest } from './api-client';

/**
 * Two steps on purpose: the app only registers the upload, and the bytes go straight to storage.
 * Vercel caps request bodies at 4.5 MB, so the image can never be relayed through the API.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const ticket = await apiRequest<ImageUploadTicket>('/api/uploads', {
    method: 'POST',
    json: { contentType: file.type as ImageMimeType, byteSize: file.size },
  });

  const response = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new ApiRequestError({
      code: 'internal_error',
      message: 'No pudimos subir la imagen. Probá de nuevo.',
    });
  }

  return ticket.uploadId;
};
