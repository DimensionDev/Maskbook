import { MaskIconPalette } from './MaskIconPaletteContext.js'
import { SxProps, Theme } from '@mui/material'
export interface GeneratedIconProps<Variants extends MaskIconPalette> extends GeneratedIconNonSquareProps<Variants> {
    size?: number
}

export interface GeneratedIconNonSquareProps<Variants extends MaskIconPalette> extends React.HTMLProps<HTMLElement> {
    variant?: Variants[] | Variants
    height?: number
    width?: number
    color?: string
    sx?: SxProps<Theme>
}
