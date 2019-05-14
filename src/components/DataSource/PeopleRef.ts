import React from 'react'
import { Person } from '../../extension/background-script/PeopleService'
import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'
import Services from '../../extension/service'

const ref = new ValueRef<Person[]>([])
Services.People.queryPeople().then(p => (ref.value = p))
MessageCenter.on('newPerson', p => {
    const old = ref.value.filter(x => x.username !== p.username)
    ref.value = [...old, p]
})
export function usePeople() {
    const [people, setPeople] = React.useState<Person[]>(ref.value)
    React.useEffect(() => ref.addListener(val => setPeople(val.filter(x => x.username !== '$self'))), [])
    return people
}
