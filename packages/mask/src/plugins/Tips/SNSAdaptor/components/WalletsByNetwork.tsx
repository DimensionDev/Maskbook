import { getMaskColor, makeStyles } from '@masknet/theme'
import { SettingsIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { WalletCom } from './WalletCom'

const useStyles = makeStyles()((theme) => ({
    container: {
        boxSizing: 'border-box',
        marginBottom: theme.spacing(2.5),
    },
    topbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: getMaskColor(theme).main,
        marginBottom: theme.spacing(2.5),
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    settingIcon: {
        fontSize: '18px',
        cursor: 'pointer',
    },
    commonFlexBox: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    empty: {
        height: '100px',
        fontSize: 14,
        color: theme.palette.text.secondary,
        lineHeight: '100px',
        textAlign: 'center',
    },
}))

interface WalletsByNetworkProps {
    network: any
    toSetting: any
}

export function WalletsByNetwork({ network, toSetting }: WalletsByNetworkProps) {
    const { classes } = useStyles()
    const wallets = [
        { name: '0xbilly', address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isDefault: true },
        { name: '0xbilly', address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isDefault: false },
        { name: '0xbilly', address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isDefault: false },
    ]
    return (
        <div className={classes.container}>
            <div className={classes.topbar}>
                <Typography className={classes.commonFlexBox} sx={{ fontWeight: 'bold' }}>
                    <img style={{ height: 18 }} src={network.icon.toString()} />
                    {network.name}
                </Typography>
                <SettingsIcon onClick={toSetting} className={classes.settingIcon} />
            </div>
            {network.isEvm && (
                <div className={classes.content}>
                    {(wallets.length &&
                        wallets.map((x, idx) => {
                            return <WalletCom key={idx} name={x.name} address={x.address} isDefault={x.isDefault} />
                        })) || <Typography className={classes.empty}>No connected or verified wallets.</Typography>}
                </div>
            )}
        </div>
    )
}
