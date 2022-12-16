import { describe, expect, test } from 'vitest'
import { DSearchAPI } from '../../src/DSearch/index.js'

/* cspell:disable */
describe('DSearch test', () => {
    test('should return by sysmbol from specific list', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:eth')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'eth1',
            symbol: 'eth',
            type: 'FungibleToken',
            keyword: 'eth',
            pluginID: 'com.mask.evm',
        })
    })

    test('should return by name', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:eth1')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'eth1',
            symbol: 'eth',
            type: 'FungibleToken',
            keyword: 'eth1',
            pluginID: 'com.mask.evm',
        })
    })
    test('should return by fuzzy search', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:efuzzy')

        expect(result.length).toBe(2)
        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search',
            symbol: 'thefuzzy',
            type: 'FungibleToken',
            keyword: 'efuzzy',
            pluginID: 'com.mask.evm',
        })
        expect(result[1]).toStrictEqual({
            name: 'test thefuzzy search empty',
            symbol: 'fuzzy',
            type: 'FungibleToken',
            keyword: 'efuzzy',
            pluginID: 'com.mask.evm',
        })
    })
    test('should return by fuzzy search without empty string', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:searchempty')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search empty',
            symbol: 'fuzzy',
            type: 'FungibleToken',
            keyword: 'searchempty',
            pluginID: 'com.mask.evm',
        })
    })

    test('should return collection by twitter handle', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('twitter:mathcastles')

        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('Terraforms')
    })

    test('should return all the data without prefix', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('eth')

        expect(result.length).toBe(5)
        expect(result[0]?.name).toBe('eth1')
        expect(result[1]?.name).toBe('eth1')
        expect(result[2]?.name).toBe('ethInCMC')
        expect(result[3]?.name).toBe('ethInCoinGecko')
        expect(result[4]?.name).toBe('TestEth')
    })

    test('should return by searching address directly', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb')
        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('CryptoPunks')
        expect(result[0]?.address).toBe('0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb')
    })
})
