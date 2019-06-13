import React from 'react'
import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'
import { Person } from '../../database'

const ref = new ValueRef<Person[]>([])
Services.People.queryPeople('facebook.com').then(p => (ref.value = p))
MessageCenter.on('newPerson', p => {
    const old = ref.value.filter(x => !x.identifier.equals(p.identifier))
    ref.value = [...old, p]
})
export function usePeople() {
    const [people, setPeople] = React.useState<Person[]>(ref.value)
    React.useEffect(() => ref.addListener(val => setPeople(val)), [])
    return people
}

export const MyIdentityContext = React.createContext<Person | null>(null)
