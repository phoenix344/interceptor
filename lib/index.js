"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sodium_signatures_1 = require("sodium-signatures");
class RegistryInterceptor {
    constructor(archive, intercept, options = {}) {
        this.archive = archive;
        this.intercept = intercept;
        this.options = options;
        options.timeout = options.timeout || 10000;
    }
    initialize() {
        return new Promise((resolve, reject) => {
            let noTimeout = true;
            const timeout = setTimeout(() => {
                noTimeout = false;
                reject(new Error("loading archive ran into a timeout!"));
            }, this.options.timeout);
            this.archive.ready(() => {
                if (noTimeout) {
                    clearTimeout(timeout);
                    this.archive.readFile('tld.json', (err, data) => {
                        if (err)
                            return reject(err);
                        const tld = JSON.parse(data.toString('utf8'));
                        this.expireTime = tld['domain-expire-time'];
                        this.uri = { hostname: tld.name };
                        resolve();
                    });
                }
            });
        });
    }
    async validate(info) {
        try {
            const { created, title, description, uri, sig, owner } = await this.findUrl(info.dstAddr);
            const signedData = JSON.stringify({ created, title, description, uri });
            const now = Date.now();
            const alive = now - created < this.expireTime;
            const verified = sodium_signatures_1.verify(Buffer.from(signedData, "utf8"), Buffer.from(sig, 'hex'), Buffer.from(owner, 'hex'));
            return alive && verified;
        }
        catch (err) {
            return false;
        }
    }
    ;
    findUrl(domain) {
        const [rootDomain, tld] = domain.split('.').slice(-2);
        return new Promise((resolve, reject) => {
            this.archive.readFile(`${tld}/${rootDomain}.json`, (err, data) => {
                if (err)
                    return reject(err);
                resolve(JSON.parse(data.toString('utf8')));
            });
        });
    }
}
exports.RegistryInterceptor = RegistryInterceptor;
function createInterceptor(archive, intercept) {
    return new RegistryInterceptor(archive, intercept);
}
exports.createInterceptor = createInterceptor;
//# sourceMappingURL=index.js.map