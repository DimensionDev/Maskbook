import { omit, noop } from 'lodash-es'
import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './database/Wallet.db'
import { WalletRecord, ERC20TokenRecord, EthereumNetwork, WalletRecordInDatabase } from './database/types'
import { assert } from './red-packet-fsm'
import { PluginMessageCenter } from '../PluginMessages'
import { HDKey, EthereumAddress } from 'wallet.ts'
import * as bip39 from 'bip39'
import { walletAPI } from './real'
import type { ERC20TokenPredefinedData } from './erc20'
import { memoizePromise } from '../../utils/memoize'
import { currentEthereumNetworkSettings } from './network'
import { BigNumber } from 'bignumber.js'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"
export function getWalletProvider() {
    return walletAPI
}
const memoGetWalletBalance = memoizePromise(
    async (addr: string) => {
        const x = await getWalletProvider().queryBalance(addr)
        return onWalletBalanceUpdated(addr, x)
    },
    (x) => x,
)
const memoQueryERC20Token = memoizePromise(
    (addr: string, erc20Addr: string) =>
        getWalletProvider()
            .queryERC20TokenBalance(addr, erc20Addr)
            .then((balance) => onWalletERC20TokenBalanceUpdated(addr, erc20Addr, balance))
            .catch(noop),
    (x, y) => `${x},${y}`,
)
const clearCache = () => {
    memoGetWalletBalance?.cache?.clear?.()
    memoQueryERC20Token?.cache?.clear?.()
}
PluginMessageCenter.on('maskbook.red_packets.update', () => {
    clearCache()
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
})
/** Cache most valid for 15 seconds */
setInterval(clearCache, 1000 * 15)
currentEthereumNetworkSettings.addListener(() => {
    clearCache()
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
})
export async function getWallets(): Promise<[(WalletRecord & { privateKey: string })[], ERC20TokenRecord[]]> {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet', 'ERC20Token')
    const wallets = await t.objectStore('Wallet').getAll()
    const tokens = await t.objectStore('ERC20Token').getAll()

    // Schedule an update
    for (const x of wallets) {
        memoGetWalletBalance(x.address)
        for (const t of x.erc20_token_balance.keys()) memoQueryERC20Token(x.address, t)
    }
    async function makeWallets() {
        const records = wallets
            .map(WalletRecordOutDB)
            .map(async (record) => ({ ...record, privateKey: await makePrivateKey(record) }))
        const recordWithKeys = await Promise.all(records)
        return recordWithKeys.sort((a, b) => {
            if (a._wallet_is_default) return -1
            if (b._wallet_is_default) return 1
            if (a.updatedAt > b.updatedAt) return -1
            if (a.updatedAt < b.updatedAt) return 1
            if (a.createdAt > b.createdAt) return -1
            if (a.createdAt < b.createdAt) return 1
            return 0
        })
        async function makePrivateKey(record: WalletRecord) {
            const recover = await recoverWallet(record.mnemonic, record.passphrase)
            return recover.privateKeyInHex
        }
    }
    return [await makeWallets(), tokens]
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
        WalletRecord,
        | 'id'
        | 'address'
        | 'mnemonic'
        | 'eth_balance'
        | '_data_source_'
        | 'erc20_token_balance'
        | 'createdAt'
        | 'updatedAt'
    >,
) {
    const mnemonic = bip39.generateMnemonic().split(' ')
    await importNewWallet({ mnemonic, ...rec })
}

export async function importNewWallet(
    rec: Omit<
        WalletRecord,
        'id' | 'address' | 'eth_balance' | '_data_source_' | 'erc20_token_balance' | 'createdAt' | 'updatedAt'
    >,
) {
    const { address } = await recoverWallet(rec.mnemonic, rec.passphrase)
    const bal = await getWalletProvider()
        .queryBalance(address)
        .catch((x) => undefined)
    const record: WalletRecord = {
        ...rec,
        address,
        eth_balance: bal,
        /** Builtin Dai Stablecoin */
        erc20_token_balance: new Map([['0x6B175474E89094C44Da98b954EedeAC495271d0F', undefined]]),
        _data_source_: getWalletProvider().dataSource,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet', 'ERC20Token')
        t.objectStore('Wallet')
            .add(WalletRecordIntoDB(record))
            .then(() => PluginMessageCenter.emit('maskbook.wallets.reset', undefined))
        t.objectStore('ERC20Token').put({
            decimals: 18,
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            network: EthereumNetwork.Mainnet,
            is_user_defined: false,
        })
    }
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function onWalletBalanceUpdated(address: string, newBalance: BigNumber) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)
    if (wallet.eth_balance?.isEqualTo(newBalance)) return // wallet.eth_balance === newBalance
    wallet.eth_balance = newBalance
    wallet.updatedAt = new Date()
    t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
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
    return { address, privateKey: walletPrivateKey, privateKeyInHex: `0x${buf2hex(walletPrivateKey)}`, mnemonic }
    function buf2hex(buffer: ArrayBuffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('')
    }
}

export async function walletAddERC20Token(
    walletAddress: string,
    network: EthereumNetwork,
    token: ERC20TokenPredefinedData[0],
    user_defined: boolean,
) {
    const bal = await getWalletProvider()
        .queryERC20TokenBalance(walletAddress, token.address)
        .catch(() => undefined)

    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('ERC20Token', 'Wallet')
    const wallet = await getWalletByAddress(t, walletAddress)
    const erc20 = await t.objectStore('ERC20Token').get(token.address)
    if (!erc20) {
        const rec: ERC20TokenRecord = {
            address: token.address,
            decimals: token.decimals,
            is_user_defined: user_defined,
            name: token.name,
            network: network,
            symbol: token.symbol,
        }
        await t.objectStore('ERC20Token').add(rec)
    }
    wallet.erc20_token_balance.set(token.address, bal)
    wallet.updatedAt = new Date()
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function onWalletERC20TokenBalanceUpdated(address: string, tokenAddress: string, newBalance: BigNumber) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)
    if (wallet.erc20_token_balance.get(tokenAddress)?.isEqualTo(newBalance)) return // wallet.erc20_token_balance.get(tokenAddress) === newBalance
    wallet.erc20_token_balance.set(tokenAddress, newBalance)
    wallet.updatedAt = new Date()
    t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const record = await t.objectStore('Wallet').get(address)
    assert(record)
    return WalletRecordOutDB(record)
}

function WalletRecordOutDB(x: WalletRecordInDatabase): WalletRecord {
    const record = omit(x, ['eth_balance', 'erc20_token_balance']) as WalletRecord
    if (x.eth_balance) {
        record.eth_balance = new BigNumber(String(x.eth_balance))
    }
    record.erc20_token_balance = new Map()
    for (const [name, value] of x.erc20_token_balance.entries()) {
        let balance
        if (value) {
            balance = new BigNumber(String(value))
        }
        record.erc20_token_balance.set(name, balance)
    }
    return record
}
function WalletRecordIntoDB(x: WalletRecord): WalletRecordInDatabase {
    const record = omit(x, ['eth_balance', 'erc20_token_balance']) as WalletRecordInDatabase
    if (x.eth_balance) {
        record.eth_balance = x.eth_balance.toString()
    }
    record.erc20_token_balance = new Map()
    for (const [name, value] of x.erc20_token_balance.entries()) {
        record.erc20_token_balance.set(name, value?.toString())
    }
    return record
}
