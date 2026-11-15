import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { DownloadFile } from '../../core/models/file';
import { FileService } from '../../core/service/file.service';
import { DownloadFileComponent } from './download-file.component';

describe('DownloadFileComponent', () => {
  let fixture: ComponentFixture<DownloadFileComponent>;
  let component: DownloadFileComponent;
  let fileService: {
    getDownload: jest.Mock;
    download: jest.Mock;
    formatSize: jest.Mock;
  };

  const activeFile: DownloadFile = {
    id: 'file-1',
    token: 'share-token',
    name: 'secret.txt',
    size: 10,
    expiresAt: 'demain',
    status: 'active',
    protected: true,
  };

  beforeEach(async () => {
    fileService = {
      getDownload: jest.fn().mockResolvedValue(activeFile),
      download: jest.fn().mockResolvedValue(new Blob(['content'])),
      formatSize: jest.fn().mockReturnValue('0,01 Mo'),
    };

    await TestBed.configureTestingModule({
      imports: [DownloadFileComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn().mockReturnValue('share-token') } } },
        },
        { provide: FileService, useValue: fileService },
        { provide: AuthService, useValue: { isAuthenticated: jest.fn().mockReturnValue(false) } },
      ],
    }).compileComponents();
  });

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(DownloadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('loads the shared file using the route token', async () => {
    await createComponent();

    expect(fileService.getDownload).toHaveBeenCalledWith('share-token');
    expect(component.file()).toEqual(activeFile);
    expect(component.loading()).toBe(false);
    expect(component.canDownload()).toBe(false);

    component.password = '1234';
    expect(component.canDownload()).toBe(true);
  });

  it('shows an error when the shared file cannot be loaded', async () => {
    fileService.getDownload.mockRejectedValueOnce(new Error('not found'));

    await createComponent();

    expect(component.file()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.error()).toContain('introuvable');
  });

  it('downloads the file with the entered password', async () => {
    await createComponent();
    component.password = '1234';

    const createObjectURL = jest.fn().mockReturnValue('blob:download');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    component.download();
    await Promise.resolve();

    expect(fileService.download).toHaveBeenCalledWith('share-token', '1234');
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:download');
  });

  it('shows an error when the download fails', async () => {
    await createComponent();
    component.password = 'wrong';
    fileService.download.mockRejectedValueOnce(new Error('forbidden'));

    component.download();
    await Promise.resolve();
    await Promise.resolve();

    expect(component.error()).toContain('Mot de passe incorrect');
  });
});
