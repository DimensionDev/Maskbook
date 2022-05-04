import { SettingsIcon } from '@masknet/icons'
import type { BindingProof } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { SvgIconTypeMap, Typography } from '@mui/material'
import type { OverridableComponent } from '@mui/material/OverridableComponent'
import { useI18N } from '../../../../utils'
import { WalletItem } from './WalletItem'

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
    networkIcon: {
        width: 'auto',
        height: 18,
    },
}))

interface WalletsByNetworkProps {
    network: { name: string; icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> }
    toSetting: () => void
    wallets: BindingProof[]
    setAsDefault: (idx: number) => void
}

export function WalletsByNetwork({ wallets, network, toSetting, setAsDefault }: WalletsByNetworkProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const isAllHide = wallets.every((x) => !x.isPublic)
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
                    <Typography className={classes.empty}>{t('plugin_tips_empty_list')}</Typography>
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
