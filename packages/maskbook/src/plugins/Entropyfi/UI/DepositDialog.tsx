import { useRemoteControlledDialog } from '@masknet/shared'
import {
    useAccount,
    useChainId,
    useERC20TokenDetailed,
    useERC20TokenBalance,
    isZero,
    TransactionStateType,
    EthereumTokenType,
    pow10,
} from '@masknet/web3-shared'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { useCallback, useState, useEffect, useMemo } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import BigNumber from 'bignumber.js'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { WalletMessages } from '../../Wallet/messages'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { v4 as uuid } from 'uuid'

import { PluginEntropyfiMessages } from '../messages'
import { poolAddressMap, tokenMap } from '../constants'
import { TokenAmountPanel } from './Component/TokenAmountPanel'
import { getSlicePoolId } from '../utils'
import usePool from '../hooks/usePool'
import { useDepositCallback } from '../hooks/useDepositCallback'

const useStyles = makeStyles()((theme) => ({
    root: {
        margin: theme.spacing(2, 0),
        backgroundColor: '#1a083a',
    },
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },

    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0, 2),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
        backgroundColor: '#3ef3d4',
    },
    odds: {
        textAlign: 'center',
        padding: theme.spacing(3),
    },
    oddsTitle: {
        color: '#bdb3d2',
    },
    oddsValue: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
    },
    '@keyframes rainbow_animation': {
        '0%': {
            backgroundPosition: '100% 0%',
        },
        '100%': {
            backgroundPosition: '0 100%',
        },
    },
}))

export function DepositDialog() {
    const { classes } = useStyles()

    const [poolId, setPoolId] = useState('')
    const [choose, setChoose] = useState('')

    const chainId = useChainId()
    const [coinId, coinName] = getSlicePoolId(poolId)
    const account = useAccount()

    const TOKEN_MAP = tokenMap[chainId][poolId]
    const poolAddress = poolAddressMap[chainId][poolId]
    const principalToken = TOKEN_MAP?.principalToken
    const decimals = TOKEN_MAP?.principalToken.decimals
    const pool = usePool(poolAddress)
    //#region pool token
    const {
        value: token,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(TOKEN_MAP?.principalToken.address)
    //#endregion
    const [depositAmount, setDepositAmount] = useState('')
    // const formattedAmount = new BigNumber(depositAmount || '0').toString()
    const formattedAmount = new BigNumber(depositAmount || '0').multipliedBy(pow10(decimals ?? 0)).toString()

    //#region remote controlled dialog from set position
    const { open, closeDialog } = useRemoteControlledDialog(PluginEntropyfiMessages.DepositDialogUpdated, (ev) => {
        if (!ev.open) return
        setPoolId(ev.poolId)
        setChoose(ev.choose)
    })
    const onClose = useCallback(() => {
        closeDialog()
        setDepositAmount('')
    }, [closeDialog])
    //#endregion

    const openSwap = () => {
        //open uniswap to buy coin
        return ''
    }

    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryLoadTokenBalance,
    } = useERC20TokenBalance(principalToken?.address)

    useEffect(() => {
        console.log('rawAmount value change', depositAmount)
        console.log('balance', tokenBalance)
        console.log('pid', poolId)
        console.log('poolAddress', poolAddress)
        console.log('formattedAmount', formattedAmount)
    }, [depositAmount])

    //#region  handleDeposit
    const handleDeposit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        console.log('deposit ', choose)

        const parsedLongAmount = choose === 'Long' ? formattedAmount : '0'
        const parsedShortAmount = choose === 'Short' ? formattedAmount : '0'

        await pool
            .deposit(parsedShortAmount, parsedLongAmount)
            .then(() => {
                console.log('set Position:', choose, parsedShortAmount, parsedLongAmount)
            })
            .catch((error: any) => {
                console.error('set position deposit error', error)
            })
    }

    const [depositState, depositCallback, resetDepositCallback] = useDepositCallback(
        poolAddress ?? '',
        choose === 'Short' ? formattedAmount : '0',
        choose === 'Long' ? formattedAmount : '0',
    )
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            coinName ? `I just deposit ${depositAmount}  ${coinName} into the pool, Can I win the prediction? ` : '',
        )
        .toString()

    // on close transaction dialog
    const [id] = useState(uuid())
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                    if (depositState.type === TransactionStateType.HASH) onClose()
                }
                if (depositState.type === TransactionStateType.HASH) setDepositAmount('')
                resetDepositCallback()
            },
            [id, depositState, retryLoadTokenBalance, retryLoadTokenBalance, onClose],
        ),
    )
    // open the transaction dialog
    useEffect(() => {
        if (!coinName || !pool) return
        if (depositState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: depositState,
            summary: `Depositing ${depositAmount}  ${coinName} on ${poolId} pool.`,
        })
    }, [depositState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button message
    const validationMessage = useMemo(() => {
        if (!account) return 'connect a wallet'
        if (!formattedAmount || new BigNumber(formattedAmount).isZero()) return 'Enter an amount'
        if (new BigNumber(formattedAmount).isGreaterThan(new BigNumber(tokenBalance)))
            return 'insufficient balance ' + coinName
        return ''
    }, [account, formattedAmount, tokenBalance])
    //#endregion

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={coinName} maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label={choose + ' Deposit Amount'}
                            amount={depositAmount}
                            balance={tokenBalance ?? '0'}
                            onAmountChange={setDepositAmount}
                            disableToken={false}
                            decimals={decimals}
                            coinName={coinName}
                        />
                    </form>
                    <EthereumWalletConnectedBoundary>
                        {isZero(tokenBalance) ? (
                            // TODO if no money in the account, go to uniswap to buy
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                onClick={openSwap}
                                variant="contained"
                                loading={loadingTokenBalance}>
                                Please get some {coinName} test Coin before playing the game
                            </ActionButton>
                        ) : (
                            <EthereumERC20TokenApprovedBoundary
                                amount={formattedAmount}
                                spender={poolAddress}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={depositCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || 'Deposit ' + coinName}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        )}
                    </EthereumWalletConnectedBoundary>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
