/// <reference types="node" />
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
/**
 * Creates a name account with the given rent budget, allocated space, owner and class.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the new account
 * @param space The space in bytes allocated to the account
 * @param payerKey The allocation cost payer
 * @param nameOwner The pubkey to be set as owner of the new name account
 * @param lamports The budget to be set for the name account. If not specified, it'll be the minimum for rent exemption
 * @param nameClass The class of this new name
 * @param parentName The parent name of the new name. If specified its owner needs to sign
 * @returns
 */
export declare function createNameRegistry(connection: Connection, name: string, space: number, payerKey: PublicKey, nameOwner: PublicKey, lamports?: number, nameClass?: PublicKey, parentName?: PublicKey): Promise<TransactionInstruction>;
/**
 * Overwrite the data of the given name registry.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name registry to update
 * @param offset The offset to which the data should be written into the registry
 * @param input_data The data to be written
 * @param nameClass The class of this name, if it exsists
 * @param nameParent The parent name of this name, if it exists
 */
export declare function updateNameRegistryData(connection: Connection, name: string, offset: number, input_data: Buffer, nameClass?: PublicKey, nameParent?: PublicKey): Promise<TransactionInstruction>;
/**
 * Change the owner of a given name account.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name account
 * @param newOwner The new owner to be set
 * @param curentNameOwner the current name Owner
 * @param nameClass The class of this name, if it exsists
 * @param nameParent The parent name of this name, if it exists
 * @param parentOwner Parent name owner
 * @returns
 */
export declare function transferNameOwnership(connection: Connection, name: string, newOwner: PublicKey, nameClass?: PublicKey, nameParent?: PublicKey, parentOwner?: PublicKey): Promise<TransactionInstruction>;
/**
 * Delete the name account and transfer the rent to the target.
 *
 * @param connection The solana connection object to the RPC node
 * @param name The name of the name account
 * @param refundTargetKey The refund destination address
 * @param nameClass The class of this name, if it exsists
 * @param nameParent The parent name of this name, if it exists
 * @returns
 */
export declare function deleteNameRegistry(connection: Connection, name: string, refundTargetKey: PublicKey, nameClass?: PublicKey, nameParent?: PublicKey): Promise<TransactionInstruction>;
/**
 * This function can be used to register a .sol domain
 * @param name The domain name to register e.g bonfida if you want to register bonfida.sol
 * @param space The domain name account size (max 10kB)
 * @param buyer The public key of the buyer
 * @param buyerTokenAccount The buyer FIDA token account
 * @returns
 */
export declare const registerDomainName: (name: string, space: number, buyer: PublicKey, buyerTokenAccount: PublicKey) => Promise<TransactionInstruction[][]>;
