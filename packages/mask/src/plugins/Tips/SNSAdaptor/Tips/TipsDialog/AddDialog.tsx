import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptors,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { ImageIcon, InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Button, DialogContent, FormControl, TextField, Typography } from '@mui/material'
import { useI18N } from '../../../locales/index.js'
import { TipsContext } from '../../Context/TipsContext.js'

const useStyles = makeStyles()((theme) => ({
    addButton: {
        marginLeft: 'auto',
    },
    chain: {
        display: 'flex',
    },
    row: {
        marginTop: theme.spacing(1.5),
    },
    chainName: {
        marginLeft: theme.spacing(1),
    },
    error: {
        display: 'flex',
        height: 16,
        alignItems: 'center',
        color: theme.palette.error.main,
        '&::before': {
            backgroundColor: theme.palette.error.main,
            content: '""',
            width: 2,
            height: 16,
            marginRight: theme.spacing(0.5),
        },
    },
}))

interface Props extends InjectedDialogProps {
    onAdd?(token: Web3Helper.NonFungibleTokenScope<'all'>): void
}

export const AddDialog: FC<Props> = ({ onAdd, onClose, ...rest }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const { Token } = useWeb3State()
    const allNetworks = useNetworkDescriptors(pluginID)
    const [tokenId, setTokenId] = useState('')
    const [tokenAddress, setTokenAddress] = useState('')
    const network = useMemo(() => allNetworks.find((n) => n.chainId === chainId), [allNetworks, chainId])
    const { nonFungibleToken, nonFungibleTokenContract, nonFungibleTokenOwnership } = useContext(TipsContext)

    const [message, setMessage] = useState('')
    const reset = useCallback(() => {
        setMessage('')
        setTokenAddress('')
        setTokenId('')
    }, [])

    useEffect(() => {
        setMessage('')
    }, [tokenId, tokenAddress])

    const [state, handleAdd] = useAsyncFn(async () => {
        if (!nonFungibleTokenContract) {
            setMessage(t.tip_add_collectibles_error())
            return
        }
        if (!nonFungibleTokenOwnership) {
            setMessage(t.tip_add_collectibles_error())
            return
        }
        if (!nonFungibleToken) {
            setMessage(t.tip_add_collectibles_error())
            return
        }
        await Token?.addToken?.(account, nonFungibleToken)
        onAdd?.(nonFungibleToken)
        reset()
    }, [onAdd, t, account, nonFungibleToken, nonFungibleTokenContract, nonFungibleTokenOwnership])

    const handleClose = useCallback(() => {
        onClose?.()
        reset()
    }, [onClose])

    const addButton = useMemo(() => {
        return (
            <Button
                disabled={!tokenAddress || !tokenId || state.loading}
                className={classes.addButton}
                onClick={handleAdd}>
                {state.loading ? t.tip_adding() : t.tip_add()}
            </Button>
        )
    }, [t, handleAdd, state.loading])

    if (!network) return null

    return (
        <InjectedDialog title={t.tip_add_collectibles()} titleTail={addButton} onClose={handleClose} {...rest}>
            <DialogContent>
                <div className={classes.chain}>
                    <ImageIcon size={24} icon={network.icon || ''} />
                    <Typography className={classes.chainName}>{network.name}</Typography>
                </div>
                <FormControl fullWidth className={classes.row}>
                    <TextField
                        fullWidth
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.currentTarget.value)}
                        placeholder={t.tip_add_collectibles_contract_address()}
                    />
                </FormControl>
                <FormControl fullWidth className={classes.row}>
                    <TextField
                        fullWidth
                        value={tokenId}
                        onChange={(e) => setTokenId(e.currentTarget.value)}
                        placeholder={t.tip_add_collectibles_token_id()}
                    />
                </FormControl>
                {message ? (
                    <FormControl fullWidth className={classes.row}>
                        <Typography className={classes.error}>{message}</Typography>
                    </FormControl>
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
