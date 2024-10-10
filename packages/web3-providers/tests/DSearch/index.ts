import { describe, expect, it, test } from 'vitest'
import { SearchResultType } from '@masknet/web3-shared-base'

/* cspell:disable */
describe('DSearch test', async () => {
    if (Math.random()) return it('', () => {}) // TODO: disabled test: this test should import masknet/shared-base-ui
    const { DSearch } = await import('../../src/DSearch/index.js')
    it('should return from specific list only', async () => {
        const result = await DSearch.search('eth')

        expect(result).toStrictEqual([
            {
                name: 'eth1',
                symbol: 'eth',
                rank: undefined,
                type: 'FungibleToken',
                pluginID: 'com.mask.evm',
                alias: undefined,
            },
        ])
    })

    it('should return by name', async () => {
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
        const result = await DSearch.search('mathcastles', SearchResultType.CollectionListByTwitterHandle)

        expect(result.length).toBe(1)
        if (result[0].type === SearchResultType.NonFungibleCollection) {
            expect(result[0].name).toBe('Terraforms')
        } else {
            expect(result[0].type).toBe(SearchResultType.NonFungibleCollection)
        }
    })

    it('should return all the data with tag prefix', async () => {
        const result = await DSearch.search('$eth')

        expect(result.length).toBe(1)
        if (result[0].type === SearchResultType.NonFungibleToken) {
            expect(result[0].name).toBe('eth1')
        } else {
            expect(result[0].type).toBe(SearchResultType.FungibleToken)
        }
    })

    test('searching lens profile', async () => {
        const result = await DSearch.search('sujiyan.lens')
        expect(result.length).toBe(1)
        if (result[0].type === SearchResultType.Domain) {
            expect(result[0].domain).toBe('sujiyan.lens')
        } else {
            expect(result[0].type).toBe(SearchResultType.Domain)
        }
    })
})
