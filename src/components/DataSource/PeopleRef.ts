import React from 'react'
import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { Person } from '../../database'
import { PersonIdentifier, GroupIdentifier } from '../../database/type'
import { useValueRef } from '../../utils/hooks/useValueRef'

const ref = new ValueRef<Person[]>([])
function hasFingerprint(x: Person) {
    return !!x.fingerprint
}
Services.People.queryPeople('facebook.com').then(p => (ref.value = p.filter(hasFingerprint)))
MessageCenter.on('newPerson', person => {
    person.groups.forEach(group => Object.setPrototypeOf(group, GroupIdentifier.prototype))
    person.previousIdentifiers &&
        person.previousIdentifiers.forEach(id => Object.setPrototypeOf(id, PersonIdentifier.prototype))
    Object.setPrototypeOf(person.identifier, PersonIdentifier.prototype)
    const old = ref.value.filter(x => !x.identifier.equals(person.identifier))
    ref.value = [...old, person].filter(hasFingerprint)
})
export function usePeople() {
    return useValueRef(ref)
}

export const MyIdentityContext = React.createContext<Person | null>(null)
