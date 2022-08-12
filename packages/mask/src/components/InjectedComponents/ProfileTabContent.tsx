import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first, uniqBy } from 'lodash-unified'
import {
    createInjectHooksRenderer,
    PluginId,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useSocialAddressListAll, useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { AddressItem } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, MaskTabList, ShadowRootMenu, useStylesExtends, useTabs } from '@masknet/theme'
import { Box, Button, CircularProgress, Link, MenuItem, Tab, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { isSameAddress, NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { MaskMessages, useI18N, sorter } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import {
    useCurrentVisitingIdentity,
    useCurrentVisitingSocialIdentity,
    useIsCurrentVisitingOwnerIdentity,
} from '../DataSource/useActivatedUI'
import { TabContext } from '@mui/lab'

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

const useStyles = makeStyles()((theme) => ({
    root: {},
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        padding: '16px 16px 0 16px',
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
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
    },
    walletButton: {
        padding: 0,
        fontSize: '18px',
        minWidth: 0,
        background: 'transparent',
        '&:hover': {
            background: 'none',
        },
    },
    settingItem: {
        display: 'flex',
        alignItems: 'center',
    },
    tabs: {
        display: 'flex',
        position: 'relative',
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
        color: theme.palette.maskColor.second,
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const { t } = useI18N()
    const translate = usePluginI18NField()

    const [hidden, setHidden] = useState(true)
    const [selectedAddress, setSelectedAddress] = useState<SocialAddress<NetworkPluginID> | undefined>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const isOwnerIdentity = useIsCurrentVisitingOwnerIdentity()
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const currentVisitingUserId = currentVisitingIdentity.identifier?.userId

    const {
        value: currentVisitingSocialIdentity,
        loading: loadingCurrentVisitingSocialIdentity,
        retry: retryIdentity,
    } = useCurrentVisitingSocialIdentity()

    const {
        value: socialAddressList = EMPTY_LIST,
        loading: loadingSocialAddressList,
        retry: retrySocialAddress,
    } = useSocialAddressListAll(
        currentVisitingSocialIdentity,
        isOwnerIdentity ? [SocialAddressType.NEXT_ID] : undefined,
        sorter,
    )

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retryIdentity()
            retrySocialAddress()
        })
    }, [retrySocialAddress, retryIdentity])

    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(() => {
            retryIdentity()
        })
    }, [retryIdentity])

    useEffect(() => {
        setSelectedAddress(first(socialAddressList))
    }, [socialAddressList])

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => {
                const shouldDisplay = x.Utils?.shouldDisplay?.(currentVisitingIdentity, selectedAddress) ?? true
                return x.pluginID !== PluginId.NextID && shouldDisplay
            })
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
    })
    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginId.Collectible, ...tabs.map((tab) => tab.id))

    const isWeb3ProfileDisable = useIsMinimalMode(PluginId.Web3Profile)

    const isTwitterPlatform = isTwitter(activatedSocialNetworkUI)
    const isOwnerNotHasBinding = isOwnerIdentity && !currentVisitingSocialIdentity?.hasBinding
    const isOwnerNotHasAddress =
        isOwnerIdentity && socialAddressList.findIndex((address) => address.type === SocialAddressType.NEXT_ID) === -1

    const showNextID = !!(
        isTwitterPlatform &&
        (isWeb3ProfileDisable || isOwnerNotHasBinding || isOwnerNotHasAddress || socialAddressList.length === 0)
    )

    const componentTabId = showNextID ? `${PluginId.NextID}_tabContent` : currentTab

    const component = useMemo(() => {
        const Component = getTabContent(componentTabId)

        return <Component identity={currentVisitingSocialIdentity} socialAddress={selectedAddress} />
    }, [componentTabId, currentVisitingSocialIdentity?.publicKey, selectedAddress])

    useLocationChange(() => {
        onChange(undefined, first(tabs)?.id)
    })

    useUpdateEffect(() => {
        onChange(undefined, first(tabs)?.id)
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

    useEffect(() => {
        const listener = () => setAnchorEl(null)

        window.addEventListener('scroll', listener, false)

        return () => {
            window.removeEventListener('scroll', listener, false)
        }
    }, [])

    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const onSelect = (option: SocialAddress<NetworkPluginID>) => {
        setSelectedAddress(option)
        setAnchorEl(null)
    }
    const handleOpenDialog = () => {
        CrossIsolationMessages.events.requestWeb3ProfileDialog.sendToAll({
            open: true,
        })
    }
    if (hidden) return null

    if (!currentVisitingUserId || loadingSocialAddressList || loadingCurrentVisitingSocialIdentity)
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
                    <div className={classes.container}>
                        <div className={classes.title}>
                            <div className={classes.walletItem}>
                                <Button
                                    id="demo-positioned-button"
                                    variant="text"
                                    size="small"
                                    onClick={onOpen}
                                    className={classes.walletButton}>
                                    <AddressItem
                                        reverse={
                                            selectedAddress?.type === SocialAddressType.KV ||
                                            selectedAddress?.type === SocialAddressType.ADDRESS ||
                                            selectedAddress?.type === SocialAddressType.NEXT_ID
                                        }
                                        iconProps={classes.mainLinkIcon}
                                        TypographyProps={{
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            color: (theme) => theme.palette.maskColor.dark,
                                        }}
                                        identityAddress={selectedAddress}
                                    />
                                    <Icons.ArrowDrop className={classes.arrowDropIcon} />
                                </Button>
                                <ShadowRootMenu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    PaperProps={{
                                        className: classes.addressMenu,
                                    }}
                                    aria-labelledby="demo-positioned-button"
                                    onClose={() => setAnchorEl(null)}>
                                    {uniqBy(socialAddressList ?? [], (x) => x.address.toLowerCase()).map((x) => {
                                        return (
                                            <MenuItem key={x.address} value={x.address} onClick={() => onSelect(x)}>
                                                <div className={classes.menuItem}>
                                                    <div className={classes.addressItem}>
                                                        <AddressItem
                                                            reverse={
                                                                x.type === SocialAddressType.KV ||
                                                                x.type === SocialAddressType.ADDRESS ||
                                                                x.type === SocialAddressType.NEXT_ID
                                                            }
                                                            identityAddress={x}
                                                            iconProps={classes.secondLinkIcon}
                                                        />
                                                        {x?.type === SocialAddressType.NEXT_ID && <Icons.Verified />}
                                                    </div>
                                                    {isSameAddress(selectedAddress?.address, x.address) && (
                                                        <Icons.CheckCircle className={classes.selectedIcon} />
                                                    )}
                                                </div>
                                            </MenuItem>
                                        )
                                    })}
                                </ShadowRootMenu>
                            </div>
                            <div className={classes.settingItem}>
                                <Typography
                                    fontSize="14px"
                                    fontWeight={700}
                                    marginRight="5px"
                                    color={(theme) => theme.palette.maskColor.secondaryDark}>
                                    {t('powered_by')}
                                </Typography>
                                <Typography
                                    fontSize="14px"
                                    fontWeight={700}
                                    marginRight="4px"
                                    color={(theme) => theme.palette.maskColor.dark}>
                                    {t('mask_network')}
                                </Typography>
                                {isOwnerIdentity ? (
                                    <Icons.Gear
                                        variant="light"
                                        onClick={handleOpenDialog}
                                        className={classes.gearIcon}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ) : (
                                    <Link
                                        className={classes.settingLink}
                                        href="https://mask.io"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <Icons.LinkOut className={classes.linkOutIcon} size={20} />
                                    </Link>
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
            </div>
            <div className={classes.content}>{component}</div>
        </div>
    )
}
