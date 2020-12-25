import {
    createStyles,
    DialogContent,
    DialogProps,
    makeStyles,
    Typography,
    Box,
    Link,
    Checkbox,
    Slider,
} from '@material-ui/core'
import classNames from 'classnames'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import BigNumber from 'bignumber.js'
import { ERC20TokenDetailed, EtherTokenDetailed, EthereumTokenType } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { WalletMessages } from '../../Wallet/messages'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainIdValid, useChainId } from '../../../web3/hooks/useChainState'
import { formatEthereumAddress, formatBalance } from '../../../plugins/Wallet/formatter'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ApproveState, useERC20TokenApproveCallback } from '../../../web3/hooks/useERC20TokenApproveCallback'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import type { JSON_PayloadInMask } from '../types'
import { ChainId } from '../../../web3/types'
import { ITO_CONSTANTS } from '../constants'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { formatToken } from '../../Wallet/formatter'
import { getSupportTokenInfo } from './ITO'
import { SelectSwapTokenDialog } from './SelectSwapTokenDialog'
import ITO_ShareImage from '../assets/share_ito'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            width: '95%',
            margin: '0 auto',
            paddingBottom: '1rem',
        },
        reminderText: {
            color: '#FF5555',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
        },
        reminderTextLast: {
            marginBottom: 0,
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(2),
            padding: '1rem 2rem',
            background: '#17191D',
            borderRadius: '15px',
        },
        tokenIcon: {
            width: 40,
            height: 40,
        },
        tokenTextWrapper: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '45px',
            marginLeft: '1rem',
        },
        tokenSymbol: {
            color: '#fff',
            fontSize: '18px',
            cursor: 'default',
        },
        tokenLink: {
            color: '#6F767C',
            fontSize: '15px',
            '&:hover': {
                textDecoration: 'none',
            },
        },
        comfirmWrapper: {
            marginTop: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
        },
        comfirmText: {
            color: '#6F767C',
        },
        button: {
            width: 'fit-content',
            margin: '0 auto',
        },
        providerWrapper: {
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
        },
        providerBar: {},
        swapLimitWrap: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing(2),
        },
        swapLimitText: {
            color: '#fff',
            fontSize: '14px',
            width: 'fit-content',
        },
        swapLimitSlider: {
            flexGrow: 1,
            width: 'auto !important',
            margin: theme.spacing(0, 3),
            '& .MuiSlider-thumb': {
                width: '28px',
                height: '28px',
                marginTop: '-12px',
                background: '#fff',
            },
            '& .MuiSlider-rail': {
                height: '5px',
            },
            '& .MuiSlider-track': {
                height: '5px',
            },
        },
        exchangeText: {
            marginTop: theme.spacing(1),
            color: '#6F767C',
        },
        exchangeAmountText: {
            color: '#fff',
        },
        swapInput: {
            marginTop: theme.spacing(3),

            '& > div': {
                padding: theme.spacing(1.2, 2, 2),
                display: 'flex',
                alignItems: 'flex-end',
            },

            '& input': {
                paddingBottom: theme.spacing(1.2),
            },
        },
        swapInputChipMax: {
            marginRight: theme.spacing(0.5),
            borderRadius: 100,
        },
        swapInputChipBalance: {
            fontSize: '1rem',
            color: '#fff',
            marginBottom: theme.spacing(3.5),
        },
        swapInputChipToken: {
            border: 'none',
            borderRadius: 8,
            padding: theme.spacing(1, 0, 1, 1),
            fontSize: 17,
            height: 39,
            fontWeight: 300,
            '& svg': {
                fontSize: 32,
            },
        },
        swapChipWrapper: {
            display: 'flex',
            alignItems: 'center',
        },
        swapInputChipTokenIcon: {
            fontSize: 32,
            width: 52,
            height: 52,
        },

        swapTextField: {
            flexGrow: 1,
            '-webkit-appearance': 'none',
            appearance: 'none',
            '& fieldset': {
                border: 'none',
            },
            '& input': {
                padding: '0 !important',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
        },
        swapTokenIcon: {
            width: 25,
            height: 25,
        },
        swapTextChip: {
            margin: theme.spacing(0, 1),
        },
        currentTokenText: {
            fontSize: 18,
            color: '#fff',
            padding: theme.spacing(0, 1),
            fontWeight: 300,
        },
        currentTokenArrow: {
            color: '#fff',
        },
        swapButtonWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(2),
        },
        swapButton: {
            width: 'fit-content',
            margin: theme.spacing(0, 1),
        },
        shareImage: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundAttachment: 'local',
            backgroundPosition: '0',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            background: `url(${ITO_ShareImage})`,
            width: 475,
            height: 341,
            backgroundColor: '#332C61',
            borderRadius: 10,
        },
        shareWrapper: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: theme.spacing(2),
        },
        shareButton: {
            width: 'fit-content',
            padding: theme.spacing(1, 8),
            marginTop: theme.spacing(2),
        },
        shareAmount: {
            fontSize: 23,
            marginTop: 140,
        },
        shareToken: {
            fontSize: 23,
        },
        shareText: {
            fontSize: 24,
            marginTop: 80,
        },
    }),
)

export interface ClaimDialogProps extends withClasses<'root'> {
    open: boolean
    onClose: () => void
    exchangeTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
    DialogProps?: Partial<DialogProps>
    payload: JSON_PayloadInMask
}

enum ClaimStatus {
    Remind,
    Swap,
    Share,
}

export function ClaimDialog(props: ClaimDialogProps) {
    const { t } = useI18N()
    const { payload } = props
    const classes = useStylesExtends(useStyles(), props)
    const ui_random_address = '0xc12d099be31567ad54e4e4d0d45691c3f58f5663'
    const ui_token_chain_id = ChainId.Rinkeby
    const [agreeReminder, setAgreeReminder] = useState(false)
    const [status, setStatus] = useState<ClaimStatus>(ClaimStatus.Swap)
    const [swapToken, setSwapToken] = useState<EtherTokenDetailed | ERC20TokenDetailed>(payload.exchange_tokens[0])
    const tokenBase = Math.pow(10, payload.token.decimals ?? 0)
    const swapTokenBase = Math.pow(10, swapToken.decimals ?? 0)
    const [ratio, setRatio] = useState<BigNumber>(
        new BigNumber(payload.exchange_amounts[0 * 2]).dividedBy(new BigNumber(payload.exchange_amounts[0 * 2 + 1])),
    )
    const { value: tokenBalance = '0', loading: tokenBalanceLoading } = useTokenBalance(
        swapToken.type,
        swapToken.address,
    )
    const initAmount = new BigNumber(payload.limit).dividedBy(new BigNumber(10).pow(18).multipliedBy(5))
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)
    const [claimAmount, setClaimAmount] = useState<BigNumber>(initAmount.multipliedBy(ratio))
    const [openSwapTokenDialog, setOpenSwapTokenDialog] = useState(false)
    const chainId = useChainId()
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const { tokenIconListTable } = getSupportTokenInfo(chainId)
    const CurrentSwapTokenIcon = tokenIconListTable[swapToken.address]
    const ClaimTitle: EnumRecord<ClaimStatus, string> = {
        [ClaimStatus.Remind]: t('plugin_ito_dialog_claim_reminder_title'),
        [ClaimStatus.Swap]: t('plugin_ito_dialog_claim_swap_title', { token: payload.token.symbol }),
        [ClaimStatus.Share]: t('plugin_ito_dialog_claim_share_title'),
    }

    const claimAmountErrText = useMemo(() => {
        const amount = claimAmount.multipliedBy(swapTokenBase)
        if (tokenBalanceLoading) return ''
        return amount.isGreaterThan(new BigNumber(tokenBalance))
            ? t('plugin_ito_error_balance', { symbol: swapToken.symbol })
            : amount.isGreaterThan(new BigNumber(payload.limit))
            ? t('plugin_ito_dialog_claim_swap_exceed_wallet_limit')
            : ''
    }, [claimAmount, tokenBalance, payload.limit, swapToken.symbol, tokenBalanceLoading, t, swapToken])

    const [inputAmountForUI, setInputAmountForUI] = useState(initAmount.multipliedBy(ratio).toFixed())

    const handleInputChange = useCallback(
        (event) => {
            const r = Number(event.target.value) / 100
            const tAmount = new BigNumber(payload.limit).multipliedBy(r).dividedBy(tokenBase)
            setTokenAmount(tAmount)
            setClaimAmount(tAmount.multipliedBy(ratio))
            setInputAmountForUI(tAmount.multipliedBy(ratio).toFixed())
        },
        [payload.limit, ratio],
    )

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    //#region approve
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const [approveState, approveCallback] = useERC20TokenApproveCallback(
        swapToken.type === EthereumTokenType.ERC20 ? swapToken.address : '',
        claimAmount.multipliedBy(swapTokenBase).toFixed(),
        ITO_CONTRACT_ADDRESS,
    )

    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState, approveCallback])
    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState, approveCallback])
    const approveRequired =
        (approveState === ApproveState.NOT_APPROVED || approveState === ApproveState.PENDING) &&
        swapToken.type !== EthereumTokenType.Ether
    //#endregion

    const sendTxValidation = useMemo(() => claimAmountErrText !== '' || tokenAmount.toFixed() === '0', [
        claimAmountErrText,
        tokenAmount,
    ])

    const [claimState, claimCallback, resetCallback] = useClaimCallback(
        payload.pid,
        payload.password,
        claimAmount.multipliedBy(swapTokenBase).toFixed(),
        swapToken,
    )
    //#region claim
    const onSwap = useCallback(() => {
        claimCallback()
    }, [claimCallback])
    //#endregion

    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            // reset state
            resetCallback()
        },
    )

    useEffect(() => {
        if (claimState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: claimState,
            summary: `${t('plugin_trader_swap')} ${tokenAmount.toFixed()} ${payload.token.symbol}`,
        })
    }, [claimState, setTransactionDialogOpen, tokenAmount, t, payload])

    console.log('claimState', claimState)
    console.log('payload', payload)
    return (
        <>
            <InjectedDialog open={props.open} title={ClaimTitle[status]} onClose={props.onClose}>
                <DialogContent>
                    <Box className={classes.wrapper}>
                        {status === ClaimStatus.Remind ? (
                            <>
                                <Typography variant="body1" className={classes.reminderText}>
                                    {t('plugin_ito_dialog_claim_reminder_text1')}
                                </Typography>
                                <Typography variant="body1" className={classes.reminderText}>
                                    {t('plugin_ito_dialog_claim_reminder_text2')}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.reminderText, classes.reminderTextLast)}>
                                    {t('plugin_ito_dialog_claim_reminder_text3')}
                                </Typography>
                                <section className={classes.tokenWrapper}>
                                    <TokenIcon address={ui_random_address} classes={{ icon: classes.tokenIcon }} />
                                    <div className={classes.tokenTextWrapper}>
                                        <Typography variant="h5" className={classes.tokenSymbol}>
                                            Symbolic name
                                        </Typography>

                                        <Link
                                            target="_blank"
                                            className={classes.tokenLink}
                                            rel="noopener noreferrer"
                                            href={`${resolveLinkOnEtherscan(
                                                ui_token_chain_id,
                                            )}/token/${ui_random_address}`}>
                                            <Typography variant="body2">
                                                {formatEthereumAddress(ui_random_address, 4)}(View on Etherscan)
                                            </Typography>
                                        </Link>
                                    </div>
                                </section>
                                <section className={classes.comfirmWrapper}>
                                    <Checkbox
                                        color="primary"
                                        checked={agreeReminder}
                                        onChange={(event) => {
                                            setAgreeReminder(event.target.checked)
                                        }}
                                    />
                                    <Typography variant="body1" className={classes.comfirmText}>
                                        {t('plugin_ito_dialog_claim_reminder_agree')}
                                    </Typography>
                                </section>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    onClick={() => setStatus(ClaimStatus.Swap)}
                                    disabled={!agreeReminder}>
                                    Continue
                                </ActionButton>
                            </>
                        ) : status === ClaimStatus.Swap ? (
                            <>
                                <section className={classes.providerWrapper}>
                                    <EthereumStatusBar classes={{ root: classes.providerBar }} />
                                </section>
                                <section className={classes.swapLimitWrap}>
                                    <Typography variant="body1" className={classes.swapLimitText}>
                                        0 {payload.token.symbol}
                                    </Typography>
                                    <Slider
                                        className={classes.swapLimitSlider}
                                        value={Number(
                                            tokenAmount
                                                .multipliedBy(tokenBase)
                                                .dividedBy(payload.limit)
                                                .multipliedBy(100),
                                        )}
                                        onChange={handleInputChange}
                                    />
                                    <Typography variant="body1" className={classes.swapLimitText}>
                                        {formatBalance(new BigNumber(payload.limit), 18)} {payload.token.symbol}
                                    </Typography>
                                </section>
                                <Typography variant="body1" className={classes.exchangeText}>
                                    {t('plugin_ito_dialog_claim_swap_exchange')}{' '}
                                    <span className={classes.exchangeAmountText}>
                                        {formatBalance(tokenAmount.multipliedBy(tokenBase), 18)}
                                    </span>{' '}
                                    {payload.token.symbol}
                                </Typography>
                                <TokenAmountPanel
                                    classes={{ root: classes.swapInput }}
                                    balance={tokenBalance}
                                    viewBalance={true}
                                    amount={inputAmountForUI}
                                    token={swapToken}
                                    onAmountChange={(value) => {
                                        setInputAmountForUI(value)
                                        const val = value === '' ? new BigNumber(0) : new BigNumber(Number(value))
                                        setClaimAmount(val)
                                        setTokenAmount(val.dividedBy(ratio))
                                    }}
                                    label={t('plugin_ito_dialog_claim_swap_panel_title')}
                                    SelectTokenChip={{
                                        loading: false,
                                        ChipProps: {
                                            onClick: () => setOpenSwapTokenDialog(true),
                                            classes: {
                                                root: classes.swapInputChipToken,
                                                icon: classes.swapInputChipTokenIcon,
                                            },
                                        },
                                    }}
                                    MaxChipProps={{
                                        className: classes.swapInputChipMax,
                                    }}
                                    swapLimit={new BigNumber(payload.limit).multipliedBy(ratio).toFixed()}
                                    balanceClassName={classes.swapInputChipBalance}
                                    chipWrapper={classes.swapChipWrapper}
                                    currentIcon={<CurrentSwapTokenIcon />}
                                    TextFieldProps={{
                                        error: claimAmountErrText !== '',
                                        helperText: claimAmountErrText,
                                    }}
                                />
                                <section className={classes.swapButtonWrapper}>
                                    {approveRequired ? (
                                        approveState === ApproveState.PENDING ? (
                                            <ActionButton
                                                variant="contained"
                                                color="primary"
                                                className={classes.swapButton}
                                                disabled={approveState === ApproveState.PENDING}>
                                                {`Unlocking ${swapToken.symbol}…`}
                                            </ActionButton>
                                        ) : (
                                            <>
                                                <ActionButton
                                                    variant="contained"
                                                    color="primary"
                                                    className={classes.swapButton}
                                                    onClick={() => {
                                                        onApprove()
                                                        // setStatus(ClaimStatus.Share)
                                                    }}
                                                    disabled={sendTxValidation}>
                                                    {t('plugin_wallet_token_infinite_unlock')} {swapToken.symbol}
                                                </ActionButton>
                                                <ActionButton
                                                    variant="contained"
                                                    color="primary"
                                                    className={classes.swapButton}
                                                    onClick={() => {
                                                        onExactApprove()
                                                    }}
                                                    disabled={sendTxValidation}>
                                                    {t('plugin_wallet_token_unlock', {
                                                        balance: claimAmount.toFixed(),
                                                        symbol: swapToken.symbol ?? 'Token',
                                                    })}{' '}
                                                </ActionButton>
                                            </>
                                        )
                                    ) : !account || !chainIdValid ? (
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={onConnect}>
                                            {t('plugin_wallet_connect_a_wallet')}
                                        </ActionButton>
                                    ) : (
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            disabled={sendTxValidation || approveRequired}
                                            onClick={onSwap}>
                                            {t('plugin_trader_swap')}
                                        </ActionButton>
                                    )}
                                </section>
                            </>
                        ) : status === ClaimStatus.Share ? (
                            <>
                                <Box className={classes.shareWrapper}>
                                    <div className={classes.shareImage}>
                                        <Typography variant="body1" className={classes.shareAmount}>
                                            {formatToken(100000)}
                                        </Typography>
                                        <Typography variant="body1" className={classes.shareToken}>
                                            MSKUI
                                        </Typography>
                                        <Typography variant="body1" className={classes.shareText}>
                                            YOU GOT !
                                        </Typography>
                                    </div>
                                    <ActionButton variant="contained" color="primary" className={classes.shareButton}>
                                        {t('plugin_ito_dialog_claim_share_title')}
                                    </ActionButton>
                                </Box>
                            </>
                        ) : null}
                    </Box>
                    <SelectSwapTokenDialog
                        onSelect={(token: EtherTokenDetailed | ERC20TokenDetailed) => {
                            const i = props.exchangeTokens.indexOf(token)
                            const r = new BigNumber(payload.exchange_amounts[i * 2]).dividedBy(
                                new BigNumber(payload.exchange_amounts[i * 2 + 1]),
                            )
                            setRatio(r)
                            setOpenSwapTokenDialog(false)
                            setSwapToken(token)
                            setTokenAmount(initAmount)
                            setClaimAmount(initAmount.multipliedBy(r))
                            setInputAmountForUI(initAmount.multipliedBy(r).toFixed())
                        }}
                        exchangeTokens={props.exchangeTokens}
                        open={openSwapTokenDialog}
                        onClose={() => setOpenSwapTokenDialog(false)}
                    />
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
