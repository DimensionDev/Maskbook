import { ValueRef } from '@holoflows/kit/es/util/ValueRef'
import { MessageCenter } from '../../utils/messages'

export function createNewSettings<T extends browser.storage.StorageValue>(key: string, initialValue: T) {
    const settings = new ValueRef(initialValue)

    update()
    settings.addListener(newVal => {
        MessageCenter.emit('settingsUpdated', undefined)
        browser.storage.local.set({
            settings: { [key]: newVal },
        })
    })
    MessageCenter.on('settingsUpdated', update)
    async function update() {
        if (typeof browser === 'object') {
            const value = await browser.storage.local.get()
            const stored = value.settings
            if (typeof stored === 'object' && stored !== null && key in (stored as any)) {
                settings.value = Reflect.get(stored, key)
            }
        }
    }
    return settings
}
