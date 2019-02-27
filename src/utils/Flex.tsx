import React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import { withStylesTyped } from './theme'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import classNames from 'classnames'
import createStyles from '@material-ui/core/styles/createStyles'
type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const createBox = (style: React.CSSProperties) => (props: DivProps) => (
    <div {...props} style={{ ...style, ...(props.style || {}) }} />
)
export const createThemedBox = (fn: (theme: Theme) => CSSProperties) =>
    withStylesTyped((theme: Theme) => createStyles({ box: fn(theme) }))<DivProps>(({ classes, ...props }) => (
        <div {...props} className={classNames(classes.box, props.className)} />
    ))

export const FlexBox = createBox({ display: 'flex' })
export const FullWidth = createBox({ flex: 1 })
export const VerticalCenter = createBox({ display: 'flex', flexDirection: 'column', justifyContent: 'center' })
