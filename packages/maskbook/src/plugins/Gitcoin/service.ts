import { Result, Err, Ok } from 'ts-results'
import { GitcoinGrantFailedReason as Reason } from './types'
import BigNumber from 'bignumber.js'

export interface GitcoinGrantMetadata {
    title?: string
    description?: string
    image?: string
    estimatedAmount?: BigNumber
    daiAmount?: BigNumber
    transactions?: number
    address?: string
    permalink?: string
}
const domain = 'https://gitcoin.co/'

export async function fetchMetadata(url: string): Promise<Result<GitcoinGrantMetadata, readonly [Reason, Error?]>> {
    if (!url.startsWith(domain)) return Err([Reason.InvalidURL] as const)
    const id = url.match(/\d+/)?.[0]
    if (!id) return Err([Reason.InvalidURL] as const)
    const data = await fetchData(id)
    if (data.err) return data.mapErr((e) => [Reason.FetchFailed, e] as const)
    const { val } = data
    const { title, slug, description, logo: image, admin_address: address } = val.grant
    const { transactions = [] } = val.report.grantee.find((x) => x.grant_name === val.grant.title) ?? {}
    const estimatedAmount = transactions.reduce(
        (accumulate, tx) => accumulate.plus(new BigNumber(tx.usd_value ?? 0)),
        new BigNumber(0),
    )
    const daiAmount = transactions.reduce(
        (accumulate, tx) => accumulate.plus(tx.asset === 'DAI' ? tx.amount : 0),
        new BigNumber(0),
    )
    return Ok({
        estimatedAmount,
        daiAmount,
        transactions: transactions.length,
        description,
        image,
        title,
        address,
        permalink: `${domain}grants/${id}/${slug}`,
    })
}

async function fetchData(id: string) {
    const fetchGrant = (id: string) =>
        fetch(`https://gitcoin.provide.maskbook.com/api/v0.1/grants/${id}/`).then(
            (x) => x.json() as Promise<GitcoinGrant>,
        )
    const fetchGrantReport = (address: string) =>
        fetch(`https://gitcoin.provide.maskbook.com/api/v0.1/grants/report/?eth_address=${address}`).then(
            (x) => x.json() as Promise<GitcoinGrantReport>,
        )
    try {
        const grant = await fetchGrant(id)
        if (!grant.admin_address) return Err<Error>(new Error('cannot find the admin address'))
        const report = await fetchGrantReport(grant.admin_address)
        return Ok({
            grant,
            report,
        })
    } catch (e) {
        return Err<Error>(e)
    }
}

interface GitcoinGrant {
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

interface AdminProfile {
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

interface GitcoinGrantReport {
    grantee: {
        grant_name: string
        transactions: GranteeTransaction[]
    }[]
    donor: DonorTransaction[]
}

interface GranteeTransaction {
    asset: 'ETH' | 'DAI'
    timestamp: string
    amount: string
    clr_round: number
    usd_value: number | null
}

interface DonorTransaction {
    grant_name: string
    asset: 'ETH' | 'DAI'
    timestamp: string
    grant_amount: string
    gitcoin_maintenance_amount: string
    grant_usd_value: number
    gitcoin_usd_value: number
}

interface Metadata {}
