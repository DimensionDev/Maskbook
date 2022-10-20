import { useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-unified'
import { Icons } from '@masknet/icons'
import {
    createInjectHooksRenderer,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins } from '@masknet/plugin-infra'
import {
    AccountIcon,
    AddressItem,
    GrantPermissions,
    PluginCardFrameMini,
    useSocialAccountsBySettings,
} from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, NextIDPlatform, PluginID } from '@masknet/shared-base'
import { makeStyles, MaskLightTheme, MaskTabList, ShadowRootMenu, useStylesExtends, useTabs } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Button, Link, MenuItem, Stack, Tab, ThemeProvider, Typography } from '@mui/material'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { MaskMessages, sorter, useI18N, useLocationChange } from '../../utils/index.js'
import { useCurrentVisitingSocialIdentity } from '../DataSource/useActivatedUI.js'
import { useCurrentPersonaConnectStatus } from '../DataSource/usePersonaConnectStatus.js'
import { ConnectPersonaBoundary } from '../shared/ConnectPersonaBoundary.js'
import { WalletSettingEntry } from './ProfileTab/WalletSettingEntry'
import { isFacebook } from '../../social-network-adaptor/facebook.com/base.js'
import { useGrantPermissions, usePluginHostPermissionCheck } from '../DataSource/usePluginHostPermission.js'

function getTabContent(tabId?: string) {
    return createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
        const tab = x.ProfileTabs?.find((x) => x.ID === tabId)
        return tab?.UI?.TabContent
    })
}

const MENU_ITEM_HEIGHT = 40
const MENU_LIST_PADDING = 8
const useStyles = makeStyles()((theme) => ({
    root: {
        width: isFacebook(activatedSocialNetworkUI) ? 876 : 'auto',
    },
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
    addressMenu: {
        maxHeight: MENU_ITEM_HEIGHT * 9 + MENU_LIST_PADDING * 2,
        minWidth: 320,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    menuItem: {
        height: MENU_ITEM_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    addressItem: {
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(2),
    },
    settingLink: {
        cursor: 'pointer',
        marginTop: 4,
        zIndex: 0,
        '&:hover': {
            textDecoration: 'none',
        },
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
        color: theme.palette.maskColor.second,
    },
    reload: {
        borderRadius: 20,
        minWidth: 254,
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const { t } = useI18N()
    const translate = usePluginI18NField()

    const [hidden, setHidden] = useState(true)
    const [selectedAddress, setSelectedAddress] = useState<string | undefined>()
    const [menuOpen, setMenuOpen] = useState(false)
    const {
        value: personaStatus,
        loading: loadingPersonaStatus,
        error: loadPersonaStatusError,
        retry: retryLoadPersonaStatus,
    } = useCurrentPersonaConnectStatus()

    const {
        value: currentVisitingSocialIdentity,
        loading: loadingCurrentVisitingSocialIdentity,
        error: loadCurrentVisitingSocialIdentityError,
        retry: retryIdentity,
    } = useCurrentVisitingSocialIdentity()

    const currentVisitingUserId = currentVisitingSocialIdentity?.identifier?.userId
    const isOwnerIdentity = currentVisitingSocialIdentity?.isOwner

    const {
        value: socialAccounts = EMPTY_LIST,
        loading: loadingSocialAccounts,
        error: loadSocialAccounts,
        retry: retrySocialAccounts,
    } = useSocialAccountsBySettings(currentVisitingSocialIdentity, undefined, sorter)

    const selectedSocialAccount = useMemo(() => {
        return socialAccounts.find((x) => isSameAddress(x.address, selectedAddress))
    }, [socialAccounts, selectedAddress])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retryIdentity()
            retrySocialAccounts()
        })
    }, [retrySocialAccounts, retryIdentity])

    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(() => {
            retryIdentity()
        })
    }, [retryIdentity])

    useEffect(() => {
        setSelectedAddress(first(socialAccounts)?.address)
    }, [socialAccounts])

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => {
                const shouldDisplay =
                    x.Utils?.shouldDisplay?.(currentVisitingSocialIdentity, selectedSocialAccount) ?? true
                return x.pluginID !== PluginID.NextID && shouldDisplay
            })
            .sort((a, z) => {
                // order those tabs from next id first
                if (a.pluginID === PluginID.NextID) return -1
                if (z.pluginID === PluginID.NextID) return 1

                // order those tabs from collectible first
                if (a.pluginID === PluginID.Collectible) return -1
                if (z.pluginID === PluginID.Collectible) return 1

                // place those tabs from debugger last
                if (a.pluginID === PluginID.Debugger) return 1
                if (z.pluginID === PluginID.Debugger) return -1

                return a.priority - z.priority
            })
    })
    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const isWeb3ProfileDisable = useIsMinimalMode(PluginID.Web3Profile)

    const isTwitterPlatform = isTwitter(activatedSocialNetworkUI)
    const doesOwnerHaveNoAddress =
        isOwnerIdentity && personaStatus.proof?.findIndex((p) => p.platform === NextIDPlatform.Ethereum) === -1

    const showNextID =
        isTwitterPlatform &&
        // enabled the plugin
        (isWeb3ProfileDisable ||
            // the owner persona and sns not verify on next ID
            (isOwnerIdentity && !personaStatus.verified) ||
            // the owner persona and sns verified on next ID but not verify the wallet
            doesOwnerHaveNoAddress ||
            // the visiting persona not have social address list
            (!isOwnerIdentity && !socialAccounts.length))

    const componentTabId = showNextID ? `${PluginID.NextID}_tabContent` : currentTab

    const component = useMemo(() => {
        const Component = getTabContent(componentTabId)
        if (!Component) return null

        return <Component identity={currentVisitingSocialIdentity} socialAccount={selectedSocialAccount} />
    }, [componentTabId, currentVisitingSocialIdentity?.publicKey, selectedSocialAccount])

    const lackHostPermission = usePluginHostPermissionCheck(activatedPlugins.filter((x) => x.ProfileCardTabs?.length))

    const lackPluginId = first(lackHostPermission ? [...lackHostPermission] : [])
    const lackPluginDefine = activatedPlugins.find((x) => x.ID === lackPluginId)

    const [, onGrant] = useGrantPermissions(lackPluginDefine?.enableRequirement.host_permissions)
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
        const listener = () => setMenuOpen(false)

        window.addEventListener('scroll', listener, false)

        return () => {
            window.removeEventListener('scroll', listener, false)
        }
    }, [])

    const buttonRef = useRef<HTMLButtonElement>(null)
    const onSelect = (address: string) => {
        setSelectedAddress(address)
        setMenuOpen(false)
    }
    const handleOpenDialog = () => {
        CrossIsolationMessages.events.web3ProfileDialogEvent.sendToAll({
            open: true,
        })
    }

    if (hidden) return null

    if (lackHostPermission?.size) {
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini>
                        <GrantPermissions
                            permissions={lackPluginDefine?.enableRequirement.host_permissions ?? []}
                            onGrant={onGrant}
                        />
                    </PluginCardFrameMini>
                </div>
            </ThemeProvider>
        )
    }

    if (!currentVisitingUserId || loadingSocialAccounts || loadingCurrentVisitingSocialIdentity || loadingPersonaStatus)
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini />
                </div>
            </ThemeProvider>
        )

    if (
        (loadCurrentVisitingSocialIdentityError || (isOwnerIdentity && loadPersonaStatusError) || loadSocialAccounts) &&
        socialAccounts.length === 0
    ) {
        const handleClick = () => {
            if (loadPersonaStatusError) retryLoadPersonaStatus()
            if (loadCurrentVisitingSocialIdentityError) retryIdentity()
            if (loadSocialAccounts) retrySocialAccounts()
        }
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini>
                        <Stack display="inline-flex" gap={3} justifyContent="center" alignItems="center">
                            <Typography
                                fontSize={14}
                                fontWeight={400}
                                lineHeight="18px"
                                color={(t) => t.palette.maskColor.danger}>
                                {t('load_failed')}
                            </Typography>
                            <Button color="primary" className={classes.reload} onClick={handleClick}>
                                {t('reload')}
                            </Button>
                        </Stack>
                    </PluginCardFrameMini>
                </div>
            </ThemeProvider>
        )
    }

    // Maybe should merge in NextIdPage
    if (socialAccounts.length === 0 && !showNextID && !isTwitterPlatform) {
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini>
                        <Stack display="inline-flex" gap={3} justifyContent="center" alignItems="center">
                            <Typography
                                fontSize={14}
                                fontWeight={400}
                                lineHeight="18px"
                                color={(t) => t.palette.maskColor.publicMain}>
                                {t('web3_profile_no_social_address_list')}
                            </Typography>
                        </Stack>
                    </PluginCardFrameMini>
                </div>
            </ThemeProvider>
        )
    }

    if (!socialAccounts.length && !showNextID) {
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini>
                        <Stack display="inline-flex" gap={3} justifyContent="center" alignItems="center">
                            <WalletSettingEntry />
                        </Stack>
                    </PluginCardFrameMini>
                </div>
            </ThemeProvider>
        )
    }

    return (
        <div className={classes.root}>
            <div>
                {tabs.length > 0 && !showNextID && (
                    <div className={classes.container}>
                        <div className={classes.title}>
                            <div className={classes.walletItem}>
                                <Button
                                    id="wallets"
                                    variant="text"
                                    size="small"
                                    ref={buttonRef}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setMenuOpen(true)
                                    }}
                                    className={classes.walletButton}>
                                    <AddressItem
                                        linkIconClassName={classes.mainLinkIcon}
                                        TypographyProps={{
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            color: (theme) => theme.palette.maskColor.dark,
                                        }}
                                        socialAccount={selectedSocialAccount}
                                    />
                                    <Icons.ArrowDrop className={classes.arrowDropIcon} />
                                </Button>
                                <ShadowRootMenu
                                    anchorEl={buttonRef.current}
                                    open={menuOpen}
                                    disableScrollLock
                                    PaperProps={{
                                        className: classes.addressMenu,
                                    }}
                                    aria-labelledby="wallets"
                                    onClose={() => setMenuOpen(false)}>
                                    {socialAccounts.map((x) => {
                                        return (
                                            <MenuItem
                                                className={classes.menuItem}
                                                key={x.address}
                                                value={x.address}
                                                onClick={() => onSelect(x.address)}>
                                                <div className={classes.addressItem}>
                                                    <AddressItem
                                                        socialAccount={x}
                                                        linkIconClassName={classes.secondLinkIcon}
                                                    />
                                                    <AccountIcon socialAccount={x} />
                                                </div>
                                                {isSameAddress(selectedAddress, x.address) && (
                                                    <Icons.CheckCircle className={classes.selectedIcon} />
                                                )}
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
                                {isOwnerIdentity && isTwitter(activatedSocialNetworkUI) ? (
                                    <ConnectPersonaBoundary
                                        customHint
                                        handlerPosition="top-right"
                                        directTo={PluginID.Web3Profile}>
                                        <Icons.Gear
                                            variant="light"
                                            onClick={handleOpenDialog}
                                            className={classes.gearIcon}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </ConnectPersonaBoundary>
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
