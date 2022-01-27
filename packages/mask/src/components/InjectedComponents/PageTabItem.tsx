import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import type { Plugin } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    hidden: {
        display: 'none',
    },
    button: {
        border: `1px solid ${theme.palette.divider} !important`,
        color: theme.palette.text.primary,
        borderRadius: 9999,
        '&:hover': {
            boxShadow: theme.borderShadow,
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
            border: `1px solid ${theme.palette.primary.main} !important`,
        },
    },
    selected: {
        border: `1px solid ${theme.palette.primary.main} !important`,
        color: theme.palette.primary.main,
        borderRadius: 9999,
        '&:hover': {
            boxShadow: theme.borderShadow,
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
        },
    },
}))

export interface PageTabItemProps {
    tab: Plugin.SNSAdaptor.ProfileTab
    selected?: boolean
    onClick?: (tab: Plugin.SNSAdaptor.ProfileTab) => void
}

export function PageTabItem(props: PageTabItemProps) {
    const { tab, selected, onClick } = props
    const { classes } = useStyles()

    return (
        <Button
            className={classNames(selected ? classes.selected : classes.button)}
            variant="outlined"
            size="medium"
            onClick={() => onClick?.(tab)}>
            {tab.label}
        </Button>
    )
}
