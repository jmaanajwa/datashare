import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
@Component({ selector:'app-login', standalone:true, imports:[ReactiveFormsModule,RouterLink,SiteHeaderComponent], templateUrl:'./login.component.html', styleUrl:'./login.component.scss' })
export class LoginComponent { submitted=signal(false); form; constructor(private readonly fb:FormBuilder,readonly auth:AuthService,private readonly router:Router){this.form=this.fb.nonNullable.group({email:['', [Validators.required,Validators.email]], password:['',Validators.required]});} async submit():Promise<void>{this.submitted.set(true);if(this.form.invalid)return;const ok=await this.auth.login(this.form.controls.email.value,this.form.controls.password.value);if(ok)void this.router.navigateByUrl('/dashboard');} }
