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
import { isSameAddress, SocialAddressType, SocialIdentity } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Box, CircularProgress, Tab } from '@mui/material'
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
const useStyles = makeStyles()((theme) => ({
    root: {},
    container: {
        background:
            theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #202020 0%, #181818 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
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
        height: 400,
        overflow: 'auto',
    },
    settingItem: {
        display: 'flex',
        alignItems: 'center',
    },
    tipButton: {
        width: 40,
        height: 40,
        borderRadius: 40,
        border: `1px solid ${
            theme.palette.mode === 'light' ? theme.palette.maskColor.publicLine : theme.palette.maskColor.line
        }`,
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
        color: theme.palette.maskColor.secondaryDark,
    },
}))

export const ProfileCard: FC<Props> = ({ identity, ...rest }) => {
    const classes = useStylesExtends(useStyles(), { classes: rest.classes })

    const translate = usePluginI18NField()
    const {
        value: socialAddressList = EMPTY_LIST,
        loading: loadingSocialAddressList,
        retry: retrySocialAddress,
    } = useSocialAddressListAll(identity, undefined, sorter)

    const [selectedAddress, setSelectedAddress] = useState<string>()
    const firstAddress = first(socialAddressList)?.address
    useEffect(() => {
        if (!selectedAddress && firstAddress) setSelectedAddress(firstAddress)
    }, [selectedAddress, firstAddress])
    const selectedSocialAddress = useMemo(() => {
        return socialAddressList.find((x) => isSameAddress(x.address, selectedAddress))
    }, [selectedAddress, socialAddressList])

    const tipAccounts: TipAccount[] = useMemo(() => {
        return socialAddressList.map((x) => ({
            address: x.address,
            name: x.label,
            verified: x.type === SocialAddressType.NEXT_ID,
        }))
    }, [socialAddressList])

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
                <div className={classes.container}>
                    <div className={classes.title}>
                        <ProfileBar
                            identity={identity}
                            socialAddressList={socialAddressList}
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
        </div>
    )
}
