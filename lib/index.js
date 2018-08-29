"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sodium_signatures_1 = require("sodium-signatures");
class RegistryInterceptor {
    constructor(archive, intercept) {
        this.archive = archive;
        this.intercept = intercept;
    }
    initialize() {
        return new Promise((resolve, reject) => {
            this.archive.on('ready', () => {
                this.archive.readFile('tld.json', (err, data) => {
                    if (err)
                        return reject(err);
                    const tld = JSON.parse(data.toString('utf8'));
                    this.expireTime = tld['domain-expire-time'];
                    this.uri = { hostname: tld.name };
                    resolve();
                });
            });
        });
    }
    async validate(info) {
        try {
            const { created, title, description, uri, sig, owner } = await this.findUrl(info.dstAddr);
            const signedData = JSON.stringify({ created, title, description, uri });
            const now = Date.now();
            const alive = now - created < this.expireTime;
            const verified = sodium_signatures_1.verify(Buffer.from(signedData, "utf8"), Buffer.from(sig, 'hex'), Buffer.from(owner, 'hey'));
            return alive && verified;
        }
        catch (err) {
            return false;
        }
    }
    ;
    findUrl(domain) {
        domain = domain.split('.').slice(-2).join('.');
        return new Promise((resolve, reject) => {
            this.archive.readFile(domain + '.json', (err, data) => {
                if (err)
                    return reject(err);
                resolve(JSON.parse(data.toString('utf8')));
            });
        });
    }
}
exports.RegistryInterceptor = RegistryInterceptor;
function createRegistryInterceptor(archive, intercept) {
    return new RegistryInterceptor(archive, intercept);
}
exports.createRegistryInterceptor = createRegistryInterceptor;
//# sourceMappingURL=index.js.map