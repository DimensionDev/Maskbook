import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { BigNumber } from 'bignumber.js'
import { Icons } from '@masknet/icons'
import { useGasLimit, useTokenTransferCallback } from '@masknet/web3-hooks-evm'
import {
    useFungibleTokenBalance,
    useGasPrice,
    useLookupAddress,
    useNetworkDescriptor,
    useWeb3Others,
    useNativeToken,
    useNativeTokenPrice,
    useMaskTokenAddress,
    useWallet,
} from '@masknet/web3-hooks-base'
import { FormattedAddress, TokenAmountPanel, useSelectFungibleToken } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { MaskColorVar, MaskTextField, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import {
    TokenType,
    type FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    rightShift,
    isSameAddress,
    minus,
    toFixed,
} from '@masknet/web3-shared-base'
import {
    SchemaType,
    formatWeiToEther,
    type ChainId,
    isValidAddress,
    NetworkType,
    isNativeTokenAddress,
    DepositPaymaster,
    addGasMargin,
    type EIP1559GasConfig,
} from '@masknet/web3-shared-evm'
import { useContainer } from 'unstated-next'
import { Tune as TuneIcon } from '@mui/icons-material'
import { Box, Button, IconButton, Link, Popover, Stack, Typography, useTheme } from '@mui/material'
import { useDashboardI18N } from '../../../../locales/index.js'
import { useGasConfig } from '../../hooks/useGasConfig.js'
import { SmartPayBundler } from '@masknet/web3-providers'
import { Context } from '../../hooks/useContext.js'

export interface TransferERC20Props {
    token: FungibleToken<ChainId, SchemaType>
}

const GAS_LIMIT = 21000

const useStyles = makeStyles()((theme) => {
    return {
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
        arrow: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

export const TransferERC20 = memo<TransferERC20Props>(({ token }) => {
    const t = useDashboardI18N()
    const wallet = useWallet()
    const anchorEl = useRef<HTMLDivElement | null>(null)
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [message, setMessage] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [minPopoverWidth, setMinPopoverWidth] = useState(0)
    const network = useNetworkDescriptor()
    const { classes } = useStyles()
    const [gasLimit_, setGasLimit_] = useState(0)
    const theme = useTheme()

    const { value: defaultGasPrice = '0' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)

    const [selectedToken, setSelectedToken] = useState(token)
    const selectFungibleToken = useSelectFungibleToken<void, NetworkPluginID.PLUGIN_EVM>()

    const { chainId, pluginID, isWalletConnectNetworkNotMatch } = useContainer(Context)
    const Others = useWeb3Others()
    const is1559Supported = useMemo(() => Others?.chainResolver.isSupport(chainId, 'EIP1559'), [chainId])
    useEffect(() => {
        setSelectedToken(token)
    }, [token])

    // workaround: transferERC20 should support non-evm network
    const isNativeToken = isNativeTokenAddress(selectedToken.address)
    const tokenType = isNativeToken ? SchemaType.Native : SchemaType.ERC20

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useFungibleTokenBalance(
        pluginID,
        selectedToken?.address ?? '',
        { chainId },
    )
    const nativeToken = useNativeToken(pluginID, { chainId })
    const nativeTokenPrice = useNativeTokenPrice(pluginID, { chainId })

    // #region resolve ENS domain
    const {
        value: registeredAddress = '',
        error: resolveDomainError,
        loading: resolveDomainLoading,
    } = useLookupAddress(pluginID, address, chainId)
    // #endregion

    // transfer amount
    const transferAmount = rightShift(amount || '0', selectedToken.decimals).toFixed()
    const erc20GasLimit = useGasLimit(
        selectedToken.type === TokenType.Fungible
            ? selectedToken.symbol === nativeToken.value?.symbol
                ? SchemaType.Native
                : SchemaType.ERC20
            : selectedToken.schema,
        selectedToken.address,
        transferAmount,
        isValidAddress(address) ? address : registeredAddress,
    )
    const { gasConfig, onCustomGasSetting, gasLimit, maxFee } = useGasConfig(gasLimit_, GAS_LIMIT)

    const gasPrice = gasConfig.gasPrice || defaultGasPrice

    useEffect(() => {
        setGasLimit_(isNativeToken ? GAS_LIMIT : erc20GasLimit.value ?? 0)
    }, [isNativeToken, erc20GasLimit.value])

    const gasFee = useMemo(() => {
        const price = is1559Supported && maxFee ? new BigNumber(maxFee) : gasPrice
        return multipliedBy(gasLimit, price)
    }, [gasLimit, gasPrice, maxFee, is1559Supported])
    const gasFeeInUsd = formatWeiToEther(gasFee).multipliedBy(nativeTokenPrice.value ?? 0)

    // #region hack for smartPay, will be removed
    const maskTokenAddress = useMaskTokenAddress()

    const { value: smartPayConfig } = useAsync(async () => {
        const smartPayChainId = await SmartPayBundler.getSupportedChainId()
        const depositPaymaster = new DepositPaymaster(smartPayChainId)
        const ratio = await depositPaymaster.getRatio()

        return {
            ratio,
            smartPayChainId,
        }
    }, [])

    const actualBalance = useMemo(() => {
        if (
            !wallet?.owner ||
            chainId !== smartPayConfig?.smartPayChainId ||
            !isSameAddress(selectedToken?.address, maskTokenAddress)
        )
            return tokenBalance

        return toFixed(
            minus(
                tokenBalance,

                new BigNumber((gasConfig as EIP1559GasConfig).maxFeePerGas)
                    .multipliedBy(!isZero(gasLimit) ? addGasMargin(gasLimit) : '200000')
                    .integerValue()
                    .multipliedBy(smartPayConfig?.ratio ?? 1),
            ),
            0,
        )
    }, [gasConfig, wallet, selectedToken?.address, maskTokenAddress, smartPayConfig, chainId, tokenBalance, gasLimit])
    // #endregion

    const maxAmount = useMemo(() => {
        const price = is1559Supported && maxFee ? new BigNumber(maxFee) : gasPrice
        const gasFee = multipliedBy(gasLimit, price)

        let amount_ = new BigNumber(actualBalance || '0')
        amount_ = selectedToken.schema === SchemaType.Native ? amount_.minus(gasFee) : amount_
        return BigNumber.max(0, amount_).toFixed()
    }, [actualBalance, gasPrice, selectedToken?.type, amount, gasLimit, maxFee, is1559Supported])

    const [{ loading: isTransferring }, transferCallback] = useTokenTransferCallback(
        tokenType,
        selectedToken.address,
        chainId as ChainId,
    )

    const onTransfer = useCallback(async () => {
        let hash: string | undefined
        if (isValidAddress(address)) {
            hash = await transferCallback(transferAmount, address, gasConfig, message)
        } else if (Others.isValidDomain(address)) {
            hash = await transferCallback(transferAmount, registeredAddress, gasConfig, message)
        }
        if (typeof hash === 'string') {
            setMessage('')
            setAddress('')
            setAmount('')
            tokenBalanceRetry()
        }
    }, [
        transferAmount,
        address,
        message,
        selectedToken.decimals,
        transferCallback,
        gasConfig,
        registeredAddress,
        Others,
    ])

    // #region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t.wallets_transfer_error_amount_absence()
        if (isGreaterThan(rightShift(amount, selectedToken.decimals), maxAmount))
            return t.wallets_transfer_error_insufficient_balance({ symbol: selectedToken.symbol ?? '' })
        if (!address) return t.wallets_transfer_error_address_absence()
        if (!(isValidAddress(address) || Others.isValidDomain(address)))
            return t.wallets_transfer_error_invalid_address()
        if (Others.isValidDomain(address) && (resolveDomainError || !registeredAddress)) {
            if (network?.type !== NetworkType.Ethereum) return t.wallet_transfer_error_no_ens_support()
            return t.wallet_transfer_error_no_address_has_been_set_name()
        }
        return ''
    }, [
        transferAmount,
        maxAmount,
        address,
        tokenBalance,
        selectedToken,
        amount,
        registeredAddress,
        resolveDomainError,
        network,
        Others,
    ])
    // #endregion

    const ensContent = useMemo(() => {
        if (resolveDomainLoading) return
        if (registeredAddress) {
            return (
                <Box style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                        href={Others.explorerResolver.domainLink(chainId, address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none">
                        <Typography
                            fontSize={16}
                            lineHeight="22px"
                            fontWeight={500}
                            marginBottom="10px"
                            style={{ color: MaskColorVar.textPrimary }}>
                            {address}
                        </Typography>
                        <Typography fontSize={14} lineHeight="20px" style={{ color: MaskColorVar.textSecondary }}>
                            <FormattedAddress address={registeredAddress} size={4} formatter={Others.formatAddress} />
                        </Typography>
                    </Link>
                    <Icons.Right />
                </Box>
            )
        }

        if (address.includes('.eth')) {
            if (network?.type !== NetworkType.Ethereum) {
                return (
                    <Box style={{ padding: '25px 10px' }}>
                        <Typography color="#FF5F5F" fontSize={16} fontWeight={500} lineHeight="22px">
                            {t.wallet_transfer_error_no_ens_support()}
                        </Typography>
                    </Box>
                )
            }
            if (Others.isValidDomain(address) && resolveDomainError) {
                return (
                    <Box style={{ padding: '25px 10px' }}>
                        <Typography color="#FF5F5F" fontSize={16} fontWeight={500} lineHeight="22px">
                            {t.wallet_transfer_error_no_address_has_been_set_name()}
                        </Typography>
                    </Box>
                )
            }
        }

        return
    }, [
        registeredAddress,
        address,
        Others.isValidDomain,
        MaskColorVar,
        resolveDomainError,
        network?.type,
        resolveDomainLoading,
    ])

    useUpdateEffect(() => {
        setPopoverOpen(!!ensContent && !!anchorEl.current)
    }, [ensContent])

    return (
        <Stack direction="row" justifyContent="center" mt={4}>
            <Stack width={640} minWidth={500}>
                <Box>
                    <MaskTextField
                        required
                        value={address}
                        InputProps={{
                            onClick: (event) => {
                                if (!anchorEl.current) anchorEl.current = event.currentTarget
                                if (ensContent) setPopoverOpen(true)
                                setMinPopoverWidth(event.currentTarget.clientWidth)
                            },
                            spellCheck: false,
                        }}
                        onChange={(e) => setAddress(e.currentTarget.value)}
                        label={t.wallets_transfer_to_address()}
                    />

                    <Popover
                        anchorEl={anchorEl.current}
                        onClose={() => setPopoverOpen(false)}
                        PaperProps={{
                            style: { minWidth: `${minPopoverWidth}px`, borderRadius: 4 },
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={popoverOpen}>
                        {ensContent}
                    </Popover>
                </Box>
                <Box mt={2}>
                    <TokenAmountPanel
                        amount={amount}
                        maxAmount={maxAmount}
                        balance={actualBalance}
                        label={t.wallets_transfer_amount()}
                        token={selectedToken}
                        onAmountChange={setAmount}
                        SelectTokenChip={{
                            loading: false,
                            ChipProps: {
                                onClick: async () => {
                                    const pickedToken = await selectFungibleToken({
                                        disableNativeToken: false,
                                        chainId,
                                    })
                                    if (pickedToken) setSelectedToken(pickedToken)
                                },
                            },
                        }}
                    />
                </Box>
                <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" mt="16px">
                    <Typography fontSize="12px" fontWeight="bold">
                        {t.gas_fee()}
                    </Typography>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Typography fontSize="14px" title={`$${gasFeeInUsd.toString()}`}>
                            {t.transfer_cost({
                                gasFee: formatWeiToEther(gasFee).toFixed(6),
                                symbol: nativeToken.value?.symbol ?? '',
                                usd: gasFeeInUsd.toFixed(2),
                            })}
                        </Typography>
                        <IconButton size="small" onClick={onCustomGasSetting}>
                            <TuneIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
                {isNativeToken ? (
                    <Box mt={2}>
                        <MaskTextField
                            value={message}
                            placeholder={t.wallets_transfer_memo_placeholder()}
                            onChange={(e) => setMessage(e.currentTarget.value)}
                            label={t.wallets_transfer_memo()}
                        />
                    </Box>
                ) : null}
                <Box mt={4} display="flex" flexDirection="row" justifyContent="center">
                    {isWalletConnectNetworkNotMatch ? (
                        <ShadowRootTooltip
                            title={t.wallet_connect_tips()}
                            placement="top"
                            arrow
                            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}>
                            <div>
                                <Button sx={{ width: 240 }} disabled onClick={onTransfer}>
                                    {t.wallets_transfer_send()}
                                    <Icons.Questions size={18} sx={{ marginLeft: 0.5 }} />
                                </Button>
                            </div>
                        </ShadowRootTooltip>
                    ) : (
                        <Button
                            sx={{ width: 240 }}
                            disabled={!!validationMessage || isTransferring}
                            onClick={onTransfer}>
                            {validationMessage || t.wallets_transfer_send()}
                        </Button>
                    )}
                </Box>
            </Stack>
        </Stack>
    )
})
