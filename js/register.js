/**
 * register.js — Handles user registration on the signup page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.querySelectorAll('.form-toggle-password');
    const socialButtons = document.querySelectorAll('.btn-social');

    // Initialize AumageDB if not already done
    if (window.AumageDB && !window.AumageDB.supabase) {
        window.AumageDB.init();
    }

    // --- Toggle Password Visibility ---
    togglePasswordBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            const isPassword = targetInput.type === 'password';
            targetInput.type = isPassword ? 'text' : 'password';
            
            const eyeIcon = btn.querySelector('.icon-eye');
            const eyeOffIcon = btn.querySelector('.icon-eye-off');
            
            if (isPassword) {
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'flex';
            } else {
                eyeIcon.style.display = 'flex';
                eyeOffIcon.style.display = 'none';
            }
        });
    });

    // --- Handle Registration ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!fullname || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            const { data, error } = await AumageDB.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullname
                    },
                    redirectTo: window.location.origin + '/auth/dashboard.html'
                }
            });

            if (error) throw error;

            console.log('Registration successful:', data);
            
            if (data.user && data.session) {
                // User is immediately logged in - redirect to dashboard
                window.location.href = '../auth/dashboard.html';
            } else {
                // Email confirmation might be required
                alert('Registration successful! Please check your email for confirmation.');
                window.location.href = '../pages/login.html';
            }
        } catch (err) {
            console.error('Registration error:', err.message);
            alert('Registration failed: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // --- Handle Social Logins (Same logic as login.js) ---
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
