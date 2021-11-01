export interface KeyStore {
    id: string
    crypto: CryptoKeyStore
    version: number
    address: string
}

export type CryptoKeyStore = CryptoKeyStore.Type

declare namespace CryptoKeyStore {
    type Type = AESCipher & KeyDerivation & { mac: string }

    interface AESCipher {
        cipher: 'aes-128-ctr' | 'aes-128-cbc'
        cipherparams: AESCipherParams
        ciphertext: string
    }

    interface AESCipherParams {
        iv: string
    }

    type KeyDerivation = PBKDF2 | Scrypt

    interface PBKDF2 {
        kdf: 'pbkdf2'
        kdfparams: PBKDF2Params
    }

    interface PBKDF2Params {
        c: number
        prf: 'hmac-sha256'
        dklen: number
        salt: string
    }

    interface Scrypt {
        kdf: 'scrypt'
        kdfparams: ScryptParams
    }

    interface ScryptParams {
        n: number
        p: number
        r: number
        dklen: number
        salt: string
    }
}
