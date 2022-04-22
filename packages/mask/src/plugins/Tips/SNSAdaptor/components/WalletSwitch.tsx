import { makeStyles } from '@masknet/theme'
import { Link, Switch, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { ExternalLink } from 'react-feather'
import { useEffect, useState } from 'react'
import { useWeb3State } from '@masknet/plugin-infra/web3'

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
    type: number
    address: string
    isPublic: boolean
    onChange: any
    index: number
}

export function WalletSwitch({ type, address, isPublic, onChange, index }: WalletSwitchProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { Utils } = useWeb3State() ?? {}
    const [checked, setChecked] = useState(!!isPublic)
    useEffect(() => {
        setChecked(!!isPublic)
    }, [isPublic])
    const resolveNetworkName = () => {
        return ['EVM wallet', 'Solana wallet', 'Flow wallet'][type]
    }
    const onSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.checked
        setChecked(v)
        onChange(index, v)
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
                        href={Utils?.resolveAddressLink?.(1, address) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            <div>
                <Switch checked={checked} onChange={onSwitch} />
            </div>
        </div>
    )
}
