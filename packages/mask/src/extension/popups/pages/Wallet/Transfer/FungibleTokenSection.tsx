import { Icons } from '@masknet/icons'
import { ImageIcon, ProgressiveText, TokenIcon, useAvailableBalance } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, MaskColors, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    ChainContextProvider,
    useChainContext,
    useFungibleToken,
    useNativeTokenAddress,
    useNetworkDescriptor,
    useWallet,
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import { isLessThan, isLte, isZero, leftShift, rightShift } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type GasConfig } from '@masknet/web3-shared-evm'
import { Box, Input, Typography } from '@mui/material'
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
        marginTop: theme.spacing(2),
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
    const network = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { data: token, isLoading } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, address, undefined, { chainId })

    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })
    const isNativeToken = isNativeTokenAddress(address)
    const gasLimit = isNativeToken ? ETH_GAS_LIMIT : ERC20_GAS_LIMIT
    const defaultGasConfig = useDefaultGasConfig(chainId, gasLimit)
    const [gasConfig = defaultGasConfig, setGasConfig] = useState<GasConfig>()
    const [amount, setAmount] = useState('')
    const totalAmount = useMemo(
        () => (amount && token?.decimals ? rightShift(amount, token.decimals).toFixed() : '0'),
        [amount, token?.decimals],
    )
    const {
        balance,
        isLoading: isLoadingAvailableBalance,
        isGasSufficient,
    } = useAvailableBalance(NetworkPluginID.PLUGIN_EVM, address, gasConfig, {
        chainId,
    })

    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { account } = useChainContext()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account,
        chainId,
    })
    const recipient = params.get('recipient')
    const [state, transfer] = useAsyncFn(async () => {
        if (!recipient || isZero(totalAmount) || !token?.decimals) return
        return Web3.transferFungibleToken(address, recipient, totalAmount, '', {
            overrides: gasConfig,
        })
    }, [address, chainId, recipient, totalAmount, token?.decimals, gasConfig])
    const [paymentAddress, setPaymentAddress] = useState(nativeTokenAddress)

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

    const inputNotReady = !recipient || !amount || isLessThan(balance, totalAmount)
    const tokenNotReady = !token?.decimals || !balance || isLessThan(balance, totalAmount) || !isGasSufficient
    const transferDisabled = inputNotReady || tokenNotReady || isLte(totalAmount, 0)

    // Use selectedAsset balance eagerly
    const isLoadingBalance = selectedAsset?.balance ? false : isLoadingAvailableBalance || isLoading
    const tokenBalance = isLoadingAvailableBalance || isLoading ? selectedAsset?.balance : balance

    const decimals = token?.decimals || selectedAsset?.decimals
    const uiTokenBalance = tokenBalance && decimals ? leftShift(tokenBalance, decimals).toString() : '0'

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
                    <TokenIcon className={classes.tokenIcon} chainId={chainId} address={address} />
                    <ImageIcon className={classes.badgeIcon} size={16} icon={network?.icon} />
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
            <Box display="flex" justifyContent="space-between" mt={2} mx={2}>
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
