import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-unified'
import { Box, CircularProgress } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useAddressNames } from '@masknet/web3-shared-evm'
import { createInjectHooksRenderer, Plugin } from '@masknet/plugin-infra'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PageTab } from '../InjectedComponents/PageTab'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import { MaskMessages, useI18N } from '../../utils'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI'
import { PLUGIN_ID as PLUGIN_ID_DAO } from '@masknet/plugin-dao'
import { PLUGIN_ID as PLUGIN_ID_COLLECTIBLE } from '../../plugins/Collectible/constants'

function getTabContent(tabId: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        if (!tab) return
        return tab.UI?.TabContent
    })
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    tags: {
        padding: theme.spacing(2),
    },
    metadata: {},
    content: {
        position: 'relative',
        padding: theme.spacing(1),
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [hidden, setHidden] = useState(true)
    const tabs = useActivatedPluginsSNSAdaptor()
        .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? [])
        .sort((a, z) => {
            // order those tabs from collectible first
            if (a.pluginID === PLUGIN_ID_COLLECTIBLE) return -1
            if (z.pluginID === PLUGIN_ID_COLLECTIBLE) return 1

            // place those tabs from DAO last
            if (a.pluginID === PLUGIN_ID_DAO) return 1
            if (z.pluginID === PLUGIN_ID_DAO) return -1

            return a.priority - z.priority
        })
    const [selectedTab, setSelectedTab] = useState<Plugin.SNSAdaptor.ProfileTab | undefined>()
    const selectedTabComputed = selectedTab ?? first(tabs)

    const identity = useCurrentVisitingIdentity()
    const { value: addressNames, loading: loadingAddressNames } = useAddressNames(identity)

    useLocationChange(() => {
        setSelectedTab(undefined)
    })

    useUpdateEffect(() => {
        setSelectedTab(undefined)
    }, [identity.identifier])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity])

    const ContentComponent = useMemo(() => {
        return getTabContent(selectedTabComputed?.ID ?? '')
    }, [selectedTabComputed, identity.identifier])

    console.log('DEBUG: profile tab content')
    console.log({
        addressNames,
        loadingAddressNames,
    })

    if (hidden) return null

    if (loadingAddressNames)
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
                <ContentComponent addressNames={addressNames} identity={identity} />
            </div>
        </div>
    )
}
