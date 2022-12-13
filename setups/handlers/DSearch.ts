import { rest } from 'msw'

const baseURL = 'https://dsearch.mask.r2d2.to'

/* cspell:disable */
export const DSearchHandlers = [
    rest.get(`${baseURL}/fungible-tokens/specific-list.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    pluginID: 'com.mask.evm',
                    name: 'eth1',
                    symbol: 'eth',
                    type: 'FungibleToken',
                },
            ]),
        )
    }),
    rest.get(`${baseURL}/non-fungible-tokens/specific-list.json`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]))
    }),
    rest.get(`${baseURL}/non-fungible-collections/specific-list.json`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]))
    }),
    rest.get(`${baseURL}/fungible-tokens/coin-gecko.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
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
            ]),
        )
    }),
    rest.get(`${baseURL}/fungible-tokens/coinmarketcap.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    pluginID: 'com.mask.evm',
                    name: 'ethInCMC',
                    symbol: 'eth',
                    type: 'FungibleToken',
                },
                {
                    pluginID: 'com.mask.evm',
                    name: 'test thefuzzy search',
                    symbol: 'thefuzzy',
                    type: 'FungibleToken',
                },
            ]),
        )
    }),
    rest.get(`${baseURL}/non-fungible-tokens/nftscan.json`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]))
    }),
    rest.get(`${baseURL}/non-fungible-collections/nftscan.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    pluginID: 'com.mask.evm',
                    address: '0x4e1f41613c9084fdb9e34e11fae9412427480e56',
                    name: 'Terraforms',
                    symbol: 'TERRAFORMS',
                    iconURL: 'https://logo.nftscan.com/logo/0x4e1f41613c9084fdb9e34e11fae9412427480e56.png',
                    tokensTotal: 9909,
                    verified: false,
                    source: 'NFTScan',
                    collection: {
                        address: '0x4e1f41613c9084fdb9e34e11fae9412427480e56',
                        name: 'Terraforms',
                        symbol: 'TERRAFORMS',
                        chain: 1,
                        socialLinks: {
                            website: 'http://mathcastles.xyz',
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
                    tokensTotal: 20000,
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
                    tokensTotal: 20000,
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
            ]),
        )
    }),
]
