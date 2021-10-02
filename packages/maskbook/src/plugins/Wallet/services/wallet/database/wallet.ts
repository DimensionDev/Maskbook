import { omit, pick } from 'lodash-es'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
import { WalletMessages } from '@masknet/plugin-wallet'
import {
    currySameAddress,
    NonFungibleTokenDetailed,
    ERC1155TokenDetailed,
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    formatEthereumAddress,
    isSameAddress,
    ProviderType,
} from '@masknet/web3-shared'
import { EthereumAddress } from 'wallet.ts'
import { asyncIteratorToArray } from '../../../../../utils'
import { PluginDB } from '../../../database/Plugin.db'
import {
    currentMaskWalletAccountWalletSettings,
    currentAccountSettings,
    currentProviderSettings,
} from '../../../settings'
import type { WalletRecord } from '../type'

function WalletRecordOutDB(record: WalletRecord) {
    return {
        ...omit(record, 'type'),
        hasStoredKeyInfo: !!record.storedKeyInfo,
        hasDerivationPath: !!record.derivationPath,
    }
}

export async function getWallet(address = currentMaskWalletAccountWalletSettings.value) {
    if (!address) return null
    if (!EthereumAddress.isValid(address)) throw new Error('Not a valid address.')
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

export async function getWallets(provider?: ProviderType) {
    const wallets = await asyncIteratorToArray(PluginDB.iterate('wallet'))
    const address =
        provider === ProviderType.MaskWallet
            ? currentMaskWalletAccountWalletSettings.value
            : currentAccountSettings.value

    wallets.sort((a, z) => {
        if (isSameAddress(a.address, address)) return -1
        if (isSameAddress(z.address, address)) return 1
        if (a.updatedAt > z.updatedAt) return -1
        if (a.updatedAt < z.updatedAt) return 1
        if (a.createdAt > z.createdAt) return -1
        if (a.createdAt < z.createdAt) return 1
        return 0
    })
    if (provider === ProviderType.MaskWallet) return wallets.filter((x) => x.storedKeyInfo).map(WalletRecordOutDB)
    if (provider === currentProviderSettings.value)
        return wallets.filter(currySameAddress(address)).map(WalletRecordOutDB)
    if (provider) return []
    return wallets.map(WalletRecordOutDB)
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
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        erc721_token_whitelist: new Set(),
        erc721_token_blacklist: new Set(),
        erc1155_token_whitelist: new Set(),
        erc1155_token_blacklist: new Set(),
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
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        erc721_token_whitelist: new Set(),
        erc721_token_blacklist: new Set(),
        erc1155_token_whitelist: new Set(),
        erc1155_token_blacklist: new Set(),
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

export async function updateWalletToken(
    address: string,
    token: ERC20TokenDetailed | NonFungibleTokenDetailed,
    { strategy }: { strategy: 'block' | 'trust' },
) {
    const wallet = await getWalletRequired(address)
    const tokenAddress =
        (token as ERC20TokenDetailed | ERC1155TokenDetailed).address ||
        (token as ERC721TokenDetailed).contractDetailed.address
    const tokenAddressChecksummed = formatEthereumAddress(tokenAddress)
    const tokenType =
        (token as ERC20TokenDetailed | ERC1155TokenDetailed).type ||
        (token as ERC721TokenDetailed).contractDetailed.type

    const operationMap: Record<
        EthereumTokenType.ERC20 | EthereumTokenType.ERC721 | EthereumTokenType.ERC1155,
        Record<'block' | 'trust', Set<string>>
    > = {
        [EthereumTokenType.ERC20]: {
            block: wallet.erc20_token_blacklist,
            trust: wallet.erc20_token_whitelist,
        },
        [EthereumTokenType.ERC721]: {
            block: wallet.erc721_token_blacklist,
            trust: wallet.erc721_token_whitelist,
        },
        [EthereumTokenType.ERC1155]: {
            block: wallet.erc1155_token_blacklist,
            trust: wallet.erc1155_token_whitelist,
        },
    }

    const set = operationMap[tokenType][strategy]
    const reverseSet = operationMap[tokenType][strategy === 'block' ? 'trust' : 'block']

    let updated = false
    if (!set.has(tokenAddressChecksummed)) {
        set.add(tokenAddressChecksummed)
        updated = true
    }
    if (reverseSet.has(tokenAddressChecksummed)) {
        set.delete(tokenAddressChecksummed)
        updated = true
    }
    if (!updated) return
    await updateWallet(
        address,
        pick(wallet, [
            'erc20_token_blacklist',
            'erc20_token_whitelist',
            'erc721_token_blacklist',
            'erc721_token_whitelist',
            'erc1155_token_blacklist',
            'erc1155_token_whitelist',
        ]),
    )
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
