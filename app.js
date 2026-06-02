document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    
    const queryForm = document.getElementById('query-form');
    const queryBtn = document.getElementById('query-btn');
    const queryError = document.getElementById('query-error');
    
    const resultContainer = document.getElementById('result-container');
    const pdfViewer = document.getElementById('pdf-viewer');
    const downloadLink = document.getElementById('download-link');
    const closeResult = document.getElementById('close-result');

    // Utility: Show/Hide Spinner in buttons
    const setButtonLoading = (btn, isLoading) => {
        const span = btn.querySelector('span');
        const spinner = btn.querySelector('.spinner');
        if (isLoading) {
            span.classList.add('hidden');
            spinner.classList.remove('hidden');
            btn.disabled = true;
        } else {
            span.classList.remove('hidden');
            spinner.classList.add('hidden');
            btn.disabled = false;
        }
    };

    // 1. Check Authentication on Load
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/check-auth');
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated) {
                    showDashboard();
                } else {
                    showLogin();
                }
            } else {
                showLogin();
            }
        } catch (err) {
            showLogin();
        }
    };

    const showDashboard = () => {
        loginView.classList.add('hidden');
        loginView.classList.remove('active');
        dashboardView.classList.remove('hidden');
        // Slight delay to allow display:block to apply before fading in
        setTimeout(() => dashboardView.classList.add('active'), 50);
    };

    const showLogin = () => {
        dashboardView.classList.add('hidden');
        dashboardView.classList.remove('active');
        loginView.classList.remove('hidden');
        setTimeout(() => loginView.classList.add('active'), 50);
    };

    // 2. Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        setButtonLoading(loginBtn, true);

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showDashboard();
            } else {
                loginError.textContent = data.error || 'Erro ao fazer login';
            }
        } catch (err) {
            loginError.textContent = 'Erro de conexão com o servidor';
        } finally {
            setButtonLoading(loginBtn, false);
        }
    });

    // 3. Handle Query
    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        queryError.textContent = '';
        resultContainer.classList.add('hidden');
        setButtonLoading(queryBtn, true);

        const documentVal = document.getElementById('document').value;
        const type = document.getElementById('query-type').value;

        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document: documentVal, type })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Show PDF
                if (data.pdfUrl) {
                    pdfViewer.src = data.pdfUrl;
                    downloadLink.href = data.pdfUrl;
                    resultContainer.classList.remove('hidden');
                    
                    // Smooth scroll to result
                    setTimeout(() => {
                        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                } else {
                    queryError.textContent = 'Consulta realizada, mas PDF não encontrado.';
                }
            } else {
                if (res.status === 401) {
                    showLogin(); // Session expired
                } else {
                    queryError.textContent = data.error || 'Erro ao realizar consulta';
                }
            }
        } catch (err) {
            queryError.textContent = 'Erro de comunicação com o servidor.';
        } finally {
            setButtonLoading(queryBtn, false);
        }
    });

    // Close result
    closeResult.addEventListener('click', () => {
        resultContainer.classList.add('hidden');
        pdfViewer.src = '';
    });

    // Init
    checkAuth();
});
