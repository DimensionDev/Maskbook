import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetworkDescriptor, useChainContext } from '@masknet/web3-hooks-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { Box, ListItem, Typography } from '@mui/material'
import { memo } from 'react'
import { format, fromUnixTime } from 'date-fns'
import { RedPacketActionButton } from './RedPacketActionButton.js'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { FireflyRedPacketAccountItem } from './FireflyRedPacketAccountItem.js'
import { Icons } from '@masknet/icons'
import urlcat from 'urlcat'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string }>()((
    theme,
    { listItemBackground, listItemBackgroundIcon },
) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        message: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            [smallQuery]: {
                whiteSpace: 'normal',
            },
        },
        root: {
            width: '100%',
            padding: 0,
            background: theme.palette.common.white,
            marginBottom: theme.spacing(1.5),
            borderRadius: 8,
            '&:last-child': {
                marginBottom: '80px',
            },
        },
        contentItem: {
            width: '100%',
            borderRadius: 8,
            position: 'static !important' as any,
            height: 'auto !important',
            padding: theme.spacing(1.5),
            background:
                listItemBackground ??
                'linear-gradient(180deg, rgba(98, 126, 234, 0.15) 0%, rgba(98, 126, 234, 0.05) 100%)',
            [smallQuery]: {
                padding: theme.spacing(2, 1.5),
            },
            '&:before': {
                position: 'absolute',
                content: '""',
                bottom: 0,
                left: 400,
                zIndex: 0,
                width: 114,
                opacity: 0.2,
                height: 61,
                filter: 'blur(1.5px)',
                background: listItemBackgroundIcon,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '114px 114px',
            },
        },
        box: {
            display: 'flex',
            width: '100%',
        },
        content: {
            width: '100%',
            [smallQuery]: {
                paddingLeft: theme.spacing(1.5),
                width: 'auto',
            },
        },
        section: {
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
            [smallQuery]: {
                flexWrap: 'wrap',
            },
        },
        div: {
            maxWidth: 350,
        },
        title: {
            color: theme.palette.maskColor.dark,
            fontWeight: 700,
            fontSize: 14,
        },
        info: {
            color: theme.palette.maskColor.dark,
            [smallQuery]: {
                fontSize: 13,
            },
            fontSize: 14,
        },
        infoTitle: {
            color: theme.palette.maskColor.secondaryDark,
            marginRight: 4,
            fontSize: 14,
            [smallQuery]: {
                fontSize: 13,
            },
        },
        footer: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            marginTop: 15,
        },
        footerInfo: {
            fontSize: 14,
            color: theme.palette.maskColor.dark,
            '& span': {
                color: theme.palette.maskColor.secondaryDark,
                marginRight: 2,
            },
        },
        claimFooterInfo: {
            fontSize: 14,
            color: theme.palette.maskColor.secondaryDark,
            '& span': {
                color: theme.palette.maskColor.dark,
                marginRight: 2,
            },
        },
        fullWidthBox: {
            width: '100%',
            display: 'flex',
        },
        icon: {
            width: 18,
            height: 18,
            marginLeft: 6,
        },
        invisible: {
            visibility: 'hidden',
        },
        moreDetails: {
            fontSize: 12,
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '16px',
        },
        icons: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            cursor: 'pointer',
            border: 'none',
            padding: 0,
            color: theme.palette.maskColor.secondaryMainDark,
            zIndex: 10,
        },
    }
})

const platformIconMap = {
    [FireflyRedPacketAPI.PlatformType.twitter]: <Icons.TwitterX size={18} />,
    [FireflyRedPacketAPI.PlatformType.lens]: <Icons.Lens size={18} />,
    [FireflyRedPacketAPI.PlatformType.farcaster]: <Icons.Farcaster size={18} />,
}

const SITE_URL = 'https://firefly.mask.social'
interface HistoryInfo {
    rp_msg: string
    redpacket_id: string
    received_time?: string
    token_decimal: number
    total_amounts?: string
    token_symbol: string
    token_amounts?: string
    token_logo: string
    chain_id: number
    creator?: string
    claim_numbers?: string
    total_numbers?: string
    claim_amounts?: string
    create_time?: number
    redpacket_status?: FireflyRedPacketAPI.RedPacketStatus
    ens_name?: string
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[]
    share_from?: string
    theme_id?: string
}

interface Props {
    history: HistoryInfo
    handleOpenDetails?: (rpid: string) => void
    isDetail?: boolean
}

const PlatformButton = memo(function PlatformButton(props: {
    platform: FireflyRedPacketAPI.PlatformType
    postId: string
    className: string
}) {
    const { platform, postId, className } = props
    console.log('PlatformButton', platform, postId, className)
    return (
        <a
            href={urlcat(SITE_URL, `/post/${platform}/${postId}`)}
            target="_blank"
            className={className}
            rel="noreferrer noopener">
            {platformIconMap[platform]}
        </a>
    )
})

export const FireflyRedPacketDetailsItem = memo(function FireflyRedPacketDetailsItem(props: Props) {
    const { history, handleOpenDetails, isDetail } = props
    const {
        rp_msg,
        create_time,
        claim_numbers,
        total_numbers,
        total_amounts,
        token_decimal,
        claim_amounts,
        token_symbol,
        token_logo,
        chain_id,
        creator,
        redpacket_id,
        token_amounts,
        received_time,
        redpacket_status,
        ens_name,
        claim_strategy,
        share_from,
        theme_id,
    } = history

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chain_id)

    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })
    const postReactionStrategy = claim_strategy?.find((x) => x.type === FireflyRedPacketAPI.StrategyType.postReaction)
    return (
        <ListItem className={classes.root}>
            <section className={classes.contentItem}>
                <Box className={classes.box}>
                    <Box className={classes.content}>
                        <section className={classes.section}>
                            <div className={classes.div}>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.title, classes.message)}>
                                        {!rp_msg ?
                                            <Trans>Best Wishes!</Trans>
                                        :   rp_msg}
                                    </Typography>
                                </div>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                        {create_time ?
                                            <Trans>Create time:</Trans>
                                        :   <Trans>Received time:</Trans>}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className={cx(
                                            classes.info,
                                            classes.message,
                                            redpacket_id ? '' : classes.invisible,
                                        )}>
                                        {create_time ?
                                            <Trans>{format(fromUnixTime(create_time), 'M/d/yyyy HH:mm')} (UTC+8)</Trans>
                                        :   null}
                                        {received_time ?
                                            <Trans>
                                                {format(
                                                    fromUnixTime(Number.parseInt(received_time, 10)),
                                                    'M/d/yyyy HH:mm',
                                                )}{' '}
                                                (UTC+8)
                                            </Trans>
                                        :   null}
                                    </Typography>
                                </div>
                                {creator ?
                                    <div className={classes.fullWidthBox}>
                                        <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                            <Trans>Creator:</Trans>
                                        </Typography>
                                        <FireflyRedPacketAccountItem
                                            address={creator}
                                            ens={ens_name}
                                            chainId={chain_id}
                                            isDarkFont
                                        />
                                    </div>
                                :   null}
                                {(
                                    (postReactionStrategy?.payload as FireflyRedPacketAPI.PostReactionStrategyPayload)
                                        ?.params && isDetail
                                ) ?
                                    <div className={classes.fullWidthBox}>
                                        <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                            <Trans>Post on</Trans>
                                        </Typography>
                                        <div className={classes.icons}>
                                            {(
                                                postReactionStrategy?.payload as FireflyRedPacketAPI.PostReactionStrategyPayload
                                            )?.params
                                                ?.sort((a, b) => {
                                                    if (a.platform === b.platform) return 0
                                                    if (a.platform === FireflyRedPacketAPI.PlatformType.lens) return 1
                                                    if (b.platform === FireflyRedPacketAPI.PlatformType.lens) return -1
                                                    return 0
                                                })
                                                .map((x) => (
                                                    <PlatformButton
                                                        key={x.postId}
                                                        platform={x.platform}
                                                        postId={x.postId}
                                                        className={classes.button}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                :   null}
                            </div>
                            {(
                                redpacket_status &&
                                redpacket_status !== FireflyRedPacketAPI.RedPacketStatus.View &&
                                redpacket_status !== FireflyRedPacketAPI.RedPacketStatus.Send
                            ) ?
                                <RedPacketActionButton
                                    redpacketStatus={redpacket_status}
                                    rpid={redpacket_id}
                                    account={account}
                                    claim_strategy={claim_strategy}
                                    shareFrom={share_from}
                                    themeId={theme_id}
                                    redpacketMsg={rp_msg}
                                    tokenInfo={{
                                        symbol: token_symbol,
                                        decimals: token_decimal,
                                        amount: total_amounts,
                                    }}
                                    chainId={chain_id}
                                    totalAmount={total_amounts}
                                    createdAt={create_time}
                                />
                            :   null}
                        </section>
                        <section className={classes.footer}>
                            {claim_numbers || total_numbers ?
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" className={classes.claimFooterInfo}>
                                        <Trans>
                                            Claimed:{' '}
                                            <span>
                                                {claim_numbers}/{total_numbers}
                                            </span>{' '}
                                            <span>
                                                {formatBalance(claim_amounts, token_decimal, {
                                                    significant: 2,
                                                    isPrecise: true,
                                                })}
                                                /
                                                {formatBalance(total_amounts, token_decimal ?? 18, {
                                                    significant: 2,
                                                    isPrecise: true,
                                                })}
                                            </span>{' '}
                                            <span>{token_symbol}</span>
                                        </Trans>
                                    </Typography>
                                    {token_logo ?
                                        <TokenIcon
                                            className={classes.icon}
                                            address={''}
                                            name={token_symbol}
                                            logoURL={token_logo}
                                        />
                                    :   null}
                                </div>
                            :   null}
                            {token_amounts ?
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" className={classes.footerInfo}>
                                        <span>
                                            <Trans>Received</Trans>
                                        </span>
                                        {formatBalance(token_amounts, token_decimal, {
                                            significant: 2,
                                            isPrecise: true,
                                        })}{' '}
                                        {token_symbol}
                                    </Typography>
                                    {token_logo ?
                                        <TokenIcon
                                            className={classes.icon}
                                            address={''}
                                            name={token_symbol}
                                            logoURL={token_logo}
                                        />
                                    :   null}
                                </div>
                            :   null}
                            {handleOpenDetails ?
                                <button
                                    type="button"
                                    className={cx(classes.moreDetails, classes.button)}
                                    onClick={() => {
                                        handleOpenDetails(redpacket_id)
                                    }}>
                                    <Trans>More details</Trans>
                                </button>
                            :   null}
                        </section>
                    </Box>
                </Box>
            </section>
        </ListItem>
    )
})
