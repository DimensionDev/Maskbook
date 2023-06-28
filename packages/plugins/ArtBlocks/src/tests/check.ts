import { describe, expect, it } from 'vitest'
import { artBlocksHostnames, artBlocksPathnameRegex } from '../constants.js'
import { checkUrl, getAssetInfoFromURL } from '../utils.js'

const protocols = ['', 'http://', 'https://']
const pathnames = [
    '/project/410',
    '/collections/presents/projects/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/410',
    '/collections/curated/projects/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/426',
]

describe('ArtBlocks', () => {
    it.each(pathnames)('matches pathname %s', (pathname) => {
        expect(artBlocksPathnameRegex.test(pathname)).toBeTruthy()
    })

    const urls = protocols
        .map((protocol) =>
            artBlocksHostnames
                .map((host) => `${protocol}${host}`)
                .map((origin) => pathnames.map((pathname) => `${origin}${pathname}`)),
        )
        .flat(2)

    it.each(urls)('checks url %s', (url) => {
        expect(checkUrl(url), `${url} to be a valid url`).toBeTruthy()
    })

    it.each([
        ['https://www.artblocks.io/project/410', '410'],
        [
            'https://www.artblocks.io/collections/presents/projects/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/410',
            '410',
        ],
        ['https://www.artblocks.io/collections/curated/projects/0x99a9b7c1116f9ceeb1652de04d5969cce509b069/426', '426'],
    ])('gets assets from url %s', (url, id) => {
        const result = getAssetInfoFromURL(url)
        expect(result?.project_id).toBe(id)
    })
})
