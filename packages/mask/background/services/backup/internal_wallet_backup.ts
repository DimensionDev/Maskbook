import { Some, None } from 'ts-results-es'
import { ec as EC } from 'elliptic'
import * as wallet_ts from /* webpackDefer: true */ 'wallet.ts'
import { isNonNull } from '@masknet/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NormalizedBackup } from '@masknet/backup-format'
import {
    toBase64URL,
    type EC_Public_JsonWebKey,
    type EC_Private_JsonWebKey,
    type LegacyWalletRecord,
} from '@masknet/shared-base'
import type { WalletRecord } from '../../../shared/definitions/wallet.js'
import { exportMnemonicWords, exportPrivateKey, getLegacyWallets, getWallets } from '../wallet/services/index.js'

export async function internal_wallet_backup() {
    const wallet = await Promise.all([backupAllWallets(), backupAllLegacyWallets()])
    return wallet.flat()
}

async function backupAllWallets(): Promise<NormalizedBackup.WalletBackup[]> {
    const wallets = await getWallets()
    const allSettled = await Promise.allSettled(
        wallets.map(async (wallet) => {
            return {
                ...wallet,
                mnemonic: !wallet.configurable ? await exportMnemonicWords(wallet.address) : undefined,
                privateKey: !wallet.configurable ? undefined : await exportPrivateKey(wallet.address),
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
        derivationPath: None,
        mnemonicId: None,
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

    if (wallet.mnemonicId) backup.mnemonicId = Some(wallet.mnemonicId)

    if (wallet.derivationPath) backup.derivationPath = Some(wallet.derivationPath)
    return backup
}

function LegacyWalletRecordToJSONFormat(wallet: LegacyWalletRecord): NormalizedBackup.WalletBackup {
    const backup: NormalizedBackup.WalletBackup = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        derivationPath: None,
        mnemonicId: None,
        mnemonic: None,
        passphrase: None,
        privateKey: None,
        publicKey: None,
    }

    // generate keys for managed wallet
    try {
        const wallet_ = wallet
        backup.passphrase = Some(wallet_.passphrase)
        if (wallet_.mnemonic.length)
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
}

function base64(numbers: number[]) {
    return toBase64URL(new Uint8Array(numbers).buffer)
}
function keyToAddr(key: string, type: 'public' | 'private'): string {
    const ec = new EC('secp256k1')
    const key_ = key.replace(/^0x/, '')
    const keyPair = type === 'public' ? ec.keyFromPublic(key_) : ec.keyFromPrivate(key_)
    return wallet_ts.EthereumAddress.from(Buffer.from(keyPair.getPublic(false, 'array'))).address
}
