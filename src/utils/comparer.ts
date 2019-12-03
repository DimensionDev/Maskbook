import { Group, Person } from '../database'

export const PersonArrayComparer = (a: Person[], b: Person[]) => {
    if (a.length !== b.length) return false
    return a.every((person, index) => {
        const target = b[index]
        if (!person.identifier.equals(target.identifier)) return false
        if (person.avatar !== target.avatar) return false
        if (person.fingerprint !== target.fingerprint) return false
        if (person.groups.length !== target.groups.length) return false
        if (person.nickname !== target.nickname) return false
        if (person.previousIdentifiers?.length !== target.previousIdentifiers?.length) return false
        if (!person.groups.every((group, index) => target.groups[index].equals(group))) return false
        return true
    })
}

export function GroupArrayComparer(a: Group[], b: Group[]) {
    if (a.length !== b.length) return false
    return a.every((group, index) => {
        const target = b[index]
        if (!group.identifier.equals(target.identifier)) return false
        if (group.avatar !== target.avatar) return false
        if (group.banned !== target.banned) return false
        if (group.groupName !== target.groupName) return false
        if (group.members.length !== target.members.length) return false
        if (!group.members.every((person, index) => target.members[index].equals(person))) return false
        return true
    })
}
