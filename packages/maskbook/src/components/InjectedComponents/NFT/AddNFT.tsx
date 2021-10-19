import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, useAccount } from '@masknet/web3-shared-evm'
import { Button, DialogContent, Typography } from '@material-ui/core'
import { useCallback, useState } from 'react'
import { InputBox } from '../../../extension/options-page/DashboardComponents/InputBox'
import { InjectedDialog } from '../../shared/InjectedDialog'
import { createNFT } from './utils'

const useStyles = makeStyles()((theme) => ({
    root: {},
    addNFT: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    input: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    message: {
        '&:before': {
            content: '""',
            marginRight: theme.spacing(0.5),
            borderLeft: '2px solid',
        },
    },
}))
export interface AddNFTProps {
    onClose: () => void
    onAddClick: (token: ERC721TokenDetailed) => void
    open: boolean
}
export function AddNFT(props: AddNFTProps) {
    const { classes } = useStyles()
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const [message, setMessage] = useState('')
    const { onClose, open, onAddClick } = props
    const account = useAccount()

    const onClick = useCallback(async () => {
        if (!address) {
            setMessage('Please input contract address')
            return
        }
        if (!tokenId) {
            setMessage('Please input token ID')
            return
        }

        createNFT(account, address, tokenId)
            .then((token) => {
                onAddClick(token)
                handleClose()
            })
            .catch((error) => setMessage(error.message))
    }, [tokenId, address, onAddClick, onClose])

    const onAddressChange = useCallback((address: string) => {
        setMessage('')
        setAddress(address)
    }, [])
    const onTokenIdChange = useCallback((tokenId: string) => {
        setMessage('')
        setTokenId(tokenId)
    }, [])

    const handleClose = () => {
        setMessage('')
        onClose()
    }

    return (
        <InjectedDialog title="Add collectibles" open={open} onClose={handleClose}>
            <DialogContent>
                <Button className={classes.addNFT} variant="outlined" size="small" onClick={onClick}>
                    Add
                </Button>
                <div className={classes.input}>
                    <InputBox label="Input Contract Address" onChange={(address) => onAddressChange(address)} />
                </div>
                <div className={classes.input}>
                    <InputBox label="Token ID" onChange={(tokenId) => onTokenIdChange(tokenId)} />
                </div>
                {message ? (
                    <Typography color="error" className={classes.message}>
                        {message}
                    </Typography>
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
