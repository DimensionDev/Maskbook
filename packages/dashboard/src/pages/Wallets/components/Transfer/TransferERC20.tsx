import { MaskColorVar, MaskTextField } from '@masknet/theme'
import { Box, Button, IconButton, Link, Popover, Stack, Typography } from '@mui/material'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    EthereumTokenType,
    formatWeiToEther,
    FungibleTokenDetailed,
    isEIP1559Supported,
    TransactionStateType,
    useChainId,
    useFungibleTokenBalance,
    useGasLimit,
    useGasPrice,
    useNativeTokenDetailed,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { isGreaterThan, isZero, multipliedBy, rightShift } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { NetworkPluginID, useLookupAddress, useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra'
import { FormattedAddress, TokenAmountPanel, useRemoteControlledDialog } from '@masknet/shared'
import TuneIcon from '@mui/icons-material/Tune'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'
import { useNativeTokenPrice } from './useNativeTokenPrice'
import { useGasConfig } from '../../hooks/useGasConfig'
import { NetworkType } from '@masknet/public-api'
import { useUpdateEffect } from 'react-use'
import { v4 as uuid } from 'uuid'
import { PluginMessages } from '../../../../API'
import type { SelectTokenDialogEvent } from '@masknet/plugin-wallet'

interface TransferERC20Props {
    token: FungibleTokenDetailed
}

const GAS_LIMIT = 30000
export const TransferERC20 = memo<TransferERC20Props>(({ token }) => {
    const t = useDashboardI18N()
    const anchorEl = useRef<HTMLDivElement | null>(null)
    const [id] = useState(uuid())
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [minPopoverWidth, setMinPopoverWidth] = useState(0)
    const network = useNetworkDescriptor()
    const [gasLimit_, setGasLimit_] = useState(0)

    const { setDialog: setSelectToken } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setSelectedToken(ev.token)
            },
            [id],
        ),
    )

    const { value: defaultGasPrice = '0' } = useGasPrice()

    const [selectedToken, setSelectedToken] = useState<FungibleTokenDetailed>(token)
    const chainId = useChainId()
    const is1559Supported = useMemo(() => isEIP1559Supported(chainId), [chainId])

    const { Utils } = useWeb3State()

    useEffect(() => {
        setSelectedToken(token)
    }, [token])

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useFungibleTokenBalance(
        selectedToken?.type ?? EthereumTokenType.Native,
        selectedToken?.address ?? '',
    )
    const nativeToken = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice()
    const isNativeToken = selectedToken.type === EthereumTokenType.Native

    //#region resolve ENS domain
    const {
        value: registeredAddress = '',
        error: resolveDomainError,
        loading: resolveDomainLoading,
    } = useLookupAddress(address, NetworkPluginID.PLUGIN_EVM)
    //#endregion

    // transfer amount
    const transferAmount = rightShift(amount || '0', selectedToken.decimals).toFixed()
    const erc20GasLimit = useGasLimit(
        selectedToken.type,
        selectedToken.address,
        transferAmount,
        EthereumAddress.isValid(address) ? address : registeredAddress,
    )
    const { gasConfig, onCustomGasSetting, gasLimit, maxFee } = useGasConfig(gasLimit_, 30000)
    const gasPrice = gasConfig.gasPrice || defaultGasPrice

    useEffect(() => {
        setGasLimit_(isNativeToken ? GAS_LIMIT : erc20GasLimit.value ?? 0)
    }, [isNativeToken, erc20GasLimit.value])

    const gasFee = useMemo(() => {
        const price = is1559Supported && maxFee ? new BigNumber(maxFee) : gasPrice
        return multipliedBy(gasLimit, price)
    }, [gasLimit, gasPrice, maxFee, is1559Supported])
    const gasFeeInUsd = formatWeiToEther(gasFee).multipliedBy(nativeTokenPrice)

    const maxAmount = useMemo(() => {
        let amount_ = new BigNumber(tokenBalance || '0')
        amount_ = selectedToken.type === EthereumTokenType.Native ? amount_.minus(gasFee) : amount_
        return amount_.toFixed()
    }, [tokenBalance, gasPrice, selectedToken?.type, amount])

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        selectedToken.type,
        selectedToken.address,
    )

    const onTransfer = useCallback(async () => {
        if (EthereumAddress.isValid(address)) {
            await transferCallback(transferAmount, address, gasConfig, memo)
            return
        } else if (Utils?.isValidDomain?.(address)) {
            await transferCallback(transferAmount, registeredAddress, gasConfig, memo)
            return
        }
        return
    }, [transferAmount, address, memo, selectedToken.decimals, transferCallback, gasConfig, registeredAddress, Utils])

    //#region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t.wallets_transfer_error_amount_absence()
        if (isGreaterThan(rightShift(amount, selectedToken.decimals), maxAmount))
            return t.wallets_transfer_error_insufficient_balance({ symbol: selectedToken.symbol ?? '' })
        if (!address) return t.wallets_transfer_error_address_absence()
        if (!EthereumAddress.isValid(address)) return t.wallets_transfer_error_invalid_address()
        if (Utils?.isValidDomain?.(address) && (resolveDomainError || !registeredAddress)) {
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
        Utils,
        registeredAddress,
        resolveDomainError,
        network,
    ])
    //#endregion

    useEffect(() => {
        if (transferState.type === TransactionStateType.FAILED || transferState.type === TransactionStateType.HASH) {
            setMemo('')
            setAddress('')
            setAmount('')
            resetTransferCallback()
        }
    }, [transferState])

    const ensContent = useMemo(() => {
        if (resolveDomainLoading) return
        if (registeredAddress) {
            return (
                <Link
                    href={Utils?.resolveDomainLink?.(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none">
                    <Box style={{ padding: 10 }}>
                        <Typography
                            fontSize={16}
                            lineHeight="22px"
                            fontWeight={500}
                            marginBottom="10px"
                            style={{ color: MaskColorVar.textPrimary }}>
                            {address}
                        </Typography>
                        <Typography fontSize={14} lineHeight="20px" style={{ color: MaskColorVar.textSecondary }}>
                            <FormattedAddress address={registeredAddress} size={4} formatter={Utils?.formatAddress} />
                        </Typography>
                    </Box>
                </Link>
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
            if (Utils?.isValidDomain?.(address) && resolveDomainError) {
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
        Utils?.isValidDomain,
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
                                if (!!ensContent) setPopoverOpen(true)
                                setMinPopoverWidth(event.currentTarget.clientWidth)
                            },
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
                        balance={tokenBalance}
                        label={t.wallets_transfer_amount()}
                        token={selectedToken}
                        onAmountChange={setAmount}
                        SelectTokenChip={{
                            loading: false,
                            ChipProps: {
                                onClick: () =>
                                    setSelectToken({
                                        open: true,
                                        uuid: id,
                                        disableNativeToken: false,
                                    }),
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
