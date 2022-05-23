import { InjectedDialog, useOpenShareTxDialog, usePickToken } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { rightShift } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    useAccount,
    useChainId,
    useFungibleTokenBalance,
    useGitcoinConstants,
    useNativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import { DialogContent, Link, Typography } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useDonateCallback } from '../hooks/useDonateCallback'
import { PluginGitcoinMessages } from '../messages'

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: '450px !important',
    },
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0, 2),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
    },
}))

export interface DonateDialogProps extends withClasses<never> {}

export function DonateDialog(props: DonateDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')
    const [postLink, setPostLink] = useState<string | URL>('')

    // context
    const account = useAccount()
    const chainId = useChainId()
    const nativeTokenDetailed = useNativeTokenDetailed()
    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants()

    // #region remote controlled dialog
    const { open, closeDialog: closeDonationDialog } = useRemoteControlledDialog(
        PluginGitcoinMessages.donationDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setTitle(ev.title)
            setAddress(ev.address)
            setPostLink(ev.postLink)
        },
    )
    // #endregion

    // #region the selected token
    const [token = nativeTokenDetailed.value, setToken] = useState<FungibleTokenDetailed | undefined>(
        nativeTokenDetailed.value,
    )
    const tokenBalance = useFungibleTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    // #endregion

    // #region select token dialog
    const pickToken = usePickToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const pickedToken = await pickToken({
            disableNativeToken: false,
            selectedTokens: token?.address ? [token.address] : [],
        })
        if (pickedToken) setToken(pickedToken)
    }, [pickToken, token?.address])
    // #endregion

    // #region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = rightShift(rawAmount || '0', token?.decimals)
    // #endregion

    const [loading, donateCallback] = useDonateCallback(address ?? '', amount.toFixed(), token)

    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''

    const openShareTxDialog = useOpenShareTxDialog()
    const donate = useCallback(async () => {
        const hash = await donateCallback()
        if (hash) {
            const shareText = token
                ? [
                      `I just donated ${title} with ${formatBalance(amount, token.decimals)} ${cashTag}${
                          token.symbol
                      }. ${
                          isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                              ? `Follow @${
                                    isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                                } (mask.io) to donate Gitcoin grants.`
                              : ''
                      }`,
                      '#mask_io',
                      postLink,
                  ].join('\n')
                : ''
            await openShareTxDialog({
                hash,
                onShare() {
                    activatedSocialNetworkUI.utils.share?.(shareText)
                },
            })
        }
    }, [openShareTxDialog, token, donateCallback])

    // #region submit button
    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_gitcoin_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!address) return t('plugin_gitcoin_grant_not_available')
        if (!amount || amount.isZero()) return t('plugin_gitcoin_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance.value ?? '0'))
            return t('plugin_gitcoin_insufficient_balance', {
                symbol: token.symbol,
            })
        return ''
    }, [account, address, amount.toFixed(), chainId, token, tokenBalance.value ?? '0'])
    // #endregion

    if (!token || !address) return null

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={closeDonationDialog} title={title} maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={rawAmount}
                            balance={tokenBalance.value ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: tokenBalance.loading,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <Typography className={classes.tip} variant="body1">
                        <Trans
                            i18nKey="plugin_gitcoin_readme"
                            components={{
                                fund: (
                                    <Link
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={t('plugin_gitcoin_readme_fund_link')}
                                    />
                                ),
                            }}
                        />
                    </Typography>
                    <EthereumWalletConnectedBoundary>
                        <EthereumERC20TokenApprovedBoundary
                            amount={amount.toFixed()}
                            spender={BULK_CHECKOUT_ADDRESS}
                            token={token.type === EthereumTokenType.ERC20 ? token : undefined}>
                            <ActionButton
                                loading={loading}
                                className={classes.button}
                                fullWidth
                                size="large"
                                disabled={!!validationMessage || loading}
                                onClick={donate}
                                variant="contained">
                                {validationMessage || t('plugin_gitcoin_donate')}
                            </ActionButton>
                        </EthereumERC20TokenApprovedBoundary>
                    </EthereumWalletConnectedBoundary>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
