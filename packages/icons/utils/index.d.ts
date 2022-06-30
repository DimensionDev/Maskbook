import { SvgIcon, Theme } from '@mui/material'

export type Size = [width: number | undefined, height: number | undefined]
export type SvgIconRaw = JSX.Element | ((theme: Theme) => JSX.Element)

export function createIcon(name: string, svg: SvgIconRaw, viewBox?: string, defaultSize?: Size): typeof SvgIcon
