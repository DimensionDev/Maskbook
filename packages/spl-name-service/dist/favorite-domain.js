"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavoriteDomain = void 0;
const name_offers_1 = require("@bonfida/name-offers");
const utils_1 = require("./utils");
const web3_js_1 = require("@solana/web3.js");
/**
 * This function can be used to retrieve the favorite domain of a user
 * @param connection The Solana RPC connection object
 * @param owner The owner you want to retrieve the favorite domain for
 * @returns
 */
const getFavoriteDomain = async (connection, owner) => {
    const [favKey] = await name_offers_1.FavouriteDomain.getKey(name_offers_1.NAME_OFFERS_ID, new web3_js_1.PublicKey(owner));
    const favorite = await name_offers_1.FavouriteDomain.retrieve(connection, favKey);
    const reverse = await (0, utils_1.performReverseLookup)(connection, favorite.nameAccount);
    return { domain: favorite.nameAccount, reverse };
};
exports.getFavoriteDomain = getFavoriteDomain;
//# sourceMappingURL=favorite-domain.js.map