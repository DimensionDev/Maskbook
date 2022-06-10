import { useMemo, useCallback } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import type { InternalSettings } from '../../settings/createSettings'
import { useTheme } from '@mui/material'

export function useSettingsSwitcher<T extends string | number, S extends InternalSettings<T>>(
    settings: S,
    options: T[],
    resolver: (option: T) => string,
) {
    const currentOption = useValueRef(settings)
    const nextOption = useMemo(() => {
        if (options.length === 0) return
        if (typeof currentOption === 'undefined') return options[0]
        const indexOf = options.indexOf(currentOption)
        if (indexOf === -1) return
        return indexOf === options.length - 1 ? options[0] : options[indexOf + 1]
    }, [currentOption, options])
    const onSwitch = useCallback(() => {
        if (typeof nextOption !== 'undefined') settings.value = nextOption
    }, [nextOption])

    if (options.length <= 1) return null

    if (typeof nextOption === 'undefined') return null

    return (
        <ActionButton sx={{ marginTop: 1 }} color="primary" variant="contained" onClick={onSwitch}>
            Switch to {resolver(nextOption)}
        </ActionButton>
    )
}

export function useSwitcher<T extends string | number>(
    currentOption: T,
    onSwitch: (option: T) => void,
    options: T[],
    resolver: (option: T) => string,
    fullWidth?: boolean,
) {
    const theme = useTheme()
    const nextOption = useMemo(() => {
        if (options.length === 0) return
        if (typeof currentOption === 'undefined') return options[0]
        const indexOf = options.indexOf(currentOption)
        if (indexOf === -1) return
        return indexOf === options.length - 1 ? options[0] : options[indexOf + 1]
    }, [currentOption, options])

    if (options.length <= 1) return null

    if (typeof nextOption === 'undefined') return null

    return (
        <ActionButton
            fullWidth={fullWidth}
            sx={{
                marginTop: 1,
                backgroundColor: theme.palette.maskColor?.dark,
                '&:hover': {
                    backgroundColor: theme.palette.maskColor?.dark,
                },
                color: 'white',
            }}
            variant="contained"
            onClick={() => onSwitch(nextOption)}>
            Switch to {resolver(nextOption)}
        </ActionButton>
    )
}
