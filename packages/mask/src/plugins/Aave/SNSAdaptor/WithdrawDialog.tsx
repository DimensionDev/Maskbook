import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, DialogContent, Link, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { FormattedAddress } from '@masknet/shared'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import {
    useChainId,
    useAccount,
    useERC20TokenDetailed,
    useFungibleTokenBalance,
    EthereumTokenType,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import type { Wallet } from '@masknet/web3-shared-evm'
import { formatBalance, formatEthereumAddress, resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import TextField from '@mui/material/TextField'
import { ExternalLink } from 'react-feather'
import { TokenIcon } from '@masknet/shared'
import { useWithdrawCallback } from '../hooks/useWithdrawCallback'
import { useAaveLendingPoolAssetReserveData } from '../hooks/useAaveLendingPoolAssetReserveData'
import BigNumber from 'bignumber.js'
import { useRemoteControlledDialog } from '@masknet/shared'

import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { WalletMessages } from '../../Wallet/messages'

const useStyles = makeStyles()((theme) => ({
    section: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ['& > p']: {
            fontSize: 16,
            lineHeight: '22px',
            color: theme.palette.text.primary,
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
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIcon: {
        color: MaskColorVar.twitterInfo,
    },
    button: {
        fontSize: 18,
        lineHeight: '22px',
        fontWeight: 600,
        padding: '13px 0',
        borderRadius: 12,
        height: 'auto',
    },
    content: {
        marginLeft: 40,
        marginRight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        marginLeft: 40,
        marginRight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 40,
    },
}))

export interface WithdrawDialogUIProps extends withClasses<never> {
    open: boolean
    inputTokenAddress: string
    onConfirm: () => void
    onOpen?: () => void
    onClose?: () => void
    wallet?: Wallet
    lendingPoolContractAddress: string
}

export function WithdrawDialogUI(props: WithdrawDialogUIProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { open, wallet, inputTokenAddress, onOpen, onConfirm, onClose, lendingPoolContractAddress } = props
    const chainId = useChainId()
    const account = useAccount()
    const [amountToWithdraw, setAmountToWithdraw] = useState('0')

    //#region pool token
    const {
        value: inputToken,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(inputTokenAddress)
    //#endregion

    function _handleAmountToWithdrawChange(e: any) {
        let s = e.target.value ?? ''
        if (s.trim() === '') {
            s = '0'
        }
        setAmountToWithdraw(s)
    }
    const amount = new BigNumber(amountToWithdraw || '0').shiftedBy(inputToken?.decimals ?? 0)

    const {
        value: assetReserve,
        loading: loadingAssetReserve,
        retry: retryAssetReserve,
    } = useAaveLendingPoolAssetReserveData(lendingPoolContractAddress, inputToken?.address ?? '')

    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useFungibleTokenBalance(EthereumTokenType.ERC20, assetReserve?.aTokenAddress ?? '')

    //#region pool token
    const {
        value: assetAToken,
        loading: loadingAssetAToken,
        retry: retryAssetAToken,
        error: errorAssetAToken,
    } = useERC20TokenDetailed(assetReserve?.aTokenAddress)
    //#endregion

    const [withdrawState, withdrawCallback, resetWithdrawCallback] = useWithdrawCallback(
        lendingPoolContractAddress,
        assetAToken!,
        amount.toFixed(),
        '0',
    )

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev: any) => {
                if (!ev.open) {
                    if (withdrawState.type === TransactionStateType.HASH) {
                        if (onClose) {
                            onClose()
                        }
                    }
                }
                if (withdrawState.type === TransactionStateType.HASH) setAmountToWithdraw('0')
                resetWithdrawCallback()
            },
            [withdrawState, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!inputToken) return
        if (!assetAToken) return
        if (withdrawState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,

            state: withdrawState,
            summary: `Withdrawing ${formatBalance(amount, assetAToken.decimals)}${assetAToken.symbol} .`,
        })
    }, [withdrawState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return 'Pls connect a wallet'
        if (!amount || amount.isZero()) return 'Enter Amount' //t('plugin_aave_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance)) return 'Insufficient balance'
        return ''
    }, [account, amount.toFixed(), assetAToken, tokenBalance])
    //#endregion

    return (
        <div>
            <InjectedDialog open={open} onClose={onClose} title="Withdraw">
                <DialogContent className={classes.content}>
                    <Box className={classes.section}>
                        <Typography>
                            ({wallet?.name})
                            <FormattedAddress
                                address={wallet?.address ?? ''}
                                size={8}
                                formatter={formatEthereumAddress}
                            />
                            {wallet?.address ? (
                                <Link
                                    style={{ color: 'inherit', height: 20 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveAddressLinkOnExplorer(chainId, wallet.address)}>
                                    <ExternalLink style={{ marginLeft: 5 }} size={20} />
                                </Link>
                            ) : null}
                        </Typography>
                    </Box>

                    {loadingAssetAToken && <div>Loading ...</div>}
                    {assetAToken && (
                        <>
                            <form className={classes.form} noValidate autoComplete="off">
                                <Typography component="div" display="flex">
                                    <TokenIcon
                                        classes={{ icon: classes.tokenIcon }}
                                        address={assetAToken?.address ?? ''}
                                        logoURI={assetAToken?.logoURI}
                                    />
                                    {tokenBalance} {assetAToken.name}
                                </Typography>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="amountToWithdraw"
                                    label="Amount"
                                    type="number"
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    value={amountToWithdraw}
                                    onChange={_handleAmountToWithdrawChange}
                                    variant="standard"
                                />
                                <span> {assetAToken?.symbol}</span>
                            </form>
                            <EthereumWalletConnectedBoundary>
                                {isZero(tokenBalance) ? ( // swap if zero balance
                                    <ActionButton
                                        disabled
                                        className={classes.button}
                                        fullWidth
                                        variant="contained"
                                        loading={loadingTokenBalance}>
                                        Insufficient {assetAToken?.symbol}
                                    </ActionButton>
                                ) : (
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        disabled={!!validationMessage}
                                        onClick={withdrawCallback}
                                        variant="contained"
                                        loading={loadingTokenBalance}>
                                        {validationMessage || 'Withdraw'}
                                    </ActionButton>
                                )}
                            </EthereumWalletConnectedBoundary>
                        </>
                    )}
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}

export interface WithdrawDialogProps extends WithdrawDialogUIProps {}

export function WithdrawDialog(props: WithdrawDialogProps) {
    return <WithdrawDialogUI {...props} />
}
