import { ValueRef } from '@masknet/shared-base'

/** Generate a 40 length hex string */
function generateTelemetryID() {
    return Array.from(crypto.getRandomValues(new Uint8Array(40)), (i) => (i % 16).toString(16))
        .join('')
        .slice(0, 40)
}

export const TelemetryID = new ValueRef(generateTelemetryID())
