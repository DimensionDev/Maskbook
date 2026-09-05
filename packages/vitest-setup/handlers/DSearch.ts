import { http, HttpResponse } from 'msw'

const baseURL = 'https://dsearch.mask.r2d2.to'

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
]
