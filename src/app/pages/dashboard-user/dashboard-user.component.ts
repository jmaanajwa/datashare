import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileService } from '../../core/service/file.service';
import { SharedFile } from '../../core/models/file';
import { AuthService } from '../../core/service/auth.service';

type FileFilter = 'all' | 'active' | 'expired';
type FileType = 'image' | 'audio' | 'video' | 'document';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.scss',
})
export class DashboardUserComponent implements OnInit {
  readonly files = signal<SharedFile[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly filter = signal<FileFilter>('all');
  readonly deletingId = signal<string | null>(null);

  constructor(readonly fileService: FileService, readonly auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.files.set(await this.fileService.list());
    } catch {
      this.error.set('Impossible de charger vos fichiers.');
    } finally {
      this.loading.set(false);
    }
  }

  visible(): SharedFile[] {
    const selected = this.filter();
    return this.files().filter(file => selected === 'all' || file.status === selected);
  }

  fileType(name: string): FileType {
    const extension = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension ?? '')) return 'image';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension ?? '')) return 'audio';
    if (['mp4', 'mov', 'avi', 'webm'].includes(extension ?? '')) return 'video';
    return 'document';
  }

  expirationLabel(date: string): string {
    const expiration = new Date(date);
    const days = Math.max(0, Math.ceil((expiration.getTime() - Date.now()) / 86_400_000));
    return days === 1 ? '1 jour' : `${days} jours`;
  }

  async remove(id: string): Promise<void> {
    this.deletingId.set(id);
    try {
      await this.fileService.remove(id);
      this.files.update(files => files.filter(file => file.id !== id));
    } catch {
      this.error.set('Impossible de supprimer ce fichier.');
    } finally {
      this.deletingId.set(null);
    }
  }
}
