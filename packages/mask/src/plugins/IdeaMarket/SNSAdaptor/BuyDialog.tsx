import {
    Card,
    CardActions,
    CardContent,
    Checkbox,
    DialogContent,
    FormControlLabel,
    Link,
    Typography,
} from '@mui/material'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import {
    ERC20TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    TransactionStateType,
    useFungibleTokenWatched,
    useIdeaMarketConstants,
} from '@masknet/web3-shared-evm'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { leftShift, rightShift } from '@masknet/web3-shared-base'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { Trans } from 'react-i18next'
import { ToS } from '../constants'
import BigNumber from 'bignumber.js'
import { useBuyTokenCallback } from '../hooks/useBuyTokenCallback'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../Wallet/messages'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            marginLeft: theme.spacing(-0.5),
            marginRight: theme.spacing(-0.5),
        },
        content: {
            padding: theme.spacing(0),
        },
        button: {
            flex: 1,
            margin: `${theme.spacing(0)} ${theme.spacing(0.5)}`,
        },
    }
})

interface BuyDialogProps {
    open: boolean
    ideaToken: FungibleTokenDetailed
    onClose: () => void
}

export function BuyDialog(props: BuyDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { open, onClose, ideaToken } = props
    const { MULTI_ACTION_CONTRACT } = useIdeaMarketConstants()
    const [ToS_Checked, setToS_Checked] = useState(false)
    const daiAddress = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
    const defaultToken = daiAddress
    const { amount, token, balance, setAmount, setToken } = useFungibleTokenWatched({
        type: EthereumTokenType.ERC20,
        address: defaultToken ?? '',
    })
    const paymentCurrency = token?.value
    const [buyState, buyCallback, resetCallback] = useBuyTokenCallback(
        paymentCurrency?.address || '0',
        ideaToken.address,
        amount,
        amount,
        rightShift(new BigNumber(amount), paymentCurrency?.decimals).toString() ?? '0',
        0,
    )

    const validationMessage = useMemo(() => {
        const balanceToEthFormat = leftShift(balance.value ?? '0', paymentCurrency?.decimals)
        const amountToBN = new BigNumber(amount)

        if (!amount || amountToBN.isZero()) return t('plugin_ideamarket_enter_an_amount')
        if (amountToBN.isGreaterThan(balanceToEthFormat)) return t('plugin_ideamarket_insufficient_balance')

        if (!ToS_Checked) return t('plugin_ideamarket_check_tos_document')

        return ''
    }, [amount, balance.value, ToS_Checked, paymentCurrency?.decimals])

    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            [
                t(
                    isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                        ? 'plugin_ideamarket_share'
                        : 'plugin_ideamarket_share_no_official_account',
                    {
                        idea_token: ideaToken.name,
                    },
                ),
                '#mask_io #ideamarket',
                postLink,
            ].join('\n'),
        )
        .toString()

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    if (buyState.type === TransactionStateType.HASH || buyState.type === TransactionStateType.CONFIRMED)
                        onClose()
                }
                resetCallback()
            },
            [buyState, onClose],
        ),
    )

    const onClickBuy = useCallback(async () => {
        buyCallback()
    }, [buyCallback])

    useEffect(() => {
        if (buyState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareLink,
            state: buyState,
            summary: `Buying some '${ideaToken.name}' token.`,
        })
    }, [buyState])

    console.log(amount)

    return (
        <InjectedDialog title={t('plugin_ideamarket_buy')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <SelectTokenAmountPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            token={token.value as FungibleTokenDetailed}
                            onAmountChange={setAmount}
                            onTokenChange={setToken}
                            FungibleTokenListProps={{ whitelist: [daiAddress] }}
                        />
                        <FormControlLabel
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
                                        i18nKey="plugin_ideamarket_legal_text"
                                        components={{
                                            terms: (
                                                <Link
                                                    color="primary"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={ToS}
                                                />
                                            ),
                                        }}
                                    />
                                </Typography>
                            }
                        />
                    </CardContent>
                    <CardActions>
                        <EthereumWalletConnectedBoundary>
                            {/* {token.value?.type === EthereumTokenType.Native ? (
                                <ActionButton
                                    fullWidth
                                    className={classes.button}
                                    variant="contained"
                                    disabled={!!validationMessage}
                                    onClick={onClickBuy}>
                                    {validationMessage || t('plugin_ideamarket_buy')}
                                </ActionButton>
                            ) : null} */}
                            {/* {token.value?.type === EthereumTokenType.ERC20 ? ( */}
                            <EthereumERC20TokenApprovedBoundary
                                amount={rightShift(amount, paymentCurrency?.decimals).toString()}
                                spender={MULTI_ACTION_CONTRACT}
                                token={token.value as ERC20TokenDetailed}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    variant="contained"
                                    disabled={!!validationMessage}
                                    onClick={onClickBuy}>
                                    {validationMessage || t('plugin_ideamarket_buy')}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                            {/* ) : null} */}
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
