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
]
