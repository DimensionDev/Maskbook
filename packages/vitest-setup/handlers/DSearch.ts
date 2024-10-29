import { http, HttpResponse } from 'msw'

const baseURL = 'https://dsearch.mask.r2d2.to'
const rss3BaseURL = 'https://kurora-v2.rss3.dev'

/* cspell:disable */
export const DSearchHandlers = [
    http.get(`${baseURL}/fungible-tokens/specific-list.json`, () => {
        return HttpResponse.json(
            [
                {
                    pluginID: 'com.mask.evm',
                    name: 'eth1',
                    symbol: 'eth',
                    type: 'FungibleToken',
                },
            ],
            { status: 200 },
        )
    }),
    http.get(`${baseURL}/non-fungible-tokens/specific-list.json`, () => {
        return HttpResponse.json([], { status: 200 })
    }),
    http.get(`${baseURL}/non-fungible-collections/specific-list.json`, () => {
        return HttpResponse.json([], { status: 200 })
    }),
    http.get(`${baseURL}/fungible-tokens/coingecko.json`, () => {
        return HttpResponse.json(
            [
                {
                    pluginID: 'com.mask.evm',
                    name: 'ethInCoinGecko',
                    symbol: 'eth',
                    type: 'FungibleToken',
                },
                {
                    pluginID: 'com.mask.evm',
                    name: 'test thefuzzy search empty',
                    symbol: 'fuzzy',
                    type: 'FungibleToken',
                },
            ],
            { status: 200 },
        )
    }),
    http.get(`${baseURL}/non-fungible-tokens/nftscan.json`, () => {
        return HttpResponse.json([], { status: 200 })
    }),
    http.get(`${baseURL}/non-fungible-collections/nftscan.json`, () => {
        return HttpResponse.json(
            [
                {
                    pluginID: 'com.mask.evm',
                    address: '0x4e1f41613c9084fdb9e34e11fae9412427480e56',
                    name: 'Terraforms',
                    symbol: 'TERRAFORMS',
                    iconURL: 'https://logo.nftscan.com/logo/0x4e1f41613c9084fdb9e34e11fae9412427480e56.png',
                    balance: 9909,
                    verified: false,
                    source: 'NFTScan',
                    rank: 1,
                    collection: {
                        address: '0x4e1f41613c9084fdb9e34e11fae9412427480e56',
                        name: 'Terraforms',
                        symbol: 'TERRAFORMS',
                        chain: 1,
                        socialLinks: {
                            website: 'https://mathcastles.xyz',
                            email: null,
                            twitter: 'mathcastles',
                            discord: 'https://discord.gg/mathcastles',
                            telegram: null,
                            github: null,
                            instagram: null,
                            medium: null,
                        },
                    },
                    type: 'NonFungibleCollection',
                },
                {
                    pluginID: 'com.mask.evm',
                    address: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',
                    name: 'Meebits',
                    symbol: '⚇',
                    iconURL: 'https://logo.nftscan.com/logo/0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7.png',
                    balance: 20000,
                    verified: false,
                    source: 'NFTScan',
                    collection: {
                        address: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',
                        name: 'Meebits',
                        symbol: '⚇',
                        chain: 1,
                        socialLinks: {
                            website: null,
                            email: 'meebits@larvalabs.com',
                            twitter: null,
                            discord: 'https://discord.com/invite/meebits',
                            telegram: null,
                            github: '',
                            instagram: null,
                            medium: null,
                        },
                    },
                    type: 'NonFungibleCollection',
                },
                {
                    pluginID: 'com.mask.evm',
                    address: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',
                    name: 'TestEth',
                    symbol: '⚇',
                    iconURL: 'https://logo.nftscan.com/logo/0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7.png',
                    balance: 20000,
                    verified: false,
                    source: 'NFTScan',
                    collection: {
                        address: '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7',
                        name: 'TestEth',
                        symbol: '⚇',
                        chain: 1,
                        socialLinks: {
                            website: null,
                            email: 'meebits@larvalabs.com',
                            twitter: 'eth',
                            discord: 'https://discord.com/invite/meebits',
                            telegram: null,
                            github: '',
                            instagram: null,
                            medium: null,
                        },
                    },
                    type: 'NonFungibleCollection',
                },
            ],
            { status: 200 },
        )
    }),

    http.get(`${rss3BaseURL}/datasets/domains/profiles`, () => {
        return HttpResponse.json([
            {
                address: '0x934b510d4c9103e6a87aef13b816fb080286d649',
                network: 'crossbell',
                platform: 'Crossbell',
                source: 'Crossbell',
                name: 'Suji Yan',
                handle: 'suji.csb',
                bio: 'Founder Mask Network $Mask; maintain mstdn.jp mastodon.cloud ; Engineer; Journalist; 💪FOSS/Anti996; 中文/日本語 mask.io',
                url: 'https://crossbell.io/@suji',
                profile_uri: ['https://ipfs.io/ipfs/QmeYWaMUekPthkMnb5FMkiPLBTfu1PLkQFvZM3a7oftzNu/'],
            },
            {
                address: '0x934b510d4c9103e6a87aef13b816fb080286d649',
                network: 'farcaster',
                platform: 'Farcaster',
                source: 'Farcaster',
                name: 'Suji Yan',
                handle: 'suji',
                bio: 'Mask.io / suji_yan.twitter',
                url: 'https://www.discove.xyz/@suji',
            },
            {
                address: '0x934b510d4c9103e6a87aef13b816fb080286d649',
                network: 'ethereum',
                platform: 'ENS Registrar',
                source: 'ENS Registrar',
                name: 'sujiyan',
                handle: 'sujiyan.eth',
                bio: '',
                url: 'https://mask.io',
                expire_at: '2027-01-30T04:49:54Z',
                profile_uri: ['https://i.imgur.com/rkMlngS_d.webp?maxwidth=640&shape=thumb&fidelity=medium'],
            },
            {
                address: '0x934b510d4c9103e6a87aef13b816fb080286d649',
                network: 'crossbell',
                platform: 'Crossbell',
                source: 'Crossbell',
                name: '',
                handle: 'sujiyan.csb',
                bio: '',
                url: 'https://crossbell.io/@sujiyan',
            },
            {
                address: '0x934b510d4c9103e6a87aef13b816fb080286d649',
                network: 'binance_smart_chain',
                platform: 'Space ID',
                source: 'Space ID',
                name: 'sujiyan',
                handle: 'sujiyan.bnb',
                bio: '',
                expire_at: '2023-09-18T03:44:56Z',
                profile_uri: [
                    'https://meta.image.space.id/image/mainnet/1724643242156410158978553366859696090187901297468846704390299624367871799562.svg',
                ],
            },
            {
                address: '0x934b510d4c9103e6a87aef13b816fb080286d649',
                network: 'polygon',
                platform: 'Lens',
                source: 'Lens',
                name: 'Suji Yan',
                handle: 'sujiyan.lens',
                bio: 'Mask.io',
                url: 'https://lenster.xyz/u/sujiyan.lens',
                profile_uri: ['https://ipfs.io/ipfs/QmeYWaMUekPthkMnb5FMkiPLBTfu1PLkQFvZM3a7oftzNu'],
            },
        ])
    }),
]
