import type { Profile, Persona } from '../database'

export function PersonaComparer(a: Persona, b: Persona): boolean {
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

export function ProfileArrayComparer(a: Profile[], b: Profile[]) {
    if (a.length !== b.length) return false
    return a.every((person, index) => {
        const target = b[index]
        if (!person.identifier.equals(target.identifier)) return false
        if (person.avatar !== target.avatar) return false
        if (person.updatedAt.getTime() !== target.updatedAt.getTime()) return false
        // logic XOR
        if (!person.linkedPersona !== !target.linkedPersona) return false
        if (person.linkedPersona && target.linkedPersona) {
            if (!PersonaComparer(person.linkedPersona, target.linkedPersona)) return false
        }
        if (person.nickname !== target.nickname) return false
        return true
    })
}
