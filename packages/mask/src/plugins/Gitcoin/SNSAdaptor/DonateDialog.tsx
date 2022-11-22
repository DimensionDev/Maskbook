import { useCallback, useMemo, useState } from 'react'
import {
    InjectedDialog,
    useOpenShareTxDialog,
    useSelectFungibleToken,
    FungibleTokenInput,
    PluginWalletStatusBar,
    WalletConnectedBoundary,
    EthereumERC20TokenApprovedBoundary,
} from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, ActionButton } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatBalance, FungibleToken, rightShift } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { useChainContext, useFungibleToken, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base.js'
import { Translate, useI18N } from '../locales/index.js'
import { useI18N as useBaseI18N } from '../../../utils/index.js'
import { useDonateCallback } from '../hooks/useDonateCallback.js'
import { PluginGitcoinMessages } from '../messages.js'

const useStyles = makeStyles()((theme) => ({
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
        margin: 0,
        padding: 0,
        height: 40,
    },
    actions: {
        padding: '0 !important',
    },
}))

export interface DonateDialogProps {}

export function DonateDialog(props: DonateDialogProps) {
    const { t: tr } = useBaseI18N()
    const t = useI18N()
    const { classes } = useStyles()
    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')
    const [postLink, setPostLink] = useState<string | URL>('')

    // context
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nativeTokenDetailed = useFungibleToken(NetworkPluginID.PLUGIN_EVM)

    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants(chainId)

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
    const [token = nativeTokenDetailed.value, setToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(
        nativeTokenDetailed.value,
    )

    const tokenBalance = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address)

    // #region select token dialog
    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const pickedToken = await selectFungibleToken({
            disableNativeToken: false,
            selectedTokens: token?.address ? [token.address] : [],
        })
        if (pickedToken) setToken(pickedToken)
    }, [selectFungibleToken, token?.address])
    // #endregion

    // #region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = rightShift(rawAmount || '0', token?.decimals)
    // #endregion

    // #region blocking
    const [{ loading }, donateCallback] = useDonateCallback(address ?? '', amount.toFixed(), token)
    // #endregion

    const openShareTxDialog = useOpenShareTxDialog()
    const donate = useCallback(async () => {
        const hash = await donateCallback()
        if (typeof hash !== 'string') return

        const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
        const shareText = token
            ? t.share_text({
                  balance: formatBalance(amount, token?.decimals),
                  symbol: `${cashTag}${token?.symbol || ''}`,
                  promote: t.promote(),
                  project_name: title,
              })
            : ''
        await openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })

        // clean dialog
        setRawAmount('')
    }, [openShareTxDialog, token, donateCallback, tr, t])

    // #region submit button
    const validationMessage = useMemo(() => {
        if (!token) return t.select_a_token()
        if (!account) return tr('plugin_wallet_connect_a_wallet')
        if (!address) return t.grant_not_available()
        if (!amount || amount.isZero()) return t.enter_an_amount()
        if (amount.isGreaterThan(tokenBalance.value ?? '0'))
            return t.insufficient_balance({
                symbol: token.symbol!,
            })
        return ''
    }, [account, address, amount.toFixed(), chainId, token, tokenBalance.value ?? '0'])
    // #endregion

    if (!token || !address) return null

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={closeDonationDialog} title={title} maxWidth="xs">
                <DialogContent style={{ padding: 16 }}>
                    <form className={classes.form} noValidate autoComplete="off">
                        <FungibleTokenInput
                            label={tr('amount')}
                            amount={rawAmount}
                            balance={tokenBalance.value ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            onSelectToken={onSelectTokenChipClick}
                            loadingBalance={tokenBalance.loading}
                        />
                    </form>
                    <Typography className={classes.tip} variant="body1" sx={{ marginBottom: 2 }}>
                        <Translate.gitcoin_readme
                            components={{
                                fund: <Link target="_blank" rel="noopener noreferrer" href={t.readme_fund_link()} />,
                            }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <PluginWalletStatusBar>
                        <WalletConnectedBoundary>
                            <EthereumERC20TokenApprovedBoundary
                                classes={{ button: classes.button }}
                                amount={amount.toFixed()}
                                spender={BULK_CHECKOUT_ADDRESS}
                                token={token.schema === SchemaType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    loading={loading}
                                    fullWidth
                                    size="large"
                                    disabled={!!validationMessage || loading}
                                    onClick={donate}>
                                    {validationMessage || t.donate()}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        </WalletConnectedBoundary>
                    </PluginWalletStatusBar>
                </DialogActions>
            </InjectedDialog>
        </div>
    )
}
