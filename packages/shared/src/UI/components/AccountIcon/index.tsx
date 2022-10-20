import { Icons } from '@masknet/icons'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { SocialAccount, SocialAddressType } from '@masknet/web3-shared-base'
import { TooltipProps, Typography } from '@mui/material'
import { SharedTrans } from '../../../index.js'

const useStyles = makeStyles<void, 'icon' | 'tooltip'>()((theme) => {
    return {
        root: {
            height: 40,
            flexGrow: 1,
        },
        icon: {
            width: 20,
            height: 20,
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
                                Link: (
                                    <Typography component="span" color={(theme) => theme.palette.maskColor.primary} />
                                ),
                            }}
                            context={platform}>
                            {children}
                        </SharedTrans.source_tooltip>
                    ) : (
                        <SharedTrans.source_tooltip_only
                            values={{ context: platform! }}
                            components={{
                                Link: (
                                    <Typography component="span" color={(theme) => theme.palette.maskColor.primary} />
                                ),
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
    account: SocialAccount
}

export function AccountIcon({ account }: AccountIconProps) {
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
    ].find((x) => account.supportedAddressTypes?.includes(x))

    return (
        <>
            {account.supportedAddressTypes?.includes(SocialAddressType.NEXT_ID) ? (
                <AccountTooltips platform={AddressPlatform.NextId}>
                    <Icons.NextIDMini
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 32, height: 18 }}
                    />
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

            {account.supportedAddressTypes?.includes(SocialAddressType.CyberConnect) ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={SocialAddressType.CyberConnect}>
                    <Icons.CyberConnect
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 18, height: 18 }}
                    />
                </AccountTooltips>
            ) : null}

            {account.supportedAddressTypes?.includes(SocialAddressType.Leaderboard) ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={SocialAddressType.Leaderboard}>
                    <Icons.Leaderboard
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 18, height: 18 }}
                    />
                </AccountTooltips>
            ) : null}

            {account.supportedAddressTypes?.includes(SocialAddressType.Sybil) ? (
                <AccountTooltips platform={AddressPlatform.Twitter} type={SocialAddressType.Sybil}>
                    <Icons.Sybil
                        className={cx(classes.actionIcon, classes.icon)}
                        style={{ ...iconStyle, width: 18, height: 18 }}
                    />
                </AccountTooltips>
            ) : null}
        </>
    )
}
