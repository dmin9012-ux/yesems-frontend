import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    // Personalización con tus colores
    background: '#ffffff',
    color: '#00003f',
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const notify = (icon, title) => {
    Toast.fire({
        icon,
        title,
        // La barra de progreso será tu color amarillo #fcb424
        timerProgressBar: true,
        customClass: {
            timerProgressBar: 'my-toast-progress-bar'
        }
    });
};

export const confirmDialog = (title, text, icon = 'warning') => {
    return Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#00003f', // Azul profundo para confirmar
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        color: '#00003f'
    });
};