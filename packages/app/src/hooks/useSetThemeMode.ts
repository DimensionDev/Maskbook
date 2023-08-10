import { useCallback } from 'react'
import { type Appearance } from '@masknet/public-api'
import { useSystemPreferencePalette } from '@masknet/theme'
import { setThemeMode } from '../helpers/setThemeMode.js'

export function useSetThemeMode() {
    const systemMode = useSystemPreferencePalette()
    return useCallback((mode: Appearance) => setThemeMode(mode, systemMode), [systemMode])
}
