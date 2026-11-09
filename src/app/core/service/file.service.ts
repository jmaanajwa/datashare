import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DownloadFile, SharedFile } from '../models/file';
import { ShareOptions, ShareResult } from '../models/share';

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  expirationDate: string;
  linkStatus: 'active' | 'expired';
  downloadLink: string;
}

interface ShareMetadata {
  name: string;
  mimeType: string;
  size: number;
  expirationDate: string;
  passwordRequired: boolean;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  readonly maxUploadSizeBytes = API_CONFIG.maxUploadSizeBytes;
  readonly acceptedFileTypes = API_CONFIG.acceptedFileTypes;

  constructor(private readonly http: HttpClient) {}

  async upload(file: File, options: ShareOptions): Promise<ShareResult> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (options.password) form.append('password', options.password);
    form.append('expirationDays', options.expiration);
    const response = await firstValueFrom(this.http.post<{ metadata: FileMetadata }>(
      `${API_CONFIG.baseUrl}/files`, form));
    return { link: response.metadata.downloadLink, expiresAt: new Date(response.metadata.expirationDate) };
  }

  async list(): Promise<SharedFile[]> {
    const response = await firstValueFrom(this.http.get<FileMetadata[]>(`${API_CONFIG.baseUrl}/files`));
    return response.map(metadata => this.toSharedFile(metadata));
  }

  async getDownload(token: string): Promise<DownloadFile> {
    const metadata = await firstValueFrom(this.http.get<ShareMetadata>(
      `${API_CONFIG.baseUrl}/shares/${encodeURIComponent(token)}`));
    return {
      id: token,
      token,
      name: metadata.name,
      size: metadata.size,
      expiresAt: this.formatDate(metadata.expirationDate),
      status: new Date(metadata.expirationDate) > new Date() ? 'active' : 'expired',
      protected: metadata.passwordRequired,
    };
  }

  async download(token: string, password: string): Promise<Blob> {
    return await firstValueFrom(this.http.post(
      `${API_CONFIG.baseUrl}/shares/${encodeURIComponent(token)}/download`,
      { password }, { responseType: 'blob' }));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_CONFIG.baseUrl}/files/${encodeURIComponent(id)}`));
  }

  formatSize(bytes: number): string {
    return `${(bytes / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Mo`;
  }

  private toSharedFile(metadata: FileMetadata): SharedFile {
    return {
      id: metadata.id,
      token: metadata.downloadLink.split('/').pop() ?? metadata.id,
      name: metadata.name,
      size: metadata.size,
      expiresAt: this.formatDate(metadata.expirationDate),
      status: metadata.linkStatus,
    };
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString('fr-FR');
  }
}
