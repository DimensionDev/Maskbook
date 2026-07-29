"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveNfts = exports.retrieveNftOwner = exports.MINT_PREFIX = exports.NAME_TOKENIZER_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
/**
 * Mainnet program ID
 */
exports.NAME_TOKENIZER_ID = new web3_js_1.PublicKey("nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk");
/**
 * PDA prefix
 */
exports.MINT_PREFIX = Buffer.from("tokenized_name");
/**
 * This function can be used to retrieve the owner of a tokenized domain name
 *
 * @param connection The solana connection object to the RPC node
 * @param nameAccount The key of the domain name
 * @returns
 */
const retrieveNftOwner = async (connection, nameAccount) => {
    var _a;
    try {
        const [mint] = await web3_js_1.PublicKey.findProgramAddress([exports.MINT_PREFIX, nameAccount.toBuffer()], exports.NAME_TOKENIZER_ID);
        const mintInfo = await (0, spl_token_1.getMint)(connection, mint);
        if (mintInfo.supply.toString() === "0") {
            return undefined;
        }
        const { value } = await connection.getTokenLargestAccounts(mint);
        const holder = (_a = value.find((e) => e.amount === "1")) === null || _a === void 0 ? void 0 : _a.address;
        if (!holder) {
            return undefined;
        }
        const info = await connection.getAccountInfo(holder);
        if (!info || !info.data) {
            return undefined;
        }
        return new web3_js_1.PublicKey(info.data.slice(32, 64));
    }
    catch {
        return undefined;
    }
};
exports.retrieveNftOwner = retrieveNftOwner;
/**
 * This function can be used to retrieve all the tokenized domains name
 *
 * @param connection The solana connection object to the RPC node
 * @returns
 */
const retrieveNfts = async (connection) => {
    const filters = [
        {
            memcmp: {
                offset: 0,
                bytes: "3",
            },
        },
    ];
    const result = await connection.getProgramAccounts(exports.NAME_TOKENIZER_ID, {
        filters,
    });
    const offset = 1 + 1 + 32 + 32;
    return result.map((e) => new web3_js_1.PublicKey(e.account.data.slice(offset, offset + 32)));
};
exports.retrieveNfts = retrieveNfts;
//# sourceMappingURL=nft.js.map