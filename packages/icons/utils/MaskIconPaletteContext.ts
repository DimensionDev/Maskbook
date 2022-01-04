import { createContext } from 'react'

export type MaskIconPalette = 'light' | 'dark' | 'dim'
export const MaskIconPaletteContext = createContext<MaskIconPalette>('dark')
