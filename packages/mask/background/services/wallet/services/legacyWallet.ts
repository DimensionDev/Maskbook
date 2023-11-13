import * as bip39 from 'bip39'
import * as wallet_ts from /* webpackDefer: true */ 'wallet.ts'
import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'
import { fromHex, toHex, type LegacyWalletRecord } from '@masknet/shared-base'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/web3-shared-base'
import { createTransaction } from '../../../database/utils/openDB.js'
import { createWalletDBAccess } from '../database/Wallet.db.js'
import { LegacyWalletRecordOutDB } from './helpers.js'

function sortWallet(a: LegacyWalletRecord, b: LegacyWalletRecord) {
    if (a.updatedAt > b.updatedAt) return -1
    if (a.updatedAt < b.updatedAt) return 1
    if (a.createdAt > b.createdAt) return -1
    if (a.createdAt < b.createdAt) return 1
    return 0
}

export async function getLegacyWallets() {
    const wallets = await getAllWalletRecords()
    return wallets.filter((x) => x._private_key_ || x.mnemonic.length)
}

async function getAllWalletRecords() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const records = await t.objectStore('Wallet').getAll()
    const wallets = (
        await Promise.all<LegacyWalletRecord>(
            records.map(async (record) => {
                const walletRecord = LegacyWalletRecordOutDB(record)
                return {
                    ...walletRecord,
                    _private_key_: await makePrivateKey(walletRecord),
                }
            }),
        )
    ).sort(sortWallet)
    return wallets
}

async function makePrivateKey(record: LegacyWalletRecord) {
    // not a managed wallet
    if (!record._private_key_ && !record.mnemonic.length) return ''
    const { privateKey } =
        record._private_key_ ?
            await recoverWalletFromPrivateKey(record._private_key_)
        :   await recoverWalletFromMnemonicWords(record.mnemonic, record.passphrase, record.path)
    return `0x${toHex(privateKey)}`
}

async function recoverWalletFromMnemonicWords(
    mnemonic: string[],
    passphrase: string,
    path = `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
) {
    const seed = await bip39.mnemonicToSeed(mnemonic.join(' '), passphrase)
    const masterKey = wallet_ts.HDKey.parseMasterSeed(seed)
    const extendedPrivateKey = masterKey.derive(path).extendedPrivateKey!
    const childKey = wallet_ts.HDKey.parseExtendedKey(extendedPrivateKey)
    const wallet = childKey.derive('')
    const walletPublicKey = wallet.publicKey
    const walletPrivateKey = wallet.privateKey!
    return {
        address: wallet_ts.EthereumAddress.from(walletPublicKey).address,
        privateKey: walletPrivateKey,
        privateKeyValid: true,
        privateKeyInHex: `0x${toHex(walletPrivateKey)}`,
        path,
        mnemonic,
        passphrase,
    }
}

async function recoverWalletFromPrivateKey(privateKey: string) {
    const ec = new EC('secp256k1')
    const privateKey_ = privateKey.replace(/^0x/, '').trim() // strip 0x
    const key = ec.keyFromPrivate(privateKey_)
    return {
        address: wallet_ts.EthereumAddress.from(key.getPublic(false, 'array') as any).address,
        privateKey: fromHex(privateKey_),
        privateKeyValid: privateKeyVerify(privateKey_),
        privateKeyInHex: privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`,
        mnemonic: [],
    }
}

function privateKeyVerify(key: string) {
    if (!/[\da-f]{64}/i.test(key)) return false
    const k = new BigNumber(key, 16)
    const n = new BigNumber('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)
    return !k.isZero() && k.isLessThan(n)
}
