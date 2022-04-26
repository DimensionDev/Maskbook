import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import { type Plugin, usePluginI18NField } from '@masknet/plugin-infra/content-script'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

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
    pluginID: string
    tab: Plugin.SNSAdaptor.ProfileTab<Web3Helper.ChainIdAll>
    selected?: boolean
    onClick?: (tab: Plugin.SNSAdaptor.ProfileTab<Web3Helper.ChainIdAll>) => void
}

export function PageTabItem(props: PageTabItemProps) {
    const { tab, selected, onClick } = props
    const { classes } = useStyles()
    const translate = usePluginI18NField()

    return (
        <Button
            className={classNames(selected ? classes.selected : classes.button)}
            variant="outlined"
            size="medium"
            onClick={() => onClick?.(tab)}>
            {typeof tab.label === 'string' ? tab.label : translate(props.pluginID, tab.label)}
        </Button>
    )
}
