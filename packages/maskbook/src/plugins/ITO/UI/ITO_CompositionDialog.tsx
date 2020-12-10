import { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import { createStyles, DialogContent, DialogProps, makeStyles } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { resolveChainName } from '../../../web3/pipes'
import { ERC20TokenDetailed, EthereumNetwork, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { ITO_CONSTANTS } from '../constants'
import type { ITO_JSONPayload } from '../types'
import { useFillCallback } from '../hooks/useFillCallback'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../Wallet/messages'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { formatBalance } from '../../Wallet/formatter'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'

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
            flex: 1,
            padding: theme.spacing(0.5),
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

export interface ITO_CompositionDialogProps extends withClasses<'root'> {
    open: boolean
    onCreate?(payload: ITO_JSONPayload): void
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function ITO_CompositionDialog(props: ITO_CompositionDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    //#region select token
    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const [token = etherTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()
    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)
    const onTokenChipClick = useCallback(() => {
        setOpenSelectERC20TokenDialog(true)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: EtherTokenDetailed | ERC20TokenDetailed) => {
            setToken(token)
            onSelectERC20TokenDialogClose()
        },
        [onSelectERC20TokenDialogClose],
    )
    //#endregion

    //#region pool settings
    const [amount, setAmount] = useState('')
    const [limit, setLimit] = useState('')
    const [message, setMessage] = useState('')
    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'
    const [exchangeAmounts, setExchangeAmounts] = useState<string[]>([])
    const [exchangeTokens, setExchangeTokens] = useState<(EtherTokenDetailed | ERC20TokenDetailed)[]>([])

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    //#region approve ERC20
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        token?.type === EthereumTokenType.ERC20 ? token.address : '',
        amount,
        ITO_CONTRACT_ADDRESS,
    )
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const approveRequired = approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING
    //#endregion

    //#region blocking
    const [fillSettings, fillState, fillCallback, resetFillCallback] = useFillCallback({
        password: uuid(),
        startTime: new Date(),
        endTime: new Date(),
        title: message,
        name: senderName,
        limit,
        total: amount,
        token,
        exchangeAmounts: [],
        exchangeTokens: [],
    })
    //#endregion

    //#region remote controlled transaction dialog
    // close the transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetFillCallback()

            // the settings is not available
            if (!fillSettings?.token) return

            // TODO:
            // earily return happended
            // we should guide user to select the red packet in the existing list
            if (fillState.type !== TransactionStateType.CONFIRMED) return

            const { receipt } = fillState
            const CreationSuccess = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
                creation_time: string
                creator: string
                id: string
                token_address: string
                total: string
            }

            // assemble JSON payload
            const payload: ITO_JSONPayload = {
                contract_address: ITO_CONTRACT_ADDRESS,
                pid: CreationSuccess.id,
                password: fillSettings.password,
                limit: fillSettings.limit,
                total: CreationSuccess.total,
                sender: {
                    address: account,
                    name: fillSettings.name,
                    message: fillSettings.title,
                },
                start_time: Date.now(), // CreationSuccess.start_time
                end_time: Date.now(), // CreationSuccess.end_time
                creation_time: Number.parseInt(CreationSuccess.creation_time, 10) * 1000,
                network: resolveChainName(chainId) as EthereumNetwork,
                token_type: fillSettings.token.type,
                exchange_amonuts: exchangeAmounts,
                exchange_tokens: exchangeTokens,
            }
            if (fillSettings.token.type === EthereumTokenType.ERC20) payload.token = fillSettings.token

            // output the redpacket as JSON payload
            props.onCreate?.(payload)

            // always reset amount
            setAmount('0')
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || fillState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: fillState,
            summary: `Creating red packet with ${formatBalance(
                new BigNumber(amount),
                token.decimals ?? 0,
                token.decimals ?? 0,
            )} ${token.symbol}`,
        })
    }, [fillState /* update tx dialog only if state changed */])
    //#endregion

    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_wallet_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (new BigNumber(limit || '0').isZero()) return 'Enter limit'
        if (new BigNumber(amount).isZero()) return 'Enter an amount'
        if (new BigNumber(amount).isGreaterThan(new BigNumber(tokenBalance)))
            return `Insufficient ${token.symbol} balance`
        return ''
    }, [account, amount, limit, token, tokenBalance])

    if (!token) return null
    return (
        <>
            <InjectedDialog open={props.open} title="ITO Composition Dialog" onClose={props.onClose}>
                <DialogContent>
                    <h1>Form</h1>

                    {!account || !chainIdValid ? (
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={onConnect}>
                            {t('plugin_wallet_connect_a_wallet')}
                        </ActionButton>
                    ) : approveRequired ? (
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={approveState === ApproveState.PENDING}
                            onClick={onApprove}>
                            {approveState === ApproveState.NOT_APPROVED ? `Approve ${token.symbol}` : ''}
                            {approveState === ApproveState.PENDING ? `Approve... ${token.symbol}` : ''}
                        </ActionButton>
                    ) : validationMessage ? (
                        <ActionButton className={classes.button} fullWidth variant="contained" disabled>
                            {validationMessage}
                        </ActionButton>
                    ) : (
                        <ActionButton className={classes.button} fullWidth onClick={fillCallback}>
                            {`Send ${formatBalance(new BigNumber(amount), token.decimals ?? 0)} ${token.symbol}`}
                        </ActionButton>
                    )}
                </DialogContent>
            </InjectedDialog>

            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[token.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}
