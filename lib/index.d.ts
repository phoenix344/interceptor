/// <reference types="node" />
import { SocksProxyInfo, SocksRoute, SocksRouteInterceptor } from '@outtacontrol/socks-router/lib/';
import { Url } from 'url';
import { RegistryEntry } from './RegistryEntry';
import { RegistrySettings } from './RegistrySettings';
import { RegistryOptions } from './RegistryOptions';
export { RegistryEntry, RegistrySettings, RegistryOptions };
export declare class RegistryInterceptor implements SocksRoute {
    archive: any;
    intercept?: SocksRouteInterceptor | undefined;
    options: RegistryOptions;
    uri: Url;
    private expireTime;
    constructor(archive: any, intercept?: SocksRouteInterceptor | undefined, options?: RegistryOptions);
    initialize(): Promise<void>;
    validate(info: SocksProxyInfo): Promise<boolean>;
    private findUrl;
}
export declare function createInterceptor(archive: any, intercept?: SocksRouteInterceptor): RegistryInterceptor;
//# sourceMappingURL=index.d.ts.map