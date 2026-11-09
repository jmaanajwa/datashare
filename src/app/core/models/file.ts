export type FileStatus = 'active' | 'expired';

export interface SharedFile {
  id: string;
  token: string;
  name: string;
  size: number;
  expiresAt: string;
  status: FileStatus;
  protected?: boolean;
}

export interface DownloadFile extends SharedFile {
}
