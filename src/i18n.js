/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Internationalization (i18n)
   ═══════════════════════════════════════════════════════════ */

export const translations = {
    es: {
        // General
        app_name: 'Tocaito',
        dashboard: 'Panel Control',
        links: 'Enlaces',
        tags: 'Etiquetas',
        analytics: 'Analítica',
        templates: 'Plantillas',
        settings: 'Ajustes',
        profile: 'Perfil',
        logout: 'Cerrar Sesión',
        admin: 'Administrador',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        loading: 'Cargando...',
        
        // Dashboard
        welcome_back: '¡Bienvenido de nuevo!',
        active_links: 'Enlaces Activos',
        registered_tags: 'Etiquetas Registradas',
        total_taps: 'Interacciones Totales',
        recent_activity: 'Actividad Reciente',
        no_activity: 'Sin actividad reciente. Crea un enlace para comenzar.',
        
        // Redirect / Scan
        new_tag_detected: '¡Nueva Etiqueta Detectada!',
        provisioned_welcome: '¡Tu nueva etiqueta está lista!',
        provisioned_desc: 'El administrador ha preparado esta etiqueta para ti. ¡Actívala ahora para comenzar!',
        unclaimed_desc: 'Esta etiqueta Tocaito está lista para ser activada. ¡Regístrala para gestionar tus enlaces!',
        activate_tag: '✨ Activar mi Etiqueta',
        claim_tag: '✨ Reclamar y Activar',
        login_to_activate: '🔑 Inicia sesión para activar',
        tag_id: 'ID de Etiqueta',
        access_denied: 'Acceso Denegado',
        already_provisioned: 'Esta etiqueta ya está asignada a otro cliente.',
        redirecting: 'Redirigiendo...',
        returning_in: 'Redirigiendo a tu destino en',
        go_now: '🚀 Ir Ahora',
        edit_destination: '✏️ Editar Destino',
        
        // Admin
        admin_console: 'Consola de Administrador',
        manage_global: 'Gestiona el estado global y etiquetas de clientes.',
        global_tags: 'Etiquetas Globales',
        global_links: 'Enlaces Globales',
        assign_to_client: 'Asignar a Cliente',
        select_client: 'Seleccionar Cliente Registrado',
        new_client_email: 'Correo de Nuevo Cliente',
        assign_and_provision: 'Asignar y Provisionar',
        
        // Writing
        write_nfc: 'Grabar Etiqueta NFC',
        tap_phone: 'Acerca la etiqueta al teléfono',
        keep_holding: 'Mantén la posición hasta terminar',
        tag_written: '¡Etiqueta grabada con éxito!',
        
        // Toast / Messages
        success: 'Éxito',
        error: 'Error',
        warning: 'Advertencia',
        tag_registered: '¡Etiqueta registrada en tu cuenta!',
        link_assigned: '¡Enlace asignado con éxito!',
    },
    en: {
        // General
        app_name: 'Tocaito',
        dashboard: 'Dashboard',
        links: 'Links',
        tags: 'Tags',
        analytics: 'Analytics',
        templates: 'Templates',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
        admin: 'Admin',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        loading: 'Loading...',
        
        // Dashboard
        welcome_back: 'Welcome Back!',
        active_links: 'Active Links',
        registered_tags: 'Registered Tags',
        total_taps: 'Total Interactions',
        recent_activity: 'Recent Activity',
        no_activity: 'No activity yet. Create a link to get started.',
        
        // Redirect / Scan
        new_tag_detected: 'New Tag Detected!',
        provisioned_welcome: 'Your new tag is ready!',
        provisioned_desc: 'The administrator has provisioned this tag for you. Activate it now to start using it!',
        unclaimed_desc: 'This Tocaito NFC tag is ready to be activated. Claim it now to start tracking your links!',
        activate_tag: '✨ Activate My Tag',
        claim_tag: '✨ Claim & Activate Tag',
        login_to_activate: '🔑 Login to Activate',
        tag_id: 'Tag ID',
        access_denied: 'Access Denied',
        already_provisioned: 'This tag is already provisioned to another client.',
        redirecting: 'Redirecting...',
        returning_in: 'Returning to your destination in',
        go_now: '🚀 Go Now',
        edit_destination: '✏️ Edit Destination',
        
        // Admin
        admin_console: 'Super Admin Console',
        manage_global: 'Manage global system state and all client tags.',
        global_tags: 'Global Tags',
        global_links: 'Global Links',
        assign_to_client: 'Assign Tag to Client',
        select_client: 'Select Registered Client',
        new_client_email: 'Enter New Client Email',
        assign_and_provision: 'Assign & Provision',
        
        // Writing
        write_nfc: 'Write NFC Tag',
        tap_phone: 'Hold Tag Against Phone',
        keep_holding: 'Keep it there until done',
        tag_written: 'Tag Written Successfully!',
        
        // Toast / Messages
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        tag_registered: 'Tag registered to your account!',
        link_assigned: 'Link assigned successfully!',
    }
};
