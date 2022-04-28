import { useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Button } from '@mui/material'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
    walletBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F8F7',
        padding: '20px 30px',
        borderRadius: '4px',
    },
    walletBox: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photo: {
        width: '64px',
        height: '64px',
        flex: 'none',
        borderRadius: '100%',
        objectFit: 'cover',
        backgroundColor: '#f7f7f7',
    },
    info: {
        marginLeft: '15px',
        flex: 'auto',
    },
    name: {
        color: '#000',
        fontSize: '16px',
        fontWeight: '600',
    },
    addr: {
        color: '#222',
        fontSize: '14px',
        marginTop: '6px',
    },
    changeBtn: {
        minWidth: '80px',
    },
}))

const WalletBar = () => {
    const classes = useStylesExtends(useStyles(), {})

    const [isConnect, setConnect] = useState(true)

    return (
        <div className={classes.walletBar}>
            {isConnect ? (
                <div className={classes.walletBox}>
                    <img className={classes.photo} src="#" alt="photo" />
                    <div className={classes.info}>
                        <div className={classes.name}>Milk</div>
                        <div className={classes.addr}>0x1e85...1D09</div>
                    </div>
                    <Button className={classes.changeBtn}>Change</Button>
                </div>
            ) : (
                <Button>Connect Wallet</Button>
            )}
        </div>
    )
}

export default WalletBar
