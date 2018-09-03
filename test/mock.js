const { keyPair, sign } = require('sodium-signatures');
const { EventEmitter } = require('events');
const { Socket } = require('net');
const path = require('path');

const created = Date.now() - Math.round(Math.random() * 3888000000);
const updated = created;

function obj2buf(json) {
    return Buffer.from(JSON.stringify(json), 'utf8');
}

exports.registry = {
    toplevel: {
        "name": "tld",
        "domain-expire-time": 7776000000
    },
    domains: [
        {
            name: "example",
            meta: {
                created,
                updated,
                title: "My Test Website",
                description: "Some description text for my test website",
                uri: "https://example.com"
            }
        }
    ]
};

exports.createArchive = () => ({

    ready(callback) {
        callback();
    },

    readFile(filepath, callback) {
        if (filepath === "tld.json") {
            callback(null, obj2buf(exports.registry.toplevel));
        }
        else {
            const keys = keyPair();
            const domain = exports.registry.domains.find(d => d.name === path.basename(filepath, '.json'));
            if (domain) {
                callback(null, obj2buf({
                    owner: keys.publicKey.toString('hex'),
                    sig: sign(obj2buf(domain.meta), keys.secretKey).toString('hex'),
                    ...domain.meta
                }));
            } else {
                callback(new Error("FAIL"));
            }
        }
    }

});

exports.FakeSocksServer = class SocksServer extends EventEmitter {
    constructor(options, connectionListener) {
        super();
        this.on('connection', connectionListener);
    }

    fakeRequest(port, address) {
        this.emit('connection', {
            dstPort: port,
            dstAddr: address
        }, (intercept = false) => {
            if (intercept) {
                this.emit("accept:intercept");
            } else {
                this.emit("accept:default");
            }
        }, () => {
            this.emit("deny");
        });
    }
}

exports.createFakeServer = (options, connectionListener) => {
    return new FakeSocksServer(options, connectionListener);
};
