import {
    evmAddress,
    mainnet,
    PublicClient,
    type AccountAvailable,
    type AccountStats,
    type AccountStatsRequest,
    type EvmAddress,
    type SessionClient,
} from '@lens-protocol/client'
import {
    fetchAccount,
    fetchAccountsAvailable,
    fetchAccountsBulk,
    fetchFollowStatus,
    follow as lensFollow,
    unfollow as lensUnfollow,
} from '@lens-protocol/client/actions'
import { gql } from 'graphql-request'
import { sortBy, uniqBy } from 'lodash-es'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { LensBaseAPI } from '../types/Lens.js'
import { LENS_ROOT_API } from './constants.js'
import { fragments } from './fragments/index.js'
import type { FollowPair } from './types.js'

export class LensV3 {
    private signMessage: (message: string) => Promise<string>
    public account: EvmAddress
    private sessionClient: SessionClient | null = null
    public client: PublicClient
    constructor(account: EvmAddress, signMessage: (message: string) => Promise<string>) {
        this.client = PublicClient.create({
            environment: mainnet,
            storage: window.localStorage,
            fragments,
        })
        this.account = account
        this.signMessage = signMessage
    }

    async login(account: EvmAddress) {
        const resumed = await this.client.resumeSession()
        if (resumed.isOk()) {
            this.sessionClient = resumed.value
        }
        const authenticated = await this.client.login({
            accountManager: {
                manager: this.account,
                account,
            },
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
        const { data } = await fetchJSON<{ data: { refresh: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
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

    async getAccountByHandle(/** handle */ localName: string) {
        const res = await fetchAccount(this.client, {
            username: {
                localName,
            },
        })
        return res.unwrapOr(null)
    }
    async getAccountsByHandles(/** handles */ localNames: string[]) {
        const res = await fetchAccountsBulk(this.client, {
            usernames: localNames.map((x) => ({ localName: x })),
        })
        return res.unwrapOr(null)
    }
    async getAccountByAddress(address: EvmAddress) {
        return fetchAccount(this.client, {
            address,
        })
    }

    async getAvailableAccounts(address: EvmAddress) {
        const result = await fetchAccountsAvailable(this.client, {
            managedBy: address,
        })
        if (result.isErr()) return []
        const list = uniqBy(
            sortBy(result.value.items, (x) => (x.__typename === 'AccountOwned' ? -1 : 0)),
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
}
