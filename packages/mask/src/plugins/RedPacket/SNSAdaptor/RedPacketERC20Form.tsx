import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { omit } from 'lodash-es'
import { makeStyles, ActionButton } from '@masknet/theme'
import { MenuItem, Select, Box, InputBase, Typography } from '@mui/material'
import {
    type FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    rightShift,
    formatBalance,
    ZERO,
} from '@masknet/web3-shared-base'
import {
    type ChainId,
    type GasConfig,
    SchemaType,
    useRedPacketConstants,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useSelectFungibleToken,
    FungibleTokenInput,
    PluginWalletStatusBar,
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    SelectGasSettingsToolbar,
    useAvailableBalance,
} from '@masknet/shared'
import {
    useChainContext,
    useWallet,
    useNativeToken,
    useNativeTokenPrice,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import { SmartPayBundler, Web3 } from '@masknet/web3-providers'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI.js'
import { useI18N } from '../locales/index.js'
import { useI18N as useBaseI18n } from '../../../utils/index.js'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants.js'
import { type RedPacketSettings, useCreateParams } from './hooks/useCreateCallback.js'
import { useDefaultCreateGas } from './hooks/useDefaultCreateGas.js'

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
    button: {
        margin: 0,
        padding: 0,
        height: 40,
        maxWidth: 286,
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

export interface RedPacketFormProps {
    onChange(settings: RedPacketSettings): void
    onClose: () => void
    origin?: RedPacketSettings
    onNext: () => void
    setERC721DialogHeight?: (height: number) => void
    gasOption?: GasConfig
    onGasOptionChange?: (config: GasConfig) => void
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const t = useI18N()
    const { t: tr } = useBaseI18n()
    const { classes } = useStyles()
    const { onChange, onNext, origin, gasOption, onGasOptionChange } = props
    // context
    const wallet = useWallet()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    // #region select token
    const { value: nativeTokenDetailed } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { value: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [token = nativeTokenDetailed, setToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(
        origin?.token,
    )

    const selectFungibleToken = useSelectFungibleToken<void, NetworkPluginID.PLUGIN_EVM>()
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
    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : shares ?? '0'), [amount, shares, isRandom])
    const minTotalAmount = useMemo(() => new BigNumber(isRandom ? 1 : shares ?? 0), [shares, isRandom])
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1)

    useEffect(() => {
        setToken(nativeTokenDetailed as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>)
    }, [chainId, nativeTokenDetailed])

    useEffect(() => {
        setRawAmount('0')
    }, [token])

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: !!isRandom,
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

    // #region gas
    const { account: publicKey } = useMemo(() => Web3.createAccount(), [])
    const contract_version = 4
    const { value: params } = useCreateParams(creatingParams, contract_version, publicKey)
    // #endregion

    // balance
    const { value: defaultGas = ZERO } = useDefaultCreateGas(
        {
            duration,
            isRandom: !!isRandom,
            name: senderName,
            message: message || t.best_wishes(),
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: rightShift(0.01, token?.decimals).toFixed(),
        },
        contract_version,
        publicKey,
    )
    const { isAvailableBalance, balance, isAvailableGasBalance } = useAvailableBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address,
        gasOption ? { ...gasOption, gas: new BigNumber(defaultGas).toString() } : undefined,
        {
            chainId,
        },
    )

    const { transactionValue, loading: loadingTransactionValue } = useTransactionValue(
        origin?.total,
        gasOption?.gas,
        gasOption?.gasCurrency,
    )
    // #endregion

    const validationMessage = useMemo(() => {
        if (!token) return t.select_a_token()
        if (!account) return tr('plugin_wallet_connect_a_wallet')
        if (isZero(shares || '0')) return t.enter_shares()
        if (isGreaterThan(shares || '0', 255)) return t.max_shares()
        if (isGreaterThan(minTotalAmount, balance)) return t.insufficient_token_balance({ symbol: token?.symbol })
        if (isZero(amount) || ((!gasOption?.gas || loadingTransactionValue) && isNativeTokenAddress(token?.address)))
            return t.enter_amount()

        if (!isDivisible)
            return t.indivisible({
                symbol: token.symbol,
                amount: formatBalance(1, token.decimals),
            })
        return ''
    }, [
        account,
        amount,
        totalAmount,
        shares,
        token,
        balance,
        t,
        tr,
        loadingTransactionValue,
        gasOption?.gas,
        minTotalAmount,
    ])

    const gasValidationMessage = useMemo(() => {
        if (!token) return ''
        if (isGreaterThan(totalAmount, balance)) return t.insufficient_token_balance({ symbol: token?.symbol })
        if (!isAvailableGasBalance) {
            return tr('no_enough_gas_fees')
        }
        if (new BigNumber(transactionValue).isLessThanOrEqualTo(0)) return t.insufficient_balance()

        return ''
    }, [isAvailableBalance, totalAmount, balance, token?.symbol, transactionValue])

    const selectRef = useRef(null)

    if (!token) return null
    return (
        <>
            <div className={classes.field}>
                <Box className={classes.input}>
                    <Typography>{t.split_mode()}</Typography>
                    <Select
                        fullWidth
                        className={classes.input}
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
                            disableScrollLock: true,
                            container: selectRef.current,
                            anchorEl: selectRef.current,
                        }}>
                        <MenuItem value={0}>{t.average()}</MenuItem>
                        <MenuItem value={1}>{t.random()}</MenuItem>
                    </Select>
                </Box>
                <Box className={classes.input}>
                    <Typography>{t.shares()}</Typography>
                    <InputBase
                        fullWidth
                        value={shares}
                        onChange={onShareChange}
                        inputProps={{
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        }}
                    />
                </Box>
            </div>
            <div className={classes.field}>
                <FungibleTokenInput
                    label={isRandom ? 'Total Amount' : t.amount_per_share()}
                    token={token}
                    onSelectToken={onSelectTokenChipClick}
                    onAmountChange={setRawAmount}
                    amount={rawAmount}
                    maxAmount={
                        minTotalAmount.isGreaterThan(balance) && !isZero(balance)
                            ? minTotalAmount.toString()
                            : undefined
                    }
                    isAvailableBalance={isAvailableBalance}
                    balance={balance}
                    maxAmountShares={isRandom || shares === '' ? 1 : shares}
                />
            </div>
            <Box margin={2}>
                <Typography>{t.attached_message()}</Typography>
                <InputBase
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.best_wishes()}
                    value={message}
                />
            </Box>

            {nativeTokenDetailed && nativeTokenPrice ? (
                <Box margin={2}>
                    <SelectGasSettingsToolbar
                        nativeToken={nativeTokenDetailed}
                        nativeTokenPrice={nativeTokenPrice}
                        supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                        gasConfig={gasOption}
                        gasLimit={Number.parseInt(params?.gas ?? '0', 10)}
                        onChange={onGasOptionChange}
                    />
                </Box>
            ) : null}

            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    actualPluginID={pluginID}>
                    <EthereumERC20TokenApprovedBoundary
                        onlyInfiniteUnlock
                        amount={totalAmount.toFixed()}
                        classes={{ container: classes.unlockContainer }}
                        ActionButtonProps={{
                            size: 'medium',
                        }}
                        token={
                            token?.schema === SchemaType.ERC20 && totalAmount.gt(0) && !validationMessage
                                ? token
                                : undefined
                        }
                        spender={HAPPY_RED_PACKET_ADDRESS_V4}>
                        <ChainBoundary
                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                            expectedChainId={chainId}
                            forceShowingWrongNetworkButton>
                            <ActionButton
                                size="medium"
                                className={classes.button}
                                fullWidth
                                disabled={!!validationMessage || !!gasValidationMessage}
                                onClick={onClick}>
                                {validationMessage || gasValidationMessage || t.next()}
                            </ActionButton>
                        </ChainBoundary>
                    </EthereumERC20TokenApprovedBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}
