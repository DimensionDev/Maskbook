import { attemptUntil } from '../src/utils/function.js'
import { expect, describe, it } from 'vitest'

describe('utils attemptUntil function test', function () {
    it('should return first promise result which is success', async () => {
        const p1 = () => Promise.resolve(1)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], null, false)

        expect(result).toBe(1)
    })

    it('should return second promise result which is success', async () => {
        const p1 = () => Promise.reject(1)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], null, false)

        expect(result).toBe(2)
    })

    it('should return second promise result when first result is undefined', async () => {
        const p1 = () => Promise.resolve(undefined)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], null, false)

        expect(result).toBe(2)
    })

    it('should return undefined promise result when first result is undefined and in strict mode', async () => {
        const p1 = () => Promise.resolve(undefined)
        const p2 = () => Promise.resolve(2)
        const result = await attemptUntil([p1, p2], undefined, true)

        expect(result).toBe(undefined)
    })

    it('should use fallback result when first result is undefined and in strict mode', async () => {
        const p1 = () => Promise.resolve(undefined)
        const p2 = () => Promise.resolve(2)
        const fallback = 3

        const result = await attemptUntil([p1, p2], fallback, true)

        expect(result).toBe(3)
    })

    it('should throw error when all the promise rejected', async () => {
        const p1 = () => Promise.reject()
        const p2 = () => Promise.reject()

        await expect(attemptUntil([p1, p2], undefined)).rejects.toThrowError('At least one of the attempts fails.')
    })
})
