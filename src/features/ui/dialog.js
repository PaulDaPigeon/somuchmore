// Dialog Module - Reusable modal dialogs for confirmations and messages

import infoIconSVG from '../../assets/icons/info.svg';
import successIconSVG from '../../assets/icons/success.svg';
import warningIconSVG from '../../assets/icons/warning.svg';
import errorIconSVG from '../../assets/icons/error.svg';

export const Dialog = {
    /**
     * Show a message dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {string} type - 'info', 'success', 'warning', or 'error'
     */
    showMessage(title, message, type = 'info') {
        return new Promise((resolve) => {
            const dialog = this._createDialog(title, message, type, [
                { text: 'OK', type: 'primary', onClick: () => resolve(true) }
            ]);
            document.body.appendChild(dialog);
        });
    },

    /**
     * Show a confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Object} options - Optional configuration
     */
    showConfirm(title, message, options = {}) {
        const {
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'warning'
        } = options;

        return new Promise((resolve) => {
            const dialog = this._createDialog(title, message, type, [
                { text: cancelText, type: 'secondary', onClick: () => resolve(false) },
                { text: confirmText, type: 'danger', onClick: () => resolve(true) }
            ]);
            document.body.appendChild(dialog);
        });
    },

    /**
     * Internal: Create dialog element
     */
    _createDialog(title, message, type, buttons) {
        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 flex items-center justify-center';
        dialog.setAttribute('data-somuchmore-dialog', 'true');

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity';
        backdrop.addEventListener('click', () => {
            if (buttons.length === 1) {
                // If only one button (OK), close on backdrop click
                this._closeDialog(dialog, buttons[0].onClick);
            }
        });

        // Dialog panel
        const panel = document.createElement('div');
        panel.className = 'relative bg-white dark:bg-mydark-600 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all';

        // Icon and color based on type
        const typeStyles = {
            info: {
                icon: `<div class="w-6 h-6">${infoIconSVG}</div>`,
                color: 'text-blue-600 dark:text-blue-400'
            },
            success: {
                icon: `<div class="w-6 h-6">${successIconSVG}</div>`,
                color: 'text-green-600 dark:text-green-400'
            },
            warning: {
                icon: `<div class="w-6 h-6">${warningIconSVG}</div>`,
                color: 'text-yellow-600 dark:text-yellow-400'
            },
            error: {
                icon: `<div class="w-6 h-6">${errorIconSVG}</div>`,
                color: 'text-red-600 dark:text-red-400'
            }
        };

        const style = typeStyles[type] || typeStyles.info;

        panel.innerHTML = `
            <div class="p-6">
                <div class="flex items-start">
                    <div class="flex-shrink-0 ${style.color}">
                        ${style.icon}
                    </div>
                    <div class="ml-3 w-full">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                            ${this._escapeHtml(title)}
                        </h3>
                        <div class="mt-2 text-sm text-gray-600 dark:text-gray-300" style="white-space: pre-line;">
                            ${this._escapeHtml(message)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 dark:bg-mydark-700 px-6 py-3 flex gap-3 justify-end rounded-b-lg">
            </div>
        `;

        // Add buttons
        const buttonContainer = panel.querySelector('.bg-gray-50');
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = this._getButtonClass(btn.type);
            button.addEventListener('click', () => {
                this._closeDialog(dialog, btn.onClick);
            });
            buttonContainer.appendChild(button);
        });

        dialog.appendChild(backdrop);
        dialog.appendChild(panel);

        return dialog;
    },

    /**
     * Close dialog with animation
     */
    _closeDialog(dialog, callback) {
        const backdrop = dialog.querySelector('.absolute');
        const panel = dialog.querySelector('.relative');

        backdrop.style.opacity = '0';
        panel.style.transform = 'scale(0.95)';
        panel.style.opacity = '0';

        setTimeout(() => {
            dialog.remove();
            if (callback) callback();
        }, 150);
    },

    /**
     * Get button classes based on type
     */
    _getButtonClass(type) {
        const base = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

        switch (type) {
            case 'primary':
                return `${base} bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500`;
            case 'danger':
                return `${base} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
            case 'secondary':
                return `${base} bg-gray-200 dark:bg-mydark-500 hover:bg-gray-300 dark:hover:bg-mydark-400 text-gray-700 dark:text-gray-200 focus:ring-gray-500`;
            default:
                return `${base} bg-gray-200 dark:bg-mydark-500 hover:bg-gray-300 dark:hover:bg-mydark-400 text-gray-700 dark:text-gray-200 focus:ring-gray-500`;
        }
    },

    /**
     * Escape HTML to prevent XSS
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
