import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import type { Plugin } from '@masknet/plugin-infra'

const borderShadows = {
    dark: '0px 0px 16px 0px #FFFFFF33',
    light: '0px 0px 16px 0px #65778633',
    dim: '0px 0px 16px 0px #8899A633',
}
const useStyles = makeStyles()((theme) => ({
    hidden: {
        display: 'none',
    },
    button: {
        border: `1px solid ${theme.palette.divider} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderRadius: 9999,
        '&:hover': {
            boxShadow: borderShadows?.[theme.palette.mode],
            border: `1px solid ${theme.palette.primary.main} !important`,
            color: `${theme.palette.primary.main} !important`,
            backgroundColor: 'transparent',
        },
    },
    selected: {
        border: `1px solid ${theme.palette.primary.main} !important`,
        color: `${theme.palette.primary.main} !important`,
        borderRadius: 9999,
        '&:hover': {
            boxShadow: borderShadows?.[theme.palette.mode],
            backgroundColor: 'transparent',
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
