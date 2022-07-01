import { MaskIconPalette } from './MaskIconPaletteContext.js'
import { SxProps, Theme } from '@mui/material'
export interface GeneratedIconProps<Variants extends MaskIconPalette> extends React.HTMLProps<HTMLElement> {
    variant?: Variants[] | Variants
    size?: number
    color?: string
    sx?: SxProps<Theme>
}
