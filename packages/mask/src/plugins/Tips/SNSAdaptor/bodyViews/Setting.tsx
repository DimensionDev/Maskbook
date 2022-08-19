import { memo } from 'react'
import type { BindingProof } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { WalletSwitch } from '../components/WalletSwitch'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
    publicAddresses: string[]
    onSwitchChange(address: string, v: boolean): void
}

const SettingPage = memo(({ wallets, publicAddresses, onSwitchChange }: SettingPageProp) => {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.titleBox}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Tips</Typography>
                <Typography>
                    ({publicAddresses.length}/{wallets.length})
                </Typography>
            </div>
            <div className={classes.walletSwitchBox}>
                {wallets.map((x) => {
                    return (
                        <div key={x.identity} className={classes.switchContainer}>
                            <WalletSwitch
                                chainId={ChainId.Mainnet}
                                type={NetworkPluginID.PLUGIN_EVM}
                                address={x.identity}
                                isPublic={publicAddresses.includes(x.identity)}
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
