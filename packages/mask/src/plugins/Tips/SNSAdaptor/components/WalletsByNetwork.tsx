import { getMaskColor, makeStyles } from '@masknet/theme'
import { SettingsIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { WalletCom } from './WalletCom'
import type { WalletProof } from '../TipsEntranceDialog'

const useStyles = makeStyles()((theme) => ({
    container: {
        boxSizing: 'border-box',
        marginBottom: theme.spacing(2.5),
    },
    topBox: {
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
    wallets: WalletProof[]
    setAsDefault: (idx: number) => void
}

export function WalletsByNetwork({ wallets, network, toSetting, setAsDefault }: WalletsByNetworkProps) {
    const { classes } = useStyles()

    return (
        <div className={classes.container}>
            <div className={classes.topBox}>
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
                            return (
                                <WalletCom
                                    setAsDefault={setAsDefault}
                                    key={idx}
                                    index={idx}
                                    address={x.identity}
                                    isDefault={!!x.isDefault}
                                />
                            )
                        })) || <Typography className={classes.empty}>No connected or verified wallets.</Typography>}
                </div>
            )}
        </div>
    )
}
