import { uniqBy } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageObject } from '@masknet/shared-base'
import {
    FungibleToken,
    NonFungibleToken,
    Token,
    TokenType,
    TokenState as Web3TokenState,
} from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export interface TokenStorage<ChainId, SchemaType> {
    fungibleTokens: FungibleToken<ChainId, SchemaType>[]
    nonFungibleTokens: NonFungibleToken<ChainId, SchemaType>[]
    fungibleTokenBlockedBy: Record<string, string[]>
    nonFungibleTokenBlockedBy: Record<string, string[]>
}

export class TokenState<ChainId, SchemaType> implements Web3TokenState<ChainId, SchemaType> {
    protected storage: StorageObject<TokenStorage<ChainId, SchemaType>> = null!

    public fungibleTokens?: Subscription<FungibleToken<ChainId, SchemaType>[]>
    public nonFungibleTokens?: Subscription<NonFungibleToken<ChainId, SchemaType>[]>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: TokenStorage<ChainId, SchemaType>,
        protected subscriptions: {
            account?: Subscription<string>
        },
        protected options: {
            isValidAddress(a: string): boolean
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = context.createKVStorage('persistent', defaultValue)
        this.storage = storage

        if (this.subscriptions.account) {
            this.fungibleTokens = mapSubscription(
                mergeSubscription<[string, FungibleToken<ChainId, SchemaType>[], Record<string, string[]>]>(
                    this.subscriptions.account,
                    this.storage.fungibleTokens.subscription,
                    this.storage.fungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) => tokens.filter((x) => !blockedBy[account]?.includes(x.address)),
            )
            this.nonFungibleTokens = mapSubscription(
                mergeSubscription<[string, NonFungibleToken<ChainId, SchemaType>[], Record<string, string[]>]>(
                    this.subscriptions.account,
                    this.storage.nonFungibleTokens.subscription,
                    this.storage.nonFungibleTokenBlockedBy.subscription,
                ),
                ([account, tokens, blockedBy]) => tokens.filter((x) => !blockedBy[account]?.includes(x.address)),
            )
        }
    }

    private async addOrRemoveToken(token: Token<ChainId, SchemaType>, strategy: 'add' | 'remove') {
        if (this.options.isValidAddress(token.address)) throw new Error('Not a valid token.')

        const address = this.options.formatAddress(token.address)
        const tokens: Token<ChainId, SchemaType>[] =
            token.type === TokenType.Fungible ? this.storage.fungibleTokens.value : this.storage.nonFungibleTokens.value
        const tokensUpdated =
            strategy === 'add'
                ? uniqBy(
                      [
                          {
                              ...token,
                              id: address,
                              address,
                          },
                          ...tokens,
                      ],
                      (x) => x.id,
                  )
                : tokens.filter((x) => !this.options.isSameAddress(x.address, address))

        if (token.type === TokenType.Fungible) {
            await this.storage.fungibleTokens.setValue(tokensUpdated as FungibleToken<ChainId, SchemaType>[])
        } else {
            await this.storage.nonFungibleTokens.setValue(tokensUpdated as NonFungibleToken<ChainId, SchemaType>[])
        }
    }

    private async blockOrUnblockToken(address: string, token: Token<ChainId, SchemaType>, strategy: 'trust' | 'block') {
        if (this.options.isValidAddress(token.address)) throw new Error('Not a valid token.')

        const address_ = this.options.formatAddress(address)
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

    async addToken(token: Token<ChainId, SchemaType>) {
        this.addOrRemoveToken(token, 'add')
    }
    async removeToken(token: Token<ChainId, SchemaType>) {
        this.addOrRemoveToken(token, 'remove')
    }
    async trustToken(address: string, token: Token<ChainId, SchemaType>) {
        this.blockOrUnblockToken(address, token, 'trust')
    }
    async blockToken(address: string, token: Token<ChainId, SchemaType>) {
        this.blockOrUnblockToken(address, token, 'block')
    }
}
