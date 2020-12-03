import { createStyles, makeStyles, MenuProps, InputLabel, TextField, InputAdornment, Box } from '@material-ui/core'
import { v4 as uuid } from 'uuid'
import { useState, useCallback, ChangeEvent } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { EthereumTokenType, ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useCreateCallback } from '../hooks/useCreateCallback'

import { ITOTokenSelect } from './ITOSelect'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        bar: {
            padding: theme.spacing(0, 2, 2),
        },
        input: {
            padding: theme.spacing(1),
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)

export interface ITOFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onCreate?(payload: any): void
    SelectMenuProps?: Partial<MenuProps>
}

export function ITOForm(props: ITOFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    const { value: fromEtherTokenDetailed } = useEtherTokenDetailed()
    const [fromToken, setFromToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>(
        fromEtherTokenDetailed,
    )

    const { value: toEtherTokenDetailed } = useEtherTokenDetailed()
    const [toToken, setToToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>(toEtherTokenDetailed)

    const [message, setMessage] = useState('Best Wishes!')

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        fromToken?.type ?? EthereumTokenType.Ether,
        fromToken?.address ?? '',
    )
    const [selectedDate, setSelectedDate] = useState(new Date())

    const [ratio, setRatio] = useState<number | ''>('')
    const onRatioChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const ratio_ = ev.currentTarget.value.replace(/[,\.]/g, '')
            if (ratio_ === '') {
                setRatio('')
            } else {
                const parsed = Number.parseInt(ratio_, 10)
                if (parsed >= 0) {
                    setRatio(parsed)
                }
            }
        },
        [ratio],
    )

    const [eth, setEth] = useState('0')

    const [amount, setAmount] = useState('0')
    const onAmountChange = useCallback(
        (amount) => {
            console.log(amount)
            /*
        setAmount(amount)
        setEth(new BigNumber(amount).dividedBy(ratio))
        */
        },
        [amount],
    )

    const [allocationPerWallet, setAllocationPerWallet] = useState<number | ''>('1')
    const onAllocationPerWalletChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const allocationPerWallet_ = ev.currentTarget.value.replace(/[,].]/g, '')
            if (allocationPerWallet_ === '') {
                setAllocationPerWallet('')
            } else {
                const tmp = Number.parseInt(allocationPerWallet_, 10)
                if (tmp >= 0) {
                    setAllocationPerWallet(tmp)
                }
            }
        },
        [allocationPerWallet],
    )

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    const [createSettings, createState, createCallback, resetCreateCallback] = useCreateCallback({
        password: uuid(),
        duration: 60 * 60 * 24,
        name: senderName,
        fromToken,
        toToken,
        message,
        end_date: selectedDate,
        total: allocationPerWallet,
        ratio,
    })

    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <div className={classes.line}>
                <ITOTokenSelect className={classes.input} title="From" token={fromToken} onTokenChange={setFromToken} />
                <ITOTokenSelect className={classes.input} title="To" token={toToken} onTokenChange={setToToken} />
            </div>
            <div className={classes.line} display="flex">
                <Box className={classes.input}>
                    <InputLabel>Swap ratio</InputLabel>
                    {toToken ? <InputLabel>1 {toToken.symbol}=</InputLabel> : ''}
                </Box>
                <Box style={{ flex: 1 }} className={classes.input}>
                    <TextField
                        label="Swap ratio"
                        requried
                        fullWidth
                        type="text"
                        value={ratio}
                        onChange={onRatioChange}
                        InputProps={{
                            inputProps: {},
                            endAdornment: <InputAdornment position="end">{fromToken?.symbol ?? ''}</InputAdornment>,
                        }}
                    />
                </Box>
            </div>
            <div className={classes.line}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label="Amount"
                    amount={amount}
                    balance={tokenBalance}
                    token={fromToken}
                    onAmountChange={onAmountChange}
                    textFieldProps={{
                        helperText: 'fdasfdafafa',
                    }}
                />
            </div>
            <div className={classes.line}>
                <TextField
                    className={classes.input}
                    label="Allocation Per Wallet"
                    required
                    fullWidth
                    type="text"
                    value={allocationPerWallet}
                    InputProps={{
                        inputProps: {
                            autoComplet: 'off',
                            autoCorrect: 'off',
                            title: 'Allocation per wallet',
                            inputMode: 'decimal',
                            min: 0,
                            pattern: '^[0-9]*[.,]?[0-9]*$',
                            placeholder: '0.0',
                            spellCheck: false,
                        },
                        endAdornment: <InputAdornment position="end">{toToken?.symbol ?? ''}</InputAdornment>,
                    }}
                />
                <TextField
                    className={classes.input}
                    fullWidth
                    label="End date"
                    type="datetime-local"
                    defaultValue={selectedDate}
                    onChange={setSelectedDate}
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <div className={classes.line}>
                <TextField
                    fullWidth
                    className={classes.input}
                    onChange={(e) => setMessage(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ placeholder: 'Mask' }}
                    label="Title"
                    defaultValue="MASK"
                />
            </div>
            {!account || !chainIdValid ? (
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" onClick={onConnect}>
                    Connect a Wallet
                </ActionButton>
            ) : (
                <ActionButton className={classes.button} fullWidth onClick={createCallback}>
                    Send an amount
                </ActionButton>
            )}
        </>
    )
}
