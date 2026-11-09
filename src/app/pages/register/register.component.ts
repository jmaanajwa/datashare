import { Component, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
function matches(control: AbstractControl): ValidationErrors|null { return control.value === control.parent?.get('password')?.value ? null : { mismatch:true }; }
@Component({ selector:'app-register', standalone:true, imports:[ReactiveFormsModule,RouterLink,SiteHeaderComponent], templateUrl:'./register.component.html', styleUrl:'./register.component.scss' })
export class RegisterComponent { submitted=signal(false); confirmation=signal(''); form; constructor(private readonly fb:FormBuilder,readonly auth:AuthService,private readonly router:Router){this.form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required],confirmPassword:['',[Validators.required,matches]]});} async submit():Promise<void>{this.submitted.set(true);this.confirmation.set('');if(this.form.invalid)return;const ok=await this.auth.register(this.form.controls.email.value,this.form.controls.password.value);if(ok){this.confirmation.set('Compte créé. Vous pouvez maintenant vous connecter.');setTimeout(()=>void this.router.navigateByUrl('/login'),1000);}} }
