import { beforeAll, describe, expect, test } from 'vitest'
import { EnhanceableSite } from '../../src/Site/types.js'
import {
    resolveNetworkToNextIDPlatform,
    resolveNextIDIdentityToProfile,
    resolveNextIDPlatformToNetwork,
} from '../../src/NextID/index.js'
import { NextIDPlatform } from '../../src/NextID/types.js'
import { None } from 'ts-results-es'
import { setupLegacySettingsAtBackground, setupLegacySettingsAtNonBackground } from '../../src/index.js'

async function test__getStorage<T>(key: string): Promise<any> {
    return None
}
export async function test__setStorage<T>(key: string, value: T): Promise<void> {}

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

    test('should get the undefined when giving the platform is un-sns', () => {
        const identity = resolveNextIDIdentityToProfile('fake_id', NextIDPlatform.Ethereum)
        expect(identity).toBeUndefined()
    })
    beforeAll(() => {
        setupLegacySettingsAtNonBackground(test__getStorage)
        setupLegacySettingsAtBackground(test__getStorage, test__setStorage)
    })
})
