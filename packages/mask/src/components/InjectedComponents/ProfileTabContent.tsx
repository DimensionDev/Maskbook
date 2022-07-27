import { useEffect, useMemo, useState } from 'react'
import { useAsyncRetry, useUpdateEffect } from 'react-use'
import { first, uniqBy } from 'lodash-unified'
import {
    createInjectHooksRenderer,
    PluginId,
    useActivatedPluginsSNSAdaptor,
    useIsMinimalMode,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useSocialAddressListAll, useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { ReversedAddress, useSharedI18N } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, MaskTabList, ShadowRootMenu, useStylesExtends, useTabs } from '@masknet/theme'
import { Box, Button, CircularProgress, Link, MenuItem, Tab, Typography } from '@mui/material'
import { ArrowDrop, Gear, LinkOut, NextIdPersonaVerified, Selected } from '@masknet/icons'
import { isSameAddress, NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'
import { MaskMessages } from '../../utils'
import { useLocationChange } from '../../utils/hooks/useLocationChange'
import {
    useCurrentVisitingIdentity,
    useCurrentVisitingSocialIdentity,
    useIsCurrentVisitingOwnerIdentity,
} from '../DataSource/useActivatedUI'
import { NextIDProof } from '@masknet/web3-providers'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'
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
}))

export interface ProfileTabContentProps extends withClasses<'text' | 'button' | 'root'> {}

export function ProfileTabContent(props: ProfileTabContentProps) {
    const classes = useStylesExtends(useStyles(), props)

    const t = useSharedI18N()
    const translate = usePluginI18NField()

    const [hidden, setHidden] = useState(true)
    const [selectedAddress, setSelectedAddress] = useState<SocialAddress<NetworkPluginID> | undefined>()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const isOwnerIdentity = useIsCurrentVisitingOwnerIdentity()
    const currentVisitingIdentity = useCurrentVisitingIdentity()
    const currentVisitingUserId = currentVisitingIdentity.identifier?.userId

    const { value: socialAddressList = EMPTY_LIST, loading: loadingSocialAddressList } = useSocialAddressListAll(
        currentVisitingIdentity,
        [SocialAddressType.NEXT_ID],
    )

    const { value: currentVisitingSocialIdentity, loading: loadingCurrentVisitingSocialIdentity } =
        useCurrentVisitingSocialIdentity()

    const { value: personaProof, retry: retryProof } = useAsyncRetry(async () => {
        if (!currentVisitingSocialIdentity?.publicKey) return
        return NextIDProof.queryExistedBindingByPersona(currentVisitingSocialIdentity?.publicKey)
    }, [currentVisitingSocialIdentity?.publicKey])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retryProof()
        })
    }, [retryProof])

    const wallets = personaProof?.proofs?.filter((proof) => proof?.platform === NextIDPlatform.Ethereum)

    const addressList = useMemo(() => {
        if (!wallets?.length || (!isOwnerIdentity && socialAddressList?.length)) {
            setSelectedAddress(first(socialAddressList))
            return socialAddressList
        }
        const addresses = wallets.map((proof) => {
            return {
                networkSupporterPluginID: NetworkPluginID.PLUGIN_EVM,
                type: SocialAddressType.KV,
                label: proof?.identity,
                address: proof?.identity,
            }
        })
        const addressList = [...addresses, ...socialAddressList]
        setSelectedAddress(first(addressList))
        return addressList
    }, [socialAddressList, wallets?.map((x) => x.identity).join(), isOwnerIdentity])

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => x.Utils?.shouldDisplay?.(currentVisitingIdentity, selectedAddress) ?? true)
            .filter((x) => x.pluginID !== PluginId.NextID)
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

    const showNextID = !!(
        isTwitter(activatedSocialNetworkUI) &&
        (isWeb3ProfileDisable ||
            (isOwnerIdentity && !currentVisitingSocialIdentity?.hasBinding) ||
            (isOwnerIdentity && !wallets?.length) ||
            !addressList?.length)
    )

    const componentTabId = showNextID ? `${PluginId.NextID}_tabContent` : currentTab

    const component = useMemo(() => {
        const Component = getTabContent(componentTabId)

        return (
            <Component
                identity={currentVisitingSocialIdentity}
                persona={currentVisitingSocialIdentity?.publicKey}
                socialAddress={selectedAddress}
            />
        )
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

    const onOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
    const onSelect = (option: SocialAddress<NetworkPluginID>) => {
        setSelectedAddress(option)
        // onClose()
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
                                    <Typography fontSize="18px" fontWeight={700} color="#07101b">
                                        {selectedAddress?.type === SocialAddressType.KV ||
                                        selectedAddress?.type === SocialAddressType.ADDRESS ||
                                        selectedAddress?.type === SocialAddressType.NEXT_ID ? (
                                            <ReversedAddress
                                                fontSize="18px"
                                                address={selectedAddress.address}
                                                pluginId={selectedAddress.networkSupporterPluginID}
                                            />
                                        ) : (
                                            selectedAddress?.label
                                        )}
                                    </Typography>
                                    <Link
                                        className={classes.link}
                                        href={
                                            selectedAddress
                                                ? explorerResolver.addressLink(
                                                      ChainId.Mainnet,
                                                      selectedAddress?.address,
                                                  ) ?? ''
                                                : ''
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <LinkOut color="#767f8d" size={20} />
                                    </Link>
                                    <ArrowDrop color="#07101b" />
                                </Button>
                                <ShadowRootMenu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    PaperProps={{
                                        style: {
                                            maxHeight: 192,
                                            width: 248,
                                        },
                                    }}
                                    aria-labelledby="demo-positioned-button"
                                    onClose={() => setAnchorEl(null)}>
                                    {uniqBy(addressList ?? [], (x) => x.address.toLowerCase()).map((x) => {
                                        return (
                                            <MenuItem key={x.address} value={x.address} onClick={() => onSelect(x)}>
                                                <div className={classes.menuItem}>
                                                    <div className={classes.addressItem}>
                                                        {x?.type === SocialAddressType.KV ||
                                                        x?.type === SocialAddressType.ADDRESS ||
                                                        selectedAddress?.type === SocialAddressType.NEXT_ID ? (
                                                            <ReversedAddress
                                                                address={x.address}
                                                                pluginId={x.networkSupporterPluginID}
                                                            />
                                                        ) : (
                                                            <Typography fontSize="14px" fontWeight={700}>
                                                                {x.label}
                                                            </Typography>
                                                        )}
                                                        <Link
                                                            className={classes.link}
                                                            href={
                                                                selectedAddress
                                                                    ? explorerResolver.addressLink(
                                                                          ChainId.Mainnet,
                                                                          x?.address,
                                                                      ) ?? ''
                                                                    : ''
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer">
                                                            <LinkOut className={classes.linkIcon} />
                                                        </Link>
                                                        {x?.type === SocialAddressType.KV && (
                                                            <NextIdPersonaVerified color="#3dc233" />
                                                        )}
                                                    </div>
                                                    {isSameAddress(selectedAddress?.address, x.address) && (
                                                        <Selected color="#1c68f3" />
                                                    )}
                                                </div>
                                            </MenuItem>
                                        )
                                    })}
                                </ShadowRootMenu>
                            </div>
                            <div className={classes.settingItem}>
                                <Typography fontSize="14px" fontWeight={700} marginRight="5px" color="#767f8d">
                                    {t.powered_by()}
                                </Typography>
                                <Typography fontSize="14px" fontWeight={700} marginRight="4px" color="#07101b">
                                    {t.mask_network()}
                                </Typography>
                                {isOwnerIdentity ? (
                                    <Gear onClick={handleOpenDialog} sx={{ cursor: 'pointer' }} />
                                ) : (
                                    <Link
                                        className={classes.settingLink}
                                        href="https://mask.io"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <LinkOut color="#767f8d" size={20} />
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
