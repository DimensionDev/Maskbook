import { SettingsIcon } from '@masknet/icons'
import type { BindingProof } from '@masknet/shared-base'
import { networkMap } from '../../hooks/useSupportedNetworks'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { WalletItem } from './WalletItem'
import type { NetworkPluginID } from '@masknet/public-api'

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
        maxHeight: 400,
        overflowY: 'auto',
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
    networkIcon: {
        width: 'auto',
        height: 18,
    },
}))

interface WalletsByNetworkProps {
    networkId: NetworkPluginID
    toSetting: () => void
    wallets: BindingProof[]
    setAsDefault: (idx: number) => void
}

export function WalletsByNetwork({ wallets, networkId, toSetting, setAsDefault }: WalletsByNetworkProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const isAllHide = wallets.every((x) => !x.isPublic)
    const network = networkMap[networkId]
    return (
        <div className={classes.container}>
            <div className={classes.topBox}>
                <Typography className={classes.commonFlexBox} sx={{ fontWeight: 'bold' }}>
                    <network.icon className={classes.networkIcon} />
                    {network.name}
                </Typography>
                <SettingsIcon onClick={toSetting} className={classes.settingIcon} />
            </div>
            <div className={classes.content}>
                {isAllHide ? (
                    <Typography className={classes.empty}>{t.tip_empty_list()}</Typography>
                ) : (
                    wallets
                        .filter((x) => x.isPublic)
                        .map((x, idx) => (
                            <WalletItem
                                key={x.identity}
                                nowIdx={idx}
                                setAsDefault={setAsDefault}
                                fallbackName={`Wallet ${x.rawIdx}`}
                                address={x.identity}
                                isDefault={!!x.isDefault}
                            />
                        ))
                )}
            </div>
        </div>
    )
}
