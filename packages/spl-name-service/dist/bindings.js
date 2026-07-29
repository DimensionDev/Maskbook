"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDomainName = exports.deleteNameRegistry = exports.transferNameOwnership = exports.updateNameRegistryData = exports.createNameRegistry = void 0;
const web3_js_1 = require("@solana/web3.js");
const instructions_1 = require("./instructions");
const state_1 = require("./state");
const int_1 = require("./int");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
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
async function createNameRegistry(connection, name, space, payerKey, nameOwner, lamports, nameClass, parentName) {
    const hashed_name = await (0, utils_1.getHashedName)(name);
    const nameAccountKey = await (0, utils_1.getNameAccountKey)(hashed_name, nameClass, parentName);
    const balance = lamports
        ? lamports
        : await connection.getMinimumBalanceForRentExemption(space);
    let nameParentOwner;
    if (parentName) {
        const { registry: parentAccount } = await (0, utils_1.getNameOwner)(connection, parentName);
        nameParentOwner = parentAccount.owner;
    }
    const createNameInstr = (0, instructions_1.createInstruction)(constants_1.NAME_PROGRAM_ID, web3_js_1.SystemProgram.programId, nameAccountKey, nameOwner, payerKey, hashed_name, 
    //@ts-ignore
    new int_1.Numberu64(balance), 
    //@ts-ignore
    new int_1.Numberu32(space), nameClass, parentName, nameParentOwner);
    return createNameInstr;
}
exports.createNameRegistry = createNameRegistry;
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
async function updateNameRegistryData(connection, name, offset, input_data, nameClass, nameParent) {
    const hashed_name = await (0, utils_1.getHashedName)(name);
    const nameAccountKey = await (0, utils_1.getNameAccountKey)(hashed_name, nameClass, nameParent);
    let signer;
    if (nameClass) {
        signer = nameClass;
    }
    else {
        signer = (await state_1.NameRegistryState.retrieve(connection, nameAccountKey))
            .registry.owner;
    }
    const updateInstr = (0, instructions_1.updateInstruction)(constants_1.NAME_PROGRAM_ID, nameAccountKey, 
    //@ts-ignore
    new int_1.Numberu32(offset), input_data, signer);
    return updateInstr;
}
exports.updateNameRegistryData = updateNameRegistryData;
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
async function transferNameOwnership(connection, name, newOwner, nameClass, nameParent, parentOwner) {
    const hashed_name = await (0, utils_1.getHashedName)(name);
    const nameAccountKey = await (0, utils_1.getNameAccountKey)(hashed_name, nameClass, nameParent);
    let curentNameOwner;
    if (nameClass) {
        curentNameOwner = nameClass;
    }
    else {
        curentNameOwner = (await state_1.NameRegistryState.retrieve(connection, nameAccountKey)).registry.owner;
    }
    const transferInstr = (0, instructions_1.transferInstruction)(constants_1.NAME_PROGRAM_ID, nameAccountKey, newOwner, curentNameOwner, nameClass, nameParent, parentOwner);
    return transferInstr;
}
exports.transferNameOwnership = transferNameOwnership;
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
async function deleteNameRegistry(connection, name, refundTargetKey, nameClass, nameParent) {
    const hashed_name = await (0, utils_1.getHashedName)(name);
    const nameAccountKey = await (0, utils_1.getNameAccountKey)(hashed_name, nameClass, nameParent);
    let nameOwner;
    if (nameClass) {
        nameOwner = nameClass;
    }
    else {
        nameOwner = (await state_1.NameRegistryState.retrieve(connection, nameAccountKey))
            .registry.owner;
    }
    const changeAuthoritiesInstr = (0, instructions_1.deleteInstruction)(constants_1.NAME_PROGRAM_ID, nameAccountKey, refundTargetKey, nameOwner);
    return changeAuthoritiesInstr;
}
exports.deleteNameRegistry = deleteNameRegistry;
/**
 * This function can be used to register a .sol domain
 * @param name The domain name to register e.g bonfida if you want to register bonfida.sol
 * @param space The domain name account size (max 10kB)
 * @param buyer The public key of the buyer
 * @param buyerTokenAccount The buyer FIDA token account
 * @returns
 */
const registerDomainName = async (name, space, buyer, buyerTokenAccount) => {
    const [centralState] = await web3_js_1.PublicKey.findProgramAddress([constants_1.REGISTER_PROGRAM_ID.toBuffer()], constants_1.REGISTER_PROGRAM_ID);
    const hashed = await (0, utils_1.getHashedName)(name);
    const nameAccount = await (0, utils_1.getNameAccountKey)(hashed, undefined, constants_1.ROOT_DOMAIN_ACCOUNT);
    const hashedReverseLookup = await (0, utils_1.getHashedName)(nameAccount.toBase58());
    const reverseLookupAccount = await (0, utils_1.getNameAccountKey)(hashedReverseLookup, centralState);
    const [derived_state] = await web3_js_1.PublicKey.findProgramAddress([nameAccount.toBuffer()], constants_1.REGISTER_PROGRAM_ID);
    const ix = new instructions_1.createV2Instruction({ name, space }).getInstruction(constants_1.REGISTER_PROGRAM_ID, web3_js_1.SYSVAR_RENT_PUBKEY, constants_1.NAME_PROGRAM_ID, constants_1.ROOT_DOMAIN_ACCOUNT, nameAccount, reverseLookupAccount, centralState, buyer, buyerTokenAccount, constants_1.BONFIDA_FIDA_BNB, derived_state);
    return [[], [ix]];
};
exports.registerDomainName = registerDomainName;
//# sourceMappingURL=bindings.js.map