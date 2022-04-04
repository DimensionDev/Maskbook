/**
 # @harmony-js/crypto
This package provides a collection of apis related to address management, keystore, encoding, and encrypt/decrypt.
## Installation
```
npm install @harmony-js/crypto
```
## Usage
```javascript
* const {
*   encode,
*   decode,
*   randomBytes,
*   toBech32,
*   fromBech32,
*   HarmonyAddress,
*   generatePrivateKey,
*   getPubkeyFromPrivateKey,
*   getAddressFromPublicKey,
*   getAddressFromPrivateKey,
*   encryptPhrase,
*   decryptPhrase
* } = require('@harmony-js/crypto');
* const { isPrivateKey, isAddress, isPublicKey } = require('@harmony-js/utils');
```
Address apis
```javascript
const bytes = randomBytes(20);
const addr = new HarmonyAddress(bytes);
console.log(addr.checksum);
console.log(addr.bech32);
console.log(HarmonyAddress.isValidBech32(addr.bech32));
```
RLP apis
```javascript
const encoded = '0x89010101010101010101';
const decoded = '0x010101010101010101';
console.log(encode(decoded));
console.log(decode(encoded));
```
Keystore apis
```javascript
const prv = generatePrivateKey();
const pub = getPubkeyFromPrivateKey(prv);
const addr = getAddressFromPublicKey(pub);
const addrPrv = getAddressFromPrivateKey(prv);
console.log(isPrivateKey(prv));
console.log(isPublicKey(pub));
console.log(isAddress(addr));
console.log(isAddress(addrPrv));
```
Encrypt/decrypt apis
```javascript
* const { Wallet } = require('@harmony-js/account');
* const myPhrase = new Wallet().newMnemonic();
* console.log(myPhrase);
* const pwd = '1234';
* encryptPhrase(myPhrase, pwd).then((value) => {
*   console.log(value);
*   decryptPhrase(JSON.parse(value), pwd).then(value => {
*     console.log(value);
*   });
* });
```
 *
 * @packageDocumentation
 * @module harmony-crypto
 */

// This file is ported from ether.js/src.ts/errors.ts

// Unknown Error
/** @hidden */
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

// Not implemented
/** @hidden */
export const NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'

// Missing new operator to an object
//  - name: The name of the class
/** @hidden */
export const MISSING_NEW = 'MISSING_NEW'

// Call exception
//  - transaction: the transaction
//  - address?: the contract address
//  - args?: The arguments passed into the function
//  - method?: The Solidity method signature
//  - errorSignature?: The EIP848 error signature
//  - errorArgs?: The EIP848 error parameters
//  - reason: The reason (only for EIP848 "Error(string)")
/** @hidden */
export const CALL_EXCEPTION = 'CALL_EXCEPTION'

// Invalid argument (e.g. value is incompatible with type) to a function:
//   - argument: The argument name that was invalid
//   - value: The value of the argument
/** @hidden */
export const INVALID_ARGUMENT = 'INVALID_ARGUMENT'

// Missing argument to a function:
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
/** @hidden */
export const MISSING_ARGUMENT = 'MISSING_ARGUMENT'

// Too many arguments
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
/** @hidden */
export const UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT'

// Numeric Fault
//   - operation: the operation being executed
//   - fault: the reason this faulted
/** @hidden */
export const NUMERIC_FAULT = 'NUMERIC_FAULT'

// Insufficient funds (< value + gasLimit * gasPrice)
//   - transaction: the transaction attempted
/** @hidden */
export const INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'

// Nonce has already been used
//   - transaction: the transaction attempted
/** @hidden */
export const NONCE_EXPIRED = 'NONCE_EXPIRED'

// The replacement fee for the transaction is too low
//   - transaction: the transaction attempted
/** @hidden */
export const REPLACEMENT_UNDERPRICED = 'REPLACEMENT_UNDERPRICED'

// Unsupported operation
//   - operation
/** @hidden */
export const UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'

// tslint:disable-next-line: variable-name
/** @hidden */
let _permanentCensorErrors = false
// tslint:disable-next-line: variable-name
/** @hidden */
let _censorErrors = false

// @TODO: Enum
/** @hidden */
export function throwError(message: string, code: string | null | undefined, params: any): never {
    if (_censorErrors) {
        throw new Error('unknown error')
    }

    if (!code) {
        code = UNKNOWN_ERROR
    }
    if (!params) {
        params = {}
    }

    const messageDetails: string[] = []
    Object.keys(params).forEach((key) => {
        try {
            messageDetails.push(key + '=' + JSON.stringify(params[key]))
        } catch (error) {
            messageDetails.push(key + '=' + JSON.stringify(params[key].toString()))
        }
    })
    // eslint-disable-next-line no-useless-concat
    messageDetails.push('version=' + '#version')

    const reason = message
    if (messageDetails.length) {
        message += ' (' + messageDetails.join(', ') + ')'
    }

    // @TODO: Any??
    const error: any = new Error(message)
    error.reason = reason
    error.code = code

    Object.keys(params).forEach((key) => {
        error[key] = params[key]
    })

    throw error
}

/** @hidden */
export function checkNew(self: any, kind: any): void {
    if (!(self instanceof kind)) {
        throwError('missing new', MISSING_NEW, { name: kind.name })
    }
}

/** @hidden */
export function checkArgumentCount(count: number, expectedCount: number, suffix?: string): void {
    if (!suffix) {
        suffix = ''
    }
    if (count < expectedCount) {
        throwError('missing argument' + suffix, MISSING_ARGUMENT, {
            count,
            expectedCount,
        })
    }
    if (count > expectedCount) {
        throwError('too many arguments' + suffix, UNEXPECTED_ARGUMENT, {
            count,
            expectedCount,
        })
    }
}

/** @hidden */
export function setCensorship(censorship: boolean, permanent?: boolean): void {
    if (_permanentCensorErrors) {
        throwError('error censorship permanent', UNSUPPORTED_OPERATION, {
            operation: 'setCensorship',
        })
    }

    _censorErrors = !!censorship
    _permanentCensorErrors = !!permanent
}

/** @hidden */
export function checkNormalize(): void {
    try {
        // Make sure all forms of normalization are supported
        ;['NFD', 'NFC', 'NFKD', 'NFKC'].forEach((form) => {
            try {
                'test'.normalize(form)
            } catch (error) {
                throw new Error('missing ' + form)
            }
        })

        if (String.fromCharCode(0xe9).normalize('NFD') !== String.fromCharCode(0x65, 0x0301)) {
            throw new Error('broken implementation')
        }
    } catch (error) {
        throwError('platform missing String.prototype.normalize', UNSUPPORTED_OPERATION, {
            operation: 'String.prototype.normalize',
            // @ts-ignore
            form: error.message,
        })
    }
}

/** @hidden */
const LogLevels: { [name: string]: number } = {
    debug: 1,
    default: 2,
    info: 2,
    warn: 3,
    error: 4,
    off: 5,
}
/** @hidden */
let LogLevel = LogLevels.default

/** @hidden */
export function setLogLevel(logLevel: string): void {
    const level = LogLevels[logLevel]
    if (level === null) {
        warn('invalid log level - ' + logLevel)
        return
    }
    LogLevel = level
}

/** @hidden */
function log(logLevel: string, args: [any?, ...any[]]): void {
    if (LogLevel > LogLevels[logLevel]) {
        return
    }
    console.log.apply(console, args)
}

/** @hidden */
export function warn(...args: [any?, ...any[]]): void {
    log('warn', args)
}

/** @hidden */
export function info(...args: [any?, ...any[]]): void {
    log('info', args)
}
