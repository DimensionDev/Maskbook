import { makeStyles } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Button, DialogContent, InputBase, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { useAccount, useCurrentWeb3NetworkPluginID, useWeb3Connection, useWeb3Hub } from '@masknet/plugin-infra/web3'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import type { AllChainsNonFungibleToken } from '../types'

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
    onAddClick?: (token: AllChainsNonFungibleToken) => void
    open: boolean
    title?: string
    expectedPluginID: NetworkPluginID
}
export function AddNFT(props: AddNFTProps) {
    const { onClose, open, onAddClick, title, chainId, account, expectedPluginID } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const [message, setMessage] = useState('')
    const currentPluginId = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const _account = useAccount(expectedPluginID)
    const connection = useWeb3Connection<'all'>(currentPluginId, { chainId, account: account ?? _account })
    const hub = useWeb3Hub(currentPluginId, { chainId, account: account ?? _account })

    const onClick = useCallback(async () => {
        if (!address) {
            setMessage(t('nft_input_address_label'))
            return
        }
        if (!tokenId) {
            setMessage(t('nft_input_tokenid_label'))
            return
        }
        if (!hub?.getNonFungibleAsset) {
            setMessage(t('plugin_avatar_web3_error'))
            return
        }
        let token: AllChainsNonFungibleToken
        const asset = await hub.getNonFungibleAsset(address, tokenId)
        if (asset) {
            token = {
                contract: asset.contract,
                metadata: asset.metadata,
                tokenId: asset.tokenId,
                collection: asset.collection,
            } as AllChainsNonFungibleToken
        } else {
            token = await connection.getNonFungibleToken(address, tokenId)
        }
        if (!token) {
            setMessage(t('plugin_avatar_asset'))
            return
        }

        if (chainId && token && token.contract?.chainId !== chainId) {
            setMessage(t('plugin_avatar_chain_error'))
            return
        }
        if (!token || !isSameAddress(token?.metadata?.owner, account ?? _account)) {
            setMessage(t('nft_owner_hint'))
            return
        }
        onAddClick?.(token)
        handleClose()
    }, [tokenId, address, onAddClick, onClose, connection, chainId, hub, _account, account])

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
        <InjectedDialog
            title={title ?? t('nft_add_dialog_title')}
            open={open}
            onClose={handleClose}
            titleBarIconStyle="close">
            <DialogContent>
                <Button className={classes.addNFT} variant="contained" size="small" onClick={onClick}>
                    {t('nft_add_button_label')}
                </Button>
                <div className={classes.input}>
                    <InputBase
                        sx={{ width: '100%' }}
                        placeholder={t('plugin_avatar_input_token_address')}
                        onChange={(e) => onAddressChange(e.target.value)}
                    />
                </div>
                <div className={classes.input}>
                    <InputBase
                        sx={{ width: '100%' }}
                        placeholder={t('plugin_avatar_input_token_id')}
                        onChange={(e) => onTokenIdChange(e.target.value)}
                    />
                </div>
                {message ? (
                    <Typography color="error" className={classes.message} fontSize={12}>
                        {message}
                    </Typography>
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
