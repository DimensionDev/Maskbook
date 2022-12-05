import { describe, expect, test } from 'vitest'
import { DSearchAPI } from '../../src/DSearch/index.js'

describe('DSearch test', () => {
    test('should return by sysmbol from specific list', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:eth')

        expect(result[0]).toStrictEqual({ name: 'eth1', symbol: 'eth' })
    })

    test('should return by name', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:eth1')

        expect(result[0]).toStrictEqual({ name: 'eth1', symbol: 'eth' })
    })
    test('should return by fuzzy search', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:efuzzy')

        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search',
            symbol: 'thefuzzy',
        })
    })
    test('should return by fuzzy search without empty string', async () => {
        const DSearch = new DSearchAPI()
        const result = await DSearch.search('token:searchempty')

        expect(result[0]).toStrictEqual({
            name: 'test thefuzzy search empty',
            symbol: 'fuzzy',
        })
    })
})
