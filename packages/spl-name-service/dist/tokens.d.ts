import { PublicKey, Connection } from "@solana/web3.js";
import { TokenData } from "./state";
export declare const TOKEN_TLD: PublicKey;
export declare const getTokenInfoFromMint: (connection: Connection, mint: PublicKey) => Promise<TokenData>;
export declare const getTokenInfoFromName: (connection: Connection, name: string) => Promise<TokenData>;
