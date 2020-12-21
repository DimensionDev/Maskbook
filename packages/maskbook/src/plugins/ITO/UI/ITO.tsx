import { useCallback, useState } from 'react'
import { BigNumber } from 'bignumber.js'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../Wallet/messages'
import { ITO_JSONPayload, ITO_Status } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { makeStyles, createStyles, Card, Typography, Box, Link } from '@material-ui/core'
import { getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { useAccount } from '../../../web3/hooks/useAccount'
import BackgroundImage from '../assets/background'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { StyledLinearProgress } from './StyledLinearProgress'
import { EthIcon, DaiIcon, UsdcIcon, UsdtIcon } from '../assets/tokenIcon'
import { formatBalance, formatToken } from '../../Wallet/formatter'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatDateTime } from '../../../utils/date'
import { ClaimDialog } from './ClaimDialog'

export const DAI_ADDRESS = getConstant(CONSTANTS, 'DAI_ADDRESS').toLowerCase()
export const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS').toLowerCase()
export const USDT_ADDRESS = getConstant(CONSTANTS, 'USDT_ADDRESS').toLowerCase()
export const USDC_ADDRESS = getConstant(CONSTANTS, 'USDC_ADDRESS').toLowerCase()

interface IconProps {
    size?: number
}

export const TOKEN_ICON_LIST_TABLE: Record<string, (props: IconProps) => JSX.Element> = {
    [DAI_ADDRESS]: (props: IconProps) => <DaiIcon size={props.size} />,
    [ETH_ADDRESS]: (props: IconProps) => <EthIcon size={props.size} />,
    [USDT_ADDRESS]: (props: IconProps) => <UsdtIcon size={props.size} />,
    [USDC_ADDRESS]: (props: IconProps) => <UsdcIcon size={props.size} />,
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
    payload: ITO_JSONPayload
}

interface TokenItemProps {
    ration: string
    TokenIcon: (props: IconProps) => JSX.Element
    tokenSymbol: string
    sellTokenSymbol: string
    decimals?: number
}

const TokenItem = ({ ration, TokenIcon, tokenSymbol, sellTokenSymbol, decimals = 18 }: TokenItemProps) => (
    <>
        <TokenIcon />
        <span>
            <b>{formatBalance(new BigNumber(Number(ration)), decimals)}</b> {tokenSymbol} / {sellTokenSymbol}
        </span>
    </>
)

export function ITO(props: ITO_Props) {
    const { payload } = props
    const {
        token,
        total: payload_total,
        total_remaining: payload_total_remaining,
        claim_remaining: payload_claim_remaining,
        sender,
        exchange_amounts,
        exchange_tokens,
        limit,
        start_time,
        pid,
    } = payload
    const classes = useStyles()
    const { t } = useI18N()
    const [openClaimDialog, setOpenClaimDialog] = useState(false)

    const total = Number(payload_total)
    const total_remaining = Number(payload_total_remaining)
    const claim_remaining = Number(payload_claim_remaining)
    const sold = total - total_remaining

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(payload)
    //#ednregion

    const { canFetch, canClaim, canShare, listOfStatus } = availabilityComputed

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    console.log('value', availability)
    console.log('time', new Date().getTime(), start_time)
    const onClaimOrShare = useCallback(async () => {
        setOpenClaimDialog(true)
    }, [])

    return (
        <div>
            <Card className={classes.root}>
                <Box className={classes.header}>
                    <Typography variant="h5" className={classes.title}>
                        {sender.message}
                    </Typography>
                    {listOfStatus.includes(ITO_Status.expired) || listOfStatus.includes(ITO_Status.completed) ? (
                        <Typography variant="body2" className={classes.status}>
                            {listOfStatus.includes(ITO_Status.expired)
                                ? t('plugin_ito_expired')
                                : t('plugin_ito_completed')}
                        </Typography>
                    ) : null}
                </Box>
                <Typography variant="body2" className={classes.totalText}>
                    {`Sold ${formatToken(sold)} Sell Total Amount ${formatToken(total)} ${token.symbol}`}
                    <Link
                        className={classes.tokenLink}
                        href={`${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <OpenInNewIcon fontSize="small" className={classes.totalIcon} />
                    </Link>
                </Typography>
                <Box className={classes.progressWrap}>
                    <StyledLinearProgress variant="determinate" value={(sold * 100) / total} />
                </Box>
                <Box>
                    {exchange_tokens.map((t, i) => {
                        const TokenIcon = TOKEN_ICON_LIST_TABLE[t.address.toLowerCase()]
                        return TokenIcon ? (
                            <div className={classes.rationWrap}>
                                <TokenItem
                                    decimals={t.decimals}
                                    ration={exchange_amounts[i]}
                                    TokenIcon={TokenIcon}
                                    tokenSymbol={t.symbol!}
                                    sellTokenSymbol={token.symbol!}
                                />
                            </div>
                        ) : null
                    })}
                </Box>
                <Box className={classes.footer}>
                    <div>
                        <Typography variant="body1">{`limit per: ${limit} MASK`}</Typography>
                        <Typography variant="body1">
                            {listOfStatus.includes(ITO_Status.waited)
                                ? `Start Date: ${formatDateTime(new Date(start_time), true)}`
                                : `Remaining time: `}
                        </Typography>
                    </div>
                    <Typography variant="body1" className={classes.fromText}>
                        {`From: @${sender.name}`}
                    </Typography>
                </Box>
            </Card>

            <Typography variant="body1" className={classes.textProviderErr}>
                {t('plugin_ito_wrong_provider')}
            </Typography>

            {canClaim || canShare ? (
                <Box className={classes.actionFooter}>
                    {!account || !chainIdValid ? (
                        <ActionButton
                            variant="contained"
                            size="large"
                            onClick={onConnect}
                            className={classes.actionButton}>
                            {t('plugin_wallet_connect_a_wallet')}
                        </ActionButton>
                    ) : (
                        <ActionButton
                            variant="contained"
                            size="large"
                            onClick={onClaimOrShare}
                            className={classes.actionButton}>
                            {canClaim ? t('plugin_ito_enter') : t('plugin_ito_share')}
                        </ActionButton>
                    )}
                </Box>
            ) : null}
            <ClaimDialog
                exchangeTokens={exchange_tokens}
                open={openClaimDialog}
                onClose={() => setOpenClaimDialog(false)}
            />
        </div>
    )
}
