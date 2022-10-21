import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { resolveSocialAddressLink, SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'
import { TooltipProps, Typography } from '@mui/material'
import { Linking, SharedTrans } from '../../../index.js'

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
        twitterIcon: {
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
    return (
        <ShadowRootTooltip
            classes={{ tooltip: classes.tooltip }}
            disableInteractive
            title={
                <Typography fontSize={14} lineHeight="18px">
                    {type ? (
                        <SharedTrans.source_tooltip
                            values={{ source: type ?? '' }}
                            components={{
                                Link: <Typography component="span" />,
                            }}
                            context={platform}>
                            {children}
                        </SharedTrans.source_tooltip>
                    ) : (
                        <SharedTrans.source_tooltip_only
                            values={{ context: platform! }}
                            components={{
                                Link: <Typography component="span" />,
                            }}
                            context={platform!}>
                            {children}
                        </SharedTrans.source_tooltip_only>
                    )}
                </Typography>
            }
            arrow>
            {children}
        </ShadowRootTooltip>
    )
}

export interface AccountIconProps {
    socialAccount: SocialAccount
}

export function AccountIcon({ socialAccount }: AccountIconProps) {
    const { classes, cx, theme } = useStyles()
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
    ].find((x) => socialAccount.supportedAddressTypes?.includes(x))

    return (
        <>
            {socialAccount.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID) ? (
                <AccountTooltips platform={AddressPlatform.NextId}>
                    <Linking
                        href={resolveSocialAddressLink(SocialAddressType.NEXT_ID)}
                        LinkProps={{ className: classes.link }}>
                        <Icons.NextIDMini
                            className={cx(classes.actionIcon, classes.icon)}
                            style={{ ...iconStyle, width: 32, height: 18 }}
                        />
                    </Linking>
                </AccountTooltips>
            ) : null}

            {fromTwitter ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={fromTwitter}>
                    <Icons.TwitterRound
                        className={cx(classes.actionIcon, classes.icon, classes.twitterIcon)}
                        style={iconStyle}
                    />
                </AccountTooltips>
            ) : null}

            {socialAccount.supportedAddressTypes?.includes(SocialAddressType.CyberConnect) ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={SocialAddressType.CyberConnect}>
                    <Linking
                        href={resolveSocialAddressLink(SocialAddressType.CyberConnect)}
                        LinkProps={{ className: classes.link }}>
                        <Icons.CyberConnect
                            className={cx(classes.actionIcon, classes.icon)}
                            style={{ ...iconStyle, width: 18, height: 18 }}
                        />
                    </Linking>
                </AccountTooltips>
            ) : null}

            {socialAccount.supportedAddressTypes?.includes(SocialAddressType.Leaderboard) ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={SocialAddressType.Leaderboard}>
                    <Linking
                        href={resolveSocialAddressLink(SocialAddressType.Leaderboard)}
                        LinkProps={{ className: classes.link }}>
                        <Icons.Leaderboard
                            className={cx(classes.actionIcon, classes.icon)}
                            style={{ ...iconStyle, width: 18, height: 18 }}
                        />
                    </Linking>
                </AccountTooltips>
            ) : null}

            {socialAccount.supportedAddressTypes?.includes(SocialAddressType.Sybil) ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={SocialAddressType.Sybil}>
                    <Linking
                        href={resolveSocialAddressLink(SocialAddressType.Sybil)}
                        LinkProps={{ className: classes.link }}>
                        <Icons.Sybil
                            className={cx(classes.actionIcon, classes.icon)}
                            style={{ ...iconStyle, width: 18, height: 18 }}
                        />
                    </Linking>
                </AccountTooltips>
            ) : null}
        </>
    )
}
