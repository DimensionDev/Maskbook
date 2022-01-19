import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Link, Stack, Typography } from '@mui/material'
import { memo } from 'react'
import { Platform } from '../types'
import { DeleteIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { CopyIconButton } from './CopyIconButton'
import { ExternalLink } from 'react-feather'
import { NetworkPluginID, useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra'
import { useI18N } from '../locales'
import { ImageIcon } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(1),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
    },
    trashIcon: {
        fontSize: 20,
        stroke: theme.palette.text.primary,
        cursor: 'pointer',
    },
    copy: {
        fontSize: 16,
        stroke: theme.palette.text.primary,
        cursor: 'pointer',
    },
    address: {
        color: theme.palette.text.primary,
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginRight: theme.spacing(1),
    },
}))
interface Item {
    platform: Platform
    identity: string
    onUnBind(address: string): void
}

export const BindingItem = memo<Item>(({ platform, identity, onUnBind }) => {
    const t = useI18N()
    const { Utils } = useWeb3State() ?? {}
    const { classes } = useStyles()
    const networkDescriptor = useNetworkDescriptor(undefined, NetworkPluginID.PLUGIN_EVM)
    console.log(networkDescriptor)

    if (platform === Platform.ethereum) {
        return (
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mx={1}
                mb={4}
                className={classes.item}>
                <Stack direction="row" alignItems="center" gap="12px">
                    <ImageIcon size={18} icon={networkDescriptor?.icon} />
                    <Typography className={classes.address}>{formatEthereumAddress(identity, 4)}</Typography>
                    <CopyIconButton text={identity} className={classes.copy} />
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(1, identity) ?? ''}
                        target="_blank"
                        title={t.view_on_explorer()}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </Stack>
                <Box>
                    <DeleteIcon className={classes.trashIcon} onClick={() => onUnBind(identity)} />
                </Box>
            </Stack>
        )
    }
    return null
})
