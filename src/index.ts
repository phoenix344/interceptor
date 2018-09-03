import { SocksProxyInfo, SocksRoute, SocksRouteInterceptor } from '@outtacontrol/socks-router/lib/';
import { Url } from 'url';
import { verify } from 'sodium-signatures';
import { RegistryEntry } from './RegistryEntry';
import { RegistrySettings } from './RegistrySettings';
import { RegistryOptions } from './RegistryOptions';

export { RegistryEntry, RegistrySettings, RegistryOptions }

export class RegistryInterceptor implements SocksRoute {
    public uri!: Url;
    private expireTime!: number;

    constructor(public archive: any, public intercept?: SocksRouteInterceptor, public options: RegistryOptions = {}) {
        options.timeout = options.timeout || 10000;
    }

    public initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            let noTimeout = true;
            const timeout = setTimeout(() => {
                noTimeout = false; 
                reject(new Error("loading archive ran into a timeout!"));
            }, this.options.timeout);
            this.archive.ready(() => {
                if (noTimeout) {
                    clearTimeout(timeout);
                    this.archive.readFile('tld.json', (err: Error, data: Buffer) => {
                        if (err) return reject(err);
                        const tld: RegistrySettings = JSON.parse(data.toString('utf8'));
                        this.expireTime = tld['domain-expire-time'];
                        this.uri = { hostname: tld.name };
                        resolve();
                    });
                }
            });
        });
    }

    public async validate(info: SocksProxyInfo): Promise<boolean> {
        try {
            const { created, updated, title, description, uri, sig, owner } = await this.findUrl(info.dstAddr);
            const signedData = JSON.stringify({ created, updated, title, description, uri });
            const now = Date.now();
            const alive = undefined === this.expireTime || now - updated < this.expireTime;
            const verified = verify(Buffer.from(signedData, "utf8"), Buffer.from(sig, 'hex'), Buffer.from(owner, 'hex'));
            return alive && verified;
        } catch (err) {
            return false;
        }
    };

    private findUrl(domain: string): Promise<RegistryEntry> {
        const [rootDomain, tld] = domain.split('.').slice(-2);
        return new Promise((resolve, reject) => {
            this.archive.readFile(`${tld}/${rootDomain}.json`, (err: Error, data: Buffer) => {
                if (err) return reject(err);
                resolve(JSON.parse(data.toString('utf8')));
            });
        });
    }

}

export function createInterceptor(archive: any, intercept?: SocksRouteInterceptor): RegistryInterceptor {
    return new RegistryInterceptor(archive, intercept);
}
