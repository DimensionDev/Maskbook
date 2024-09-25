import { Icons } from '@masknet/icons'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { RadioGroup, Typography, Popover } from '@mui/material'
import type { PropsWithChildren, ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    popper: {
        overflow: 'visible',
        boxShadow: '0px 0px 16px 0px rgba(101, 119, 134, 0.2)',
        borderRadius: 4,
    },
    paperRoot: {
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
    popperText: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        padding: 0,
        border: 0,
        background: 'none',
        minWidth: 70,
    },
    paper: {
        width: 280,
        padding: 12,
        boxSizing: 'border-box',
    },
    selected: {
        lineHeight: '18px',
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
}))

interface PopoverListTriggerProp extends PropsWithChildren {
    anchorEl: HTMLElement | null
    setAnchorEl(v: HTMLElement | null): void
    onChange(v: string): void
    selected: string
    selectedTitle: ReactNode
}

export function PopoverListTrigger({
    anchorEl,
    selected,
    selectedTitle,
    children,
    setAnchorEl,
    onChange,
}: PopoverListTriggerProp) {
    const { classes } = useStyles()

    return usePortalShadowRoot((ref) => (
        <>
            <button
                type="button"
                className={classes.popperText}
                onClick={(e) => {
                    setAnchorEl(anchorEl ? null : e.currentTarget)
                }}>
                <Typography className={classes.selected}>{selectedTitle}</Typography>
                <Icons.RightArrow className={classes.selected} size={20} />
            </button>
            <Popover
                container={ref}
                disableScrollLock
                className={classes.popper}
                classes={{ paper: classes.paperRoot }}
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <RadioGroup className={classes.paper} value={selected} onChange={(e) => onChange(e.target.value)}>
                    {children}
                </RadioGroup>
            </Popover>
        </>
    ))
}
