import React from 'react'
import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { Person } from '../../database'
import { PersonIdentifier, GroupIdentifier, PostIdentifier } from '../../database/type'

const ref = new ValueRef<Person[]>([])
Services.People.queryPeople('facebook.com').then(p => (ref.value = p))
MessageCenter.on('newPerson', person => {
    person.groups.forEach(group => Object.setPrototypeOf(group, GroupIdentifier.prototype))
    person.previousIdentifiers &&
        person.previousIdentifiers.forEach(id => Object.setPrototypeOf(id, PersonIdentifier.prototype))
    Object.setPrototypeOf(person.identifier, PersonIdentifier.prototype)
    const old = ref.value.filter(x => !x.identifier.equals(person.identifier))
    ref.value = [...old, person]
})
export function usePeople() {
    const [people, setPeople] = React.useState<Person[]>(ref.value)
    React.useEffect(() => ref.addListener(val => setPeople(val)), [])
    return people
}

export const MyIdentityContext = React.createContext<Person | null>(null)
