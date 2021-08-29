import { ERC20TokenDetailed, EthereumTokenType, formatBalance, useTokenBalance } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { DialogContent, Typography, Grid, InputBase, InputAdornment, Button, Divider } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import type { AmmOutcome } from '../types'
import { MINIMUM_BALANCE, SHARE_DECIMALS } from '../constants'

const useStyles = makeStyles()((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    section: {
        margin: `${theme.spacing(1)} auto`,
    },
    spacing: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    predictions: {
        gridGap: '.5rem',
        marginBottom: theme.spacing(1),
        '& > .MuiGrid-item': {
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
            border: `solid .0625rem ${theme.palette.divider}`,
            borderRadius: '.5rem',
        },
    },
    inputBase: {
        height: 16,
    },
    input: {
        textAlign: 'right',
    },
    divider: {
        marginTop: `-${theme.spacing(1)}`,
        marginBottom: `-${theme.spacing(1)}`,
    },
}))

interface LiquidityDialogProps {
    open: boolean
    outcome: AmmOutcome | undefined
    onClose: () => void
}

export function LiquidityDialog(props: LiquidityDialogProps) {
    const { open, outcome, onClose } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const [inputAmount, setInputAmount] = useState('')
    const [significant, setSignificant] = useState(4)
    const [input1, setInput1] = useState('')

    const token = {
        address: outcome?.shareToken,
        symbol: outcome?.name,
        decimals: SHARE_DECIMALS,
    } as ERC20TokenDetailed

    //#region amount
    const {
        value: _tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryTokenBalance,
    } = useTokenBalance(EthereumTokenType.ERC20, outcome?.shareToken ?? '')

    // Reduce balance accuracy to $BALANCE_DECIMALS
    const tokenBalance = useMemo(() => {
        const formattedBalance = new BigNumber(formatBalance(_tokenBalance, token?.decimals ?? 0))
        if (formattedBalance.isLessThan(MINIMUM_BALANCE)) return '0'
        return _tokenBalance
    }, [_tokenBalance])
    //#endregion

    // calc the significant
    useEffect(() => {
        const formattedBalance = new BigNumber(formatBalance(tokenBalance, token?.decimals ?? 0))
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE)) setSignificant(1)
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 10)) setSignificant(2)
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 100)) setSignificant(3)
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 1000)) setSignificant(4)
    }, [tokenBalance])
    //#endregion

    const onDialogClose = () => {
        setInputAmount('')
        onClose()
    }

    const onChangeInput1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput1(e.target.value)
    }

    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title="Add Liquidity"
            maxWidth="xs">
            <DialogContent>
                <>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={inputAmount}
                            balance={tokenBalance ?? '0'}
                            onAmountChange={setInputAmount}
                            significant={significant}
                        />
                    </form>
                    <div className={classes.section}>
                        <Typography variant="body1" color="textPrimary">
                            Current Prices
                        </Typography>
                        <Grid container direction="column" className={`${classes.spacing} ${classes.predictions}`}>
                            <Grid item container justifyContent="space-between">
                                <Grid item flex={7}>
                                    <Typography variant="body2">Name1</Typography>
                                </Grid>
                                <Divider orientation="vertical" flexItem classes={{ root: classes.divider }} />
                                <Grid item flex={1}>
                                    <InputBase
                                        value="0.25"
                                        // value={input1}
                                        readOnly
                                        placeholder="0.0"
                                        startAdornment={<InputAdornment position="end">$</InputAdornment>}
                                        onChange={onChangeInput1}
                                        classes={{ root: classes.inputBase, input: classes.input }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Typography variant="body1" color="textPrimary">
                            You'll receive
                        </Typography>
                        <Button variant="contained" fullWidth color="primary">
                            Add
                        </Button>
                    </div>
                </>
            </DialogContent>
        </InjectedDialog>
    )
}
