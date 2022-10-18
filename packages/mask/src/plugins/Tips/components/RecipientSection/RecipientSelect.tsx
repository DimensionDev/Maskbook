import { FC, memo, useRef } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Link, MenuItem, Select, TooltipProps, Typography } from '@mui/material'
import { useChainId, useDefaultChainId, useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress, SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useTip } from '../../contexts/index.js'
import { Translate, useI18N } from '../../locales/index.js'

const useStyles = makeStyles<void, 'icon' | 'tooltip' | 'pluginIcon' | 'text'>()((theme, _, refs) => {
    return {
        root: {
            height: 40,
            flexGrow: 1,
        },
        menuItem: {
            height: 32,
            color: theme.palette.maskColor.main,
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0, 0.5),
            '&:not(:first-of-type)': {
                marginTop: theme.spacing(1),
            },
        },
        text: {
            fontWeight: 700,
            fontFamily: 'Helvetica',
            marginLeft: theme.spacing(0.5),
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
            [`& .${refs.pluginIcon}`]: {
                display: 'none',
            },
            [`& .${refs.text}`]: {
                fontWeight: 400,
            },
        },
        menuPaper: {
            '::-webkit-scrollbar': {
                display: 'none',
                opacity: 0,
            },
        },
        menu: {
            maxHeight: 312,
            padding: theme.spacing(1.5),
            borderRadius: theme.spacing(2),
        },
        icon: {
            width: 20,
            height: 20,
        },
        pluginIcon: {},
        link: {
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 0,
        },
        actionIcon: {
            marginLeft: theme.spacing(0.5),
            color: theme.palette.maskColor.main,
        },
        twitterIcon: {
            borderRadius: '50%',
        },
        checkIcon: {
            marginLeft: 'auto',
            color: '#60DFAB',
            filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        },
        tooltip: {
            maxWidth: 'unset',
        },
    }
})

const PluginIcon = ({ pluginID }: { pluginID: NetworkPluginID }) => {
    const { classes } = useStyles()
    const mapping = {
        [NetworkPluginID.PLUGIN_EVM]: (
            <Icons.ETH
                size={20}
                className={classes.pluginIcon}
                style={{
                    filter: 'drop-shadow(0px 6px 12px rgba(98, 126, 234, 0.2))',
                    backdropFilter: 'blur(16px)',
                }}
            />
        ),
        [NetworkPluginID.PLUGIN_FLOW]: (
            <Icons.Flow
                size={20}
                className={classes.pluginIcon}
                style={{
                    filter: 'drop-shadow(0px 6px 12px rgba(25, 251, 155, 0.2))',
                    backdropFilter: 'blur(16px)',
                }}
            />
        ),
        [NetworkPluginID.PLUGIN_SOLANA]: (
            <Icons.Solana
                size={20}
                className={classes.pluginIcon}
                style={{
                    filter: 'drop-shadow(0px 6px 12px rgba(25, 251, 155, 0.2))',
                    backdropFilter: 'blur(16px)',
                }}
            />
        ),
    }
    return mapping[pluginID]
}

enum AddressPlatform {
    Facebook = 'facebook',
    Twitter = 'twitter',
    NextId = 'next_id',
}

interface AddressSourceTooltipProps extends Omit<TooltipProps, 'title'> {
    type?: SocialAddressType
    platform?: AddressPlatform
}

const SourceTooltip: FC<AddressSourceTooltipProps> = ({ platform, type, children }) => {
    const { classes } = useStyles()
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            disableInteractive
            title={
                <Typography fontSize={14} lineHeight="18px">
                    {type ? (
                        <Translate.source_tooltip
                            values={{ source: type ?? '' }}
                            components={{
                                Link: (
                                    <Typography component="span" color={(theme) => theme.palette.maskColor.primary} />
                                ),
                            }}
                            context={platform}>
                            {children}
                        </Translate.source_tooltip>
                    ) : (
                        <Translate.source_tooltip_only
                            values={{ context: platform! }}
                            components={{
                                Link: (
                                    <Typography component="span" color={(theme) => theme.palette.maskColor.primary} />
                                ),
                            }}
                            context={platform!}>
                            {children}
                        </Translate.source_tooltip_only>
                    )}
                </Typography>
            }
            arrow>
            {children}
        </ShadowRootTooltip>
    )
}

const TipsAccountSource: FC<{ account: SocialAccount }> = ({ account }) => {
    const { classes, cx, theme } = useStyles()
    const iconStyle =
        theme.palette.mode === 'light'
            ? {
                  boxShadow: '0px 6px 12px rgba(28, 104, 243, 0.2)',
                  backdropFilter: 'blur(8px)',
              }
            : undefined

    const fromNextID = account.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID)
    const fromTwitter = [
        SocialAddressType.ENS,
        SocialAddressType.RSS3,
        SocialAddressType.SOL,
        SocialAddressType.TwitterBlue,
    ].find((x) => account.supportedAddressTypes?.includes(x))

    if (fromNextID) {
        return (
            <SourceTooltip platform={AddressPlatform.NextId}>
                <Icons.NextIDMini
                    className={cx(classes.actionIcon, classes.icon)}
                    style={{ ...iconStyle, width: 32, height: 18 }}
                />
            </SourceTooltip>
        )
    }

    return (
        <>
            {fromNextID ? (
                <SourceTooltip platform={AddressPlatform.NextId}>
                    <Icons.NextIDMini
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 32, height: 18 }}
                    />
                </SourceTooltip>
            ) : null}

            {fromTwitter ? (
                <SourceTooltip platform={AddressPlatform.Twitter} type={fromTwitter}>
                    <Icons.TwitterRound
                        className={cx(classes.actionIcon, classes.icon, classes.twitterIcon)}
                        style={iconStyle}
                    />
                </SourceTooltip>
            ) : null}

            {account.supportedAddressTypes?.includes(SocialAddressType.CyberConnect) ? (
                <SourceTooltip platform={AddressPlatform.Twitter} type={SocialAddressType.CyberConnect}>
                    <Icons.CyberConnect
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 32, height: 18 }}
                    />
                </SourceTooltip>
            ) : null}

            {account.supportedAddressTypes?.includes(SocialAddressType.Leaderboard) ? (
                <SourceTooltip platform={AddressPlatform.Twitter} type={SocialAddressType.Leaderboard}>
                    <Icons.Leaderboard
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 32, height: 18 }}
                    />
                </SourceTooltip>
            ) : null}

            {account.supportedAddressTypes?.includes(SocialAddressType.Sybil) ? (
                <SourceTooltip platform={AddressPlatform.Twitter} type={SocialAddressType.Sybil}>
                    <Icons.Sybil
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 32, height: 18 }}
                    />
                </SourceTooltip>
            ) : null}
        </>
    )
}

const ExternalLink: FC<{ account: SocialAccount }> = ({ account }) => {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State(account.pluginID)
    const chainId = useDefaultChainId(account.pluginID)

    return (
        <Link
            className={cx(classes.link, classes.actionIcon, classes.icon)}
            onClick={(e) => e.stopPropagation()}
            href={Others?.explorerResolver.addressLink(chainId, account.address) ?? ''}
            target="_blank"
            title={t.view_on_explorer()}
            rel="noopener noreferrer">
            <Icons.LinkOut size={20} />
        </Link>
    )
}

interface Props {
    className?: string
}
export const RecipientSelect: FC<Props> = memo(({ className }) => {
    const { classes, cx } = useStyles()
    const selectRef = useRef(null)
    const { recipient, recipients, setRecipient } = useTip()
    const recipientAddress = recipient?.address

    return (
        <Select
            className={cx(classes.root, className)}
            ref={selectRef}
            value={recipientAddress}
            classes={{ select: classes.select }}
            onChange={(e) => {
                setRecipient(e.target.value)
            }}
            MenuProps={{
                classes: {
                    paper: classes.menuPaper,
                    list: classes.menu,
                },
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                },
                container: selectRef.current,
                anchorEl: selectRef.current,
                BackdropProps: {
                    invisible: true,
                },
            }}>
            {recipients.map((account) => (
                <MenuItem className={classes.menuItem} key={account.address} value={account.address}>
                    <PluginIcon pluginID={account.pluginID} />
                    <Typography component="span" className={classes.text}>
                        {account.label || account.address}
                    </Typography>
                    <ExternalLink account={account} />
                    <TipsAccountSource account={account} />
                    {isSameAddress(account.address, recipientAddress) ? (
                        <Icons.CheckCircle className={cx(classes.checkIcon, classes.icon)} />
                    ) : null}
                </MenuItem>
            ))}
        </Select>
    )
})
