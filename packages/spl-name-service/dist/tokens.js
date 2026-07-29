"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenInfoFromName = exports.getTokenInfoFromMint = exports.TOKEN_TLD = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
const state_1 = require("./state");
exports.TOKEN_TLD = new web3_js_1.PublicKey("6NSu2tci4apRKQtt257bAVcvqYjB3zV2H1dWo56vgpa6");
const getTokenInfoFromMint = async (connection, mint) => {
    const nameKey = await (0, utils_1.getNameAccountKey)(await (0, utils_1.getHashedName)(mint.toBase58()), undefined, exports.TOKEN_TLD);
    const { registry } = await state_1.NameRegistryState.retrieve(connection, nameKey);
    if (!registry.data) {
        throw new Error("Invalid account data");
    }
    return state_1.TokenData.deserialize(registry.data);
};
exports.getTokenInfoFromMint = getTokenInfoFromMint;
const getTokenInfoFromName = async (connection, name) => {
    const reverseNameKey = await (0, utils_1.getNameAccountKey)(await (0, utils_1.getHashedName)(name), undefined, exports.TOKEN_TLD);
    const { registry: reverseRegistry } = await state_1.NameRegistryState.retrieve(connection, reverseNameKey);
    if (!reverseRegistry.data) {
        throw new Error("Invalid account data");
    }
    const mint = new web3_js_1.PublicKey(state_1.Mint.deserialize(reverseRegistry.data).mint);
    return await (0, exports.getTokenInfoFromMint)(connection, mint);
};
exports.getTokenInfoFromName = getTokenInfoFromName;
//# sourceMappingURL=tokens.js.map