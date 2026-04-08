/* ============================================================
   MDT FiveM - API Bridge (NUI <-> Lua)
   ============================================================ */

'use strict';

const API = {
    /**
     * Envoie une action au client Lua via NUI callback
     * @param {string} action - Nom du callback Lua
     * @param {object} data   - Donnees a envoyer
     * @returns {Promise}
     */
    post(action, data = {}) {
        return fetch(`https://mdt/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data),
        }).catch(() => {
            // En mode dev (hors FiveM), ignorer les erreurs reseau
            console.warn(`[MDT API] fetch failed for action: ${action}`);
        });
    },

    close()                       { return this.post('close'); },
    searchCitizen(query)          { return this.post('searchCitizen', { query }); },
    getCitizen(id)                { return this.post('getCitizen', { id }); },
    createRecord(data)            { return this.post('createRecord', data); },
    searchVehicle(plate)          { return this.post('searchVehicle', { plate }); },
    setVehicleStolen(plate, stolen){ return this.post('setVehicleStolen', { plate, stolen }); },
    getWarrants()                 { return this.post('getWarrants'); },
    createWarrant(data)           { return this.post('createWarrant', data); },
    executeWarrant(id)            { return this.post('executeWarrant', { id }); },
    getBolos()                    { return this.post('getBolos'); },
    createBolo(data)              { return this.post('createBolo', data); },
    resolveBolo(id)               { return this.post('resolveBolo', { id }); },
    getIncidents()                { return this.post('getIncidents'); },
    createIncident(data)          { return this.post('createIncident', data); },
    getCalls()                    { return this.post('getCalls'); },
    assignToCall(id)              { return this.post('assignToCall', { id }); },
    updateCallStatus(id, status)  { return this.post('updateCallStatus', { id, status }); },
    getActiveUnits()              { return this.post('getActiveUnits'); },
    updateStatus(status)          { return this.post('updateStatus', { status }); },
};
