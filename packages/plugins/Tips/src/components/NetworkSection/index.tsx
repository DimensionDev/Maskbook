import { PluginID, EMPTY_LIST } from '@masknet/shared-base'
import { useActivatedPluginSiteAdaptorAny } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { NetworkTab } from '@masknet/shared'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { TargetRuntimeContext } from '../../contexts/TargetRuntimeContext.js'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(1),
        flexShrink: 0,
        height: 62,
    },
}))

export function NetworkSection() {
    const { classes } = useStyles()
    const { setTargetChainId } = TargetRuntimeContext.useContainer()

    const { pluginID } = useNetworkContext()
    const tipsDefinition = useActivatedPluginSiteAdaptorAny(PluginID.Tips)
    const chainIdList = tipsDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST

    if (!chainIdList.length) return null

    return (
        <div className={classes.abstractTabWrapper}>
            <NetworkTab chains={chainIdList} pluginID={pluginID} onChange={setTargetChainId} />
        </div>
    )
}
