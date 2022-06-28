import { ChangeEvent, useState, useCallback, useMemo, useEffect } from 'react'
import { Trans } from 'react-i18next'
import {
    DialogContent,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    Link,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { first } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import formatDateTime from 'date-fns/format'
import { PluginWalletStatusBar, useI18N } from '../../../../utils'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { UnreviewedWarning } from '.././UnreviewedWarning'
import ActionButton, { ActionButtonPromise } from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DateTimePanel } from '../../../../web3/UI/DateTimePanel'
import { toAsset } from '../../helpers'
import { PluginTraderMessages } from '../../../Trader/messages'
import getUnixTime from 'date-fns/getUnixTime'
import { CurrencyType, NetworkPluginID, NonFungibleAsset, rightShift, ZERO } from '@masknet/web3-shared-base'
import type { Coin } from '../../../Trader/types'
import { SelectTokenListPanel } from '.././SelectTokenListPanel'
import { isWyvernSchemaName } from '../../utils'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { useAccount, useChainId, useFungibleTokenWatched } from '@masknet/plugin-infra/web3'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { Order } from 'opensea-js/lib/types'
import { useOpenSea } from '../../hooks/useOpenSea'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
            borderRadius: 0,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: 0,
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
            margin: 0,
        },
        button: {
            flex: 1,
            height: 40,
            margin: 0,
        },
    }
})

export interface MakeOfferDialogProps {
    open: boolean
    asset?: NonFungibleAsset<ChainId, SchemaType>
    order?: Order
    onClose: () => void
}

export function MakeOfferDialog(props: MakeOfferDialogProps) {
    const { asset, open, onClose } = props

    const isAuction = !!asset?.auction
    const isVerified = asset?.collection?.verified ?? false
    const desktopOrder = first(asset?.orders)
    const leastPrice = desktopOrder ? new BigNumber(desktopOrder.price?.[CurrencyType.USD] ?? '0') : ZERO

    const paymentTokens = asset?.payment_tokens

    const selectedPaymentToken = first(paymentTokens)

    const { t } = useI18N()
    const { classes } = useStyles()

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const opensea = useOpenSea(chainId)
    const [expirationDateTime, setExpirationDateTime] = useState(new Date())
    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)
    const [insufficientBalance, setInsufficientBalance] = useState(false)

    const { amount, token, balance, setAmount, setAddress } = useFungibleTokenWatched(
        NetworkPluginID.PLUGIN_EVM,
        selectedPaymentToken?.address,
    )

    const onMakeOffer = useCallback(async () => {
        if (!asset) return
        if (!asset.tokenId || !asset.address) return
        if (!token?.value) return
        if (token.value.schema !== SchemaType.Native && token.value.schema !== SchemaType.ERC20) return
        const schemaName = asset.contract?.schema

        await opensea?.createBuyOrder({
            asset: toAsset({
                tokenId: asset.tokenId,
                tokenAddress: asset.address,
                schemaName: isWyvernSchemaName(schemaName) ? schemaName : undefined,
            }),
            accountAddress: account,
            startAmount: Number.parseFloat(amount),
            expirationTime: !isAuction ? getUnixTime(expirationDateTime) : undefined,
            paymentTokenAddress: token.value.schema === SchemaType.Native ? undefined : token.value.address,
        })
    }, [asset, token, account, amount, expirationDateTime, isAuction, opensea])

    const { setDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const onConvertClick = useCallback(() => {
        if (!token?.value) return
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.value.address,
                    name: token.value.name ?? '',
                    symbol: token.value.symbol ?? '',
                    contract_address: token.value.address,
                    decimals: token.value.decimals,
                } as Coin,
            },
        })
    }, [token.value, openSwapDialog])

    useEffect(() => {
        setAmount('')
        setExpirationDateTime(new Date())
    }, [open])

    const validationMessage = useMemo(() => {
        setInsufficientBalance(false)
        const amount_ = rightShift(amount ?? '0', token.value?.decimals || 0)
        const balance_ = new BigNumber(balance.value ?? '0')
        if (amount_.isNaN() || amount_.isZero()) return t('plugin_collectible_enter_a_price')
        if (balance_.isZero() || amount_.isGreaterThan(balance_)) {
            setInsufficientBalance(true)
            return t('plugin_collectible_insufficient_balance')
        }
        if (!isAuction && expirationDateTime.getTime() - Date.now() <= 0)
            return t('plugin_collectible_invalid_expiration_date')
        if (!isVerified && !unreviewedChecked) return t('plugin_collectible_ensure_unreviewed_item')
        if (!ToS_Checked) return t('plugin_collectible_check_tos_document')
        if (leastPrice.isGreaterThan(amount_)) {
            return t('plugin_collectible_insufficient_offer')
        }
        return ''
    }, [amount, balance.value, expirationDateTime, isVerified, isAuction, unreviewedChecked, ToS_Checked])

    if (!asset) return null

    return (
        <InjectedDialog
            title={isAuction ? t('plugin_collectible_place_a_bid') : t('plugin_collectible_make_an_offer')}
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0} className={classes.content}>
                    <CardContent>
                        {isVerified ? null : (
                            <Box sx={{ marginBottom: 2 }}>
                                <UnreviewedWarning />
                            </Box>
                        )}
                        <SelectTokenListPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            token={token.value}
                            onAmountChange={setAmount}
                            onTokenChange={(x) => setAddress(x.address)}
                            tokens={paymentTokens}
                        />

                        {!isAuction ? (
                            <DateTimePanel
                                label={t('plugin_collectible_expiration_date')}
                                date={expirationDateTime}
                                min={formatDateTime(new Date(), "yyyy-MM-dd'T00:00")}
                                onChange={setExpirationDateTime}
                                className={classes.panel}
                                fullWidth
                            />
                        ) : null}
                        <FormControlLabel
                            className={classes.label}
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={ToS_Checked}
                                    onChange={(ev: ChangeEvent<HTMLInputElement>) => setToS_Checked(ev.target.checked)}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    <Trans
                                        i18nKey="plugin_collectible_legal_text"
                                        components={{
                                            terms: (
                                                <Link
                                                    color="primary"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href="https://opensea.io/tos"
                                                />
                                            ),
                                        }}
                                    />
                                </Typography>
                            }
                        />
                        {isVerified ? null : (
                            <FormControlLabel
                                className={classes.label}
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={unreviewedChecked}
                                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                            setUnreviewedChecked(ev.target.checked)
                                        }
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        {t('plugin_collectible_approved_by_opensea')}
                                    </Typography>
                                }
                            />
                        )}
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <PluginWalletStatusBar>
                            <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                                <Box
                                    className={classes.buttons}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center">
                                    <ActionButtonPromise
                                        className={classes.button}
                                        disabled={!!validationMessage}
                                        size="large"
                                        init={
                                            validationMessage ||
                                            t(
                                                isAuction
                                                    ? 'plugin_collectible_place_bid'
                                                    : 'plugin_collectible_make_offer',
                                            )
                                        }
                                        waiting={t(
                                            isAuction
                                                ? 'plugin_collectible_place_bid'
                                                : 'plugin_collectible_make_offer',
                                        )}
                                        complete={t('plugin_collectible_done')}
                                        failed={t('plugin_collectible_retry')}
                                        executor={onMakeOffer}
                                        completeOnClick={onClose}
                                        failedOnClick="use executor"
                                    />
                                    {insufficientBalance ? (
                                        <ActionButton
                                            className={classes.button}
                                            variant="contained"
                                            size="large"
                                            onClick={onConvertClick}>
                                            {t('plugin_collectible_get_more_token', { token: token.value?.symbol })}
                                        </ActionButton>
                                    ) : null}
                                </Box>
                            </ChainBoundary>
                        </PluginWalletStatusBar>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
