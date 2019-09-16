import { ValueRef } from '@holoflows/kit/es/util/ValueRef'
import { MessageCenter } from '../../utils/messages'
export const debugModeSetting = new ValueRef(false)
update()

debugModeSetting.addListener(newVal => {
    MessageCenter.emit('settingsUpdated', undefined)
    browser.storage.local.set({
        debugMode: newVal,
    })
})

MessageCenter.on('settingsUpdated', update)

function update() {
    if (typeof browser === 'object') {
        browser.storage.local.get().then(value => (debugModeSetting.value = !!value.debugMode))
    }
}
