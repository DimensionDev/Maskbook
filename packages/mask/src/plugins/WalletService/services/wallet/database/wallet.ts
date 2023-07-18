import { omit } from 'lodash-es'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import { CrossIsolationMessages, type SourceType, asyncIteratorToArray } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { PluginDB } from '../../../database/Plugin.db.js'
import type { WalletRecord } from '../type.js'

function WalletRecordOutDB(record: WalletRecord) {
    return {
        ...omit(record, 'type'),
        configurable: record.storedKeyInfo?.type ? record.storedKeyInfo.type !== api.StoredKeyType.Mnemonic : true,
        hasStoredKeyInfo: !!record.storedKeyInfo,
        hasDerivationPath: !!record.derivationPath,
    }
}

export async function getWallet(address: string) {
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

async function getWalletRecords() {
    return (await asyncIteratorToArray(PluginDB.iterate('wallet'))).map((x) => x.value)
}

export async function getWallets() {
    const wallets = await getWalletRecords()

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
    source: SourceType,
    updates?: {
        name?: string
        derivationPath?: string
        storedKeyInfo?: api.IStoredKeyInfo
    },
) {
    const wallet = await getWallet(address)
    if (wallet?.storedKeyInfo?.data) throw new Error('The wallet already exists.')

    const now = new Date()
    const address_ = formatEthereumAddress(address)
    await PluginDB.add({
        id: address_,
        type: 'wallet',
        source,
        address: address_,
        derivationPath: updates?.derivationPath,
        storedKeyInfo: updates?.storedKeyInfo,
        name: updates?.name?.trim() ?? `Account ${(await getWallets()).length + 1}`,
        createdAt: now,
        updatedAt: now,
    })
    CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
    return address_
}

export async function updateWallet(
    address: string,
    updates: Partial<{
        name: string
        derivationPath?: string
        latestDerivationPath?: string
    }>,
) {
    const wallet = await getWallet(address)
    if (!wallet) throw new Error('The wallet does not exist')

    await PluginDB.add({
        type: 'wallet',
        ...wallet,
        name: updates.name ?? wallet.name,
        derivationPath: updates?.derivationPath ?? wallet.derivationPath,
        latestDerivationPath: updates?.latestDerivationPath ?? wallet.latestDerivationPath,
        updatedAt: new Date(),
    })
    CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function deleteWallet(address: string) {
    await PluginDB.remove('wallet', address)
    CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function resetAllWallets() {
    for await (const x of PluginDB.iterate_mutate('wallet')) {
        await x.delete()
    }
    CrossIsolationMessages.events.walletsUpdated.sendToAll(undefined)
}
