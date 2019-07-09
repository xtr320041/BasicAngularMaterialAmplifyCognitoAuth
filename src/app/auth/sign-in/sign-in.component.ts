import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CognitoUser } from '@aws-amplify/auth';
import { NotificationService } from 'src/app/commonUI/notification.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoadingService } from 'src/app/commonUI/loading/loading.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  
  signinForm: FormGroup = new FormGroup({
    email: new FormControl('',[ Validators.email, Validators.required ]),
    password: new FormControl('', [ Validators.required, Validators.min(6) ])
  });
  
  hide = true;

  get emailInput() { return this.signinForm.get('email'); }
  get passwordInput() { return this.signinForm.get('password'); }

  constructor( 
    public auth: AuthService, 
    private _notification: NotificationService, 
    private _router: Router,
    private _loader: LoadingService ) { }

  getEmailInputError() {
    if (this.emailInput.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (this.emailInput.hasError('required')) {
      return 'An Email is required.';
    }
  }

  getPasswordInputError() {
    if (this.passwordInput.hasError('required')) {
      return 'A password is required.';
    }
  }

  signIn() {
    let myLoad = this._loader;
    myLoad.show();
    this.auth.signIn(this.emailInput.value, this.passwordInput.value)
      .then((user: CognitoUser|any) => {
      //.then((user: any) => {
        setTimeout(function(){ myLoad.hide(); }, 1000);
        this._router.navigate(['']);
      })
      .catch((error: any) => {
        console.log(error);
        setTimeout(function(){ myLoad.hide(); }, 1000);
        this._notification.show(error.message);
        switch (error.code) {
          case "UserNotConfirmedException":
            environment.confirm.email = this.emailInput.value;
            environment.confirm.password = this.passwordInput.value;
            this._router.navigate(['auth/confirm']);
            break;
          case "UsernameExistsException":
            this._router.navigate(['auth/signin']);
            break;
        }
      })
  }

  async signInWithFacebook() {
    const socialResult = await this.auth.socialSignIn(AuthService.FACEBOOK);
    console.log('fb Result:', socialResult);
  }

  async signInWithGoogle() {
    const socialResult = await this.auth.socialSignIn(AuthService.GOOGLE);
    console.log('google Result:', socialResult);
    localStorage.setItem("google Result", JSON.stringify(socialResult));
  }
}
