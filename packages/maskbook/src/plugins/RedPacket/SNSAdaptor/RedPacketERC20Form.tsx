import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import {
    EthereumTokenType,
    formatBalance,
    FungibleTokenDetailed,
    isGreaterThan,
    isZero,
    pow10,
    useAccount,
    useNativeTokenDetailed,
    useRedPacketConstants,
    useFungibleTokenBalance,
    useWeb3,
} from '@masknet/web3-shared-evm'
import { omit } from 'lodash-es'
import { FormControl, InputLabel, MenuItem, MenuProps, Select, TextField } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants'
import type { RedPacketSettings } from './hooks/useCreateCallback'

// seconds of 1 day
const duration = 60 * 60 * 24

const useStyles = makeStyles()((theme) => ({
    field: {
        display: 'flex',
        margin: theme.spacing(1),
    },
    line: {
        display: 'flex',
        margin: theme.spacing(1),
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
        marginTop: theme.spacing(1.5),
    },
    selectShrinkLabel: {
        top: 6,
        backgroundColor: theme.palette.background.paper,
        paddingLeft: 2,
        paddingRight: 7,
        transform: 'translate(17px, -10px) scale(0.75) !important',
    },
    inputShrinkLabel: {
        transform: 'translate(17px, -3px) scale(0.75) !important',
    },
    label: {
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    gasEstimation: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        cursor: 'pointer',
        '& > p': {
            marginRight: 5,
            color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
        },
    },
}))

export interface RedPacketFormProps extends withClasses<never> {
    SelectMenuProps?: Partial<MenuProps>
    onChange(settings: RedPacketSettings): void
    onClose: () => void
    origin?: RedPacketSettings
    onNext: () => void
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { onChange, onNext, origin } = props
    // context
    const web3 = useWeb3()
    const account = useAccount()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants()

    //#region select token
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const [token = nativeTokenDetailed, setToken] = useState<FungibleTokenDetailed | undefined>(origin?.token)
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
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
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: false,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region packet settings
    const [isRandom, setIsRandom] = useState(origin?.isRandom ? 1 : 0)
    const [message, setMessage] = useState(origin?.message || t('plugin_red_packet_best_wishes'))
    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'

    // shares
    const [shares, setShares] = useState<number | ''>(origin?.shares || RED_PACKET_DEFAULT_SHARES)
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replace(/[,.]/g, '')
            if (shares_ === '') setShares('')
            else if (/^[1-9]+\d*$/.test(shares_)) {
                const parsed = Number.parseInt(shares_, 10)
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES)
                    setShares(Number.parseInt(shares_, 10))
            }
        },
        [RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES],
    )

    // amount
    const [rawAmount, setRawAmount] = useState(
        origin?.isRandom
            ? formatBalance(origin?.total, origin.token?.decimals ?? 0)
            : formatBalance(new BigNumber(origin?.total ?? '0').div(origin?.shares ?? 1), origin?.token?.decimals ?? 0),
    )
    const amount = new BigNumber(rawAmount ?? '0').multipliedBy(pow10(token?.decimals ?? 0))
    const totalAmount = useMemo(
        () => (isRandom ? new BigNumber(amount) : new BigNumber(amount).multipliedBy(shares ?? '0')),
        [amount, shares],
    )

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        token?.type ?? EthereumTokenType.Native,
        token?.address ?? '',
    )
    //#endregion

    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_wallet_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (isZero(shares || '0')) return 'Enter shares'
        if (isGreaterThan(shares || '0', 255)) return 'At most 255 recipients'
        if (isZero(amount)) return t('plugin_dhedge_enter_an_amount')
        if (isGreaterThan(totalAmount, tokenBalance))
            return t('plugin_gitcoin_insufficient_balance', { symbol: token.symbol })
        return ''
    }, [account, amount, totalAmount, shares, token, tokenBalance])

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: Boolean(isRandom),
            name: senderName,
            message: message || t('plugin_red_packet_best_wishes'),
            shares: shares || 0,
            token: token ? (omit(token, ['logoURI']) as FungibleTokenDetailed) : undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, senderName, message, t('plugin_red_packet_best_wishes'), shares, token, totalAmount],
    )

    const onClick = useCallback(() => {
        const { address: publicKey, privateKey } = web3.eth.accounts.create()
        onChange({
            publicKey,
            privateKey,
            ...creatingParams,
        })
        onNext()
    }, [creatingParams, onChange, onNext])

    if (!token) return null
    return (
        <>
            <div className={classes.field}>
                <FormControl className={classes.input} variant="outlined">
                    <InputLabel className={classes.selectShrinkLabel}>{t('plugin_red_packet_split_mode')}</InputLabel>
                    <Select
                        value={isRandom ? 1 : 0}
                        onChange={(e) => {
                            // foolproof, reset amount since the meaning of amount changed:
                            // 'total amount' <=> 'amount per share'
                            setRawAmount('0')
                            setIsRandom(e.target.value as number)
                        }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                            ...props.SelectMenuProps,
                        }}>
                        <MenuItem value={0}>{t('plugin_red_packet_average')}</MenuItem>
                        <MenuItem value={1}>{t('plugin_red_packet_random')}</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    className={classes.input}
                    InputProps={{
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        },
                    }}
                    InputLabelProps={{
                        shrink: true,
                        classes: {
                            shrink: classes.inputShrinkLabel,
                        },
                    }}
                    label={t('plugin_red_packet_shares')}
                    value={shares}
                    onChange={onShareChange}
                />
            </div>
            <div className={classes.field}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={isRandom ? 'Total Amount' : t('plugin_red_packet_amount_per_share')}
                    amount={rawAmount}
                    balance={tokenBalance}
                    token={token}
                    maxAmountShares={isRandom || shares === '' ? 1 : shares}
                    onAmountChange={setRawAmount}
                    SelectTokenChip={{
                        loading: loadingTokenBalance,
                        ChipProps: {
                            onClick: onSelectTokenChipClick,
                        },
                    }}
                />
            </div>
            <div className={classes.field}>
                <TextField
                    className={classes.input}
                    onChange={(e) => setMessage(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                        classes: {
                            shrink: classes.inputShrinkLabel,
                        },
                    }}
                    inputProps={{ placeholder: t('plugin_red_packet_best_wishes') }}
                    label={t('plugin_red_packet_attached_message')}
                    value={message}
                />
            </div>
            <EthereumWalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary
                    amount={totalAmount.toFixed()}
                    token={token?.type === EthereumTokenType.ERC20 ? token : undefined}
                    spender={HAPPY_RED_PACKET_ADDRESS_V4}>
                    <ActionButton
                        variant="contained"
                        size="large"
                        className={classes.button}
                        fullWidth
                        disabled={!!validationMessage}
                        onClick={onClick}>
                        {validationMessage || t('plugin_red_packet_next')}
                    </ActionButton>
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
        </>
    )
}
