var Waterline = require('waterline');

var Registrants = Waterline.Collection.extend({
    identity: 'registrants',
    connection: 'save',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
        email: {
            type: 'string',
            required: true,
            email: true,
            unique: true
        },
        password: {
            type: 'string',
            required: true
        }
    }
});

module.exports = Registrants;
