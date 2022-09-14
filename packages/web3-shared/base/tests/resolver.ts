/* cspell:disable */
import { describe, test, expect } from 'vitest'
import { resolveCrossOriginURL, resolveIPFS_URL } from '../src/utils/resolver.js'

const MASK_URL = 'https://mask.io'
const CHROME_EXTENSION_URL = 'chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/logo.png'
const MOZ_EXTENSION_URL = 'moz-extension://jkoeaghipilijlahjplgbfiocjhldnap/logo.png'
const CIDv0 = 'QmYE5ZAofUqGV7ph3owYBDTmGkZU44teCVAzLrKWwHCURM'
const CIDv1 = 'bafkreiewefwtzgekhxv5r5hnvjisypqq5jwd2lqbex4a33ahhz3663qngy'
const IMAGE_DATA_PARTIAL = 'data:image/png;base64,iVB'

describe('resolveCrossOriginURL', () => {
    test.each([
        { give: '', expected: undefined },
        { give: MASK_URL, expected: `https://cors.r2d2.to?${encodeURIComponent(MASK_URL)}` },
        { give: MASK_URL, expected: `https://cors.r2d2.to?${encodeURIComponent(MASK_URL)}` },
        { give: CHROME_EXTENSION_URL, expected: CHROME_EXTENSION_URL },
        { give: MOZ_EXTENSION_URL, expected: MOZ_EXTENSION_URL },
        { give: IMAGE_DATA_PARTIAL, expected: IMAGE_DATA_PARTIAL },
        { give: '<svg xmlns></svg>', expected: '<svg xmlns></svg>' },
    ])('.resolveCrossOriginURL', ({ give, expected }) => {
        expect(resolveCrossOriginURL(give)).toBe(expected)
    })
})

describe('resolveIPFSLink', () => {
    const cases = [CIDv0, CIDv1].flatMap((cid) => {
        return [
            { give: '', expected: '' },
            { give: cid, expected: `https://gateway.ipfscdn.io/ipfs/${cid}` },
            { give: `${cid}/image`, expected: `https://gateway.ipfscdn.io/ipfs/${cid}/image` },
            { give: `ipfs://${cid}`, expected: `https://gateway.ipfscdn.io/ipfs/${cid}` },
            { give: `ipfs://ipfs/${cid}`, expected: `https://gateway.ipfscdn.io/ipfs/${cid}` },
            { give: `https://gateway.ipfscdn.io/ipfs/${IMAGE_DATA_PARTIAL}`, expected: IMAGE_DATA_PARTIAL },
            { give: `https://gateway.ipfscdn.io/ipfs/${cid}`, expected: `https://gateway.ipfscdn.io/ipfs/${cid}` },
            { give: `https://ipfs.altava.com/ipfs/${cid}`, expected: `https://gateway.ipfscdn.io/ipfs/${cid}` },
            {
                give: `https://ipfs.altava.com/ipfs/${cid}/image`,
                expected: `https://gateway.ipfscdn.io/ipfs/${cid}/image`,
            },
            { give: MASK_URL, expected: MASK_URL },
            {
                give: `https://gateway.ipfscdn.io/ipfs/${cid}?id=67874`,
                expected: `https://gateway.ipfscdn.io/ipfs/${cid}`,
            },
            // should not trim query from non-IPFS url
            {
                give: 'https://www.companioninabox.art/api/companion.png?id=726&iteration=0',
                expected: 'https://www.companioninabox.art/api/companion.png?id=726&iteration=0',
            },
        ].map(({ give, expected }) => [
            { give, expected },
            { give: `https://cors.r2d2.to?${encodeURIComponent(give)}`, expected },
        ])
    })
    test.each(cases)('.resolveIPFSLink($give)', ({ give, expected }) => {
        expect(resolveIPFS_URL(give)).toBe(expected)
    })
})
