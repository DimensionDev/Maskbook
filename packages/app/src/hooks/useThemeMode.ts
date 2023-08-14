import { useEffect, useState } from 'react'
import { MaskMessages } from '@masknet/shared-base'
import { getThemeMode } from '../helpers/setThemeMode.js'

export function useThemeMode() {
    const [mode, setMode] = useState(getThemeMode())

    useEffect(() => MaskMessages.events.appearanceSettings.on((mode) => setMode(mode)), [])

    return mode
}
