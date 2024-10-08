import urlcat from 'urlcat'
import { NetworkPluginID, createLookupTableResolver, NextIDPlatform, SocialAddressType } from '@masknet/shared-base'
import { CurrencyType, SourceType } from '../specs/index.js'
import { memoize } from 'lodash-es'

export const resolveSocialAddressLink = createLookupTableResolver<SocialAddressType, string>(
    {
        [SocialAddressType.Address]: '',
        [SocialAddressType.ARBID]: 'https://arb.id/',
        [SocialAddressType.ENS]: 'https://ens.domains/',
        [SocialAddressType.SPACE_ID]: 'https://space.id/',
        [SocialAddressType.RSS3]: 'https://rss3.bio/',
        [SocialAddressType.Crossbell]: 'https://crossbell.io/',
        [SocialAddressType.Firefly]: '',
        [SocialAddressType.SOL]: 'https://naming.bonfida.org/',
        [SocialAddressType.NEXT_ID]: 'https://next.id/',
        [SocialAddressType.CyberConnect]: 'https://cyberconnect.me/',
        [SocialAddressType.Leaderboard]: 'https://ethleaderboard.xyz/',
        [SocialAddressType.Sybil]: 'https://sybil.org/',
        [SocialAddressType.TwitterBlue]: '',
        [SocialAddressType.Mask]: '',
        [SocialAddressType.Lens]: '',
        [SocialAddressType.OpenSea]: '',
    },
    () => '',
)

export const resolveSourceTypeName = createLookupTableResolver<SourceType, string>(
    {
        [SourceType.DeBank]: 'DeBank',
        [SourceType.Zerion]: 'Zerion',
        [SourceType.RSS3]: 'RSS3',
        [SourceType.CoinMarketCap]: 'CoinMarketCap',
        [SourceType.UniswapInfo]: 'UniswapInfo',
        [SourceType.OpenSea]: 'OpenSea',
        [SourceType.Rarible]: 'Rarible',
        [SourceType.LooksRare]: 'LooksRare',
        [SourceType.NFTScan]: 'NFTScan',
        [SourceType.Zora]: 'Zora',
        [SourceType.Gem]: 'Gem',
        [SourceType.Alchemy_EVM]: 'Alchemy_EVM',
        [SourceType.Alchemy_FLOW]: 'Alchemy_FLOW',
        [SourceType.RaritySniper]: 'RaritySniper',
        [SourceType.TraitSniper]: 'TraitSniper',
        [SourceType.Chainbase]: 'Chainbase',
        [SourceType.X2Y2]: 'X2Y2',
        [SourceType.MagicEden]: 'MagicEden',
        [SourceType.Element]: 'Element',
        [SourceType.Solana]: 'Solana',
        [SourceType.Solsea]: 'Solsea',
        [SourceType.Solanart]: 'Solanart',
        [SourceType.R2D2]: 'R2D2',
        [SourceType.Rabby]: 'Rabby',
        [SourceType.CoinGecko]: 'CoinGecko',
        [SourceType.CF]: 'CloudFlare',
        [SourceType.GoPlus]: 'GoPlus',
        [SourceType.OKX]: 'OKX',
        [SourceType.Uniswap]: 'Uniswap',
        [SourceType.NFTX]: 'NFTX',
        [SourceType.Etherscan]: 'Etherscan',
        [SourceType.CryptoPunks]: 'CryptoPunks',
        [SourceType.SimpleHash]: 'SimpleHash',
        [SourceType.Approval]: 'Approval',
    },
    (providerType) => {
        throw new Error(`Unknown source type: ${providerType}.`)
    },
)

export const resolveCurrencyName = createLookupTableResolver<CurrencyType, string>(
    {
        [CurrencyType.BTC]: 'BTC',
        [CurrencyType.ETH]: 'ETH',
        [CurrencyType.NATIVE]: 'ETH',
        [CurrencyType.USD]: 'USD',
        [CurrencyType.CNY]: 'CNY',
        [CurrencyType.JPY]: 'JPY',
        [CurrencyType.HKD]: 'HKD',
        [CurrencyType.EUR]: 'EUR',
    },
    (CurrencyType) => {
        throw new Error(`Unknown currency type: ${CurrencyType}.`)
    },
)
export const resolveCurrencyFullName = createLookupTableResolver<CurrencyType, string>(
    {
        [CurrencyType.BTC]: 'Bitcoin',
        [CurrencyType.ETH]: 'Ethereum',
        [CurrencyType.NATIVE]: 'Ethereum',
        [CurrencyType.USD]: 'United States Dollar',
        [CurrencyType.CNY]: 'Chinese Yuan',
        [CurrencyType.JPY]: 'Japanese Yen',
        [CurrencyType.HKD]: 'Hong Kong Dollar',
        [CurrencyType.EUR]: 'Euro',
    },
    (CurrencyType) => {
        throw new Error(`Unknown currency type: ${CurrencyType}.`)
    },
)

export const resolveNetworkWalletName = createLookupTableResolver<NetworkPluginID, string>(
    {
        [NetworkPluginID.PLUGIN_EVM]: 'ETH Wallet',
        [NetworkPluginID.PLUGIN_SOLANA]: 'Solana Wallet',
    },
    (network) => {
        throw new Error(`Unknown network plugin-id: ${network}`)
    },
)

export const resolveNextIDPlatformWalletName: (platform: NextIDPlatform) => string = memoize(function (
    platform: NextIDPlatform,
) {
    const pluginId = resolveNextID_NetworkPluginID(platform)
    if (!pluginId) return `${platform} wallet`
    return resolveNetworkWalletName(pluginId)
})

export const resolveNextID_NetworkPluginID = createLookupTableResolver<NextIDPlatform, NetworkPluginID | undefined>(
    {
        [NextIDPlatform.Ethereum]: NetworkPluginID.PLUGIN_EVM,
        [NextIDPlatform.NextID]: undefined,
        [NextIDPlatform.GitHub]: undefined,
        [NextIDPlatform.Keybase]: undefined,
        [NextIDPlatform.Twitter]: undefined,
        [NextIDPlatform.ENS]: undefined,
        [NextIDPlatform.RSS3]: undefined,
        [NextIDPlatform.LENS]: undefined,
        [NextIDPlatform.REDDIT]: undefined,
        [NextIDPlatform.SYBIL]: undefined,
        [NextIDPlatform.EthLeaderboard]: undefined,
        [NextIDPlatform.SpaceId]: NetworkPluginID.PLUGIN_EVM,
        [NextIDPlatform.Farcaster]: undefined,
        [NextIDPlatform.Bit]: undefined,
        [NextIDPlatform.Unstoppable]: undefined,
        [NextIDPlatform.CyberConnect]: undefined,
    },
    () => {
        return undefined
    },
)

export const resolveNextIDPlatformName = createLookupTableResolver<NextIDPlatform, string>(
    {
        [NextIDPlatform.Ethereum]: 'Ethereum',
        [NextIDPlatform.NextID]: 'NEXT.ID',
        [NextIDPlatform.GitHub]: 'Github',
        [NextIDPlatform.Keybase]: 'Keybase',
        [NextIDPlatform.Twitter]: 'Twitter',
        [NextIDPlatform.ENS]: 'ENS',
        [NextIDPlatform.RSS3]: 'RSS3',
        [NextIDPlatform.LENS]: 'Lens',
        [NextIDPlatform.REDDIT]: 'Reddit',
        [NextIDPlatform.SYBIL]: 'Sybil',
        [NextIDPlatform.EthLeaderboard]: 'EthLeaderboard',
        [NextIDPlatform.SpaceId]: 'Space ID',
        [NextIDPlatform.Farcaster]: 'Farcaster',
        [NextIDPlatform.Bit]: '.bit',
        [NextIDPlatform.Unstoppable]: 'Unstoppable Domains',
        [NextIDPlatform.CyberConnect]: 'CyberConnect',
    },
    () => {
        return ''
    },
)

export const resolveNextIDPlatformLink = (networkPlatform: NextIDPlatform, identifier: string, name: string) => {
    switch (networkPlatform) {
        case NextIDPlatform.Ethereum:
            return `https://etherscan.io/address/${identifier}`
        case NextIDPlatform.NextID:
            return 'https://next.id/'
        case NextIDPlatform.GitHub:
            return `https://github.com/${identifier}`
        case NextIDPlatform.Keybase:
            return `https://keybase.io/${name}`
        case NextIDPlatform.Twitter:
            return `https://twitter.com/${identifier}`
        case NextIDPlatform.ENS:
            return `https://app.ens.domains/name/${identifier}`
        case NextIDPlatform.RSS3:
            return `https://rss3.io/result?search=${identifier}`
        case NextIDPlatform.LENS:
            return urlcat('https://firefly.mask.social/profile/:handle?source=lens', { handle: identifier })
        case NextIDPlatform.REDDIT:
            return `https://www.reddit.com/user/${identifier}`
        case NextIDPlatform.SYBIL:
            return 'https://sybil.org/'
        case NextIDPlatform.EthLeaderboard:
            return 'https://ethleaderboard.xyz/'
        case NextIDPlatform.SpaceId:
            return `https://bscscan.com/address/${identifier}`
        case NextIDPlatform.Farcaster:
            return `https://firefly.mask.social/profile/farcaster/${identifier}`
        case NextIDPlatform.Bit:
            return `https://bit.cc/${name}`
        case NextIDPlatform.Unstoppable:
            return `https://ud.me/${name}`
        default:
            return ''
    }
}

// https://stackoverflow.com/a/67176726
const MATCH_IPFS_CID_RAW =
    'Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[2-7A-Za-z]{58,}|B[2-7A-Z]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[\\dA-F]{50,}'
const MATCH_IPFS_DATA_RE = /ipfs\/(data:[\w,/;]+)$/
const MATCH_IPFS_CID_RE = new RegExp(`(${MATCH_IPFS_CID_RAW})`)
const MATCH_IPFS_CID_STRICT_RE = new RegExp(`^(?:${MATCH_IPFS_CID_RAW})$`)
const MATCH_IPFS_CID_AT_STARTS_RE = new RegExp(`^https://(?:${MATCH_IPFS_CID_RAW})`)
const MATCH_IPFS_CID_AND_PATHNAME_RE = new RegExp(`(?:${MATCH_IPFS_CID_RAW})\\/?.*`)
const MATCH_LOCAL_RESOURCE_URL_RE = /^(data|blob:|\w+-extension:\/\/|<svg\s)/
const CORS_HOST = 'https://cors-next.r2d2.to'
const IPFS_GATEWAY_HOST = 'https://hoot.it'

export function isIPFS_CID(cid: string) {
    return MATCH_IPFS_CID_STRICT_RE.test(cid)
}

export function isIPFS_Resource(str: string) {
    return MATCH_IPFS_CID_RE.test(str)
}

export function isArweaveResource(str: string) {
    return str.startsWith('ar:')
}

export function isLocaleResource(url: string) {
    return MATCH_LOCAL_RESOURCE_URL_RE.test(url)
}

export function resolveLocalURL(url: string) {
    if (url.startsWith('<svg ')) return `data:image/svg+xml;base64,${btoa(url)}`
    return url
}

/**
 * Remove query from IPFS url, as it is not needed
 * and will increase requests sometimes.
 * For example https://ipfs.io/ipfs/<same-cid>?id=67891 and https://ipfs.io/ipfs/<same-cid>?id=67892
 * are set to two different NFTs, but according to the same CID,
 * they are exactly the same.
 */
export function trimQuery(url: string) {
    const indexOf = url.indexOf('?')
    return url.slice(0, Math.max(0, indexOf === -1 ? url.length : indexOf))
}

export function resolveIPFS_CID(str: string) {
    return str.match(MATCH_IPFS_CID_RE)?.[1]
}

export function resolveIPFS_URL(cidOrURL: string | undefined): string | undefined {
    if (!cidOrURL) return cidOrURL

    // eliminate cors proxy
    if (cidOrURL.startsWith(CORS_HOST)) {
        return trimQuery(resolveIPFS_URL(decodeURIComponent(cidOrURL.replace(new RegExp(`^${CORS_HOST}??`), '')))!)
    }

    // a ipfs.io host
    if (cidOrURL.startsWith(IPFS_GATEWAY_HOST)) {
        // base64 data string
        const [_, data] = cidOrURL.match(MATCH_IPFS_DATA_RE) ?? []
        if (data) return decodeURIComponent(data)

        // plain
        return trimQuery(decodeURIComponent(cidOrURL))
    }

    // a ipfs hash fragment
    if (isIPFS_Resource(cidOrURL)) {
        // starts with a cid
        if (MATCH_IPFS_CID_AT_STARTS_RE.test(cidOrURL)) {
            try {
                const u = new URL(cidOrURL)
                const cid = resolveIPFS_CID(cidOrURL)

                if (cid) {
                    if (u.pathname === '/') {
                        return resolveIPFS_URL(
                            urlcat('https://ipfs.io/ipfs/:cid', {
                                cid,
                            }),
                        )
                    } else {
                        return resolveIPFS_URL(
                            urlcat('https://ipfs.io/ipfs/:cid/:path', {
                                cid,
                                path: u.pathname.slice(1),
                            }),
                        )
                    }
                }
            } catch (error) {
                console.log({
                    error,
                })
                // do nothing
            }
        }

        const pathname = cidOrURL.match(MATCH_IPFS_CID_AND_PATHNAME_RE)?.[0]
        if (pathname) return trimQuery(`${IPFS_GATEWAY_HOST}/ipfs/${pathname}`)
    }

    return cidOrURL
}

export function resolveArweaveURL<T extends string | undefined>(url: T) {
    if (!url) return url
    if (url.startsWith('https://')) return url
    return urlcat('https://arweave.net/:str', { str: url })
}

/**
 * Please do not use to resolve an image or an video resource, because that's
 * not allowed by the cors agent server
 */
export function resolveCrossOriginURL<T extends string | undefined>(url: T) {
    if (!url) return url
    if (isLocaleResource(url)) return url
    if (url.startsWith(CORS_HOST)) return url
    return `${CORS_HOST}?${encodeURIComponent(url)}`
}

export function resolveResourceURL<T extends string | undefined>(url: T) {
    if (!url) return url
    if (isLocaleResource(url)) return resolveLocalURL(url)
    if (isArweaveResource(url)) return resolveArweaveURL(url)
    return resolveIPFS_URL(url)
}
