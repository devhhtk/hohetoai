/**
 * login.js — Handles user authentication on the login page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.form-toggle-password');
    const socialButtons = document.querySelectorAll('.btn-social');

    // Initialize AumageDB if not already done
    if (window.AumageDB && !window.AumageDB.supabase) {
        window.AumageDB.init();
    }

    // --- Toggle Password Visibility ---
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            const eyeIcon = togglePasswordBtn.querySelector('.icon-eye');
            const eyeOffIcon = togglePasswordBtn.querySelector('.icon-eye-off');

            if (isPassword) {
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'flex';
            } else {
                eyeIcon.style.display = 'flex';
                eyeOffIcon.style.display = 'none';
            }
        });
    }

    // --- Handle Login ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const { data, error } = await AumageDB.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            console.log('Login successful:', data);
            
            // Fetch profile role directly from Supabase for fast redirection
            const { data: profile, error: profError } = await AumageDB.supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profError) {
                console.warn('Profile fetch error, defaulting to user dashboard:', profError.message);
                window.location.href = '../auth/dashboard.html';
                return;
            }

            const role = profile?.role || 'user';
            console.log('User role verified:', role);

            // Redirect based on role
            if (role === 'admin') {
                window.location.href = '../admin/dashboard.html';
            } else {
                window.location.href = '../auth/dashboard.html';
            }
        } catch (err) {
            console.error('Login error:', err.message);
            alert('Login failed: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // --- Handle Magic Link ---
    const magicLinkBtn = document.getElementById('btnMagicLink');
    if (magicLinkBtn) {
        magicLinkBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email) {
                alert('Please enter your email to receive a magic link.');
                return;
            }

            const originalText = magicLinkBtn.textContent;
            magicLinkBtn.disabled = true;
            magicLinkBtn.textContent = 'Sending...';

            try {
                const { error } = await AumageDB.supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin + '/auth/dashboard.html'
                    }
                });

                if (error) throw error;
                alert('Magic link sent! Check your email.');
            } catch (err) {
                console.error('Magic link error:', err.message);
                alert('Failed to send magic link: ' + err.message);
            } finally {
                magicLinkBtn.disabled = false;
                magicLinkBtn.textContent = originalText;
            }
        });
    }

    // --- Handle Social Logins ---
    socialButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const provider = btn.getAttribute('aria-label').toLowerCase().includes('google') ? 'google' : 'apple';

            try {
                const { error } = await AumageDB.supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: window.location.origin + '/auth/dashboard.html'
                    }
                });
                if (error) throw error;
            } catch (err) {
                console.error('Social login error:', err.message);
                alert('Social login failed: ' + err.message);
            }
        });
    });
});
