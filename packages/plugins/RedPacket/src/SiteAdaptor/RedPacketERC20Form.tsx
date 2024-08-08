import { Icons } from '@masknet/icons'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import {
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    FungibleTokenInput,
    PluginWalletStatusBar,
    SelectFungibleTokenModal,
    SelectGasSettingsToolbar,
    TokenValue,
    useAvailableBalance,
    useCurrentLinkedPersona,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID, PluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, MaskTextField, RadioIndicator } from '@masknet/theme'
import { useChainContext, useEnvironmentContext, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { EVMChainResolver, EVMWeb3 } from '@masknet/web3-providers'
import {
    formatBalance,
    type FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    rightShift,
    ZERO,
} from '@masknet/web3-shared-base'
import { type ChainId, type GasConfig, SchemaType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { Box, InputBase, Typography, useTheme } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { omit } from 'lodash-es'
import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants.js'
import { useRedPacketTrans } from '../locales/index.js'
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
    option: {
        display: 'flex',
        width: '50%',
        alignItems: 'center',
        color: theme.palette.maskColor.line,
    },
    checkIconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        marginRight: 5,
        backgroundColor: 'transparent',
    },
    tokenValue: {
        flexGrow: 1,
    },
    title: {
        fontSize: 14,
        fontWEight: 700,
        lineHeight: '18px',
    },
}))

interface RedPacketFormProps {
    setERC721DialogHeight?: (height: number) => void
    gasOption?: GasConfig
    expectedChainId: ChainId
    origin?: RedPacketSettings
    onClose: () => void
    onNext: () => void
    onGasOptionChange?: (config: GasConfig) => void
    onChange(settings: RedPacketSettings): void
    onChainChange(newChainId: ChainId): void
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const { origin, expectedChainId, gasOption, onChange, onNext, onGasOptionChange, onChainChange } = props
    const t = useRedPacketTrans()
    const { classes } = useStyles()
    const theme = useTheme()
    // context
    const { pluginID } = useEnvironmentContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    // #region select token
    const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [token = nativeTokenDetailed, setToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(
        origin?.token,
    )

    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
            chainId,
            networkPluginID: NetworkPluginID.PLUGIN_EVM,
            pluginID: PluginID.RedPacket,
        })
        if (!picked) return
        if (chainId !== picked.chainId) {
            onChainChange(picked.chainId as ChainId)
        }
        setToken(picked as FungibleToken<ChainId, SchemaType>)
    }, [token?.address, chainId, onChainChange])
    // #endregion

    // #region packet settings
    const [isRandom, setRandom] = useState(
        !origin ? 1
        : origin.isRandom ? 1
        : 0,
    )
    const [message, setMessage] = useState(origin?.message || '')
    const myIdentity = useLastRecognizedIdentity()
    const linkedPersona = useCurrentLinkedPersona()

    const senderName = myIdentity?.identifier?.userId || linkedPersona?.nickname || 'Unknown User'

    // shares
    const [shares, setShares] = useState<number | ''>(origin?.shares || RED_PACKET_DEFAULT_SHARES)
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replaceAll(/[,.]/g, '')
            if (shares_ === '') setShares('')
            else if (/^[1-9]+\d*$/.test(shares_)) {
                const parsed = Number.parseInt(shares_, 10)
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES) {
                    setShares(Number.parseInt(shares_, 10))
                } else if (parsed > RED_PACKET_MAX_SHARES) {
                    setShares(RED_PACKET_MAX_SHARES)
                }
            }
        },
        [RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES],
    )

    // amount
    const [rawAmount, setRawAmount] = useState(
        !origin ? ''
        : origin.isRandom ? formatBalance(origin.total, origin.token?.decimals ?? 0)
        : formatBalance(new BigNumber(origin.total ?? '0').div(origin.shares ?? 1), origin.token?.decimals ?? 0),
    )
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const rawTotalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    )

    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : shares ?? '0'), [amount, shares, isRandom])
    const minTotalAmount = useMemo(() => new BigNumber(isRandom ? 1 : shares ?? 0), [shares, isRandom])
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1)

    useUpdateEffect(() => {
        setRawAmount('')
    }, [token])

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: !!isRandom,
            name: senderName,
            message: message || t.best_wishes(),
            shares: shares || 0,
            token:
                token ?
                    (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                :   undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, senderName, message, t, shares, token, totalAmount],
    )

    const onClick = useCallback(() => {
        onChange(creatingParams)
        onNext()
    }, [creatingParams, onChange, onNext])

    // #region gas
    const { account: publicKey } = useMemo(() => EVMWeb3.createAccount(), [])
    const contract_version = 4
    const { value: params } = useCreateParams(chainId, creatingParams, contract_version, publicKey)
    // #endregion

    // balance
    const { value: defaultGas = ZERO } = useDefaultCreateGas(
        {
            duration,
            isRandom: !!isRandom,
            name: senderName,
            message: message || t.best_wishes(),
            shares: shares || 0,
            token:
                token ?
                    (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                :   undefined,
            total: rightShift(0.01, token?.decimals).toFixed(),
        },
        contract_version,
        publicKey,
    )
    const { isAvailableBalance, balance, isGasSufficient } = useAvailableBalance(
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
        if (!account) return t.plugin_wallet_connect_a_wallet()
        if (isZero(shares || '0')) return t.enter_shares()
        if (isGreaterThan(shares || '0', 255)) return t.max_shares()
        if (isGreaterThan(minTotalAmount, balance) || isGreaterThan(totalAmount, balance))
            return t.insufficient_token_balance({ symbol: token?.symbol })
        if (isZero(amount)) {
            return isRandom ? t.enter_total_amount() : t.enter_each_amount()
        }

        if (!isDivisible)
            return t.indivisible({
                symbol: token.symbol,
                amount: formatBalance(1, token.decimals),
            })
        return ''
    }, [isRandom, account, amount, totalAmount, shares, token, balance, t, minTotalAmount])

    const gasValidationMessage = useMemo(() => {
        if (!token) return ''
        if (!isGasSufficient) {
            return t.no_enough_gas_fees()
        }
        if (!loadingTransactionValue && new BigNumber(transactionValue).isLessThanOrEqualTo(0))
            return t.insufficient_balance()

        return ''
    }, [isAvailableBalance, balance, token?.symbol, transactionValue, loadingTransactionValue, isGasSufficient])

    if (!token) return null

    return (
        <>
            <div className={classes.field}>
                <div className={classes.option}>
                    <div className={classes.checkIconWrapper}>
                        <RadioIndicator onClick={() => setRandom(1)} checked={!!isRandom} size={20} />
                    </div>
                    <Typography
                        color={isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={isRandom ? 700 : 400}>
                        {t.random_amount()}
                    </Typography>
                </div>
                <div className={classes.option}>
                    <div className={classes.checkIconWrapper}>
                        <RadioIndicator onClick={() => setRandom(0)} checked={!isRandom} size={20} />
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
                                <Typography
                                    color={theme.palette.maskColor.third}
                                    fontSize={14}
                                    marginRight={0.5}
                                    whiteSpace="nowrap">
                                    {t.winners()}
                                </Typography>
                                <Icons.RedPacket size={18} />
                            </>
                        ),
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: t.enter_number_of_winners(),
                            spellCheck: false,
                            pattern: '^[0-9]+$',
                        },
                    }}
                />
            </div>
            <div className={classes.field}>
                <FungibleTokenInput
                    label={isRandom ? t.total_amount() : t.amount_each()}
                    token={token}
                    placeholder={isRandom ? t.random_amount_share_tips() : t.equal_amount_share_tips()}
                    onSelectToken={onSelectTokenChipClick}
                    onAmountChange={setRawAmount}
                    amount={rawAmount}
                    maxAmount={
                        minTotalAmount.isGreaterThan(balance) && !isZero(balance) ?
                            minTotalAmount.toString()
                        :   undefined
                    }
                    isAvailableBalance={isAvailableBalance}
                    balance={balance}
                    maxAmountShares={isRandom || shares === '' ? 1 : shares}
                />
            </div>
            <Box margin={2}>
                <Typography className={classes.title}>{t.message()}</Typography>
            </Box>
            <Box margin={2}>
                <InputBase
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.blessing_words()}
                    value={message}
                    inputProps={{
                        maxLength: 40,
                    }}
                />
            </Box>

            {pluginID === NetworkPluginID.PLUGIN_EVM ?
                <Box margin={2}>
                    <SelectGasSettingsToolbar
                        nativeToken={nativeTokenDetailed}
                        nativeTokenPrice={nativeTokenPrice}
                        gasConfig={gasOption}
                        gasLimit={Number.parseInt(params?.gas ?? '0', 10)}
                        onChange={onGasOptionChange}
                    />
                </Box>
            :   null}

            {rawTotalAmount && !isZero(rawTotalAmount) ?
                <TokenValue className={classes.tokenValue} token={token} amount={rawTotalAmount} />
            :   null}

            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    actualPluginID={pluginID}
                    disableSwitchAccount>
                    <EthereumERC20TokenApprovedBoundary
                        amount={totalAmount.toFixed()}
                        balance={balance}
                        classes={{ container: classes.unlockContainer }}
                        ActionButtonProps={{
                            size: 'medium',
                        }}
                        token={
                            token?.schema === SchemaType.ERC20 && totalAmount.gt(0) && !validationMessage ?
                                token
                            :   undefined
                        }
                        tooltip={t.infinite_unlock_tips({ token: token.symbol })}
                        spender={HAPPY_RED_PACKET_ADDRESS_V4}>
                        <ChainBoundary
                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                            expectedChainId={chainId}
                            forceShowingWrongNetworkButton>
                            <WalletConnectedBoundary
                                noGasText={t.no_enough_gas_fees()}
                                expectedChainId={chainId}
                                hideRiskWarningConfirmed>
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
