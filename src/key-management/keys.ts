import { getMyPrivateKey, storeKey, getAllKeys, PersonCryptoKey } from './db'
import * as db from './db'
import React, { Context } from 'react'
import { Person } from '../components/InjectedComponents/SelectPeopleSingle'
import { queryAvatar } from './avatar-db'
import { MessageCenter } from '../utils/messages'

export async function generateMyKey(): Promise<PersonCryptoKey> {
    const has = await getMyPrivateKey()
    if (has) throw new TypeError('You already have a key-pair!')

    // tslint:disable-next-line: await-promise
    const mine = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    await storeKey({ username: '$self', key: mine })
    return (await db.queryPersonCryptoKey('$self'))!
}

let updateState: any
async function update() {
    const avataredKeys = await Promise.all(
        (await getAllKeys()).map<Promise<Person>>(async x => {
            return { ...x, avatar: await queryAvatar(x.username) }
        }),
    )
    updateState(avataredKeys)
}
update()
MessageCenter.on('newKeyStored', () => {
    update()
})
const Context = React.createContext([] as Person[])
export const KeysProvider: React.FC = props => {
    const [s, x] = React.useState([] as Person[])
    updateState = x
    return React.createElement(Context.Provider, { value: s.filter(x => x.username !== '$self'), ...props })
}
export const KeysConsumer = Context.Consumer

Object.assign(window, { generateMyKey, db })
