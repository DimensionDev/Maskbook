import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Link, Stack, Typography } from '@mui/material'
import { memo } from 'react'
import { NextIDPlatform } from '@masknet/shared-base'
import { DeleteIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { CopyIconButton } from './CopyIconButton'
import { ExternalLink } from 'react-feather'
import { NetworkPluginID, useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra/web3'
import { useI18N } from '../locales'
import { ImageIcon } from '@masknet/shared'
import { TipButton } from './Tip'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(1),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
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
    tipButton: {
        display: 'inline-flex',
        alignItems: 'center',
        color: theme.palette.text.primary,
        marginRight: theme.spacing(0.5),
    },
    tipButtonLabel: {
        color: theme.palette.text.primary,
        fontSize: 14,
        marginLeft: theme.spacing(0.5),
    },
    delButton: {
        fontSize: 20,
        stroke: theme.palette.text.primary,
        cursor: 'pointer',
        marginLeft: theme.spacing(1),
    },
}))

interface Item {
    platform: NextIDPlatform
    identity: string
    tipable?: boolean
    deletable?: boolean
    onUnBind(address: string): void
}

export const BindingItem = memo<Item>(({ platform, identity, tipable, deletable, onUnBind }) => {
    const t = useI18N()
    const { Utils } = useWeb3State() ?? {}
    const { classes } = useStyles()
    const networkDescriptor = useNetworkDescriptor(ChainId.Mainnet, NetworkPluginID.PLUGIN_EVM)
    const visitingPersona = useCurrentVisitingIdentity()

    if (platform === NextIDPlatform.Ethereum) {
        return (
            <Stack direction="row" justifyContent="space-between" alignItems="center" className={classes.item}>
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
                    {tipable ? (
                        <TipButton
                            addresses={[identity]}
                            receiver={visitingPersona.identifier}
                            className={classes.tipButton}>
                            <span className={classes.tipButtonLabel}>{t.tips()}</span>
                        </TipButton>
                    ) : null}
                    {deletable ? <DeleteIcon className={classes.delButton} onClick={() => onUnBind(identity)} /> : null}
                </Box>
            </Stack>
        )
    }
    return null
})
