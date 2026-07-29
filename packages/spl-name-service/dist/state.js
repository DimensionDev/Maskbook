"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mint = exports.TokenData = exports.NameRegistryState = void 0;
const web3_js_1 = require("@solana/web3.js");
const borsh_1 = require("borsh");
const nft_1 = require("./nft");
class NameRegistryState {
    constructor(obj) {
        this.parentName = new web3_js_1.PublicKey(obj.parentName);
        this.owner = new web3_js_1.PublicKey(obj.owner);
        this.class = new web3_js_1.PublicKey(obj.class);
    }
    static async retrieve(connection, nameAccountKey) {
        var _a;
        const nameAccount = await connection.getAccountInfo(nameAccountKey);
        if (!nameAccount) {
            throw new Error("Invalid name account provided");
        }
        let res = (0, borsh_1.deserializeUnchecked)(this.schema, NameRegistryState, nameAccount.data);
        res.data = (_a = nameAccount.data) === null || _a === void 0 ? void 0 : _a.slice(this.HEADER_LEN);
        const nftOwner = await (0, nft_1.retrieveNftOwner)(connection, nameAccountKey);
        return { registry: res, nftOwner };
    }
    static async _retrieveBatch(connection, nameAccountKeys) {
        const nameAccounts = await connection.getMultipleAccountsInfo(nameAccountKeys);
        const fn = (data) => {
            if (!data)
                return undefined;
            const res = (0, borsh_1.deserializeUnchecked)(this.schema, NameRegistryState, data);
            res.data = data === null || data === void 0 ? void 0 : data.slice(this.HEADER_LEN);
            return res;
        };
        return nameAccounts.map((e) => fn(e === null || e === void 0 ? void 0 : e.data));
    }
    static async retrieveBatch(connection, nameAccountKeys) {
        let result = [];
        while (nameAccountKeys.length > 0) {
            result.push(...(await this._retrieveBatch(connection, nameAccountKeys.splice(0, 100))));
        }
        return result;
    }
}
exports.NameRegistryState = NameRegistryState;
NameRegistryState.HEADER_LEN = 96;
NameRegistryState.schema = new Map([
    [
        NameRegistryState,
        {
            kind: "struct",
            fields: [
                ["parentName", [32]],
                ["owner", [32]],
                ["class", [32]],
            ],
        },
    ],
]);
class TokenData {
    constructor(obj) {
        this.name = obj.name;
        this.ticker = obj.ticker;
        this.mint = obj.mint;
        this.decimals = obj.decimals;
        this.website = obj === null || obj === void 0 ? void 0 : obj.website;
        this.logoUri = obj === null || obj === void 0 ? void 0 : obj.logoUri;
    }
    serialize() {
        return (0, borsh_1.serialize)(TokenData.schema, this);
    }
    static deserialize(data) {
        return (0, borsh_1.deserializeUnchecked)(TokenData.schema, TokenData, data);
    }
}
exports.TokenData = TokenData;
TokenData.schema = new Map([
    [
        TokenData,
        {
            kind: "struct",
            fields: [
                ["name", "string"],
                ["ticker", "string"],
                ["mint", [32]],
                ["decimals", "u8"],
                ["website", { kind: "option", type: "string" }],
                ["logoUri", { kind: "option", type: "string" }],
            ],
        },
    ],
]);
class Mint {
    constructor(obj) {
        this.mint = obj.mint;
    }
    serialize() {
        return (0, borsh_1.serialize)(Mint.schema, this);
    }
    static deserialize(data) {
        return (0, borsh_1.deserializeUnchecked)(Mint.schema, Mint, data);
    }
}
exports.Mint = Mint;
Mint.schema = new Map([
    [
        Mint,
        {
            kind: "struct",
            fields: [["mint", [32]]],
        },
    ],
]);
//# sourceMappingURL=state.js.map