"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.checkSolRecord = void 0;
const web3_js_1 = require("@solana/web3.js");
const record_1 = require("./record");
const utils_1 = require("./utils");
const state_1 = require("./state");
const tweetnacl_1 = require("tweetnacl");
const record_2 = require("./types/record");
/**
 * This function can be used to verify the validity of a SOL record
 * @param record The record data to verify
 * @param signedRecord The signed data
 * @param pubkey The public key of the signer
 * @returns
 */
const checkSolRecord = (record, signedRecord, pubkey) => {
    return tweetnacl_1.sign.detached.verify(record, signedRecord, pubkey.toBytes());
};
exports.checkSolRecord = checkSolRecord;
/**
 * This function can be used to resolve a domain name to transfer funds
 * @param connection The Solana RPC connection object
 * @param domain The domain to resolve
 * @returns
 */
const resolve = async (connection, domain) => {
    var _a;
    const { pubkey } = await (0, utils_1.getDomainKey)(domain);
    const { registry, nftOwner } = await state_1.NameRegistryState.retrieve(connection, pubkey);
    if (nftOwner) {
        return nftOwner;
    }
    try {
        const recordKey = await (0, utils_1.getDomainKey)(record_2.Record.SOL + "." + domain, true);
        const solRecord = await (0, record_1.getSolRecord)(connection, domain);
        if (((_a = solRecord.data) === null || _a === void 0 ? void 0 : _a.length) !== 96) {
            throw new Error("Invalid SOL record data");
        }
        const encoder = new TextEncoder();
        const expectedBuffer = Buffer.concat([
            solRecord.data.slice(0, 32),
            recordKey.pubkey.toBuffer(),
        ]);
        const expected = encoder.encode(expectedBuffer.toString("hex"));
        const valid = (0, exports.checkSolRecord)(expected, solRecord.data.slice(32), registry.owner);
        if (!valid) {
            throw new Error("Signature invalid");
        }
        return new web3_js_1.PublicKey(solRecord.data.slice(0, 32));
    }
    catch { }
    return registry.owner;
};
exports.resolve = resolve;
