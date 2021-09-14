import { useRemoteControlledDialog } from '@masknet/shared'
import {
    EthereumTokenType,
    pow10,
    FungibleTokenDetailed,
    useTokenBalance,
    useAccount,
    isZero,
} from '@masknet/web3-shared'

import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DialogContent } from '@material-ui/core'
import { useCallback, useState, useMemo } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'
import { PluginEntropyfiMessages } from '../messages'
import BigNumber from 'bignumber.js'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { v4 as uuid } from 'uuid'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { useChainId } from '@masknet/web3-shared'
import { poolAddressMap } from '../constants'
import { getSlicePoolId } from '../utils'

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
    const { t } = useI18N()
    const { classes } = useStyles()
    const [id] = useState(uuid())
    const chainId = useChainId()

    const [pool, setPool] = useState('')
    const [token, setToken] = useState<FungibleTokenDetailed>()

    const [coinId, coinName] = getSlicePoolId(pool)
    // context
    const account = useAccount()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginEntropyfiMessages.DepositDialogUpdated, (ev) => {
        if (!ev.open) return
        setPool(ev.pool)
        setToken(ev.token)
    })
    const onClose = useCallback(() => {
        closeDialog()
    }, [closeDialog])
    //#endregion

    const poolAddress = poolAddressMap[chainId][pool]

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    //#region Swap
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(
        PluginTraderMessages.swapDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                }
            },
            [retryLoadTokenBalance],
        ),
    )
    const openSwap = useCallback(() => {
        if (!token) return
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.address,
                    name: token.name ?? '',
                    symbol: token.symbol ?? '',
                    contract_address: token.address,
                    decimals: token.decimals,
                } as Coin,
            },
        })
    }, [token, openSwapDialog])
    //#endregion

    //#region select token
    const { setDialog: setSelectTokenDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        if (!token) return
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableNativeToken: true,
            FixedTokenListProps: {
                selectedTokens: [token.address],
                whitelist: [token.address],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return 'Connect a Wallet'
        if (!amount || amount.isZero()) return 'enter_an_amount'
        if (amount.isGreaterThan(tokenBalance)) return 'insufficient_balance'
        return ''
    }, [account, amount.toFixed(), token, tokenBalance])
    //#endregion

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={coinName} maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Long Deposit Amount"
                            amount={rawAmount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: loadingTokenBalance,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Short Deposit Amount"
                            amount={rawAmount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: loadingTokenBalance,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <EthereumWalletConnectedBoundary>
                        {isZero(tokenBalance) ? (
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                onClick={openSwap}
                                variant="contained"
                                loading={loadingTokenBalance}>
                                Buying {coinName}
                            </ActionButton>
                        ) : (
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={poolAddress}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    // onClick={depositCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || 'Deposit'}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        )}
                    </EthereumWalletConnectedBoundary>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
