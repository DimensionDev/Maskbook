import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { first } from 'lodash-es'
import { TabContext } from '@mui/lab'
import { Link, Button, Stack, Tab, ThemeProvider, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import {
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
    usePluginI18NField,
    getProfileTabContent,
    useAllPersonas,
    useSiteAdaptorContext,
    useLastRecognizedIdentity,
    useSocialIdentityByUserId,
} from '@masknet/plugin-infra/content-script'
import { getAvailablePlugins } from '@masknet/plugin-infra'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    MaskMessages,
    NextIDPlatform,
    PluginID,
    ProfileTabs,
    currentPersonaIdentifier,
    isFacebook,
    isTwitter,
} from '@masknet/shared-base'
import { useValueRef, useLocationChange } from '@masknet/shared-base-ui'
import { makeStyles, MaskLightTheme, MaskTabList, useTabs } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ScopedDomainsContainer, useSnapshotSpacesByTwitterHandler } from '@masknet/web3-hooks-base'
import { WalletSettingEntry } from './ProfileTab/WalletSettingEntry.js'
import {
    AddressItem,
    ConnectPersonaBoundary,
    GrantPermissions,
    PluginCardFrameMini,
    ProfileTabContext,
    SearchResultInspector,
    SocialAccountList,
    TokenWithSocialGroupMenu,
    useCollectionByTwitterHandler,
    useCurrentPersonaConnectStatus,
    useGrantPermissions,
    usePluginHostPermissionCheck,
    useSharedI18N,
} from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: isFacebook() ? 876 : 'auto',
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
    reload: {
        borderRadius: 20,
        minWidth: 254,
    },
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    return (
        <ScopedDomainsContainer.Provider>
            <Content {...props} />
        </ScopedDomainsContainer.Provider>
    )
}

function openWeb3ProfileSettingDialog() {
    CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({
        open: true,
    })
}

function Content(props: ProfileTabContentProps) {
    const { classes } = useStyles(undefined, { props })

    const t = useSharedI18N()
    const translate = usePluginI18NField()

    const [profileTabType, setProfileTabType] = useState(ProfileTabs.WEB3)
    const [menuOpen, setMenuOpen] = useState(false)
    const closeMenu = useCallback(() => setMenuOpen(false), [])
    const allPersonas = useAllPersonas()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { openDashboard } = useSiteAdaptorContext()

    const {
        value: personaStatus,
        loading: loadingPersonaStatus,
        error: loadPersonaStatusError,
        retry: retryLoadPersonaStatus,
    } = useCurrentPersonaConnectStatus(allPersonas, currentIdentifier, openDashboard, lastRecognized)

    const {
        currentVisitingSocialIdentity,
        socialAccounts = [],
        currentSocialIdentity,
    } = ProfileTabContext.useContainer()

    const currentVisitingUserId = currentVisitingSocialIdentity?.identifier?.userId
    const isOwnerIdentity = currentVisitingSocialIdentity?.isOwner

    const [selectedAddress = first(socialAccounts)?.address, setSelectedAddress] = useState<string>()
    const selectedSocialAccount = socialAccounts.find((x) => isSameAddress(x.address, selectedAddress))
    const { setPair } = ScopedDomainsContainer.useContainer()
    useEffect(() => {
        if (selectedSocialAccount?.address && selectedSocialAccount?.label) {
            setPair(selectedSocialAccount.address, selectedSocialAccount.label)
        }
    }, [selectedSocialAccount?.address, selectedSocialAccount?.label])

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = getAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => {
                const shouldDisplay =
                    x.Utils?.shouldDisplay?.(currentVisitingSocialIdentity, selectedSocialAccount) ?? true
                return x.pluginID !== PluginID.NextID && shouldDisplay
            })
            .sort((a, z) => a.priority - z.priority)
    })

    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))
    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const isWeb3ProfileDisable = useIsMinimalMode(PluginID.Web3Profile)

    const isOnTwitter = isTwitter()
    const doesOwnerHaveNoAddress =
        isOwnerIdentity && personaStatus.proof?.findIndex((p) => p.platform === NextIDPlatform.Ethereum) === -1

    // the owner persona and sns not verify on next ID
    const myPersonaNotVerifiedYet = isOwnerIdentity && !personaStatus.verified
    const showNextID1 =
        isOnTwitter &&
        // enabled the plugin
        (isWeb3ProfileDisable ||
            myPersonaNotVerifiedYet ||
            // the owner persona and sns verified on next ID but not verify the wallet
            doesOwnerHaveNoAddress ||
            // the visiting persona not have social address list
            (!isOwnerIdentity && !socialAccounts.length))

    const showNextID = false
    const componentTabId = showNextID ? `${PluginID.NextID}_tabContent` : currentTab

    const contentComponent = useMemo(() => {
        const Component = getProfileTabContent(componentTabId)
        if (!Component) return null
        return <Component identity={currentSocialIdentity} socialAccount={selectedSocialAccount} />
    }, [componentTabId, selectedSocialAccount, currentSocialIdentity])

    const lackHostPermission = usePluginHostPermissionCheck(activatedPlugins.filter((x) => x.ProfileCardTabs?.length))

    const lackPluginId = first(lackHostPermission ? [...lackHostPermission] : [])
    const lackPluginDefine = activatedPlugins.find((x) => x.ID === lackPluginId)

    const [, onGrant] = useGrantPermissions(lackPluginDefine?.enableRequirement.host_permissions)
    useLocationChange(() => {
        onChange(undefined, first(tabs)?.id)
    })

    useUpdateEffect(() => {
        onChange(undefined, first(tabs)?.id)
        setSelectedAddress(undefined)
    }, [currentVisitingUserId])

    const [isHideInspector, hideInspector] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.hideSearchResultInspectorEvent.on((ev) => {
            hideInspector(ev.hide)
        })
    }, [])

    useEffect(() => {
        return MaskMessages.events.profileTabUpdated.on((data) => {
            data.type && setProfileTabType(data.type)
        })
    }, [currentVisitingUserId])

    useEffect(() => {
        const listener = () => setMenuOpen(false)
        window.addEventListener('scroll', listener, false)
        // <ClickAwayListener /> not work, when it is out of shadow root.
        window.addEventListener('click', listener, false)

        return () => {
            window.removeEventListener('scroll', listener, false)
            window.removeEventListener('click', listener, false)
        }
    }, [])

    const buttonRef = useRef<HTMLButtonElement>(null)
    const onSelect = (address: string) => {
        setSelectedAddress(address)
        setMenuOpen(false)
    }

    const { value: collectionList = EMPTY_LIST } = useCollectionByTwitterHandler(
        profileTabType === ProfileTabs.WEB3 ? currentVisitingUserId : '',
    )

    const { value: spaceList = EMPTY_LIST } = useSnapshotSpacesByTwitterHandler(
        profileTabType === ProfileTabs.DAO ? currentVisitingUserId ?? '' : '',
    )

    const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0)
    const trendingResult = collectionList?.[currentTrendingIndex]

    const { value: identity } = useSocialIdentityByUserId(currentVisitingUserId)

    const { value: nextIdBindings = EMPTY_LIST } = useAsync(async () => {
        if (!currentVisitingUserId) return EMPTY_LIST
        return NextIDProof.queryProfilesByTwitterId(currentVisitingUserId)
    }, [currentVisitingUserId])

    const keyword =
        profileTabType === ProfileTabs.WEB3 ? trendingResult?.address || trendingResult?.name : currentVisitingUserId

    const searchResults = profileTabType === ProfileTabs.WEB3 ? collectionList : spaceList

    if (keyword && !isHideInspector)
        return (
            <div className={classes.root}>
                <SearchResultInspector
                    keyword={keyword}
                    isProfilePage
                    profileTabType={profileTabType}
                    currentSearchResult={trendingResult}
                    searchResults={searchResults}
                    identity={identity}
                />
            </div>
        )

    if (lackHostPermission?.size) {
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini>
                        <GrantPermissions
                            permissions={lackPluginDefine?.enableRequirement.host_permissions ?? EMPTY_LIST}
                            onGrant={onGrant}
                        />
                    </PluginCardFrameMini>
                </div>
            </ThemeProvider>
        )
    }

    if (!currentVisitingUserId || loadingPersonaStatus)
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <div className={classes.root}>
                    <PluginCardFrameMini />
                </div>
            </ThemeProvider>
        )

    if (isOwnerIdentity && loadPersonaStatusError && socialAccounts.length === 0) {
        const handleClick = () => {
            if (loadPersonaStatusError) retryLoadPersonaStatus()
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
                                {t.load_failed()}
                            </Typography>
                            <Button color="primary" className={classes.reload} onClick={handleClick}>
                                {t.reload()}
                            </Button>
                        </Stack>
                    </PluginCardFrameMini>
                </div>
            </ThemeProvider>
        )
    }

    // Maybe should merge in NextIdPage
    if (socialAccounts.length === 0 && !showNextID && !isOnTwitter) {
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
                                {t.web3_profile_no_social_address_list()}
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
            {tabs.length > 0 && !showNextID && (
                <div className={classes.container}>
                    <div className={classes.title}>
                        <div className={classes.walletItem}>
                            <Button
                                id="wallets"
                                variant="text"
                                size="small"
                                ref={buttonRef}
                                className={classes.walletButton}>
                                <AddressItem
                                    isMenu
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        setMenuOpen(true)
                                    }}
                                    linkIconClassName={classes.mainLinkIcon}
                                    TypographyProps={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: (theme) => theme.palette.maskColor.dark,
                                    }}
                                    socialAccount={selectedSocialAccount}
                                />
                            </Button>

                            <TokenWithSocialGroupMenu
                                open={menuOpen}
                                onClose={closeMenu}
                                anchorEl={buttonRef.current}
                                onAddressChange={onSelect}
                                currentAddress={selectedAddress}
                                collectionList={collectionList}
                                socialAccounts={socialAccounts}
                                currentCollection={trendingResult}
                                onTokenChange={(currentResult, i) => {
                                    setCurrentTrendingIndex(i)
                                    hideInspector(false)
                                    setMenuOpen(false)
                                }}
                                fromSocialCard
                            />

                            <SocialAccountList nextIdBindings={nextIdBindings} userId={currentVisitingUserId} />
                        </div>
                        <div className={classes.settingItem}>
                            <Typography
                                fontSize="14px"
                                fontWeight={700}
                                marginRight="5px"
                                color={(theme) => theme.palette.maskColor.secondaryDark}>
                                {t.powered_by()}
                            </Typography>
                            <Typography
                                fontSize="14px"
                                fontWeight={700}
                                marginRight="4px"
                                color={(theme) => theme.palette.maskColor.dark}>
                                {t.mask_network()}
                            </Typography>
                            {isOwnerIdentity && isOnTwitter ? (
                                <ConnectPersonaBoundary
                                    personas={allPersonas}
                                    identity={lastRecognized}
                                    currentPersonaIdentifier={currentIdentifier}
                                    openDashboard={openDashboard}
                                    customHint
                                    handlerPosition="top-right"
                                    directTo={PluginID.Web3Profile}>
                                    <Icons.Gear
                                        variant="light"
                                        onClick={openWeb3ProfileSettingDialog}
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
            <div className={classes.content}>{contentComponent}</div>
        </div>
    )
}
