import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'

import type { WalletProof } from '../TipsEnteranceDialog'
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
    swtichContainer: {
        width: 'calc(50% - 6px)',
    },
}))

interface SettingPageProp {
    wallets: WalletProof[]
    onChange: any
}

const SettingPage = memo(({ wallets, onChange }: SettingPageProp) => {
    const { classes } = useStyles()
    const onSwitchChange = () => {
        console.log(wallets, 'switch')
    }
    return (
        <div className={classes.container}>
            <div className={classes.titleBox}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Tips</Typography>
                <Typography>(0/4)</Typography>
            </div>
            <div className={classes.walletSwitchBox}>
                {wallets.map((x, idx) => {
                    return (
                        <div key={idx} className={classes.swtichContainer}>
                            <WalletSwitch
                                onChange={onSwitchChange}
                                type={0}
                                address={x.identity}
                                isPublic={!!x.isPublic}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export default SettingPage
