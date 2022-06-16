import { InjectedDialog, LoadingAnimation, TokenAmountPanel } from '@masknet/shared'
import { Card, CardContent, DialogContent, Typography, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { isGreaterThan, rightShift, isZero, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAzuroConstants, TransactionStateType, ChainId } from '@masknet/web3-shared-evm'
import { useChainId, useFungibleToken, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { AzuroGame, RATE_DECIMALS, USDT_DECIMALS } from '@azuro-protocol/sdk'
import type { Odds } from './types'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useBoolean } from 'react-use'
import { marketRegistry, outcomeRegistry } from './helpers'
import { usePlaceBetCallback, useMinRate, useActualRate } from './hooks'
import { ConfirmModal } from '../../Tips/components/common/ConfirmModal'
import { activatedSocialNetworkUI } from '../../../social-network'
import { SuccessIcon } from '@masknet/icons'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { contractAddresses } from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0 !important',
    },
    walletStatusBox: { margin: theme.spacing(1, 1, 3, 1) },
    container: { padding: theme.spacing(1) },
    infosContainer: {
        padding: theme.spacing(1.75, 0.75, 0.75, 0.75),
        gap: theme.spacing(0.5),
    },
    infoContainer: {
        minHeight: 30,
    },
    infoTitle: {
        fontWeight: '300',
    },
    actionButton: {
        flexDirection: 'column',
        position: 'relative',
        marginTop: theme.spacing(1.5),
        lineHeight: '22px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '13px 0',
        fontSize: 18,
    },
}))

export interface PlaceBetDialogProps {
    open: boolean
    onClose?: () => void
    game: AzuroGame
    condition: Odds
}

export function PlaceBetDialog(props: PlaceBetDialogProps) {
    const { open, onClose, game, condition } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [amount, setAmount] = useState('')
    const [slippage, setSlippage] = useState<number>(2)
    const [confirmModalIsOpen, openConfirmModal] = useBoolean(false)
    const chainId = useChainId()
    const { AZURO_LP } = useAzuroConstants()
    const {
        value: token,
        error,
        loading,
    } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, contractAddresses[chainId as ChainId]?.token)
    console.log('amount: --------------------- ', amount)
    console.log('token: --------------------- ', token)

    const { value: balance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address)
    const { value: actualRate, loading: actualRateLoading } = useActualRate(condition, amount)

    const rawAmount = rightShift(String(amount), USDT_DECIMALS)
    const deadline = Math.floor(Date.now() / 1000) + 2000
    const { minRate, loading: minRateLoading } = useMinRate(slippage, actualRate ?? 0)
    const rawMinRate = rightShift(minRate, RATE_DECIMALS)

    const [transactionState, transactionCallback, resetTransactionCallback] = usePlaceBetCallback(
        condition.conditionId,
        rawAmount,
        condition.outcomeId,
        deadline,
        rawMinRate,
    )

    const validationMessage = useMemo(() => {
        if (isZero(amount) || !amount) return t('plugin_azuro_enter_an_amount')
        if (isGreaterThan(rightShift(amount ?? 0, token?.decimals ?? 0), balance ?? 0))
            return t('plugin_azuro_insufficient_amount')

        return ''
    }, [amount, balance, token?.decimals])

    const handleSlippage = (event: React.MouseEvent<HTMLElement>, newSlippage: number) => setSlippage(newSlippage)
    const event = `${game.participants[0].name} vs ${game.participants[1].name}`
    const outcome = outcomeRegistry[condition.outcomeRegistryId](game)
    const shareText = t(
        isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
            ? 'plugin_azuro_share'
            : 'plugin_azuro_share_no_official_account',
        {
            account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
        },
    )
    const handleConfirm = useCallback(() => {
        activatedSocialNetworkUI.utils.share?.(shareText)
        openConfirmModal(false)
        onClose?.()
    }, [shareText, onClose])
    const successMessage = <Typography>{t('plugin_azuro_success_message')}</Typography>

    useEffect(() => {
        if (transactionState.type !== TransactionStateType.CONFIRMED) return
        openConfirmModal(true)
    }, [transactionState])

    return (
        <Card className={classes.root}>
            <CardContent className={classes.content}>
                <InjectedDialog open={open} title={t('plugin_azuro_place_bet')} onClose={onClose}>
                    <DialogContent>
                        <div className={classes.container}>
                            <TokenAmountPanel
                                label={t('plugin_azuro_amount')}
                                amount={amount}
                                balance={balance ?? '0'}
                                token={token}
                                onAmountChange={(amount: string) => setAmount(amount)}
                            />
                            <Grid container className={classes.infosContainer}>
                                <Grid className={classes.infoContainer} container justifyContent="space-between">
                                    <Typography className={classes.infoTitle}>Event:</Typography>
                                    <Typography>{event}</Typography>
                                </Grid>
                                <Grid className={classes.infoContainer} container justifyContent="space-between">
                                    <Typography className={classes.infoTitle}>Market:</Typography>
                                    <Typography>{marketRegistry[game.marketRegistryId]}</Typography>
                                </Grid>
                                <Grid className={classes.infoContainer} container justifyContent="space-between">
                                    <Typography className={classes.infoTitle}>Outcome:</Typography>
                                    <Typography>{outcome}</Typography>
                                </Grid>
                                <Grid className={classes.infoContainer} container justifyContent="space-between">
                                    <Typography className={classes.infoTitle}>Odds:</Typography>
                                    <Typography>
                                        {!amount ? (
                                            condition.value
                                        ) : actualRateLoading ? (
                                            <LoadingAnimation />
                                        ) : (
                                            actualRate
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid className={classes.infoContainer} container justifyContent="space-between">
                                    <Typography className={classes.infoTitle}>Min odds:</Typography>
                                    <Typography>
                                        {!amount ? (
                                            condition.value.toFixed(2)
                                        ) : minRateLoading || actualRateLoading ? (
                                            <LoadingAnimation />
                                        ) : (
                                            minRate
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid
                                    container
                                    justifyContent="space-between"
                                    alignItems="center"
                                    className={classes.infoContainer}>
                                    <Typography className={classes.infoTitle}>Slippage:</Typography>
                                    <Typography>
                                        <ToggleButtonGroup value={slippage} exclusive onChange={handleSlippage}>
                                            <ToggleButton value={2}>2%</ToggleButton>
                                            <ToggleButton value={3}>3%</ToggleButton>
                                            <ToggleButton value={10}>10%</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Typography>
                                </Grid>
                            </Grid>
                            <WalletConnectedBoundary>
                                <EthereumERC20TokenApprovedBoundary
                                    amount={rightShift(amount || '0', token?.decimals).toFixed()}
                                    spender={AZURO_LP}
                                    token={token}>
                                    <ActionButton
                                        className={classes.actionButton}
                                        size="large"
                                        variant="contained"
                                        disabled={!!validationMessage}
                                        onClick={transactionCallback}
                                        fullWidth>
                                        {validationMessage || t('plugin_azuro_place_bet')}
                                    </ActionButton>
                                </EthereumERC20TokenApprovedBoundary>
                            </WalletConnectedBoundary>
                        </div>
                    </DialogContent>
                </InjectedDialog>
                <ConfirmModal
                    title={t('plugin_azuro_bet_placed')}
                    open={confirmModalIsOpen}
                    onClose={() => {
                        openConfirmModal(false)
                        resetTransactionCallback()
                        onClose?.()
                    }}
                    icon={<SuccessIcon style={{ height: 64, width: 64 }} />}
                    message={successMessage}
                    confirmText={t('plugin_azuro_share_button')}
                    onConfirm={handleConfirm}
                />
            </CardContent>
        </Card>
    )
}
