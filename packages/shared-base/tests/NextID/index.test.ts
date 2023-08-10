import { describe, expect, test } from 'vitest'
import { EnhanceableSite } from '../../src/Site/types.js'
import { NextIDPlatform } from '../../src/NextID/types.js'
import {
    resolveNetworkToNextIDPlatform,
    resolveNextIDIdentityToProfile,
    resolveNextIDPlatformToNetwork,
} from '../../src/NextID/index.js'

describe('test next id util methods', () => {
    test('should get the ui network when give the nextID platform', () => {
        const network = resolveNetworkToNextIDPlatform(EnhanceableSite.Twitter)
        expect(network).toBe(NextIDPlatform.Twitter)
    })

    test('should get the nextID platform when give the ui network', () => {
        const platform = resolveNextIDPlatformToNetwork(NextIDPlatform.Twitter)
        expect(platform).toBe(EnhanceableSite.Twitter)
    })

    test('should get the profile identity', () => {
        const identity = resolveNextIDIdentityToProfile('fake_id', NextIDPlatform.Twitter)
        expect(identity?.toText()).toBe('person:twitter.com/fake_id')
    })

    test('should get the undefined when giving the platform is not a sns', () => {
        const identity = resolveNextIDIdentityToProfile('fake_id', NextIDPlatform.Ethereum)
        expect(identity).toBeUndefined()
    })
})
