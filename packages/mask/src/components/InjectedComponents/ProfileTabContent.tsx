import {
    createInjectHooksRenderer,
    PluginId,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { ConcealableTabs } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useAddressNames } from '@masknet/web3-shared-evm'
import { Box, CircularProgress, Typography } from '@mui/material'
import { first } from 'lodash-unified'
import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { MaskMessages, useI18N } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../DataSource/useNextID'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'

function getTabContent(tabId: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        if (!tab) return
        return tab.UI?.TabContent
    })
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    content: {
        position: 'relative',
        padding: theme.spacing(2, 1),
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const { t } = useI18N()
    const [hidden, setHidden] = useState(true)
    const [selectedTab, setSelectedTab] = useState<string | undefined>()

    const currentIdentity = useLastRecognizedIdentity()
    const identity = useCurrentVisitingIdentity()
    const { currentConnectedPersona } = usePersonaConnectStatus()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const { value: addressNames = EMPTY_LIST, loading: loadingAddressNames } = useAddressNames(identity)
    const { value: personaList = EMPTY_LIST, loading: loadingPersonaList } = useNextIDBoundByPlatform(
        platform as NextIDPlatform,
        identity.identifier?.userId,
    )

    const currentAccountNotConnectPersona =
        currentIdentity.identifier === identity.identifier &&
        personaList.findIndex((persona) => persona?.persona === currentConnectedPersona?.publicHexKey) === -1

    const translate = usePluginI18NField()
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const availablePlugins = useAvailablePlugins(activatedPlugins)
    const displayPlugins = useMemo(() => {
        return availablePlugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? [])
            .filter((z) => z.Utils?.shouldDisplay?.(identity, addressNames) ?? true)
    }, [availablePlugins, identity, addressNames])
    const tabs = useMemo(() => {
        return displayPlugins
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
            .map((x) => ({
                id: x.ID,
                label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
            }))
    }, [displayPlugins, translate])

    const selectedTabId = selectedTab ?? first(tabs)?.id

    useLocationChange(() => {
        setSelectedTab(undefined)
    })

    useUpdateEffect(() => {
        setSelectedTab(undefined)
    }, [identity.identifier.userId])

    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            if (data.hidden) setHidden(data.hidden)
        })
    }, [identity.identifier.userId])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity.identifier.userId])

    const ContentComponent = useMemo(() => {
        const tabId =
            isTwitter(activatedSocialNetworkUI) && currentAccountNotConnectPersona
                ? displayPlugins?.find((tab) => tab?.pluginID === PluginId.NextID)?.ID
                : selectedTabId
        return getTabContent(tabId ?? '')
    }, [selectedTabId, identity.identifier])

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
            <div>
                {tabs.length ? (
                    <ConcealableTabs<string> tabs={tabs} selectedId={selectedTabId} onChange={setSelectedTab} />
                ) : (
                    <Typography variant="body2" color="textPrimary" align="center" sx={{ paddingTop: 8 }}>
                        {t('web3_tab_hint')}
                    </Typography>
                )}
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
