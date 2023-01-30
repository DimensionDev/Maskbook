import { useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Button, DialogContent, InputBase, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useChainContext, useNetworkContext, useWeb3Connection, useWeb3Hub } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { AllChainsNonFungibleToken } from '../types.js'
import { useI18N } from '../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    addNFT: {
        position: 'absolute',
        right: 20,
        top: 10,
    },
    input: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),

        boxSizing: 'border-box',
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
    expectedPluginID: NetworkPluginID
    account?: string
    chainId?: ChainId
    open: boolean
    title?: string
    onClose: () => void
    onAddClick?: (token: AllChainsNonFungibleToken) => void
}
export function AddNFT(props: AddNFTProps) {
    const { onClose, open, onAddClick, title, chainId, account, expectedPluginID } = props
    const t = useI18N()
    const { classes } = useStyles()
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const [message, setMessage] = useState('')
    const [checking, toggleChecking] = useState(false)
    const { pluginID } = useNetworkContext(expectedPluginID)
    const { account: _account, chainId: _chainId } = useChainContext({ account, chainId })
    const hub = useWeb3Hub(pluginID, { chainId: _chainId, account: _account })
    const connection = useWeb3Connection(pluginID)

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
        let tokenDetailed

        try {
            const asset = await hub.getNonFungibleAsset(address, tokenId, { chainId: _chainId })

            const token = await connection?.getNonFungibleToken(address ?? '', tokenId, undefined, {
                chainId: _chainId,
            })

            tokenDetailed = { ...(token ?? {}), ...(asset ?? {}) }

            if (!tokenDetailed) {
                setMessage(t.plugin_avatar_asset())
                toggleChecking(false)
                return
            }

            if (tokenDetailed?.contract?.chainId && tokenDetailed?.contract?.chainId !== _chainId) {
                setMessage(t.plugin_avatar_chain_error())
                toggleChecking(false)
                return
            }

            const isOwner = await connection?.getNonFungibleTokenOwnership(address, tokenId, _account, undefined, {
                chainId: _chainId,
            })

            if (!isOwner) {
                setMessage(t.nft_owner_hint())
                toggleChecking(false)
                return
            }

            onAddClick?.(tokenDetailed as AllChainsNonFungibleToken)
            toggleChecking(false)
            handleClose()
        } catch {
            setMessage(t.plugin_avatar_asset())
            toggleChecking(false)
            return
        }
    }, [tokenId, address, onAddClick, onClose, _chainId, hub, _account, connection])

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
            title={title ?? t.add_collectible()}
            open={open}
            onClose={handleClose}
            titleBarIconStyle="close">
            <DialogContent>
                <Button className={classes.addNFT} size="small" disabled={checking} onClick={onClick}>
                    {checking ? t.nft_add_button_label_checking() : t.nft_add_button_label()}
                </Button>

                <InputBase
                    // Workaround for pure-react-carousel bug:
                    // https://stackoverflow.com/questions/70434847/not-able-to-type-anything-in-input-field-inside-pure-react-carousel
                    onClick={(e) => e.currentTarget.getElementsByTagName('input')[0].focus()}
                    fullWidth
                    className={classes.input}
                    placeholder={t.plugin_avatar_input_token_address()}
                    onChange={(e) => onAddressChange(e.target.value)}
                />

                <InputBase
                    onClick={(e) => e.currentTarget.getElementsByTagName('input')[0].focus()}
                    fullWidth
                    className={classes.input}
                    placeholder={t.plugin_avatar_input_token_id()}
                    onChange={(e) => onTokenIdChange(e.target.value)}
                />

                {message ? (
                    <Typography color="error" className={classes.message} fontSize={12}>
                        {message}
                    </Typography>
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
