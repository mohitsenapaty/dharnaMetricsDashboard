module.exports = {
    friendlyName: 'Mustache parser which was missing in i18n2',

    description: 'Return a parsed text which was parsed with mustache',

    inputs: {
        text : {
            type: 'string',
            example: 'XYZ',
            description: 'text that need to be parsed',
            required: true
        },

        data : {
            type: 'ref',
            example : {name :'xyz'},
            required : false
        }
    },
    exits : {
        success : {
            
        }
    },

    fn : async (inputs, exits) => {
        try {
            exits.success(parseMustache(inputs.text, inputs.data));
        } catch (err) {
            sails.log.error(`Failed to parse text ${inputs.text} with data ${inputs.data}`);
            exits.success(inputs.text);
        }
    }
}

let parseMustache = (str, obj) => {
    return str.replace(/{{\s*([\w\.]+)\s*}}/g, function(tag, match) {
        var nodes = match.split("."),
            current = obj,
            length = nodes.length,
            i = 0;
        while (i < length) {
            try {
                current = current[nodes[i]];
            } catch (e) {
                return "";
            }
            i++;
        }
        return current;
    });
}