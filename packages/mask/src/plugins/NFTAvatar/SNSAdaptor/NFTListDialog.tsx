import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, useAccount } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { AddressNames } from './WalletList'
import { useCallback, useState } from 'react'
import { UploadAvatarDialog } from './UploadAvatarDialog'
import { InjectedDialog } from '@masknet/shared'
import { downloadUrl } from '../../../utils'
import { NFTList } from './NFTList'
import { usePersonas } from '../hooks/usePersonas'
import { NextIDPlatform } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 8,
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
    const { open, onClose } = props
    const { classes } = useStyles()

    const { binds, isOwner, loading } = usePersonas()
    const wallets = binds?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
    const account = useAccount()

    const [selectedAccount, setSelectedAccount] = useState('')
    const [openEditProfile, setOpenEditProfile] = useState(false)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()
    const [image, setImage] = useState('')
    const onChange = (address: string) => {
        console.log(address)
        setSelectedAccount(address)
    }
    const onSelect = (token: ERC721TokenDetailed) => {
        setSelectedToken(token)
    }
    const onSave = useCallback(async () => {
        if (!selectedToken || !selectedToken.info.imageURL) return
        const image = await downloadUrl(selectedToken.info.imageURL)
        setOpenEditProfile(true)
        setImage(URL.createObjectURL(image))
    }, [selectedToken])

    return (
        <>
            <InjectedDialog title="NFT PFP" open={open} onClose={onClose}>
                <DialogContent sx={{ height: 612 }}>
                    <AddressNames classes={{ root: classes.AddressNames }} onChange={onChange} />
                    {(account || wallets?.length) && <NFTList address={selectedAccount} onSelect={onSelect} />}
                </DialogContent>
                <DialogActions>
                    <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                        <Typography variant="body1" color="textPrimary">
                            Can' find it.
                        </Typography>
                        <Typography variant="body1" color="#1D9BF0">
                            Add collectibles
                        </Typography>
                    </Stack>

                    <Button disabled={!selectedToken} className={classes.button} onClick={onSave}>
                        Set NFT Avatar
                    </Button>
                </DialogActions>
            </InjectedDialog>
            <UploadAvatarDialog
                token={selectedToken}
                account={selectedAccount}
                open={openEditProfile}
                onClose={() => setOpenEditProfile(false)}
                image={image}
            />
        </>
    )
}
