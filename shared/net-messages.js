const sp = require('schemapack');

const payloadSchema = sp.build({
    id: "varuint",
    data: "buffer"
});

const messages = {

    client: [
        {
            key: "auth",
            schema: sp.build({
                username: "string",
                password: "string"
            })
        },
    ],

    server: [
        {
            key: "auth_granted",
            schema: sp.build({
                token: "string"
            })
        },

        {
            key: "auth_denied",
            schema: sp.build({
                reason: "string"
            })
        }
    ],

};

messages.encode = ({id, data}) => {
    return payloadSchema.encode({id, data});
};
messages.decode = (buffer) => {
    return payloadSchema.decode(buffer);
};

function genIDs(messages) {
    for (let i = 0; i < messages.length; i++) {
        messages[i].id = i;
        messages[i].sym = Symbol(messages[i].key);
    }
}

genIDs(messages.client);
genIDs(messages.server);

module.exports = messages;
