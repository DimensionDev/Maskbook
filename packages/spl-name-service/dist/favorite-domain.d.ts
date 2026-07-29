import { PublicKey, Connection } from "@solana/web3.js";
/**
 * This function can be used to retrieve the favorite domain of a user
 * @param connection The Solana RPC connection object
 * @param owner The owner you want to retrieve the favorite domain for
 * @returns
 */
export declare const getFavoriteDomain: (connection: Connection, owner: PublicKey) => Promise<{
    domain: PublicKey;
    reverse: string;
}>;
