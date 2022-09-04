/* cspell:disable */
import { describe, test, expect } from 'vitest'
import { resolveCORSLink, resolveIPFSLink } from '../src/utils/resolver'

const MASK_URL = 'https://mask.io'
const CHROME_EXTENSION_URL = 'chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/logo.png'
const MOZ_EXTENSION_URL = 'moz-extension://jkoeaghipilijlahjplgbfiocjhldnap/logo.png'
const CIDv0 = 'QmYE5ZAofUqGV7ph3owYBDTmGkZU44teCVAzLrKWwHCURM'
const CIDv1 = 'bafkreiewefwtzgekhxv5r5hnvjisypqq5jwd2lqbex4a33ahhz3663qngy'
const IMAGE_DATA_PARTIAL = 'data:image/png;base64,iVB'

describe('resolveCORSLink', () => {
    test.each([
        { give: '', expected: '' },
        { give: MASK_URL, expected: `https://cors.r2d2.to?${encodeURIComponent(MASK_URL)}` },
        { give: MASK_URL, expected: `https://cors.r2d2.to?${encodeURIComponent(MASK_URL)}` },
        { give: CHROME_EXTENSION_URL, expected: CHROME_EXTENSION_URL },
        { give: MOZ_EXTENSION_URL, expected: MOZ_EXTENSION_URL },
        { give: IMAGE_DATA_PARTIAL, expected: IMAGE_DATA_PARTIAL },
        { give: '<svg xmlns></svg>', expected: '<svg xmlns></svg>' },
    ])('.resolveCORSLink', ({ give, expected }) => {
        expect(resolveCORSLink(give)).toBe(expected)
    })
})

describe('resolveIPFSLink', () => {
    const cases = [CIDv0, CIDv1].flatMap((cid) => {
        return [
            { give: '', expected: '' },
            { give: cid, expected: `https://ipfs.io/ipfs/${cid}` },
            { give: `${cid}/image`, expected: `https://ipfs.io/ipfs/${cid}/image` },
            { give: `ipfs://${cid}`, expected: `https://ipfs.io/ipfs/${cid}` },
            { give: `ipfs://ipfs/${cid}`, expected: `https://ipfs.io/ipfs/${cid}` },
            { give: `https://ipfs.io/ipfs/${IMAGE_DATA_PARTIAL}`, expected: IMAGE_DATA_PARTIAL },
            { give: `https://ipfs.io/ipfs/${cid}`, expected: `https://ipfs.io/ipfs/${cid}` },
            { give: `https://ipfs.altava.com/ipfs/${cid}`, expected: `https://ipfs.io/ipfs/${cid}` },
            { give: `https://ipfs.altava.com/ipfs/${cid}/image`, expected: `https://ipfs.io/ipfs/${cid}/image` },
            { give: MASK_URL, expected: MASK_URL },
        ].map(({ give, expected }) => [
            { give, expected },
            { give: `https://cors.r2d2.to?${encodeURIComponent(give)}`, expected },
        ])
    })
    test.each(cases)('.resolveIPFSLink($give)', ({ give, expected }) => {
        expect(resolveIPFSLink(give)).toBe(expected)
    })
})
