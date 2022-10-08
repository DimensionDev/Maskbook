import { makeStyles } from '@masknet/theme'
import { Link, Switch, Typography } from '@mui/material'
import { FormattedAddress, PersonaImageIcon, WalletTypes } from '@masknet/shared'
import { useI18N } from '../../locales/index.js'
import { useState } from 'react'
import { ChainId, explorerResolver, NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    currentAccount: {
        padding: '8px',
        display: 'flex',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
        fontWeight: 700,
    },
    address: {
        fontSize: 12,
        fontWeight: 400,
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
        color: theme.palette.maskColor.second,
        height: 15,
        width: 15,
        marginTop: '1px',
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
        return [t.EVM_wallet(), t.Solana_wallet(), t.Flow_wallet()][type]
    }

    const iconURL = NETWORK_DESCRIPTORS.find((network) => network?.chainId === ChainId.Mainnet)?.icon

    const { Others } = useWeb3State(address?.platform ?? NetworkPluginID.PLUGIN_EVM)

    const onSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.checked
        if (!v) {
            setHiddenItems([...hiddenItems, address])
        } else {
            const preItems = [...hiddenItems]
            setHiddenItems(preItems?.filter((item) => !isSameAddress(item?.address, address?.address)))
        }
        setChecked(v)
    }
    return (
        <div className={classes.currentAccount}>
            <PersonaImageIcon icon={iconURL} size={30} borderRadius="99px" />
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{getWalletName()}</Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={address?.address}>
                        <FormattedAddress address={address?.address} size={4} formatter={Others?.formatAddress} />
                    </Typography>

                    <Link
                        className={classes.link}
                        href={explorerResolver.addressLink(ChainId.Mainnet, address.address) ?? ''}
                        target="_blank"
                        title={t.plugin_wallet_view_on_explorer()}
                        rel="noopener noreferrer">
                        <Icons.LinkOut className={classes.linkIcon} />
                    </Link>
                </div>
            </div>
            <div>
                <Switch checked={checked} onChange={onSwitch} />
            </div>
        </div>
    )
}
