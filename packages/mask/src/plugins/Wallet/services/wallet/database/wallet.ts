import { omit } from 'lodash-unified'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import { WalletMessages } from '@masknet/plugin-wallet'
import { asyncIteratorToArray } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { PluginDB } from '../../../database/Plugin.db'
import { currentMaskWalletAccountSettings } from '../../../settings'
import type { WalletRecord } from '../type'

function WalletRecordOutDB(record: WalletRecord) {
    return {
        ...omit(record, 'type'),
        configurable: record.storedKeyInfo?.type ? record.storedKeyInfo.type !== api.StoredKeyType.Mnemonic : true,
        hasStoredKeyInfo: !!record.storedKeyInfo,
        hasDerivationPath: !!record.derivationPath,
    }
}

export async function getWallet(address = currentMaskWalletAccountSettings.value) {
    if (!address) return null
    if (!isValidAddress(address)) throw new Error('Not a valid address.')
    const wallet = (await PluginDB.get('wallet', formatEthereumAddress(address))) ?? null
    return wallet ? WalletRecordOutDB(wallet) : null
}

export async function getWalletRequired(address: string) {
    const wallet = await getWallet(address)
    if (!wallet) throw new Error('The wallet does not exist.')
    return wallet
}

export async function hasWallet(address: string) {
    return PluginDB.has('wallet', formatEthereumAddress(address))
}

export async function hasWalletRequired(address: string) {
    const has = await hasWallet(address)
    if (!has) throw new Error('The wallet does not exist.')
    return has
}

export async function hasStoredKeyInfo(storedKeyInfo?: api.IStoredKeyInfo) {
    const wallets = await getWallets()
    if (!storedKeyInfo) return false
    return wallets.filter((x) => x.storedKeyInfo?.hash).some((x) => x.storedKeyInfo?.hash === storedKeyInfo?.hash)
}

export async function hasStoredKeyInfoRequired(storedKeyInfo?: api.IStoredKeyInfo) {
    const has = await hasStoredKeyInfo(storedKeyInfo)
    if (!has) throw new Error('The stored key info does not exist.')
    return has
}

export async function getWallets() {
    const wallets = (await asyncIteratorToArray(PluginDB.iterate('wallet'))).map((x) => x.value)

    return wallets
        .sort((a, z) => {
            if (a.updatedAt > z.updatedAt) return -1
            if (a.updatedAt < z.updatedAt) return 1
            if (a.createdAt > z.createdAt) return -1
            if (a.createdAt < z.createdAt) return 1
            return 0
        })
        .map(WalletRecordOutDB)
}

export async function addWallet(
    address: string,
    name?: string,
    derivationPath?: string,
    storedKeyInfo?: api.IStoredKeyInfo,
) {
    const wallet = await getWallet(address)

    // overwrite mask wallet is not allowed
    if (wallet?.storedKeyInfo?.data) throw new Error('The wallet already exists.')

    const now = new Date()
    const address_ = formatEthereumAddress(address)
    await PluginDB.add({
        id: address_,
        type: 'wallet',
        address: address_,
        name: name?.trim() || `Account ${(await getWallets()).length + 1}`,
        derivationPath,
        storedKeyInfo,
        createdAt: now,
        updatedAt: now,
    })
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
    return address_
}

export async function updateWallet(
    address: string,
    updates: Partial<Omit<WalletRecord, 'id' | 'type' | 'address' | 'createdAt' | 'updatedAt' | 'storedKeyInfo'>>,
) {
    const wallet = await getWallet(address)
    const now = new Date()
    const address_ = formatEthereumAddress(address)
    await PluginDB.add({
        type: 'wallet',
        id: address_,
        address: address_,
        name: `Account ${(await getWallets()).length + 1}`,
        ...wallet,
        ...updates,
        createdAt: wallet?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function deleteWallet(address: string) {
    await PluginDB.remove('wallet', address)
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
