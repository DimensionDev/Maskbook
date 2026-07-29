/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
/**
 * Mainnet program ID
 */
export declare const NAME_TOKENIZER_ID: PublicKey;
/**
 * PDA prefix
 */
export declare const MINT_PREFIX: Buffer;
/**
 * This function can be used to retrieve the owner of a tokenized domain name
 *
 * @param connection The solana connection object to the RPC node
 * @param nameAccount The key of the domain name
 * @returns
 */
export declare const retrieveNftOwner: (connection: Connection, nameAccount: PublicKey) => Promise<PublicKey | undefined>;
/**
 * This function can be used to retrieve all the tokenized domains name
 *
 * @param connection The solana connection object to the RPC node
 * @returns
 */
export declare const retrieveNfts: (connection: Connection) => Promise<PublicKey[]>;
