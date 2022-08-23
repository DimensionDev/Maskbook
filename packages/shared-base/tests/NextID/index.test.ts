import { describe, expect, test } from 'vitest'
import {
    EnhanceableSite,
    NextIDPlatform,
    networkToNextIDPlatform,
    nextIDIdentityToProfile,
    nextIDPlatformToNetwork,
} from '../../src'

describe('test next id util methods', () => {
    test('should get the ui network when give the nextID platform', () => {
        const network = networkToNextIDPlatform(EnhanceableSite.Twitter)
        expect(network).toBe(NextIDPlatform.Twitter)
    })

    test('should get the nextID platform when give the ui network', () => {
        const platform = nextIDPlatformToNetwork(NextIDPlatform.Twitter)
        expect(platform).toBe(EnhanceableSite.Twitter)
    })

    test('should get the profile identity', () => {
        const identity = nextIDIdentityToProfile('fake_id', NextIDPlatform.Twitter)
        expect(identity.toText()).toBe('person:twitter.com/fake_id')
    })
})
