import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Check as CheckIcon } from '@mui/icons-material'
import { useAsync } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { omit } from 'lodash-es'
import { makeStyles, ActionButton, MaskTextField } from '@masknet/theme'
import { Box, InputBase, Typography, useTheme } from '@mui/material'
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
    createNativeToken,
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
    TokenValue,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { useChainContext, useWallet, useNativeTokenPrice, useNetworkContext } from '@masknet/web3-hooks-base'
import { SmartPayBundler, Web3 } from '@masknet/web3-providers'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI.js'
import { useI18N } from '../locales/index.js'
import { useI18N as useBaseI18n } from '../../../utils/index.js'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants.js'
import { type RedPacketSettings, useCreateParams } from './hooks/useCreateCallback.js'
import { useDefaultCreateGas } from './hooks/useDefaultCreateGas.js'
import { Icons } from '@masknet/icons'

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
    option: {
        display: 'flex',
        width: '50%',
        alignItems: 'center',
    },
    checkIcon: {
        width: 15,
        height: 15,
        color: theme.palette.maskColor.bottom,
    },
    checkIconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        width: 17,
        height: 17,
        borderRadius: 999,
        marginRight: 5,
        border: `2px solid ${theme.palette.maskColor.secondaryLine}`,
        backgroundColor: 'transparent',
    },
    checked: {
        borderColor: `${theme.palette.maskColor.primary} !important`,
        backgroundColor: `${theme.palette.maskColor.primary} !important`,
    },
    tokenValue: {
        flexGrow: 1,
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
    const { classes, cx } = useStyles()
    const theme = useTheme()
    const { onChange, onNext, origin, gasOption, onGasOptionChange } = props
    // context
    const wallet = useWallet()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    // #region select token
    const nativeTokenDetailed = useMemo(() => createNativeToken(chainId), [chainId])
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
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
    const [isRandom, setRandom] = useState(!origin ? 1 : origin?.isRandom ? 1 : 0)
    const [message, setMessage] = useState(origin?.message || '')
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
        !origin
            ? ''
            : origin?.isRandom
            ? formatBalance(origin?.total, origin.token?.decimals ?? 0)
            : formatBalance(new BigNumber(origin?.total ?? '0').div(origin?.shares ?? 1), origin?.token?.decimals ?? 0),
    )
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const rawTotalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    )

    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : shares ?? '0'), [amount, shares, isRandom])
    const minTotalAmount = useMemo(() => new BigNumber(isRandom ? 1 : shares ?? 0), [shares, isRandom])
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1)

    useEffect(() => {
        setToken(nativeTokenDetailed as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>)
    }, [chainId, nativeTokenDetailed])

    useEffect(() => {
        setRawAmount('')
    }, [token])

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: !!isRandom,
            name: senderName,
            message,
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
            message,
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
        if (isZero(amount) || ((!gasOption?.gas || loadingTransactionValue) && isNativeTokenAddress(token?.address))) {
            return isRandom ? t.enter_total_amount() : t.enter_each_amount()
        }

        if (!isDivisible)
            return t.indivisible({
                symbol: token.symbol,
                amount: formatBalance(1, token.decimals),
            })
        return ''
    }, [
        isRandom,
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

    if (!token) return null

    return (
        <>
            <div className={classes.field}>
                <div className={classes.option}>
                    <div
                        className={cx(classes.checkIconWrapper, isRandom ? classes.checked : '')}
                        onClick={() => setRandom(1)}>
                        <CheckIcon className={classes.checkIcon} />
                    </div>
                    <Typography
                        color={isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={isRandom ? 700 : 400}>
                        {t.random_amount()}
                    </Typography>
                </div>
                <div className={classes.option}>
                    <div
                        className={cx(classes.checkIconWrapper, !isRandom ? classes.checked : '')}
                        onClick={() => setRandom(0)}>
                        <CheckIcon className={classes.checkIcon} />
                    </div>
                    <Typography
                        color={!isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={!isRandom ? 700 : 400}>
                        {t.identical_amount()}
                    </Typography>
                </div>
            </div>
            <div className={classes.field}>
                <MaskTextField
                    wrapperProps={{ className: classes.input }}
                    value={shares}
                    fullWidth
                    onChange={onShareChange}
                    InputProps={{
                        endAdornment: (
                            <>
                                <Typography color={theme.palette.maskColor.third} fontSize={14} marginRight={0.5}>
                                    {t.quantity()}
                                </Typography>
                                <Icons.RedPacket size={18} />
                            </>
                        ),
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
            </div>
            <div className={classes.field}>
                <FungibleTokenInput
                    label={t.token()}
                    token={token}
                    placeholder={isRandom ? t.total() : t.amount_each()}
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
                <InputBase
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.blessing_words()}
                    value={message}
                />
            </Box>

            {pluginID === NetworkPluginID.PLUGIN_EVM ? (
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

            {rawTotalAmount && !isZero(rawTotalAmount) ? (
                <TokenValue className={classes.tokenValue} token={token} amount={rawTotalAmount} />
            ) : null}

            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    actualPluginID={pluginID}>
                    <EthereumERC20TokenApprovedBoundary
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
                            <WalletConnectedBoundary expectedChainId={chainId}>
                                <ActionButton
                                    size="medium"
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage || !!gasValidationMessage}
                                    onClick={onClick}>
                                    {validationMessage || gasValidationMessage || t.next()}
                                </ActionButton>
                            </WalletConnectedBoundary>
                        </ChainBoundary>
                    </EthereumERC20TokenApprovedBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}
