import { CrossIsolationMessages, asyncIteratorToArray } from '@masknet/shared-base'
import { PluginDB } from '../../../database/Plugin.db.js'

export interface Contact {
    id: string
    name: string
}

export interface ContactRecord {
    type: 'contact'
    /** address */
    id: string
    name: string
}

function recordToContact(record: ContactRecord): Contact {
    return {
        id: record.id,
        name: record.name,
    }
}

export async function getContacts() {
    const contacts = (await asyncIteratorToArray(PluginDB.iterate('contact'))).map((x) => x.value)

    return contacts.map(recordToContact)
}

export async function getContact(id: string) {
    const record = await PluginDB.get('contact', id)
    return record ? recordToContact(record) : null
}

export async function addContact(contact: Contact) {
    await PluginDB.add({
        type: 'contact',
        ...contact,
    })
    CrossIsolationMessages.events.contactsUpdated.sendToAll(undefined)
}

export async function updateContact(id: string, updates: Contact) {
    const oldContact = await PluginDB.get('contact', id)
    if (!oldContact) throw new Error("Contact doesn't exist")

    await PluginDB.remove('contact', id)
    await addContact(updates)
    CrossIsolationMessages.events.contactsUpdated.sendToAll(undefined)
}

export async function deleteContact(id: string) {
    await PluginDB.remove('contact', id)
    CrossIsolationMessages.events.contactsUpdated.sendToAll(undefined)
}
