/* ═══════════════════════════════════════════════════════════
   NFC Tag Manager — Internationalization (i18n)
   ═══════════════════════════════════════════════════════════ */

export const translations = {
    es: {
        // Sidebar & Nav
        dashboard: 'Inicio',
        tags: 'Tags',
        links: 'Links',
        analytics: 'Stats',
        templates: 'Docs',
        profile: 'Perfil',
        admin: 'Admin',
        logout: 'Salir',

        // Dashboard
        welcome_back: 'Bienvenido de nuevo',
        active_links: 'Enlaces Activos',
        registered_tags: 'Etiquetas Registradas',
        total_taps: 'Escaneos Totales',
        recent_activity: 'Actividad Reciente',
        no_activity: 'No hay actividad reciente en tu cuenta.',
        quick_actions: 'Acciones Rápidas y Simulador NFC',
        simulate_tap: '⚡ Simular Toque NFC (0.4s)',
        tap_simulated: '¡Toque NFC de 0.4s simulado con éxito!',

        // Admin
        admin_console: 'Consola de Administrador',
        manage_global: 'Gestionar Sistema Global de Etiquetas',
        global_tags: 'Etiquetas Globales',
        global_links: 'Enlaces Globales',
        assign_to_client: 'Asignar a Cliente',
        select_client: 'Seleccionar un cliente existente',
        new_client_email: 'O registrar un nuevo email de cliente:',
        assign_and_provision: 'Asignar y Provisionar',

        // Redirect / Scanning
        new_tag_detected: 'Nueva Etiqueta Tocaito',
        unclaimed_desc: 'Esta etiqueta aún no ha sido reclamada. Haz clic abajo para asociarla a tu cuenta.',
        login_to_activate: 'Iniciar Sesión para Activar',
        claim_tag: 'Reclamar y Activar Etiqueta',
        provisioned_welcome: 'Etiqueta Provisionada Encontrada',
        provisioned_desc: 'Hemos detectado que esta etiqueta te pertenece. Actívala ahora o hazlo más tarde en el panel.',
        activate_tag: 'Activar Etiqueta',
        cancel: 'Cancelar',
        tag_registered: '¡Etiqueta registrada en tu cuenta!',
        link_assigned: '¡Enlace asignado con éxito!',
        your_links: 'Tus Enlaces',
        confirm: 'Confirmar Asignación',

        // Core Actions & Messages
        success: '¡Éxito!',
        error: 'Error de operación. Inténtalo de nuevo.',
        warning: 'Aviso',
        settings: 'Ajustes',

        // Redirect Updates
        tag_id: 'ID de Etiqueta',
        access_denied: 'Acceso Denegado',
        already_provisioned: 'Esta etiqueta ya está asignada a otro cliente.',
        redirecting: 'Redirigiendo...',
        returning_in: 'Redirigiendo a tu destino en',
        go_now: '🚀 Ir Ahora',
        edit_destination: '✏️ Editar Destino',

        // Writing
        write_nfc: 'Programar Etiqueta NFC',
        tap_phone: 'Acerca la Etiqueta al Teléfono',
        keep_holding: 'Mantenla cerca hasta completar',
        tag_written: '¡Etiqueta Programada con Éxito!',

        // Login Page
        login_subtitle: 'Gestión Profesional de Etiquetas NFC',
        sign_in_google: 'Iniciar sesión con Google',
        login_hint: 'Gestión Segura en la Nube para Experiencias Físico-Digitales',

        // Tags Page
        manage_tags: 'Gestiona tus etiquetas NFC',
        search_tags: 'Buscar etiquetas...',
        register_tag: 'Registrar Etiqueta',
        no_tags: 'No hay etiquetas registradas',
        no_tags_desc: 'Registra una etiqueta NFC para empezar a asignar enlaces.',
        sn: 'SN',
        no_link_assigned: 'Sin enlace asignado',
        locked: 'Bloqueada',
        geo_tagged: 'Geo-etiquetada',
        reassign: 'Reasignar',
        assign_link: 'Asignar Enlace',

        // Links Page
        my_links: 'Mis Enlaces',
        manage_links: 'Gestiona los enlaces dinámicos de tus etiquetas',
        create_link: 'Crear Enlace',
        no_links: 'No has creado enlaces',
        no_links_desc: 'Crea un enlace para dirigir tus etiquetas NFC a cualquier URL.',
        delete: 'Eliminar',
        edit: 'Editar',

        // Profile Page
        profile_sub: 'Gestiona tu cuenta y plan',
        user_account: 'Cuenta de Usuario',
        current_plan: 'Plan Actual',
        pro_trial: 'Prueba Pro',
        free_tier: 'Plan Gratuito',
        free_desc: 'Actualmente estás en el plan gratuito limitado.',
        pro_desc: 'Tienes acceso a todas las funciones premium.',
        upgrade_pro: 'Actualizar a Pro ($9.99/mes)',
        start_trial: 'Comenzar Prueba Gratuita de 14 días',
        refer_friend: 'Recomendar a un Amigo',
        refer_desc: '¡Comparte Tocaito! Cuando se registren usando tu enlace, extenderemos tu prueba premium.',
        copy_link: 'Copiar Enlace',
        plan_comparison: 'Comparación de Planes'
    },
    en: {
        // Sidebar & Nav
        dashboard: 'Home',
        tags: 'Tags',
        links: 'Links',
        analytics: 'Stats',
        templates: 'Docs',
        profile: 'Profile',
        admin: 'Admin',
        logout: 'Sign Out',

        // Dashboard
        welcome_back: 'Welcome back',
        active_links: 'Active Links',
        registered_tags: 'Registered Tags',
        total_taps: 'Total Scans/Taps',
        recent_activity: 'Recent Activity',
        no_activity: 'No recent activity on your account.',
        quick_actions: 'Quick Actions & NFC Simulator',
        simulate_tap: '⚡ Simulate NFC Tap (0.4s)',
        tap_simulated: '0.4s Contactless NFC Tap simulated!',

        // Admin
        admin_console: 'Super Admin Console',
        manage_global: 'Manage Global Tag System',
        global_tags: 'Global Tags',
        global_links: 'Global Links',
        assign_to_client: 'Assign to Client',
        select_client: 'Select existing client',
        new_client_email: 'Or register new client email:',
        assign_and_provision: 'Assign & Provision',

        // Redirect / Scanning
        new_tag_detected: 'New Tocaito Tag Detected',
        unclaimed_desc: 'This tag has not been claimed yet. Click below to add it to your account.',
        login_to_activate: 'Login to Activate',
        claim_tag: 'Claim and Activate Tag',
        provisioned_welcome: 'Provisioned Tag Found',
        provisioned_desc: 'We detected this tag belongs to you. Activate it now or do it later from your dashboard.',
        activate_tag: 'Activate Tag',
        cancel: 'Cancel',
        tag_registered: 'Tag registered to your account!',
        link_assigned: 'Link assigned successfully!',
        your_links: 'Your Links',
        confirm: 'Confirm Assignment',

        // Core Actions & Messages
        success: 'Success!',
        error: 'Operation failed. Please try again.',
        warning: 'Warning',
        settings: 'Settings',

        // Redirect Updates
        tag_id: 'Tag ID',
        access_denied: 'Access Denied',
        already_provisioned: 'This tag is already provisioned to another client.',
        redirecting: 'Redirecting...',
        returning_in: 'Returning to your destination in',
        go_now: '🚀 Go Now',
        edit_destination: '✏️ Edit Destination',

        // Writing
        write_nfc: 'Write NFC Tag',
        tap_phone: 'Hold Tag Against Phone',
        keep_holding: 'Keep it there until done',
        tag_written: 'Tag Written Successfully!',

        // Login Page
        login_subtitle: 'Professional Physical-Digital NFC Tag Management',
        sign_in_google: 'Sign in with Google',
        login_hint: 'Cloud-Managed Contactless Experiences & Dynamic Redirects',

        // Tags Page
        manage_tags: 'Manage your physical NFC tags',
        search_tags: 'Search tags...',
        register_tag: 'Register Tag',
        no_tags: 'No tags registered yet',
        no_tags_desc: 'Register an NFC tag to start assigning dynamic cloud links.',
        sn: 'SN',
        no_link_assigned: 'No link assigned',
        locked: 'Locked',
        geo_tagged: 'Geo-tagged',
        reassign: 'Reassign',
        assign_link: 'Assign Link',

        // Links Page
        my_links: 'My Links',
        manage_links: 'Manage dynamic destination links for your tags',
        create_link: 'Create Link',
        no_links: 'No links created yet',
        no_links_desc: 'Create a dynamic link to route your NFC tags to any destination URL.',
        delete: 'Delete',
        edit: 'Edit',

        // Profile Page
        profile_sub: 'Manage your account and subscription plan',
        user_account: 'User Account',
        current_plan: 'Current Plan',
        pro_trial: 'Pro Trial',
        free_tier: 'Free Tier',
        free_desc: 'You are currently on the limited free tier.',
        pro_desc: 'You have full access to all premium NFC management features.',
        upgrade_pro: 'Upgrade to Pro ($9.99/mo)',
        start_trial: 'Start 14-Day Free Trial',
        refer_friend: 'Refer a Friend',
        refer_desc: 'Share Tocaito! When friends sign up with your link, we extend your premium trial.',
        copy_link: 'Copy Link',
        plan_comparison: 'Plan Comparison'
    }
};
