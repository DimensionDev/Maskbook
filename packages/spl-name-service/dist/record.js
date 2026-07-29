"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointRecord = exports.getSolRecord = exports.getShdwRecord = exports.getPicRecord = exports.getTelegramRecord = exports.getTwitterRecord = exports.getRedditRecord = exports.getGithubRecord = exports.getDiscordRecord = exports.getUrlRecord = exports.getEmailRecord = exports.getDogeRecord = exports.getLtcRecord = exports.getBtcRecord = exports.getEthRecord = exports.getArweaveRecord = exports.getIpfsRecord = exports.getRecord = void 0;
const record_1 = require("./types/record");
const utils_1 = require("./utils");
const state_1 = require("./state");
/**
 * This function can be used to retrieve a specified record for the given domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @param record The record to search for
 * @returns
 */
const getRecord = async (connection, domain, record) => {
    var _a, _b;
    const { pubkey } = await (0, utils_1.getDomainKey)(record + "." + domain, true);
    let { registry } = await state_1.NameRegistryState.retrieve(connection, pubkey);
    // Remove trailling 0s
    const idx = (_a = registry.data) === null || _a === void 0 ? void 0 : _a.indexOf(0x00);
    registry.data = (_b = registry.data) === null || _b === void 0 ? void 0 : _b.slice(0, idx);
    return registry;
};
exports.getRecord = getRecord;
/**
 * This function can be used to retrieve the IPFS record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getIpfsRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.IPFS);
};
exports.getIpfsRecord = getIpfsRecord;
/**
 * This function can be used to retrieve the Arweave record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getArweaveRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.ARWV);
};
exports.getArweaveRecord = getArweaveRecord;
/**
 * This function can be used to retrieve the ETH record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getEthRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.ETH);
};
exports.getEthRecord = getEthRecord;
/**
 * This function can be used to retrieve the BTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getBtcRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.BTC);
};
exports.getBtcRecord = getBtcRecord;
/**
 * This function can be used to retrieve the LTC record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getLtcRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.LTC);
};
exports.getLtcRecord = getLtcRecord;
/**
 * This function can be used to retrieve the DOGE record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getDogeRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.DOGE);
};
exports.getDogeRecord = getDogeRecord;
/**
 * This function can be used to retrieve the email record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getEmailRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Email);
};
exports.getEmailRecord = getEmailRecord;
/**
 * This function can be used to retrieve the URL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getUrlRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Url);
};
exports.getUrlRecord = getUrlRecord;
/**
 * This function can be used to retrieve the Discord record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getDiscordRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Discord);
};
exports.getDiscordRecord = getDiscordRecord;
/**
 * This function can be used to retrieve the Github record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getGithubRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Github);
};
exports.getGithubRecord = getGithubRecord;
/**
 * This function can be used to retrieve the Reddit record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getRedditRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Reddit);
};
exports.getRedditRecord = getRedditRecord;
/**
 * This function can be used to retrieve the Twitter record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getTwitterRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Twitter);
};
exports.getTwitterRecord = getTwitterRecord;
/**
 * This function can be used to retrieve the Telegram record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getTelegramRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Telegram);
};
exports.getTelegramRecord = getTelegramRecord;
/**
 * This function can be used to retrieve the pic record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getPicRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.Pic);
};
exports.getPicRecord = getPicRecord;
/**
 * This function can be used to retrieve the SHDW record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getShdwRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.SHDW);
};
exports.getShdwRecord = getShdwRecord;
/**
 * This function can be used to retrieve the SOL record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getSolRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.SOL);
};
exports.getSolRecord = getSolRecord;
/**
 * This function can be used to retrieve the POINT record of a domain name
 * @param connection The Solana RPC connection object
 * @param domain The .sol domain name
 * @returns
 */
const getPointRecord = async (connection, domain) => {
    return await (0, exports.getRecord)(connection, domain, record_1.Record.POINT);
};
exports.getPointRecord = getPointRecord;
//# sourceMappingURL=record.js.map