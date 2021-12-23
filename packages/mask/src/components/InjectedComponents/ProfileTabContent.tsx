import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-unified'
import { Box, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useAddressNames } from '@masknet/web3-shared-evm'
import { createInjectHooksRenderer, Plugin } from '@masknet/plugin-infra'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'
import { PageTab } from '../InjectedComponents/PageTab'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import { MaskMessages, useI18N } from '../../utils'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI'

function getTabContent(tabId: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        if (!tab) return
        return tab.children
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

    const identity = useCurrentVisitingIdentity()
    const { value: addressNames, loading: loadingAddressNames } = useAddressNames(identity)
    const activatedPlugins = useActivatedPluginsSNSAdaptor()
    const tabs = activatedPlugins.flatMap((x) => x.ProfileTabs ?? []).sort((a, z) => a.priority - z.priority)

    const [hidden, setHidden] = useState(true)
    const [selectedTab, setSelectedTab] = useState<Plugin.SNSAdaptor.ProfileTab | undefined>(first(tabs))

    useLocationChange(() => {
        setSelectedTab(first(tabs))
    })

    useUpdateEffect(() => {
        setSelectedTab(first(tabs))
    }, [identity.identifier])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity])

    const ContentComponent = useMemo(() => {
        return getTabContent(selectedTab?.ID ?? '')
    }, [selectedTab, identity.identifier, addressNames])

    if (hidden) return null

    if (loadingAddressNames)
        return (
            <div className={classes.root}>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ paddingTop: 4, paddingBottom: 4 }}>
                    <Typography color="textPrimary">{t('plugin_profile_loading')}</Typography>
                </Box>
            </div>
        )

    return (
        <div className={classes.root}>
            <div className={classes.tags}>
                <PageTab tabs={tabs} selectedTab={selectedTab} onChange={setSelectedTab} />
            </div>
            <div className={classes.content}>
                <ContentComponent addressNames={addressNames} identity={identity} />
            </div>
        </div>
    )
}
