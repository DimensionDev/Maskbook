import { Icons } from '@masknet/icons'
import {
    createInjectHooksRenderer,
    PluginID,
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
} from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins, useSocialAddressListAll } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { first, uniqBy } from 'lodash-unified'
import { FC, useEffect, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { useUpdateEffect } from 'react-use'
import { MaskMessages, sorter, useLocationChange } from '../../../utils/index.js'
import { ProfileCardTitle } from './ProfileCardTitle.js'

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
            overscrollBehavior: 'contain',
        },
        loading: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        header: {
            background: isDark
                ? 'linear-gradient(180deg, #202020 0%, #181818 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
            padding: theme.spacing(2, 2, 0, 2),
            boxSizing: 'border-box',
            flexShrink: 0,
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
            fontWeight: 700,
            zIndex: 2,
        },
        powerBy: {
            color: theme.palette.text.secondary,
            fontSize: 14,
            fontWeight: 700,
        },
    }
})

export const ProfileCard: FC<Props> = ({ identity, ...rest }) => {
    const { classes, cx } = useStyles(undefined, { props: { classes: rest.classes } })

    const translate = usePluginI18NField()
    const {
        value: socialAddressList = EMPTY_LIST,
        loading: loadingSocialAddressList,
        retry: retrySocialAddress,
    } = useSocialAddressListAll(identity, undefined, sorter)

    const availableSocialAddressList = useMemo(() => {
        return uniqBy(
            socialAddressList.filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM),
            (x) => x.address.toLowerCase(),
        )
    }, [socialAddressList])

    const [selectedAddress, setSelectedAddress] = useState<string>()
    const firstAddress = first(availableSocialAddressList)?.address
    const activeAddress = selectedAddress ?? firstAddress
    const selectedSocialAddress = useMemo(() => {
        return availableSocialAddressList.find((x) => isSameAddress(x.address, activeAddress))
    }, [activeAddress, availableSocialAddressList])

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
                const isAllowed = x.pluginID === PluginID.RSS3 || x.pluginID === PluginID.Collectible
                const shouldDisplay = x.Utils?.shouldDisplay?.(identity, selectedSocialAddress) ?? true
                return isAllowed && shouldDisplay
            })
            .sort((a, z) => a.priority - z.priority)
    })
    const tabs = displayPlugins.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
    }))

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

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

    if (!userId || loadingSocialAddressList)
        return (
            <div className={cx(classes.root, classes.loading)}>
                <LoadingBase />
            </div>
        )

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <ProfileCardTitle
                    socialAddressList={availableSocialAddressList}
                    address={activeAddress}
                    onAddressChange={setSelectedAddress}
                    identity={identity}
                />
                {tabs.length > 0 && (
                    <div className={classes.tabs}>
                        <TabContext value={currentTab}>
                            <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                {tabs.map((tab) => (
                                    <Tab key={tab.id} label={tab.label} value={tab.id} />
                                ))}
                            </MaskTabList>
                        </TabContext>
                    </div>
                )}
            </div>
            <div className={classes.content}>{component}</div>
            <div className={classes.footer}>
                <Typography variant="body1" className={classes.powerBy}>
                    <Trans
                        i18nKey="powered_by_whom"
                        values={{ whom: 'RSS3' }}
                        components={{
                            span: (
                                <Typography
                                    fontWeight={700}
                                    fontSize="inherit"
                                    variant="body1"
                                    component="strong"
                                    color={(theme) => theme.palette.text.primary}
                                />
                            ),
                        }}
                    />
                </Typography>
                <Icons.RSS3 size={24} sx={{ ml: '12px' }} />
            </div>
        </div>
    )
}
