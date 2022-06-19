import { InjectedDialog, LoadingAnimation, TokenAmountPanel, useOpenShareTxDialog } from '@masknet/shared'
import { Card, CardContent, DialogContent, Typography, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../locales'
import { useI18N as useBaseI18N } from '../../../utils'
import { isGreaterThan, rightShift, isZero, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAzuroConstants, ChainId } from '@masknet/web3-shared-evm'
import { useChainId, useFungibleToken, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { useState, useMemo, useCallback } from 'react'
import { AzuroGame, RATE_DECIMALS, USDT_DECIMALS } from '@azuro-protocol/sdk'
import type { Odds } from './types'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { marketRegistry, outcomeRegistry } from './helpers'
import { usePlaceBetCallback, useMinRate, useActualRate } from './hooks'
import { activatedSocialNetworkUI } from '../../../social-network'
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
    const { t: tr } = useBaseI18N()
    const t = useI18N()
    const { classes } = useStyles()
    const [amount, setAmount] = useState('')
    const [slippage, setSlippage] = useState(2)
    const chainId = useChainId()
    const { AZURO_LP } = useAzuroConstants()
    const {
        value: token,
        error,
        loading,
    } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        chainId === ChainId.Sokol ? contractAddresses[chainId as ChainId]?.token : '',
    )
    const { value: balance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address)
    const { value: actualRate, loading: actualRateLoading } = useActualRate(condition, amount)

    const rawAmount = rightShift(String(amount), USDT_DECIMALS)
    const deadline = Math.floor(Date.now() / 1000) + 2000
    const { minRate, loading: minRateLoading } = useMinRate(slippage, actualRate ?? 0)
    const rawMinRate = rightShift(minRate, RATE_DECIMALS)

    const [{ loading: isPlacing }, placeBetCallback] = usePlaceBetCallback(
        condition.conditionId,
        rawAmount,
        condition.outcomeId,
        deadline,
        rawMinRate,
    )

    const validationMessage = useMemo(() => {
        if (isZero(amount) || !amount) return t.plugin_azuro_enter_an_amount()
        if (isGreaterThan(rightShift(amount ?? 0, token?.decimals ?? 0), balance ?? 0))
            return t.plugin_azuro_insufficient_amount()

        return ''
    }, [amount, balance, token?.decimals, t])

    const handleSlippage = (event: React.MouseEvent<HTMLElement>, newSlippage: number) => setSlippage(newSlippage)
    const event = `${game.participants[0].name} vs ${game.participants[1].name}`
    const outcome = outcomeRegistry[condition.outcomeRegistryId](game)
    const shareText = useMemo(() => {
        const isOnTwitter = isTwitter(activatedSocialNetworkUI)
        const isOnFacebook = isFacebook(activatedSocialNetworkUI)
        return isOnTwitter || isOnFacebook
            ? t.plugin_azuro_share({ account: isOnTwitter ? tr('twitter_account') : tr('facebook_account') })
            : t.plugin_azuro_share_no_official_account()
    }, [activatedSocialNetworkUI])

    const successMessage = <Typography>{t.plugin_azuro_success_message()}</Typography>

    const openShareTxDialog = useOpenShareTxDialog()
    const placeBet = useCallback(async () => {
        const hash = await placeBetCallback()

        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
    }, [placeBetCallback, openShareTxDialog])

    return (
        <Card className={classes.root}>
            <CardContent className={classes.content}>
                <InjectedDialog open={open} title={t.plugin_azuro_place_bet()} onClose={onClose}>
                    <DialogContent>
                        <div className={classes.container}>
                            <TokenAmountPanel
                                label={t.plugin_azuro_amount()}
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
                                {chainId === ChainId.Sokol ? (
                                    <EthereumERC20TokenApprovedBoundary
                                        amount={rightShift(amount || '0', token?.decimals).toFixed()}
                                        spender={AZURO_LP}
                                        token={token}>
                                        <ActionButton
                                            className={classes.actionButton}
                                            size="large"
                                            variant="contained"
                                            disabled={!!validationMessage}
                                            onClick={placeBet}
                                            fullWidth>
                                            {validationMessage || t.plugin_azuro_place_bet()}
                                        </ActionButton>
                                    </EthereumERC20TokenApprovedBoundary>
                                ) : (
                                    <ActionButton
                                        className={classes.actionButton}
                                        size="large"
                                        variant="contained"
                                        disabled={isPlacing || !!validationMessage}
                                        onClick={placeBet}
                                        fullWidth>
                                        {isPlacing ? tr('loading') : validationMessage || t.plugin_azuro_place_bet()}
                                    </ActionButton>
                                )}
                            </WalletConnectedBoundary>
                        </div>
                    </DialogContent>
                </InjectedDialog>
            </CardContent>
        </Card>
    )
}
