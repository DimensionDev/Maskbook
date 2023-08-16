import { uniqBy } from 'lodash-es'
import { produce, type Draft } from 'immer'
import type { Subscription } from 'use-subscription'
import {
    mapSubscription,
    mergeSubscription,
    PersistentStorages,
    safeEmptyList,
    type NetworkPluginID,
    type StorageObject,
} from '@masknet/shared-base'
import {
    type FungibleToken,
    type NonFungibleToken,
    type Token,
    TokenType,
    type TokenState as Web3TokenState,
    type NonFungibleTokenContract,
    isSameAddress,
} from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

export interface TokenStorage<ChainId extends number, SchemaType> {
    fungibleTokenList: Record<string, Array<FungibleToken<ChainId, SchemaType>>>
    nonFungibleTokenList: Record<string, Array<NonFungibleToken<ChainId, SchemaType>>>
    fungibleTokenBlockedBy: Record<string, string[]>
    /** For non-fungible token, we store `${chainId}.${address}.${tokenId}` as token id */
    nonFungibleTokenBlockedBy: Record<string, string[]>
    credibleFungibleTokenList: Partial<Record<ChainId, Array<FungibleToken<ChainId, SchemaType>>>>
    credibleNonFungibleTokenList: Partial<Record<ChainId, Array<NonFungibleToken<ChainId, SchemaType>>>>
    /** account as key */
    nonFungibleCollectionMap: Record<
        string,
        Array<{
            contract: NonFungibleTokenContract<ChainId, SchemaType>
            tokenIds: string[]
        }>
    >
}

export class TokenState<ChainId extends number, SchemaType> implements Web3TokenState<ChainId, SchemaType> {
    public storage: StorageObject<TokenStorage<ChainId, SchemaType>> = null!
    public trustedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    public trustedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    public blockedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    public blockedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    public credibleFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    public credibleNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    public nonFungibleCollectionMap?: Subscription<
        Record<
            string,
            Array<{
                contract: NonFungibleTokenContract<ChainId, SchemaType>
                tokenIds: string[]
            }>
        >
    >

    get ready() {
        const { storage } = this
        return (
            storage.fungibleTokenList.initialized &&
            storage.nonFungibleTokenList.initialized &&
            storage.fungibleTokenBlockedBy.initialized &&
            storage.nonFungibleTokenBlockedBy.initialized &&
            storage.credibleFungibleTokenList.initialized &&
            storage.credibleNonFungibleTokenList.initialized &&
            storage.nonFungibleCollectionMap.initialized
        )
    }

    get readyPromise() {
        const { storage } = this
        return Promise.all([
            storage.fungibleTokenList.initializedPromise,
            storage.nonFungibleTokenList.initializedPromise,
            storage.fungibleTokenBlockedBy.initializedPromise,
            storage.nonFungibleTokenBlockedBy.initializedPromise,
            storage.credibleFungibleTokenList.initializedPromise,
            storage.credibleNonFungibleTokenList.initializedPromise,
            storage.nonFungibleCollectionMap.initialized,
        ]).then(() => {})
    }

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected defaultValue: TokenStorage<ChainId, SchemaType>,
        protected subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
        protected options: {
            pluginID: NetworkPluginID
            isValidAddress(a: string): boolean
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = PersistentStorages.Web3.createSubScope(`${this.options.pluginID}_Token`, defaultValue)
        this.storage = storage

        if (this.subscriptions.account) {
            this.trustedFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    storage.fungibleTokenList.subscription,
                    storage.fungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) => {
                    const key = account.toLowerCase()
                    return safeEmptyList(tokens[key]?.filter((x) => !blockedBy[key]?.includes(x.address)))
                },
            )
            this.trustedNonFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    storage.nonFungibleTokenList.subscription,
                    storage.nonFungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) => {
                    const key = account.toLowerCase()
                    return safeEmptyList(tokens[key]?.filter((x) => !blockedBy[key]?.includes(x.address)))
                },
            )
            this.blockedFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    storage.fungibleTokenList.subscription,
                    storage.fungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) => {
                    const key = account.toLowerCase()
                    return safeEmptyList(tokens[key]?.filter((x) => blockedBy[key]?.includes(x.id)))
                },
            )
            this.blockedNonFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    storage.nonFungibleTokenList.subscription,
                    storage.nonFungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) => {
                    const key = account.toLowerCase()
                    return safeEmptyList(tokens[key]?.filter((x) => blockedBy[key]?.includes(x.id)))
                },
            )
            if (this.subscriptions.chainId) {
                this.credibleFungibleTokens = mapSubscription(
                    mergeSubscription(this.subscriptions.chainId, storage.credibleFungibleTokenList.subscription),
                    ([chainId, tokens]) => safeEmptyList(tokens[chainId]),
                )

                this.credibleNonFungibleTokens = mapSubscription(
                    mergeSubscription(this.subscriptions.chainId, storage.credibleNonFungibleTokenList.subscription),
                    ([chainId, tokens]) => safeEmptyList(tokens[chainId]),
                )
            }
        }
        this.nonFungibleCollectionMap = storage.nonFungibleCollectionMap.subscription
    }

    // add or remove by contract address from user
    private async addOrRemoveToken(account: string, token: Token<ChainId, SchemaType>, strategy: 'add' | 'remove') {
        if (!token.id) throw new Error('Token id is required')

        const key = account.toLowerCase()
        const tokens: Record<string, Array<Token<ChainId, SchemaType>>> = token.type === TokenType.Fungible
            ? this.storage.fungibleTokenList.value
            : this.storage.nonFungibleTokenList.value
        const id = token.id.toLowerCase()

        const oldList: Array<Token<ChainId, SchemaType>> = tokens[key] ?? []
        const newList =
            strategy === 'add'
                ? uniqBy([{ ...token, id }, ...oldList], (x) => x.id)
                : oldList.filter((x) => x.id !== id)

        const updatedValue = { ...tokens, [key]: newList }

        if (token.type === TokenType.Fungible) {
            await this.storage.fungibleTokenList.setValue(
                updatedValue as Record<string, Array<FungibleToken<ChainId, SchemaType>>>,
            )
        } else {
            await this.storage.nonFungibleTokenList.setValue(
                updatedValue as Record<string, Array<NonFungibleToken<ChainId, SchemaType>>>,
            )
        }
    }

    // trust or block exist token in token list
    private async blockOrUnblockToken(account: string, token: Token<ChainId, SchemaType>, strategy: 'trust' | 'block') {
        if (!token.id) throw new Error('Token id is required')

        const key = account.toLowerCase()
        const blocked =
            token.type === TokenType.Fungible
                ? this.storage.fungibleTokenBlockedBy.value
                : this.storage.nonFungibleTokenBlockedBy.value
        const oldList = blocked[key] ?? []
        const id = token.id.toLowerCase()
        const blockedUpdated = {
            ...blocked,
            [key]:
                strategy === 'trust'
                    ? oldList.filter((x) => x.toLowerCase() !== id)
                    : uniqBy([id, ...oldList], (x) => x.toLowerCase()),
        }

        if (token.type === TokenType.Fungible) {
            await this.storage.fungibleTokenBlockedBy.setValue(blockedUpdated)
        } else {
            await this.storage.nonFungibleTokenBlockedBy.setValue(blockedUpdated)
        }
    }

    async addToken(address: string, token: Token<ChainId, SchemaType>) {
        this.addOrRemoveToken(address, token, 'add')
    }
    async removeToken(address: string, token: Token<ChainId, SchemaType>) {
        this.addOrRemoveToken(address, token, 'remove')
    }
    async trustToken(address: string, token: Token<ChainId, SchemaType>) {
        this.addOrRemoveToken(address, token, 'remove')
        this.blockOrUnblockToken(address, token, 'trust')
    }
    async blockToken(address: string, token: Token<ChainId, SchemaType>) {
        this.blockOrUnblockToken(address, token, 'block')
        this.addOrRemoveToken(address, token, 'add')
    }
    async addNonFungibleCollection(
        owner: string,
        contract: NonFungibleTokenContract<ChainId, SchemaType>,
        tokenIds: string[],
    ) {
        type StorageCollection = {
            contract: NonFungibleTokenContract<ChainId, SchemaType>
            tokenIds: string[]
        }
        const key = owner.toLowerCase()
        const { nonFungibleCollectionMap: collectionMap, nonFungibleTokenBlockedBy: blockedBy } = this.storage
        const list: StorageCollection[] = collectionMap.value[key] || []
        const newList = produce(list, (draft) => {
            const index = draft.findIndex(
                (x) => x.contract.chainId === contract.chainId && isSameAddress(x.contract.address, contract.address),
            )
            const newRecord = {
                contract,
                tokenIds,
            }
            if (index > -1) {
                // Just override the original record
                Object.assign(draft[index], newRecord)
            } else {
                draft.push(newRecord as Draft<StorageCollection>)
            }
        })
        await collectionMap.setValue({
            ...collectionMap.value,
            [key]: newList,
        })

        // Also remove from block ids
        const ids = tokenIds.map((x) => `${contract.chainId}.${contract.address.toLowerCase()}.${x}`)
        const blockIds = blockedBy.value[key]
        if (!blockIds?.length) return
        await blockedBy.setValue({
            ...blockedBy.value,
            [key]: blockIds.filter((x) => !ids.includes(x)),
        })
    }
}
