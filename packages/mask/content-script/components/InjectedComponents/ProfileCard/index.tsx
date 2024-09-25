import { useEffect, useMemo, useState, memo } from 'react'
import { useUpdateEffect } from 'react-use'
import { compact, first } from 'lodash-es'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import {
    useActivatedPluginsSiteAdaptor,
    usePluginTransField,
    getProfileCardTabContent,
} from '@masknet/plugin-infra/content-script'
import { addressSorter, useSocialAccountsBySettings } from '@masknet/shared'
import { getAvailablePlugins } from '@masknet/plugin-infra'
import { useLocationChange } from '@masknet/shared-base-ui'
import {
    PluginID,
    NetworkPluginID,
    type SocialIdentity,
    MaskMessages,
    type SocialAddress,
    SocialAddressType,
} from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { EVMWeb3ContextProvider, ScopedDomainsContainer } from '@masknet/web3-hooks-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import Services from '#services'
import { ProfileCardTitle } from './ProfileCardTitle.js'
import { MaskSharedTrans } from '../../../../shared-ui/index.js'
import { Trans } from '@lingui/macro'

interface Props extends withClasses<'text' | 'button' | 'root'> {
    identity?: SocialIdentity
    currentAddress?: string
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            height: '100%',
            overscrollBehavior: 'contain',
            borderRadius: theme.spacing(1.5),
            boxShadow: theme.palette.shadow.popup,
            backgroundColor: theme.palette.maskColor.bottom,
        },
        header: {
            background: theme.palette.maskColor.modalTitleBg,
            padding: theme.spacing(2, 2, 0, 2),
            boxSizing: 'border-box',
            flexShrink: 0,
        },
        content: {
            position: 'relative',
            flexGrow: 1,
            backgroundColor: theme.palette.maskColor.bottom,
            overflow: 'auto',
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            display: 'flex',
            position: 'relative',
            paddingTop: 0,
            marginTop: theme.spacing(2),
        },
        tabRoot: {
            color: 'blue',
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
            background: theme.palette.maskColor.bg,
            backdropFilter: 'blur(5px)',
            padding: theme.spacing(1.5),
            boxSizing: 'border-box',
            fontWeight: 700,
            zIndex: 2,
        },
        cardIcon: {
            filter: 'drop-shadow(0px 6px 12px rgba(0, 65, 185, 0.2))',
            marginLeft: theme.spacing(0.25),
        },
        cardName: {
            color: theme.palette.maskColor.main,
            fontWeight: 700,
            marginRight: 'auto',
            marginLeft: theme.spacing(0.5),
        },
        powered: {
            color: theme.palette.text.secondary,
            fontWeight: 700,
        },
        actions: {
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            color: theme.palette.maskColor.main,
        },
    }
})

export const ProfileCard = memo(({ identity, currentAddress, ...rest }: Props) => {
    const { classes } = useStyles(undefined, { props: { classes: rest.classes } })
    const translate = usePluginTransField()
    const fallbackAccounts = useMemo(() => {
        return [
            {
                address: currentAddress,
                type: SocialAddressType.Address,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
                label: '',
            },
        ] as Array<SocialAddress<ChainId>>
    }, [currentAddress])
    const {
        data: allSocialAccounts,
        isPending,
        refetch: retrySocialAddress,
    } = useSocialAccountsBySettings(identity, undefined, addressSorter, (a, b, c, d) =>
        Services.Identity.signWithPersona(a, b, c, location.origin, d),
    )
    const socialAccounts = useMemo(() => {
        const accounts = isPending && !allSocialAccounts.length ? fallbackAccounts : allSocialAccounts
        return accounts.filter((x) => x.pluginID === NetworkPluginID.PLUGIN_EVM)
    }, [allSocialAccounts, fallbackAccounts, isPending])

    const [selectedAddress, setSelectedAddress] = useState<string | undefined>(currentAddress)
    const firstAddress = first(socialAccounts)?.address
    const activeAddress = selectedAddress || firstAddress

    const selectedSocialAccount = useMemo(
        () => socialAccounts.find((x) => isSameAddress(x.address, activeAddress)),
        [activeAddress, socialAccounts],
    )

    const userId = identity?.identifier?.userId

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retrySocialAddress()
        })
    }, [retrySocialAddress])

    const activatedPlugins = useActivatedPluginsSiteAdaptor('any')
    const tabs = useMemo(() => {
        const displayProfileTabs = getAvailablePlugins(activatedPlugins, (plugins) => {
            return plugins
                .flatMap((x) => x.ProfileCardTabs?.map((y) => ({ ...y, pluginID: x.ID })) || [])
                .filter((x) => {
                    const isAllowed = x.pluginID === PluginID.RSS3 || x.pluginID === PluginID.Collectible
                    const shouldDisplay = x.Utils?.shouldDisplay?.(identity, selectedSocialAccount) ?? true
                    return isAllowed && shouldDisplay
                })
                .sort((a, z) => a.priority - z.priority)
        })
        return displayProfileTabs.map((x) => ({
            id: x.ID,
            label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label),
        }))
    }, [activatedPlugins, translate])
    const tabActions = getAvailablePlugins(activatedPlugins, (plugins) => {
        return compact(plugins.map((x) => x.ProfileTabActions))
    })

    const [currentTab, onChange] = useTabs(first(tabs)?.id ?? PluginID.Collectible, ...tabs.map((tab) => tab.id))

    const component = useMemo(() => {
        if (currentTab === `${PluginID.RSS3}_Social`)
            Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineHoverUserSocialSwitchTo)
        if (currentTab === `${PluginID.RSS3}_Activities`)
            Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineHoverUserActivitiesSwitchTo)
        if (currentTab === `${PluginID.RSS3}_Donation`)
            Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineHoverUserDonationsSwitchTo)
        const Component = getProfileCardTabContent(currentTab)
        return <Component identity={identity} socialAccount={selectedSocialAccount} />
    }, [currentTab, identity?.publicKey, selectedSocialAccount])

    useLocationChange(() => {
        onChange(undefined, first(tabs)?.id)
    })

    useUpdateEffect(() => {
        onChange(undefined, first(tabs)?.id)
    }, [userId])

    const scopedDomainsMap: Record<string, string> = useMemo(() => {
        return socialAccounts.reduce((map, account) => {
            if (!account.label) return map
            return {
                ...map,
                [account.address.toLowerCase()]: account.label,
            }
        }, {})
    }, [socialAccounts])

    return (
        <EVMWeb3ContextProvider chainId={ChainId.Mainnet}>
            <ScopedDomainsContainer initialState={scopedDomainsMap}>
                <div className={classes.root}>
                    <div className={classes.header}>
                        <ProfileCardTitle
                            socialAccounts={socialAccounts}
                            address={activeAddress}
                            onAddressChange={setSelectedAddress}
                            identity={identity}
                        />
                        {tabs.length > 0 && currentTab ?
                            <div className={classes.tabs}>
                                <TabContext value={currentTab}>
                                    <MaskTabList variant="base" onChange={onChange} aria-label="Web3Tabs">
                                        {tabs.map((tab) => (
                                            <Tab
                                                key={tab.id}
                                                label={tab.label}
                                                value={tab.id}
                                                classes={{ root: classes.tabRoot, textColorPrimary: classes.tabRoot }}
                                            />
                                        ))}
                                        {tabActions.length ?
                                            <span className={classes.actions}>
                                                {tabActions.map((Action, i) => (
                                                    <Action key={i} slot="profile-card" />
                                                ))}
                                            </span>
                                        :   null}
                                    </MaskTabList>
                                </TabContext>
                            </div>
                        :   null}
                    </div>
                    <div className={classes.content}>{component}</div>
                    <div className={classes.footer}>
                        <Icons.Web3ProfileCard className={classes.cardIcon} size={24} />
                        <Typography className={classes.cardName}>
                            <Trans>Web3 Profile Card</Trans>
                        </Typography>
                        <Typography variant="body1" className={classes.powered}>
                            {/* eslint-disable-next-line react/naming-convention/component-name */}
                            <MaskSharedTrans.powered_by_whom
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
                        <Icons.RSS3 size={24} sx={{ ml: '4px' }} />
                    </div>
                </div>
            </ScopedDomainsContainer>
        </EVMWeb3ContextProvider>
    )
})

ProfileCard.displayName = 'ProfileCard'
