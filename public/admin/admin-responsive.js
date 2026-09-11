// Responsive Admin Drawer and Tables handler
document.addEventListener('DOMContentLoaded', () => {
    // 1. Find sidebar and top-bar
    const sidebar = document.querySelector('.sidebar');
    const topBar = document.querySelector('.top-bar');

    if (!sidebar) return;

    // 2. Create and inject overlay if not present
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    // 3. Create and inject close button inside sidebar-header if not present
    const sidebarHeader = sidebar.querySelector('.sidebar-header');
    if (sidebarHeader && !sidebar.querySelector('.sidebar-close-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'sidebar-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.setAttribute('aria-label', 'إغلاق القائمة');
        sidebarHeader.style.position = 'relative';
        sidebarHeader.appendChild(closeBtn);

        closeBtn.addEventListener('click', closeSidebar);
    }

    // 4. Create and inject hamburger button in topBar if not present
    if (topBar && !topBar.querySelector('.admin-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'admin-menu-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-label', 'فتح القائمة');

        topBar.insertAdjacentElement('afterbegin', toggleBtn);

        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // 5. Overlay click closes sidebar
    overlay.addEventListener('click', closeSidebar);

    // 6. Close sidebar on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // 7. Auto-wrap any unwrapped <table> with .table-container
    document.querySelectorAll('table').forEach(table => {
        const parent = table.parentElement;
        if (!parent.classList.contains('table-container') && !parent.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container';
            parent.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });

    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Expose functions globally
    window.toggleAdminSidebar = toggleSidebar;
    window.closeAdminSidebar = closeSidebar;
});
