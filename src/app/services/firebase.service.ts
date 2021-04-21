import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class FirebaseAuthService {
  userData: any; // Save logged in user data

  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        localStorage.removeItem('mongoUser');
      }
    })
  }

  ReturnState() {
    return this.afAuth.authState;
  }

  // Sign in with email/password
  SignIn(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      }).catch((error) => {
        window.alert(error.message)
      })
  }

  // Sign up with email/password
  SignUp(email, password) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Reset Forggot password
  // ForgotPassword(passwordResetEmail) {
  //   return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
  //   .then(() => {
  //     window.alert('Password reset email sent, check your inbox.');
  //   }).catch((error) => {
  //     window.alert(error)
  //   })
  // }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('mongoUser'));
    return user !== null ? true : false;
  }

  // Update email and/or password
  UpdateEmailPassword (email?: string, password?: string): Promise<any> {
    const promiseArr: Array<Promise<void>> = [];
    return new Promise((resolve, reject) => {
      this.afAuth.currentUser
        .then((user) => {
          if (email) {
            const emailPromise = user.updateEmail(email)
            promiseArr.push(emailPromise);
          }
          if (password) {
            const passPromise = user.updatePassword(password)
            promiseArr.push(passPromise);
          }

          Promise.all(promiseArr)
            .then((values) => {
              resolve(values);
            })
            .catch((err) => {
              reject(err);
            })
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('mongoUser');
      this.router.navigate(['login']);
    })
  }
}