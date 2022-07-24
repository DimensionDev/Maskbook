export * from '../../../background/services/backup'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
assertEnvironment(Environment.ManifestBackground)

import { currySameAddress, isSameAddress } from '@masknet/web3-shared-base'
import {
    exportMnemonic,
    exportPrivateKey,
    getDerivableAccounts,
    getLegacyWallets,
    getWallets,
    recoverWalletFromMnemonic,
    recoverWalletFromPrivateKey,
} from '../../plugins/Wallet/services'
import { Some, None } from 'ts-results'
import { concatArrayBuffer, isNonNull } from '@dimensiondev/kit'
import { delegateWalletBackup } from '../../../background/services/backup/internal_create'
import type { NormalizedBackup } from '@masknet/backup-format'
import type { LegacyWalletRecord } from '../../plugins/Wallet/database/types'
import type { WalletRecord } from '../../plugins/Wallet/services/wallet/type'
import { delegateWalletRestore } from '../../../background/services/backup/internal_restore'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import { ec as EC } from 'elliptic'
import { EthereumAddress } from 'wallet.ts'
import {
    toBase64URL,
    fromBase64URL,
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    EC_JsonWebKey,
    isSecp256k1Point,
    isSecp256k1PrivateKey,
} from '@masknet/shared-base'
import { INTERNAL_getPasswordRequired } from '../../plugins/Wallet/services/wallet/password'

delegateWalletBackup(async function () {
    const wallet = await Promise.all([backupAllWallets(), backupAllLegacyWallets()])
    return wallet.flat()
})
delegateWalletRestore(async function (backup) {
    const password = await INTERNAL_getPasswordRequired()
    for (const wallet of backup) {
        try {
            const name = wallet.name

            if (wallet.privateKey.some)
                await recoverWalletFromPrivateKey(name, await JWKToKey(wallet.privateKey.val, 'private'), password)
            else if (wallet.mnemonic.some) {
                // fix a backup bug of pre-v2.2.2 versions
                const accounts = await getDerivableAccounts(wallet.mnemonic.val.words, 1, 5)
                const index = accounts.findIndex(currySameAddress(wallet.address))
                await recoverWalletFromMnemonic(
                    name,
                    wallet.mnemonic.val.words,
                    index > -1 ? `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/${index}` : wallet.mnemonic.val.path,
                    password,
                )
            }
        } catch (error) {
            console.error(error)
            continue
        }
    }
})
async function backupAllWallets(): Promise<NormalizedBackup.WalletBackup[]> {
    const wallets = await getWallets()
    const allSettled = await Promise.allSettled(
        wallets.map(async (wallet) => {
            return {
                ...wallet,
                mnemonic: wallet.derivationPath ? await exportMnemonic(wallet.address) : undefined,
                privateKey: wallet.derivationPath ? undefined : await exportPrivateKey(wallet.address),
            }
        }),
    )
    const wallets_ = allSettled.map((x) => (x.status === 'fulfilled' ? WalletRecordToJSONFormat(x.value) : null))
    if (wallets_.some((x) => !x)) throw new Error('Failed to backup wallets.')
    return wallets_.filter(isNonNull)
}

async function backupAllLegacyWallets(): Promise<NormalizedBackup.WalletBackup[]> {
    const x = await getLegacyWallets()
    return x.map(LegacyWalletRecordToJSONFormat)
}

function WalletRecordToJSONFormat(
    wallet: Omit<WalletRecord, 'type'> & {
        mnemonic?: string
        privateKey?: string
    },
): NormalizedBackup.WalletBackup {
    const backup: NormalizedBackup.WalletBackup = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        mnemonic: None,
        passphrase: None,
        publicKey: None,
        privateKey: None,
    }
    if (wallet.mnemonic && wallet.derivationPath) {
        backup.mnemonic = Some<NormalizedBackup.Mnemonic>({
            words: wallet.mnemonic,
            path: wallet.derivationPath,
            hasPassword: false,
        })
    }

    if (wallet.privateKey) backup.privateKey = Some(keyToJWK(wallet.privateKey, 'private'))

    return backup
}

function LegacyWalletRecordToJSONFormat(wallet: LegacyWalletRecord): NormalizedBackup.WalletBackup {
    const backup: NormalizedBackup.WalletBackup = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        mnemonic: None,
        passphrase: None,
        privateKey: None,
        publicKey: None,
    }

    // generate keys for managed wallet
    try {
        const wallet_ = wallet as LegacyWalletRecord
        backup.passphrase = Some(wallet_.passphrase)
        if (wallet_.mnemonic?.length)
            backup.mnemonic = Some<NormalizedBackup.Mnemonic>({
                words: wallet_.mnemonic.join(' '),
                path: "m/44'/60'/0'/0/0",
                hasPassword: false,
            })
        if (wallet_._public_key_ && isSameAddress(keyToAddr(wallet_._public_key_, 'public'), wallet.address))
            backup.publicKey = Some(keyToJWK(wallet_._public_key_, 'public'))
        if (wallet_._private_key_ && isSameAddress(keyToAddr(wallet_._private_key_, 'private'), wallet.address))
            backup.privateKey = Some(keyToJWK(wallet_._private_key_, 'private'))
    } catch (error) {
        console.error(error)
    }
    return backup
}

function keyToJWK(key: string, type: 'public'): EC_Public_JsonWebKey
function keyToJWK(key: string, type: 'private'): EC_Private_JsonWebKey
function keyToJWK(key: string, type: 'public' | 'private'): JsonWebKey {
    const ec = new EC('secp256k1')
    const key_ = key.replace(/^0x/, '')
    const keyPair = type === 'public' ? ec.keyFromPublic(key_) : ec.keyFromPrivate(key_)
    const pubKey = keyPair.getPublic()
    const privKey = keyPair.getPrivate()
    return {
        crv: 'K-256',
        ext: true,
        x: base64(pubKey.getX().toArray()),
        y: base64(pubKey.getY().toArray()),
        key_ops: ['deriveKey', 'deriveBits'],
        kty: 'EC',
        d: type === 'private' ? base64(privKey.toArray()) : undefined,
    }
    function base64(nums: number[]) {
        return toBase64URL(new Uint8Array(nums).buffer)
    }
}

async function JWKToKey(jwk: EC_JsonWebKey, type: 'public' | 'private'): Promise<string> {
    const ec = new EC('secp256k1')
    if (type === 'public' && jwk.x && jwk.y) {
        const xb = fromBase64URL(jwk.x)
        const yb = fromBase64URL(jwk.y)
        const point = new Uint8Array(concatArrayBuffer(new Uint8Array([0x04]), xb, yb))
        if (await isSecp256k1Point(point)) return `0x${ec.keyFromPublic(point).getPublic(false, 'hex')}`
    }
    if (type === 'private' && jwk.d) {
        const db = fromBase64URL(jwk.d)
        if (await isSecp256k1PrivateKey(db)) return `0x${ec.keyFromPrivate(db).getPrivate('hex')}`
    }
    throw new Error('invalid private key')
}

function keyToAddr(key: string, type: 'public' | 'private'): string {
    const ec = new EC('secp256k1')
    const key_ = key.replace(/^0x/, '')
    const keyPair = type === 'public' ? ec.keyFromPublic(key_) : ec.keyFromPrivate(key_)
    return EthereumAddress.from(keyPair.getPublic(false, 'array') as any).address
}
