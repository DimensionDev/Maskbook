import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-unified'
import { NextIDPlatform, EMPTY_LIST } from '@masknet/shared-base'
import { Box, CircularProgress } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useAddressNames } from '@masknet/web3-shared-evm'
import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor, Plugin, PluginId } from '@masknet/plugin-infra'
import { PageTab } from '../InjectedComponents/PageTab'
import { MaskMessages, useI18N, useLocationChange } from '../../utils'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../DataSource/useNextID'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'

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
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [hidden, setHidden] = useState(true)
    const [selectedTab, setSelectedTab] = useState<Plugin.SNSAdaptor.ProfileTab | undefined>()

    const currentIdentity = useLastRecognizedIdentity()
    const identity = useCurrentVisitingIdentity()
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: addressNames = EMPTY_LIST, loading: loadingAddressNames } = useAddressNames(identity)
    const { value: personaList = EMPTY_LIST, loading: loadingPersonaList } = useNextIDBoundByPlatform(
        platform as NextIDPlatform,
        identity.identifier.userId,
    )

    const currentAccountNotConnectPersona =
        currentIdentity.identifier.userId === identity.identifier.userId &&
        personaList.findIndex((persona) => persona?.persona === currentConnectedPersona?.publicHexKey) === -1

    const tabs = useActivatedPluginsSNSAdaptor('any')
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
        let tab
        if (isTwitter(activatedSocialNetworkUI)) {
            tab = currentAccountNotConnectPersona
                ? tabs?.find((tab) => tab?.pluginID === PluginId.NextID)?.ID
                : selectedTabComputed?.ID
        } else {
            tab = selectedTabComputed?.ID
        }

        return getTabContent(tab ?? '')
    }, [selectedTabComputed, identity.identifier])

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
