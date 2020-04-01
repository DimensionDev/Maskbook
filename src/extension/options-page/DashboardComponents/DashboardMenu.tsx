import React from 'react'
import type { WrappedDialogProps } from '../Dialog/Base'
import { Popper, Grow, Paper, ClickAwayListener, MenuList } from '@material-ui/core'

export default function DashboardMenu(props: WrappedDialogProps<{ anchorEl?: Element; menus: JSX.Element[] }>) {
    const { anchorEl, menus } = props.ComponentProps!

    return (
        <Popper open={props.open} anchorEl={anchorEl} transition>
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                    <Paper style={{ minWidth: '100px' }}>
                        <ClickAwayListener onClickAway={props.onClose}>
                            <MenuList autoFocusItem={props.open} onClick={props.onClose}>
                                {menus.map((menu, index) => React.cloneElement(menu, { key: index }))}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    )
}
