import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../core/service/file.service';
import { DownloadFile } from '../../core/models/file';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';

@Component({
  selector: 'app-download-file',
  standalone: true,
  imports: [FormsModule, SiteHeaderComponent],
  templateUrl: './download-file.component.html',
  styleUrl: './download-file.component.scss',
})
export class DownloadFileComponent implements OnInit {
  loading = signal(true);
  file = signal<DownloadFile | null>(null);
  error = signal('');
  password = '';

  constructor(private readonly route: ActivatedRoute, readonly files: FileService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.file.set(await this.files.getDownload(this.route.snapshot.paramMap.get('token') ?? ''));
    } catch {
      this.error.set('Ce fichier est introuvable ou le lien a expiré.');
    } finally {
      this.loading.set(false);
    }
  }

  canDownload(): boolean {
    const file = this.file();
    return !!file && file.status === 'active' && (!file.protected || this.password.length > 0);
  }

  download(): void {
    const file = this.file();
    if (!file || !this.canDownload()) return;

    void this.files.download(file.token, this.password).then(blob => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
    }).catch(() => this.error.set('Mot de passe incorrect ou téléchargement impossible.'));
  }
}
