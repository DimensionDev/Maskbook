import { makeStyles } from '@masknet/theme'
import { SettingsIcon } from '@masknet/icons'
import { Typography } from '@mui/material'
import { WalletCom } from './WalletCom'
import type { BindingProof } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        boxSizing: 'border-box',
        marginBottom: theme.spacing(2.5),
    },
    topBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: theme.palette.text.primary,
        marginBottom: theme.spacing(2.5),
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    settingIcon: {
        fontSize: 16,
        cursor: 'pointer',
    },
    commonFlexBox: {
        fontSize: 14,
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
    wallets: BindingProof[]
    setAsDefault: (idx: number) => void
}

export function WalletsByNetwork({ wallets, network, toSetting, setAsDefault }: WalletsByNetworkProps) {
    const { classes } = useStyles()
    const isAllHide = wallets.reduce((res, x) => {
        if (x.isPublic) {
            res = false
        }
        return res
    }, true)
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
                    {(!isAllHide &&
                        wallets.map((x, idx) => {
                            return (
                                (x.isPublic && (
                                    <WalletCom
                                        setAsDefault={setAsDefault}
                                        key={idx}
                                        index={x.rawIdx}
                                        address={x.identity}
                                        isDefault={!!x.isDefault}
                                    />
                                )) ||
                                null
                            )
                        })) || <Typography className={classes.empty}>Please set wallets to receive tips.</Typography>}
                </div>
            )}
        </div>
    )
}
