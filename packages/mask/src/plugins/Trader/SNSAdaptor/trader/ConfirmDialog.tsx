import { useEffect, useState } from 'react'
import { Alert, Box, Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type BigNumber from 'bignumber.js'
import { FormattedAddress, FormattedBalance, useStylesExtends } from '@masknet/shared'
import type { TradeComputed } from '../../types'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import type { FungibleTokenDetailed, Wallet } from '@masknet/web3-shared-evm'
import { resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { InfoIcon, RetweetIcon } from '@masknet/icons'
import { ExternalLink } from 'react-feather'
import { TokenIcon } from '@masknet/shared'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'

const useStyles = makeStyles()((theme) => ({
    section: {
        display: 'flex',
        justifyContent: 'space-between',
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
}))

export interface ConfirmDialogUIProps extends withClasses<never> {
    open: boolean
    trade: TradeComputed
    inputToken: FungibleTokenDetailed
    outputToken: FungibleTokenDetailed
    onConfirm: () => void
    onClose?: () => void
    wallet?: Wallet
}

export function ConfirmDialogUI(props: ConfirmDialogUIProps) {
    const { t } = useI18N()

    const classes = useStylesExtends(useStyles(), props)
    const { open, trade, wallet, inputToken, outputToken, onConfirm, onClose } = props
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

    const staled = !!(executionPrice && !executionPrice.isEqualTo(trade.executionPrice))

    return (
        <>
            <InjectedDialog open={open} onClose={onClose} title="Confirm Swap" maxWidth="xs">
                <DialogContent>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_red_packet_nft_account_name')}</Typography>
                        <Typography>
                            ({wallet?.name})
                            <FormattedAddress address={wallet?.address ?? ''} size={4} />
                            <Link
                                style={{ color: 'inherit' }}
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
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_tab_price')}</Typography>
                        <Typography>
                            {priceReversed ? (
                                <FormattedBalance
                                    value={inputAmount.toFixed() ?? '0'}
                                    decimals={inputToken.decimals}
                                    symbol={inputToken.symbol}
                                    significant={4}
                                />
                            ) : (
                                <FormattedBalance
                                    value={outputAmount.toFixed() ?? '0'}
                                    decimals={outputToken.decimals}
                                    symbol={outputToken.symbol}
                                    significant={4}
                                />
                            )}
                            <Box component="span" mx={0.5}>
                                =
                            </Box>
                            {priceReversed ? (
                                <FormattedBalance
                                    value={outputAmount.toFixed() ?? '0'}
                                    decimals={outputToken.decimals}
                                    symbol={outputToken.symbol}
                                    significant={4}
                                />
                            ) : (
                                <FormattedBalance
                                    value={inputAmount.toFixed() ?? '0'}
                                    decimals={inputToken.decimals}
                                    symbol={inputToken.symbol}
                                    significant={4}
                                />
                            )}
                            <RetweetIcon
                                style={{ marginLeft: 4, cursor: 'pointer' }}
                                onClick={() => setPriceReversed((x) => !x)}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_maximum_sold')}</Typography>
                        <Typography>
                            <FormattedBalance
                                value={trade.maximumSold}
                                decimals={inputToken.decimals}
                                significant={6}
                                symbol={inputToken.symbol}
                            />
                        </Typography>
                    </Box>
                    <Box className={classes.section}>
                        <Typography>{t('plugin_trader_confirm_minimum_received')}</Typography>
                        <Typography>
                            <FormattedBalance
                                value={trade.minimumReceived}
                                decimals={outputToken.decimals}
                                significant={6}
                                symbol={outputToken.symbol}
                            />
                        </Typography>
                    </Box>
                    <Alert className={classes.alert} icon={<InfoIcon className={classes.alertIcon} />} severity="info">
                        {t('plugin_trader_confirm_tips')}
                    </Alert>
                </DialogContent>
                <DialogActions>
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
