import { FC, useEffect, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { useUpdateEffect } from 'react-use'
import { first } from 'lodash-es'
import { Icons } from '@masknet/icons'
import {
    useActivatedPluginsSNSAdaptor,
    usePluginI18NField,
    getProfileCardTabContent,
} from '@masknet/plugin-infra/content-script'
import { getAvailablePlugins } from '@masknet/plugin-infra'
import { useSocialAccountsBySettings } from '@masknet/shared'
import { EMPTY_LIST, PluginID, NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { isSameAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { Tab, Typography } from '@mui/material'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { MaskMessages, addressSorter, useI18N, useLocationChange } from '../../../utils/index.js'
import { ProfileCardTitle } from './ProfileCardTitle.js'

interface Props extends withClasses<'text' | 'button' | 'root'> {
    identity: SocialIdentity
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
            borderRadius: theme.spacing(1.5),
            boxShadow: theme.palette.shadow.popup,
            backgroundColor: theme.palette.background.paper,
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
        content: {
            position: 'relative',
            flexGrow: 1,
            backgroundColor: theme.palette.maskColor.bottom,
            overflow: 'auto',
            paddingBottom: 48,
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
            background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
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
    }
})

export const ProfileCard: FC<Props> = ({ identity, ...rest }) => {
    const { classes, cx } = useStyles(undefined, { props: { classes: rest.classes } })

    const { t } = useI18N()
    const translate = usePluginI18NField()
    const {
        value: allSocialAccounts = EMPTY_LIST,
        loading: loadingSocialAccounts,
        retry: retrySocialAddress,
    } = useSocialAccountsBySettings(identity, undefined, addressSorter)
    const socialAccounts = useMemo(
        () => allSocialAccounts.filter((x) => x.pluginID === NetworkPluginID.PLUGIN_EVM),
        [allSocialAccounts],
    )

    const [selectedAddress, setSelectedAddress] = useState<string>()
    const firstAddress = first(socialAccounts)?.address
    const activeAddress = selectedAddress ?? firstAddress
    const selectedSocialAccount = useMemo(
        () => socialAccounts.find((x) => isSameAddress(x.address, activeAddress)),
        [activeAddress, socialAccounts],
    )

    const userId = identity.identifier?.userId

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            retrySocialAddress()
        })
    }, [retrySocialAddress])

    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = getAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .flatMap((x) => x.ProfileCardTabs?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
            .filter((x) => {
                const isAllowed = x.pluginID === PluginID.RSS3 || x.pluginID === PluginID.Collectible
                const shouldDisplay = x.Utils?.shouldDisplay?.(identity, selectedSocialAccount) ?? true
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
        const Component = getProfileCardTabContent(currentTab)
        return <Component identity={identity} socialAccount={selectedSocialAccount} />
    }, [currentTab, identity?.publicKey, selectedSocialAccount])

    useLocationChange(() => {
        onChange(undefined, first(tabs)?.id)
    })

    useUpdateEffect(() => {
        onChange(undefined, first(tabs)?.id)
    }, [userId])

    if (!userId || loadingSocialAccounts)
        return (
            <div className={cx(classes.root, classes.loading)}>
                <LoadingBase />
            </div>
        )

    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <div className={classes.root}>
                <div className={classes.header}>
                    <ProfileCardTitle
                        socialAccounts={socialAccounts}
                        address={activeAddress}
                        onAddressChange={setSelectedAddress}
                        identity={identity}
                    />
                    {tabs.length > 0 && currentTab && (
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
                                </MaskTabList>
                            </TabContext>
                        </div>
                    )}
                </div>
                <div className={classes.content}>{component}</div>
                <div className={classes.footer}>
                    <Icons.Web3ProfileCard className={classes.cardIcon} size={24} />
                    <Typography className={classes.cardName}>{t('avatar_profile_card_name')}</Typography>
                    <Typography variant="body1" className={classes.powered}>
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
                    <Icons.RSS3 size={24} sx={{ ml: '4px' }} />
                </div>
            </div>
        </Web3ContextProvider>
    )
}
