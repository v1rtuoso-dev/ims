import type { ImportResult, ErrorResponse } from '../types/ImportResult';

const API_BASE_URL = '/api/users';

export async function uploadUserFile(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ErrorResponse;
    throw new Error(errorData.error || 'Upload failed');
  }

  return data as ImportResult;
}
