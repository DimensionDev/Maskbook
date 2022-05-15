import { RightArrowIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import Popover from '@mui/material/Popover'
import { RadioGroup } from '@mui/material'
import type { PropsWithChildren } from 'react'

const useStyles = makeStyles()({
    popper: {
        overflow: 'visible',
        boxShadow: '0px 0px 16px 0px rgba(101, 119, 134, 0.2)',
        borderRadius: 4,
    },
    popperText: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
    },
    paper: {
        width: 280,
        padding: 12,
        boxSizing: 'border-box',
    },
})

export interface PopoverListTriggerProp extends PropsWithChildren<{}> {
    anchorEl: HTMLElement | null
    setAnchorEl(v: HTMLElement | null): void
    onChange(v: string): void
    selected: string
    selectedTitle: string | undefined
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

    return (
        <>
            <div
                className={classes.popperText}
                onClick={(e) => {
                    setAnchorEl(anchorEl ? null : e.currentTarget)
                }}>
                {selectedTitle}
                <RightArrowIcon />
            </div>
            <Popover
                disablePortal
                className={classes.popper}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <RadioGroup className={classes.paper} value={selected} onChange={(e) => onChange(e.target.value)}>
                    {children}
                </RadioGroup>
            </Popover>
        </>
    )
}
