/// <reference types="node" />
import { Connection, PublicKey } from "@solana/web3.js";
import { Schema } from "borsh";
export declare class NameRegistryState {
    static HEADER_LEN: number;
    parentName: PublicKey;
    owner: PublicKey;
    class: PublicKey;
    data: Buffer | undefined;
    static schema: Schema;
    constructor(obj: {
        parentName: Uint8Array;
        owner: Uint8Array;
        class: Uint8Array;
    });
    static retrieve(connection: Connection, nameAccountKey: PublicKey): Promise<{
        registry: NameRegistryState;
        nftOwner: PublicKey | undefined;
    }>;
    static _retrieveBatch(connection: Connection, nameAccountKeys: PublicKey[]): Promise<(NameRegistryState | undefined)[]>;
    static retrieveBatch(connection: Connection, nameAccountKeys: PublicKey[]): Promise<(NameRegistryState | undefined)[]>;
}
export declare class TokenData {
    name: string;
    ticker: string;
    mint: Uint8Array;
    decimals: number;
    website?: string;
    logoUri?: string;
    constructor(obj: {
        name: string;
        ticker: string;
        mint: Uint8Array;
        decimals: number;
        website?: string;
        logoUri?: string;
    });
    static schema: Schema;
    serialize(): Uint8Array;
    static deserialize(data: Buffer): TokenData;
}
export declare class Mint {
    mint: Uint8Array;
    constructor(obj: {
        mint: Uint8Array;
    });
    static schema: Schema;
    serialize(): Uint8Array;
    static deserialize(data: Buffer): Mint;
}
