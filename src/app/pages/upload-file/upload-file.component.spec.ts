import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { FileService } from '../../core/service/file.service';
import { UploadFileComponent } from './upload-file.component';

describe('UploadFileComponent', () => {
  let fixture: ComponentFixture<UploadFileComponent>;
  let component: UploadFileComponent;
  let fileService: {
    maxUploadSizeBytes: number;
    upload: jest.Mock;
    formatSize: jest.Mock;
  };

  beforeEach(async () => {
    fileService = {
      maxUploadSizeBytes: 10,
      upload: jest.fn(),
      formatSize: jest.fn().mockReturnValue('0 Mo'),
    };

    await TestBed.configureTestingModule({
      imports: [UploadFileComponent],
      providers: [
        provideRouter([]),
        { provide: FileService, useValue: fileService },
        { provide: AuthService, useValue: { isAuthenticated: jest.fn().mockReturnValue(false) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('selects a file within the configured size limit', () => {
    const file = new File(['small'], 'photo.png', { type: 'image/png' });

    component.select(file);

    expect(component.file()).toBe(file);
    expect(component.error()).toBe('');
    expect(component.complete()).toBe(false);
  });

  it('rejects a file larger than the configured size limit', () => {
    const file = new File(['this file is too large'], 'large.pdf', { type: 'application/pdf' });

    component.select(file);

    expect(component.file()).toBeNull();
    expect(component.error()).toContain('taille maximale');
  });

  it('uploads the selected file and exposes the share link', async () => {
    const file = new File(['small'], 'photo.png', { type: 'image/png' });
    component.select(file);
    component.password = '1234';
    component.expiration = '7';
    fileService.upload.mockResolvedValue({ link: 'http://localhost/share/token', expiresAt: new Date() });

    await component.upload();

    expect(fileService.upload).toHaveBeenCalledWith(file, { password: '1234', expiration: '7' });
    expect(component.link()).toBe('http://localhost/share/token');
    expect(component.complete()).toBe(true);
    expect(component.uploading()).toBe(false);
  });

  it('shows the backend error when uploading fails', async () => {
    const file = new File(['small'], 'photo.png', { type: 'image/png' });
    component.select(file);
    fileService.upload.mockRejectedValue({ error: { message: 'Quota dépassé' } });

    await component.upload();

    expect(component.error()).toBe('Quota dépassé');
    expect(component.complete()).toBe(false);
    expect(component.uploading()).toBe(false);
  });

  it('reports that a file must be selected before uploading', async () => {
    await component.upload();

    expect(fileService.upload).not.toHaveBeenCalled();
    expect(component.error()).toContain('Choisissez un fichier');
  });
});
