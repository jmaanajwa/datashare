import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG } from '../config/api.config';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FileService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads a file as multipart form data', async () => {
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
    const promise = service.upload(file, { expiration: '7', password: '1234' });
    const request = http.expectOne(`${API_CONFIG.baseUrl}/files`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect((request.request.body as FormData).get('file')).toBeTruthy();
    expect((request.request.body as FormData).get('password')).toBe('1234');
    expect((request.request.body as FormData).get('expirationDays')).toBe('7');
    request.flush({ metadata: {
      id: 'file-1', name: 'report.pdf', size: 7,
      expirationDate: '2030-01-01T00:00:00Z', linkStatus: 'active',
      downloadLink: 'http://localhost:8080/api/shares/token-1',
    } });

    await expect(promise).resolves.toEqual({
      link: 'http://localhost:8080/api/shares/token-1',
      expiresAt: new Date('2030-01-01T00:00:00Z'),
    });
  });

  it('maps the backend file list to frontend files', async () => {
    const promise = service.list();
    const request = http.expectOne(`${API_CONFIG.baseUrl}/files`);
    request.flush([{
      id: 'file-1', name: 'photo.png', size: 2_000_000,
      expirationDate: '2030-01-01T00:00:00Z', linkStatus: 'active',
      downloadLink: 'http://localhost:8080/api/shares/token-1',
    }]);

    await expect(promise).resolves.toEqual([expect.objectContaining({
      id: 'file-1', token: 'token-1', name: 'photo.png', size: 2_000_000, status: 'active',
    })]);
    expect(service.formatSize(2_000_000)).toContain('2');
  });

  it('gets share metadata and downloads a protected file', async () => {
    const metadataPromise = service.getDownload('token/one');
    const metadataRequest = http.expectOne(`${API_CONFIG.baseUrl}/shares/token%2Fone`);
    metadataRequest.flush({
      name: 'secret.txt', mimeType: 'text/plain', size: 10,
      expirationDate: '2030-01-01T00:00:00Z', passwordRequired: true,
    });

    await expect(metadataPromise).resolves.toEqual(expect.objectContaining({
      token: 'token/one', name: 'secret.txt', protected: true, status: 'active',
    }));

    const downloadPromise = service.download('token/one', '1234');
    const downloadRequest = http.expectOne(`${API_CONFIG.baseUrl}/shares/token%2Fone/download`);
    expect(downloadRequest.request.method).toBe('POST');
    expect(downloadRequest.request.body).toEqual({ password: '1234' });
    const blob = new Blob(['secret'], { type: 'text/plain' });
    downloadRequest.flush(blob);

    await expect(downloadPromise).resolves.toBe(blob);
  });

  it('deletes a file', async () => {
    const promise = service.remove('file/1');
    const request = http.expectOne(`${API_CONFIG.baseUrl}/files/file%2F1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    await expect(promise).resolves.toBeUndefined();
  });
});
