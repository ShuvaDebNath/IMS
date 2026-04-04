import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private expiryAt = 0;
  private warningShown = false;
  private intervalRef: any;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private appState: AppStateService
  ) {
    this.bindVisibilityEvents();
    this.restoreSessionFromStorage();
  }

  /**
   * On app load (e.g. after refresh), restore session timer from localStorage
   * so auto-logout still works when tokenExpiryAt is set.
   */
  private restoreSessionFromStorage(): void {
    try {
      const token = localStorage.getItem('token');
      const expiryAtStr = localStorage.getItem('tokenExpiryAt');
      if (!token || !expiryAtStr) return;
      const expiryAt = Number(expiryAtStr);
      if (isNaN(expiryAt) || expiryAt <= Date.now()) return;
      const remainingMs = expiryAt - Date.now();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      this.startSession(remainingMinutes);
    } catch {
      // ignore invalid storage
    }
  }

  startSession(expiryMinutes: number): void {
    console.log('✅ Session started, minutes:', expiryMinutes);

    this.expiryAt = Date.now() + expiryMinutes * 60 * 1000;
    this.warningShown = false;

    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }

    // this.ngZone.runOutsideAngular(() => {
    //   this.intervalRef = setInterval(() => {
    //     this.checkExpiry();
    //   }, 1000);
    // });
  }

  private checkExpiry(): void {
    const now = Date.now();
    const remainingMs = this.expiryAt - now;

    if (remainingMs <= 0) {
      this.ngZone.run(() => this.forceLogout());
      return;
    }

    if (remainingMs <= 2 * 60 * 1000 && !this.warningShown) {
      this.warningShown = true;

      this.ngZone.run(() => {
        let countdownInterval: any;
        Swal.fire({
          icon: 'warning',
          title: 'Session Expiring',
          html: 'You will be logged out in <strong id="session-countdown">60</strong> seconds due to inactivity.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          timer: 60000,
          didOpen: () => {
            let seconds = 60;
            const el = document.getElementById('session-countdown');
            countdownInterval = setInterval(() => {
              seconds -= 1;
              if (el) el.textContent = String(seconds);
              if (seconds <= 0 && countdownInterval) {
                clearInterval(countdownInterval);
              }
            }, 1000);
          },
          didClose: () => {
            if (countdownInterval) clearInterval(countdownInterval);
          }
        }).then(() => {
          this.forceLogout();
        });
      });
    }
  }

  private bindVisibilityEvents(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkExpiry();
      }
    });

    window.addEventListener('focus', () => {
      this.checkExpiry();
    });
  }

  forceLogout(): void {
    console.log('🚨 Session expired. Logging out.');

    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }

    localStorage.clear();
    sessionStorage.clear();
    this.appState.reset();

    this.router.navigate(['/login']);
  }
}