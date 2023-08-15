import { Icons } from '@masknet/icons'
import { NetworkIcon, ProgressiveText, TokenIcon, useAvailableBalance } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, MaskColors, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    ChainContextProvider,
    useChainContext,
    useFungibleToken,
    useNetworks,
    useWallet,
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import { isLessThan, isLte, isZero, leftShift, minus, rightShift } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type GasConfig, type ChainId } from '@masknet/web3-shared-evm'
import { Box, Input, Typography } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { formatTokenBalance, useI18N } from '../../../../../utils/index.js'
import { GasSettingMenu } from '../../../components/GasSettingMenu/index.js'
import { TokenPicker } from '../../../components/index.js'
import { useTokenParams } from '../../../hook/index.js'
import { ChooseTokenModal } from '../../../modals/modals.js'
import { useDefaultGasConfig } from './useDefaultGasConfig.js'

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
export const FungibleTokenSection = memo(function FungibleTokenSection() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { chainId, address, params, setParams } = useTokenParams()
    const chainContextValue = useMemo(() => ({ chainId }), [chainId])
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
                    return p.toString()
                },
                { replace: true },
            )
        },
        [setParams],
    )
    const networks = useNetworks()
    const network = networks.find((x) => x.chainId === chainId)
    const { data: token, isLoading } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, address, undefined, { chainId })

    const isNativeToken = isNativeTokenAddress(address)
    const gasLimit = isNativeToken ? ETH_GAS_LIMIT : ERC20_GAS_LIMIT
    const defaultGasConfig = useDefaultGasConfig(chainId, gasLimit)
    const [gasConfig = defaultGasConfig, setGasConfig] = useState<GasConfig>()
    const [amount, setAmount] = useState('')
    const totalAmount = useMemo(
        () => (amount && token?.decimals ? rightShift(amount, token.decimals).toFixed() : '0'),
        [amount, token?.decimals],
    )
    const patchedGasConfig = useMemo(
        () => ({ ...gasConfig, gasCurrency: paymentAddress, gas: gasLimit }),
        [gasConfig, paymentAddress, gasLimit],
    )
    const {
        balance,
        isLoading: isLoadingAvailableBalance,
        isGasSufficient,
        gasFee,
    } = useAvailableBalance(NetworkPluginID.PLUGIN_EVM, address, patchedGasConfig as GasConfig, {
        chainId,
    })

    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { account } = useChainContext()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account,
        chainId,
    })
    const recipient = params.get('recipient')
    const { showSnackbar } = usePopupCustomSnackbar()

    const [state, transfer] = useAsyncFn(async () => {
        if (!recipient || isZero(totalAmount) || !token?.decimals) return
        try {
            await Web3.transferFungibleToken(address, recipient, totalAmount, '', {
                overrides: gasConfig,
                paymentToken: paymentAddress,
                chainId,
                gasOptionType: gasConfig?.gasOptionType,
                providerURL: network?.rpcUrl,
            })
        } catch (err) {
            showSnackbar(t('failed_to_transfer_token', { message: (err as Error).message }), { variant: 'error' })
        }
    }, [address, chainId, recipient, totalAmount, token?.decimals, gasConfig, paymentAddress, network?.rpcUrl])

    if (undecided)
        return (
            <TokenPicker
                className={classes.tokenPicker}
                defaultChainId={chainId}
                chainId={chainId}
                address={address}
                onSelect={handleSelectAsset}
            />
        )

    // Use selectedAsset balance eagerly
    // balance passed from previous page, would be used if during fetching balance.
    const isLoadingBalance = selectedAsset?.balance ? false : isLoadingAvailableBalance || isLoading
    const optimisticBalance = BigNumber.max(0, minus(selectedAsset?.balance || 0, gasFee))
    // Available token balance
    const tokenBalance = (isLoadingAvailableBalance || isLoading) && isZero(balance) ? optimisticBalance : balance

    const decimals = token?.decimals || selectedAsset?.decimals
    const uiTokenBalance = tokenBalance && decimals ? leftShift(tokenBalance, decimals).toString() : '0'

    const inputNotReady = !recipient || !amount || isLessThan(tokenBalance, totalAmount)
    const tokenNotReady = !token?.decimals || isLessThan(tokenBalance, totalAmount) || !isGasSufficient
    const transferDisabled = inputNotReady || tokenNotReady || isLte(totalAmount, 0)

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
                        icon={network?.iconUrl}
                        preferName={network?.isCustomized}
                    />
                </Box>
                <Box mr="auto" ml={2}>
                    <ProgressiveText loading={isLoading} skeletonWidth={36}>
                        {token?.symbol}
                    </ProgressiveText>
                    <ProgressiveText loading={isLoadingBalance} skeletonWidth={60}>
                        {isNativeToken
                            ? t('available_amount', {
                                  amount: formatTokenBalance(tokenBalance, token?.decimals),
                              })
                            : formatTokenBalance(tokenBalance, token?.decimals)}
                    </ProgressiveText>
                </Box>
                <Icons.ArrowDrop size={24} />
            </Box>
            <Box mt={2} mx={2}>
                <Input
                    fullWidth
                    disableUnderline
                    placeholder={t('amount')}
                    endAdornment={
                        <Typography
                            className={classes.maxButton}
                            onClick={() => {
                                if (!balance || !token?.decimals) return
                                setAmount(uiTokenBalance)
                            }}>
                            {t('max')}
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
                <Typography className={classes.label}>{t('gas_fee')}</Typography>
                <ChainContextProvider value={chainContextValue}>
                    <GasSettingMenu
                        initConfig={gasConfig}
                        minimumGas={gasLimit}
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
                <Typography className={classes.error}>{t('insufficient_funds_for_gas')}</Typography>
            )}
            <Box className={classes.actionGroup}>
                <ActionButton variant="outlined" fullWidth onClick={() => navigate(-2)}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton fullWidth onClick={transfer} disabled={transferDisabled} loading={state.loading}>
                    {t('next')}
                </ActionButton>
            </Box>
        </>
    )
})
