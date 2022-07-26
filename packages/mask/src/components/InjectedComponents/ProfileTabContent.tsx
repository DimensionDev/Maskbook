import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-unified'
import {
    createInjectHooksRenderer,
    PluginId,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useSocialAddressListAll, useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { ConcealableTabs } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, CircularProgress } from '@mui/material'
import { Gear } from '@masknet/icons'
import { SocialAddressType } from '@masknet/web3-shared-base'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { MaskMessages, sortPersonaBindings } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import {
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useLastRecognizedPersona,
} from '../DataSource/useActivatedUI'
import { usePersonasFromNextID } from '../DataSource/usePersonasFromNextID'

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
        color: theme.palette.maskColor.main,
        margin: '0 6px',
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const translate = usePluginI18NField()

    const [hidden, setHidden] = useState(true)
    const [selectedTab, setSelectedTab] = useState<string | undefined>()

    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const lastRecognizedUserId = lastRecognizedIdentity.identifier?.userId
    const currentVisitingUserId = currentVisitingIdentity.identifier?.userId
    const isOwner =
        lastRecognizedUserId &&
        currentVisitingUserId &&
        lastRecognizedUserId?.toLowerCase() === currentVisitingUserId?.toLowerCase()

    const { value: socialAddressList = EMPTY_LIST, loading: loadingSocialAddressList } = useSocialAddressListAll(
        currentVisitingIdentity,
        [SocialAddressType.NEXT_ID],
    )

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const availablePlugins = useAvailablePlugins(activatedPlugins)
    const displayPlugins = useMemo(() => {
        return availablePlugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((z) => z.Utils?.shouldDisplay?.(currentVisitingIdentity, socialAddressList) ?? true)
    }, [
        currentVisitingIdentity,
        availablePlugins.map((x) => x.ID).join(),
        socialAddressList.map((x) => x.address).join(),
    ])

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

    const { value: lastRecognizedPersona, loading: loadingLastRecognizedPersona } = useLastRecognizedPersona()
    const { value: personas = EMPTY_LIST, loading: loadingPersonas } = usePersonasFromNextID(
        currentVisitingUserId?.toLowerCase(),
    )

    const personaPublicKey = isOwner
        ? lastRecognizedPersona?.identifier.publicKeyAsHex
        : first(personas.slice(0).sort((a, b) => sortPersonaBindings(a, b, currentVisitingUserId?.toLowerCase())))
              ?.persona

    const showNextID = !!(
        isTwitter(activatedSocialNetworkUI) &&
        isOwner &&
        (socialAddressList?.length === 0 ||
            !personas.some(
                (persona) => persona.persona === lastRecognizedPersona?.identifier.publicKeyAsHex?.toLowerCase(),
            ))
    )
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
                identity={currentVisitingIdentity}
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
    }, [currentVisitingUserId])

    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            if (data.hidden) setHidden(data.hidden)
        })
    }, [currentVisitingUserId])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [currentVisitingUserId])

    if (hidden) return null

    if (!currentVisitingUserId || loadingSocialAddressList || loadingLastRecognizedPersona || loadingPersonas)
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
