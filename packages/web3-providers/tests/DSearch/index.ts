import { describe, expect, it, test } from 'vitest'
import {
    type DomainResult,
    type NonFungibleCollectionResult,
    type NonFungibleTokenResult,
    SearchResultType,
} from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DSearchAPI } from '../../src/DSearch/index.js'

/* cspell:disable */
describe('DSearch test', () => {
    it('should return from specific list only', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('eth')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'eth1',
            symbol: 'eth',
            rank: undefined,
            type: 'FungibleToken',
            pluginID: 'com.mask.evm',
            alias: undefined,
        })
    })

    it('should return by name', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('eth1')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'eth1',
            symbol: 'eth',
            rank: undefined,
            type: 'FungibleToken',
            keyword: 'eth1',
            pluginID: 'com.mask.evm',
            alias: undefined,
        })
    })
    it('should return by fuzzy search', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('efuzzy')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search',
            symbol: 'thefuzzy',
            type: 'FungibleToken',
            keyword: 'efuzzy',
            pluginID: 'com.mask.evm',
        })
    })
    it('should return by fuzzy search without empty string', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('searchempty')

        expect(result.length).toBe(1)
        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search empty',
            symbol: 'fuzzy',
            type: 'FungibleToken',
            keyword: 'searchempty',
            pluginID: 'com.mask.evm',
        })
    })

    it('should return collection by twitter handle', async () => {
        const DSearch = new DSearchAPI()
        const result = (await DSearch.search('mathcastles', SearchResultType.CollectionListByTwitterHandler)) as Array<
            NonFungibleCollectionResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >

        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('Terraforms')
    })

    it('should return all the data with tag prefix', async () => {
        const DSearch = new DSearchAPI()
        const result = (await DSearch.search('$eth')) as Array<
            NonFungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >

        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('eth1')
    })

    test('searching lens profile', async () => {
        const DSearch = new DSearchAPI()
        const result = (await DSearch.search('sujiyan.lens')) as Array<DomainResult<Web3Helper.ChainIdAll>>
        expect(result.length).toBe(1)
        expect(result[0].domain).toBe('sujiyan.lens')
    })
})
