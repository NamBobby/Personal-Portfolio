// Form Handler Module
class FormHandler {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.isSubmitting = false;
        
        this.init();
    }

    init() {
        this.setupDefaultValidators();
        this.bindFormEvents();
        this.setupFormEnhancements();
        
        console.log('FormHandler initialized');
    }

    setupDefaultValidators() {
        // Email validator
        this.validators.set('email', {
            validate: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            message: 'Please enter a valid email address'
        });

        // Required field validator
        this.validators.set('required', {
            validate: (value) => {
                return value && value.trim().length > 0;
            },
            message: 'This field is required'
        });

        // Phone validator
        this.validators.set('phone', {
            validate: (value) => {
                const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
                return phoneRegex.test(value);
            },
            message: 'Please enter a valid phone number'
        });

        // Name validator
        this.validators.set('name', {
            validate: (value) => {
                return value && value.trim().length >= 2;
            },
            message: 'Name must be at least 2 characters long'
        });

        // Message length validator
        this.validators.set('message', {
            validate: (value) => {
                return value && value.trim().length >= 10;
            },
            message: 'Message must be at least 10 characters long'
        });
    }

    bindFormEvents() {
        // Handle all forms with class 'portfolio-form' or forms in contact section
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.portfolio-form') || 
                e.target.closest('#section-contact')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });

        // Real-time validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('.portfolio-form input, .portfolio-form textarea') ||
                e.target.closest('#section-contact')) {
                this.validateField(e.target);
            }
        });

        // Focus events for enhanced UX
        document.addEventListener('focus', (e) => {
            if (e.target.matches('.portfolio-form input, .portfolio-form textarea')) {
                this.handleFieldFocus(e.target);
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.matches('.portfolio-form input, .portfolio-form textarea')) {
                this.handleFieldBlur(e.target);
            }
        }, true);
    }

    setupFormEnhancements() {
        // Auto-resize textareas
        this.setupAutoResizeTextareas();
        
        // Setup form field animations
        this.setupFieldAnimations();
        
        // Setup character counters
        this.setupCharacterCounters();
    }

    setupAutoResizeTextareas() {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
        });
    }

    setupFieldAnimations() {
        const formFields = document.querySelectorAll('.form-group input, .form-group textarea');
        formFields.forEach(field => {
            if (!field.closest('.form-group').querySelector('.field-label')) {
                this.createFloatingLabel(field);
            }
        });
    }

    createFloatingLabel(field) {
        const placeholder = field.placeholder;
        if (!placeholder) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const label = document.createElement('label');
        label.className = 'field-label';
        label.textContent = placeholder;
        label.style.cssText = `
            position: absolute;
            top: 50%;
            left: 15px;
            transform: translateY(-50%);
            color: #6b7280;
            transition: all 0.3s ease;
            pointer-events: none;
            background: white;
            padding: 0 5px;
            font-size: 1rem;
        `;

        formGroup.style.position = 'relative';
        formGroup.insertBefore(label, field);
        field.placeholder = '';

        // Handle label animation
        const updateLabel = () => {
            if (field.value || field === document.activeElement) {
                label.style.transform = 'translateY(-100%)';
                label.style.fontSize = '0.75rem';
                label.style.color = 'var(--primary-color)';
                label.style.top = '0';
            } else {
                label.style.transform = 'translateY(-50%)';
                label.style.fontSize = '1rem';
                label.style.color = '#6b7280';
                label.style.top = '50%';
            }
        };

        field.addEventListener('focus', updateLabel);
        field.addEventListener('blur', updateLabel);
        field.addEventListener('input', updateLabel);
        
        // Initial state
        updateLabel();
    }

    setupCharacterCounters() {
        const textFields = document.querySelectorAll('textarea[maxlength], input[maxlength]');
        textFields.forEach(field => {
            const maxLength = field.getAttribute('maxlength');
            if (maxLength) {
                this.addCharacterCounter(field, parseInt(maxLength));
            }
        });
    }

    addCharacterCounter(field, maxLength) {
        const formGroup = field.closest('.form-group');
        if (!formGroup || formGroup.querySelector('.char-counter')) return;

        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            position: absolute;
            bottom: -20px;
            right: 5px;
            font-size: 0.75rem;
            color: #6b7280;
        `;

        formGroup.style.position = 'relative';
        formGroup.appendChild(counter);

        const updateCounter = () => {
            const currentLength = field.value.length;
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength * 0.9) {
                counter.style.color = '#ef4444';
            } else if (currentLength > maxLength * 0.7) {
                counter.style.color = '#f59e0b';
            } else {
                counter.style.color = '#6b7280';
            }
        };

        field.addEventListener('input', updateCounter);
        updateCounter();
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

    validateField(field) {
        const validationRules = this.getValidationRules(field);
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Run validation rules
        for (const rule of validationRules) {
            const validator = this.validators.get(rule);
            if (validator && !validator.validate(value)) {
                isValid = false;
                errorMessage = validator.message;
                break;
            }
        }

        // Show error if validation failed
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    getValidationRules(field) {
        const rules = [];
        
        // Check data attributes
        if (field.hasAttribute('required')) rules.push('required');
        if (field.type === 'email') rules.push('email');
        if (field.type === 'tel') rules.push('phone');
        if (field.dataset.validate) {
            rules.push(...field.dataset.validate.split(','));
        }
        
        // Field name based rules
        const fieldName = field.name || field.id || '';
        if (fieldName.includes('name')) rules.push('name');
        if (fieldName.includes('message')) rules.push('message');
        
        return rules;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Add error class
        formGroup.classList.add('has-error');
        field.classList.add('error');

        // Create error message element
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.cssText = `
                color: #ef4444;
                font-size: 0.75rem;
                margin-top: 5px;
                animation: slideDown 0.3s ease;
            `;
            formGroup.appendChild(errorElement);
        }

        errorElement.textContent = message;
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('has-error');
        field.classList.remove('error');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleFormSubmission(form) {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm(form)) {
            this.showFormError(form, 'Please fix the errors above');
            return;
        }

        this.isSubmitting = true;
        const submitBtn = form.querySelector('.submit-btn, [type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        try {
            // Show loading state
            this.showLoadingState(submitBtn);

            // Collect form data
            const formData = this.collectFormData(form);

            // Submit form (simulate API call)
            const result = await this.submitForm(formData);

            if (result.success) {
                this.showSuccessState(form, submitBtn);
                this.resetForm(form);
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            this.showErrorState(form, submitBtn, error.message);
        } finally {
            // Reset button after delay
            setTimeout(() => {
                this.resetSubmitButton(submitBtn, originalText);
                this.isSubmitting = false;
            }, 3000);
        }
    }

    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    async submitForm(data) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real application, you would send data to your server
                console.log('Form data submitted:', data);
                resolve({ success: true, message: 'Form submitted successfully!' });
            }, 2000);
        });
    }

    showLoadingState(submitBtn) {
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        }
    }

    showSuccessState(form, submitBtn) {
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
            submitBtn.style.background = '#10b981';
        }

        // Show success message
        this.showFormMessage(form, 'Message sent successfully!', 'success');
    }

    showErrorState(form, submitBtn, message) {
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            submitBtn.style.background = '#ef4444';
        }

        this.showFormMessage(form, message, 'error');
    }

    resetSubmitButton(submitBtn, originalText) {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }
    }

    showFormMessage(form, message, type) {
        // Remove existing message
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message-${type}`;
        messageElement.style.cssText = `
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
            font-size: 0.9rem;
            animation: slideDown 0.3s ease;
            ${type === 'success' ? 'background: #d1fae5; color: #065f46; border: 1px solid #10b981;' : ''}
            ${type === 'error' ? 'background: #fee2e2; color: #991b1b; border: 1px solid #ef4444;' : ''}
        `;
        messageElement.textContent = message;

        form.appendChild(messageElement);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.remove();
            }
        }, 5000);
    }

    showFormError(form, message) {
        this.showFormMessage(form, message, 'error');
    }

    resetForm(form) {
        form.reset();
        
        // Clear all errors
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
        
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('has-error');
            }
        });

        // Reset floating labels
        const labels = form.querySelectorAll('.field-label');
        labels.forEach(label => {
            label.style.transform = 'translateY(-50%)';
            label.style.fontSize = '1rem';
            label.style.color = '#6b7280';
            label.style.top = '50%';
        });
    }

    // Add custom validator
    addValidator(name, validator) {
        this.validators.set(name, validator);
    }

    // Remove validator
    removeValidator(name) {
        this.validators.delete(name);
    }

    // Get form data as JSON
    getFormDataAsJSON(form) {
        const data = this.collectFormData(form);
        return JSON.stringify(data, null, 2);
    }

    // Cleanup
    destroy() {
        this.forms.clear();
        this.validators.clear();
        
        console.log('FormHandler destroyed');
    }
}

// Make available globally
window.FormHandler = FormHandler;