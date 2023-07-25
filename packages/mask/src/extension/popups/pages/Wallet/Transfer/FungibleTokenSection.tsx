import { Icons } from '@masknet/icons'
import { GasSettingBar, ImageIcon, ProgressiveText, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { MaskColors, makeStyles } from '@masknet/theme'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleAsset, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { Box, Input, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useI18N } from '../../../../../utils/index.js'
import { TokenPicker } from '../../../components/index.js'
import { useTokenParams } from '../../../hook/index.js'
import { ChooseTokenModal } from '../../../modals/modals.js'

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
}))

export const FungibleTokenSection = memo(function FungibleTokenSection() {
    const { chainId, address, params, setParams } = useTokenParams()
    const { classes } = useStyles()
    const { t } = useI18N()
    // Enter from wallet home page, sending token is not decided yet
    const undecided = !!params.get('undefined')
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
    const handleGasChange = useCallback((tx: NonPayableTx) => {
        // TODO
    }, [])

    if (undecided)
        return <TokenPicker defaultChainId={chainId} chainId={chainId} address={address} onSelect={handleSelectToken} />

    return (
        <>
            <Box
                className={classes.asset}
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
                    <ProgressiveText loading={isLoading} skeletonWidth={35}>
                        {asset?.symbol}
                    </ProgressiveText>
                    <ProgressiveText loading={isLoading} skeletonWidth={55}>
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
                    endAdornment={<Typography>{t('max')}</Typography>}
                />
            </Box>
            <GasSettingBar gasLimit={21000} onChange={handleGasChange} />
        </>
    )
})
