import { type HTMLProps, memo } from 'react'
import { useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'

export const HeaderLine = memo((props: HTMLProps<HTMLElement>) => {
    const mode = useTheme().palette.mode
    const Icon = mode === 'dark' ? Icons.MaskBanner : Icons.Mask
    return (
        <header {...props}>
            <Icon width={props.width ?? 130} height={props.height ?? 40} />
        </header>
    )
})
