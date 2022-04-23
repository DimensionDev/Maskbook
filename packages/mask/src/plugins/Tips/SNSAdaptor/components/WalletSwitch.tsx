import { makeStyles } from '@masknet/theme'
import { Link, Switch, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { ExternalLink } from 'react-feather'
import { NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    currentAccount: {
        padding: theme.spacing(1.5),
        display: 'flex',
        border: `1px solid ${theme.palette.background.default}`,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
        marginLeft: theme.spacing(1),
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    accountName: {
        fontSize: 16,
        marginRight: 6,
    },
    address: {
        fontSize: 14,
        marginRight: theme.spacing(1),
        color: theme.palette.text.secondary,
        display: 'inline-block',
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

interface WalletSwitchProps {
    chainId: ChainId
    type: NetworkPluginID
    address: string
    isPublic: boolean
    onChange: (idx: number, v: boolean) => void
    index: number
}

export function WalletSwitch({ type, address, isPublic, chainId, index, onChange }: WalletSwitchProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { Utils } = useWeb3State() ?? {}

    const resolveNetworkName = () => {
        const walletNameByNetwork = {
            [NetworkPluginID.PLUGIN_EVM]: 'EVM wallet',
            [NetworkPluginID.PLUGIN_SOLANA]: 'Solana wallet',
            [NetworkPluginID.PLUGIN_FLOW]: 'Flow wallet',
        }
        return walletNameByNetwork[type]
    }
    const onSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(index, e.target.checked)
    }
    return (
        <div className={classes.currentAccount}>
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{resolveNetworkName()}</Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={address}>
                        <FormattedAddress address={address} size={4} formatter={Utils?.formatAddress} />
                    </Typography>

                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(chainId, address) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            <div>
                <Switch checked={isPublic} onChange={onSwitch} />
            </div>
        </div>
    )
}
