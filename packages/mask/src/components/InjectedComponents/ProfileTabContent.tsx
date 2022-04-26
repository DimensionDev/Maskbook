import {
    createInjectHooksRenderer,
    Plugin,
    PluginId,
    useActivatedPluginsSNSAdaptor,
} from '@masknet/plugin-infra/content-script'
import { useAddressNames, useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Box, CircularProgress } from '@mui/material'
import { first } from 'lodash-unified'
import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { MaskMessages } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../DataSource/useNextID'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { PageTab } from '../InjectedComponents/PageTab'

function getTabContent(tabId: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        if (!tab) return
        return tab.UI?.TabContent
    })
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    tags: {
        padding: theme.spacing(2),
    },
    metadata: {},
    content: {
        position: 'relative',
        padding: theme.spacing(1),
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const [hidden, setHidden] = useState(true)
    const [selectedTab, setSelectedTab] = useState<Plugin.SNSAdaptor.ProfileTab<ChainId> | undefined>()

    const currentIdentity = useLastRecognizedIdentity()
    const identity = useCurrentVisitingIdentity()
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: addressNames = EMPTY_LIST, loading: loadingAddressNames } = useAddressNames(
        NetworkPluginID.PLUGIN_EVM,
        identity,
    )
    const { value: personaList = EMPTY_LIST, loading: loadingPersonaList } = useNextIDBoundByPlatform(
        platform as NextIDPlatform,
        identity.identifier.userId,
    )

    const currentAccountNotConnectPersona =
        currentIdentity.identifier.userId === identity.identifier.userId &&
        personaList.findIndex((persona) => persona?.persona === currentConnectedPersona?.publicHexKey) === -1

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const tabs = useAvailablePlugins(activatedPlugins)
        .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? [])
        .filter((z) => z.Utils?.shouldDisplay?.(identity, addressNames) ?? true)
        .sort((a, z) => {
            // order those tabs from next id first
            if (a.pluginID === PluginId.NextID) return -1
            if (z.pluginID === PluginId.NextID) return 1

            // order those tabs from collectible first
            if (a.pluginID === PluginId.Collectible) return -1
            if (z.pluginID === PluginId.Collectible) return 1

            // place those tabs from debugger last
            if (a.pluginID === PluginId.Debugger) return 1
            if (z.pluginID === PluginId.Debugger) return -1

            // place those tabs from dao before the last
            if (a.pluginID === PluginId.DAO) return 1
            if (z.pluginID === PluginId.DAO) return -1

            return a.priority - z.priority
        })

    const selectedTabComputed = selectedTab ?? first(tabs)

    useLocationChange(() => {
        setSelectedTab(undefined)
    })

    useUpdateEffect(() => {
        setSelectedTab(undefined)
    }, [identity.identifier])

    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            if (data.hidden) setHidden(data.hidden)
        })
    }, [identity])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity])

    const ContentComponent = useMemo(() => {
        const tab =
            isTwitter(activatedSocialNetworkUI) && currentAccountNotConnectPersona
                ? tabs?.find((tab) => tab?.pluginID === PluginId.NextID)?.ID
                : selectedTabComputed?.ID
        return getTabContent(tab ?? '')
    }, [selectedTabComputed?.ID, identity.identifier.userId])

    if (hidden) return null

    if (loadingAddressNames || loadingPersonaList)
        return (
            <div className={classes.root}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    <CircularProgress />
                </Box>
            </div>
        )

    return (
        <div className={classes.root}>
            <div className={classes.tags}>
                <PageTab tabs={tabs} selectedTab={selectedTabComputed} onChange={setSelectedTab} />
            </div>
            <div className={classes.content}>
                <ContentComponent
                    addressNames={addressNames}
                    identity={identity}
                    personaList={personaList?.map((persona) => persona.persona)}
                />
            </div>
        </div>
    )
}
