import { describe, it, expect } from 'vitest'
import { transformPlanetResource } from '../src/SNSAdaptor/components/share.js'

describe('markdown ipfs url transformer', () => {
    it('should transform ipfs into http url', () => {
        // cspell:disable
        const mockup = `
        <img width="2048" alt="pubsub" src="pubsub.png">
    `
        const result = transformPlanetResource(mockup, 'https://ipfs.io/ipfs/cidcidcid')
        console.log(result)
        expect(result).contains('https://ipfs.io/ipfs/cidcidcid/pubsub.png')
    })
})
