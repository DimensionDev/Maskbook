import React from 'react'
import { ValueRef } from '@holoflows/kit/es/util/ValueRef'
import { MessageCenter } from '../../utils/messages'
import { ListItem, ListItemText, ListItemSecondaryAction, Switch } from '@material-ui/core'
import { useValueRef } from '../../utils/hooks/useValueRef'

interface SettingsTexts {
    primary: string
    secondary?: string
}
const texts = new WeakMap<ValueRef<unknown>, SettingsTexts>()
export function createNewSettings<T extends browser.storage.StorageValue>(
    key: string,
    initialValue: T,
    UITexts: SettingsTexts,
) {
    const settings = new ValueRef(initialValue)
    texts.set(settings, UITexts)

    update()
    settings.addListener(async newVal => {
        const stored = ((await browser.storage.local.get()).settings as object) || {}
        browser.storage.local.set({
            settings: { ...stored, [key]: newVal },
        })
        MessageCenter.emit('settingsUpdated', undefined)
    })
    MessageCenter.on('settingsUpdated', update)
    async function update() {
        if (typeof browser === 'object') {
            const value = await browser.storage.local.get()
            const stored = value.settings
            if (typeof stored === 'object' && stored !== null && Reflect.has(stored, key)) {
                settings.value = Reflect.get(stored, key)
            }
        }
    }
    return settings
}

export function useSettingsUI(settingsRef: ReturnType<typeof createNewSettings>) {
    const currentValue = useValueRef(settingsRef)
    const text = texts.get(settingsRef)!
    function ui() {
        switch (typeof currentValue) {
            case 'boolean':
                return (
                    <ListItem button onClick={() => (settingsRef.value = !settingsRef.value)}>
                        <ListItemText id={text.primary} primary={text.primary} secondary={text.secondary} />
                        <ListItemSecondaryAction>
                            <Switch
                                inputProps={{ 'aria-labelledby': text.primary }}
                                edge="end"
                                checked={currentValue}
                                onClick={() => (settingsRef.value = !settingsRef.value)}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                )
            default:
                throw new Error('Invalid settings')
        }
    }
    return ui()
}
