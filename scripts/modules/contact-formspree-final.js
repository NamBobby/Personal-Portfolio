class ContactFormspree {
    constructor() {
        this.formspreeEndpoint = 'https://formspree.io/f/mnnvkyqv'; 
        this.isSubmitting = false;
        this.originalButtonText = '';
        
        this.init();
    }

    init() {
        this.setupFormHandlers();
        this.setupCharacterCounter();
        this.setupFieldValidation();
        console.log('✅ Formspree contact form initialized');
        console.log('📧 Email sẽ được gửi đến: lethpnam27@gmail.com');
    }

    setupFormHandlers() {
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#contact-form') || 
                e.target.closest('#section-contact') || 
                e.target.matches('.contact-form-element')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });

        // Form focus effects
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('#contact-form input, #contact-form textarea')) {
                this.handleFieldFocus(e.target);
            }
        });

        document.addEventListener('focusout', (e) => {
            if (e.target.matches('#contact-form input, #contact-form textarea')) {
                this.handleFieldBlur(e.target);
            }
        });
    }

    setupCharacterCounter() {
        const messageField = document.getElementById('contact-message');
        const charCount = document.getElementById('char-count');
        
        if (messageField && charCount) {
            messageField.addEventListener('input', () => {
                const count = messageField.value.length;
                charCount.textContent = count;
                
                // Change color based on limit
                if (count > 900) {
                    charCount.style.color = '#ef4444';
                } else if (count > 700) {
                    charCount.style.color = '#f59e0b';
                } else {
                    charCount.style.color = '#6b7280';
                }
            });
        }
    }

    setupFieldValidation() {
        // Real-time validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('#contact-form input, #contact-form textarea')) {
                this.validateField(e.target);
            }
        });
    }

    async handleFormSubmit(form) {
        if (this.isSubmitting) {
            console.log('⏳ Form is already submitting...');
            return;
        }

        console.log('📝 Form submitted, processing...');

        try {
            // Show loading state
            this.showLoadingState(form);
            this.isSubmitting = true;

            // Validate form
            const validationResult = this.validateForm(form);
            if (!validationResult.isValid) {
                this.showErrorMessage(form, validationResult.message);
                console.log('❌ Validation failed:', validationResult.message);
                return;
            }

            // Prepare and send form data
            const formData = this.prepareFormData(form);
            console.log('📤 Sending data:', formData);
            
            const result = await this.sendToFormspree(formData);

            if (result.success) {
                console.log('✅ Email sent successfully!');
                this.showSuccessMessage(form, '🎉 Message sent successfully! I\'ll get back to you soon.');
                this.resetForm(form);
                
                // Optional: Analytics tracking
                this.trackFormSubmission(formData);
            } else {
                throw new Error(result.message || 'Failed to send message');
            }

        } catch (error) {
            console.error('❌ Form submission failed:', error);
            this.showErrorMessage(form, `Failed to send message: ${error.message}`);
        } finally {
            this.hideLoadingState(form);
            this.isSubmitting = false;
        }
    }

    async sendToFormspree(formData) {
        try {
            console.log('🚀 Sending to Formspree...');
            
            const response = await fetch(this.formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    // Main form fields
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject || 'New Portfolio Contact',
                    message: formData.message,
                    
                    // Formspree specific fields
                    _replyto: formData.email,
                    _subject: `Portfolio Contact: ${formData.subject || 'New Message'} - From ${formData.name}`,
                    
                    // Additional metadata
                    timestamp: new Date().toLocaleString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    user_agent: navigator.userAgent,
                    page_url: window.location.href,
                    referrer: document.referrer || 'Direct'
                })
            });

            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Formspree response:', responseData);
                
                return {
                    success: true,
                    message: 'Message sent successfully',
                    data: responseData
                };
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Formspree error:', errorData);
                
                return {
                    success: false,
                    message: errorData.error || `Server error: ${response.status}`
                };
            }

        } catch (error) {
            console.error('❌ Network error:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    }

    prepareFormData(form) {
        const data = {};
        
        // Get form fields directly
        const nameField = form.querySelector('#contact-name') || form.querySelector('input[name="name"]');
        const emailField = form.querySelector('#contact-email') || form.querySelector('input[name="email"]');
        const subjectField = form.querySelector('#contact-subject') || form.querySelector('input[name="subject"]');
        const messageField = form.querySelector('#contact-message') || form.querySelector('textarea[name="message"]');

        data.name = nameField ? nameField.value.trim() : '';
        data.email = emailField ? emailField.value.trim() : '';
        data.subject = subjectField ? subjectField.value.trim() : '';
        data.message = messageField ? messageField.value.trim() : '';

        console.log('📋 Prepared form data:', data);
        return data;
    }

    validateForm(form) {
        const formData = this.prepareFormData(form);
        const errors = [];

        // Validate name
        if (!formData.name || formData.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Validate message
        if (!formData.message || formData.message.length < 10) {
            errors.push('Message must be at least 10 characters long');
        }

        // Check message length limit
        if (formData.message && formData.message.length > 1000) {
            errors.push('Message must be less than 1000 characters');
        }

        return {
            isValid: errors.length === 0,
            message: errors.join('. ')
        };
    }

    validateField(field) {
        const fieldName = field.name || field.id || 'field';
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
            case 'contact-name':
                if (value.length > 0 && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;
            case 'email':
            case 'contact-email':
                if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'message':
            case 'contact-message':
                if (value.length > 0 && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long';
                } else if (value.length > 1000) {
                    isValid = false;
                    errorMessage = 'Message must be less than 1000 characters';
                }
                break;
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Remove error styling
        formGroup.classList.remove('has-error');
        field.classList.remove('error');

        // Add error if invalid
        if (!isValid && errorMessage) {
            formGroup.classList.add('has-error');
            field.classList.add('error');

            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.style.cssText = `
                color: #ef4444;
                font-size: 0.75rem;
                margin-top: 5px;
                animation: slideDown 0.3s ease;
            `;

            formGroup.appendChild(errorElement);
        }
    }

    handleFieldFocus(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('focused');
        }
    }

    handleFieldBlur(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('focused');
        }
        
        // Validate on blur
        this.validateField(field);
    }

    showLoadingState(form) {
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            this.originalButtonText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }

        // Add loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'form-loading-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: var(--radius-lg);
            backdrop-filter: blur(2px);
        `;
        overlay.innerHTML = `
            <div style="text-align: center; color: var(--primary-color);">
                <div class="loader-spinner" style="margin: 0 auto 15px; width: 40px; height: 40px; border: 4px solid rgba(59, 130, 246, 0.3); border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="font-weight: 600; margin: 0;">Sending your message...</p>
            </div>
        `;

        const contactForm = form.querySelector('.contact-form') || form;
        contactForm.style.position = 'relative';
        contactForm.appendChild(overlay);
    }

    hideLoadingState(form) {
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn && this.originalButtonText) {
            submitBtn.innerHTML = this.originalButtonText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }

        // Remove loading overlay
        const overlay = form.querySelector('.form-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showSuccessMessage(form, message) {
        this.showFormMessage(form, message, 'success');
    }

    showErrorMessage(form, message) {
        this.showFormMessage(form, message, 'error');
    }

    showFormMessage(form, message, type) {
        // Remove existing messages
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message-${type}`;
        messageElement.style.cssText = `
            padding: 15px 20px;
            border-radius: var(--radius-lg);
            margin: 20px 0;
            font-size: 0.9rem;
            font-weight: 600;
            text-align: center;
            animation: slideDown 0.3s ease;
            ${type === 'success' ? 'background: #d1fae5; color: #065f46; border: 2px solid #10b981;' : ''}
            ${type === 'error' ? 'background: #fee2e2; color: #991b1b; border: 2px solid #ef4444;' : ''}
        `;

        messageElement.innerHTML = message;
        form.appendChild(messageElement);

        // Auto remove after 6 seconds
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.style.animation = 'slideUp 0.3s ease forwards';
                setTimeout(() => messageElement.remove(), 300);
            }
        }, 6000);
    }

    resetForm(form) {
        // Reset form fields
        form.reset();

        // Reset character counter
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = '0';
            charCount.style.color = '#6b7280';
        }

        // Clear all errors
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(el => el.remove());

        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('has-error');
            }
        });
    }

    trackFormSubmission(formData) {
        // Optional: Track form submissions for analytics
        try {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'contact',
                    'event_label': 'portfolio_contact_form'
                });
            }
            
            console.log('📊 Form submission tracked');
        } catch (error) {
            console.warn('⚠️ Analytics tracking failed:', error);
        }
    }

    // Public method for testing
    async sendTestMessage() {
        console.log('🧪 Sending test message...');
        
        const testData = {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Message from Portfolio',
            message: 'This is a test message to verify the contact form is working properly. Hello from the portfolio contact form!'
        };

        try {
            const result = await this.sendToFormspree(testData);
            console.log('Test message result:', result);
            return result;
        } catch (error) {
            console.error('Test message failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Debug method
    debugForm() {
        const form = document.getElementById('contact-form');
        if (!form) {
            console.error('❌ Contact form not found');
            return;
        }

        console.log('🔍 Form debug info:');
        console.log('Form element:', form);
        console.log('Form endpoint:', this.formspreeEndpoint);
        console.log('Form data:', this.prepareFormData(form));
        console.log('Form validation:', this.validateForm(form));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all components to load
    setTimeout(() => {
        window.contactFormspree = new ContactFormspree();
        
        // Make debug methods available
        window.testContactForm = () => window.contactFormspree.sendTestMessage();
        window.debugContactForm = () => window.contactFormspree.debugForm();
        
        console.log('🚀 Contact form ready!');
        console.log('💡 Test with: testContactForm()');
        console.log('🔍 Debug with: debugContactForm()');
    }, 1000);
});

// CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Make available globally
window.ContactFormspree = ContactFormspree;