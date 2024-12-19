import { msg, t, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Icons } from '@masknet/icons'
import {
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    FungibleTokenInput,
    PluginWalletStatusBar,
    SelectFungibleTokenModal,
    SelectGasSettingsToolbar,
    TokenValue,
    useAvailableBalance,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { EnhanceableSite, getEnhanceableSiteType, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, RadioIndicator } from '@masknet/theme'
import { useChainContext, useEnvironmentContext, useNativeTokenPrice, useWallet } from '@masknet/web3-hooks-base'
import { useTransactionValue } from '@masknet/web3-hooks-evm'
import { EVMWeb3, SmartPayBundler } from '@masknet/web3-providers'
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
import { Box, InputBase, inputBaseClasses, Typography, useTheme } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { type ChangeEvent, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES, RoutePaths } from '../../constants.js'
import { PreviewRedPacket } from '../components/PreviewRedPacket.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useCreateParams } from '../hooks/useCreateCallback.js'
import { useDefaultCreateGas } from '../hooks/useDefaultCreateGas.js'

const useStyles = makeStyles()((theme) => ({
    fields: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
        gap: theme.spacing(2),
        paddingBottom: 88,
    },
    field: {
        display: 'flex',
        gap: 16,
        alignItems: 'center',
    },
    input: {
        height: 70,
        position: 'relative',
        padding: theme.spacing(1.25, 1.5),
        [`& > .${inputBaseClasses.input}`]: {
            paddingTop: `${theme.spacing(2.75)}!important`,
            paddingBottom: '0px !important',
            flex: 2,
            paddingLeft: '0px !important',
            fontSize: 14,
            fontWeight: 400,
        },
    },
    iconInput: {
        [`& > .${inputBaseClasses.input}`]: {
            paddingLeft: '24px !important',
        },
    },
    inputLabel: {
        fontSize: 13,
        lineHeight: '18px',
        position: 'absolute',
        top: 10,
        left: 12,
        color: theme.palette.maskColor.second,
    },
    inputIcon: {
        position: 'absolute',
        left: 10,
        top: 32,
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
        cursor: 'pointer',
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
    label: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    gasSettings: {
        margin: 0,
    },
    cover: {
        width: 60,
        height: 40,
        cursor: 'pointer',
        border: 'none',
        borderRadius: 12,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    addButton: {
        width: 44,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.maskColor.thirdMain,
    },
    selectedCover: {
        boxShadow: `0 0 0 2px ${theme.palette.maskColor.main}`,
    },
    preview: {
        width: 484,
        height: 336,
        margin: theme.spacing(0, 'auto'),
    },
    envelope: {
        width: '100%',
        height: '100%',
        borderRadius: theme.spacing(2),
        overflow: 'hidden',
    },
}))

export function CreateERC20RedPacket() {
    const { _ } = useLingui()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isFirefly = getEnhanceableSiteType() === EnhanceableSite.Firefly
    const [gasOption, setGasOption] = useState<GasConfig>()
    const { classes, cx } = useStyles()
    const theme = useTheme()
    const navigate = useNavigate()
    const {
        rawAmount,
        setRawAmount,
        token,
        setToken,
        nativeToken,
        theme: selectedTheme,
        themes: redpacketThemes,
        setTheme,
        settings,
        message,
        setMessage,
        shares,
        setShares,
        isRandom,
        setIsRandom,
    } = useRedPacket()
    // context
    const wallet = useWallet()
    const { pluginID } = useEnvironmentContext()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    // #region select token
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
            chainId,
            pluginID: NetworkPluginID.PLUGIN_EVM,
        })
        if (!picked) return
        if (chainId !== picked.chainId) {
            setChainId(picked.chainId as ChainId)
        }
        setToken(picked as FungibleToken<ChainId, SchemaType>)
    }, [token?.address, chainId])
    // #endregion

    // shares
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const inputShares = ev.currentTarget.value.replaceAll(/[,.]/g, '')
            if (inputShares === '') setShares(0)
            else if (/^[1-9]+\d*$/.test(inputShares)) {
                const parsed = Number.parseInt(inputShares, 10)
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES) {
                    setShares(Number.parseInt(inputShares, 10))
                } else if (parsed > RED_PACKET_MAX_SHARES) {
                    setShares(RED_PACKET_MAX_SHARES)
                }
            }
        },
        [RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES],
    )

    // amount
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const rawTotalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    )
    const totalAmount = multipliedBy(amount, isRandom ? 1 : (shares ?? '0'))
    const minTotalAmount = new BigNumber(isRandom ? 1 : (shares ?? 0))
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1)

    // #region gas
    const { account: publicKey } = useMemo(() => EVMWeb3.createAccount(), [])
    const contract_version = 4
    const { value: params } = useCreateParams(chainId, settings, contract_version, publicKey)
    // #endregion

    // balance
    const { value: defaultGas = ZERO } = useDefaultCreateGas(settings, contract_version, publicKey)
    const { isAvailableBalance, balance, isGasSufficient } = useAvailableBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address,
        gasOption ? { ...gasOption, gas: new BigNumber(defaultGas).toString() } : undefined,
        {
            chainId,
        },
    )

    const { transactionValue, loading: loadingTransactionValue } = useTransactionValue(
        settings?.total,
        gasOption?.gas,
        gasOption?.gasCurrency,
    )
    // #endregion

    const validationMessage = (() => {
        if (!token) return <Trans>Select a Token</Trans>
        if (!account) return <Trans>Connect Wallet</Trans>
        if (!shares) return <Trans>Enter Number of Winners</Trans>
        if (isGreaterThan(shares, 255)) return <Trans>At most 255 recipients</Trans>
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
        if (!token) return
        if (!isGasSufficient) {
            return <Trans>Insufficient Balance for Gas Fee</Trans>
        }
        if (!loadingTransactionValue && new BigNumber(transactionValue).isLessThanOrEqualTo(0))
            return <Trans>Insufficient Balance</Trans>

        return
    })()

    if (!token) return null

    const messageMaxLength = isFirefly ? 40 : 100

    return (
        <>
            <div className={classes.fields}>
                <div className={classes.field}>
                    <label className={classes.option} onClick={() => setIsRandom(1)}>
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
                    <label className={classes.option} onClick={() => setIsRandom(0)}>
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
                <InputBase
                    className={classes.input}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    startAdornment={
                        <Typography className={classes.inputLabel}>
                            <Trans>Message</Trans>
                        </Typography>
                    }
                    endAdornment={
                        <Typography className={classes.inputLabel} style={{ right: 12, left: 'auto' }}>
                            {message.length}/{messageMaxLength}
                        </Typography>
                    }
                    placeholder={_(msg`Best Wishes`)}
                    inputProps={{
                        maxLength: messageMaxLength,
                    }}
                />
                <div className={classes.field}>
                    <Box width={180}>
                        <InputBase
                            className={cx(classes.input, classes.iconInput)}
                            fullWidth
                            value={shares || ''}
                            onChange={onShareChange}
                            startAdornment={
                                <Typography className={classes.inputLabel}>
                                    <Trans>Winners</Trans>
                                </Typography>
                            }
                            endAdornment={<Icons.RedPacket className={classes.inputIcon} size={24} />}
                            inputProps={{
                                autoComplete: 'off',
                                autoCorrect: 'off',
                                inputMode: 'decimal',
                                spellCheck: false,
                                pattern: '^[0-9]+$',
                            }}
                        />
                    </Box>
                    <FungibleTokenInput
                        className={classes.input}
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
                        maxAmountShares={isRandom || !shares ? 1 : shares}
                    />
                </div>
                {pluginID === NetworkPluginID.PLUGIN_EVM ?
                    <SelectGasSettingsToolbar
                        classes={{ label: classes.label, root: classes.gasSettings }}
                        nativeToken={nativeToken}
                        nativeTokenPrice={nativeTokenPrice}
                        supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                        gasConfig={gasOption}
                        gasLimit={Number.parseInt(params?.gas ?? '0', 10)}
                        onChange={setGasOption}
                    />
                :   null}
                <Box className={classes.field}>
                    <Typography className={classes.label}>
                        <Trans>Choose a Cover</Trans>
                    </Typography>
                    <Box display="flex" flexDirection="row" gap={1} ml="auto">
                        {redpacketThemes.map((theme) => (
                            <button
                                key={theme.tid}
                                type="button"
                                className={cx(
                                    classes.cover,
                                    theme.tid === selectedTheme?.tid ? classes.selectedCover : '',
                                )}
                                style={{
                                    backgroundImage: `url(${theme.cover.bg_image})`,
                                    backgroundColor: theme.cover.bg_color,
                                }}
                                onClick={() => {
                                    setTheme(theme)
                                }}
                            />
                        ))}
                        <button
                            type="button"
                            className={cx(classes.cover, classes.addButton)}
                            onClick={() => {
                                navigate(RoutePaths.CustomCover)
                            }}>
                            <Icons.Plus size={20} />
                        </button>
                    </Box>
                </Box>
                <div>
                    {selectedTheme && shares ?
                        <div className={classes.preview}>
                            <PreviewRedPacket className={classes.envelope} />
                        </div>
                    :   null}
                </div>
            </div>

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
                        tooltip={t`Grant access to your ${token.symbol} for the Lucky Drop Smart contract. You only have to do this once per token.`}
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
                                    onClick={() => {
                                        navigate(RoutePaths.ConfirmErc20RedPacket)
                                    }}>
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
