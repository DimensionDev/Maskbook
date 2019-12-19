import { GetContext, ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { MessageCenter } from '../../utils/messages'

// This file is share between context. prevent loading in the background.
const { ListItem, ListItemText, ListItemSecondaryAction, Switch } = (GetContext() === 'background'
    ? {}
    : require('@material-ui/core')) as typeof import('@material-ui/core')

interface SettingsTexts {
    primary: string
    secondary?: string
}
const texts = new WeakMap<ValueRef<any>, SettingsTexts>()

function createInternalSettings<T extends browser.storage.StorageValue>(
    storage: string,
    key: string,
    initialValue: T,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = new ValueRef(initialValue, comparer)
    const instanceKey = `${storage}+${key}`
    update(instanceKey)
    settings.addListener(async newVal => {
        const stored = ((await browser.storage.local.get())[storage] as object) || {}
        await browser.storage.local.set({
            [storage]: { ...stored, [key]: newVal },
        })
        MessageCenter.emit('settingsUpdated', instanceKey)
    })
    MessageCenter.on('settingsUpdated', update)
    async function update(receivedKey: string) {
        if (receivedKey !== instanceKey) return
        if (typeof browser === 'object') {
            const value = await browser.storage.local.get()
            const stored = value[storage]
            if (typeof stored === 'object' && stored !== null && key in (stored as any)) {
                settings.value = Reflect.get(stored, key)
            }
        }
    }
    return settings
}

export function createNewSettings<T extends browser.storage.StorageValue>(
    key: string,
    initialValue: T,
    UITexts: SettingsTexts,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = createInternalSettings('settings', key, initialValue, comparer)
    texts.set(settings, UITexts)
    return settings
}

export function createNetworkSpecificSettings<T extends browser.storage.StorageValue>(
    network: string,
    key: string,
    initialValue: T,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    return createInternalSettings(network, key, initialValue, comparer)
}

export function useSettingsUI<T>(settingsRef: ValueRef<T>) {
    const currentValue = useValueRef(settingsRef)
    const text = texts.get(settingsRef)!
    function ui() {
        if (GetContext() === 'background') throw new TypeError('No render in background page')
        switch (typeof currentValue) {
            case 'boolean':
                const ref = (settingsRef as ValueRef<unknown>) as ValueRef<boolean>
                return (
                    <ListItem button onClick={() => (ref.value = !ref.value)}>
                        <ListItemText id={text.primary} primary={text.primary} secondary={text.secondary} />
                        <ListItemSecondaryAction>
                            <Switch
                                inputProps={{ 'aria-labelledby': text.primary }}
                                edge="end"
                                checked={currentValue}
                                onClick={() => (ref.value = !ref.value)}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                )
            default:
                throw new Error('Not implemented yet')
        }
    }
    return ui()
}
