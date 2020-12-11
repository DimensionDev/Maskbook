import { createStyles, makeStyles, MenuProps, Box, TextField, Grid, InputLabel } from '@material-ui/core'
import { useState, useCallback, useMemo, useEffect, ChangeEvent } from 'react'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumTokenType, ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import type { ITO_JSONPayload } from '../types'
import { ExchangeTokenPanelGroup } from './ExchangeTokenPanel'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import BigNumber from 'bignumber.js'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { v4 as uuid } from 'uuid'
import { ConfirmDialog } from './ConfirmDialog'
import { PoolSettings, useFillCallback } from '../hooks/useFillCallback'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            margin: theme.spacing(1),
            display: 'flex',
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
        label: {
            paddingLeft: theme.spacing(2),
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
    const [message, setMessage] = useState('')
    const [totalOfPerWallet, setTotalOfPerWallet] = useState(1)

    const nowString = new Date().toLocaleString()
    console.log(nowString)
    const [beginTime, setBeginTime] = useState(nowString)
    const [endTime, setEndTime] = useState(nowString)

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'

    const ITOContractAddress = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        token?.type === EthereumTokenType.ERC20 ? token.address : '',
        amount,
        ITOContractAddress,
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

    const onTotalOfPerWalletChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const total = ev.currentTarget.value.replace(/[,\.]/g, '')
        if (total === '') setTotalOfPerWallet(0)
        else if (/^[1-9]+\d*$/.test(total)) {
            setTotalOfPerWallet(Number.parseInt(total, 10))
        }
    }, [])

    const onDaysChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        setBeginTime(ev.target.value)
    }, [])
    const onHoursChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        setEndTime(ev.target.value)
    }, [])

    const itoSettings: PoolSettings = {
        password: uuid(),
        duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
        name: senderName,
        message,
        total: totalOfPerWallet,
        token,
        amount: new BigNumber(amount).toFixed(),
        rations: tokenAndAmount.filter((_, idx) => idx !== 0).map((item) => new BigNumber(item[0]).toFixed()),
        exchanges: tokenAndAmount.filter((_, idx) => idx !== 0).map((item) => item[1]),
        beginTime,
        endTime,
    }

    const [createSettings, createState, createCallback, resetCreateCallback] = useFillCallback(itoSettings)

    useEffect(() => {
        if (tokenAndAmount.length > 0) {
            const [first] = tokenAndAmount
            if (first) {
                setToken(first[1])
                setAmount(first[0])
            }
        }
    }, [tokenAndAmount])

    const onMessageChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        setMessage(ev.target.value)
    }, [])

    const [confirm, setOpenConfirmDialog] = useState(false)
    const onNext = useCallback(() => {
        setOpenConfirmDialog(true)
    }, [])
    const ConfirmDialogClose = useCallback(() => {
        setOpenConfirmDialog(false)
    }, [])
    const onITOConfirmDialogSubmit = useCallback(() => {
        ConfirmDialogClose()
    }, [ConfirmDialogClose])

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount).isZero()) {
            return 'Enter an amount'
        }
        if (!tokenAndAmount || tokenAndAmount.length === 0) {
            return 'Enter token or amount'
        }

        return ''
    }, [amount, tokenAndAmount])

    return (
        <>
            <EthereumStatusBar classes={{ root: classes.bar }} />
            <Box className={classes.line} style={{ display: 'block' }}>
                <ExchangeTokenPanelGroup
                    originToken={token}
                    onTokenAmountChange={setTokenAndAmount}
                    exchangetokenPanelProps={{
                        label: t('plugin_ito_swap_ration_label'),
                    }}
                />
            </Box>
            <Box className={classes.line}>
                <TextField
                    className={classes.input}
                    label={t('plugin_item_message_label')}
                    onChange={onMessageChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Box>
            <Box className={classes.line}>
                <TextField
                    className={classes.input}
                    label={t('plugin_ito_allocation_per_wallet')}
                    onChange={onTotalOfPerWalletChange}
                    InputProps={{
                        endAdornment: token?.symbol,
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
            </Box>
            <Box className={classes.line} style={{ display: 'flex' }}>
                <div>
                    <InputLabel className={classes.label}>{t('plugin_ito_begin_times_label')} </InputLabel>
                    <TextField
                        className={classes.input}
                        onChange={onDaysChange}
                        type="datetime-local"
                        defaultValue={beginTime}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="standard"
                    />
                </div>
                <div>
                    <InputLabel className={classes.label}>{t('plugin_ito_end_times_label')}</InputLabel>
                    <TextField
                        className={classes.input}
                        onChange={onHoursChange}
                        type="datetime-local"
                        defaultValue={endTime}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="standard"
                    />
                </div>
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
                            <ActionButton className={classes.button} fullWidth onClick={onNext}>
                                Next
                            </ActionButton>
                        )}
                    </Grid>
                </Grid>
            </Box>
            <ConfirmDialog
                open={confirm}
                itoSettings={itoSettings}
                onDecline={ConfirmDialogClose}
                onSubmit={onITOConfirmDialogSubmit}
            />
        </>
    )
}
