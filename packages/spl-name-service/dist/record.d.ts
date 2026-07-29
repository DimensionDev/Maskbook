import { Record } from "./types/record";
import { Connection } from "@solana/web3.js";
import { NameRegistryState } from "./state";
/**
 * This function can be used to retrieve a specified record for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
export declare const getRecord: (connection: Connection, domain: string, record: Record) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the IPFS record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getIpfsRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the Arweave record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getArweaveRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the ETH record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getEthRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the BTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getBtcRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the LTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getLtcRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the DOGE record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getDogeRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the email record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getEmailRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the URL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getUrlRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the Discord record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getDiscordRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the Github record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getGithubRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the Reddit record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getRedditRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the Twitter record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getTwitterRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the Telegram record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getTelegramRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the pic record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getPicRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the SHDW record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getShdwRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the SOL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getSolRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
/**
 * This function can be used to retrieve the POINT record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
export declare const getPointRecord: (connection: Connection, domain: string) => Promise<NameRegistryState>;
