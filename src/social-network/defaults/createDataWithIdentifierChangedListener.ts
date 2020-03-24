import { UpdateEvent } from '../../utils/messages'
import { ValueRef } from '@holoflows/kit/es'
import { Identifier } from '../../database/type'
export function createDataWithIdentifierChangedListener<
    T extends {
        identifier: Identifier
    }
>(ref: ValueRef<T[]>, filter: (x: UpdateEvent<T>) => boolean) {
    return async (events: readonly UpdateEvent<T>[]) => {
        let next = [...ref.value]
        for (const event of events.filter(filter)) {
            if (event.reason === 'delete') {
                next = next.filter((x) => !x.identifier.equals(event.of.identifier))
            } else if (event.reason === 'update') {
                next.forEach((current, index, arr) => {
                    if (current.identifier.equals(event.of.identifier)) {
                        arr[index] = event.of
                    }
                })
            } else if (event.reason === 'new') {
                next = next.filter((x) => !x.identifier.equals(event.of.identifier))
                next.push(event.of)
            } else {
                throw new Error('Invalid state')
            }
        }
        ref.value = next
    }
}
