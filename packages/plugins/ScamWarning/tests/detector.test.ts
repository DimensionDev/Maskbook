import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Detector } from '@scamsniffer/detector'

describe('inline ScamSniffer detector', () => {
    const detector = new Detector({ onlyBuiltIn: false })

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    it('checks hosts against the bundled blacklist without fetching', async () => {
        await expect(detector.checkUrlInBlacklist('https://usdt-transfer-bnb1.netlify.app/path')).resolves.toBe(true)
        await expect(detector.checkUrlInBlacklist('https://sub.usdt-transfer-bnb1.netlify.app/path')).resolves.toBe(
            false,
        )
        expect(fetch).not.toHaveBeenCalled()
    })

    it('checks addresses case-insensitively against the bundled blacklist', async () => {
        await expect(detector.checkAddressInBlacklist('0x7538FD1e30D8e7771105D470Fe8d65B6ab0Da93f')).resolves.toBe(true)
        await expect(detector.checkAddressInBlacklist('0x0000000000000000000000000000000000000000')).resolves.toBe(
            false,
        )
        expect(fetch).not.toHaveBeenCalled()
    })

    it('returns false for URLs without a parseable host', async () => {
        await expect(detector.checkUrlInBlacklist('not a URL')).resolves.toBe(false)
        await expect(detector.checkUrlInBlacklist('')).resolves.toBe(false)
        expect(fetch).not.toHaveBeenCalled()
    })
})
