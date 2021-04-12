import scrypt from 'scrypt-js'
import * as crypto from 'crypto'
import Web3Utils from 'web3-utils'

export interface ScryptParams {
    dklen: number
    n: number
    p: number
    r: number
    salt: string
}

export interface PDKDF2Params {
    c: number
    prf: string
    dklen: number
    salt: string
}

export interface V3Keystore {
    crypto: {
        cipher: string
        ciphertext: string
        cipherparams: {
            iv: string
        }
        kdf: string
        kdfparams: ScryptParams | PDKDF2Params
        mac: string
    }
    id: string
    version: number
    address: string
}

export async function fromV3Keystore(input: string | V3Keystore, password: string) {
    const json: V3Keystore = typeof input === 'object' ? input : JSON.parse(input)

    if (json.version !== 3) {
        throw new Error('Not a V3 wallet')
    }

    let derivedKey: Uint8Array, kdfparams: ScryptParams | PDKDF2Params
    if (json.crypto.kdf.toLowerCase() === 'scrypt') {
        kdfparams = json.crypto.kdfparams as ScryptParams
        derivedKey = scrypt.syncScrypt(
            Buffer.from(password),
            Buffer.from(kdfparams.salt, 'hex'),
            kdfparams.n,
            kdfparams.r,
            kdfparams.p,
            kdfparams.dklen,
        )
    } else if (json.crypto.kdf.toLowerCase() === 'pbkdf2') {
        kdfparams = json.crypto.kdfparams as PDKDF2Params
        if (kdfparams.prf !== 'hmac-sha256') {
            throw new Error('Unsupported parameters to PBKDF2')
        }
        derivedKey = crypto.pbkdf2Sync(
            Buffer.from(password),
            Buffer.from(kdfparams.salt, 'hex'),
            kdfparams.c,
            kdfparams.dklen,
            'sha256',
        )
    } else {
        throw new Error('Unsupport key derivation scheme')
    }
    const ciphertext = Buffer.from(json.crypto.ciphertext, 'hex')
    const buf = Buffer.concat([Buffer.from(derivedKey.slice(16, 32)), ciphertext])
    const mac = Web3Utils.sha3(`0x${buf.toString('hex')}`)
    if (mac !== `0x${json.crypto.mac}`) {
        throw new Error('Key derivation failed - possibly wrong passphrase')
    }

    const decipher = crypto.createCipheriv(
        json.crypto.cipher,
        derivedKey.slice(0, 16),
        Buffer.from(json.crypto.cipherparams.iv, 'hex'),
    )
    const seed = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return { address: `0x${json.address}`, privateKey: `0x${seed.toString('hex')}` } as {
        address: string
        privateKey: string
    }
}
