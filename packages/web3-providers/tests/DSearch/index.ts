import { describe, expect, test } from 'vitest'
import { NonFungibleCollectionResult, NonFungibleTokenResult } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DSearchAPI } from '../../src/DSearch/index.js'

/* cspell:disable */
describe('DSearch test', () => {
    test('should return from specific list only', async () => {
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

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search',
            symbol: 'thefuzzy',
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
        const result = (await DSearch.search('twitter:mathcastles')) as Array<
            NonFungibleCollectionResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >

        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('Terraforms')
    })

    test('should return all the data with tag prefix', async () => {
        const DSearch = new DSearchAPI()
        const result = (await DSearch.search('$eth')) as Array<
            NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >

        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('eth1')
    })
})
