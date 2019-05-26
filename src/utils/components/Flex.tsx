import React from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import classNames from 'classnames'
import createStyles from '@material-ui/core/styles/createStyles'
import { withStyles } from '@material-ui/styles'

export function createBox<T extends keyof JSX.IntrinsicElements = 'div'>(
    fn: ((theme: Theme) => CSSProperties) | CSSProperties,
    element?: T,
) {
    const style = typeof fn === 'function' ? (theme: Theme) => createStyles({ box: fn(theme) }) : { box: fn }
    const Real = React.forwardRef(({ classes, className, ...props }: any, ref: any) => {
        return React.createElement(element || 'div', {
            ...props,
            ref,
            className: classNames(classes.box, className),
        })
    })
    const Styled = withStyles(style)(Real)
    return Styled as React.ComponentType<JSX.IntrinsicElements[T]>
}

export const FlexBox = createBox({ display: 'flex' })
export const FullWidth = createBox({ flex: 1 })
export const VerticalCenter = createBox({ display: 'flex', flexDirection: 'column', justifyContent: 'center' })
