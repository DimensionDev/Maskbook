import { useState, useCallback, useMemo, ChangeEvent } from 'react'
import { makeStyles, FormControl, TextField, InputLabel, Select, MenuItem, MenuProps } from '@material-ui/core'
import { v4 as uuid } from 'uuid'
import BigNumber from 'bignumber.js'

import { formatBalance, isGreaterThan, isZero, pow10 } from '@dimensiondev/maskbook-shared'
import {
    EthereumTokenType,
    NetworkType,
    FungibleTokenDetailed,
    useAccount,
    useConstant,
    useChainId,
    useNetworkType,
    useNativeTokenDetailed,
    useTokenBalance,
} from '@dimensiondev/web3-shared'
import { useI18N, useRemoteControlledDialog } from '../../../utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import {
    RED_PACKET_MIN_SHARES,
    RED_PACKET_MAX_SHARES,
    RED_PACKET_CONSTANTS,
    RED_PACKET_DEFAULT_SHARES,
} from '../constants'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import type { RedPacketSettings } from '../hooks/useCreateCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import type { RedPacketJSONPayload } from '../types'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'

const useStyles = makeStyles((theme) => ({
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
}))

export interface RedPacketFormProps extends withClasses<never> {
    onCreate?(payload: RedPacketJSONPayload): void
    onChange(settings: Omit<RedPacketSettings, 'password'>): void
    SelectMenuProps?: Partial<MenuProps>
    origin?: Omit<RedPacketSettings, 'password'>
    onNext: () => void
}

export function RedPacketForm(props: RedPacketFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { onChange, onNext, origin } = props

    // context
    const account = useAccount()
    const chainId = useChainId()
    const networkType = useNetworkType()
    const contract_address = useConstant(
        RED_PACKET_CONSTANTS,
        networkType === NetworkType.Ethereum ? 'HAPPY_RED_PACKET_ADDRESS_V2' : 'HAPPY_RED_PACKET_ADDRESS_V3',
    )
    const contract_version = networkType === NetworkType.Ethereum ? 2 : 3

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
    const [message, setMessage] = useState(origin?.message)
    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'

    // shares
    const [shares, setShares] = useState<number | ''>(origin?.shares || RED_PACKET_DEFAULT_SHARES)
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replace(/[,\.]/g, '')
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
            ? formatBalance(new BigNumber(origin?.total || 0), origin.token?.decimals ?? 0)
            : formatBalance(new BigNumber(origin?.total ?? '0').div(origin?.shares || 1), origin?.token?.decimals ?? 0),
    )
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const totalAmount = isRandom ? new BigNumber(amount) : new BigNumber(amount).multipliedBy(shares || '0')

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
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

    const onClick = useCallback(() => {
        onChange({
            duration: 60 /* seconds */ * 60 /* mins */ * 24 /* hours */,
            isRandom: Boolean(isRandom),
            name: senderName,
            message: message || t('plugin_red_packet_best_wishes'),
            shares: shares || 0,
            token,
            total: totalAmount.toFixed(),
        })
        onNext()
    }, [onChange, totalAmount, token, shares, senderName, isRandom])

    if (!token) return null
    return (
        <>
            <div className={classes.line}>
                <FormControl className={classes.input} variant="outlined">
                    <InputLabel className={classes.selectShrinkLabel}>{t('plugin_red_packet_split_mode')}</InputLabel>
                    <Select
                        value={isRandom ? 1 : 0}
                        onChange={(e) => {
                            // foolproof, reset amount since the meaning of amount changed:
                            //  'total amount' <=> 'amount per share'
                            setRawAmount('0')
                            setIsRandom(e.target.value as number)
                        }}
                        MenuProps={props.SelectMenuProps}>
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
            <div className={classes.line}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={isRandom ? 'Total Amount' : t('plugin_red_packet_amount_per_share')}
                    amount={rawAmount}
                    balance={tokenBalance}
                    token={token}
                    onAmountChange={setRawAmount}
                    SelectTokenChip={{
                        loading: loadingTokenBalance,
                        ChipProps: {
                            onClick: onSelectTokenChipClick,
                        },
                    }}
                />
            </div>
            <div className={classes.line}>
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
                    defaultValue={t('plugin_red_packet_best_wishes')}
                    value={message}
                />
            </div>
            <EthereumWalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary
                    amount={totalAmount.toFixed()}
                    token={token?.type === EthereumTokenType.ERC20 ? token : undefined}
                    spender={contract_address}>
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
