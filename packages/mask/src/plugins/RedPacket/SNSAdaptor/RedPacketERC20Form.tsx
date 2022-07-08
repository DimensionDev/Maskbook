import { makeStyles, useStylesExtends } from '@masknet/theme'
import {
    FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    NetworkPluginID,
    rightShift,
    formatBalance,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash-unified'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelectFungibleToken } from '@masknet/shared'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { useI18N } from '../locales'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../utils'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants'
import type { RedPacketSettings } from './hooks/useCreateCallback'
import { useAccount, useChainId, useFungibleToken, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

// seconds of 1 day
const duration = 60 * 60 * 24

const useStyles = makeStyles()((theme) => ({
    field: {
        display: 'flex',
        gap: 16,
        margin: 16,
    },
    input: {
        flex: 1,
    },

    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
    },
    button: {
        margin: 0,
        padding: 0,
        height: 40,
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
    unlockContainer: {
        margin: 0,
        columnGap: 16,
        flexFlow: 'unset',
        ['& > div']: {
            padding: '0px !important',
        },
    },
}))

export interface RedPacketFormProps extends withClasses<never> {
    onChange(settings: RedPacketSettings): void
    onClose: () => void
    origin?: RedPacketSettings
    onNext: () => void
    setERC721DialogHeight?: (height: number) => void
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const t = useI18N()
    const { t: tr } = useBaseI18n()
    const classes = useStylesExtends(useStyles(), props)
    const { onChange, onNext, origin } = props
    // context
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    // #region select token
    const { value: nativeTokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    const [token = nativeTokenDetailed, setToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(
        origin?.token,
    )

    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
            chainId,
        })
        if (picked) setToken(picked)
    }, [selectFungibleToken, token?.address, chainId])
    // #endregion

    // #region packet settings
    const [isRandom, setRandom] = useState(origin?.isRandom ? 1 : 0)
    const [message, setMessage] = useState(origin?.message || t.best_wishes())
    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'

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
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : shares ?? '0'), [amount, shares])
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1)

    useEffect(() => {
        setToken(nativeTokenDetailed as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>)
    }, [chainId, nativeTokenDetailed])

    useEffect(() => {
        setRawAmount('0')
    }, [token])

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address ?? '',
        { chainId },
    )
    // #endregion

    const validationMessage = useMemo(() => {
        if (!token) return t.select_a_token()
        if (!account) return tr('plugin_wallet_connect_a_wallet')
        if (isZero(shares || '0')) return 'Enter shares'
        if (isGreaterThan(shares || '0', 255)) return 'At most 255 recipients'
        if (isZero(amount)) return tr('plugin_dhedge_enter_an_amount')
        if (isGreaterThan(totalAmount, tokenBalance))
            return tr('plugin_gitcoin_insufficient_balance', { symbol: token.symbol })
        if (!isDivisible)
            return t.indivisible({
                symbol: token.symbol!,
                amount: formatBalance(1, token.decimals),
            })
        return ''
    }, [account, amount, totalAmount, shares, token, tokenBalance, t, tr])

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: Boolean(isRandom),
            name: senderName,
            message: message || t.best_wishes(),
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, senderName, message, t, shares, token, totalAmount],
    )

    const onClick = useCallback(() => {
        onChange(creatingParams)
        onNext()
    }, [creatingParams, onChange, onNext])

    const selectRef = useRef(null)

    if (!token) return null
    return (
        <>
            <div className={classes.field}>
                <FormControl className={classes.input} variant="outlined">
                    <InputLabel className={classes.selectShrinkLabel}>{t.split_mode()}</InputLabel>
                    <Select
                        ref={selectRef}
                        value={isRandom ? 1 : 0}
                        onChange={(e) => {
                            // foolproof, reset amount since the meaning of amount changed:
                            // 'total amount' <=> 'amount per share'
                            setRawAmount('0')
                            setRandom(e.target.value as number)
                        }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'center',
                            },
                            container: selectRef.current,
                            anchorEl: selectRef.current,
                        }}>
                        <MenuItem value={0}>{t.average()}</MenuItem>
                        <MenuItem value={1}>{t.random()}</MenuItem>
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
                    label={t.shares()}
                    value={shares}
                    onChange={onShareChange}
                />
            </div>
            <div className={classes.field}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={isRandom ? 'Total Amount' : t.amount_per_share()}
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
                    inputProps={{ placeholder: t.best_wishes() }}
                    label={t.attached_message()}
                    value={message}
                />
            </div>
            <PluginWalletStatusBar>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <WalletConnectedBoundary>
                        <EthereumERC20TokenApprovedBoundary
                            onlyInfiniteUnlock
                            amount={totalAmount.toFixed()}
                            classes={{ container: classes.unlockContainer }}
                            ActionButtonProps={{
                                size: 'medium',
                            }}
                            token={token?.schema === SchemaType.ERC20 ? token : undefined}
                            spender={HAPPY_RED_PACKET_ADDRESS_V4}>
                            <ActionButton
                                size="large"
                                className={classes.button}
                                fullWidth
                                disabled={!!validationMessage}
                                onClick={onClick}>
                                {validationMessage || t.next()}
                            </ActionButton>
                        </EthereumERC20TokenApprovedBoundary>
                    </WalletConnectedBoundary>
                </ChainBoundary>
            </PluginWalletStatusBar>
        </>
    )
}
