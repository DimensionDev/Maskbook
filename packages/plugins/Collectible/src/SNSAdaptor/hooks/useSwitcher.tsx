import { useMemo } from 'react'
import { ActionButton } from '@masknet/theme'

export function useSwitcher<T extends string | number>(
    currentOption: T,
    onSwitch: (option: T) => void,
    options: T[],
    resolver: (option: T) => string,
    fullWidth?: boolean,
) {
    const nextOption = useMemo(() => {
        if (options.length === 0) return
        if (currentOption === undefined) return options[0]
        const indexOf = options.indexOf(currentOption)
        if (indexOf === -1) return
        return indexOf === options.length - 1 ? options[0] : options[indexOf + 1]
    }, [currentOption, options])

    if (options.length <= 1) return null

    if (nextOption === undefined) return null

    return (
        <ActionButton fullWidth={fullWidth} onClick={() => onSwitch(nextOption)} variant="roundedDark">
            Switch to {resolver(nextOption)}
        </ActionButton>
    )
}
