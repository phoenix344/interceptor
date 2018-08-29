/// <reference types="node" />
import { SocksProxyInfo, SocksRoute, SocksRouteInterceptor } from '@outtacontrol/socks-router/lib/';
import { Url } from 'url';
import { RegistryEntry } from './RegistryEntry';
import { RegistrySettings } from './RegistrySettings';
export { RegistryEntry, RegistrySettings };
export declare class RegistryInterceptor implements SocksRoute {
    archive: any;
    intercept?: SocksRouteInterceptor | undefined;
    uri: Url;
    private expireTime;
    constructor(archive: any, intercept?: SocksRouteInterceptor | undefined);
    initialize(): Promise<void>;
    validate(info: SocksProxyInfo): Promise<boolean>;
    private findUrl;
}
export declare function createRegistryInterceptor(archive: any, intercept?: SocksRouteInterceptor): RegistryInterceptor;
//# sourceMappingURL=index.d.ts.map