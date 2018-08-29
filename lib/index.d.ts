/// <reference types="node" />
import { Route } from '@outtacontrol/socks-router/lib/interfaces/Route';
import { SocksProxyInfo } from '@outtacontrol/socks-router/lib/interfaces/SocksProxyInfo';
import { Execute } from '@outtacontrol/socks-router/lib/interfaces/Execute';
import { Url } from 'url';
export declare class RegistryInterceptor implements Route {
    archive: any;
    execute?: Execute | undefined;
    uri: Url;
    private expireTime;
    constructor(archive: any, execute?: Execute | undefined);
    initialize(): Promise<void>;
    validate(info: SocksProxyInfo): Promise<boolean>;
    private findUrl;
}
export declare function createRegistryInterceptor(archive: any, execute?: Execute): RegistryInterceptor;
//# sourceMappingURL=index.d.ts.map