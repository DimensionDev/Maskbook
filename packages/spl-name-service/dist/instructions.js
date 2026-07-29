"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createV2Instruction = exports.deleteInstruction = exports.transferInstruction = exports.updateInstruction = exports.createInstruction = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const int_1 = require("./int");
const borsh_1 = require("borsh");
const constants_1 = require("./constants");
function createInstruction(nameProgramId, systemProgramId, nameKey, nameOwnerKey, payerKey, hashed_name, lamports, space, nameClassKey, nameParent, nameParentOwner) {
    const buffers = [
        Buffer.from(Int8Array.from([0])),
        //@ts-ignore
        new int_1.Numberu32(hashed_name.length).toBuffer(),
        hashed_name,
        lamports.toBuffer(),
        space.toBuffer(),
    ];
    const data = Buffer.concat(buffers);
    const keys = [
        {
            pubkey: systemProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: payerKey,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: nameKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: nameOwnerKey,
            isSigner: false,
            isWritable: false,
        },
    ];
    if (nameClassKey) {
        keys.push({
            pubkey: nameClassKey,
            isSigner: true,
            isWritable: false,
        });
    }
    else {
        keys.push({
            pubkey: new web3_js_1.PublicKey(Buffer.alloc(32)),
            isSigner: false,
            isWritable: false,
        });
    }
    if (nameParent) {
        keys.push({
            pubkey: nameParent,
            isSigner: false,
            isWritable: false,
        });
    }
    else {
        keys.push({
            pubkey: new web3_js_1.PublicKey(Buffer.alloc(32)),
            isSigner: false,
            isWritable: false,
        });
    }
    if (nameParentOwner) {
        keys.push({
            pubkey: nameParentOwner,
            isSigner: true,
            isWritable: false,
        });
    }
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: nameProgramId,
        data,
    });
}
exports.createInstruction = createInstruction;
function updateInstruction(nameProgramId, nameAccountKey, offset, input_data, nameUpdateSigner) {
    const buffers = [
        Buffer.from(Int8Array.from([1])),
        offset.toBuffer(),
        //@ts-ignore
        new int_1.Numberu32(input_data.length).toBuffer(),
        input_data,
    ];
    const data = Buffer.concat(buffers);
    const keys = [
        {
            pubkey: nameAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: nameUpdateSigner,
            isSigner: true,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: nameProgramId,
        data,
    });
}
exports.updateInstruction = updateInstruction;
function transferInstruction(nameProgramId, nameAccountKey, newOwnerKey, currentNameOwnerKey, nameClassKey, nameParent, parentOwner) {
    const buffers = [Buffer.from(Int8Array.from([2])), newOwnerKey.toBuffer()];
    const data = Buffer.concat(buffers);
    const keys = [
        {
            pubkey: nameAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: parentOwner ? parentOwner : currentNameOwnerKey,
            isSigner: true,
            isWritable: false,
        },
    ];
    if (nameClassKey) {
        keys.push({
            pubkey: nameClassKey,
            isSigner: true,
            isWritable: false,
        });
    }
    if (parentOwner && nameParent) {
        if (!nameClassKey) {
            keys.push({
                pubkey: web3_js_1.PublicKey.default,
                isSigner: false,
                isWritable: false,
            });
        }
        keys.push({
            pubkey: nameParent,
            isSigner: false,
            isWritable: false,
        });
    }
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: nameProgramId,
        data,
    });
}
exports.transferInstruction = transferInstruction;
function deleteInstruction(nameProgramId, nameAccountKey, refundTargetKey, nameOwnerKey) {
    const buffers = [Buffer.from(Int8Array.from([3]))];
    const data = Buffer.concat(buffers);
    const keys = [
        {
            pubkey: nameAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: nameOwnerKey,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: refundTargetKey,
            isSigner: false,
            isWritable: true,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: nameProgramId,
        data,
    });
}
exports.deleteInstruction = deleteInstruction;
class createV2Instruction {
    constructor(obj) {
        this.tag = 9;
        this.name = obj.name;
        this.space = obj.space;
    }
    serialize() {
        return (0, borsh_1.serialize)(createV2Instruction.schema, this);
    }
    getInstruction(programId, rentSysvarAccount, nameProgramId, rootDomain, nameAccount, reverseLookupAccount, centralState, buyer, buyerTokenAccount, fidaVault, state) {
        const data = Buffer.from(this.serialize());
        const keys = [
            {
                pubkey: rentSysvarAccount,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: nameProgramId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: rootDomain,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: nameAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: reverseLookupAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: web3_js_1.SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: centralState,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: buyer,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: buyerTokenAccount,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: constants_1.PYTH_FIDDA_PRICE_ACC,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: fidaVault,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: spl_token_1.TOKEN_PROGRAM_ID,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: state,
                isSigner: false,
                isWritable: false,
            },
        ];
        return new web3_js_1.TransactionInstruction({
            keys,
            programId,
            data,
        });
    }
}
exports.createV2Instruction = createV2Instruction;
createV2Instruction.schema = new Map([
    [
        createV2Instruction,
        {
            kind: "struct",
            fields: [
                ["tag", "u8"],
                ["name", "string"],
                ["space", "u32"],
            ],
        },
    ],
]);
//# sourceMappingURL=instructions.js.map