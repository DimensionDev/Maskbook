import { describe, expect, it, test } from 'vitest'
import { SearchResultType } from '@masknet/web3-shared-base'
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
        const result = await DSearch.search('mathcastles', SearchResultType.CollectionListByTwitterHandler)

        expect(result.length).toBe(1)
        if (result[0].type === SearchResultType.NonFungibleCollection) {
            expect(result[0].name).toBe('Terraforms')
        } else {
            expect(result[0].type).toBe(SearchResultType.NonFungibleCollection)
        }
    })

    it('should return all the data with tag prefix', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('$eth')

        expect(result.length).toBe(1)
        if (result[0].type === SearchResultType.NonFungibleToken) {
            expect(result[0].name).toBe('eth1')
        } else {
            expect(result[0].type).toBe(SearchResultType.FungibleToken)
        }
    })

    test('searching lens profile', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('sujiyan.lens')
        expect(result.length).toBe(1)
        if (result[0].type === SearchResultType.Domain) {
            expect(result[0].domain).toBe('sujiyan.lens')
        } else {
            expect(result[0].type).toBe(SearchResultType.Domain)
        }
    })
})
