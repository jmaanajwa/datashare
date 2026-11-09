import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { UploadFileComponent } from './pages/upload-file/upload-file.component';
import { DownloadFileComponent } from './pages/download-file/download-file.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardUserComponent } from './pages/dashboard-user/dashboard-user.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    component: UploadFileComponent
  },
  {
    path: 'download/:token',
    component: DownloadFileComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    component: DashboardUserComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'upload'
  },
];
