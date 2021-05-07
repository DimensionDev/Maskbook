import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core'




const useStyles = makeStyles((theme) =>
    createStyles({
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
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)

export interface DonateDialogProps extends withClasses<never> {}

export function InvestDialog(props: DonateDialogProps) {
    // const { t } = useI18N()
    // const classes = useStylesExtends(useStyles(), props)

    // const [name, setName] = useState('')
    // const [address, setAddress] = useState('')

    // // context
    // const account = useAccount()
    // const chainId = useChainId()
    // const TOKEN_LIST = useConstant(CONSTANT, 'ALLOWED_TOKEN_ADDRESSES')

    // //#region remote controlled dialog
    // const [open, setDonationDialogOpen] = useRemoteControlledDialog(
    //     PluginDHedgeMessages.events.InvestDialogUpdated,
    //     (ev) => {
    //         if (ev.open) {
    //             setName(ev.name)
    //             setAddress(ev.address)
    //         }
    //     },
    // )
    // const onClose = useCallback(() => {
    //     setDonationDialogOpen({
    //         open: false,
    //     })
    // }, [setDonationDialogOpen])
    // //#endregion

    // //#region select token
    // const [token, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed>(inputToken)
    // const [id] = useState(uuid())
    // const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
    //     WalletMessages.events.selectTokenDialogUpdated,
    //     useCallback(
    //         (ev: SelectTokenDialogEvent) => {
    //             if (ev.open || !ev.token || ev.uuid !== id) return
    //             setToken(ev.token)
    //         },
    //         [id],
    //     ),
    // )
    // const onSelectTokenChipClick = useCallback(() => {
    //     setSelectTokenDialogOpen({
    //         open: true,
    //         uuid: id,
    //         disableEther: true,
    //         FixedTokenListProps: {
    //             selectedTokens: token ? [token.address] : [],
    //             whitelist: [token.address],
    //         },
    //     })
    // }, [id, token.address])
    // //#endregion

    // //#region amount
    // const [rawAmount, setRawAmount] = useState('')
    // const amount = new BigNumber(rawAmount || '0').multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0))
    // const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
    //     token?.type ?? EthereumTokenType.Ether,
    //     token?.address ?? '',
    // )
    // //#endregion

    // //#region connect wallet
    // const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    // const onConnect = useCallback(() => {
    //     setSelectProviderDialogOpen({
    //         open: true,
    //     })
    // }, [setSelectProviderDialogOpen])
    // //#endregion

    // //#region blocking
    // const [investState, investCallback, resetInvestCallback] = useInvestCallback(pool.address, amount.toFixed(), token)
    // //#endregion

    // //#region transaction dialog
    // const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    // const postLink = usePostLink()
    // const shareLink = activatedSocialNetworkUI.utils
    //     .getShareLinkURL?.(
    //         token
    //             ? [
    //                   `I just donated ${name} with ${formatBalance(amount, token.decimals)} ${cashTag}${
    //                       token.symbol
    //                   }. Follow @realMaskbook (mask.io) to donate Gitcoin grants.`,
    //                   '#mask_io',
    //                   postLink,
    //               ].join('\n')
    //             : '',
    //     )
    //     .toString()

    // // close the transaction dialog
    // const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
    //     EthereumMessages.events.transactionDialogUpdated,
    //     (ev) => {
    //         if (ev.open) return
    //         if (donateState.type === TransactionStateType.HASH) setRawAmount('')
    //         resetDonateCallback()
    //     },
    // )

    // // open the transaction dialog
    // useEffect(() => {
    //     if (!token) return
    //     if (donateState.type === TransactionStateType.UNKNOWN) return
    //     setTransactionDialogOpen({
    //         open: true,
    //         shareLink,
    //         state: donateState,
    //         summary: `Donating ${formatBalance(amount, token.decimals)} ${token.symbol} for ${name}.`,
    //     })
    // }, [donateState /* update tx dialog only if state changed */])
    // //#endregion

    // //#region Swap
    // const { onOpen: openSwapDialog } = useRemoteControlledDialogEvent(PluginTraderMessages.events.swapDialogUpdated)
    // //#endregion

    // //#region submit button
    // const validationMessage = useMemo(() => {
    //     if (!account) return t('plugin_wallet_connect_a_wallet')
    //     if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
    //     if (amount.isGreaterThan(tokenBalance))
    //         return t('plugin_dhedge_insufficient_balance', {
    //             symbol: token.symbol,
    //         })
    //     return ''
    // }, [account, amount.toFixed(), token, tokenBalance])
    // //#endregion

    // if (!token || !address) return null

    // return (
    //     <div className={classes.root}>
    //         <InjectedDialog open={open} onClose={onClose} title={name} DialogProps={{ maxWidth: 'xs' }}>
    //             <DialogContent>
    //                 <form className={classes.form} noValidate autoComplete="off">
    //                     <TokenAmountPanel
    //                         label="Amount"
    //                         amount={rawAmount}
    //                         balance={tokenBalance ?? '0'}
    //                         token={token}
    //                         onAmountChange={setRawAmount}
    //                         SelectTokenChip={{
    //                             // loading: loadingTokenBalance,
    //                             ChipProps: {
    //                                 onClick: onSelectTokenChipClick,
    //                             },
    //                         }}
    //                     />
    //                 </form>
    //                 <Chip
    //                     // classes={{
    //                     //     root: classNames(classes.max, MaxChipProps?.classes?.root),
    //                     //     ...MaxChipProps?.classes,
    //                     // }}
    //                     size="small"
    //                     label="Get"
    //                     clickable
    //                     color="primary"
    //                     variant="outlined"
    //                     onClick={openSwapDialog}
    //                 />
    //                 <Typography className={classes.tip} variant="body1">
    //                     <Trans
    //                         i18nKey="plugin_gitcoin_readme"
    //                         components={{
    //                             fund: (
    //                                 <Link
    //                                     target="_blank"
    //                                     rel="noopener noreferrer"
    //                                     href={t('plugin_gitcoin_readme_fund_link')}
    //                                 />
    //                             ),
    //                         }}
    //                     />
    //                 </Typography>
    //                 <EthereumWalletConnectedBoundary>
    //                     <EthereumERC20TokenApprovedBoundary
    //                         amount={amount.toFixed()}
    //                         spender={pool.address}
    //                         token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
    //                         <ActionButton
    //                             className={classes.button}
    //                             fullWidth
    //                             disabled={!!validationMessage}
    //                             onClick={investCallback}
    //                             variant="contained">
    //                             {validationMessage || t('plugin_dhedge_invest')}
    //                         </ActionButton>
    //                     </EthereumERC20TokenApprovedBoundary>
    //                 </EthereumWalletConnectedBoundary>
    //             </DialogContent>
    //         </InjectedDialog>
    //     </div>
    // )
    return <></>
}
