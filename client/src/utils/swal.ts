import Swal from 'sweetalert2';
import { playSound } from './sound';

/**
 * Clamber Alert Utility
 * Provides themed SweetAlert2 configurations that match the Clamber UI.
 */

const commonOptions = {
  customClass: {
    popup: 'clamber-swal-popup',
    title: 'clamber-swal-title',
    confirmButton: 'clamber-swal-confirm',
    cancelButton: 'clamber-swal-cancel',
    container: 'clamber-swal-container'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  }
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  if (icon === 'success') playSound('success');
  Toast.fire({
    icon,
    title
  });
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  return Swal.fire({
    ...commonOptions,
    title,
    text,
    icon,
    confirmButtonText: 'Got it'
  });
};

export const showConfirm = (title: string, text: string, confirmText = 'Yes, proceed', cancelText = 'Cancel') => {
  return Swal.fire({
    ...commonOptions,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
};

export const showError = (title: string, text: string) => {
  return Swal.fire({
    ...commonOptions,
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Dismiss'
  });
};

export const showSuccess = (title: string, text: string) => {
  playSound('complete');
  return Swal.fire({
    ...commonOptions,
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Great'
  });
};
