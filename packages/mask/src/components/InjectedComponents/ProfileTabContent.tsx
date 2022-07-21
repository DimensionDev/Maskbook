import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-unified'
import {
    createInjectHooksRenderer,
    PluginId,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useSocialAddressListAll, useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { ConcealableTabs } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, CircularProgress } from '@mui/material'
import { Gear } from '@masknet/icons'
import { SocialAddressType } from '@masknet/web3-shared-base'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { MaskMessages, sortPersonaBindings, useI18N } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useNextIDBoundByPlatform } from '../DataSource/useNextID'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    content: {
        position: 'relative',
        padding: theme.spacing(2, 1),
    },
    settingIcon: {
        cursor: 'pointer',
        fill: theme.palette.maskColor.main,
        margin: '0 6px',
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const { t } = useI18N()
    const translate = usePluginI18NField()

    const [hidden, setHidden] = useState(true)
    const [selectedTab, setSelectedTab] = useState<string | undefined>()

    const ownerIdentity = useLastRecognizedIdentity()
    const currentIdentity = useCurrentVisitingIdentity()
    const ownerUserId = ownerIdentity.identifier?.userId
    const currentUserId = currentIdentity.identifier?.userId
    const isOwner = ownerUserId && currentUserId && ownerUserId?.toLowerCase() === currentUserId?.toLowerCase()
    const { currentConnectedPersona } = usePersonaConnectStatus()

    const { value: socialAddressList = EMPTY_LIST, loading: loadingSocialAddressList } = useSocialAddressListAll(
        currentIdentity,
        [SocialAddressType.NEXT_ID],
    )
    const { value: personaList = EMPTY_LIST, loading: loadingPersonaList } = useNextIDBoundByPlatform(
        activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform | undefined,
        currentUserId?.toLowerCase(),
    )

    const personaPublicKey = isOwner
        ? currentConnectedPersona?.identifier?.publicKeyAsHex
        : first(personaList.slice(0).sort((a, b) => sortPersonaBindings(a, b, currentUserId?.toLowerCase() ?? '')))
              ?.persona

    const isCurrentConnectedPersonaBind = personaList.some(
        (persona) => persona.persona === currentConnectedPersona?.identifier?.publicKeyAsHex.toLowerCase(),
    )

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const availablePlugins = useAvailablePlugins(activatedPlugins)
    const isWeb3ProfileDisable = useIsMinimalMode(PluginId.Web3Profile)
    const displayPlugins = useMemo(() => {
        return availablePlugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((z) => z.Utils?.shouldDisplay?.(currentIdentity, socialAddressList) ?? true)
    }, [currentIdentity, availablePlugins.map((x) => x.ID).join(), socialAddressList.map((x) => x.address).join()])

    const tabs = displayPlugins
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
        .filter((z) => z.pluginID !== PluginId.NextID)
        .map((x) => ({
            id: x.ID,
            label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
        }))

    const selectedTabId = selectedTab ?? first(tabs)?.id
    const showNextID =
        isTwitter(activatedSocialNetworkUI) &&
        ((isOwner && socialAddressList?.length === 0) ||
            isWeb3ProfileDisable ||
            (isOwner && !isCurrentConnectedPersonaBind))
    const componentTabId = showNextID
        ? displayPlugins?.find((tab) => tab?.pluginID === PluginId.NextID)?.ID
        : selectedTabId

    const handleOpenDialog = () => {
        CrossIsolationMessages.events.requestWeb3ProfileDialog.sendToAll({
            open: true,
        })
    }
    const component = useMemo(() => {
        const Component = getTabContent(componentTabId)
        const Utils = displayPlugins.find((x) => x.ID === selectedTabId)?.Utils

        return (
            <Component
                identity={currentIdentity}
                persona={personaPublicKey}
                socialAddressList={socialAddressList.filter((x) => Utils?.filter?.(x) ?? true).sort(Utils?.sorter)}
            />
        )
    }, [
        componentTabId,
        personaPublicKey,
        displayPlugins.map((x) => x.ID).join(),
        socialAddressList.map((x) => x.address).join(),
    ])

    useLocationChange(() => {
        setSelectedTab(undefined)
    })

    useUpdateEffect(() => {
        setSelectedTab(undefined)
    }, [currentUserId])

    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            if (data.hidden) setHidden(data.hidden)
        })
    }, [currentUserId])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [currentUserId])

    if (hidden) return null

    if (!currentUserId || loadingSocialAddressList || loadingPersonaList)
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
                {tabs.length > 0 && !showNextID && (
                    <ConcealableTabs<string>
                        tabs={tabs}
                        selectedId={selectedTabId}
                        onChange={setSelectedTab}
                        tail={isOwner && <Gear onClick={handleOpenDialog} className={classes.settingIcon} />}
                    />
                )}
            </div>
            <div className={classes.content}>{component}</div>
        </div>
    )
}
