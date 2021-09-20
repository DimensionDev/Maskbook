import { EthereumAddress } from 'wallet.ts'
import { asyncIteratorToArray } from '../../../../utils'
import { PluginDB } from '../../database/Plugin.db'
import type { Wallet } from '../wollet'

export async function getWallet(address: string) {
    if (!address || EthereumAddress.isValid(address)) throw new Error('Not a valid address.')
    return PluginDB.get('wallet', address)
}

export async function getAllWallet() {
    const wallets = await asyncIteratorToArray(PluginDB.iterate('wallet'))
    return wallets.sort((a, z) => z.createdAt.getTime() - a.createdAt.getTime())
}

export function createWallet() {}

export function addWallet() {}

export function removeWallet() {}

export function updateWallet() {}

function WalletOutDB(wallet: Wallet) {
    return {}
}
