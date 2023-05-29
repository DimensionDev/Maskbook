import { uniqBy } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, safeEmptyList, type StorageObject } from '@masknet/shared-base'
import {
    type FungibleToken,
    type NonFungibleToken,
    type Token,
    TokenType,
    type TokenState as Web3TokenState,
} from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

export interface TokenStorage<ChainId extends number, SchemaType> {
    fungibleTokenList: Record<string, Array<FungibleToken<ChainId, SchemaType>>>
    nonFungibleTokenList: Record<string, Array<NonFungibleToken<ChainId, SchemaType>>>
    fungibleTokenBlockedBy: Record<string, string[]>
    nonFungibleTokenBlockedBy: Record<string, string[]>
    credibleFungibleTokenList: Partial<Record<ChainId, Array<FungibleToken<ChainId, SchemaType>>>>
    credibleNonFungibleTokenList: Partial<Record<ChainId, Array<NonFungibleToken<ChainId, SchemaType>>>>
}

export class TokenState<ChainId extends number, SchemaType> implements Web3TokenState<ChainId, SchemaType> {
    public storage: StorageObject<TokenStorage<ChainId, SchemaType>> = null!
    public trustedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    public trustedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    public blockedFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    public blockedNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>
    public credibleFungibleTokens?: Subscription<Array<FungibleToken<ChainId, SchemaType>>>
    public credibleNonFungibleTokens?: Subscription<Array<NonFungibleToken<ChainId, SchemaType>>>

    get ready() {
        return (
            this.storage.fungibleTokenList.initialized &&
            this.storage.nonFungibleTokenList.initialized &&
            this.storage.fungibleTokenBlockedBy.initialized &&
            this.storage.nonFungibleTokenBlockedBy.initialized &&
            this.storage.credibleFungibleTokenList.initialized &&
            this.storage.credibleNonFungibleTokenList.initialized
        )
    }

    get readyPromise() {
        return Promise.all([
            this.storage.fungibleTokenList.initializedPromise,
            this.storage.nonFungibleTokenList.initializedPromise,
            this.storage.fungibleTokenBlockedBy.initializedPromise,
            this.storage.nonFungibleTokenBlockedBy.initializedPromise,
            this.storage.credibleFungibleTokenList.initializedPromise,
            this.storage.credibleNonFungibleTokenList.initializedPromise,
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
            isValidAddress(a: string): boolean
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = context.createKVStorage('persistent', {}).createSubScope('Token', defaultValue)
        this.storage = storage

        if (this.subscriptions.account) {
            this.trustedFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    this.storage.fungibleTokenList.subscription,
                    this.storage.fungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) =>
                    safeEmptyList(
                        tokens[account.toLowerCase()]?.filter(
                            (x) => !blockedBy[account.toLowerCase()]?.includes(x.address),
                        ),
                    ),
            )
            this.trustedNonFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    this.storage.nonFungibleTokenList.subscription,
                    this.storage.nonFungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) =>
                    safeEmptyList(
                        tokens[account.toLowerCase()]?.filter(
                            (x) => !blockedBy[account.toLowerCase()]?.includes(x.address),
                        ),
                    ),
            )
            this.blockedFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    this.storage.fungibleTokenList.subscription,
                    this.storage.fungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) =>
                    safeEmptyList(
                        tokens[account.toLowerCase()]?.filter((x) =>
                            blockedBy[account.toLowerCase()]?.includes(x.address),
                        ),
                    ),
            )
            this.blockedNonFungibleTokens = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    this.storage.nonFungibleTokenList.subscription,
                    this.storage.nonFungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) =>
                    safeEmptyList(
                        tokens[account.toLowerCase()]?.filter((x) =>
                            blockedBy[account.toLowerCase()]?.includes(x.address),
                        ),
                    ),
            )
            if (this.subscriptions.chainId) {
                this.credibleFungibleTokens = mapSubscription(
                    mergeSubscription(this.subscriptions.chainId, this.storage.credibleFungibleTokenList.subscription),
                    ([chainId, tokens]) => safeEmptyList(tokens[chainId]),
                )

                this.credibleNonFungibleTokens = mapSubscription(
                    mergeSubscription(
                        this.subscriptions.chainId,
                        this.storage.credibleNonFungibleTokenList.subscription,
                    ),
                    ([chainId, tokens]) => safeEmptyList(tokens[chainId]),
                )
            }
        }
    }

    // add or remove by contract address from user
    private async addOrRemoveToken(address: string, token: Token<ChainId, SchemaType>, strategy: 'add' | 'remove') {
        if (!this.options.isValidAddress(token.address)) throw new Error('Not a valid token.')

        const account = this.options.formatAddress(address).toLowerCase()
        const tokenAddress = this.options.formatAddress(token.address)
        const tokens: Record<string, Array<Token<ChainId, SchemaType>>> = token.type === TokenType.Fungible
            ? this.storage.fungibleTokenList.value
            : this.storage.nonFungibleTokenList.value

        const addedTokens: Array<Token<ChainId, SchemaType>> = tokens[account] ?? []
        const tokensUpdated =
            strategy === 'add'
                ? uniqBy(
                      [
                          {
                              ...token,
                              id: tokenAddress,
                              address: tokenAddress,
                          },
                          ...addedTokens,
                      ],
                      (x) => x.id,
                  )
                : addedTokens.filter((x) => !this.options.isSameAddress(x.address, tokenAddress))

        const updatedValue = { ...tokens, [account]: tokensUpdated }

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
    private async blockOrUnblockToken(address: string, token: Token<ChainId, SchemaType>, strategy: 'trust' | 'block') {
        if (!this.options.isValidAddress(token.address)) throw new Error('Not a valid token.')

        const address_ = this.options.formatAddress(address).toLowerCase()
        const blocked =
            token.type === TokenType.Fungible
                ? this.storage.fungibleTokenBlockedBy.value
                : this.storage.nonFungibleTokenBlockedBy.value
        const blockedUpdated = {
            ...blocked,
            [address_]:
                strategy === 'trust'
                    ? blocked[address_]?.filter((x) => !this.options.isSameAddress(x, token.address))
                    : uniqBy([this.options.formatAddress(token.address), ...(blocked[address_] ?? [])], (x) =>
                          x.toLowerCase(),
                      ),
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
}
