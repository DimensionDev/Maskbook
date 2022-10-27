import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { resolveSocialAddressLink, SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'
import { TooltipProps, Typography } from '@mui/material'
import { Linking } from '../../../index.js'
import { useSharedI18N } from '../../../locales'

const useStyles = makeStyles<void, 'icon' | 'tooltip'>()((theme) => {
    return {
        icon: {
            width: 20,
            height: 20,
        },
        link: {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
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
    const t = useSharedI18N()
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            disableInteractive
            title={
                <Typography fontSize={14} lineHeight="18px">
                    {SocialAddressType.KV === type || SocialAddressType.Address === type
                        ? t.account_icon_tooltips_only({
                              context: platform!,
                          })
                        : t.account_icon_tooltips({
                              source: type ?? '',
                              context: platform,
                          })}
                </Typography>
            }
            arrow>
            {children}
        </ShadowRootTooltip>
    )
}

export interface AccountIconProps extends withClasses<'icon'> {
    socialAccount: SocialAccount
}

export function AccountIcon({ socialAccount, classes: externalClasses }: AccountIconProps) {
    const { classes, cx, theme } = useStyles(undefined, { props: { classes: externalClasses } })

    const { supportedAddressTypes } = socialAccount
    if (!supportedAddressTypes?.length) return null

    const iconStyle =
        theme.palette.mode === 'light'
            ? {
                  boxShadow: '0px 6px 12px rgba(28, 104, 243, 0.2)',
                  backdropFilter: 'blur(8px)',
              }
            : undefined

    const fromTwitter = [
        SocialAddressType.Address,
        SocialAddressType.ENS,
        SocialAddressType.RSS3,
        SocialAddressType.SOL,
        SocialAddressType.TwitterBlue,
        SocialAddressType.KV,
    ].find((x) => supportedAddressTypes.includes(x))

    return (
        <>
            {supportedAddressTypes.includes(SocialAddressType.NEXT_ID) ? (
                <Linking
                    href={resolveSocialAddressLink(SocialAddressType.NEXT_ID)}
                    LinkProps={{ className: classes.link }}>
                    <AccountTooltips platform={AddressPlatform.NextId}>
                        <Icons.NextIDMini
                            className={cx(classes.actionIcon, classes.icon)}
                            style={{ ...iconStyle, width: 32, height: 18 }}
                        />
                    </AccountTooltips>
                </Linking>
            ) : null}

            {fromTwitter ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={fromTwitter}>
                    <Icons.TwitterRound
                        className={cx(classes.actionIcon, classes.icon, classes.roundedIcon)}
                        style={iconStyle}
                    />
                </AccountTooltips>
            ) : null}

            {supportedAddressTypes.includes(SocialAddressType.CyberConnect) ? (
                <Linking
                    href={resolveSocialAddressLink(SocialAddressType.CyberConnect)}
                    LinkProps={{ className: classes.link }}>
                    <AccountTooltips type={SocialAddressType.CyberConnect}>
                        <Icons.CyberConnect
                            className={cx(classes.actionIcon, classes.icon)}
                            size={18}
                            style={iconStyle}
                        />
                    </AccountTooltips>
                </Linking>
            ) : null}

            {supportedAddressTypes.includes(SocialAddressType.Leaderboard) ? (
                <Linking
                    href={resolveSocialAddressLink(SocialAddressType.Leaderboard)}
                    LinkProps={{ className: classes.link }}>
                    <AccountTooltips type={SocialAddressType.Leaderboard}>
                        <Icons.Leaderboard
                            className={cx(classes.actionIcon, classes.icon)}
                            size={18}
                            style={iconStyle}
                        />
                    </AccountTooltips>
                </Linking>
            ) : null}

            {supportedAddressTypes.includes(SocialAddressType.Sybil) ? (
                <Linking
                    href={resolveSocialAddressLink(SocialAddressType.Sybil)}
                    LinkProps={{ className: classes.link }}>
                    <AccountTooltips type={SocialAddressType.Sybil}>
                        <Icons.Sybil
                            className={cx(classes.actionIcon, classes.icon, classes.roundedIcon)}
                            size={18}
                            style={iconStyle}
                        />
                    </AccountTooltips>
                </Linking>
            ) : null}
        </>
    )
}
