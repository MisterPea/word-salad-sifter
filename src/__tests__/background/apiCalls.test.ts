import { makeApiCall } from '../../background/background_apiCalls';
import { getSetAuth } from '../../background/background_auth';

jest.mock('../../background/background_auth', () => ({
  getSetAuth: jest.fn(),
}));

// ---- there's some issue with mocking this - it breaks everything
// jest.mock('../../background/background_apiCalls', () => ({
//   makeApiCallMock: jest.fn()
// }));
// const makeApiCallMock = makeApiCall as jest.Mock;

globalThis.fetch = jest.fn();

describe('makeApiCall', () => {
  jest.mock('../../background/background_auth', () => ({
    getSetAuth: jest.fn(),
  }));

  globalThis.fetch = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('makeApiCall forms correct request for GET method', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify({ success: true })),
    });

    const response = await makeApiCall('GET', 'documents/12345');

    expect(fetch).toHaveBeenCalledWith(
      'https://docs.googleapis.com/v1/documents/12345',
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      })
    );
    expect(response).toEqual({ success: true });
  });

  test('makeApiCall throws if getSetAuth fails', async () => {
    (getSetAuth as jest.Mock).mockRejectedValue(new Error('Auth failed'));

    await expect(makeApiCall('GET', 'documents/12345')).rejects.toEqual(
      expect.objectContaining({
        code: 'NETWORK_ERROR',
        message: 'Failed to acquire Google auth token.',
      })
    );
  });

  test('makeApiCall constructs correct URL for Drive delete', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, text: jest.fn().mockResolvedValue('') });

    await makeApiCall('DELETE', '12345', {}, 'delete');
    expect(fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/drive/v2/files/12345',
      expect.any(Object)
    );
  });

  test('makeApiCall sets correct headers', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, text: jest.fn().mockResolvedValue('') });

    await makeApiCall('POST', 'documents', { title: 'Test' });
    const fetchOptions = (fetch as jest.Mock).mock.calls[0][1];

    expect(fetchOptions.headers.get('Authorization')).toBe('Bearer mock-token');
    expect(fetchOptions.headers.get('Content-Type')).toBe('application/json');
  });

  test('makeApiCall includes JSON stringified body when provided', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, text: jest.fn().mockResolvedValue('') });

    await makeApiCall('POST', 'documents', { title: 'My Doc' });
    const fetchOptions = (fetch as jest.Mock).mock.calls[0][1];

    expect(fetchOptions.body).toBe(JSON.stringify({ title: 'My Doc' }));
  });

  test('makeApiCall does not include body when none is provided', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, text: jest.fn().mockResolvedValue('') });

    await makeApiCall('GET', 'documents/12345');
    const fetchOptions = (fetch as jest.Mock).mock.calls[0][1];

    expect(fetchOptions.body).toBeUndefined();
  });

  test('makeApiCall throws status code on non-200 response', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    await expect(makeApiCall('GET', 'documents/unknown')).rejects.toEqual(
      expect.objectContaining({
        code: 'GOOGLE_DOC_NOT_FOUND',
        status: 404,
      })
    );
  });

  test('makeApiCall parses response JSON correctly', async () => {
    (getSetAuth as jest.Mock).mockResolvedValue('mock-token');
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify({ success: true })),
    });

    const response = await makeApiCall('GET', 'documents/12345');
    expect(response).toEqual({ success: true });
  });

});
