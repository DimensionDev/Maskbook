import { makeStyles } from '@masknet/theme'
import { Link, Switch, Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { useI18N } from '../../locales'
import { ExternalLink } from 'react-feather'
import { useState } from 'react'
import { formatAddress } from '../utils'
import type { WalletTypes } from '../types'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'

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
    address: WalletTypes
    isPublic: boolean
    hiddenItems?: WalletTypes[]
    setHiddenItems: (items: WalletTypes[]) => void
}

export function WalletSwitch({ type, address, isPublic, hiddenItems = [], setHiddenItems }: WalletSwitchProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const [checked, setChecked] = useState(!!isPublic)
    const getWalletName = () => {
        return ['EVM wallet', 'Solana wallet', 'Flow wallet'][type]
    }

    const onSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.checked
        if (!v) {
            // hiddenItems.push(address)
            setHiddenItems([...hiddenItems, address])
        } else {
            const index = hiddenItems?.findIndex((item) => item?.address === address?.address)
            if (index !== -1) {
                hiddenItems.splice(index, 1)
                setHiddenItems([...hiddenItems])
            }
        }
        setChecked(v)
    }
    return (
        <div className={classes.currentAccount}>
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{getWalletName()}</Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={address?.address}>
                        <FormattedAddress address={address?.address} size={4} formatter={formatAddress} />
                    </Typography>

                    <Link
                        className={classes.link}
                        href={explorerResolver.addressLink(ChainId.Mainnet, address.address) ?? ''}
                        target="_blank"
                        title={t.plugin_wallet_view_on_explorer()}
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
