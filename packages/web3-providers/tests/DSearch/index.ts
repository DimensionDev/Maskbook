import { FungibleTokenResult, NonFungibleCollectionResult } from '@masknet/web3-shared-base'
import { describe, expect, test } from 'vitest'
import { DSearchAPI } from '../../src/DSearch/index.js'

/* cspell:disable */
describe('DSearch test', () => {
    test('should return by sysmbol from specific list', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.searchToken('token:eth')

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
        const result = await DSearch.searchToken('token:eth1')

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
        const result = await DSearch.searchToken('token:efuzzy')

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
        const result = await DSearch.searchToken('token:searchempty')

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
        const result = await DSearch.searchToken('twitter:mathcastles')

        expect(result.length).toBe(1)
        expect((result[0] as NonFungibleCollectionResult<any, any>)?.name).toBe('Terraforms')
    })

    test('should return all the data without prefix', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.searchToken('eth')

        expect(result.length).toBe(5)
        expect((result[0] as FungibleTokenResult<any, any>)?.name).toBe('eth1')
        expect((result[1] as FungibleTokenResult<any, any>)?.name).toBe('eth1')
        expect((result[2] as FungibleTokenResult<any, any>)?.name).toBe('ethInCMC')
        expect((result[3] as FungibleTokenResult<any, any>)?.name).toBe('ethInCoinGecko')
        expect((result[4] as NonFungibleCollectionResult<any, any>)?.name).toBe('TestEth')
    })
})
