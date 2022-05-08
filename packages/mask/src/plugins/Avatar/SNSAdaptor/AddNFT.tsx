import { makeStyles } from '@masknet/theme'
import { ChainId, ERC721TokenDetailed, isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import { Button, DialogContent, InputBase, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { createNFT } from '../utils'
import { WalletRPC } from '../../Wallet/messages'

const useStyles = makeStyles()((theme) => ({
    root: {},
    addNFT: {
        position: 'absolute',
        right: 20,
        top: 10,
    },
    input: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        display: 'block',
        width: '100%',
        border: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        alignItems: 'center',
        padding: theme.spacing(1),
        boxSizing: 'border-box',
        borderRadius: 8,
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
    account?: string
    onClose: () => void
    chainId?: ChainId
    onAddClick?: (token: ERC721TokenDetailed) => void
    open: boolean
    title?: string
}
export function AddNFT(props: AddNFTProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const [message, setMessage] = useState('')
    const { onClose, open, onAddClick, title, chainId, account } = props
    const _account = useAccount()

    const onClick = useCallback(async () => {
        if (!address) {
            setMessage(t('nft_input_address_label'))
            return
        }
        if (!tokenId) {
            setMessage(t('nft_input_tokenid_label'))
            return
        }

        createNFT(address, tokenId, chainId)
            .then(async (token) => {
                if (chainId && token && token.contractDetailed.chainId !== chainId) {
                    setMessage('chain does not match.')
                    return
                }
                if (!token || !isSameAddress(token?.info.owner, account ?? _account)) {
                    setMessage(t('nft_owner_hint'))
                    return
                }
                await WalletRPC.addToken(token)
                onAddClick?.(token)
                handleClose()
            })
            .catch((error) => setMessage(t('nft_owner_hint')))
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
        <InjectedDialog title={title ?? t('nft_add_dialog_title')} open={open} onClose={handleClose}>
            <DialogContent>
                <Button className={classes.addNFT} variant="contained" size="small" onClick={onClick}>
                    {t('nft_add_button_label')}
                </Button>
                <div className={classes.input}>
                    <InputBase
                        sx={{ width: '100%' }}
                        placeholder="Input Contract Address"
                        onChange={(e) => onAddressChange(e.target.value)}
                    />
                </div>
                <div className={classes.input}>
                    <InputBase
                        sx={{ width: '100%' }}
                        placeholder="Token ID"
                        onChange={(e) => onTokenIdChange(e.target.value)}
                    />
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
