import { Icons } from '@masknet/icons'
import {
    createInjectHooksRenderer,
    PluginId,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useStylesExtends, useTabs } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Box, CircularProgress, Tab, Typography } from '@mui/material'
import { first } from 'lodash-unified'
import { FC, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { TipButton } from '../../../plugins/Tips/components'
import type { TipAccount } from '../../../plugins/Tips/types'
import { MaskMessages, sorter, useLocationChange } from '../../../utils'
import { useIsMyIdentity } from '../../DataSource/useActivatedUI'
import { ProfileBar } from './ProfileBar'

interface Props extends withClasses<'text' | 'button' | 'root'> {
    identity: SocialIdentity
}

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileCardTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}
const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        root: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            height: '100%',
        },
        header: {
            background: isDark
                ? 'linear-gradient(180deg, #202020 0%, #181818 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
            padding: theme.spacing(2, 2, 0, 2),
            boxSizing: 'border-box',
            flexShrink: 0,
        },
        title: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        walletItem: {
            display: 'flex',
            alignItems: 'center',
            fontSize: 18,
            fontWeight: 700,
        },
        menuItem: {
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: 'space-between',
        },
        addressMenu: {
            maxHeight: 192,
            width: 248,
            backgroundColor: theme.palette.maskColor.bottom,
        },
        addressItem: {
            display: 'flex',
            alignItems: 'center',
        },
        link: {
            cursor: 'pointer',
            marginTop: 2,
            zIndex: 1,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        settingLink: {
            cursor: 'pointer',
            marginTop: 4,
            zIndex: 1,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        linkIcon: {
            color: theme.palette.maskColor.second,
            fontSize: '20px',
            margin: '4px 2px 0 2px',
        },
        content: {
            position: 'relative',
            flexGrow: 1,
            backgroundColor: theme.palette.maskColor.bottom,
            overflow: 'auto',
            paddingBottom: 48,
        },
        settingItem: {
            display: 'flex',
            alignItems: 'center',
        },
        tipButton: {
            width: 40,
            height: 40,
            borderRadius: 40,
            border: `1px solid ${isDark ? theme.palette.maskColor.publicLine : theme.palette.maskColor.line}`,
        },
        tabs: {
            display: 'flex',
            position: 'relative',
            paddingTop: 0,
            marginTop: theme.spacing(2),
        },
        addressLabel: {
            color: theme.palette.maskColor.dark,
            fontSize: 18,
            fontWeight: 700,
        },
        arrowDropIcon: {
            color: theme.palette.maskColor.dark,
        },
        selectedIcon: {
            color: theme.palette.maskColor.primary,
        },
        gearIcon: {
            color: theme.palette.maskColor.dark,
        },
        linkOutIcon: {
            color: theme.palette.maskColor.secondaryDark,
        },
        mainLinkIcon: {
            margin: '0px 2px',
            color: theme.palette.maskColor.secondaryDark,
        },
        secondLinkIcon: {
            margin: '4px 2px 0 2px',
            color: theme.palette.maskColor.secondaryDark,
        },
        footer: {
            position: 'absolute',
            height: 48,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: theme.spacing(1.5),
            boxSizing: 'border-box',
            fontSize: 14,
            fontWeight: 700,
            zIndex: 2,
        },
        powerBy: {
            color: theme.palette.text.primary,
        },
    }
})

export const ProfileCard: FC<Props> = ({ identity, ...rest }) => {
    const classes = useStylesExtends(useStyles(), { classes: rest.classes })

    const translate = usePluginI18NField()
    const {
        value: socialAddressList = EMPTY_LIST,
        loading: loadingSocialAddressList,
        retry: retrySocialAddress,
    } = useSocialAddressListAll(identity, undefined, sorter)

    const availableSocialAddressList = useMemo(() => {
        return socialAddressList.filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
    }, [socialAddressList])

    const [selectedAddress, setSelectedAddress] = useState<string>()
    const firstAddress = first(availableSocialAddressList)?.address
    useEffect(() => {
        if (!selectedAddress && firstAddress) setSelectedAddress(firstAddress)
    }, [selectedAddress, firstAddress])
    const selectedSocialAddress = useMemo(() => {
        return availableSocialAddressList.find((x) => isSameAddress(x.address, selectedAddress))
    }, [selectedAddress, availableSocialAddressList])

    const tipAccounts: TipAccount[] = useMemo(() => {
        return availableSocialAddressList.map((x) => ({
            address: x.address,
            name: x.label,
            verified: x.type === SocialAddressType.NEXT_ID,
        }))
    }, [availableSocialAddressList])

    const isMyIdentity = useIsMyIdentity(identity)
    const userId = identity.identifier?.userId

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retrySocialAddress()
        })
    }, [retrySocialAddress])

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileCardTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => {
                const isAllowed = x.pluginID === PluginId.RSS3 || x.pluginID === PluginId.Collectible
                const shouldDisplay = x.Utils?.shouldDisplay?.(identity, selectedSocialAddress) ?? true
                return isAllowed && shouldDisplay
            })
            .sort((a, z) => a.priority - z.priority)
    })
    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginId.Collectible, ...tabs.map((tab) => tab.id))

    const component = useMemo(() => {
        const Component = getTabContent(currentTab)

        return <Component identity={identity} socialAddress={selectedSocialAddress} />
    }, [currentTab, identity?.publicKey, selectedSocialAddress])

    useLocationChange(() => {
        onChange(undefined, first(tabs)?.id)
    })

    useUpdateEffect(() => {
        onChange(undefined, first(tabs)?.id)
    }, [userId])

    const handleOpenDialog = () => {
        CrossIsolationMessages.events.requestWeb3ProfileDialog.sendToLocal({
            open: true,
        })
    }

    if (!userId || loadingSocialAddressList)
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
            {tabs.length > 0 && (
                <div className={classes.header}>
                    <div className={classes.title}>
                        <ProfileBar
                            identity={identity}
                            socialAddressList={availableSocialAddressList}
                            address={selectedAddress}
                            onAddressChange={setSelectedAddress}
                        />
                        <div className={classes.settingItem}>
                            {isMyIdentity ? (
                                <Icons.Gear
                                    variant="light"
                                    onClick={handleOpenDialog}
                                    className={classes.gearIcon}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ) : (
                                <TipButton
                                    className={classes.tipButton}
                                    receiver={identity.identifier}
                                    addresses={tipAccounts}
                                />
                            )}
                        </div>
                    </div>
                    <div className={classes.tabs}>
                        <TabContext value={currentTab}>
                            <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                {tabs.map((tab) => (
                                    <Tab key={tab.id} label={tab.label} value={tab.id} />
                                ))}
                            </MaskTabList>
                        </TabContext>
                    </div>
                </div>
            )}
            <div className={classes.content}>{component}</div>
            <div className={classes.footer}>
                <Typography variant="body1" className={classes.powerBy}>
                    Powered by{' '}
                    <Typography variant="body1" component="span" color="main">
                        RSS3
                    </Typography>
                </Typography>
                <Icons.RSS3 size={24} sx={{ ml: '12px' }} />
            </div>
        </div>
    )
}
