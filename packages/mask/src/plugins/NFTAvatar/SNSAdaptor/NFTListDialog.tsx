import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, useWallets } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { useMyProfiles } from '../../../components/DataSource/useMyProfiles'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { AddressNames } from './WalletList'
import { NFTWalletConnect } from './WalletConnect'
import { NFTList } from './NFTList'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    bar: {
        alignItems: 'center',
        position: 'absolute',
        bottom: theme.spacing(2),
        display: 'flex',
    },
    info: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    add: {},
    button: {
        width: 219,
    },
}))
interface NFTListDialogProps {
    open: boolean
    onClose: () => void
}

export function NFTListDialog(props: NFTListDialogProps) {
    const account = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    const profiles = useMyProfiles()
    console.log('1111111111111111111111111')
    console.log(profiles)
    const { open, onClose } = props
    const { classes } = useStyles()
    const [selectecToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()
    const onChange = (address: string) => {
        console.log(address)
    }
    const onSelect = (token?: ERC721TokenDetailed) => {
        setSelectedToken(token)
    }
    const wallets = useWallets()
    console.log(wallets)
    return (
        <InjectedDialog title="NFT PFP" open={open} onClose={onClose}>
            <DialogContent sx={{ height: 612 }}>
                {!account ? (
                    <NFTWalletConnect />
                ) : (
                    <>
                        <AddressNames classes={{ root: classes.AddressNames }} onChange={onChange} />
                        <NFTList address={account} onSelect={onSelect} />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Typography variant="body1" color="textPrimary" sx={{ display: 'flex', flex: 1 }}>
                    Can' find it.
                    <Typography variant="body1" color="#1D9BF0">
                        Add collectibles
                    </Typography>
                </Typography>

                <Button disabled={!selectecToken} className={classes.button}>
                    Set NFT Avatar
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
