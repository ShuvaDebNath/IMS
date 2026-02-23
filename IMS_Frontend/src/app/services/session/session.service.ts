import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private expiryTime = 0;
  private warningTime = 0;
  private intervalRef: any;
  private warningShown = false;

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {
    this.bindUserActivity();
  }

  /**
   * Call this AFTER successful login
   * expiryMinutes comes from backend response
   */
  startSession(expiryMinutes: number): void {
    this.clearSession();

    const now = Date.now();
    this.expiryTime = now + expiryMinutes * 60 * 1000;
    this.warningTime = this.expiryTime - (2 * 60 * 1000); // 2 min before expiry
    this.warningShown = false;

    this.ngZone.runOutsideAngular(() => {
      this.intervalRef = setInterval(() => this.checkSession(), 1000);
    });
  }

  private checkSession(): void {
    const now = Date.now();

    if (now >= this.warningTime && !this.warningShown) {
      this.warningShown = true;

      Swal.fire({
        title: 'Session Expiring',
        text: 'You will be logged out in 2 minutes due to inactivity.',
        icon: 'warning',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
    }

    if (now >= this.expiryTime) {
      this.forceLogout();
    }
  }

  /**
   * Called from interceptor on 401
   * OR from expiry timer
   */
  forceLogout(): void {
    this.clearSession();

    sessionStorage.clear();
    localStorage.clear();

    this.ngZone.run(() => {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    });
  }

  clearSession(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    this.warningShown = false;
  }

  /**
   * Activity only hides repeated warnings
   * DOES NOT extend token life
   */
  private bindUserActivity(): void {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    events.forEach(event => {
      document.addEventListener(event, () => {
        this.warningShown = false;
      });
    });
  }
}