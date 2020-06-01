import { Result, Err, Ok } from 'ts-results'
import { GitcoinGrantFailedReason as Reason } from './types'

export interface GitcoinGrantMetadata {
    title?: string
    description?: string
    image?: string
    finalAmount?: number
    amount?: number
    contributors?: number
    address?: string
}
const domain = 'https://gitcoin.co/'
export async function fetchMetadata(url: string): Promise<Result<GitcoinGrantMetadata, [Reason, Error?]>> {
    if (!url.startsWith(domain)) return new Err([Reason.InvalidURL])
    const data = await fetchData(url)
    if (data.err) return data.mapErr((e) => [Reason.FetchFailed, e])
    const { val } = data
    const { title, description, logo: image, contract_address: address } = val
    const finalAmount = parse(data.val.amount_received)
    // TODO: wait for https://github.com/gitcoinco/web/pull/6633
    const [amount, contributors] = [undefined, undefined]

    return new Ok({ amount, contributors, description, finalAmount, image, title, address })
}

function fetchData(url: string) {
    const u = getURL(url)
    if (!u.ok) return Promise.reject(u)
    return fetch(u.val)
        .then((x) => x.json())
        .then(
            (x) => new Ok(x as Gitcoin),
            (e) => new Err<Error>(e),
        )
}
function getURL(url: string) {
    const x = url.match(/\d+/)?.[0]
    // https://github.com/gitcoinco/web/issues/6679
    // https://github.com/gitcoinco/web/issues/6493#issuecomment-631218226
    // if (x) return new Ok(`https://gitcoin.co/api/v0.1/grants/${x}/`)
    if (x) return new Ok(`https://gitcoin.provide.maskbook.com/api/v0.1/grants/${x}/`)
    return new Err(Reason.InvalidURL)
}

function parse(x: string | null | undefined) {
    if (typeof x !== 'string') return NaN
    return parseFloat(x.replace(/,/g, ''))
}

interface Gitcoin {
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

interface Metadata {}
