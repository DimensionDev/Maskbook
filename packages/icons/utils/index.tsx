import SvgIcon from '@material-ui/core/SvgIcon'
import { ReactNode, forwardRef, memo } from 'react'

/**
 * Create a icon from svg fragment
 * @internal
 * @param name Name of the Icon
 * @param svg SVG content. Do not include <svg> tag
 * @param viewBox The viewbox
 * @param defaultSize Only use this when the icon is not square. Unit: px
 * @returns A component that same type as icons from @material-ui/icons
 */
export function createIcon(
    name: string,
    svg: ReactNode,
    viewBox?: string,
    defaultSize?: [width: number | undefined, height: number | undefined],
): typeof SvgIcon {
    const [width, height] = defaultSize || []
    if (width === height && typeof width === 'number') throw new Error('Only define this when the icon is not a square')
    const Icon = function Icon({ sx, ...props }: any, ref: any) {
        const style = defaultSize ? { width, height, ...sx } : sx
        return <SvgIcon viewBox={viewBox} {...props} ref={ref} children={svg} sx={style} />
    } as any
    Icon.displayName = `Icon (${name})`
    return memo(forwardRef(Icon)) as typeof SvgIcon
}
