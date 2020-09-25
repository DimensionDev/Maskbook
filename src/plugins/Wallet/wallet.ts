import * as bip39 from 'bip39'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './database/Wallet.db'
import type {
    WalletRecord,
    ERC20TokenRecord,
    WalletRecordInDatabase,
    ERC20TokenRecordInDatabase,
} from './database/types'
import { PluginMessageCenter } from '../PluginMessages'
import { HDKey, EthereumAddress } from 'wallet.ts'
import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'
import { buf2hex, hex2buf, assert } from '../../utils/utils'
import { ProviderType, Token } from '../../web3/types'
import { resolveProviderName, parseChainName } from '../../web3/pipes'
import { formatChecksumAddress } from './formatter'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"

function sortWallet(a: WalletRecord, b: WalletRecord) {
    if (a._wallet_is_default) return -1
    if (b._wallet_is_default) return 1
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

export async function getWallets(provider?: ProviderType) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const records = await t.objectStore('Wallet').getAll()
    const wallets = (
        await Promise.all(
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

export async function getDefaultWallet(): Promise<WalletRecord | null> {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const wallets = await t.objectStore('Wallet').getAll()
    const wallet = wallets.find((wallet) => wallet._wallet_is_default)
    if (wallet) return WalletRecordOutDB(wallet)
    if (wallets.length) return WalletRecordOutDB(wallets[0])
    return null
}

export async function setDefaultWallet(address: string) {
    const walletAddressChecksummed = formatChecksumAddress(address)
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallets = await t.objectStore('Wallet').getAll()
    wallets.forEach((wallet) => {
        if (wallet._wallet_is_default) wallet._wallet_is_default = false
        if (wallet.address === walletAddressChecksummed) wallet._wallet_is_default = true
        if (wallet._wallet_is_default || wallet.address === walletAddressChecksummed) wallet.updatedAt = new Date()
        t.objectStore('Wallet').put(wallet)
    })
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function createNewWallet(
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
    await importNewWallet({ mnemonic, ...rec })
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

    /** Wallet recover from private key */
    if (rec._private_key_) record._private_key_ = rec._private_key_
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet', 'ERC20Token')
        t.objectStore('Wallet').add(WalletRecordIntoDB(record))
    }
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
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
    if (await isEmptyWallets()) await importNewWallet(rec)
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

export async function walletTrustERC20Token(address: string, token: Token) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    const erc20 = await getERC20TokenByAddress(t, formatChecksumAddress(token.address))
    if (!erc20) await t.objectStore('ERC20Token').add(ERC20TokenRecordIntoDB(token))
    const tokenAddressChecksummed = formatChecksumAddress(token.address)
    let updated = false
    if (!wallet.erc20_token_whitelist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_whitelist.add(tokenAddressChecksummed)
        updated = true
    }
    if (wallet.erc20_token_blacklist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_blacklist.delete(tokenAddressChecksummed)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function walletBlockERC20Token(address: string, token: PartialRequired<Token, 'address'>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    const erc20 = await getERC20TokenByAddress(t, formatChecksumAddress(token.address))
    if (!erc20) return
    let updated = false
    const tokenAddressChecksummed = formatChecksumAddress(token.address)
    if (wallet.erc20_token_whitelist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_whitelist.delete(tokenAddressChecksummed)
        updated = true
    }
    if (!wallet.erc20_token_blacklist.has(erc20.address)) {
        wallet.erc20_token_blacklist.add(erc20.address)
        updated = true
    }
    if (!updated) return
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

async function getERC20TokenByAddress(t: IDBPSafeTransaction<WalletDB, ['ERC20Token'], 'readonly'>, address: string) {
    const record = await t.objectStore('ERC20Token').get(formatChecksumAddress(address))
    return record ? ERC20TokenRecordOutDB(record) : null
}

async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(formatChecksumAddress(address))
    return record ? WalletRecordOutDB(record) : null
}

function ERC20TokenRecordIntoDB(x: ERC20TokenRecord) {
    x.address = formatChecksumAddress(x.address)
    return x as ERC20TokenRecordInDatabase
}

function ERC20TokenRecordOutDB(x: ERC20TokenRecordInDatabase) {
    const record = x as ERC20TokenRecord
    {
        // fix: network has been renamed to chainId
        const record_ = record as any
        if (!record.chainId) record.chainId = parseChainName(record_.network)
    }
    record.address = EthereumAddress.formatChecksumAddress(record.address)
    return record
}

function WalletRecordIntoDB(x: WalletRecord) {
    const record = x as WalletRecordInDatabase
    record.address = formatChecksumAddress(x.address)
    return record
}

function WalletRecordOutDB(x: WalletRecordInDatabase) {
    const record = x as WalletRecord
    record.address = EthereumAddress.formatChecksumAddress(record.address)
    record.erc20_token_whitelist = x.erc20_token_whitelist || new Set()
    record.erc20_token_blacklist = x.erc20_token_blacklist || new Set()
    return record
}
