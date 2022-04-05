import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'

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

const SettingPage = memo(() => {
    const { classes } = useStyles()
    const mapList = [
        { type: 0, address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isOpen: true },
        { type: 0, address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isOpen: false },
        { type: 0, address: '0x2EC8EBB0a8eAa40e4Ce620CF9f84A96dF68D4669', isOpen: false },
    ]
    return (
        <div className={classes.container}>
            <div className={classes.titleBox}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Tips</Typography>
                <Typography>(0/4)</Typography>
            </div>
            <div className={classes.walletSwitchBox}>
                {mapList.map((x, idx) => {
                    return (
                        <div key={idx} className={classes.swtichContainer}>
                            <WalletSwitch type={x.type} address={x.address} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export default SettingPage
