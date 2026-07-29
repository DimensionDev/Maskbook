"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TWITTER_ROOT_PARENT_REGISTRY_KEY = exports.TWITTER_VERIFICATION_AUTHORITY = exports.REVERSE_LOOKUP_CLASS = exports.BONFIDA_FIDA_BNB = exports.PYTH_FIDDA_PRICE_ACC = exports.REGISTER_PROGRAM_ID = exports.ROOT_DOMAIN_ACCOUNT = exports.HASH_PREFIX = exports.NAME_PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
/**
 * The Solana Name Service program ID
 */
exports.NAME_PROGRAM_ID = new web3_js_1.PublicKey("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX");
/**
 * Hash prefix used to derive domain name addresses
 */
exports.HASH_PREFIX = "SPL Name Service";
/**
 * The `.sol` TLD
 */
exports.ROOT_DOMAIN_ACCOUNT = new web3_js_1.PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx");
/**
 * The Registry program ID
 */
exports.REGISTER_PROGRAM_ID = new web3_js_1.PublicKey("jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR");
/**
 * The FIDA Pyth price feed
 */
exports.PYTH_FIDDA_PRICE_ACC = new web3_js_1.PublicKey("ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF");
/**
 * The FIDA buy and burn address
 */
exports.BONFIDA_FIDA_BNB = new web3_js_1.PublicKey("AUoZ3YAhV3b2rZeEH93UMZHXUZcTramBvb4d9YEVySkc");
/**
 * The reverse look up class
 */
exports.REVERSE_LOOKUP_CLASS = new web3_js_1.PublicKey("33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z");
/**
 * The `.twitter` TLD authority
 */
exports.TWITTER_VERIFICATION_AUTHORITY = new web3_js_1.PublicKey("FvPH7PrVrLGKPfqaf3xJodFTjZriqrAXXLTVWEorTFBi");
/**
 * The `.twitter` TLD
 */
exports.TWITTER_ROOT_PARENT_REGISTRY_KEY = new web3_js_1.PublicKey("4YcexoW3r78zz16J2aqmukBLRwGq6rAvWzJpkYAXqebv");
//# sourceMappingURL=constants.js.map