import { makeStyles } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Button, DialogContent, InputBase, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../locales'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useWeb3Connection,
    useWeb3Hub,
} from '@masknet/plugin-infra/web3'
import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'

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
    onAddClick?: (token: NonFungibleToken<ChainId, SchemaType>) => void
    open: boolean
    title?: string
    expectedPluginID: NetworkPluginID
}
export function AddNFT(props: AddNFTProps) {
    const { onClose, open, onAddClick, title, chainId, account, expectedPluginID } = props
    const t = useI18N()
    const { classes } = useStyles()
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const [message, setMessage] = useState('')
    const [checking, toggleChecking] = useState(false)
    const currentPluginId = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const _account = useAccount(expectedPluginID, account)
    const currentChainId = useChainId(expectedPluginID, chainId)
    const hub = useWeb3Hub(currentPluginId, { chainId: currentChainId, account: _account })
    const connection = useWeb3Connection(currentPluginId)

    const onClick = useCallback(async () => {
        if (!address) {
            setMessage(t.nft_input_address_label())
            return
        }
        if (!tokenId) {
            setMessage(t.nft_input_tokenid_label())
            return
        }
        if (!hub?.getNonFungibleAsset) {
            setMessage(t.plugin_avatar_web3_error())
            return
        }

        toggleChecking(true)

        try {
            const asset = await hub.getNonFungibleAsset(address, tokenId, { chainId: currentChainId })

            const token = await connection?.getNonFungibleToken(address ?? '', tokenId, undefined, {
                chainId: currentChainId,
            })

            const tokenDetailed = { ...(token ?? {}), ...(asset ?? {}) }

            if (!tokenDetailed) {
                setMessage(t.plugin_avatar_asset())
                toggleChecking(false)
                return
            }

            if (tokenDetailed?.contract?.chainId && tokenDetailed?.contract?.chainId !== currentChainId) {
                setMessage(t.plugin_avatar_chain_error())
                toggleChecking(false)
                return
            }

            const isOwner = await connection?.getNonFungibleTokenOwnership(address, tokenId, _account, undefined, {
                chainId: currentChainId,
            })

            if (!isOwner) {
                setMessage(t.nft_owner_hint())
                toggleChecking(false)
                return
            }

            onAddClick?.(tokenDetailed as NonFungibleToken<ChainId, SchemaType>)
            toggleChecking(false)
            handleClose()
        } catch {
            setMessage(t.plugin_avatar_asset())
            toggleChecking(false)
            return
        }
    }, [tokenId, address, onAddClick, onClose, currentChainId, hub, _account, connection])

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
            title={title ?? t.nft_add_dialog_title()}
            open={open}
            onClose={handleClose}
            titleBarIconStyle="close">
            <DialogContent>
                <Button className={classes.addNFT} size="small" disabled={checking} onClick={onClick}>
                    {checking ? t.nft_add_button_label_checking() : t.nft_add_button_label()}
                </Button>
                <div className={classes.input}>
                    <InputBase
                        // Workaround for pure-react-carousel bug:
                        // https://stackoverflow.com/questions/70434847/not-able-to-type-anything-in-input-field-inside-pure-react-carousel
                        onClick={(e) => e.currentTarget.getElementsByTagName('input')[0].focus()}
                        sx={{ width: '100%' }}
                        placeholder={t.plugin_avatar_input_token_address()}
                        onChange={(e) => onAddressChange(e.target.value)}
                    />
                </div>
                <div className={classes.input}>
                    <InputBase
                        onClick={(e) => e.currentTarget.getElementsByTagName('input')[0].focus()}
                        sx={{ width: '100%' }}
                        placeholder={t.plugin_avatar_input_token_id()}
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
