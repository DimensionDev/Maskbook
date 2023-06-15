import { describe, beforeAll } from 'vitest'
import { setupLegacySettingsAtNonBackground } from './createSettings.js'
import { None } from 'ts-results-es'

async function test__getStorage<T>(key: string): Promise<any> {
    return None
}

describe('legacy-settings', () => {
    beforeAll(() => {
        setupLegacySettingsAtNonBackground(test__getStorage)
    })
})
