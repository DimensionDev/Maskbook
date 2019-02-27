import React, { ReactHTML, ClassAttributes, HTMLAttributes } from 'react'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import { withStylesTyped } from './theme'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import classNames from 'classnames'
import createStyles from '@material-ui/core/styles/createStyles'

export function createBox<T extends keyof ReactHTML>(
    fn: ((theme: Theme) => CSSProperties) | CSSProperties,
    element?: T,
) {
    return withStylesTyped(typeof fn === 'function' ? (theme: Theme) => createStyles({ box: fn(theme) }) : { box: fn })<
        ClassAttributes<T> & HTMLAttributes<T>
    >(({ classes, ...props }) =>
        React.createElement(element || 'div', {
            ...props,
            className: classNames(classes.box, (props as any).className),
        }),
    )
}

export const FlexBox = createBox({ display: 'flex' })
export const FullWidth = createBox({ flex: 1 })
export const VerticalCenter = createBox({ display: 'flex', flexDirection: 'column', justifyContent: 'center' })
