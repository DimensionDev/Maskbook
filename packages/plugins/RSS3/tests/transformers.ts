import { describe, it, expect } from 'vitest'
import { transformPlanetResource } from '../src/SiteAdaptor/components/share.js'

// cspell:disable
describe('transform planet relative resource', () => {
    it('should transform relative resource in raw', () => {
        const mockup = `
        <img width="2048" alt="pubsub" src="pubsub.png">
        <img width="2048" alt="pubsub" src="pubsub2.png">
    `
        const result = transformPlanetResource(mockup, 'https://ipfs.io/ipfs/cidcidcid')
        expect(result)
            .contains('https://ipfs.io/ipfs/cidcidcid/pubsub.png')
            .contains('https://ipfs.io/ipfs/cidcidcid/pubsub2.png')
    })

    it('should transform relative resource in plain markdown', () => {
        const mockup = `
    "![red shouldered hawk_4.jpg](red%20shouldered%20hawk_4.jpg)\n\n---\n\n![red shouldered hawk_3.jpg](red%20shouldered%20hawk_3.jpg)\n\n---\n\n![red shouldered hawk_2.jpg](red%20shouldered%20hawk_2.jpg)\n\n---\n\n![red shouldered hawk.jpg](red%20shouldered%20hawk.jpg)"
    `
        const result = transformPlanetResource(mockup, 'https://ipfs.io/ipfs/dummy-cid')
        expect(result)
            .contains('https://ipfs.io/ipfs/dummy-cid/red%20shouldered%20hawk_4.jpg')
            .contains('https://ipfs.io/ipfs/dummy-cid/red%20shouldered%20hawk_3.jpg')
    })
})
