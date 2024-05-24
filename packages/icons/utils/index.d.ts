import { SvgIcon, Theme, SvgIconProps } from '@mui/material'
import type { JSX } from 'react'
export type Size = [width: number | undefined, height: number | undefined]
export type SvgIconRaw = JSX.Element | ((theme: Theme) => JSX.Element)

export function createIcon(
    name: string,
    svg: SvgIconRaw,
    viewBox?: string,
    defaultSize?: Size,
): React.ComponentType<SvgIconProps>
