/* cspell:disable */
import { describe, test, expect } from 'vitest'
import {
    isIPFS_CID,
    isIPFS_Resource,
    resolveCrossOriginURL,
    resolveIPFS_CID,
    resolveIPFS_URL,
} from '../../src/helpers/resolver.js'

const MASK_URL = 'https://mask.io'
const CHROME_EXTENSION_URL = 'chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/logo.png'
const MOZ_EXTENSION_URL = 'moz-extension://jkoeaghipilijlahjplgbfiocjhldnap/logo.png'
const CIDv0 = 'QmYE5ZAofUqGV7ph3owYBDTmGkZU44teCVAzLrKWwHCURM'
const CIDv1 = 'bafkreiewefwtzgekhxv5r5hnvjisypqq5jwd2lqbex4a33ahhz3663qngy'
const IMAGE_DATA_PARTIAL = 'data:image/png;base64,iVB'

describe('resolveCrossOriginURL', () => {
    test.each([
        { give: '', expected: '' },
        { give: MASK_URL, expected: `https://cors-next.r2d2.to?${encodeURIComponent(MASK_URL)}` },
        { give: MASK_URL, expected: `https://cors-next.r2d2.to?${encodeURIComponent(MASK_URL)}` },
        { give: CHROME_EXTENSION_URL, expected: CHROME_EXTENSION_URL },
        { give: MOZ_EXTENSION_URL, expected: MOZ_EXTENSION_URL },
        { give: IMAGE_DATA_PARTIAL, expected: IMAGE_DATA_PARTIAL },
        { give: '<svg xmlns></svg>', expected: '<svg xmlns></svg>' },
    ])('.resolveCrossOriginURL', ({ give, expected }) => {
        expect(resolveCrossOriginURL(give)).toBe(expected)
    })
})

describe('isIPFS_CID', () => {
    const cases = [CIDv0, CIDv1].flatMap((cid) => {
        return [
            { give: cid, expected: true },
            { give: `ipfs://${cid}`, expected: false },
            { give: `ipfs://${cid}/image`, expected: false },
            { give: `https://ipfs.io/ipfs/${cid}`, expected: false },
            { give: `https://ipfs.io/ipfs/${cid}/image`, expected: false },
        ]
    })
    test.each(cases)('.isIPFS_CID($give)', ({ give, expected }) => {
        expect(isIPFS_CID(give)).toBe(expected)
    })
})

describe('isIPFS_Resource', () => {
    const cases = [CIDv0, CIDv1].flatMap((cid) => {
        return [
            { give: cid, expected: true },
            { give: `ipfs://${cid}`, expected: true },
            { give: `ipfs://${cid}/image`, expected: true },
            { give: `https://ipfs.io/ipfs/${cid}`, expected: true },
            { give: `https://ipfs.io/ipfs/${cid}/image`, expected: true },
        ]
    })
    test.each(cases)('.isIPFS_Resource($give)', ({ give, expected }) => {
        expect(isIPFS_Resource(give)).toBe(expected)
    })
})

describe('resolveIPFS_CID', () => {
    const cases = [CIDv0, CIDv1].flatMap((cid) => {
        return [
            { give: cid, expected: cid },
            { give: `ipfs://${cid}`, expected: cid },
            { give: `ipfs://${cid}/image`, expected: cid },
            { give: `https://ipfs.io/ipfs/${cid}`, expected: cid },
            { give: `https://ipfs.io/ipfs/${cid}/image`, expected: cid },
        ]
    })
    test.each(cases)('.resolveIPFS_CID($give)', ({ give, expected }) => {
        expect(resolveIPFS_CID(give)).toBe(expected)
    })
})

describe('resolveIPFS_URL', () => {
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
            {
                give: `https://ipfs.altava.com/ipfs/${cid}/image`,
                expected: `https://ipfs.io/ipfs/${cid}/image`,
            },
            {
                give: `https://ipfs.io/ipfs/${cid}`,
                expected: `https://ipfs.io/ipfs/${cid}`,
            },
            {
                give: `https://ipfs.io/ipfs/${cid}/image`,
                expected: `https://ipfs.io/ipfs/${cid}/image`,
            },
            { give: MASK_URL, expected: MASK_URL },
            {
                give: `https://ipfs.io/ipfs/${cid}?id=67874`,
                expected: `https://ipfs.io/ipfs/${cid}`,
            },
            // should not trim query from non-IPFS url
            {
                give: 'https://www.companioninabox.art/api/companion.png?id=726&iteration=0',
                expected: 'https://www.companioninabox.art/api/companion.png?id=726&iteration=0',
            },
            // the host part has a CID
            { give: `https://${cid}.ipfs.dweb.link`, expected: `https://ipfs.io/ipfs/${cid}` },
        ].map(({ give, expected }) => [
            { give, expected },
            { give: `https://cors-next.r2d2.to?${encodeURIComponent(give)}`, expected },
        ])
    })
    test.each(cases)('.resolveIPFS_URL($give)', ({ give, expected }) => {
        expect(resolveIPFS_URL(give)).toBe(expected)
    })
})
