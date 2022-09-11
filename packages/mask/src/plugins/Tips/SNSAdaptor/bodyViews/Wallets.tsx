import type { BindingProof } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Typography } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useI18N } from '../../locales/index.js'
import { DisconnectWalletDialog } from '../components/DisconnectDialog.js'
import { WalletItem } from '../components/WalletItem.js'

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
}))
interface WalletsPageProp {
    wallets: BindingProof[]
    defaultAddress?: string
    releaseLoading: boolean
    onDelete(address?: BindingProof): Promise<void>
    personaName: string | undefined
}

const WalletsPage = memo(({ wallets, defaultAddress, releaseLoading, onDelete, personaName }: WalletsPageProp) => {
    const t = useI18N()
    const [open, setOpen] = useState(false)
    const { classes } = useStyles()
    const [deletingWallet, setDeletingWallet] = useState<BindingProof>()
    const requestConfirm = useCallback((wallet: BindingProof) => {
        setDeletingWallet(wallet)
        setOpen(true)
    }, [])

    return (
        <>
            {wallets.map((x) => {
                return (
                    <WalletItem
                        key={x.identity}
                        onDelete={() => requestConfirm(x)}
                        deletable
                        fallbackName={`Wallet ${x.rawIdx ?? 0 + 1}`}
                        address={x.identity}
                        isDefault={x.identity === defaultAddress}
                    />
                )
            })}
            {!wallets.length && (
                <div className={classes.emptyBox}>
                    <Icons.EmptySimple size={36} />
                    <Typography>{t.tip_wallet_add()}</Typography>
                </div>
            )}
            <DisconnectWalletDialog
                personaName={personaName}
                confirmLoading={releaseLoading}
                onConfirmDisconnect={() => onDelete(deletingWallet)}
                address={deletingWallet?.identity}
                onClose={() => setOpen(false)}
                open={open}
            />
        </>
    )
})

export default WalletsPage
