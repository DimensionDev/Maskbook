import {
    evmAddress,
    mainnet,
    ManagedAccountsVisibility,
    PageSize,
    PublicClient,
    type AccountAvailable,
    type AccountStats,
    type AccountStatsRequest,
    type ChallengeRequest,
    type EvmAddress,
    type SessionClient,
} from '@lens-protocol/client'
import {
    fetchAccount,
    fetchAccountsAvailable,
    fetchAccountsBulk,
    fetchFollowStatus,
    fetchPosts,
    follow as lensFollow,
    unfollow as lensUnfollow,
} from '@lens-protocol/client/actions'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type PageIndicator,
} from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import type { LensV3BaseAPI } from '@masknet/web3-providers/types'
import { isZero } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { gql } from 'graphql-request'
import { sortBy, uniqBy } from 'lodash-es'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { LENS_ROOT_API } from './constants.js'
import { fragments } from './fragments/index.js'
import { formatLensPost, getAccountAvatar } from './helpers.js'
import type { FollowPair } from './types.js'

export class LensV3 {
    private signMessage: (message: string) => Promise<string>
    public account: EvmAddress | undefined
    private sessionClient: SessionClient | null = null
    public client: PublicClient
    constructor(account?: EvmAddress | string, signMessage?: (message: string) => Promise<string>) {
        this.client = PublicClient.create({
            environment: mainnet,
            storage: window.localStorage,
            fragments,
        })
        if (account && isValidAddress(account)) this.account = evmAddress(account)
        this.signMessage = signMessage || ((message: string) => EVMWeb3.signMessage('message', message))
    }

    async login(account: AccountAvailable) {
        const resumed = await this.client.resumeSession()
        if (resumed.isOk()) {
            this.sessionClient = resumed.value
        }
        if (!this.account) {
            throw new Error('No wallet account')
        }
        const options: ChallengeRequest =
            account.__typename === 'AccountManaged' ?
                {
                    accountManager: {
                        manager: this.account,
                        account: account.account.address,
                    },
                }
            :   {
                    accountOwner: {
                        owner: this.account,
                        account: account.account.address,
                    },
                }
        const authenticated = await this.client.login({
            ...options,
            signMessage: this.signMessage,
        })
        if (authenticated.isErr()) {
            throw new Error(authenticated.error.message)
        }
        this.sessionClient = authenticated.value
        return this.sessionClient
    }

    async getFollowStatus(pairs: FollowPair[]) {
        if (!pairs.length) return []
        const res = await fetchFollowStatus(this.client, { pairs })
        return res.unwrapOr([])
    }

    async follow(account: string) {
        if (!this.sessionClient) throw new Error('Please login first')
        return lensFollow(this.sessionClient, { account })
    }

    async unfollow(account: string) {
        if (!this.sessionClient) throw new Error('Please login first')
        return lensUnfollow(this.sessionClient, { account })
    }

    static async refresh(refreshToken: string) {
        if (!refreshToken) return
        const { data } = await fetchJSON<{ data: { refresh: LensV3BaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    mutation Refresh($refreshToken: String!) {
                        refresh(request: { refreshToken: $refreshToken }) {
                            accessToken
                            refreshToken
                        }
                    }
                `,
                variables: {
                    refreshToken,
                },
            }),
        })

        return data.refresh
    }

    async getAccountByHandle(/** handle */ handle: string) {
        const localName = handle.replace(/\.lens$/u, '')
        const res = await fetchAccount(this.client, {
            username: {
                localName,
            },
        })
        return res.unwrapOr(null)
    }
    async getAccountsByHandles(/** handles */ handles: string[]) {
        const res = await fetchAccountsBulk(this.client, {
            usernames: handles.map((handle) => ({ localName: handle.replace(/\.lens$/u, '') })),
        })
        return res.unwrapOr(null)
    }
    async getAccountByAddress(address: EvmAddress) {
        return fetchAccount(this.client, {
            address,
        })
    }

    async getAvailableAccounts(address?: EvmAddress) {
        const result = await fetchAccountsAvailable(this.client, {
            managedBy: address || this.account,
            pageSize: PageSize.Fifty,
            includeOwned: true,
            hiddenFilter: ManagedAccountsVisibility.All,
        })
        if (result.isErr()) return []
        const list = uniqBy(
            sortBy(result.value.items, (x) => (x.__typename === 'AccountManaged' ? -1 : 0)),
            (x) => x.account.address,
        )
        return list as AccountAvailable[]
    }

    static async getAccountStats(accountStatsRequest: AccountStatsRequest) {
        const result = await fetchJSON<{ data: { accountStats: AccountStats } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: gql`
                    query FullAccount($accountStatsRequest: AccountStatsRequest!) {
                        accountStats(request: $accountStatsRequest) {
                            graphFollowStats {
                                followers
                                following
                            }
                        }
                    }
                `,
                variables: {
                    accountStatsRequest,
                },
            }),
        })

        return result.data.accountStats
    }

    static getAccountWithStatsById(profileId: string) {
        LensV3.getAccountStats({
            account: evmAddress(profileId),
        })
    }

    static getAccountWithStatsByHandle(handle: string) {
        LensV3.getAccountStats({
            username: { localName: handle },
        })
    }
    static getAccountAvatar = getAccountAvatar

    async getPostsByAccounts(accounts: string | string[], indicator?: PageIndicator) {
        if (!accounts.length) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const authors = Array.isArray(accounts) ? accounts.map(evmAddress) : [evmAddress(accounts)]
        const res = await fetchPosts(this.client, {
            filter: {
                authors,
            },
            cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
        })
        if (res.isErr()) {
            throw new Error(res.error.message)
        }
        const result = res.value
        const page = createPageable(
            result.items.map(formatLensPost),
            createIndicator(indicator),
            result.pageInfo.next ? createNextIndicator(indicator, res.value.pageInfo.next) : undefined,
        )
        return page
    }
}
