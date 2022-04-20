import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'

import type { WalletProof } from '../TipsEntranceDialog'
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
    wallets: WalletProof[]
    onSwitchChange: (idx: number, v: boolean) => void
}

const SettingPage = memo(({ wallets, onSwitchChange }: SettingPageProp) => {
    const { classes } = useStyles()
    const [data, setData] = useState<WalletProof[]>([])
    useEffect(() => {
        setData(wallets)
        console.log(wallets, 'fff')
    }, [wallets])
    const publicNum = wallets.reduce((num, x) => {
        if (x.isPublic === 1) {
            num += 1
        }
        return num
    }, 0)
    return (
        <div className={classes.container}>
            <div className={classes.titleBox}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Tips</Typography>
                <Typography>
                    ({publicNum}/{wallets.length})
                </Typography>
            </div>
            <div className={classes.walletSwitchBox}>
                {data.map((x, idx) => {
                    return (
                        <div key={idx} className={classes.switchContainer}>
                            <WalletSwitch
                                index={idx}
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
