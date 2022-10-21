import type { FC, HTMLProps } from 'react'
import { PluginID, EMPTY_LIST } from '@masknet/shared-base'
import { usePluginIDContext } from '@masknet/web3-hooks-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { makeStyles } from '@masknet/theme'
import { NetworkTab } from '../../../../components/shared/NetworkTab'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(1),
        flexShrink: 0,
        height: 62,
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {}

export const NetworkSection: FC<Props> = () => {
    const { classes } = useStyles()

    const { pluginID } = usePluginIDContext()
    const definition = useActivatedPlugin(PluginID.Tips, 'any')
    const chainIdList = definition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST

    if (!chainIdList.length) return null

    return (
        <div className={classes.abstractTabWrapper}>
            <NetworkTab
                classes={{
                    tab: classes.tab,
                    tabs: classes.tabs,
                    tabPaper: classes.tabPaper,
                }}
                chains={chainIdList}
            />
        </div>
    )
}
