
import { Injectable, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import Auth, { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Hub, ICredentials } from '@aws-amplify/core';
import { CognitoUser } from 'amazon-cognito-identity-js';

export interface NewUser {
  email: string,
  phone: string,
  password: string,
  firstName: string,
  lastName: string
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  @Output() fireIsLoggedIn: EventEmitter<any> = new EventEmitter<any>();

  public loggedIn: boolean;
  private _authState: Subject<CognitoUser|any> = new Subject<CognitoUser|any>();
  authState: Observable<CognitoUser|any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut'; 
  public static FACEBOOK = CognitoHostedUIIdentityProvider.Cognito;
  public static GOOGLE = CognitoHostedUIIdentityProvider.Google;

  constructor() { 
    
    Hub.listen('auth',(data) => {
      const { channel, payload } = data;
      if (channel === 'auth') {
        this._authState.next(payload.event);
      }
    });

  }
  
  signUp(user: NewUser): Promise<CognitoUser|any> {
    return new Promise((resolve,reject) => {
      Auth.signUp({
        "username": user.email,
        "password": user.password,
        "attributes": {
          "email": user.email,
          "given_name": user.firstName,
          "family_name": user.lastName,
          "phone_number": user.phone
        }
      })
      .then((user: CognitoUser|any) => {
        // this.loggedIn = true;
        // this.fireIsLoggedIn.emit(true); 
        // localStorage.setItem('IsLoggin', 'true');
        console.log(user);
        console.log(localStorage);
        resolve(user);
      }).catch((error: any) => reject(error));
    });
  }

  // signUp(user: NewUser): Promise<any> {
  //   return new Promise((resolve,reject) => {
  //       setTimeout(() => {
  //         resolve(true)
  //       }, 2000);
  //   });
  // }


  signIn(username: string, password: string):Promise<CognitoUser|any> {
    return new Promise((resolve,reject) => {
      Auth.signIn(username,password)
      .then((user: CognitoUser|any) => {
        this.loggedIn = true;
        this.fireIsLoggedIn.emit(true); 
        localStorage.setItem('IsLoggin', 'true');
        console.log(user);
        console.log(localStorage);
        resolve(user);
      }).catch((error: any) => reject(error));
    });
  }

  // signIn(username: string, password: string):Promise<any> {
  //   return new Promise((resolve,reject) => {
  //     setTimeout(() => {
  //       resolve(true)
  //     }, 2000);
  //   });
  // }  

  signOut(): Promise<any> {
    return new Promise((resolve,reject) => {
      Auth.signOut()
      .then(() => {
        this.loggedIn = false;
        localStorage.clear();
        this.fireIsLoggedIn.emit(false); 
        resolve(true);
      }).catch((error: any) => reject(error));
    });
  }

  // signOut(): Promise<any> {
  //   return new Promise((resolve,reject) => {
  //     setTimeout(() => {
  //       resolve(true)
  //     }, 2000);
  //   });
  // }

  socialSignIn(provider:CognitoHostedUIIdentityProvider): Promise<ICredentials> {
    return Auth.federatedSignIn({
      'provider': provider
    });
  }

  getCurrentUser():Promise<CognitoUser|any> {
    return new Promise((resolve,reject) => {
      Auth.currentUserInfo()
      .then(user => resolve(user))
      .catch(err => reject(err));      
    });
  }

  getCurrentAuthenticatedUser():Promise<any> {
    return new Promise((resolve,reject) => {
      Auth.currentAuthenticatedUser()
      .then(user => resolve(user))
      .catch(err => reject(err));      
    });
  }

  confirmSignUp(username: string, code: string):Promise<any> {
    return new Promise((resolve,reject) => {
      Auth.confirmSignUp(username, code)
      .then(user => resolve(user))
      .catch(err => reject(err));      
    });
  }

  resendSignUp(email: string):Promise<any> {
    return new Promise((resolve,reject) => {
      Auth.resendSignUp(email)
      .then(() => resolve(true))
      .catch((err) => reject(err));    
    });
  }

  updateAttributes(user: CognitoUser | any, attributes: object):Promise<any> {
    return new Promise((resolve,reject) => {
      Auth.updateUserAttributes(user, attributes)
      .then(() => resolve(true))
      .catch((err) => reject(err));    
    });
  }  

  // return Auth.currentAuthenticatedUser()
  // .then(() => {
  //   this._router.navigate(['auth/profile']);
  //   return false;
  // })
  // .catch(() => {
  //   return true;
  // });

  // socialSignIn(any): Promise<any> {
  //   return new Promise((resolve,reject) => {
  //     setTimeout(() => {
  //       resolve(true)
  //     }, 2000);
  //   });
  // }
  
  getEmitter() {
    return this.fireIsLoggedIn;
  }
  
}
