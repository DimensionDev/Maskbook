import * as bip39 from 'bip39'
import { first } from 'lodash-es'
import { HDKey, EthereumAddress } from 'wallet.ts'
import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'
import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import type { WalletRecord } from '../database/types'
import { PluginMessageCenter } from '../../PluginMessages'
import { buf2hex, hex2buf, assert } from '../../../utils/utils'
import { ProviderType } from '../../../web3/types'
import { resolveProviderName } from '../../../web3/pipes'
import { formatChecksumAddress } from '../formatter'
import { getWalletByAddress, WalletRecordIntoDB, WalletRecordOutDB } from './helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings } from '../settings'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"

function sortWallet(a: WalletRecord, b: WalletRecord) {
    const address = currentSelectedWalletAddressSettings.value
    if (a.address === address) return -1
    if (b.address === address) return 1
    if (a.updatedAt > b.updatedAt) return -1
    if (a.updatedAt < b.updatedAt) return 1
    if (a.createdAt > b.createdAt) return -1
    if (a.createdAt < b.createdAt) return 1
    return 0
}

export async function isEmptyWallets() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const count = await t.objectStore('Wallet').count()
    return count === 0
}

export async function getWallet(address: string) {
    const wallets = await getWallets()
    return wallets.find((x) => isSameAddress(x.address, address))
}

export async function getSelectedWallet() {
    const wallets = await getWallets()
    const address = currentSelectedWalletAddressSettings.value
    return (address ? wallets.find((x) => x.address === address) : undefined) ?? first(wallets)
}

export async function getWallets(provider?: ProviderType) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const records = await t.objectStore('Wallet').getAll()
    const wallets = (
        await Promise.all<WalletRecord>(
            records.map(async (record) => {
                const walletRecord = WalletRecordOutDB(record)
                return {
                    ...walletRecord,
                    _private_key_: await makePrivateKey(walletRecord),
                }
            }),
        )
    ).sort(sortWallet)
    return wallets.length && typeof provider !== 'undefined' ? wallets.filter((x) => x.provider === provider) : wallets
    async function makePrivateKey(record: WalletRecord) {
        if (record.provider !== ProviderType.Maskbook) return '0x'
        const { privateKey } = record._private_key_
            ? await recoverWalletFromPrivateKey(record._private_key_)
            : await recoverWallet(record.mnemonic, record.passphrase)
        return `0x${buf2hex(privateKey)}`
    }
}

export async function updateExoticWalletFromSource(
    provider: ProviderType,
    updates: Map<string, Partial<WalletRecord>>,
): Promise<void> {
    const walletStore = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet').objectStore('Wallet')
    let modified = false
    for await (const cursor of walletStore) {
        const wallet = cursor.value
        if (wallet.provider === ProviderType.Maskbook) continue
        if (wallet.provider !== provider) continue
        {
            if (updates.has(formatChecksumAddress(wallet.address))) {
                await cursor.update(
                    WalletRecordIntoDB({
                        ...WalletRecordOutDB(cursor.value),
                        ...updates.get(wallet.address)!,
                        updatedAt: new Date(),
                    }),
                )
            } else await cursor.delete()
            modified = true
        }
    }
    for (const address of updates.keys()) {
        if (await walletStore.get(formatChecksumAddress(address))) continue
        await walletStore.put(
            WalletRecordIntoDB({
                address,
                createdAt: new Date(),
                updatedAt: new Date(),
                erc20_token_blacklist: new Set(),
                erc20_token_whitelist: new Set(),
                name: resolveProviderName(provider),
                passphrase: '',
                provider,
                mnemonic: [] as string[],
                ...updates.get(address)!,
            }),
        )
        modified = true
    }
    if (modified) PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export function createNewWallet(
    rec: Omit<
        WalletRecord,
        | 'id'
        | 'address'
        | 'mnemonic'
        | 'eth_balance'
        | 'provider'
        | '_data_source_'
        | 'erc20_token_balance'
        | 'erc20_token_whitelist'
        | 'erc20_token_blacklist'
        | 'createdAt'
        | 'updatedAt'
    >,
) {
    const mnemonic = bip39.generateMnemonic().split(' ')
    return importNewWallet({ mnemonic, ...rec })
}

export async function importNewWallet(
    rec: PartialRequired<
        Omit<WalletRecord, 'id' | 'eth_balance' | '_data_source_' | 'erc20_token_balance' | 'createdAt' | 'updatedAt'>,
        'name'
    >,
) {
    const { name, provider = ProviderType.Maskbook, mnemonic = [], passphrase = '' } = rec
    const address = await getWalletAddress()
    if (!address) throw new Error('cannot get the wallet address')
    if (rec.name === null) rec.name = address.slice(0, 6)
    const record: WalletRecord = {
        name,
        mnemonic,
        passphrase,
        provider,
        address,
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    if (rec._private_key_) record._private_key_ = rec._private_key_
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet', 'ERC20Token')
        t.objectStore('Wallet').add(WalletRecordIntoDB(record))
    }
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
    return address
    async function getWalletAddress() {
        if (rec.address) return rec.address
        if (rec._private_key_) {
            const recover = await recoverWalletFromPrivateKey(rec._private_key_)
            return recover.privateKeyValid ? recover.address : ''
        }
        return (await recoverWallet(mnemonic, passphrase)).address
    }
}

export async function importFirstWallet(rec: Parameters<typeof importNewWallet>[0]) {
    if (await isEmptyWallets()) return importNewWallet(rec)
    return
}

export async function renameWallet(address: string, name: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    wallet.name = name
    wallet.updatedAt = new Date()
    t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function removeWallet(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    if (!wallet) return
    t.objectStore('Wallet').delete(wallet.address)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function recoverWallet(mnemonic: string[], password: string) {
    const seed = await bip39.mnemonicToSeed(mnemonic.join(' '), password)
    const masterKey = HDKey.parseMasterSeed(seed)
    const extendedPrivateKey = masterKey.derive(path).extendedPrivateKey!
    const childKey = HDKey.parseExtendedKey(extendedPrivateKey)
    const wallet = childKey.derive('')
    const walletPublicKey = wallet.publicKey
    const walletPrivateKey = wallet.privateKey!
    return {
        address: EthereumAddress.from(walletPublicKey).address,
        privateKey: walletPrivateKey,
        privateKeyValid: true,
        privateKeyInHex: `0x${buf2hex(walletPrivateKey)}`,
        mnemonic,
    }
}

export async function recoverWalletFromPrivateKey(privateKey: string) {
    const ec = new EC('secp256k1')
    const privateKey_ = privateKey.replace(/^0x/, '') // strip 0x
    const key = ec.keyFromPrivate(privateKey_)
    return {
        address: EthereumAddress.from(key.getPublic(false, 'array') as any).address,
        privateKey: hex2buf(privateKey_),
        privateKeyValid: privateKeyVerify(privateKey_),
        privateKeyInHex: privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`,
        mnemonic: [],
    }
    function privateKeyVerify(key: string) {
        if (!/[0-9a-f]{64}/i.test(key)) return false
        const k = new BigNumber(key, 16)
        const n = new BigNumber('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)
        return !k.isZero() && k.isLessThan(n)
    }
}
