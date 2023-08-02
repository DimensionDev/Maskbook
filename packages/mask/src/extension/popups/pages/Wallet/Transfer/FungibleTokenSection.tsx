import { Icons } from '@masknet/icons'
import { ImageIcon, ProgressiveText, TokenIcon, useAvailableBalance } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, MaskColors, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useFungibleToken, useNetworkDescriptor, useWeb3Connection } from '@masknet/web3-hooks-base'
import { isLessThan, isLte, isZero, leftShift, rightShift } from '@masknet/web3-shared-base'
import { type GasConfig } from '@masknet/web3-shared-evm'
import { Box, Input, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { useI18N } from '../../../../../utils/index.js'
import { TokenPicker } from '../../../components/index.js'
import { useTokenParams } from '../../../hook/index.js'
import { ChooseTokenModal } from '../../../modals/modals.js'
import { GasSettings } from './GasSettings.js'
import { formatBalance2 } from '../../../../../utils/formatBalance2.js'

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

export const FungibleTokenSection = memo(function FungibleTokenSection() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { chainId, address, params, setParams } = useTokenParams()
    const navigate = useNavigate()
    // Enter from wallet home page, sending token is not decided yet
    const undecided = params.get('undecided') === 'true'
    const [selectedAsset, setSelectedAsset] = useState<Web3Helper.FungibleAssetAll>()
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

    const [gasConfig, setGasConfig] = useState<GasConfig>()
    const [amount, setAmount] = useState('')
    const totalAmount = useMemo(
        () => (amount && token?.decimals ? rightShift(amount, token.decimals).toFixed() : '0'),
        [amount, token?.decimals],
    )
    const { balance, isLoading: isLoadingAvailableBalance } = useAvailableBalance(
        NetworkPluginID.PLUGIN_EVM,
        address,
        gasConfig,
        {
            chainId,
        },
    )

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
    const tokenNotReady = !token?.decimals || !balance || isLessThan(balance, totalAmount)
    const transferDisabled = inputNotReady || tokenNotReady || isLte(totalAmount, 0)

    // Use selectedAsset balance eagerly
    const isLoadingBalance = selectedAsset?.balance ? false : isLoadingAvailableBalance || isLoading
    const tokenBalance = isLoadingAvailableBalance || isLoading ? selectedAsset?.balance : balance

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
                        {t('available_amount', {
                            amount: formatBalance2(tokenBalance, token?.decimals),
                        })}
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
                                setAmount(leftShift(balance, token.decimals).toFixed())
                            }}>
                            {t('max')}
                        </Typography>
                    }
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2} mx={2}>
                <GasSettings chainId={chainId} tokenAddress={address} gasConfig={gasConfig} onChange={setGasConfig} />
            </Box>
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
