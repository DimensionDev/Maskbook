import { useCallback, useState } from 'react'
import { makeStyles, createStyles, Card, Typography, Box, Link } from '@material-ui/core'
import { BigNumber } from 'bignumber.js'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../Wallet/messages'
import { JSON_PayloadInMask, ITO_Status } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { resolveChainName, resolveLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { useAccount } from '../../../web3/hooks/useAccount'
import BackgroundImage from '../assets/background'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { StyledLinearProgress } from './StyledLinearProgress'
import { formatBalance } from '../../Wallet/formatter'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatDateTime, formatTimeDiffer } from '../../../utils/date'
import { ClaimGuide } from './ClaimGuide'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { useShareLink } from '../../../utils/hooks/useShareLink'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { sortTokens } from '../helpers'
import { ITO_EXCHANGE_RATION_MAX } from '../constants'

export interface IconProps {
    size?: number
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            position: 'relative',
            color: theme.palette.common.white,
            flexDirection: 'column',
            height: 340,
            boxSizing: 'border-box',
            backgroundAttachment: 'local',
            backgroundPosition: '0 0',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${BackgroundImage})`,
            borderRadius: theme.spacing(1),
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(1),
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(2),
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: 470,
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: 4,
        },
        status: {
            background: 'rgba(20, 23, 26, 0.6)',
            padding: '5px 16px',
            borderRadius: '10px',
        },
        totalText: {
            display: 'flex',
            alignItems: 'center',
        },
        tokenLink: {
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
        },
        tokenIcon: {
            width: 24,
            height: 24,
        },
        totalIcon: {
            marginLeft: theme.spacing(1),
            cursor: 'pointer',
        },
        progressWrap: {
            width: 220,
            marginBottom: theme.spacing(3),
            marginTop: theme.spacing(1),
        },
        footer: {
            position: 'absolute',
            width: '90%',
            maxWidth: 470,
            bottom: theme.spacing(2),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        fromText: {
            opacity: 0.6,
            transform: 'translateY(5px)',
        },
        rationWrap: {
            marginBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& > span': {
                marginLeft: theme.spacing(1),
                fontSize: 14,
                '& > b': {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            },
        },
        actionFooter: {
            marginTop: theme.spacing(1),
        },
        actionButton: {
            minHeight: 'auto',
            width: '100%',
        },
        textProviderErr: {
            color: '#EB5757',
            marginTop: theme.spacing(1),
        },
    }),
)

export interface ITO_Props {
    payload: JSON_PayloadInMask
}

interface TokenItemProps {
    price: string
    token: EtherTokenDetailed | ERC20TokenDetailed
    exchangeToken: EtherTokenDetailed | ERC20TokenDetailed
}

const TokenItem = ({ price, token, exchangeToken }: TokenItemProps) => {
    const classes = useStyles()
    return (
        <>
            <TokenIcon classes={{ icon: classes.tokenIcon }} address={exchangeToken.address} />
            <Typography component="span">
                <strong>{price}</strong> {exchangeToken.symbol} / {token.symbol}
            </Typography>
        </>
    )
}

export function ITO(props: ITO_Props) {
    const { payload } = props
    const {
        token,
        total: payload_total,
        seller,
        total_remaining: payload_total_remaining,
        exchange_amounts,
        exchange_tokens,
        limit,
        start_time,
        end_time,
        pid,
    } = payload
    const classes = useStyles()
    const { t } = useI18N()
    const [openClaimDialog, setOpenClaimDialog] = useState(false)

    const total = new BigNumber(payload_total)
    const total_remaining = new BigNumber(payload_total_remaining)
    const sold = total.minus(total_remaining)

    // context
    const account = useAccount()
    const postLink = usePostLink()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const shareLink = useShareLink(
        t('plugin_ito_claim_foreshow_share', {
            link: postLink,
        }),
    )
    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(payload)
    //#ednregion

    const { listOfStatus } = availabilityComputed

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion
    const onShare = useCallback(async () => {
        window.open(shareLink, '_blank', 'noopener noreferrer')
    }, [])
    const onClaim = useCallback(async () => setOpenClaimDialog(true), [])

    if (payload.chain_id !== chainId) return <Typography>Not available on {resolveChainName(chainId)}.</Typography>
    return (
        <div>
            <Card className={classes.root} elevation={0}>
                <Box className={classes.header}>
                    <Typography variant="h5" className={classes.title}>
                        {payload.message}
                    </Typography>
                    {listOfStatus.includes(ITO_Status.expired) || listOfStatus.includes(ITO_Status.completed) ? (
                        <Typography variant="body2" className={classes.status}>
                            {listOfStatus.includes(ITO_Status.expired)
                                ? t('plugin_ito_expired')
                                : listOfStatus.includes(ITO_Status.completed)
                                ? t('plugin_ito_completed')
                                : null}
                        </Typography>
                    ) : null}
                </Box>
                <Typography variant="body2" className={classes.totalText}>
                    {`Sold ${formatBalance(sold, token.decimals)} ${token.symbol} within ${formatBalance(
                        total,
                        token.decimals,
                    )} ${token.symbol}`}
                    .
                    <Link
                        className={classes.tokenLink}
                        href={`${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <OpenInNewIcon fontSize="small" className={classes.totalIcon} />
                    </Link>
                </Typography>
                <Box className={classes.progressWrap}>
                    <StyledLinearProgress
                        variant="determinate"
                        value={Number(sold.multipliedBy(100).dividedBy(total))}
                    />
                </Box>
                <Box>
                    {exchange_tokens
                        .slice(0, ITO_EXCHANGE_RATION_MAX)
                        .sort(sortTokens)
                        .map((exchangeToken, i) => (
                            <div className={classes.rationWrap} key={i}>
                                <TokenItem
                                    price={formatBalance(
                                        new BigNumber(exchange_amounts[i * 2])
                                            .dividedBy(new BigNumber(exchange_amounts[i * 2 + 1]))
                                            .multipliedBy(
                                                new BigNumber(10).pow(token.decimals - exchange_tokens[i].decimals),
                                            )
                                            .multipliedBy(new BigNumber(10).pow(exchange_tokens[i].decimals))
                                            .integerValue(),
                                        exchange_tokens[i].decimals,
                                    )}
                                    token={token}
                                    exchangeToken={exchangeToken}
                                />
                            </div>
                        ))}
                </Box>
                <Box className={classes.footer}>
                    <div>
                        {listOfStatus.includes(ITO_Status.expired) ? null : listOfStatus.includes(
                              ITO_Status.completed,
                          ) ? (
                            <Typography variant="body1">
                                {t('plugin_ito_your_claimed_amount', {
                                    amount: formatBalance(new BigNumber(availability?.claimed ?? 0), token.decimals),
                                    symbol: token.symbol,
                                })}
                            </Typography>
                        ) : (
                            <>
                                <Typography variant="body1">{`Limit per: ${formatBalance(
                                    new BigNumber(limit),
                                    token.decimals,
                                )} ${token.symbol}`}</Typography>
                                <Typography variant="body1">
                                    {listOfStatus.includes(ITO_Status.waited)
                                        ? `Start Date: ${formatDateTime(new Date(start_time * 1000), true)}`
                                        : listOfStatus.includes(ITO_Status.started)
                                        ? `Remaining time: ${formatTimeDiffer(new Date(), new Date(end_time * 1000))}`
                                        : null}
                                </Typography>
                            </>
                        )}
                    </div>
                    <Typography variant="body1" className={classes.fromText}>
                        {`From: @${seller.name}`}
                    </Typography>
                </Box>
            </Card>

            <Box className={classes.actionFooter}>
                {!account || !chainIdValid ? (
                    <ActionButton onClick={onConnect} variant="contained" size="large" className={classes.actionButton}>
                        {t('plugin_wallet_connect_a_wallet')}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.expired) ||
                  listOfStatus.includes(ITO_Status.completed) ? null : listOfStatus.includes(ITO_Status.waited) ? (
                    <ActionButton onClick={onShare} variant="contained" size="large" className={classes.actionButton}>
                        {t('plugin_ito_share')}
                    </ActionButton>
                ) : listOfStatus.includes(ITO_Status.started) ? (
                    <ActionButton onClick={onClaim} variant="contained" size="large" className={classes.actionButton}>
                        {t('plugin_ito_enter')}
                    </ActionButton>
                ) : null}
            </Box>

            {payload ? (
                <ClaimGuide
                    payload={payload}
                    exchangeTokens={exchange_tokens}
                    open={openClaimDialog}
                    onClose={() => setOpenClaimDialog(false)}
                    revalidateAvailability={revalidateAvailability}
                />
            ) : null}
        </div>
    )
}
