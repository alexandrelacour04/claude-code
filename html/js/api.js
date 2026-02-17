// API Communication Module for MDT

const API = {
    /**
     * Search for a citizen
     * @param {string} firstname
     * @param {string} lastname
     */
    searchCitizen: function(firstname, lastname) {
        fetch(`https://${GetParentResourceName()}/search_citizen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                firstname: firstname,
                lastname: lastname
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Search for a vehicle
     * @param {string} plate
     */
    searchVehicle: function(plate) {
        fetch(`https://${GetParentResourceName()}/search_vehicle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                plate: plate
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Add a citation
     * @param {number} citizenId
     * @param {string} citationType
     * @param {string} description
     * @param {number} amount
     */
    addCitation: function(citizenId, citationType, description, amount) {
        fetch(`https://${GetParentResourceName()}/add_citation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                citizenId: citizenId,
                type: citationType,
                description: description,
                amount: amount
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Add a wanted alert
     * @param {number} citizenId
     * @param {string} reason
     * @param {string} type
     */
    addWanted: function(citizenId, reason, type) {
        fetch(`https://${GetParentResourceName()}/add_wanted`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                citizenId: citizenId,
                reason: reason,
                type: type
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Add a report
     * @param {string} type
     * @param {string} description
     * @param {string} location
     */
    addReport: function(type, description, location) {
        fetch(`https://${GetParentResourceName()}/add_report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                type: type,
                description: description,
                location: location
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Add a call log
     * @param {string} type
     * @param {string} location
     * @param {string} description
     */
    addCallLog: function(type, location, description) {
        fetch(`https://${GetParentResourceName()}/add_call_log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                type: type,
                location: location,
                description: description
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Get data from the server
     * @param {string} dataType
     */
    getData: function(dataType) {
        fetch(`https://${GetParentResourceName()}/get_data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                type: dataType
            })
        }).then(resp => resp.json()).then(resp => console.log(resp));
    },

    /**
     * Close the MDT
     */
    close: function() {
        fetch(`https://${GetParentResourceName()}/close`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            }
        }).then(resp => resp.json()).then(resp => console.log(resp));
    }
};

// Expose API to global scope
window.API = API;
