import { useTheme, SvgIcon, SvgIconProps, Theme } from '@mui/material'
import { forwardRef, memo, ForwardedRef, useContext } from 'react'
import { MaskIconPaletteContext } from './MaskIconPaletteContext'

/** @internal */
export type Size = [width: number | undefined, height: number | undefined]
/** @internal */
export type SvgIconRaw = JSX.Element | ((theme: Theme) => JSX.Element)

/**
 * Create an icon from svg fragment
 * @param name Name of the Icon
 * @param svg SVG content. Do not include <svg> tag
 * @param viewBox The viewbox
 * @param defaultSize Only use this when the icon is not square. Unit: px
 * @returns A component that same type as icons from @mui/icons-material
 */
export function createIcon(name: string, svg: SvgIconRaw, viewBox?: string, defaultSize?: Size): typeof SvgIcon {
    const [width, height] = defaultSize || []
    if (width === height && typeof width === 'number') throw new Error('Only define this when the icon is not a square')
    type Component = ((props: SvgIconProps, ref: ForwardedRef<SVGSVGElement>) => JSX.Element) & {
        displayName?: string
    }

    const Icon: Component =
        typeof svg === 'function'
            ? ({ sx, ...props }, ref) => {
                  const style = defaultSize ? { width, height, ...sx } : sx
                  return <SvgIcon viewBox={viewBox} {...props} ref={ref} children={svg(useTheme())} sx={style} />
              }
            : ({ sx, ...props }, ref) => {
                  const style = defaultSize ? { width, height, ...sx } : sx
                  return <SvgIcon viewBox={viewBox} {...props} ref={ref} children={svg} sx={style} />
              }
    Icon.displayName = `Icon (${name})`
    return memo(forwardRef(Icon)) as unknown as typeof SvgIcon
}

/**
 * Create an icon from svg fragment
 * @internal
 * @param name Name of the Icon
 * @param light SVG content when the theme is light theme. Do not include <svg> tag
 * @param dark SVG content when the theme is light theme. Do not include <svg> tag
 * @param dim SVG content when the theme is dark, and the MaskIconPaletteContext is "dim". Do not include <svg> tag
 * @param viewBox The viewbox
 * @param defaultSize Only use this when the icon is not square. Unit: px
 * @returns A component that same type as icons from @mui/icons-material
 */
export function createPaletteAwareIcon(
    name: string,
    light: JSX.Element,
    dark: JSX.Element,
    dim: JSX.Element | undefined,
    viewBox?: string,
    defaultSize?: Size,
) {
    return createIcon(
        name,
        (theme) => {
            const palette = useContext(MaskIconPaletteContext)
            const isDim = palette === 'dim'
            if (theme.palette.mode === 'dark') {
                if (isDim && dim) return dim
                return dark
            }
            return light
        },
        viewBox,
        defaultSize,
    )
}
