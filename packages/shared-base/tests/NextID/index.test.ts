import { describe, expect, test } from 'vitest'
import {
    convertNetworkToNextIDPlatform,
    convertNextIDIdentityToProfile,
    convertNextIDPlatformToNetwork,
} from '../../src/NextID/index.js'
import { NextIDPlatform } from '../../src/NextID/type.js'
import { EnhanceableSite } from '../../src/Site/type.js'

describe('test next id util methods', () => {
    test('should get the ui network when give the nextID platform', () => {
        const network = convertNetworkToNextIDPlatform(EnhanceableSite.Twitter)
        expect(network).toBe(NextIDPlatform.Twitter)
    })

    test('should get the nextID platform when give the ui network', () => {
        const platform = convertNextIDPlatformToNetwork(NextIDPlatform.Twitter)
        expect(platform).toBe(EnhanceableSite.Twitter)
    })

    test('should get the profile identity', () => {
        const identity = convertNextIDIdentityToProfile('fake_id', NextIDPlatform.Twitter)
        expect(identity?.toText()).toBe('person:twitter.com/fake_id')
    })

    test('should get the undefined when giving the platform is un-sns', () => {
        const identity = convertNextIDIdentityToProfile('fake_id', NextIDPlatform.Ethereum)
        expect(identity).toBeUndefined()
    })
})
