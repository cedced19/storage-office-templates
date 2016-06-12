var Waterline = require('waterline');
var isOffice = require('is-office');

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
        shareId: {
            type: 'string',
            required: true
        },
        shareState: {
            type: 'boolean',
            required: true
        },
        preview: {
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
    },

    beforeCreate: function(file, cb) {
        if (/image|pdf/.test(file.type) || isOffice(file.type)) {
          file.preview = 'image';
        } else if (/text|application\/(json|javascript)/.test(file.type)) {
          file.preview = 'text';
        } else {
          if (file.preview) {
            delete file.preview;
          }
        }
        cb();
    }
});

/* Example of file
{
 title: 'A title.',
 file: 'file.odt',
 shareId : 'bHG0SbrA0yjtrNsiIFX0',
 shareState : false,
 preview: 'image'
 description: 'A template for a stupid file.',
 path: '436ec561793aa4dc475a88e84776b1b9',
 size: '277056',
 type: 'application/vnd.oasis.opendocument.text'
}
*/

module.exports = Files;
