/// <reference types="node" />
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Numberu32, Numberu64 } from "./int";
import { Schema } from "borsh";
export declare function createInstruction(nameProgramId: PublicKey, systemProgramId: PublicKey, nameKey: PublicKey, nameOwnerKey: PublicKey, payerKey: PublicKey, hashed_name: Buffer, lamports: Numberu64, space: Numberu32, nameClassKey?: PublicKey, nameParent?: PublicKey, nameParentOwner?: PublicKey): TransactionInstruction;
export declare function updateInstruction(nameProgramId: PublicKey, nameAccountKey: PublicKey, offset: Numberu32, input_data: Buffer, nameUpdateSigner: PublicKey): TransactionInstruction;
export declare function transferInstruction(nameProgramId: PublicKey, nameAccountKey: PublicKey, newOwnerKey: PublicKey, currentNameOwnerKey: PublicKey, nameClassKey?: PublicKey, nameParent?: PublicKey, parentOwner?: PublicKey): TransactionInstruction;
export declare function deleteInstruction(nameProgramId: PublicKey, nameAccountKey: PublicKey, refundTargetKey: PublicKey, nameOwnerKey: PublicKey): TransactionInstruction;
export declare class createV2Instruction {
    tag: number;
    name: string;
    space: number;
    static schema: Schema;
    constructor(obj: {
        name: string;
        space: number;
    });
    serialize(): Uint8Array;
    getInstruction(programId: PublicKey, rentSysvarAccount: PublicKey, nameProgramId: PublicKey, rootDomain: PublicKey, nameAccount: PublicKey, reverseLookupAccount: PublicKey, centralState: PublicKey, buyer: PublicKey, buyerTokenAccount: PublicKey, fidaVault: PublicKey, state: PublicKey): TransactionInstruction;
}
