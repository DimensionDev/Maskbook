import { rest } from 'msw'
const baseURL = 'http://mask.io'

export const DSearchHandlers = [
    rest.get(`${baseURL}/output/fungible-tokens/specific-list.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    name: 'eth1',
                    symbol: 'eth',
                },
            ]),
        )
    }),
    rest.get(`${baseURL}/output/fungible-tokens/coin-geoko.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    name: 'ethInCoinGeoko',
                    symbol: 'eth',
                },
                {
                    name: 'test thefuzzy search empty',
                    symbol: 'fuzzy',
                },
            ]),
        )
    }),
    rest.get(`${baseURL}/output/fungible-tokens/coinmarketcap.json`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    name: 'ethInCMC',
                    symbol: 'eth',
                },
                {
                    name: 'test thefuzzy search',
                    symbol: 'thefuzzy',
                },
            ]),
        )
    }),
]
