import { MaskIconPalette } from './MaskIconPaletteContext.js'
import { SxProps, Theme } from '@mui/material'
import type { ComponentType } from 'react'

export interface GeneratedIconProps<Variants extends MaskIconPalette = never>
    extends GeneratedIconNonSquareProps<Variants> {
    size?: number
}

export type GeneratedIcon = ComponentType<GeneratedIconProps>

export interface GeneratedIconNonSquareProps<Variants extends MaskIconPalette = never>
    extends React.HTMLProps<HTMLElement> {
    variant?: Variants[] | Variants
    height?: number | string
    width?: number | string
    color?: string
    sx?: SxProps<Theme>
}
