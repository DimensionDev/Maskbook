import { RightIcon } from '@masknet/icons'
import { useGasLimit, useTokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import {
    useChainId,
    useFungibleTokenBalance,
    useGasPrice,
    useLookupAddress,
    useNetworkDescriptor,
    useWeb3State,
    useNativeToken,
    useNativeTokenPrice,
} from '@masknet/plugin-infra/web3'
import { NetworkType } from '@masknet/public-api'
import { FormattedAddress, TokenAmountPanel, usePickToken } from '@masknet/shared'
import { MaskColorVar, MaskTextField } from '@masknet/theme'
import {
    TokenType,
    FungibleToken,
    isGreaterThan,
    isSameAddress,
    isZero,
    multipliedBy,
    NetworkPluginID,
    rightShift,
} from '@masknet/web3-shared-base'
import {
    addGasMargin,
    SchemaType,
    formatWeiToEther,
    TransactionStateType,
    useTokenConstants,
    ChainId,
    chainResolver,
    explorerResolver,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import TuneIcon from '@mui/icons-material/Tune'
import { Box, Button, IconButton, Link, Popover, Stack, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { useDashboardI18N } from '../../../../locales'
import { useGasConfig } from '../../hooks/useGasConfig'

export interface TransferERC20Props {
    token: FungibleToken<ChainId, SchemaType>
}

const GAS_LIMIT = 21000

export const TransferERC20 = memo<TransferERC20Props>(({ token }) => {
    const t = useDashboardI18N()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const anchorEl = useRef<HTMLDivElement | null>(null)
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [minPopoverWidth, setMinPopoverWidth] = useState(0)
    const network = useNetworkDescriptor()
    const [gasLimit_, setGasLimit_] = useState(0)

    const { value: defaultGasPrice = '0' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)

    const [selectedToken, setSelectedToken] = useState(token)
    const pickToken = usePickToken()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const is1559Supported = useMemo(() => chainResolver.isSupport(chainId, 'EIP1559'), [chainId])

    const { Others } = useWeb3State()

    useEffect(() => {
        setSelectedToken(token)
    }, [token])

    // workaround: transferERC20 should support non-evm network
    const isNativeToken = isSameAddress(selectedToken?.address, NATIVE_TOKEN_ADDRESS)
    const tokenType = isNativeToken ? SchemaType.Native : SchemaType.ERC20

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        selectedToken?.address ?? '',
    )
    const nativeToken = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const nativeTokenPrice = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)

    // #region resolve ENS domain
    const {
        value: registeredAddress = '',
        error: resolveDomainError,
        loading: resolveDomainLoading,
    } = useLookupAddress(NetworkPluginID.PLUGIN_EVM, address)
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

    const maxAmount = useMemo(() => {
        const price = is1559Supported && maxFee ? new BigNumber(maxFee) : gasPrice
        const gasFee = multipliedBy(addGasMargin(gasLimit), price)

        let amount_ = new BigNumber(tokenBalance || '0')
        amount_ = selectedToken.schema === SchemaType.Native ? amount_.minus(gasFee) : amount_
        return BigNumber.max(0, amount_).toFixed()
    }, [tokenBalance, gasPrice, selectedToken?.type, amount, gasLimit, maxFee, is1559Supported])

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        tokenType,
        selectedToken.address,
    )

    const onTransfer = useCallback(async () => {
        if (isValidAddress(address)) {
            await transferCallback(transferAmount, address, gasConfig, memo)
            return
        } else if (Others?.isValidDomain?.(address)) {
            await transferCallback(transferAmount, registeredAddress, gasConfig, memo)
            return
        }
        return
    }, [transferAmount, address, memo, selectedToken.decimals, transferCallback, gasConfig, registeredAddress, Others])

    // #region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t.wallets_transfer_error_amount_absence()
        if (isGreaterThan(rightShift(amount, selectedToken.decimals), maxAmount))
            return t.wallets_transfer_error_insufficient_balance({ symbol: selectedToken.symbol ?? '' })
        if (!address) return t.wallets_transfer_error_address_absence()
        if (!(isValidAddress(address) || Others?.isValidDomain?.(address)))
            return t.wallets_transfer_error_invalid_address()
        if (Others?.isValidDomain?.(address) && (resolveDomainError || !registeredAddress)) {
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

    useEffect(() => {
        const ALLOWED_TYPES = [TransactionStateType.FAILED, TransactionStateType.HASH]
        if (!ALLOWED_TYPES.includes(transferState.type)) return
        setMemo('')
        setAddress('')
        setAmount('')
        resetTransferCallback()
    }, [transferState])

    const ensContent = useMemo(() => {
        if (resolveDomainLoading) return
        if (registeredAddress) {
            return (
                <Box style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                        href={explorerResolver.domainLink(chainId, address)}
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
                            <FormattedAddress address={registeredAddress} size={4} formatter={Others?.formatAddress} />
                        </Typography>
                    </Link>
                    <RightIcon />
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
            if (Others?.isValidDomain?.(address) && resolveDomainError) {
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
        Others?.isValidDomain,
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
                    {/* TODO: Remove forced type conversion */}
                    <TokenAmountPanel
                        amount={amount}
                        maxAmount={maxAmount}
                        balance={tokenBalance}
                        label={t.wallets_transfer_amount()}
                        token={selectedToken}
                        onAmountChange={setAmount}
                        SelectTokenChip={{
                            loading: false,
                            ChipProps: {
                                onClick: async () => {
                                    const pickedToken = await pickToken({
                                        disableNativeToken: false,
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
                            value={memo}
                            placeholder={t.wallets_transfer_memo_placeholder()}
                            onChange={(e) => setMemo(e.currentTarget.value)}
                            label={t.wallets_transfer_memo()}
                        />
                    </Box>
                ) : null}
                <Box mt={4} display="flex" flexDirection="row" justifyContent="center">
                    <Button
                        sx={{ width: 240 }}
                        disabled={
                            !!validationMessage || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING
                        }
                        onClick={onTransfer}>
                        {validationMessage || t.wallets_transfer_send()}
                    </Button>
                </Box>
            </Stack>
        </Stack>
    )
})
