import { TelemetryID } from '@masknet/shared-base'

/**
 * Return a seed (0~maximum) based on the TelemetryID.
 * @param maximum The maximum seed expected (default 2 ** 32, which is 0~4294967296)
 */

export function getABTestSeed(maximum = 2 ** 32): number {
    const number = Number.parseInt(TelemetryID.value.slice(0, 16), 16)
    if (Number.isNaN(number)) return 0
    return number % maximum
}
