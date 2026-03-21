// Somuchmore - Main Helper Module
import { waitForGame, getMainStore } from '../core/store-detector';

export const Somuchmore = {
    store: null,

    init: async function() {
        await waitForGame();

        this.store = getMainStore();

        if (!this.store) {
            console.error('[Somuchmore] Could not find MainStore automatically!');
            console.log('[Somuchmore] Try the manual store finder script');
            window.Somuchmore = this;
            return false;
        }

        console.log('[Somuchmore] MainStore found!', this.store);
        window.Somuchmore = this;
        window.Somuchmore.MainStore = this.store;

        this.logInfo();
        return true;
    },

    // Manual store injection
    setStore: function(store) {
        if (!store) {
            console.error('[Somuchmore] Invalid store provided');
            return false;
        }

        this.store = store;
        window.Somuchmore.MainStore = store;
        console.log('[Somuchmore] Store manually set!');
        this.logInfo();
        return true;
    },

    logInfo: function() {
        if (!this.store) return;

        console.log('=== Game Info ===');
        console.log('Version:', this.store.version);
        console.log('Ancestor:', this.store.run.ancestors);
        console.log('Resources:', this.store.run.resources.map(r => `${r.id}: ${r.value}`));
        console.log('================');
    },

    // Resource helpers
    getResource: function(resourceId) {
        return this.store?.ResourcesStore?.getResource?.(resourceId) || 0;
    },

    addResource: function(resourceId, amount) {
        if (!this.store?.ResourcesStore) return false;
        this.store.ResourcesStore.addResource(resourceId, amount);
        return true;
    },

    // Building helpers
    getBuilding: function(buildingId) {
        const building = this.store?.run?.buildings?.find(b => b.id === buildingId);
        return building?.owned || 0;
    },

    buyBuilding: function(buildingId, amount = 1) {
        if (!this.store?.BuildingsStore) return false;

        for (let i = 0; i < amount; i++) {
            const success = this.store.BuildingsStore.buyBuilding(buildingId);
            if (!success) {
                console.log(`[Somuchmore] Bought ${i}/${amount} ${buildingId}`);
                return i;
            }
        }

        console.log(`[Somuchmore] Bought ${amount} ${buildingId}`);
        return amount;
    },

    // Tech helpers
    getTech: function(techId) {
        const tech = this.store?.run?.techs?.find(t => t.id === techId);
        return tech?.owned || 0;
    },

    researchTech: function(techId) {
        if (!this.store?.TechsStore) return false;
        return this.store.TechsStore.buyTech(techId);
    },

    // Army helpers
    getArmy: function(unitId) {
        const unit = this.store?.run?.army?.find(a => a.id === unitId);
        return unit?.owned || 0;
    },

    trainUnit: function(unitId, amount = 1) {
        if (!this.store?.ArmyStore) return false;

        for (let i = 0; i < amount; i++) {
            const success = this.store.ArmyStore.addArmy(unitId);
            if (!success) {
                console.log(`[Somuchmore] Trained ${i}/${amount} ${unitId}`);
                return i;
            }
        }

        console.log(`[Somuchmore] Trained ${amount} ${unitId}`);
        return amount;
    },

    // Auto-buy helpers
    autoBuy: function(type, id, targetAmount) {
        const interval = setInterval(() => {
            let current;
            let buyFunc;

            switch(type) {
                case 'building':
                    current = this.getBuilding(id);
                    buyFunc = () => this.buyBuilding(id);
                    break;
                case 'army':
                    current = this.getArmy(id);
                    buyFunc = () => this.trainUnit(id);
                    break;
                default:
                    console.error('[Somuchmore] Unknown type:', type);
                    clearInterval(interval);
                    return;
            }

            if (current >= targetAmount) {
                console.log(`[Somuchmore] Target reached: ${current}/${targetAmount} ${id}`);
                clearInterval(interval);
                return;
            }

            buyFunc();
        }, 1000);

        return interval;
    },

    // Save/load
    save: function() {
        this.store?.save?.();
        console.log('[Somuchmore] Game saved!');
    },

    // Debug helpers
    listResources: function() {
        if (!this.store?.run?.resources) return [];
        return this.store.run.resources.map(r => ({
            id: r.id,
            value: r.value,
            timer: r.timer
        }));
    },

    listBuildings: function() {
        if (!this.store?.run?.buildings) return [];
        return this.store.run.buildings
            .filter(b => b.owned > 0)
            .map(b => ({
                id: b.id,
                owned: b.owned
            }));
    },

    listArmy: function() {
        if (!this.store?.run?.army) return [];
        return this.store.run.army
            .filter(a => a.owned > 0)
            .map(a => ({
                id: a.id,
                owned: a.owned
            }));
    },

    listTechs: function() {
        if (!this.store?.run?.techs) return [];
        return this.store.run.techs
            .filter(t => t.owned > 0)
            .map(t => ({
                id: t.id
            }));
    }
};
