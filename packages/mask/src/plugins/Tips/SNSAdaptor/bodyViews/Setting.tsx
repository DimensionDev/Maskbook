import { memo } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { WalletSwitch } from '../components/WalletSwitch'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
    },
    titleBox: {
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        marginBottom: 16,
    },
    walletSwitchBox: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
    },
    switchContainer: {
        width: 'calc(50% - 6px)',
    },
}))

interface SettingPageProp {
    wallets: BindingProof[]
    onSwitchChange(idx: number, v: boolean): void
}

const SettingPage = memo(({ wallets, onSwitchChange }: SettingPageProp) => {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.titleBox}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Tips</Typography>
                <Typography>
                    ({wallets.filter((x) => x.isPublic === 1).length}/{wallets.length})
                </Typography>
            </div>
            <div className={classes.walletSwitchBox}>
                {wallets.map((x, idx) => {
                    return (
                        <div key={idx} className={classes.switchContainer}>
                            <WalletSwitch
                                chainId={ChainId.Mainnet}
                                type={NetworkPluginID.PLUGIN_EVM}
                                index={idx}
                                address={x.identity}
                                isPublic={!!x.isPublic}
                                onChange={onSwitchChange}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export default SettingPage
