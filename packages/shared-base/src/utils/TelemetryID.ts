import { ValueRef } from './ValueRef.js'

/** Generate a 40 length hex string */
export function generateTelemetryID() {
    return Array.from(crypto.getRandomValues(new Uint8Array(40)), (i) => (i % 16).toString(16))
        .join('')
        .slice(0, 40)
}
export const TelemetryID = new ValueRef(generateTelemetryID())
console.log(TelemetryID)
