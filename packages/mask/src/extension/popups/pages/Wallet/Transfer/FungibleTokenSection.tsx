import { Icons } from '@masknet/icons'
import { ImageIcon, ProgressiveText, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, MaskColors, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useFungibleAsset,
    useFungibleTokenBalance,
    useGasPrice,
    useNetworkDescriptor,
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import { formatBalance, isLessThan, isZero, leftShift, rightShift } from '@masknet/web3-shared-base'
import { GasEditor, type GasConfig } from '@masknet/web3-shared-evm'
import { Box, Input, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { useI18N } from '../../../../../utils/index.js'
import { TokenPicker } from '../../../components/index.js'
import { useTokenParams } from '../../../hook/index.js'
import { ChooseTokenModal } from '../../../modals/modals.js'
import { GasSettings } from './GasSettings.js'

const useStyles = makeStyles()((theme) => ({
    asset: {
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        borderRadius: 8,
        color: theme.palette.maskColor.white,
        backgroundColor: MaskColors.light.maskColor.primary,
        cursor: 'pointer',
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
    const undecided = !!params.get('undecided')
    const handleSelectToken = useCallback((asset: Web3Helper.FungibleAssetAll): void => {
        setParams(
            (p) => {
                p.set('chainId', asset.chainId.toString())
                p.set('address', asset.address)
                p.delete('undecided')
                return p.toString()
            },
            { replace: true },
        )
    }, [])
    const network = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const { data: asset, isLoading } = useFungibleAsset(NetworkPluginID.PLUGIN_EVM, address, { chainId })

    const { value: defaultGasPrice = '1' } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [gasOption, setGasOption] = useState<GasConfig>()

    const handleGasSettingChange = useCallback(
        (gasConfig: GasConfig) => {
            const editor = GasEditor.fromConfig(chainId, gasConfig)
            setGasOption((config) => {
                return editor.getGasConfig({
                    gasPrice: defaultGasPrice,
                    maxFeePerGas: defaultGasPrice,
                    maxPriorityFeePerGas: defaultGasPrice,
                    ...config,
                })
            })
        },
        [chainId, defaultGasPrice],
    )

    const { data: balance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address, { chainId })
    const [amount, setAmount] = useState('')
    const totalAmount = useMemo(
        () => (amount && asset?.decimals ? rightShift(amount, asset.decimals).toFixed() : '0'),
        [],
    )

    const { account } = useChainContext()
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account,
    })
    const recipient = params.get('recipient')
    const [state, transferToken] = useAsyncFn(async () => {
        if (!recipient || !isZero(totalAmount) || !asset?.decimals) return
        return Web3.transferFungibleToken(address, recipient, totalAmount, '')
    }, [address, recipient, totalAmount, asset?.decimals])

    if (undecided)
        return <TokenPicker defaultChainId={chainId} chainId={chainId} address={address} onSelect={handleSelectToken} />

    const inputNotReady = !recipient || !amount
    const tokenNotReady = !asset?.decimals || !balance || isLessThan(balance, totalAmount)
    const transferDisabled = inputNotReady || tokenNotReady

    return (
        <>
            <Box
                className={classes.asset}
                data-hide-scrollbar
                onClick={async () => {
                    const asset = await ChooseTokenModal.openAndWaitForClose({
                        chainId,
                        address,
                    })
                    if (asset) handleSelectToken(asset)
                }}>
                <Box position="relative" height={36} width={36}>
                    <TokenIcon className={classes.tokenIcon} chainId={chainId} address={address} />
                    <ImageIcon className={classes.badgeIcon} size={16} icon={network?.icon} />
                </Box>
                <Box mr="auto" ml={2}>
                    <ProgressiveText loading={isLoading} skeletonWidth={36}>
                        {asset?.symbol}
                    </ProgressiveText>
                    <ProgressiveText loading={isLoading} skeletonWidth={60}>
                        {t('available_amount', {
                            amount: formatBalance(asset?.balance, asset?.decimals, 0, false, true, 5),
                        })}
                    </ProgressiveText>
                </Box>
                <Icons.ArrowDrop size={24} />
            </Box>
            <Box mt={2}>
                <Input
                    fullWidth
                    disableUnderline
                    placeholder={t('amount')}
                    endAdornment={
                        <Typography
                            className={classes.maxButton}
                            onClick={() => {
                                if (!balance || !asset?.decimals) return
                                setAmount(leftShift(balance, asset.decimals).toFixed())
                            }}>
                            {t('max')}
                        </Typography>
                    }
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </Box>
            <Box display="flex" justifyContent="space-between" width="100%" mt={2}>
                <GasSettings
                    chainId={chainId}
                    tokenAddress={address}
                    gasConfig={gasOption}
                    onChange={handleGasSettingChange}
                />
            </Box>
            <Box className={classes.actionGroup}>
                <ActionButton variant="outlined" fullWidth onClick={() => navigate(-2)}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton fullWidth onClick={transferToken} disabled={transferDisabled} loading={state.loading}>
                    {t('next')}
                </ActionButton>
            </Box>
        </>
    )
})
