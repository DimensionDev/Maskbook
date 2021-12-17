import { omit } from 'lodash-unified'
import {
    ChainId,
    ERC1155TokenDetailed,
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    NonFungibleTokenDetailed,
} from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PluginDB } from '../../../database/Plugin.db'
import { asyncIteratorToArray } from '../../../../../utils'
import type { ERC20TokenRecord, ERC721TokenRecord, ERC1155TokenRecord } from '../type'
import * as walletDB from './wallet'

type DatabaseTokenType = EthereumTokenType.ERC20 | EthereumTokenType.ERC721 | EthereumTokenType.ERC1155
type DatabaseTokenDetailed = ERC20TokenDetailed | NonFungibleTokenDetailed
type DatabaseTokenRecord = ERC20TokenRecord | ERC721TokenRecord | ERC1155TokenRecord

const MAX_TOKEN_COUNT = 49

function getRecordId(chainId: ChainId, address: string, tokenId?: string) {
    const recordId = `${chainId}_${address}`
    return tokenId ? `${recordId}_${tokenId}` : recordId
}

function getTokenId(tokenDetailed: DatabaseTokenDetailed) {
    return (tokenDetailed as ERC721TokenDetailed).tokenId
}

function getTokenAddress(tokenDetailed: DatabaseTokenDetailed) {
    return (
        (tokenDetailed as ERC20TokenDetailed | ERC1155TokenDetailed).address ||
        (tokenDetailed as ERC721TokenDetailed).contractDetailed.address
    )
}

function getTokenType(tokenDetailed: DatabaseTokenDetailed) {
    return (
        (tokenDetailed as ERC20TokenDetailed | ERC1155TokenDetailed).type ||
        (tokenDetailed as ERC721TokenDetailed).contractDetailed.type
    )
}

function getDatabaseType(type: DatabaseTokenType) {
    switch (type) {
        case EthereumTokenType.ERC20:
            return 'erc20'
        case EthereumTokenType.ERC721:
            return 'erc721'
        case EthereumTokenType.ERC1155:
            return 'erc1155'
        default:
            unreachable(type)
    }
}

function getEventMessage(type: DatabaseTokenType) {
    switch (type) {
        case EthereumTokenType.ERC20:
            return WalletMessages.events.erc20TokensUpdated
        case EthereumTokenType.ERC721:
            return WalletMessages.events.erc721TokensUpdated
        case EthereumTokenType.ERC1155:
            return WalletMessages.events.erc1155TokensUpdated
        default:
            unreachable(type)
    }
}

function TokenRecordOutDatabase(type: DatabaseTokenType, token: DatabaseTokenRecord) {
    const token_ = {
        ...omit(token, ['id', 'type', 'created', 'updated']),
        type,
    }
    switch (type) {
        case EthereumTokenType.ERC20:
            return token_ as ERC20TokenDetailed
        case EthereumTokenType.ERC721:
            return token_ as ERC721TokenDetailed
        case EthereumTokenType.ERC1155:
            return token_ as ERC1155TokenDetailed
        default:
            throw new Error('Unknown token type.')
    }
}

export async function hasToken(chainId: ChainId, type: DatabaseTokenType, address: string, tokenId?: string) {
    return PluginDB.has(getDatabaseType(type), getRecordId(chainId, address, tokenId))
}

export async function getToken(chainId: ChainId, type: DatabaseTokenType, address: string, tokenId?: string) {
    return PluginDB.get(getDatabaseType(type), getRecordId(chainId, address, tokenId))
}

export async function getTokens<T extends DatabaseTokenDetailed>(chainId: ChainId, type: DatabaseTokenType) {
    const tokens = await asyncIteratorToArray(PluginDB.iterate(getDatabaseType(type)))
    return tokens
        .map((x) => x.value)
        .filter((y) => y.chainId === chainId)
        .sort((a, z) => z.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, MAX_TOKEN_COUNT)
        .map((x) => TokenRecordOutDatabase(type, x) as T)
}

export async function getTokensCount(chainId: ChainId, type: DatabaseTokenType) {
    return (await getTokens(chainId, type)).length
}

export async function getTokensByPagination(chainId: ChainId, type: DatabaseTokenType, index: number, count: number) {
    let read = 0
    const records: DatabaseTokenRecord[] = []
    for await (const { value: record } of PluginDB.iterate(getDatabaseType(type))) {
        if (read > (index + 1) * count) break
        if (read < index * count) continue
        if (record.chainId === chainId) records.push(record)
        read += 1
    }
    return records.map((x) => TokenRecordOutDatabase(type, x))
}

export async function addToken(token: DatabaseTokenDetailed) {
    const type = getTokenType(token)
    const tokenId = getTokenId(token)
    const address = getTokenAddress(token)
    if (await hasToken(token.chainId, type, address)) throw new Error(`Token ${address} already exists.`)
    const now = new Date()
    // @ts-ignore
    await PluginDB.add({
        ...token,
        id: getRecordId(token.chainId, address, tokenId),
        type: getDatabaseType(type),
        createdAt: now,
        updatedAt: now,
    })
    getEventMessage(type).sendToAll()
}

export async function removeToken(token: DatabaseTokenDetailed) {
    const type = getTokenType(token)
    const tokenId = getTokenId(token)
    const address = getTokenAddress(token)
    if (!(await hasToken(token.chainId, type, address, tokenId))) throw new Error(`Failed to remove token ${address}.`)
    await PluginDB.remove(getDatabaseType(type), getRecordId(token.chainId, address, tokenId))
    getEventMessage(type).sendToAll()
}

export function trustToken(address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) {
    return walletDB.updateWalletToken(address, token, {
        strategy: 'trust',
    })
}

export function blockToken(address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) {
    return walletDB.updateWalletToken(address, token, {
        strategy: 'block',
    })
}
