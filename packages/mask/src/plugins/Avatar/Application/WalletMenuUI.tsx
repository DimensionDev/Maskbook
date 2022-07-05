import {
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptor,
    useProviderDescriptor,
    useProviderType,
    useReverseAddress,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { ImageIcon, useSnackbarCallback } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { IconProps, Link, Stack, Typography, useTheme } from '@mui/material'
import classNames from 'classnames'
import { memo, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { CopyIcon } from '../assets/copy'
import { LinkIcon } from '../assets/link'
import { VerifyIcon } from '../assets/verify'
import { useI18N } from '../locales'
import { formatAddress } from '../utils'

const useStyles = makeStyles()((theme) => ({
    root: {},
    address: {
        fontSize: 10,
    },
    copy: {
        fontSize: 16,
        cursor: 'pointer',
        color: theme.palette.text.secondary,
    },
    link: {
        color: theme.palette.text.secondary,
        lineHeight: 0,
    },
    linkIcon: {
        width: 16,
        height: 16,
    },
    walletName: {
        color: theme.palette.mode === 'dark' ? '#D9D9D9' : '#0F1419',
    },
    walletAddress: {
        color: theme.palette.mode === 'dark' ? '#6E767D' : '#536471',
    },
}))

interface WalletUIProps {
    name?: string
    address: string
    verify?: boolean
    isETH?: boolean
}

export function WalletUI(props: WalletUIProps) {
    const { isETH, address, verify = false, name } = props

    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId)
    const networkDescriptor = useNetworkDescriptor(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId, chainId)
    const { value: domain } = useReverseAddress(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId, address)
    const { Others } = useWeb3State<'all'>(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId)
    const providerType = useProviderType()
    const providerDescriptor = useProviderDescriptor()

    if (!address) return null
    return (
        <Stack direction="row" alignItems="center" justifyContent="center">
            <ImageIcon size={30} icon={networkDescriptor?.icon} />
            <Stack direction="column" style={{ marginLeft: 4 }}>
                <Stack display="flex" fontSize={14} flexDirection="row" alignItems="center">
                    <Typography className={classes.walletName} fontWeight={700} fontSize={14}>
                        {providerType === ProviderType.MaskWallet
                            ? domain ?? name ?? providerDescriptor?.name ?? formatAddress(address, 4)
                            : isETH
                            ? domain ?? 'EVM Wallet'
                            : domain ?? providerDescriptor?.name ?? formatAddress(address, 4)}
                    </Typography>
                    {verify ? <VerifyIcon style={{ width: 13, height: 13, marginLeft: 4 }} /> : null}
                </Stack>
                <Stack direction="row" alignItems="center">
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        fontSize={12}
                        className={classNames(classes.address, classes.walletAddress)}>
                        {formatAddress(address, 4)}
                    </Typography>
                    <CopyIconButton text={address} className={classes.copy} />
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink?.(chainId as ChainId, address) ?? ''}
                        target="_blank"
                        title="View on Explorer"
                        rel="noopener noreferrer">
                        <LinkIcon className={classes.linkIcon} />
                    </Link>
                </Stack>
            </Stack>
        </Stack>
    )
}

interface CopyIconButtonProps extends IconProps {
    text: string
}
const CopyIconButton = memo<CopyIconButtonProps>(({ text, ...props }) => {
    const t = useI18N()
    const theme = useTheme()
    const [, copyToClipboard] = useCopyToClipboard()
    const [open, setOpen] = useState(false)

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(text),
        deps: [],
        successText: t.copy_success_of_wallet_address(),
    })

    return (
        <ShadowRootTooltip
            title={<span style={{ color: theme.palette.text.primary }}>{t.copied()}</span>}
            open={open}
            onMouseLeave={() => setOpen(false)}
            disableFocusListener
            disableTouchListener>
            <CopyIcon onClick={onCopy} className={props.className} />
        </ShadowRootTooltip>
    )
})
