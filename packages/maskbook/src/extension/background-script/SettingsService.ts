import type { InternalSettings } from '../../settings/createSettings'
import { appearanceSettings } from '../../settings/settings'

function create<T>(settings: InternalSettings<T>) {
    async function get() {
        await settings.readyPromise
        return settings.value
    }
    async function set(val: T) {
        await settings.readyPromise
        settings.value = val
    }
    return [get, set] as const
}

export const [getTheme, setTheme] = create(appearanceSettings)
