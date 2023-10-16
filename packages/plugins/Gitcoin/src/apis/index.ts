import urlcat from 'urlcat'
import { fetchCachedJSON } from '@masknet/web3-providers/helpers'
import { GITCOIN_API_GRANTS_V1, type TenantTypes } from '../constants.js'

interface Metadata {}

interface AdminProfile {
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
    if (!/\d+/.test(id)) return

    const { grants } = await fetchCachedJSON<{
        grants: GitcoinGrant
        status: number
    }>(urlcat(GITCOIN_API_GRANTS_V1, { id }))
    return grants
}
