import React, { useEffect } from 'react'
import { Popper, Paper, Grow, MenuList, PopperProps, makeStyles, Typography, Theme } from '@material-ui/core'
import { noop } from 'lodash-es'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles((theme: Theme) => ({
    title: {
        padding: theme.spacing(2),
        fontWeight: 500,
    },
}))

export interface PostDialogDropdownProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    title?: string
    anchorRef: React.RefObject<HTMLElement | null>
    items?: JSX.Element[]
    onClose?: () => void
    PopperProps?: Partial<PopperProps>
}

export function PostDialogDropdown(props: PostDialogDropdownProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { title, items = [], anchorRef, open, onClose = noop, PopperProps } = props

    const prevOpen = React.useRef(open)
    useEffect(() => {
        if (prevOpen.current && !open) anchorRef.current!.focus()
        prevOpen.current = open
    }, [open])

    return (
        <Popper open={open} anchorEl={anchorRef.current} transition disablePortal {...PopperProps}>
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                    <Paper>
                        {props.title ? (
                            <Typography className={classes.title} component="h5">
                                {props.title}
                            </Typography>
                        ) : null}
                        <MenuList disablePadding autoFocusItem={open}>
                            {items.map((item, index) =>
                                React.cloneElement(item, {
                                    key: index,
                                    onClick: onClose,
                                }),
                            )}
                        </MenuList>
                    </Paper>
                </Grow>
            )}
        </Popper>
    )
}
