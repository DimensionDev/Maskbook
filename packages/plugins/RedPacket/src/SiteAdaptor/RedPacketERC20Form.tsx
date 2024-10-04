import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { omit } from 'lodash-es'
import { makeStyles, ActionButton, MaskTextField, RadioIndicator } from '@masknet/theme'
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
import { type ChainId, type GasConfig, SchemaType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    FungibleTokenInput,
    PluginWalletStatusBar,
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    SelectGasSettingsToolbar,
    useAvailableBalance,
    TokenValue,
    WalletConnectedBoundary,
    SelectFungibleTokenModal,
    useCurrentLinkedPersona,
} from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useChainContext, useWallet, useNativeTokenPrice, useEnvironmentContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver, SmartPayBundler, EVMWeb3 } from '@masknet/web3-providers'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants.js'
import { type RedPacketSettings, useCreateParams } from './hooks/useCreateCallback.js'
import { useDefaultCreateGas } from './hooks/useDefaultCreateGas.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    isFirefly?: boolean
    origin?: RedPacketSettings
    onClose: () => void
    onNext: () => void
    onGasOptionChange?: (config: GasConfig) => void
    onChange(settings: RedPacketSettings): void
    onChainChange(newChainId: ChainId): void
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const { _ } = useLingui()
    const { origin, expectedChainId, isFirefly, gasOption, onChange, onNext, onGasOptionChange, onChainChange } = props
    const { classes } = useStyles()
    const theme = useTheme()
    // context
    const wallet = useWallet()
    const { pluginID } = useEnvironmentContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

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
            pluginID: NetworkPluginID.PLUGIN_EVM,
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
    const [rawAmount, setRawAmount] = useState(() =>
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
            message: message || _(msg`Best Wishes!`),
            shares: shares || 0,
            token:
                token ?
                    (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                :   undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, senderName, message, _, shares, token, totalAmount],
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
            message: message || _(msg`Best Wishes!`),
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

    const validationMessage = (() => {
        if (!token) return <Trans>Select a Token</Trans>
        if (!account) return <Trans>Connect Wallet</Trans>
        if (isZero(shares || '0')) return <Trans>Enter Number of Winners</Trans>
        if (isGreaterThan(shares || '0', 255)) return <Trans>At most 255 recipients</Trans>
        if (isGreaterThan(minTotalAmount, balance) || isGreaterThan(totalAmount, balance))
            return <Trans>Insufficient {token?.symbol} Balance</Trans>
        if (isZero(amount)) {
            return isRandom ? <Trans>Enter Total Amount</Trans> : <Trans>Enter Amount Each</Trans>
        }

        if (!isDivisible)
            return (
                <Trans>
                    The minimum amount for each share is {formatBalance(1, token.decimals)} {token.symbol}
                </Trans>
            )
        return undefined
    })()

    const gasValidationMessage = (() => {
        if (!token) return ''
        if (!isGasSufficient) {
            return <Trans>Insufficient Balance for Gas Fee</Trans>
        }
        if (!loadingTransactionValue && new BigNumber(transactionValue).isLessThanOrEqualTo(0))
            return <Trans>Insufficient Balance</Trans>

        return undefined
    })()

    if (!token) return null

    return (
        <>
            <div className={classes.field}>
                <label className={classes.option} onClick={() => setRandom(1)}>
                    <div className={classes.checkIconWrapper}>
                        <RadioIndicator checked={!!isRandom} size={20} />
                    </div>
                    <Typography
                        color={isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={isRandom ? 700 : 400}>
                        <Trans>Random Amount</Trans>
                    </Typography>
                </label>
                <label className={classes.option} onClick={() => setRandom(0)}>
                    <div className={classes.checkIconWrapper}>
                        <RadioIndicator checked={!isRandom} size={20} />
                    </div>
                    <Typography
                        color={!isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={!isRandom ? 700 : 400}>
                        <Trans>Equal Amount</Trans>
                    </Typography>
                </label>
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
                                    <Trans>Winners</Trans>
                                </Typography>
                                <Icons.RedPacket size={18} />
                            </>
                        ),
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: _(msg`Enter number of winners`),
                            spellCheck: false,
                            pattern: '^[0-9]+$',
                        },
                    }}
                />
            </div>
            <div className={classes.field}>
                <FungibleTokenInput
                    label={isRandom ? _(msg`Total amount`) : _(msg`Amount Each`)}
                    token={token}
                    placeholder={
                        isRandom ?
                            _(msg`Total amount shared among all winners`)
                        :   _(msg`Enter the amount that each winner can claim`)
                    }
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
                <Typography className={classes.title}>
                    <Trans>Message</Trans>
                </Typography>
            </Box>
            <Box margin={2}>
                <InputBase
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={_(msg`Best Wishes`)}
                    value={message}
                    inputProps={{
                        maxLength: isFirefly ? 40 : 100,
                    }}
                />
            </Box>

            {pluginID === NetworkPluginID.PLUGIN_EVM ?
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
            :   null}

            {rawTotalAmount && !isZero(rawTotalAmount) ?
                <TokenValue className={classes.tokenValue} token={token} amount={rawTotalAmount} />
            :   null}

            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    actualPluginID={pluginID}
                    disableSwitchAccount={isFirefly}>
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
                        tooltip={_(
                            msg`Grant access to your ${token.symbol} for the Lucky Drop Smart contract. You only have to do this once per token.`,
                        )}
                        spender={HAPPY_RED_PACKET_ADDRESS_V4}>
                        <ChainBoundary
                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                            expectedChainId={chainId}
                            forceShowingWrongNetworkButton>
                            <WalletConnectedBoundary
                                noGasText={_(msg`Insufficient Balance for Gas Fee`)}
                                expectedChainId={chainId}
                                hideRiskWarningConfirmed={isFirefly}>
                                <ActionButton
                                    size="medium"
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage || !!gasValidationMessage}
                                    onClick={onClick}>
                                    {validationMessage || gasValidationMessage || <Trans>Create the Lucky Drop</Trans>}
                                </ActionButton>
                            </WalletConnectedBoundary>
                        </ChainBoundary>
                    </EthereumERC20TokenApprovedBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}
