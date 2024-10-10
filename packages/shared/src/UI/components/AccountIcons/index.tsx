import { Icons } from '@masknet/icons'
import { SocialAddressType, type SocialAccount } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { resolveSocialAddressLink } from '@masknet/web3-shared-base'
import { Typography, type TooltipProps, Link } from '@mui/material'
import { compact } from 'lodash-es'
import { Linking } from '../../../index.js'
import { useSharedTrans } from '../../../locales/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        icon: {
            width: 20,
            height: 20,
        },
        iconStack: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        stackedIcon: {
            marginRight: -6,
            display: 'inline-flex',
            alignItems: 'center',
        },
        linking: {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
        },
        link: {
            color: theme.palette.maskColor.primary,
            textDecoration: 'none',
        },
        actionIcon: {
            marginLeft: theme.spacing(0.5),
            color: theme.palette.maskColor.main,
        },
        roundedIcon: {
            borderRadius: '50%',
        },
        tooltip: {
            maxWidth: 'unset',
        },
        ellipsis: {
            position: 'relative',
            zIndex: 1,
            fontSize: 14,
        },
    }
})

enum AddressPlatform {
    Facebook = 'facebook',
    Twitter = 'twitter',
    NextId = 'next_id',
}

interface AccountTooltipsProps extends Omit<TooltipProps, 'title'> {
    type?: SocialAddressType
    platform?: AddressPlatform
}

function AccountTooltips({ platform, type, children }: AccountTooltipsProps) {
    const { classes } = useStyles()
    const t = useSharedTrans()
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            disableInteractive
            title={
                <Typography fontSize={14} lineHeight="18px">
                    {SocialAddressType.Address === type ?
                        t.account_icon_tooltips_only({
                            context: platform!,
                        })
                    :   <Trans>Data source is retrieved from {type?.replace('_', ' ') ?? ''}.</Trans>}
                </Typography>
            }
            arrow>
            {children}
        </ShadowRootTooltip>
    )
}

// class icon would be used to hide icon in selected item.
export interface AccountIconProps extends withClasses<'icon'> {
    socialAccount: SocialAccount<Web3Helper.ChainIdAll>
}

export function AccountIcons({ socialAccount, classes: externalClasses }: AccountIconProps) {
    const t = useSharedTrans()
    const { classes, cx, theme } = useStyles(undefined, { props: { classes: externalClasses } })

    const { supportedAddressTypes } = socialAccount
    if (!supportedAddressTypes?.length) return null

    const iconStyle =
        theme.palette.mode === 'light' ?
            {
                boxShadow: '0px 6px 12px rgba(28, 104, 243, 0.2)',
                backdropFilter: 'blur(8px)',
            }
        :   undefined

    const fromTwitter = [
        SocialAddressType.ENS,
        SocialAddressType.SPACE_ID,
        SocialAddressType.ARBID,
        SocialAddressType.Lens,
        SocialAddressType.TwitterBlue,
        SocialAddressType.Address,
        SocialAddressType.SOL,
    ].find((x) => supportedAddressTypes.includes(x))
    const fromNextId = supportedAddressTypes.includes(SocialAddressType.NEXT_ID)

    const normalClasses = cx(classes.actionIcon, classes.icon)
    const roundedClasses = cx(classes.actionIcon, classes.icon, classes.roundedIcon)
    const configs = compact([
        fromNextId ?
            {
                link: resolveSocialAddressLink(SocialAddressType.NEXT_ID),
                platform: AddressPlatform.NextId,
                icon: <Icons.NextIDMini className={normalClasses} style={{ ...iconStyle, width: 32, height: 18 }} />,
            }
        :   null,
        fromTwitter ?
            {
                platform: AddressPlatform.Twitter,
                type: fromTwitter,
                icon: <Icons.TwitterXRound className={roundedClasses} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.CyberConnect) ?
            {
                link: resolveSocialAddressLink(SocialAddressType.CyberConnect),
                type: SocialAddressType.CyberConnect,
                icon: <Icons.CyberConnect className={normalClasses} size={18} style={iconStyle} />,
            }
        :   null,

        supportedAddressTypes.includes(SocialAddressType.Leaderboard) ?
            {
                link: resolveSocialAddressLink(SocialAddressType.Leaderboard),
                type: SocialAddressType.Leaderboard,
                icon: <Icons.Leaderboard className={normalClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.Sybil) ?
            {
                link: resolveSocialAddressLink(SocialAddressType.Sybil),
                type: SocialAddressType.Sybil,
                icon: <Icons.Sybil className={roundedClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.Mask) ?
            {
                type: SocialAddressType.Mask,
                icon: <Icons.MaskBlue className={roundedClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.Firefly) ?
            {
                type: SocialAddressType.Firefly,
                icon: <Icons.Firefly className={normalClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.OpenSea) ?
            {
                type: SocialAddressType.OpenSea,
                icon: <Icons.OpenSea className={roundedClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.RSS3) ?
            {
                type: SocialAddressType.RSS3,
                icon: <Icons.RSS3 className={roundedClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.SPACE_ID) ?
            {
                type: SocialAddressType.SPACE_ID,
                icon: <Icons.SpaceId className={roundedClasses} size={18} style={iconStyle} />,
            }
        :   null,
        supportedAddressTypes.includes(SocialAddressType.Lens) ?
            {
                type: SocialAddressType.Lens,
                icon: <Icons.Lens className={roundedClasses} size={18} style={iconStyle} />,
            }
        :   null,
    ])

    if (configs.length <= 3) {
        return (
            <>
                {configs.map(({ platform, type, link, icon }, i) => {
                    const node = (
                        <AccountTooltips key={i} platform={platform} type={type}>
                            {icon}
                        </AccountTooltips>
                    )
                    if (link)
                        return (
                            <Linking key={i} href={link} LinkProps={{ className: classes.linking }}>
                                {node}
                            </Linking>
                        )
                    return node
                })}
            </>
        )
    }
    const sources = compact(
        configs.flatMap((config, i) => {
            return config.type && config.link ?
                    [
                        <Link
                            className={classes.link}
                            href={config.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={config.type}>
                            {config.type}
                        </Link>,
                        i === configs.length ? '' : ', ',
                    ]
                :   null
        }),
    )
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            title={
                <Typography fontSize={14} lineHeight="18px" component="div">
                    {t.account_icon_merged_tooltip({
                        context:
                            fromTwitter ? AddressPlatform.Twitter
                            : fromNextId ? AddressPlatform.NextId
                            : 'normal',
                    })}
                    <>{sources}</>
                </Typography>
            }>
            <span className={classes.iconStack}>
                {configs.slice(0, 3).map(({ icon }, i) => {
                    return (
                        <span className={classes.stackedIcon} key={i}>
                            {icon}
                        </span>
                    )
                })}
                <span className={cx(classes.ellipsis, classes.icon)}>...</span>
            </span>
        </ShadowRootTooltip>
    )
}
