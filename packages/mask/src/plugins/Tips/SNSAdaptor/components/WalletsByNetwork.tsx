import type { BindingProof } from '@masknet/shared-base'
import { networkMap } from '../../hooks/useSupportedNetworks'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales'
import { WalletItem } from './WalletItem'
import { NetworkPluginID, isSameAddress } from '@masknet/web3-shared-base'

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
    link: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        cursor: 'pointer',
        marginLeft: theme.spacing(1.25),
    },
}))

interface WalletsByNetworkProps {
    networkId: NetworkPluginID
    toSetting: () => void
    wallets: Array<BindingProof & { fallbackName: string }>
    notEmpty: boolean
    defaultAddress?: string
    setAsDefault: (address: string) => void
    openConnectWallet: () => void
}

export function WalletsByNetwork({
    wallets,
    networkId,
    toSetting,
    defaultAddress,
    setAsDefault,
    openConnectWallet,
    notEmpty,
}: WalletsByNetworkProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const network = networkMap[networkId]
    return (
        <div className={classes.container}>
            <div className={classes.topBox}>
                <Typography className={classes.commonFlexBox} sx={{ fontWeight: 'bold' }}>
                    <network.icon className={classes.networkIcon} />
                    {network.name}
                </Typography>
            </div>
            <div className={classes.content}>
                {wallets.length ? (
                    wallets.map((x) => (
                        <WalletItem
                            key={x.identity}
                            setAsDefault={setAsDefault}
                            fallbackName={x.fallbackName}
                            address={x.identity}
                            isDefault={isSameAddress(defaultAddress, x.identity)}
                        />
                    ))
                ) : notEmpty ? (
                    <Typography className={classes.empty}>
                        {t.tip_empty_manage_list()}
                        <Typography component="span" className={classes.link} onClick={toSetting}>
                            {t.manage_wallet()}
                        </Typography>
                    </Typography>
                ) : (
                    <Typography className={classes.empty}>
                        {t.tip_empty_list()}
                        <Typography component="span" className={classes.link} onClick={openConnectWallet}>
                            {t.add_wallet()}
                        </Typography>
                    </Typography>
                )}
            </div>
        </div>
    )
}
