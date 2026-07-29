import { Connection, PublicKey } from "@solana/web3.js";
/**
 * This function can be used to verify the validity of a SOL record
 * @param record The record data to verify
 * @param signedRecord The signed data
 * @param pubkey The public key of the signer
 * @returns
 */
export declare const checkSolRecord: (record: Uint8Array, signedRecord: Uint8Array, pubkey: PublicKey) => boolean;
/**
 * This function can be used to resolve a domain name to transfer funds
 * @param connection The Solana RPC connection object
 * @param domain The domain to resolve
 * @returns
 */
export declare const resolve: (connection: Connection, domain: string) => Promise<PublicKey>;
