import { SocksProxyInfo, SocksRoute, SocksRouteInterceptor } from '@outtacontrol/socks-router/lib/';
import { Url } from 'url';
import { verify } from 'sodium-signatures';
import { RegistryEntry } from './RegistryEntry';
import { RegistrySettings } from './RegistrySettings';

export { RegistryEntry, RegistrySettings }

export class RegistryInterceptor implements SocksRoute {
    public uri!: Url;
    private expireTime!: number;

    constructor(public archive: any, public intercept?: SocksRouteInterceptor) { }

    public initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.archive.on('ready', () => {
                this.archive.readFile('tld.json', (err: Error, data: Buffer) => {
                    if (err) return reject(err);
                    const tld: RegistrySettings = JSON.parse(data.toString('utf8'));
                    this.expireTime = tld['domain-expire-time'];
                    this.uri = { hostname: tld.name };
                    resolve();
                });
            });
        });
    }

    public async validate(info: SocksProxyInfo): Promise<boolean> {
        try {
            const { created, title, description, uri, sig, owner } = await this.findUrl(info.dstAddr);
            const signedData = JSON.stringify({ created, title, description, uri });
            const now = Date.now();
            const alive = now - created < this.expireTime;
            const verified = verify(Buffer.from(signedData, "utf8"), Buffer.from(sig, 'hex'), Buffer.from(owner, 'hey'));
            return alive && verified;
        } catch (err) {
            return false;
        }
    };

    private findUrl(domain: string): Promise<RegistryEntry> {
        domain = domain.split('.').slice(-2).join('.');
        return new Promise((resolve, reject) => {
            this.archive.readFile(domain + '.json', (err: Error, data: Buffer) => {
                if (err) return reject(err);
                resolve(JSON.parse(data.toString('utf8')));
            });
        });
    }

}

export function createRegistryInterceptor(archive: any, intercept?: SocksRouteInterceptor): RegistryInterceptor {
    return new RegistryInterceptor(archive, intercept);
}
