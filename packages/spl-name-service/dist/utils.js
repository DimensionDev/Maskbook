"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRegisteredDomains = exports.getAllDomains = exports.getDomainKey = exports.findSubdomains = exports.performReverseLookupBatch = exports.getDNSRecordAddress = exports.performReverseLookup = exports.getNameAccountKey = exports.getHashedName = exports.getNameOwner = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const constants_1 = require("./constants");
const state_1 = require("./state");
const constants_2 = require("./constants");
async function getNameOwner(connection, nameAccountKey) {
    const nameAccount = await connection.getAccountInfo(nameAccountKey);
    if (!nameAccount) {
        throw new Error("Unable to find the given account.");
    }
    return state_1.NameRegistryState.retrieve(connection, nameAccountKey);
}
exports.getNameOwner = getNameOwner;
async function getHashedName(name) {
    const input = constants_1.HASH_PREFIX + name;
    const digest = await globalThis.crypto.subtle.digest("SHA-256", Buffer.from(input, "utf8"));
    return Buffer.from(digest);
}
exports.getHashedName = getHashedName;
async function getNameAccountKey(hashed_name, nameClass, nameParent) {
    const seeds = [hashed_name];
    if (nameClass) {
        seeds.push(nameClass.toBuffer());
    }
    else {
        seeds.push(Buffer.alloc(32));
    }
    if (nameParent) {
        seeds.push(nameParent.toBuffer());
    }
    else {
        seeds.push(Buffer.alloc(32));
    }
    const [nameAccountKey] = await web3_js_1.PublicKey.findProgramAddress(seeds, constants_1.NAME_PROGRAM_ID);
    return nameAccountKey;
}
exports.getNameAccountKey = getNameAccountKey;
async function performReverseLookup(connection, nameAccount) {
    const hashedReverseLookup = await getHashedName(nameAccount.toBase58());
    const reverseLookupAccount = await getNameAccountKey(hashedReverseLookup, constants_2.REVERSE_LOOKUP_CLASS);
    const { registry } = await state_1.NameRegistryState.retrieve(connection, reverseLookupAccount);
    if (!registry.data) {
        throw "Could not retrieve name data";
    }
    const nameLength = new bn_js_1.default(registry.data.slice(0, 4), "le").toNumber();
    return registry.data.slice(4, 4 + nameLength).toString();
}
exports.performReverseLookup = performReverseLookup;
async function getDNSRecordAddress(nameAccount, type) {
    const hashedName = await getHashedName("\0".concat(type));
    const recordAccount = await getNameAccountKey(hashedName, undefined, nameAccount);
    return recordAccount;
}
exports.getDNSRecordAddress = getDNSRecordAddress;
async function performReverseLookupBatch(connection, nameAccounts) {
    let reverseLookupAccounts = [];
    for (let nameAccount of nameAccounts) {
        const hashedReverseLookup = await getHashedName(nameAccount.toBase58());
        const reverseLookupAccount = await getNameAccountKey(hashedReverseLookup, constants_2.REVERSE_LOOKUP_CLASS);
        reverseLookupAccounts.push(reverseLookupAccount);
    }
    let names = await state_1.NameRegistryState.retrieveBatch(connection, reverseLookupAccounts);
    return names.map((name) => {
        if (name === undefined || name.data === undefined) {
            return undefined;
        }
        let nameLength = new bn_js_1.default(name.data.slice(0, 4), "le").toNumber();
        return name.data.slice(4, 4 + nameLength).toString();
    });
}
exports.performReverseLookupBatch = performReverseLookupBatch;
/**
 *
 * @param connection The Solana RPC connection object
 * @param parentKey The parent you want to find sub-domains for
 * @returns
 */
const findSubdomains = async (connection, parentKey) => {
    const filters = [
        {
            memcmp: {
                offset: 0,
                bytes: parentKey.toBase58(),
            },
        },
        {
            memcmp: {
                offset: 64,
                bytes: constants_2.REVERSE_LOOKUP_CLASS.toBase58(),
            },
        },
    ];
    const result = await connection.getProgramAccounts(constants_1.NAME_PROGRAM_ID, {
        filters,
    });
    return result.map((e) => { var _a; return (_a = e.account.data.slice(97).toString("utf-8")) === null || _a === void 0 ? void 0 : _a.split("\0").join(""); });
};
exports.findSubdomains = findSubdomains;
const _derive = async (name, parent = constants_1.ROOT_DOMAIN_ACCOUNT) => {
    let hashed = await getHashedName(name);
    let pubkey = await getNameAccountKey(hashed, undefined, parent);
    return { pubkey, hashed };
};
/**
 * This function can be used to compute the public key of a domain or subdomain
 * @param domain The domain to compute the public key for (e.g `bonfida.sol`, `dex.bonfida.sol`)
 * @returns
 */
const getDomainKey = async (domain, record = false) => {
    if (domain.endsWith(".sol")) {
        domain = domain.slice(0, -4);
    }
    const splitted = domain.split(".");
    if (splitted.length === 2) {
        const prefix = Buffer.from([record ? 1 : 0]).toString();
        const sub = prefix.concat(splitted[0]);
        const { pubkey: parentKey } = await _derive(splitted[1]);
        const result = await _derive(sub, parentKey);
        return { ...result, isSub: true, parent: parentKey };
    }
    else if (splitted.length > 2) {
        throw new Error("Invalid derivation input");
    }
    const result = await _derive(domain, constants_1.ROOT_DOMAIN_ACCOUNT);
    return { ...result, isSub: false, parent: undefined };
};
exports.getDomainKey = getDomainKey;
/**
 * This function can be used to retrieve all domain names owned by `wallet`
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns
 */
async function getAllDomains(connection, wallet) {
    const filters = [
        {
            memcmp: {
                offset: 32,
                bytes: wallet.toBase58(),
            },
        },
        {
            memcmp: {
                offset: 0,
                bytes: constants_1.ROOT_DOMAIN_ACCOUNT.toBase58(),
            },
        },
    ];
    const accounts = await connection.getProgramAccounts(constants_1.NAME_PROGRAM_ID, {
        filters,
    });
    return accounts.map((a) => a.pubkey);
}
exports.getAllDomains = getAllDomains;
/**
 * This function can be used to retrieve all the registered `.sol` domains.
 * The account data is sliced to avoid enormous payload and only the owner is returned
 * @param connection The Solana RPC connection object
 * @returns
 */
const getAllRegisteredDomains = async (connection) => {
    const filters = [
        {
            memcmp: {
                offset: 0,
                bytes: constants_1.ROOT_DOMAIN_ACCOUNT.toBase58(),
            },
        },
    ];
    const dataSlice = { offset: 32, length: 32 };
    const accounts = await connection.getProgramAccounts(constants_1.NAME_PROGRAM_ID, {
        dataSlice,
        filters,
    });
    return accounts;
};
exports.getAllRegisteredDomains = getAllRegisteredDomains;
