import { BatchUpdateRequest } from '../types';
import { getSetAuth } from './background_auth';
import { BackgroundError } from './background_errors';

type ApiBody =
  | { title: string; }  // for createDocument
  | { requests: BatchUpdateRequest[]; }  // for batchUpdate
  | { name: string; }  // for renameDocument
  | Record<string, never>;  // for empty body (e.g., in deleteDocument)

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type FetchOptions = {
  method: Method;
  headers: Headers;
  body?: string;
};

export async function makeApiCall(method: Method, path: string, body?: ApiBody, isDrive?: 'delete' | 'create') {
  let token: string;

  try {
    token = await getSetAuth() as string;
  } catch (error) {
    throw new BackgroundError('NETWORK_ERROR', 'Failed to acquire Google auth token.', { cause: error });
  }

  const headers = new Headers({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  let url;
  if (isDrive === 'delete') {
    url = `https://www.googleapis.com/drive/v2/files/${path}`;
  }
  else if (isDrive === 'create') {
    url = `https://www.googleapis.com/drive/v3/files/${path}`;
  }
  else {
    url = `https://docs.googleapis.com/v1/${path}`;
  }
  const options: FetchOptions = {
    method: method,
    headers: headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new BackgroundError('NETWORK_ERROR', 'Network request failed.', { cause: error });
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new BackgroundError('GOOGLE_DOC_NOT_FOUND', `Google document resource not found: ${path}`, { status: response.status });
    }

    throw new BackgroundError('GOOGLE_API_ERROR', `Google API request failed: ${method} ${path}`, { status: response.status });
  }

  if (response.status === 204) {
    return undefined;
  }

  const responseText = await response.text();
  if (responseText.length === 0) {
    return undefined;
  }

  return JSON.parse(responseText);
}


async function getDocument(documentId: string) {
  return makeApiCall('GET', `documents/${documentId}`);
}

async function createDocument(title = 'Untitled Document') {
  return makeApiCall('POST', 'documents', { title: title });
}

async function batchUpdate(documentId: string, requests: BatchUpdateRequest[]) {
  return makeApiCall('POST', `documents/${documentId}:batchUpdate`, { requests: requests });
}

async function cloneDocument(templateId: string) {
  return makeApiCall('POST', `${templateId}/copy`, {}, 'create');
}

async function renameDocument(documentId: string, newName: string) {
  return makeApiCall('PATCH', documentId, { "name": newName }, 'create');
}

async function deleteDocument(documentId: string) {
  return makeApiCall('DELETE', documentId, {}, 'delete');
}

export { getDocument, createDocument, batchUpdate, cloneDocument, renameDocument, deleteDocument };
