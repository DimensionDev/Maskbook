import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { BigNumber } from 'bignumber.js'
import { useContainer } from 'unstated-next'
import { Tune as TuneIcon } from '@mui/icons-material'
import { Box, Button, IconButton, Link, Popover, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { MaskColorVar, MaskTextField, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { useGasLimit } from '@masknet/web3-hooks-evm'
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
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import { FormattedAddress, SelectFungibleTokenModal, TokenAmountPanel } from '@masknet/shared'
import { DashboardRoutes, NetworkPluginID } from '@masknet/shared-base'
import { ChainResolver, DepositPaymaster, SmartPayBundler } from '@masknet/web3-providers'
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
    isValidDomain,
    isValidAddress,
    NetworkType,
    isNativeTokenAddress,
    addGasMargin,
    type EIP1559GasConfig,
} from '@masknet/web3-shared-evm'
import { useDashboardI18N } from '../../../../locales/index.js'
import { useGasConfig } from '../../hooks/useGasConfig.js'
import { Context } from '../../hooks/useContext.js'
import { TransferTab } from './types.js'

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
    const navigate = useNavigate()
    const { state } = useLocation() as {
        state: {
            token?: FungibleToken<ChainId, SchemaType>
        } | null
    }
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [message, setMessage] = useState('')
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [minPopoverWidth, setMinPopoverWidth] = useState(0)

    const { classes } = useStyles()
    const [gasLimit_, setGasLimit_] = useState(0)

    const { data: defaultGasPrice = '0' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)

    const [selectedToken, setSelectedToken] = useState(token)

    const { account, chainId, pluginID, isWalletConnectNetworkNotMatch } = useContainer(Context)

    const network = useNetworkDescriptor(pluginID, state?.token?.chainId)
    const Others = useWeb3Others()
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
    })

    const is1559Supported = useMemo(() => Others?.chainResolver.isFeatureSupported(chainId, 'EIP1559'), [chainId])
    useEffect(() => {
        token.chainId === chainId
            ? setSelectedToken(token)
            : setSelectedToken(ChainResolver.nativeCurrency(chainId as ChainId))
    }, [token, chainId])

    // workaround: transferERC20 should support non-evm network
    const isNativeToken = isNativeTokenAddress(selectedToken.address)

    const { data: nativeToken } = useNativeToken(pluginID, { chainId })
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(pluginID, { chainId })

    // balance
    const { data: tokenBalance = '0', refetch: tokenBalanceRetry } = useFungibleTokenBalance(
        pluginID,
        selectedToken?.address ?? '',
        { chainId },
    )

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
            ? selectedToken.symbol === nativeToken?.symbol
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
    const gasFeeInUsd = formatWeiToEther(gasFee).multipliedBy(nativeTokenPrice)

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

    const [{ loading: isTransferring }, transferCallback] = useAsyncFn(async () => {
        if (!selectedToken.address) return
        let recipient: string | undefined

        if (isValidAddress(address)) recipient = address
        else if (Others.isValidDomain(address)) recipient = registeredAddress
        if (!recipient) return

        const totalAmount = rightShift(amount, token.decimals).toFixed()
        return Web3.transferFungibleToken(selectedToken.address, recipient, totalAmount, '')
    }, [account, selectedToken.address, token?.decimals, amount, Web3, address, registeredAddress])

    const onTransfer = useCallback(async () => {
        const hash = transferCallback()
        if (typeof hash === 'string') {
            setMessage('')
            setAddress('')
            setAmount('')
            tokenBalanceRetry()
        }
    }, [transferCallback])

    // #region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t.wallets_transfer_error_amount_absence()
        if (isGreaterThan(rightShift(amount, selectedToken.decimals), maxAmount))
            return t.wallets_transfer_error_insufficient_balance({ symbol: selectedToken.symbol ?? '' })
        if (!address) return t.wallets_transfer_error_address_absence()
        if (!(isValidAddress(address) || isValidDomain(address))) return t.wallets_transfer_error_invalid_address()
        if (isValidDomain(address) && (resolveDomainError || !registeredAddress)) {
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
                                    const picked = await SelectFungibleTokenModal.openAndWaitForClose({
                                        disableNativeToken: false,
                                        chainId,
                                        pluginID: NetworkPluginID.PLUGIN_EVM,
                                    })
                                    if (!picked) return
                                    setSelectedToken(picked as FungibleToken<ChainId, SchemaType>)
                                    // Update the previous location state of the token.
                                    navigate(DashboardRoutes.WalletsTransfer, {
                                        state: { type: TransferTab.Token, token: picked },
                                    })
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
                                symbol: nativeToken?.symbol ?? '',
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
