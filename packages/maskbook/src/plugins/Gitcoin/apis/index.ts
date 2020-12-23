import { GITCOIN_API_GRANTS_V1 } from '../constants'

export interface Metadata {}

export interface AdminProfile {
    id: number
    url: string
    handle: string
    keywords: string[]
    position: number
    avatar_url: string
    github_url: string
    total_earned: number
    organizations: Metadata
}

export interface GitcoinGrant {
    active: boolean
    title: string
    slug: string
    description: string
    reference_url: string
    logo: string
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
}

export async function fetchGrant(id: string) {
    if (!/\d+/.test(id)) return
    const response = await fetch(`${GITCOIN_API_GRANTS_V1}/${id}`)
    return (await response.json()) as GitcoinGrant
}
