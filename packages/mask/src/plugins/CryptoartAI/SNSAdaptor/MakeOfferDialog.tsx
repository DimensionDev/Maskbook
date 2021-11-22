import { useState, useCallback, useMemo, useEffect } from 'react'
import { DialogContent, Box, Card, CardContent, CardActions } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { first } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import { FungibleTokenDetailed, isNative, useFungibleTokenWatched, useChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../Wallet/messages'
import type { useAsset } from '../hooks/useAsset'
import { formatBalance, TransactionStateType } from '@masknet/web3-shared-evm'
import { resolvePaymentTokensOnCryptoartAI } from '../pipes'
import { usePlaceBidCallback } from '../hooks/usePlaceBidCallback'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },
        panel: {
            marginTop: theme.spacing(2),
            '&:first-child': {
                marginTop: 0,
            },
        },
        label: {},
        buttons: {
            width: '100%',
            margin: `0 ${theme.spacing(-0.5)}`,
        },
        button: {
            flex: 1,
            margin: `${theme.spacing(1.5)} ${theme.spacing(0.5)} 0`,
        },
        markdown: {
            margin: theme.spacing(1, 0),
        },
    }
})

export interface MakeOfferDialogProps {
    asset?: ReturnType<typeof useAsset>
    open: boolean
    onClose: () => void
}

export function MakeOfferDialog(props: MakeOfferDialogProps) {
    const { asset, open, onClose } = props
    const is24Auction = asset?.value?.is24Auction ?? false
    const isVerified = (!asset?.value?.isSoldOut && !asset?.value?.is_owner) ?? false

    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()

    const paymentTokens = resolvePaymentTokensOnCryptoartAI(chainId) ?? []
    const selectedPaymentToken = first(paymentTokens)

    const { amount, token, balance, setAmount, setToken } = useFungibleTokenWatched(selectedPaymentToken)

    const [atleastBidValue, setAtleastBidValue] = useState(0)
    useEffect(() => {
        setAtleastBidValue(
            asset?.value?.latestBidVo?.priceInEth ? Number(asset?.value?.latestBidVo.priceInEth) + 0.01 : 0,
        )
    }, [asset?.value?.latestBidVo])

    const [placeBidState, placeBidCallback, resetCallback] = usePlaceBidCallback(
        is24Auction,
        Number(asset?.value?.editionNumber),
    )

    const onMakeOffer = useCallback(() => {
        placeBidCallback(Number(amount) * Math.pow(10, 18))
    }, [placeBidCallback, amount])

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            resetCallback()
        },
    )

    useEffect(() => {
        if (placeBidState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: placeBidState,
            summary:
                (asset?.value?.is24Auction
                    ? t('plugin_collectible_place_a_bid')
                    : t('plugin_collectible_make_an_offer')) +
                ' ' +
                asset?.value?.title,
        })
    }, [placeBidState])

    useEffect(() => {
        setAmount(atleastBidValue.toString())
    }, [open])

    const validationMessage = useMemo(() => {
        const amount_ = new BigNumber(amount || '0')
        const balance_ = new BigNumber(balance.value ?? '0')
        if (amount_.isZero()) return t('plugin_collectible_enter_a_price')
        if (Number(amount) < atleastBidValue) return t('plugin_collectible_enter_a_price')
        if (balance_.isZero() || Number(amount) > Number(formatBalance(balance.value, token?.value?.decimals, 6)))
            return t('plugin_collectible_insufficient_balance')
        if (
            asset?.value?.is24Auction &&
            new Date(asset.value.latestBidVo?.auctionEndTime).getTime() - Date.now() <= 0
        ) {
            return t('plugin_cryptoartai_auctionend')
        }
        return ''
    }, [amount, balance.value, isVerified, is24Auction])

    if (!asset?.value) return null
    return (
        <InjectedDialog
            title={
                asset?.value?.is24Auction ? t('plugin_collectible_place_a_bid') : t('plugin_collectible_make_an_offer')
            }
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <h3>
                            {(asset?.value?.is24Auction
                                ? t('plugin_collectible_place_a_bid')
                                : t('plugin_collectible_make_an_offer')) +
                                ' ' +
                                asset?.value?.title}
                        </h3>
                        <SelectTokenAmountPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            token={token.value as FungibleTokenDetailed}
                            disableNativeToken={!paymentTokens.some((x: any) => isNative(x.address))}
                            onAmountChange={setAmount}
                            onTokenChange={setToken}
                            TokenAmountPanelProps={{
                                label: t('plugin_collectible_price'),
                            }}
                            FixedTokenListProps={{
                                selectedTokens: selectedPaymentToken ? [selectedPaymentToken.address] : [],
                                tokens: paymentTokens,
                                whitelist: paymentTokens.map((x: any) => x.address),
                            }}
                        />
                        <p>
                            {t('plugin_cryptoartai_current_highestoffer')}
                            <strong>{(asset.value?.latestBidVo?.priceInEth ?? 0) + ' ETH'}</strong>
                        </p>
                        <p>{t('plugin_cryptoartai_bidleast') + atleastBidValue + ' ETH'}</p>
                        <p>{t('plugin_cryptoartai_escrowed')}</p>
                        <p>
                            {t('plugin_cryptoartai_currentbalance_is') +
                                formatBalance(balance.value, token?.value?.decimals, 6) +
                                ' ETH'}
                        </p>
                        {asset?.value?.is24Auction ? (
                            <p>
                                {t('plugin_cryptoartai_auctionendtime')}
                                <strong>{asset.value.latestBidVo?.auctionEndTime}</strong>
                            </p>
                        ) : null}
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <EthereumWalletConnectedBoundary>
                            <Box className={classes.buttons} display="flex" alignItems="center" justifyContent="center">
                                <ActionButton
                                    className={classes.button}
                                    variant="contained"
                                    disabled={!!validationMessage}
                                    fullWidth
                                    onClick={onMakeOffer}>
                                    {validationMessage ||
                                        t(
                                            is24Auction
                                                ? 'plugin_collectible_place_bid'
                                                : 'plugin_collectible_make_offer',
                                        )}
                                </ActionButton>
                            </Box>
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
