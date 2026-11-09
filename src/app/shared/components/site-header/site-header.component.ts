import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';

@Component({ selector: 'app-site-header', standalone: true, imports: [RouterLink], templateUrl: './site-header.component.html', styleUrl: './site-header.component.scss' })
export class SiteHeaderComponent {
  constructor(readonly auth: AuthService) {}
}
