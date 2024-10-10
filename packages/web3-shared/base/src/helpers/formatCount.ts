// cspell:ignore millify
import { millify } from 'millify'

export function formatCount(count: number, precision: number, lowercase = false) {
    return millify(count, {
        precision,
        lowercase,
    })
}
