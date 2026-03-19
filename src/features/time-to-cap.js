// Time to Cap Column Feature
import { Resources } from '../core/game-data';

export function initTimeToCap() {
    if (!window.MainStore) {
        console.error('[Somuchmore] MainStore not available');
        return false;
    }

    // Load settings to check if feature is enabled
    const loadSettings = () => {
        const settings = localStorage.getItem('somuchmore_settings');
        if (settings) {
            return JSON.parse(settings);
        }
        return { timeToCapEnabled: true };
    };

    const settings = loadSettings();

    // Format time duration
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds <= 0 || seconds > 999999) {
            return '---';
        }

        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}d ${remainingHours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m ${secs}s`;
        }
    }

    // Get time to cap from MainStore
    function getTimeToCap(resourceId) {
        const resource = Resources.get(resourceId);
        if (!resource) return null;

        const current = Resources.getValue(resourceId);
        const cap = Resources.getCap(resourceId);
        const income = Resources.getIncome(resourceId);

        // Already at cap - leave blank
        if (current >= cap) {
            return { seconds: 0, status: 'at_cap' };
        }

        // Negative income - show infinity
        if (income < 0) {
            return { seconds: Infinity, status: 'negative' };
        }

        // No income or zero income - no display
        if (income === 0) {
            return { seconds: Infinity, status: 'no_income' };
        }

        // Infinite cap - no display
        if (!isFinite(cap) || cap >= 1e308) {
            return { seconds: Infinity, status: 'infinite_cap' };
        }

        const remaining = cap - current;
        const seconds = remaining / income;

        return { seconds, status: 'normal' };
    }

    // Find resource table
    function findResourceTable() {
        const tables = document.querySelectorAll('table');
        const resourceIds = Resources.getAll().map(r => r.id);

        for (let table of tables) {
            const rows = table.querySelectorAll('tbody tr, tr');

            for (let row of rows) {
                const firstCell = row.querySelector('td, th');
                if (firstCell) {
                    const text = firstCell.textContent.trim().toLowerCase();

                    if (resourceIds.some(id => text.includes(id) || id.includes(text))) {
                        return { table, rows: Array.from(rows) };
                    }
                }
            }
        }

        return null;
    }

    // Extract resource ID from row
    function getResourceIdFromRow(row) {
        const cells = row.querySelectorAll('td, th');
        if (cells.length === 0) return null;

        const firstCellText = cells[0].textContent.trim().toLowerCase();
        const resources = Resources.getAll();

        for (let resource of resources) {
            const id = resource.id.toLowerCase();
            if (firstCellText === id || firstCellText.includes(id) || id.includes(firstCellText)) {
                return resource.id;
            }

            const idNoUnderscore = id.replace(/_/g, ' ');
            if (firstCellText.includes(idNoUnderscore)) {
                return resource.id;
            }
        }

        return null;
    }

    // Add column cells to rows
    function ensureCells(rows) {
        rows.forEach(row => {
            // Skip if already has our cell
            if (row.querySelector('.somuchmore_ttc')) return;

            // Shrink padding on all cells in this row (only once)
            row.querySelectorAll('td').forEach(cell => {
                cell.className = cell.className.replace(/px-3/g, 'px-2').replace(/3xl:px-5/g, '3xl:px-4');
            });

            const td = document.createElement('td');
            td.className = 'somuchmore_ttc px-2 3xl:px-4 py-3 lg:py-2 3xl:py-3 whitespace-nowrap text-center';
            td.style.border = 'none';
            td.textContent = '';

            // Hide immediately if setting is disabled
            if (!settings.timeToCapEnabled) {
                td.style.display = 'none';
            }

            row.appendChild(td);
        });
    }

    // Update values
    function updateValues(rows) {
        rows.forEach(row => {
            const cell = row.querySelector('.somuchmore_ttc');
            if (!cell) return;

            const resourceId = getResourceIdFromRow(row);
            if (!resourceId) {
                cell.textContent = '';
                return;
            }

            const result = getTimeToCap(resourceId);
            if (!result) {
                cell.textContent = '';
                return;
            }

            const statusClass = `somuchmore_ttc-${result.status}`;
            const hasStatusClass = cell.classList.contains(statusClass);

            // Only update classes/styles if status changed
            if (!hasStatusClass) {
                // Remove old status classes
                cell.classList.remove(
                    'somuchmore_ttc-at_cap',
                    'somuchmore_ttc-negative',
                    'somuchmore_ttc-no_income',
                    'somuchmore_ttc-infinite_cap',
                    'somuchmore_ttc-normal'
                );
                cell.classList.add(statusClass);

                // Reset row styling
                row.style.backgroundColor = '';
                row.classList.remove('text-red-600');

                // Apply status-specific styling
                switch (result.status) {
                    case 'at_cap':
                    case 'no_income':
                    case 'infinite_cap':
                        cell.style.fontSize = '';
                        break;

                    case 'negative':
                        cell.style.fontSize = '1.5rem';
                        row.style.backgroundColor = '#fbbf24'; // amber-400
                        row.classList.add('text-red-600');
                        break;

                    case 'normal':
                        cell.style.fontSize = '';
                        break;
                }
            }

            // Always update content
            switch (result.status) {
                case 'at_cap':
                case 'no_income':
                case 'infinite_cap':
                    cell.textContent = '';
                    break;

                case 'negative':
                    cell.textContent = '∞';
                    break;

                case 'normal':
                    cell.textContent = formatTime(result.seconds);
                    break;
            }
        });
    }

    // Main setup
    function setup() {
        const result = findResourceTable();
        if (!result) return false;

        const { rows } = result;
        ensureCells(rows);

        function update() {
            updateValues(rows);
            setTimeout(update, 1000);
        }

        update();
        return true;
    }

    // Try to setup with retries
    let attempts = 0;
    function trySetup() {
        attempts++;
        const success = setup();

        if (!success && attempts < 15) {
            setTimeout(trySetup, 1000);
        }
    }

    trySetup();

    // Watch for DOM changes (check if our cells are still present)
    const observer = new MutationObserver(() => {
        if (!document.querySelector('.somuchmore_ttc')) {
            trySetup();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    return true;
}
