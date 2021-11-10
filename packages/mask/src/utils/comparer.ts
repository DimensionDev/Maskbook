import type { Persona } from '../database'

function PersonaComparer(a: Persona, b: Persona): boolean {
    if (a.createdAt.getTime() !== b.createdAt.getTime()) return false
    if (a.updatedAt.getTime() !== b.updatedAt.getTime()) return false
    if (a.fingerprint !== b.fingerprint) return false
    if (a.hasPrivateKey !== b.hasPrivateKey) return false
    if (!a.identifier.equals(b.identifier)) return false
    // simple check
    if (a.linkedProfiles.size !== b.linkedProfiles.size) return false
    if (a.nickname !== b.nickname) return false
    return true
}

export function PersonaArrayComparer(a: Persona[], b: Persona[]) {
    if (a.length !== b.length) return false
    if (Object.getOwnPropertySymbols(a) || Object.getOwnPropertySymbols(b)) return false
    return a.every((persona, index) => PersonaComparer(persona, b[index]))
}
