import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import {
    FormattedBalance,
    FungibleTokenInput,
    PluginWalletStatusBar,
    SelectFungibleTokenModal,
    TokenValue,
    useAvailableBalance,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, RadioIndicator } from '@masknet/theme'
import { useChainContext, useEnvironmentContext, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { SolanaChainResolver } from '@masknet/web3-providers'
import {
    formatBalance,
    formatCurrency,
    type FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    rightShift,
    ZERO,
} from '@masknet/web3-shared-base'
import { type ChainId, isNativeTokenAddress, type SchemaType } from '@masknet/web3-shared-solana'
import { alpha, Box, InputBase, inputBaseClasses, Typography, useTheme } from '@mui/material'
import type { Cluster } from '@solana/web3.js'
import { BigNumber } from 'bignumber.js'
import { type ChangeEvent, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    MAX_CUSTOM_THEMES,
    RED_PACKET_MIN_SHARES,
    RoutePaths,
    SOL_REDPACKET_CREATE_DEFAULT_GAS,
    SOL_REDPACKET_MAX_SHARES,
} from '../../constants.js'
import { PreviewRedPacket } from '../components/PreviewRedPacket.js'
import { useSolRedpacket } from '../contexts/SolRedpacketContext.js'
import { useEstimateGasWithCreateSolRedpacket } from '../hooks/useEstimateGasWithCreateSolRedpacket.js'

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
        fontWeight: 700,
        [`& > .${inputBaseClasses.input}`]: {
            paddingTop: `${theme.spacing(2.75)}!important`,
            paddingBottom: '0px !important',
            flex: 2,
            paddingLeft: '0px !important',
            fontSize: 14,
            fontWeight: 700,
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
    deleteButton: {
        cursor: 'pointer',
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0,
        width: 20,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.bottom,
        backgroundColor: alpha(theme.palette.maskColor.main, 0.8),
        borderRadius: 4,
        padding: 0,
        border: 0,
    },
    cover: {
        position: 'relative',
        width: 60,
        height: 40,
        cursor: 'pointer',
        border: 'none',
        borderRadius: 4,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        '&:hover *': {
            opacity: 1,
        },
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

export function CreateSolRedPacket() {
    const { _ } = useLingui()
    const { account, chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>()
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
        customThemes,
        setCustomThemes,
        setTheme,
        inputMessage,
        setInputMessage,
        shares,
        setShares,
        isRandom,
        setIsRandom,
        creator,
        publicKey,
    } = useSolRedpacket()
    // context
    const { pluginID } = useEnvironmentContext()

    const { data: nativeTokenPrice } = useNativeTokenPrice(pluginID)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: false,
            selectedTokens: token ? [token] : [],
            chainId,
            pluginID: NetworkPluginID.PLUGIN_SOLANA,
        })
        if (!picked || Array.isArray(picked)) return
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
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= SOL_REDPACKET_MAX_SHARES) {
                    setShares(Number.parseInt(inputShares, 10))
                } else if (parsed > SOL_REDPACKET_MAX_SHARES) {
                    setShares(SOL_REDPACKET_MAX_SHARES)
                }
            }
        },
        [RED_PACKET_MIN_SHARES, SOL_REDPACKET_MAX_SHARES],
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
    const cluster = SolanaChainResolver.network(chainId) as Cluster

    // balance
    const { data: defaultGasFee = ZERO, isFetching: estimateGasLoading } = useEstimateGasWithCreateSolRedpacket(
        shares,
        //  Avoid causing rpc rate limit due to too fast requests.
        new BigNumber('0.0001').toNumber(),
        isRandom,
        publicKey,
        inputMessage,
        creator,
        token,
        cluster,
    )

    const gasFee = defaultGasFee.multipliedBy(isNativeTokenAddress(token?.address) ? 5 : 10)
    const gasPriceUSD = gasFee.shiftedBy(-9).multipliedBy(nativeTokenPrice ?? 0)

    const { isAvailableBalance, balance, isGasSufficient } = useAvailableBalance(
        NetworkPluginID.PLUGIN_SOLANA,
        token?.address,
        { gas: SOL_REDPACKET_CREATE_DEFAULT_GAS, gasPrice: '', gasCurrency: nativeToken.address },
    )
    // #endregion

    const validationMessage = (() => {
        if (!token) return <Trans>Select a Token</Trans>
        if (!account) return <Trans>Connect Wallet</Trans>
        if (!shares) return <Trans>Enter Number of Winners</Trans>
        if (isGreaterThan(shares, SOL_REDPACKET_MAX_SHARES))
            return <Trans>At most {SOL_REDPACKET_MAX_SHARES} recipients</Trans>
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
        if (!estimateGasLoading && defaultGasFee.isGreaterThan(balance)) {
            return <Trans>Insufficient Balance</Trans>
        }

        return
    })()

    if (!token) return null

    const messageMaxLength = 200

    return (
        <>
            <div className={classes.fields}>
                <div className={classes.field}>
                    <label className={classes.option} onClick={() => setIsRandom(true)}>
                        <div className={classes.checkIconWrapper}>
                            <RadioIndicator checked={isRandom} size={20} />
                        </div>
                        <Typography
                            color={isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                            fontSize={16}
                            fontWeight={isRandom ? 700 : 400}>
                            <Trans>Random Amount</Trans>
                        </Typography>
                    </label>
                    <label className={classes.option} onClick={() => setIsRandom(false)}>
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
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    startAdornment={
                        <Typography className={classes.inputLabel}>
                            <Trans>Message</Trans>
                        </Typography>
                    }
                    endAdornment={
                        <Typography className={classes.inputLabel} style={{ right: 12, left: 'auto' }}>
                            {inputMessage.length}/{messageMaxLength}
                        </Typography>
                    }
                    placeholder={_(msg`Best Wishes!`)}
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
                        placeholder="0"
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
                {!isZero(defaultGasFee) ?
                    <Box className={classes.field} component="div" style={{ justifyContent: 'space-between' }}>
                        <Typography className={classes.label}>
                            <Trans>Gas Fee</Trans>
                        </Typography>
                        <Box style={{ display: 'flex', gap: 4, fontWeight: 700 }}>
                            <FormattedBalance
                                value={gasFee}
                                decimals={9}
                                significant={4}
                                symbol={nativeToken.symbol}
                                formatter={formatBalance}
                            />
                            <Typography style={{ fontWeight: 700 }}>
                                ≈ {formatCurrency(gasPriceUSD, 'USD', { onlyRemainTwoOrZeroDecimal: true })}
                            </Typography>
                        </Box>
                    </Box>
                :   null}
                <Box className={classes.field}>
                    <Typography className={classes.label}>
                        <Trans>Choose a Cover</Trans>
                    </Typography>
                    <Box display="flex" flexDirection="row" gap={1} ml="auto">
                        {redpacketThemes.map((theme) => (
                            <div
                                key={theme.tid}
                                role="button"
                                className={cx(
                                    classes.cover,
                                    theme.tid === selectedTheme?.tid ? classes.selectedCover : '',
                                )}
                                style={{
                                    backgroundImage: `url("${encodeURI(theme.cover.bg_image)}")`,
                                    backgroundColor: theme.cover.bg_color,
                                }}
                                onClick={() => {
                                    setTheme(theme)
                                }}>
                                {customThemes.includes(theme) ?
                                    <button
                                        type="button"
                                        className={classes.deleteButton}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            setCustomThemes((origins) => origins.filter((x) => x !== theme))
                                            if (theme === selectedTheme) setTheme(undefined)
                                        }}>
                                        <Icons.Delete size={16} />
                                    </button>
                                :   null}
                            </div>
                        ))}
                        {customThemes.length < MAX_CUSTOM_THEMES ?
                            <button
                                type="button"
                                className={cx(classes.cover, classes.addButton)}
                                onClick={() => {
                                    navigate(RoutePaths.CustomCover)
                                }}>
                                <Icons.Plus size={20} />
                            </button>
                        :   null}
                    </Box>
                </Box>
                <div>
                    {selectedTheme ?
                        <div className={classes.preview}>
                            <PreviewRedPacket
                                className={classes.envelope}
                                theme={selectedTheme}
                                message={inputMessage}
                                token={token}
                                creator={creator}
                                shares={shares}
                                isRandom={isRandom}
                                rawAmount={rawAmount}
                            />
                        </div>
                    :   null}
                </div>
            </div>

            {rawTotalAmount && !isZero(rawTotalAmount) ?
                <TokenValue className={classes.tokenValue} token={token} amount={rawTotalAmount} />
            :   null}

            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar
                    expectedPluginID={NetworkPluginID.PLUGIN_SOLANA}
                    expectedChainId={chainId}
                    actualPluginID={pluginID}>
                    <WalletConnectedBoundary
                        noGasText={_(msg`Insufficient Balance for Gas Fee`)}
                        expectedChainId={chainId}>
                        <ActionButton
                            size="medium"
                            className={classes.button}
                            fullWidth
                            disabled={!!validationMessage || !!gasValidationMessage}
                            onClick={() => {
                                navigate(RoutePaths.ConfirmSolanaRedPacket)
                            }}>
                            {validationMessage || gasValidationMessage || <Trans>Create the Lucky Drop</Trans>}
                        </ActionButton>
                    </WalletConnectedBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}
