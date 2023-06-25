import { type TenantTypes } from '../constants.js'
import MOCK_DATA from './mock.json'

export interface Metadata {}

export interface AdminProfile {
    id: number
    url: string
    handle: string
    keywords?: string[]
    position?: number
    avatar_url: string
    github_url?: string
    total_earned?: number
    organizations?: Metadata
}

export interface GitcoinGrant {
    url: string
    active: boolean
    title: string
    slug: string
    description: string
    description_rich: string
    reference_url: string
    logo_url: string
    logo: string
    last_update_natural: string
    verified: boolean
    admin_address: string
    amount_received: string
    token_address: string
    token_symbol: string
    contract_address: string
    metadata: Metadata
    network: string
    required_gas_price: string
    admin_profile: AdminProfile
    team_members: AdminProfile[]
    twitter_handle_1?: string
    twitter_handle_2?: string
    tenants: TenantTypes[]
}

export async function fetchGrant(id: string) {
    const response = MOCK_DATA
    return response.grants
    // if (!/\d+/.test(id)) return

    // const { grants } = await fetchJSON<{
    //     grants: GitcoinGrant
    //     status: number
    // }>(urlcat(GITCOIN_API_GRANTS_V1, { id }), undefined, {
    //     enableCache: true,
    //     enableSquash: true,
    // })
    // return grants
}
