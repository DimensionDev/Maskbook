import { NonFungibleCollectionResult } from '@masknet/web3-shared-base'
import { describe, expect, test } from 'vitest'
import { DSearchAPI } from '../../src/DSearch/index.js'

describe('DSearch test', () => {
    test('should return by sysmbol from specific list', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:eth')

        expect(result[0]).toStrictEqual({ name: 'eth1', symbol: 'eth', type: 'FungibleToken' })
    })

    test('should return by name', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:eth1')

        expect(result[0]).toStrictEqual({ name: 'eth1', symbol: 'eth', type: 'FungibleToken' })
    })
    test('should return by fuzzy search', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:efuzzy')

        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search',
            symbol: 'thefuzzy',
            type: 'FungibleToken',
        })
    })
    test('should return by fuzzy search without empty string', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:searchempty')

        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search empty',
            symbol: 'fuzzy',
            type: 'FungibleToken',
        })
    })

    test('should return collection by twitter handle', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('twitter:mathcastles')

        expect(result.length).toBe(1)
        expect((result[0] as NonFungibleCollectionResult<any, any>)?.name).toBe('Terraforms')
    })

    test('should return all the data wihout prefix', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('eth')

        expect(result.length).toBe(5)
        expect((result[0] as NonFungibleCollectionResult<any, any>)?.name).toBe('eth1')
        expect((result[1] as NonFungibleCollectionResult<any, any>)?.name).toBe('eth1')
        expect((result[2] as NonFungibleCollectionResult<any, any>)?.name).toBe('ethInCMC')
        expect((result[3] as NonFungibleCollectionResult<any, any>)?.name).toBe('ethInCoinGeoko')
        expect((result[4] as NonFungibleCollectionResult<any, any>)?.name).toBe('TestEth')
    })
})
