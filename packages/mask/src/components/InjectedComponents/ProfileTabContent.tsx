import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Box, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { AddressNameType, useAddressNames } from '@masknet/web3-shared-evm'
import { PageTab } from '../InjectedComponents/PageTab'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import { MaskMessages, useI18N } from '../../utils'
import { useCurrentVisitingIdentity } from '../DataSource/useActivatedUI'
import {
    useActivatedPlugin,
    useActivatedPluginSNSAdaptor_Web3Supported,
    useActivatedPluginsSNSAdaptor,
    usePluginIDContext,
} from '@masknet/plugin-infra'

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
    const tabs = activatedPlugins.flatMap((x) => x.ProfileTabs ?? [])

    const [hidden, setHidden] = useState(true)
    const [currentTag, setCurrentTag] = useState('')

    useLocationChange(() => {
        setCurrentTag('')
    })

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            setHidden(!data.show)
        })
    }, [identity])

    useUpdateEffect(() => {
        setCurrentTag('')
    }, [identity.identifier])

    const content = useMemo(() => {
        return <h1>HELLO WORLD</h1>
    }, [currentTag, identity.identifier])

    console.log({
        tabs,
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
                    <Typography color="textPrimary">{t('plugin_profile_loading')}</Typography>
                </Box>
            </div>
        )

    // if (!addressName)
    //     return (
    //         <div className={classes.root}>
    //             <Box
    //                 display="flex"
    //                 alignItems="center"
    //                 justifyContent="center"
    //                 sx={{ paddingTop: 4, paddingBottom: 4 }}>
    //                 <Typography color="textPrimary">{t('plugin_profile_error_no_address')}</Typography>
    //             </Box>
    //         </div>
    //     )

    return (
        <div className={classes.root}>
            <div className={classes.tags}>
                <PageTab tabs={tabs} />
            </div>
            {/* <div className={classes.metadata}>
                <AddressViewer addressName={addressName} />
            </div> */}
            <div className={classes.content}>{content}</div>
        </div>
    )
}
