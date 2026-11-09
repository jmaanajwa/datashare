import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FileService } from '../../core/service/file.service';
import { SharedFile } from '../../core/models/file';
import { AuthService } from '../../core/service/auth.service';
import { DashboardUserComponent } from './dashboard-user.component';

describe('DashboardUserComponent', () => {
  let fixture: ComponentFixture<DashboardUserComponent>;
  let component: DashboardUserComponent;
  let fileService: {
    list: jest.Mock;
    remove: jest.Mock;
  };
  let auth: { logout: jest.Mock };

  const files: SharedFile[] = [
    {
      id: 'active-file',
      token: 'active-token',
      name: 'photo.png',
      size: 2_000_000,
      expiresAt: '2030-01-01',
      status: 'active',
    },
    {
      id: 'expired-file',
      token: 'expired-token',
      name: 'archive.pdf',
      size: 1_000,
      expiresAt: '2020-01-01',
      status: 'expired',
    },
  ];

  beforeEach(async () => {
    fileService = {
      list: jest.fn().mockResolvedValue(files),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    auth = { logout: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [DashboardUserComponent],
      providers: [
        provideRouter([]),
        { provide: FileService, useValue: fileService },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads and displays the user files', () => {
    expect(fileService.list).toHaveBeenCalledTimes(1);
    expect(component.files()).toEqual(files);
    expect(fixture.nativeElement.querySelectorAll('.file-item')).toHaveLength(2);
  });

  it('filters files by status', () => {
    component.filter.set('active');
    fixture.detectChanges();

    expect(component.visible()).toEqual([files[0]]);
    expect(fixture.nativeElement.querySelectorAll('.file-item')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.file-item strong').textContent).toContain('photo.png');
  });

  it('removes a file from the list after deletion', async () => {
    await component.remove('active-file');

    expect(fileService.remove).toHaveBeenCalledWith('active-file');
    expect(component.files()).toEqual([files[1]]);
  });

  it('navigates to the upload page from the add-files button', () => {
    const addFiles = fixture.nativeElement.querySelector('.add-files') as HTMLAnchorElement;

    expect(addFiles.getAttribute('href')).toBe('/upload');
  });
});
