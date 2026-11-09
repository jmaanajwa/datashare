import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_CONFIG } from '../../core/config/api.config';
import { FileService } from '../../core/service/file.service';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';

@Component({ selector: 'app-upload-file', standalone: true, imports: [FormsModule, SiteHeaderComponent], templateUrl: './upload-file.component.html', styleUrl: './upload-file.component.scss' })
export class UploadFileComponent {
  file = signal<File | null>(null); uploading = signal(false); complete = signal(false); error = signal(''); link = signal(''); password = ''; expiration = '1'; dragActive = signal(false);
  readonly acceptedTypes = API_CONFIG.acceptedFileTypes;
  constructor(readonly files: FileService) {}
  choose(event: Event): void { const selected = (event.target as HTMLInputElement).files?.[0]; if (selected) this.select(selected); }
  drop(event: DragEvent): void { event.preventDefault(); this.dragActive.set(false); const dropped = event.dataTransfer?.files[0]; if (dropped) this.select(dropped); }
  select(value: File): void { this.error.set(value.size > this.files.maxUploadSizeBytes ? 'La taille maximale autorisée est de 1 Go.' : ''); if (!this.error()) { this.file.set(value); this.complete.set(false); } }
  remove(): void { this.file.set(null); this.complete.set(false); this.link.set(''); }
  async upload(): Promise<void> { if (!this.file()) { this.error.set('Choisissez un fichier avant de continuer.'); return; } this.uploading.set(true); this.error.set(''); try { const result = await this.files.upload(this.file()!, { password: this.password, expiration: this.expiration as '1' | '7' }); this.link.set(result.link); this.complete.set(true); } catch (error) { this.error.set((error as { error?: { message?: string } })?.error?.message ?? 'Impossible de téléverser le fichier.'); } finally { this.uploading.set(false); } }
  copy(): void { void navigator.clipboard?.writeText(this.link()); }
}
