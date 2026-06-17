function mostrarToast(mensaje, tipo = 'success') {

    const toast = document.createElement('div');

    toast.className = `toast-online-doggie ${tipo}`;

    toast.innerHTML = `
        <span class="icono">
            ${tipo === 'success' ? '📧' : '❌'}
        </span>

        <div>
            <div>${mensaje}</div>

            ${
                tipo === 'success'
                ? '<div class="subtexto">Revisa tu bandeja de entrada 🐾</div>'
                : ''
            }
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4500);
}