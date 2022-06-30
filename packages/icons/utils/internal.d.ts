import { MaskIconPalette } from './MaskIconPaletteContext.js'
export interface GeneratedIconProps<Variants extends MaskIconPalette> extends React.HTMLProps<HTMLElement> {
    variant?: Variants[] | Variants
    size?: number
    color?: string
}
