import * as bip39 from 'bip39'
import { omit, uniqBy } from 'lodash-es'
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
import { walletAPI, erc20API, balanceCheckerAPI } from './api'
import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'
import { buf2hex, hex2buf, assert } from '../../utils/utils'
import { ProviderType, EthereumTokenType } from '../../web3/types'
import { resolveProviderName, parseChainName } from '../../web3/pipes'
import { ChainId, Token } from '../../web3/types'
import { CONSTANTS } from '../../web3/constants'
import { getConstant } from '../../web3/helpers'

const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS')

//#region predefined tokens
import mainnet from '../../web3/erc20/mainnet.json'
import rinkeby from '../../web3/erc20/rinkeby.json'
import { checksumAddress } from './database/helpers'

const sort = (x: Token, y: Token): 1 | -1 => ([x.name, y.name].sort()[0] === x.name ? -1 : 1)
mainnet.built_in_tokens.map((x) => ({ type: EthereumTokenType.ERC20, chainId: ChainId.Mainnet, ...x })).sort(sort)
mainnet.predefined_tokens.map((x) => ({ type: EthereumTokenType.ERC20, chainId: ChainId.Mainnet, ...x })).sort(sort)
rinkeby.built_in_tokens.map((x) => ({ type: EthereumTokenType.ERC20, chainId: ChainId.Rinkeby, ...x })).sort(sort)
rinkeby.predefined_tokens.map((x) => ({ type: EthereumTokenType.ERC20, chainId: ChainId.Rinkeby, ...x })).sort(sort)
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

export async function getToken(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token')
    return t.objectStore('ERC20Token').get(checksumAddress(address))
}
export async function getToken(addr: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token')
    return t.objectStore('ERC20Token').get(addr)
}

export async function getTokens() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('ERC20Token')
    const tokens = await t.objectStore('ERC20Token').getAll()
    return uniqBy(tokens, (token) => token.address.toUpperCase()).map(ERC20TokenRecordOutDB)
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

        modified = true
        if (updates.has(checksumAddress(wallet.address))) {
            const orig = WalletRecordOutDB(cursor.value) as WalletRecord
            await cursor.update(WalletRecordIntoDB({ ...orig, ...updates.get(wallet.address)!, updatedAt: new Date() }))
        } else await cursor.delete()
    }
    for (const address of updates.keys()) {
        if (await walletStore.get(checksumAddress(address))) continue
        modified = true
        await walletStore.put(
            WalletRecordIntoDB({
                address,
                createdAt: new Date(),
                updatedAt: new Date(),
                erc20_token_balance: new Map(),
                erc20_token_blacklist: new Set(),
                erc20_token_whitelist: new Set(),
                eth_balance: new BigNumber(0),
                name: resolveProviderName(provider),
                provider,
                ...updates.get(address)!,
            } as WalletRecord),
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

export async function getDefaultWallet(): Promise<WalletRecord | null> {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const wallets = await t.objectStore('Wallet').getAll()
    const wallet = wallets.find((wallet) => wallet._wallet_is_default)
    if (wallet) return WalletRecordOutDB(wallet)
    if (wallets.length) return WalletRecordOutDB(wallets[0])
    return null
}

export async function setDefaultWallet(address: string) {
    const walletAddressChecksummed = checksumAddress(address)
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
    if (!address) throw new Error('cannot get the address of wallet')
    if (rec.name === null) rec.name = address.slice(0, 6)
    const record: WalletRecord = {
        name,
        mnemonic,
        passphrase,
        provider,
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
                chainId: ChainId.Mainnet,
                is_user_defined: false,
            }),
        )
        rinkeby.built_in_tokens.forEach((token) =>
            t.objectStore('ERC20Token').put({
                ...token,
                chainId: ChainId.Rinkeby,
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
    const wallet = await getWalletByAddress(t, checksumAddress(address))
    wallet.name = name
    wallet.updatedAt = wallet.updatedAt ?? new Date()
    t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function removeWallet(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, checksumAddress(address))
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

export async function walletAddERC20Token(
    walletAddress: string,
    chainId: ChainId,
    token: Token,
    user_defined: boolean,
) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, checksumAddress(walletAddress))
    const erc20 = await getERC20TokenByAddress(t, checksumAddress(token.address))
    if (!erc20) {
        const rec: ERC20TokenRecord = {
            address: token.address,
            decimals: token.decimals,
            is_user_defined: user_defined,
            name: token.name,
            chainId,
            symbol: token.symbol,
        }
        await t.objectStore('ERC20Token').add(ERC20TokenRecordIntoDB(rec))
    }
    const tokenAddressChecksummed = checksumAddress(token.address)
    if (!wallet.erc20_token_balance.has(tokenAddressChecksummed)) {
        wallet.erc20_token_balance.set(tokenAddressChecksummed, new BigNumber(0))
        wallet.updatedAt = new Date()
    }
    if (wallet.erc20_token_blacklist.has(tokenAddressChecksummed)) {
        wallet.erc20_token_blacklist.delete(tokenAddressChecksummed)
        wallet.updatedAt = new Date()
    }
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function walletBlockERC20Token(walletAddress: string, tokenAddress: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, checksumAddress(walletAddress))
    const erc20 = await getERC20TokenByAddress(t, checksumAddress(tokenAddress))
    if (!erc20) return
    if (!wallet.erc20_token_blacklist.has(erc20.address)) {
        wallet.erc20_token_blacklist.add(erc20.address)
        wallet.updatedAt = new Date()
    }
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export function updateWalletBalances(accounts?: string[]) {
    return getWalletProvider().updateBalances(accounts)
}

export { switchToProvider } from './web3'
export interface BalanceMetadata {
    [key: string]: (Token & { balance: BigNumber })[]
}

export async function onWalletBalancesUpdated(data: BalanceMetadata) {
    let modified = false
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const unaddedTokens: {
        token: Token
        chainId: ChainId
    }[] = []
    unaddedTokens.forEach(({ token }) => (token.address = checksumAddress(token.address)))
    for (const [walletAddress, tokens] of Object.entries(data)) {
        const wallet = await getWalletByAddress(t, walletAddress)
        const lastModifiedAt = wallet.updatedAt
        for (const { chainId, balance, ...token } of tokens) {
            if (token.address === ETH_ADDRESS && !wallet.eth_balance.isEqualTo(balance)) {
                wallet.eth_balance = balance
                wallet.updatedAt = new Date()
            }
            if (token.address !== ETH_ADDRESS) {
                if (!wallet.erc20_token_balance.has(token.address) && balance.isGreaterThan(0)) {
                    unaddedTokens.push({
                        token: {
                            chainId,
                            ...token,
                        },
                        chainId,
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
        if (lastModifiedAt !== wallet.updatedAt) {
            t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
            modified = true
        }
    }
    await Promise.all(
        unaddedTokens.map(async ({ token, chainId }) => {
            const erc20 = await getERC20TokenByAddress(t, token.address)
            if (erc20) return
            modified = true
            await t.objectStore('ERC20Token').add(
                ERC20TokenRecordIntoDB({
                    ...token,
                    chainId,
                    is_user_defined: false,
                }),
            )
        }),
    )
    if (modified) PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

async function getERC20TokenByAddress(t: IDBPSafeTransaction<WalletDB, ['ERC20Token'], 'readonly'>, address: string) {
    const record = await t.objectStore('ERC20Token').get(checksumAddress(address))
    return record ? ERC20TokenRecordOutDB(record) : null
}

async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(checksumAddress(address))
    assert(record)
    return WalletRecordOutDB(record)
}

function ERC20TokenRecordIntoDB(x: ERC20TokenRecord) {
    x.address = checksumAddress(x.address)
    return x as ERC20TokenRecordInDatabase
}

function ERC20TokenRecordOutDB(x: ERC20TokenRecordInDatabase) {
    const record = x as ERC20TokenRecord
    {
        // fix: network was renamed to chainId
        const record_ = record as any
        if (!record.chainId) record.chainId = parseChainName(record_.network)
    }
    record.address = EthereumAddress.checksumAddress(record.address)
    return record
}

function WalletRecordIntoDB(x: WalletRecord) {
    const record = (x as any) as WalletRecordInDatabase
    record.address = checksumAddress(x.address)
    record.eth_balance = x.eth_balance.toString()
    for (const [name, value] of x.erc20_token_balance.entries()) {
        record.erc20_token_balance.set(name, value.toString())
    }
    return record
}

function WalletRecordOutDB(x: WalletRecordInDatabase) {
    const record = omit(x, ['eth_balance', 'erc20_token_balance']) as WalletRecord
    record.eth_balance = new BigNumber(String(x.eth_balance ?? 0))
    record.erc20_token_balance = new Map()
    for (const [name, value] of x.erc20_token_balance.entries()) {
        record.erc20_token_balance.set(name, new BigNumber(String(value ?? 0)))
    }
    record.address = EthereumAddress.checksumAddress(record.address)
    record.erc20_token_whitelist = x.erc20_token_whitelist || new Set()
    record.erc20_token_blacklist = x.erc20_token_blacklist || new Set()
    return record
}
