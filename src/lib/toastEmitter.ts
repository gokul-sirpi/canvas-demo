import { TypeOptions, toast, Slide } from 'react-toastify';

export function emitToast(type: TypeOptions, message: string) {
  toast(message, {
    type,
    position: 'bottom-right',
    autoClose: 1500,
    hideProgressBar: true,
    pauseOnHover: true,
    transition: Slide,
  });
}
