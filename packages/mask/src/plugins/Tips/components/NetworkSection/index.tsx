import { PluginID, EMPTY_LIST } from '@masknet/shared-base'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { makeStyles } from '@masknet/theme'
import type { FC, HTMLProps } from 'react'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useCurrentWeb3NetworkPluginID } from '@masknet/web3-hooks-base'

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

    const pluginId = useCurrentWeb3NetworkPluginID()
    const tipDefinition = useActivatedPlugin(PluginID.Tips, 'any')
    const chainIdList = tipDefinition?.enableRequirement.web3?.[pluginId]?.supportedChainIds ?? EMPTY_LIST

    if (!chainIdList.length) return null

    return (
        <div className={classes.abstractTabWrapper}>
            <NetworkTab classes={{
                    tab: classes.tab,
                    tabs: classes.tabs,
                    tabPaper: classes.tabPaper,
                }} chains={chainIdList} />
        </div>
    )
}
