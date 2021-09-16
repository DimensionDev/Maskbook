import { useRemoteControlledDialog } from '@masknet/shared'
import { EthereumTokenType, pow10, useAccount, useChainId, useTokenBalance } from '@masknet/web3-shared'
import { Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { useCallback, useState, useEffect } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { TokenAmountPanel } from './Component/TokenAmountPanel'
import { PluginEntropyfiMessages } from '../messages'
import { poolAddressMap, tokenMap } from '../constants'
import { getSlicePoolId } from '../utils'
import BigNumber from 'bignumber.js'
import usePool from '../hooks/usePool'
// import useDebounce from '../hooks/useDebounce'

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

    const [deposit, setDeposit] = useState('')

    const [poolId, setPoolId] = useState('')
    const [choose, setChoose] = useState('')

    const chainId = useChainId()
    const [coinId, coinName] = getSlicePoolId(poolId)
    // context
    const account = useAccount()

    const TOKEN_MAP = tokenMap[chainId][poolId]
    const poolAddress = poolAddressMap[chainId][poolId]
    const principalToken = TOKEN_MAP?.principalToken
    const decimals = TOKEN_MAP?.principalToken.decimals
    const pool = usePool(poolAddress)
    // const debouncedDeposit = useDebounce(deposit, 500)

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginEntropyfiMessages.DepositDialogUpdated, (ev) => {
        if (!ev.open) return
        setPoolId(ev.poolId)
        setChoose(ev.choose)
    })
    const onClose = useCallback(() => {
        closeDialog()
        setRawAmount('')
    }, [closeDialog])
    //#endregion

    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useTokenBalance(EthereumTokenType.ERC20, principalToken?.address ?? '')

    const [depositAmount, setRawAmount] = useState('')
    const formattedAmount = new BigNumber(depositAmount || '0').multipliedBy(pow10(decimals ?? 0)).toString()

    useEffect(() => {
        console.log('rawAmount value change', depositAmount)
        console.log('balance', tokenBalance)
        console.log('pid', poolId)
    }, [depositAmount])

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

    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={coinName} maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label={choose + ' Deposit Amount'}
                            amount={depositAmount}
                            balance={tokenBalance ?? '0'}
                            onAmountChange={setRawAmount}
                            disableToken={false}
                            decimals={decimals}
                        />
                    </form>
                    <Button variant="contained"> Approve </Button>
                    <Button variant="contained" onClick={handleDeposit}>
                        {' '}
                        Deposit{' '}
                    </Button>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
