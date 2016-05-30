var Waterline = require('waterline');

var Files = Waterline.Collection.extend({
    identity: 'files',
    connection: 'save',
    autoCreatedAt: false,

    attributes: {
        title: {
            type: 'string',
            required: true,
            unique: true
        },
        file: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string'
        },
        path: {
            type: 'string',
            required: true
        },
        size: {
            type: 'string',
            required: true
        },
        type: {
            type: 'string',
            required: true
        }
    }
});

/* Example of file
{
 title: 'A title.',
 file: 'file.odt',
 description: 'A template for a stupid file.',
 path: '436ec561793aa4dc475a88e84776b1b9',
 size: '277056',
 type: 'application/vnd.oasis.opendocument.text'
}
*/

module.exports = Files;
