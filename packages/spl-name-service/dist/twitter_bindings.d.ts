/// <reference types="node" />
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { NameRegistryState } from "./state";
import { Schema } from "borsh";
export declare function createVerifiedTwitterRegistry(connection: Connection, twitterHandle: string, verifiedPubkey: PublicKey, space: number, // The space that the user will have to write data into the verified registry
payerKey: PublicKey): Promise<TransactionInstruction[]>;
export declare function changeTwitterRegistryData(twitterHandle: string, verifiedPubkey: PublicKey, offset: number, // The offset at which to write the input data into the NameRegistryData
input_data: Buffer): Promise<TransactionInstruction[]>;
export declare function changeVerifiedPubkey(connection: Connection, twitterHandle: string, currentVerifiedPubkey: PublicKey, newVerifiedPubkey: PublicKey, payerKey: PublicKey): Promise<TransactionInstruction[]>;
export declare function deleteTwitterRegistry(twitterHandle: string, verifiedPubkey: PublicKey): Promise<TransactionInstruction[]>;
export declare function getTwitterRegistryKey(twitter_handle: string): Promise<PublicKey>;
export declare function getTwitterRegistry(connection: Connection, twitter_handle: string): Promise<NameRegistryState>;
export declare function getHandleAndRegistryKey(connection: Connection, verifiedPubkey: PublicKey): Promise<[string, PublicKey]>;
export declare function getTwitterHandleandRegistryKeyViaFilters(connection: Connection, verifiedPubkey: PublicKey): Promise<[string, PublicKey]>;
export declare function getTwitterRegistryData(connection: Connection, verifiedPubkey: PublicKey): Promise<Buffer>;
export declare class ReverseTwitterRegistryState {
    twitterRegistryKey: Uint8Array;
    twitterHandle: string;
    static schema: Schema;
    constructor(obj: {
        twitterRegistryKey: Uint8Array;
        twitterHandle: string;
    });
    static retrieve(connection: Connection, reverseTwitterAccountKey: PublicKey): Promise<ReverseTwitterRegistryState>;
}
export declare function createReverseTwitterRegistry(connection: Connection, twitterHandle: string, twitterRegistryKey: PublicKey, verifiedPubkey: PublicKey, payerKey: PublicKey): Promise<TransactionInstruction[]>;
