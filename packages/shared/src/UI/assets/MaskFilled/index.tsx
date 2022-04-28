import { useTheme } from '@mui/material'

export function MaskFilledIcon(props: { size: number }) {
    const theme = useTheme()
    const icon = new URL('./maskFilledIcon.png', import.meta.url).toString()
    const icon_dark = new URL('./maskFilledIconDark.png', import.meta.url).toString()
    return (
        <img
            src={theme.palette.mode === 'light' ? icon : icon_dark}
            style={{ width: props.size, height: props.size }}
        />
    )
}
