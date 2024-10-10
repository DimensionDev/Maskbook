import { Icons } from '@masknet/icons'
import { NetworkIcon, ProgressiveText, TokenIcon, useAvailableBalance } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, MaskColors, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    ChainContextProvider,
    useChainContext,
    useFungibleToken,
    useNetwork,
    useWallet,
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import { useGasLimit } from '@masknet/web3-hooks-evm'
import { isLessThan, isLte, isZero, leftShift, minus, rightShift } from '@masknet/web3-shared-base'
import {
    SchemaType,
    isNativeTokenAddress,
    type ChainId,
    type GasConfig,
    getNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { Box, Input, Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { formatTokenBalance } from '../../../../shared/index.js'
import { GasSettingMenu } from '../../../components/GasSettingMenu/index.js'
import { TokenPicker } from '../../../components/index.js'
import { useTokenParams, PopupContext } from '../../../hooks/index.js'
import { ChooseTokenModal } from '../../../modals/modal-controls.js'
import { useDefaultGasConfig } from './useDefaultGasConfig.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    asset: {
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        borderRadius: 8,
        color: theme.palette.maskColor.white,
        backgroundColor: MaskColors.light.maskColor.primary,
        cursor: 'pointer',
        margin: theme.spacing(0, 2),
    },
    tokenPicker: {
        margin: theme.spacing(0, 2),
    },
    tokenIcon: {
        width: 36,
        height: 36,
    },
    badgeIcon: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
    maxButton: {
        cursor: 'pointer',
    },
    label: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        fontWeight: 700,
    },
    error: {
        color: theme.palette.maskColor.danger,
        margin: theme.spacing(2, 2, 0),
    },
    actionGroup: {
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        width: '100%',
        bottom: 0,
        zIndex: 100,
        marginTop: 'auto',
    },
}))

const ETH_GAS_LIMIT = '21000'
const ERC20_GAS_LIMIT = '50000'
// Change chain in SelectNetworkSidebar is pending status, but it should affect ContactsContext
const PENDING_CHAIN_ID = 'pendingChainId'
export const FungibleTokenSection = memo(function FungibleTokenSection() {
    const { _ } = useLingui()
    const { classes } = useStyles()
    const { chainId, address, params, setParams } = useTokenParams()
    const { smartPayChainId } = PopupContext.useContainer()
    const recipient = params.get('recipient')
    const navigate = useNavigate()
    const [paymentAddress, setPaymentAddress] = useState<string>()

    // Enter from wallet home page, sending token is not decided yet
    const undecided = params.get('undecided') === 'true'
    const locationAsset = useLocation().state?.asset as Web3Helper.FungibleAssetAll | undefined
    const [selectedAsset = locationAsset, setSelectedAsset] = useState<Web3Helper.FungibleAssetAll>()
    const handleSelectAsset = useCallback(
        (asset: Web3Helper.FungibleAssetAll): void => {
            setSelectedAsset(asset)
            setParams(
                (p) => {
                    p.set('chainId', asset.chainId.toString())
                    p.set('address', asset.address)
                    p.delete('undecided')
                    p.delete(PENDING_CHAIN_ID)
                    return p.toString()
                },
                { replace: true },
            )
        },
        [setParams],
    )
    const setPendingChainId = useCallback(
        (chainId: Web3Helper.ChainIdAll | undefined) => {
            setParams(
                (p) => {
                    if (!chainId) {
                        p.delete(PENDING_CHAIN_ID)
                    } else {
                        p.set(PENDING_CHAIN_ID, chainId.toString())
                    }
                    return p.toString()
                },
                { replace: true },
            )
        },
        [setParams],
    )
    const network = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const { data: token, isPending } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, address, undefined, { chainId })

    const [amount, setAmount] = useState('')
    const totalAmount = useMemo(
        () => (amount && token?.decimals ? rightShift(amount, token.decimals).toFixed() : '0'),
        [amount, token?.decimals],
    )
    const isNativeToken = isNativeTokenAddress(address)
    const fallbackGasLimit = isNativeToken ? ETH_GAS_LIMIT : ERC20_GAS_LIMIT
    const gasResult = useGasLimit(
        isNativeToken ? SchemaType.Native : SchemaType.ERC20,
        address,
        totalAmount,
        recipient || undefined,
        undefined,
        chainId,
    )
    const gasLimit = gasResult.data?.toString() ?? fallbackGasLimit
    const { isPending: isLoadingGasLimit } = gasResult
    const defaultGasConfig = useDefaultGasConfig(chainId, gasLimit)
    const [gasConfig = defaultGasConfig, setGasConfig] = useState<GasConfig | undefined>()
    const patchedGasConfig = useMemo(
        () => ({ gas: gasLimit, ...gasConfig, gasCurrency: paymentAddress }),
        [gasConfig, paymentAddress, gasLimit],
    )
    const {
        balance,
        isPending: isLoadingAvailableBalance,
        isAvailableBalance,
        isGasSufficient,
        gasFee,
    } = useAvailableBalance(NetworkPluginID.PLUGIN_EVM, address, patchedGasConfig as GasConfig, {
        chainId,
        providerURL: network?.rpcUrl,
    })

    const wallet = useWallet()
    const { account } = useChainContext()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account,
        chainId,
    })
    const { showSnackbar } = usePopupCustomSnackbar()

    const [state, transfer] = useAsyncFn(async () => {
        if (!recipient || isZero(totalAmount) || !token?.decimals) return
        const nativeTokenAddress = getNativeTokenAddress(chainId)
        try {
            await Web3.transferFungibleToken(address, recipient, totalAmount, '', {
                overrides: gasConfig,
                paymentToken:
                    paymentAddress ? paymentAddress
                    : chainId === smartPayChainId ? nativeTokenAddress
                    : undefined,
                chainId,
                gasOptionType: gasConfig?.gasOptionType,
                providerURL: network?.rpcUrl,
            })
        } catch (err) {
            let message = (err as Error).message
            message = message.includes('"blockNumber":') ? '' : message
            showSnackbar(<Trans>Failed to transfer token: {message}</Trans>, { variant: 'error' })
        }
    }, [
        address,
        chainId,
        recipient,
        totalAmount,
        token?.decimals,
        gasConfig,
        paymentAddress,
        network?.rpcUrl,
        smartPayChainId,
    ])

    if (undecided)
        return (
            <TokenPicker
                className={classes.tokenPicker}
                defaultChainId={chainId}
                chainId={chainId}
                address={address}
                onSelect={handleSelectAsset}
                onChainChange={setPendingChainId}
            />
        )

    // Use selectedAsset balance eagerly
    // balance passed from previous page, would be used if during fetching balance.
    const isLoadingBalance = selectedAsset?.balance ? false : isLoadingAvailableBalance || isPending
    const optimisticBalance = BigNumber.max(0, minus(selectedAsset?.balance || 0, gasFee))
    // Available token balance
    const tokenBalance = (isLoadingAvailableBalance || isPending) && isZero(balance) ? optimisticBalance : balance

    const decimals = token?.decimals || selectedAsset?.decimals
    const uiTokenBalance = tokenBalance && decimals ? leftShift(tokenBalance, decimals).toString() : '0'

    const inputNotReady = !recipient || !amount || isLessThan(tokenBalance, totalAmount) || isLte(totalAmount, 0)
    const tokenNotReady = !token?.decimals || isLessThan(tokenBalance, totalAmount) || !isGasSufficient
    const transferDisabled = inputNotReady || tokenNotReady || isLoadingGasLimit

    return (
        <>
            <Box
                className={classes.asset}
                data-hide-scrollbar
                onClick={async () => {
                    const picked = await ChooseTokenModal.openAndWaitForClose({
                        chainId,
                        address,
                    })
                    if (picked) handleSelectAsset(picked)
                }}>
                <Box position="relative" height={36} width={36}>
                    <TokenIcon
                        className={classes.tokenIcon}
                        chainId={chainId}
                        address={address}
                        logoURL={selectedAsset?.logoURL}
                    />
                    <NetworkIcon
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                        chainId={network?.chainId as ChainId}
                        className={classes.badgeIcon}
                        size={16}
                        network={network}
                    />
                </Box>
                <Box mr="auto" ml={2}>
                    <ProgressiveText loading={isPending} skeletonWidth={36}>
                        {token?.symbol}
                    </ProgressiveText>
                    <ProgressiveText loading={isLoadingBalance} skeletonWidth={60}>
                        {isAvailableBalance ?
                            <Trans>{formatTokenBalance(tokenBalance, token?.decimals)} available</Trans>
                        :   formatTokenBalance(tokenBalance, token?.decimals)}
                    </ProgressiveText>
                </Box>
                <Icons.ArrowDrop size={24} />
            </Box>
            <Box mt={2} mx={2}>
                <Input
                    fullWidth
                    disableUnderline
                    placeholder={_(msg`Amount`)}
                    endAdornment={
                        <Typography
                            className={classes.maxButton}
                            onClick={() => {
                                if (!balance || !token?.decimals) return
                                setAmount(uiTokenBalance)
                            }}>
                            <Trans>Max</Trans>
                        </Typography>
                    }
                    value={amount}
                    onChange={(e) => {
                        let value = e.target.value
                        if (!balance || !token?.decimals || !value) {
                            setAmount(value)
                            return
                        }
                        value = isLessThan(value, uiTokenBalance) ? value : uiTokenBalance
                        return setAmount(value)
                    }}
                />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mx={2}>
                <Typography className={classes.label}>
                    <Trans>Gas Fee</Trans>
                </Typography>
                <ChainContextProvider chainId={chainId}>
                    <GasSettingMenu
                        defaultGasConfig={gasConfig}
                        defaultGasLimit={gasLimit}
                        defaultChainId={chainId}
                        paymentToken={paymentAddress}
                        allowMaskAsGas
                        onPaymentTokenChange={setPaymentAddress}
                        owner={wallet?.owner}
                        onChange={setGasConfig}
                    />
                </ChainContextProvider>
            </Box>
            {isGasSufficient ? null : (
                <Typography className={classes.error}>
                    <Trans>Insufficient funds for gas.</Trans>
                </Typography>
            )}
            <Box className={classes.actionGroup}>
                <ActionButton variant="outlined" fullWidth onClick={() => navigate(-2)}>
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButton fullWidth onClick={transfer} disabled={transferDisabled} loading={state.loading}>
                    <Trans>Next</Trans>
                </ActionButton>
            </Box>
        </>
    )
})
