import { createTransaction, IDBPSafeTransaction } from '../../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from '../../database/Plugins/Wallet/Wallet.db'
import { WalletRecord, ERC20TokenRecord, EthereumNetwork } from '../../database/Plugins/Wallet/types'
import { assert } from './red-packet-fsm'
import { PluginMessageCenter } from '../PluginMessages'
import { HDKey, EthereumAddress } from 'wallet.ts'
import * as bip39 from 'bip39'
import { walletAPI } from './real'
import { ERC20TokenPredefinedData } from './erc20'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"
export function getWalletProvider() {
    return walletAPI
}
export async function getWallets(): Promise<[WalletRecord[], ERC20TokenRecord[]]> {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet', 'ERC20Token')
    return [await t.objectStore('Wallet').getAll(), await t.objectStore('ERC20Token').getAll()]
}

export async function createNewWallet(
    rec: Omit<WalletRecord, 'id' | 'address' | 'mnemonic' | 'eth_balance' | '_data_source_' | 'erc20_token_balance'>,
) {
    const mnemonic = bip39.generateMnemonic().split(' ')
    importNewWallet({ mnemonic, ...rec })
}

export async function importNewWallet(
    rec: Omit<WalletRecord, 'id' | 'address' | 'eth_balance' | '_data_source_' | 'erc20_token_balance'>,
) {
    const { address, privateKey } = await recoverWallet(rec.mnemonic, rec.passphrase)
    getWalletProvider().addWalletPrivateKey(address, buf2hex(privateKey))
    const record: WalletRecord = {
        ...rec,
        address,
        erc20_token_balance: new Map(),
        _data_source_: getWalletProvider().dataSource,
    }
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
        t.objectStore('Wallet').add(record)
    }
    getWalletProvider().watchWalletBalance(record.address)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function onWalletBalanceUpdated(address: string, newBalance: bigint) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)
    if (wallet.eth_balance === newBalance) return
    wallet.eth_balance = newBalance
    t.objectStore('Wallet').put(wallet)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function renameWallet(address: string, name: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)

    wallet.name = name
    t.objectStore('Wallet').put(wallet)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function removeWallet(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)

    getWalletProvider().removeWalletPrivateKey(
        wallet.address,
        buf2hex((await recoverWallet(wallet.mnemonic, wallet.passphrase)).privateKey),
    )
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
        t.objectStore('Wallet').delete(wallet.address)
    }
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

export async function walletSyncInit() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const wallets = t.objectStore('Wallet').getAll()
    ;(await wallets).forEach(async x => {
        const p = getWalletProvider()

        p.addWalletPrivateKey(x.address, buf2hex((await recoverWallet(x.mnemonic, x.passphrase)).privateKey))
        p.watchWalletBalance(x.address)
        for (const tokenAddr of x.erc20_token_balance.keys()) {
            p.watchERC20TokenBalance(x.address, tokenAddr)
        }
    })
}

async function recoverWallet(mnemonic: string[], password: string) {
    const seed = await bip39.mnemonicToSeed(mnemonic.join(' '), password)
    const masterKey = HDKey.parseMasterSeed(seed)
    const extendedPrivateKey = masterKey.derive(path).extendedPrivateKey!
    const childKey = HDKey.parseExtendedKey(extendedPrivateKey)

    const wallet = childKey.derive('')
    const walletPublicKey = wallet.publicKey
    const walletPrivateKey = wallet.privateKey!
    const address = EthereumAddress.from(walletPublicKey).address
    return { address, privateKey: walletPrivateKey, mnemonic }
}

export async function walletAddERC20Token(
    walletAddress: string,
    network: EthereumNetwork,
    token: ERC20TokenPredefinedData[0],
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
            network: network,
            symbol: token.symbol,
        }
        await t.objectStore('ERC20Token').add(rec)
    }
    wallet.erc20_token_balance.set(token.address, undefined)
    await t.objectStore('Wallet').put(wallet)
    getWalletProvider().watchERC20TokenBalance(wallet.address, token.address)
}

export async function onWalletERC20TokenBalanceUpdated(address: string, tokenAddress: string, newBalance: bigint) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, address)
    if (wallet.erc20_token_balance.get(tokenAddress) === newBalance) return
    wallet.erc20_token_balance.set(tokenAddress, newBalance)
    t.objectStore('Wallet').put(wallet)
    PluginMessageCenter.emit('maskbook.wallets.update', undefined)
}

setTimeout(() => {
    walletSyncInit()
}, 1000)

async function getWalletByAddress(t: IDBPSafeTransaction<WalletDB, ['Wallet'], 'readonly'>, address: string) {
    const rec = await t.objectStore('Wallet').get(address)
    assert(rec)
    return rec
}
function buf2hex(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
}
