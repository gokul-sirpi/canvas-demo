import { TypeOptions, toast, Slide } from 'react-toastify';

export function emitToast(type: TypeOptions, message: string) {
  toast(message, {
    type,
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: true,
    pauseOnHover: true,
    transition: Slide,
  });
}
