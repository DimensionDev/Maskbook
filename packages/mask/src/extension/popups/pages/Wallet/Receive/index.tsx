import { CopyButton, FormattedAddress, Icon, ImageIcon, NetworkIcon, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useNetworks } from '@masknet/web3-hooks-base'
import { type ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Skeleton, Typography, type AvatarProps } from '@mui/material'
import { memo } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle, useTokenParams } from '../../../hook/index.js'
import { useAsset } from '../hooks/useAsset.js'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        header: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: theme.spacing(2),
        },
        iconContainer: {
            height: 60,
            width: 60,
            position: 'relative',
        },
        badge: {
            position: 'absolute',
            border: `1px solid ${theme.palette.maskColor.white}`,
            width: 17,
            height: 17,
            borderRadius: '50%',
            right: -3,
            bottom: -3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        name: {
            color: theme.palette.maskColor.main,
            marginTop: theme.spacing(1),
            fontSize: 24,
            fontWeight: 700,
        },
        address: {
            color: theme.palette.maskColor.second,
            marginTop: theme.spacing(1),
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
        },
        qrcode: {
            width: 250,
            height: 250,
            boxShadow: theme.palette.maskColor.bottomBg,
            borderRadius: theme.spacing(2),
            overflow: 'hidden',
        },
        halo: {
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            '&:before': {
                position: 'absolute',
                left: '-10%',
                top: 10,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage: isDark
                    ? 'radial-gradient(50% 50.00% at 50% 50.00%, #443434 0%, rgba(68, 52, 52, 0.00) 100%)'
                    : 'radial-gradient(50% 50.00% at 50% 50.00%, #FFE9E9 0%, rgba(255, 233, 233, 0.00) 100%)',
            },
            '&:after': {
                position: 'absolute',
                left: '70%',
                top: 20,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage: isDark
                    ? 'radial-gradient(50% 50.00% at 50% 50.00%, #605675 0%, rgba(56, 51, 67, 0.00) 100%)'
                    : 'radial-gradient(50% 50.00% at 50% 50.00%, #F0E9FF 0%, rgba(240, 233, 255, 0.00) 100%)',
            },
        },
        qrcodeContainer: {
            width: 282,
            margin: theme.spacing(2, 'auto', 0),
            padding: theme.spacing(2),
            backgroundColor: theme.palette.maskColor.bottom,
            position: 'relative',
            zIndex: 10,
        },
        tip: {
            fontSize: 16,
            marginTop: 10,
            textAlign: 'center',
            color: theme.palette.maskColor.second,
        },
    }
})

const avatarProps: AvatarProps = {
    sx: { fontSize: 26 },
}
export default memo(function Receive() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { chainId, address, rawChainId, rawAddress } = useTokenParams()
    // No specific token but only for chain
    const isChain = !rawChainId && !rawAddress
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const currentNetwork = networks.find((network) => network.chainId === chainId)

    const asset = useAsset(chainId, address ?? '', account)

    useTitle(t('wallet_receive'))

    const name = isChain ? currentNetwork?.name : asset?.symbol
    const MainIcon = isChain ? (
        currentNetwork?.iconUrl ? (
            <ImageIcon size={60} icon={currentNetwork.iconUrl} name={currentNetwork.name} />
        ) : (
            <Icon size={60} name={currentNetwork?.name} color={currentNetwork?.color} {...avatarProps} />
        )
    ) : (
        <TokenIcon
            chainId={chainId as ChainId}
            address={address}
            name={asset?.name}
            logoURL={asset?.logoURL}
            size={60}
        />
    )

    return (
        <Box>
            <Box className={classes.header}>
                <Box className={classes.iconContainer}>
                    {MainIcon}
                    {isChain || !currentNetwork ? null : (
                        <div className={classes.badge}>
                            <NetworkIcon
                                pluginID={NetworkPluginID.PLUGIN_EVM}
                                chainId={currentNetwork.chainId}
                                size={16}
                                name={currentNetwork.name}
                            />
                        </div>
                    )}
                </Box>
                {name ? (
                    <Typography className={classes.name}>{name}</Typography>
                ) : (
                    <Skeleton width={60} className={classes.name} />
                )}
                <Typography className={classes.address}>
                    <FormattedAddress address={account} formatter={formatEthereumAddress} size={4} />
                    <CopyButton text={account} size={24} ml={2} style={{ marginLeft: 16 }} />
                </Typography>
            </Box>
            <div className={classes.halo}>
                <div className={classes.qrcodeContainer}>
                    <Box className={classes.qrcode}>
                        <QRCode value={account} ecLevel="L" size={220} quietZone={16} eyeRadius={100} qrStyle="dots" />
                    </Box>
                </div>
            </div>
            <Typography className={classes.tip}>{t('scan_address_to_payment')}</Typography>
        </Box>
    )
})
