import { useState, useCallback, useMemo, useEffect, ChangeEvent } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import { createStyles, makeStyles, MenuProps, Box, TextField, Grid } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { EthereumTokenType, ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import type { ITO_JSONPayload } from '../types'
import { ExchangeTokenPanel } from './ExchangeTokenPanel'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance } from '../../Wallet/formatter'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            margin: theme.spacing(1),
        },
        flow: {
            margin: theme.spacing(1),
            textAlign: 'center',
        },
        bar: {
            padding: theme.spacing(0, 2, 2),
        },
        input: {
            padding: theme.spacing(1),
            flex: 1,
        },
        inputLine: {
            maring: theme.spacing(1),
            paddingRight: theme.spacing(3),
            paddingLeft: theme.spacing(1),
        },
        daysInput: {
            flex: 1,
        },
        hoursInput: {
            flex: 1,
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

export interface CreateFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onCreate?(payload: ITO_JSONPayload): void
    SelectMenuProps?: Partial<MenuProps>
}

export function CreateForm(props: CreateFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    const { value: tokenDetailed } = useEtherTokenDetailed()
    const [token, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>(tokenDetailed)
    const [amount, setAmount] = useState('')
    const [message, setMessage] = useState('Best Wishes!')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState(1)
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        token?.type === EthereumTokenType.ERC20 ? token.address : '',
        amount,
        ITO_CONTRACT_ADDRESS,
    )

    const onAmountChange = useCallback((amount: string, key: string) => {
        setAmount(amount)
    }, [])

    const onTokenChange = useCallback((token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => {
        setToken(token)
    }, [])

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) {
            return
        }
        await approveCallback()
    }, [approveState, approveCallback])

    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    const [tokenAndAmount, setTokenAndAmount] = useState([])

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount).isZero()) {
            return 'Enter an amount'
        }
        if (!token) {
            return 'Select to token'
        }
        return ''
    }, [token, amount])

    const onTotalOfPerWalletChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const total = ev.currentTarget.value.replace(/[,\.]/g, '')
        if (total === '') setTotalOfPerWallet(0)
        else if (/^[1-9]+\d*$/.test(total)) {
            setTotalOfPerWallet(Number.parseInt(total, 10))
        }
    }, [])

    const onDaysChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const days_ = ev.currentTarget.value.replace(/[,\.]/g, '')
        console.log(days_)
        if (days_ === '') setDays(0)
        else if (/^[0-9]+\d*$/.test(days_)) {
            setDays(Number.parseInt(days_, 10))
        }
    }, [])
    const onHoursChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const hours_ = ev.currentTarget.value.replace(/[,\.]/g, '')
        if (hours_ === '') setHours(0)
        else if (/^[0-9]+\d*$/.test(hours_)) {
            setHours(Number.parseInt(hours_, 10))
        }
    }, [])

    useEffect(() => {
        console.log('**********************')
        console.log(amount)
        console.log(token)
        console.log(tokenAndAmount)
        console.log(message)
        console.log(totalOfPerWallet)
    }, [amount, token, tokenAndAmount, message, totalOfPerWallet])

    if (!token) return null
    return (
        <>
            <EthereumStatusBar />
            <Box className={classes.line}>
                <ExchangeTokenPanel
                    onAmountChange={onAmountChange}
                    showAdd={false}
                    showRemove={false}
                    dataIndex={uuid()}
                    label="Total amount"
                    inputAmount={amount}
                    exchangeToken={token}
                    onExchangeTokenChange={onTokenChange}
                />
            </Box>
            <Box className={classes.flow}>
                <ArrowDownwardIcon />
            </Box>
            <Box className={classes.line}>
                <ExchangeTokenPanel
                    originToken={token}
                    onChange={setTokenAndAmount}
                    exchangetokenPanelProps={{
                        label: 'Swap Ration',
                    }}
                />
            </Box>
            <Box className={classes.inputLine}>
                <TextField
                    className={classes.input}
                    fullWidth
                    label="Title"
                    onChange={(ev) => setMessage(ev.target.value)}
                />
            </Box>
            <Box className={classes.line} style={{ display: 'flex' }}>
                <TextField
                    className={classes.input}
                    label="Allocation per wallet"
                    onChange={onTotalOfPerWalletChange}
                    InputProps={{
                        endAdornment: 'ETH',
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '1',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        },
                    }}
                />
                <Box className={classes.input} style={{ display: 'flex' }}>
                    <TextField
                        onChange={onDaysChange}
                        className={classes.daysInput}
                        InputProps={{
                            endAdornment: 'days',
                            inputProps: {
                                autoComplete: 'off',
                                autoCorrect: 'off',
                                inputMode: 'decimal',
                                placeholder: '0',
                                pattern: '^[0-9]$',
                                spellCheck: false,
                            },
                        }}
                    />
                    <TextField
                        className={classes.hoursInput}
                        onChange={onHoursChange}
                        InputProps={{
                            endAdornment: 'hours',
                            inputProps: {
                                autoComplete: 'off',
                                autoCorrect: 'off',
                                inputMode: 'decimal',
                                placeholder: '0',
                                pattern: '^[0-9]$',
                                spellCheck: false,
                            },
                        }}
                    />
                </Box>
            </Box>
            <Box className={classes.line}>
                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                    {approveRequired ? (
                        <Grid item xs={6}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={approveState === ApproveState.PENDING}
                                onClick={onApprove}>
                                {approveState === ApproveState.NOT_APPROVED ? `Approve ${token?.symbol}` : ''}
                                {approveState === ApproveState.PENDING ? `Approve... ${token?.symbol}` : ''}
                            </ActionButton>
                        </Grid>
                    ) : null}

                    <Grid item xs={approveRequired ? 6 : 12}>
                        {!account || !chainIdValid ? (
                            <ActionButton className={classes.button} fullWidth variant="contained" size="large">
                                Connect a wallet
                            </ActionButton>
                        ) : validationMessage ? (
                            <ActionButton className={classes.button} fullWidth variant="contained" disabled>
                                {validationMessage}
                            </ActionButton>
                        ) : (
                            <ActionButton className={classes.button} fullWidth>
                                {`Send ${formatBalance(
                                    new BigNumber(amount),
                                    token.decimals ?? 0,
                                    token.decimals ?? 0,
                                )} ${token.symbol}`}
                            </ActionButton>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}
