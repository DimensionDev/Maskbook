import { useState } from 'react'
import { useInterval } from 'react-use'
import { Appearance } from '@masknet/theme'
import { getMaskbookTheme } from '../../../utils/theme'
import { isDarkTheme } from '../../../utils/theme-tools'
export function useThemeFacebook() {
    const [theme, setTheme] = useState(getTheme())
    const updateTheme = () => setTheme(getTheme())
    // TODO: it's buggy.
    useInterval(updateTheme, 2000)
    return theme
}

function getTheme() {
    return getMaskbookTheme({ appearance: isDarkTheme() ? Appearance.dark : Appearance.light })
}
