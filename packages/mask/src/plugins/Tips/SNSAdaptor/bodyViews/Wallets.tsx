import type { BindingProof } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { DisconnectWalletDialog } from '../components/DisconnectDialog'
import { WalletCom } from '../components/WalletCom'

const useStyles = makeStyles()((theme) => ({
    emptyBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        fontSize: 14,
        color: theme.palette.text.secondary,
    },
    emptyIcon: {
        width: 36,
    },
}))
interface WalletsPageProp {
    wallets: BindingProof[]
    releaseLoading: boolean
    onRelease: (wallet?: BindingProof) => Promise<boolean>
    personaName: string | undefined
}

const WalletsPage = memo(({ wallets, releaseLoading, onRelease, personaName }: WalletsPageProp) => {
    const [open, setOpen] = useState(false)
    const { classes } = useStyles()
    const [walletToDel, setWalletToDel] = useState<BindingProof>()
    const deleteWallet = useCallback((wallet: BindingProof) => {
        setWalletToDel(wallet)
        setOpen(true)
    }, [])

    return (
        <>
            {wallets.map((x, idx) => {
                return (
                    <WalletCom
                        nowIdx={idx}
                        onDelete={() => deleteWallet(x)}
                        canDelete
                        key={idx}
                        index={x.rawIdx}
                        address={x.identity}
                        isDefault={!!x.isDefault}
                    />
                )
            })}
            {!wallets.length && (
                <div className={classes.emptyBox}>
                    <img
                        className={classes.emptyIcon}
                        src={new URL('../../assets/empty.png', import.meta.url).toString()}
                        alt=""
                    />
                    <Typography>Please add wallet</Typography>
                </div>
            )}
            <DisconnectWalletDialog
                personaName={personaName}
                confirmLoading={releaseLoading}
                onConfirmDisconnect={() => onRelease(walletToDel)}
                address={walletToDel?.identity}
                onClose={() => setOpen(false)}
                open={open}
            />
        </>
    )
})

export default WalletsPage
