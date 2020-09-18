import { omit, uniqBy } from 'lodash-es'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './database/Wallet.db'
import {
    WalletRecord,
    ERC20TokenRecord,
    EthereumNetwork,
    WalletRecordInDatabase,
    ManagedWalletRecord,
    ExoticWalletRecord,
} from './database/types'
import { PluginMessageCenter } from '../PluginMessages'
import { HDKey, EthereumAddress } from 'wallet.ts'
import * as bip39 from 'bip39'
import { walletAPI, erc20API, balanceCheckerAPI } from './api'
import { ERC20Token, ETH_ADDRESS } from './token'
import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'
import { buf2hex, hex2buf, assert } from '../../utils/utils'

//#region predefined tokens
import mainnet from './erc20/mainnet.json'
import rinkeby from './erc20/rinkeby.json'

const sort = (x: ERC20Token, y: ERC20Token): 1 | -1 => ([x.name, y.name].sort()[0] === x.name ? -1 : 1)
mainnet.built_in_tokens.sort(sort)
mainnet.predefined_tokens.sort(sort)
rinkeby.built_in_tokens.sort(sort)
rinkeby.predefined_tokens.sort(sort)
//#endregion

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"
export function getWalletProvider() {
    return {
        ...walletAPI,
        ...erc20API,
        ...balanceCheckerAPI,
    }
}

export async function isEmptyWallets() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const count = await t.objectStore('Wallet').count()
    return count === 0
}

export async function getWallets() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const recs = await t.objectStore('Wallet').getAll()
    return recs.map(WalletRecordOutDB).sort(sortWallet)
}
export async function getTokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token')
    const tokens = await t.objectStore('ERC20Token').getAll()
    return uniqBy(tokens, (token) => token.address.toUpperCase())
}

export async function getManagedWallets(): Promise<{
    wallets: (ManagedWalletRecord & { privateKey: string })[]
    tokens: ERC20TokenRecord[]
}> {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet', 'ERC20Token')
    const wallets = await t.objectStore('Wallet').getAll()
    const tokens = await t.objectStore('ERC20Token').getAll()
    async function makeWallets() {
        const records = wallets
            .map(WalletRecordOutDB)
            .filter((x): x is ManagedWalletRecord => x.type !== 'exotic')
            .map(async (record) => ({ ...record, privateKey: await makePrivateKey(record) }))
        return (await Promise.all(records)).sort(sortWallet)
        async function makePrivateKey(record: ManagedWalletRecord) {
            const { privateKey } = record._private_key_
                ? await recoverWalletFromPrivateKey(record._private_key_)
                : await recoverWallet(record.mnemonic, record.passphrase)
            return `0x${buf2hex(privateKey)}`
        }
    }
    function makeTokens() {
        return uniqBy(tokens, (token) => token.address.toUpperCase())
    }
    return { wallets: await makeWallets(), tokens: makeTokens() }
}

export async function updateExoticWalletsFromSource(
    source: ExoticWalletRecord['provider'],
    updates: Map<string, Partial<ExoticWalletRecord>>,
): Promise<void> {
    const walletStore = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet').objectStore('Wallet')
    let modified = false
    for await (const cursor of walletStore) {
        const wallet = cursor.value
        if (wallet.type !== 'exotic') continue
        if ((wallet as any).provider !== source) continue

        modified = true
        const addr = wallet.address
        if (updates.has(addr)) {
            const orig = WalletRecordOutDB(cursor.value) as ExoticWalletRecord
            await cursor.update(WalletRecordIntoDB({ ...orig, ...updates.get(addr)!, updatedAt: new Date() }))
        } else await cursor.delete()
    }
    for (const address of updates.keys()) {
        if (await walletStore.get(address)) continue
        modified = true
        await walletStore.add(
            WalletRecordIntoDB({
                address,
                createdAt: new Date(),
                updatedAt: new Date(),
                erc20_token_balance: new Map(),
                erc20_token_blacklist: new Set(),
                erc20_token_whitelist: new Set(),
                eth_balance: new BigNumber(0),
                name: source,
                provider: source,
                type: 'exotic',
                ...updates.get(address)!,
            } as ExoticWalletRecord),
        )
    }
    if (modified) {
        PluginMessageCenter.emit('maskbook.wallets.update', void 0)
        PluginMessageCenter.emit('maskbook.wallets.reset', void 0)
    }
}
function sortWallet(a: WalletRecord, b: WalletRecord) {
    if (a._wallet_is_default) return -1
    if (b._wallet_is_default) return 1
    if (a.updatedAt > b.updatedAt) return -1
    if (a.updatedAt < b.updatedAt) return 1
    if (a.createdAt > b.createdAt) return -1
    if (a.createdAt < b.createdAt) return 1
    return 0
}

export async function getDefaultWallet(): Promise<WalletRecord> {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const wallets = await t.objectStore('Wallet').getAll()
    const wallet = wallets.find((wallet) => wallet._wallet_is_default) || wallets.length === 0 ? null : wallets[0]
    if (!wallet) throw new Error('no wallet')
    return WalletRecordOutDB(wallet)
}

export async function setDefaultWallet(address: WalletRecord['address']) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallets = await t.objectStore('Wallet').getAll()
    wallets.forEach((wallet) => {
        if (wallet._wallet_is_default) wallet._wallet_is_default = false
        if (wallet.address === address) wallet._wallet_is_default = true
        if (wallet._wallet_is_default || wallet.address === address) wallet.updatedAt = new Date()
        t.objectStore('Wallet').put(wallet)
    })
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function createNewWallet(
    rec: Omit<
        ManagedWalletRecord,
        | 'id'
        | 'address'
        | 'mnemonic'
        | 'eth_balance'
        | '_data_source_'
        | 'erc20_token_balance'
        | 'erc20_token_whitelist'
        | 'erc20_token_blacklist'
        | 'createdAt'
        | 'updatedAt'
        | 'type'
    >,
) {
    const mnemonic = bip39.generateMnemonic().split(' ')
    await importNewWallet({ mnemonic, ...rec })
}

export async function importNewWallet(
    rec: PartialRequired<
        Omit<
            ManagedWalletRecord,
            'id' | 'eth_balance' | '_data_source_' | 'erc20_token_balance' | 'createdAt' | 'updatedAt'
        >,
        'name'
    >,
) {
    const { name, mnemonic = [], passphrase = '' } = rec
    const address = await getWalletAddress()
    if (!address) throw new Error('cannot get the address of wallet')
    if (rec.name === null) rec.name = address.slice(0, 6)
    const record: ManagedWalletRecord = {
        type: 'managed',
        name,
        mnemonic,
        passphrase,
        address,
        eth_balance: new BigNumber(0),
        erc20_token_balance: new Map([
            ...mainnet.built_in_tokens.map(({ address }) => [address, new BigNumber(0)] as const),
            ...rinkeby.built_in_tokens.map(({ address }) => [address, new BigNumber(0)] as const),
        ]),
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    /** Wallet recover from private key */
    if (rec._private_key_) record._private_key_ = rec._private_key_
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet', 'ERC20Token')
        t.objectStore('Wallet')
            .add(WalletRecordIntoDB(record))
            .then(() => PluginMessageCenter.emit('maskbook.wallets.reset', undefined))
        mainnet.built_in_tokens.forEach((token) =>
            t.objectStore('ERC20Token').put({
                ...token,
                network: EthereumNetwork.Mainnet,
                is_user_defined: false,
            }),
        )
        rinkeby.built_in_tokens.forEach((token) =>
            t.objectStore('ERC20Token').put({
                ...token,
                network: EthereumNetwork.Rinkeby,
                is_user_defined: false,
            }),
        )
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
    const wallet = await getWalletByAddress(t, address)
    wallet.name = name
    wallet.updatedAt = wallet.updatedAt ?? new Date()
    t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function removeWallet(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
        t.objectStore('Wallet')
            .delete(wallet.address)
            .then(() => PluginMessageCenter.emit('maskbook.wallets.reset', undefined))
    }
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
    const address = EthereumAddress.from(walletPublicKey).address
    return {
        address,
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
    const address = EthereumAddress.from(key.getPublic(false, 'array') as any).address
    return {
        address,
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

export async function walletAddERC20Token(
    walletAddress: string,
    network: EthereumNetwork,
    token: ERC20Token,
    user_defined: boolean,
) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, walletAddress)
    const erc20 = await t.objectStore('ERC20Token').get(token.address)
    if (!erc20) {
        const rec: ERC20TokenRecord = {
            address: token.address,
            decimals: token.decimals,
            is_user_defined: user_defined,
            name: token.name,
            network,
            symbol: token.symbol,
        }
        await t.objectStore('ERC20Token').add(rec)
    }
    if (!wallet.erc20_token_balance.has(token.address)) {
        wallet.erc20_token_balance.set(token.address, new BigNumber(0))
        wallet.updatedAt = new Date()
    }
    if (wallet.erc20_token_blacklist.has(token.address)) {
        wallet.erc20_token_blacklist.delete(token.address)
        wallet.updatedAt = new Date()
    }
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function walletBlockERC20Token(walletAddress: string, tokenAddress: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, walletAddress)
    const erc20 = await t.objectStore('ERC20Token').get(tokenAddress)
    if (!erc20) return
    if (!wallet.erc20_token_blacklist.has(tokenAddress)) {
        wallet.erc20_token_blacklist.add(tokenAddress)
        wallet.updatedAt = new Date()
    }
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export function updateWalletBalances(accounts?: string[]) {
    return getWalletProvider().updateBalances(accounts)
}

export function watchWalletBalances(address: string) {
    return getWalletProvider().watchAccounts([address])
}

export function unwatchWalletBalances(address: string) {
    return getWalletProvider().unwatchAccounts([address])
}
export { switchToProvider } from './web3'
export interface BalanceMetadata {
    [key: string]: (ERC20Token & { balance: BigNumber; network: EthereumNetwork })[]
}

export async function onWalletBalancesUpdated(data: BalanceMetadata) {
    let modified = false
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const unaddedTokens: {
        network: EthereumNetwork
        token: ERC20Token
    }[] = []
    for (const [walletAddress, tokens] of Object.entries(data)) {
        const wallet = await getWalletByAddress(t, walletAddress)
        const lastModifiedt = wallet.updatedAt
        for (const { network, balance, ...token } of tokens) {
            if (token.address === ETH_ADDRESS && !wallet.eth_balance.isEqualTo(balance)) {
                wallet.eth_balance = balance
                wallet.updatedAt = new Date()
            }
            if (token.address !== ETH_ADDRESS) {
                if (!wallet.erc20_token_balance.has(token.address) && balance.isGreaterThan(0)) {
                    unaddedTokens.push({
                        token,
                        network,
                    })
                    wallet.erc20_token_balance.set(token.address, balance)
                    wallet.updatedAt = new Date()
                } else if (
                    wallet.erc20_token_balance.has(token.address) &&
                    !wallet.erc20_token_balance.get(token.address)?.isEqualTo(balance)
                ) {
                    wallet.erc20_token_balance.set(token.address, balance)
                    wallet.updatedAt = new Date()
                }
            }
        }
        if (lastModifiedt !== wallet.updatedAt) {
            t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
            modified = true
        }
    }
    await Promise.all(
        unaddedTokens.map(async ({ token, network }) => {
            const erc20 = await t.objectStore('ERC20Token').get(token.address)
            if (erc20) return
            modified = true
            await t.objectStore('ERC20Token').add({
                ...token,
                network,
                is_user_defined: false,
            })
        }),
    )
    if (modified) PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(address)
    assert(record)
    return WalletRecordOutDB(record)
}

function WalletRecordOutDB(x: WalletRecordInDatabase) {
    const record = omit(x, ['eth_balance', 'erc20_token_balance']) as WalletRecord
    record.eth_balance = new BigNumber(String(x.eth_balance ?? 0))
    record.erc20_token_balance = new Map()
    for (const [name, value] of x.erc20_token_balance.entries()) {
        record.erc20_token_balance.set(name, new BigNumber(String(value ?? 0)))
    }
    record.erc20_token_whitelist = x.erc20_token_whitelist || new Set()
    record.erc20_token_blacklist = x.erc20_token_blacklist || new Set()
    record.type = record.type || 'managed'
    return record
}
function WalletRecordIntoDB(x: WalletRecord) {
    const record = (x as any) as WalletRecordInDatabase
    record.eth_balance = x.eth_balance.toString()
    for (const [name, value] of x.erc20_token_balance.entries()) {
        record.erc20_token_balance.set(name, value.toString())
    }
    return record
}
