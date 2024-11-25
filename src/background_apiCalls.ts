import { BatchUpdateRequest } from '../src/types';
import { getSetAuth } from '../src/background_auth';

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

async function makeApiCall(method: Method, path: string, body?: ApiBody, isDrive?: 'delete' | 'create') {
  const token = await getSetAuth();
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

  const response = await fetch(url, options);

  if (response.status !== 200) {
    // console.log("THROWING FROM API CALL");
    throw response.status;

    // return Promise.reject(new Error(`${response.status}`));
  }
  return await response.json();
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
  try {
    return makeApiCall('POST', `${templateId}/copy`, {}, 'create');
  } catch (error) {
    return new PromiseRejectionEvent('404', null);
  }
}

async function renameDocument(documentId: string, newName: string) {
  return makeApiCall('PATCH', documentId, { "name": newName }, 'create');
}

async function deleteDocument(documentId: string) {
  return makeApiCall('DELETE', documentId, {}, 'delete');
}

export { getDocument, createDocument, batchUpdate, cloneDocument, renameDocument, deleteDocument };
