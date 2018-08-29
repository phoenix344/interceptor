declare interface SodiumSignaturesKeyPair {
    publicKey: Buffer;
    secretKey: Buffer;
}

declare module "sodium-signatures" {
    export function keyPair(seed?: Buffer): SodiumSignaturesKeyPair;
    export function sign(message: Buffer, secretKey: Buffer): Buffer;
    export function verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean;
}