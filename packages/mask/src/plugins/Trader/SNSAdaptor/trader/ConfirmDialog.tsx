import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { FormattedAddress, FormattedBalance, useStylesExtends, useValueRef } from '@masknet/shared'
import type { TradeComputed } from '../../types'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import type { FungibleTokenDetailed, Wallet } from '@masknet/web3-shared-evm'
import {
    createNativeToken,
    formatBalance,
    formatEthereumAddress,
    formatWeiToEther,
    pow10,
    resolveAddressLinkOnExplorer,
} from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { InfoIcon, RetweetIcon } from '@masknet/icons'
import { ExternalLink } from 'react-feather'
import { TokenIcon } from '@masknet/shared'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'
import { currentSlippageSettings } from '../../settings'
import { useNativeTokenPrice } from '../../../Wallet/hooks/useTokenPrice'

const useStyles = makeStyles()(() => ({
    section: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ['& > p']: {
            fontSize: 16,
            lineHeight: '22px',
            color: MaskColorVar.twitterMain,
            display: 'flex',
            alignItems: 'center',
            margin: '12px 0',
        },
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginRight: 4,
    },
    alert: {
        backgroundColor: MaskColorVar.twitterInfoBackground.alpha(0.1),
        color: MaskColorVar.twitterInfo,
        marginTop: 12,
        fontSize: 12,
        lineHeight: '16px',
    },
    alertIcon: {
        color: MaskColorVar.twitterInfo,
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius: 24,
        height: 'auto',
    },
    content: {
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export interface ConfirmDialogUIProps extends withClasses<never> {
    open: boolean
    trade: TradeComputed
    inputToken: FungibleTokenDetailed
    outputToken: FungibleTokenDetailed
    gas?: number
    gasPrice?: string
    onConfirm: () => void
    onClose?: () => void
    wallet?: Wallet
}

export function ConfirmDialogUI(props: ConfirmDialogUIProps) {
    const { t } = useI18N()
    const currentSlippage = useValueRef(currentSlippageSettings)
    const classes = useStylesExtends(useStyles(), props)
    const { open, trade, wallet, inputToken, outputToken, onConfirm, onClose, gas, gasPrice } = props
    const { inputAmount, outputAmount } = trade

    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const [priceReversed, setPriceReversed] = useState(false)

    //#region detect price changing
    const [executionPrice, setExecutionPrice] = useState<BigNumber | undefined>(trade.executionPrice)
    useEffect(() => {
        if (open) setExecutionPrice(undefined)
    }, [open])
    useEffect(() => {
        if (typeof executionPrice === 'undefined') setExecutionPrice(trade.executionPrice)
    }, [trade, executionPrice])
    //#endregion

    //#region gas price
    const nativeToken = createNativeToken(chainId)
    const tokenPrice = useNativeTokenPrice(chainId)

    const gasFee = useMemo(() => {
        return gas && gasPrice ? new BigNumber(gasPrice).multipliedBy(gas).integerValue().toFixed() : 0
    }, [gas, gasPrice])

    const feeValueUSD = useMemo(
        () => (gasFee ? new BigNumber(formatWeiToEther(gasFee).times(tokenPrice).toFixed(2).toString()) : '0'),
        [gasFee, tokenPrice],
    )
    //#endregion

    const staled = !!(executionPrice && !executionPrice.isEqualTo(trade.executionPrice))

    return (
        <>
            <InjectedDialog open={open} onClose={onClose} title="Confirm Swap" maxWidth="xs">
                <DialogContent className={classes.content} sx={{ marginLeft: 5, marginRight: 5 }}>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_red_packet_nft_account_name')}</Typography>
                        <Typography>
                            ({wallet?.name})
                            <FormattedAddress
                                address={wallet?.address ?? ''}
                                size={4}
                                formatter={formatEthereumAddress}
                            />
                            <Link
                                style={{ color: 'inherit', height: 20 }}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={resolveAddressLinkOnExplorer(chainId, wallet?.address ?? '')}>
                                <ExternalLink style={{ marginLeft: 5 }} size={20} />
                            </Link>
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_from')}</Typography>
                        <Typography component="div" display="flex">
                            <TokenIcon
                                classes={{ icon: classes.tokenIcon }}
                                address={inputToken.address}
                                logoURI={inputToken.logoURI}
                            />
                            <FormattedBalance
                                value={inputAmount.toFixed() ?? '0'}
                                decimals={inputToken.decimals}
                                symbol={inputToken.symbol}
                                significant={4}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_to')}</Typography>
                        <Typography component="div" display="flex">
                            <TokenIcon
                                classes={{ icon: classes.tokenIcon }}
                                address={outputToken.address}
                                logoURI={outputToken.logoURI}
                            />
                            <FormattedBalance
                                value={outputAmount.toFixed() ?? '0'}
                                decimals={outputToken.decimals}
                                symbol={outputToken.symbol}
                                significant={4}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_tab_price')}</Typography>
                        <Typography>
                            {priceReversed ? (
                                <span>
                                    <span>1 {outputToken.symbol}</span>
                                    {' = '}
                                    <strong className={classes.emphasis}>
                                        {formatBalance(
                                            inputAmount
                                                .dividedBy(outputAmount)
                                                .multipliedBy(pow10(outputToken.decimals - inputToken.decimals))
                                                .multipliedBy(pow10(inputToken.decimals))
                                                .integerValue(),
                                            inputToken.decimals,
                                            6,
                                        )}
                                    </strong>
                                    {inputToken.symbol}
                                </span>
                            ) : (
                                <span>
                                    <span>1 {inputToken.symbol}</span>
                                    {' = '}
                                    <strong className={classes.emphasis}>
                                        {formatBalance(
                                            outputAmount
                                                .dividedBy(inputAmount)
                                                .multipliedBy(pow10(inputToken.decimals - outputToken.decimals))
                                                .multipliedBy(pow10(outputToken.decimals))
                                                .integerValue(),
                                            outputToken.decimals,
                                            6,
                                        )}
                                    </strong>
                                    {outputToken.symbol}
                                </span>
                            )}
                            <RetweetIcon
                                style={{ marginLeft: 4, cursor: 'pointer' }}
                                onClick={() => setPriceReversed((x) => !x)}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_max_price_slippage')}</Typography>
                        <Typography>{currentSlippage / 100}%</Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_minimum_received')}</Typography>
                        <Typography>
                            <FormattedBalance
                                value={trade.minimumReceived}
                                decimals={outputToken.decimals}
                                significant={6}
                                symbol={outputToken.symbol}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Box>
                    {gasFee ? (
                        <Box className={classes.section}>
                            <Typography>{t('plugin_trader_gas')}</Typography>
                            <Typography>
                                <FormattedBalance
                                    value={gasFee}
                                    decimals={nativeToken.decimals ?? 0}
                                    significant={4}
                                    symbol={nativeToken.symbol}
                                    formatter={formatBalance}
                                />
                                <Typography component="span">
                                    {t('plugin_trader_tx_cost_usd', { usd: feeValueUSD })}
                                </Typography>
                            </Typography>
                        </Box>
                    ) : null}
                    <Alert className={classes.alert} icon={<InfoIcon className={classes.alertIcon} />} severity="info">
                        {t('plugin_trader_confirm_tips')}
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ marginLeft: 5, marginRight: 5 }}>
                    <Button
                        classes={{ root: classes.button }}
                        color="primary"
                        size="large"
                        variant="contained"
                        fullWidth
                        disabled={staled}
                        onClick={onConfirm}>
                        Confirm Swap
                    </Button>
                </DialogActions>
            </InjectedDialog>
        </>
    )
}

export interface ConfirmDialogProps extends ConfirmDialogUIProps {}

export function ConfirmDialog(props: ConfirmDialogProps) {
    return <ConfirmDialogUI {...props} />
}
