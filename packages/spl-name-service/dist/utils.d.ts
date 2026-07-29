/// <reference types="node" />
import { Connection, PublicKey } from "@solana/web3.js";
import { NameRegistryState } from "./state";
export declare function getNameOwner(connection: Connection, nameAccountKey: PublicKey): Promise<{
    registry: NameRegistryState;
    nftOwner: PublicKey | undefined;
}>;
export declare function getHashedName(name: string): Promise<Buffer>;
export declare function getNameAccountKey(hashed_name: Buffer, nameClass?: PublicKey, nameParent?: PublicKey): Promise<PublicKey>;
export declare function performReverseLookup(connection: Connection, nameAccount: PublicKey): Promise<string>;
export declare function getDNSRecordAddress(nameAccount: PublicKey, type: string): Promise<PublicKey>;
export declare function performReverseLookupBatch(connection: Connection, nameAccounts: PublicKey[]): Promise<(string | undefined)[]>;
/**
 *
 * @param connection The Solana RPC connection object
 * @param parentKey The parent you want to find sub-domains for
 * @returns
 */
export declare const findSubdomains: (connection: Connection, parentKey: PublicKey) => Promise<string[]>;
/**
 * This function can be used to compute the public key of a domain or subdomain
 * @param domain The domain to compute the public key for (e.g `bonfida.sol`, `dex.bonfida.sol`)
 * @returns
 */
export declare const getDomainKey: (domain: string, record?: boolean) => Promise<{
    isSub: boolean;
    parent: PublicKey;
    pubkey: PublicKey;
    hashed: Buffer;
} | {
    isSub: boolean;
    parent: undefined;
    pubkey: PublicKey;
    hashed: Buffer;
}>;
/**
 * This function can be used to retrieve all domain names owned by `wallet`
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns
 */
export declare function getAllDomains(connection: Connection, wallet: PublicKey): Promise<PublicKey[]>;
/**
 * This function can be used to retrieve all the registered `.sol` domains.
 * The account data is sliced to avoid enormous payload and only the owner is returned
 * @param connection The Solana RPC connection object
 * @returns
 */
export declare const getAllRegisteredDomains: (connection: Connection) => Promise<{
    pubkey: PublicKey;
    account: import("@solana/web3.js").AccountInfo<Buffer>;
}[]>;
