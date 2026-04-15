import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AppStateService } from './app-state.service';

/**
 * Cross-tab inactivity session service.
 *
 * How it works across multiple browser tabs
 * ─────────────────────────────────────────
 * • Every user interaction (click / key / mouse / touch / scroll) in ANY tab
 *   writes the current timestamp to localStorage key "lastActivity".
 * • localStorage fires a native "storage" event in every OTHER open tab
 *   whenever a key changes, so all tabs share the same last-active clock.
 * • A 1-second interval reads "lastActivity" from localStorage (not a local
 *   variable), so every tab measures idle time against the same shared value.
 * • If idle time exceeds the warning threshold, the warning dialog appears
 *   ONLY in tabs where the user is not currently active.
 * • If the user acts in ANY tab while the warning is visible in another tab,
 *   the storage event fires → the warning is dismissed automatically.
 * • Force-logout is broadcast via a "forceLogout" localStorage key so all
 *   tabs navigate to /login together.
 */
@Injectable({ providedIn: 'root' })
export class SessionService implements OnDestroy {

  // Show the warning this many ms before the idle timeout fires
  private readonly WARNING_LEAD_MS = 60_000; // 60 seconds

  // localStorage keys used for cross-tab communication
  private readonly KEY_LAST_ACTIVITY = 'lastActivity';
  private readonly KEY_FORCE_LOGOUT  = 'forceLogout';
  private readonly KEY_TOKEN_EXPIRY  = 'tokenExpiryAt';

  private inactivityTimeoutMs = 30 * 60 * 1000; // overwritten by startSession
  private intervalRef: any;
  private countdownInterval: any;
  private warningShown = false;
  private sessionActive = false;

  // Keep stable function references so addEventListener / removeEventListener pair correctly
  private readonly onActivity = () => this.recordActivity();
  private readonly onStorage  = (e: StorageEvent) => this.handleStorageEvent(e);

  private readonly ACTIVITY_EVENTS = [
    'mousemove', 'mousedown', 'keypress', 'touchstart', 'click', 'scroll'
  ];

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private appState: AppStateService
  ) {
    this.restoreSessionFromStorage();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Call once after a successful login (or on app boot when a valid token
   * already exists in localStorage).
   */
  startSession(expiryMinutes: number): void {
    this.inactivityTimeoutMs = expiryMinutes * 60 * 1000;
    this.sessionActive = true;
    this.warningShown  = false;

    // Mark "just logged in" as the last activity so the idle clock starts fresh
    this.recordActivity();

    this.bindActivityListeners();
    this.startInterval();
  }

  /** Record a user interaction in this tab and broadcast it to other tabs. */
  recordActivity(): void {
    if (!this.sessionActive) return;
    localStorage.setItem(this.KEY_LAST_ACTIVITY, Date.now().toString());
  }

  /** Hard logout — optionally broadcasts to other tabs. */
  forceLogout(broadcastToOtherTabs = true): void {
    if (!this.sessionActive && !broadcastToOtherTabs) return;

    this.sessionActive = false;
    this.warningShown  = false;

    this.stopInterval();
    this.unbindActivityListeners();

    if (broadcastToOtherTabs) {
      // Set key BEFORE clear so other tabs receive the storage event
      localStorage.setItem(this.KEY_FORCE_LOGOUT, '1');
    }

    Swal.close();
    localStorage.clear();
    sessionStorage.clear();
    this.appState.reset();

    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.stopInterval();
    this.unbindActivityListeners();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /** On hard refresh / new tab: restore session if a valid token still exists. */
  private restoreSessionFromStorage(): void {
    try {
      const token    = localStorage.getItem('token');
      const expiryAt = Number(localStorage.getItem(this.KEY_TOKEN_EXPIRY));
      if (!token || !expiryAt || expiryAt <= Date.now()) return;

      const remainingMs      = expiryAt - Date.now();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
      this.startSession(remainingMinutes);
    } catch {
      // ignore corrupt storage
    }
  }

  private startInterval(): void {
    this.stopInterval();
    this.ngZone.runOutsideAngular(() => {
      this.intervalRef = setInterval(() => this.checkInactivity(), 1_000);
    });
  }

  private stopInterval(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private bindActivityListeners(): void {
    this.ACTIVITY_EVENTS.forEach(ev =>
      document.addEventListener(ev, this.onActivity, { passive: true })
    );
    window.addEventListener('storage', this.onStorage);
  }

  private unbindActivityListeners(): void {
    this.ACTIVITY_EVENTS.forEach(ev =>
      document.removeEventListener(ev, this.onActivity)
    );
    window.removeEventListener('storage', this.onStorage);
  }

  /**
   * Fires in THIS tab when localStorage is changed by ANOTHER tab.
   * This is the core cross-tab sync mechanism.
   */
  private handleStorageEvent(e: StorageEvent): void {
    // Another tab was active → dismiss the warning if it is currently showing
    if (e.key === this.KEY_LAST_ACTIVITY && this.warningShown) {
      this.ngZone.run(() => {
        Swal.close();
        this.warningShown = false;
      });
    }

    // Another tab initiated a forced logout → follow suit (no re-broadcast)
    if (e.key === this.KEY_FORCE_LOGOUT && e.newValue === '1') {
      this.ngZone.run(() => this.forceLogout(false));
    }
  }

  /** Core inactivity check — runs every second, reads shared localStorage. */
  private checkInactivity(): void {
    if (!this.sessionActive) return;

    const lastActivity = Number(localStorage.getItem(this.KEY_LAST_ACTIVITY)) || 0;
    const idleMs       = Date.now() - lastActivity;
    const msLeft       = this.inactivityTimeoutMs - idleMs;

    if (msLeft <= 0) {
      // Fully timed out
      this.ngZone.run(() => this.forceLogout(true));
      return;
    }

    if (msLeft <= this.WARNING_LEAD_MS && !this.warningShown) {
      // Idle long enough to show warning
      this.warningShown = true;
      this.ngZone.run(() => this.showWarning(Math.round(msLeft / 1_000)));

    } else if (msLeft > this.WARNING_LEAD_MS && this.warningShown) {
      // THIS tab became active again while warning was open (e.g. user moved mouse)
      this.ngZone.run(() => {
        Swal.close();
        this.warningShown = false;
      });
    }
  }

  private showWarning(initialSeconds: number): void {
    let seconds = initialSeconds;

    Swal.fire({
      icon: 'warning',
      title: 'Session Expiring',
      html: `You will be logged out in <strong id="session-countdown">${seconds}</strong> seconds due to inactivity.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      //confirmButtonText: 'Stay Logged In',
      timer: seconds * 1_000,
      didOpen: () => {
        const el = document.getElementById('session-countdown');
        this.countdownInterval = setInterval(() => {
          seconds -= 1;
          if (el) el.textContent = String(Math.max(0, seconds));
          if (seconds <= 0) clearInterval(this.countdownInterval);
        }, 1_000);
      },
      didClose: () => {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Stay Logged In"
        this.recordActivity();
        this.warningShown = false;
      } else {
        // Timer elapsed with no response
        this.forceLogout(true);
      }
    });
  }
}
