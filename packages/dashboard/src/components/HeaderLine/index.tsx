import { type FC, type HTMLProps, memo } from 'react'
import { useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'

interface Props extends HTMLProps<HTMLDivElement> {}

export const HeaderLine: FC<Props> = memo((props) => {
    const mode = useTheme().palette.mode
    const Icon = mode === 'dark' ? Icons.MaskBanner : Icons.Mask
    return (
        <header {...props}>
            <Icon width={130} height={40} />
        </header>
    )
})
