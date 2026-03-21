// Store Detection Module

// Wait for React to load and MainStore to be available
export function waitForGame() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const root = document.getElementById('root');
            if (root && root._reactRootContainer) {
                clearInterval(checkInterval);
                console.log('[Somuchmore] Game loaded!');
                resolve();
            } else {
                const gameUI = document.querySelector('[id="main-tabs"]');
                if (gameUI) {
                    clearInterval(checkInterval);
                    console.log('[Somuchmore] Game UI detected!');
                    resolve();
                }
            }
        }, 250);
    });
}

// Get MainStore from React fiber tree
export function getMainStore() {
    console.log('[Somuchmore] Attempting to find MainStore...');

    // Method 0: Check if it's already exposed globally
    if (window.Somuchmore?.MainStore) {
        console.log('[Somuchmore] Found MainStore as window.Somuchmore.MainStore');
        return window.Somuchmore.MainStore;
    }

    // Method 1: Look for React fiber tree (React 18+)
    const root = document.getElementById('root');
    if (root) {
        const container = root._reactRootContainer || root.__reactContainer;

        if (container) {
            console.log('[Somuchmore] Found React container');
            let fiber = container._internalRoot?.current || container.current;

            if (fiber) {
                const store = searchFiber(fiber);
                if (store) {
                    console.log('[Somuchmore] Found MainStore via fiber tree');
                    return store;
                }
            }
        }

        // Try alternative React 18 structure
        const fiberKey = Object.keys(root).find(key =>
            key.startsWith('__reactContainer') ||
            key.startsWith('_reactRootContainer') ||
            key.startsWith('__reactFiber')
        );

        if (fiberKey) {
            console.log('[Somuchmore] Found fiber key:', fiberKey);
            const fiber = root[fiberKey];
            if (fiber) {
                const store = searchFiber(fiber.current || fiber);
                if (store) {
                    console.log('[Somuchmore] Found MainStore via alternative fiber');
                    return store;
                }
            }
        }
    }

    // Method 2: Search all React components in the page
    console.log('[Somuchmore] Searching all React instances...');
    const allElements = document.querySelectorAll('*');
    for (let element of allElements) {
        const keys = Object.keys(element);
        const fiberKey = keys.find(key =>
            key.startsWith('__reactFiber') ||
            key.startsWith('__reactInternalInstance')
        );

        if (fiberKey) {
            const fiber = element[fiberKey];
            const store = searchFiber(fiber);
            if (store) {
                console.log('[Somuchmore] Found MainStore via element search');
                return store;
            }
        }
    }

    // Method 3: Look for MobX Provider context
    console.log('[Somuchmore] Searching for MobX Provider...');
    const providerSearch = searchForProvider(root);
    if (providerSearch) {
        console.log('[Somuchmore] Found MainStore via Provider');
        return providerSearch;
    }

    console.log('[Somuchmore] All methods failed');
    return null;
}

// Search fiber tree for MainStore
function searchFiber(node, depth = 0) {
    if (!node || depth > 50) return null;

    // Check memoizedProps
    if (node.memoizedProps?.MainStore) {
        return node.memoizedProps.MainStore;
    }

    // Check stateNode (class components)
    if (node.stateNode?.props?.MainStore) {
        return node.stateNode.props.MainStore;
    }

    // Check context
    if (node.memoizedState?.context?.MainStore) {
        return node.memoizedState.context.MainStore;
    }

    // Check return node
    if (node.return?.memoizedProps?.MainStore) {
        return node.return.memoizedProps.MainStore;
    }

    // Recursively search children
    let result = searchFiber(node.child, depth + 1);
    if (result) return result;

    return searchFiber(node.sibling, depth + 1);
}

// Search for MobX Provider
function searchForProvider(element) {
    if (!element) return null;

    const keys = Object.keys(element);
    for (let key of keys) {
        if (key.startsWith('__reactFiber') || key.startsWith('__reactProps')) {
            const fiber = element[key];
            if (fiber?.memoizedProps?.value?.MainStore) {
                return fiber.memoizedProps.value.MainStore;
            }
        }
    }

    // Search children
    for (let child of element.children || []) {
        const result = searchForProvider(child);
        if (result) return result;
    }

    return null;
}
