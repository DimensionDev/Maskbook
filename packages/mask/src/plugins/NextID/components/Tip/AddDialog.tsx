import { useNetworkDescriptors, Web3Plugin } from '@masknet/plugin-infra'
import { ImageIcon, InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    getERC721ContractDetailed,
    getERC721TokenDetailed,
    isSameAddress,
    useAccount,
    useChainId,
    useERC721TokenContract,
} from '@masknet/web3-shared-evm'
import { Button, DialogContent, FormControl, TextField, Typography } from '@mui/material'
import { FC, useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { createNonFungibleToken } from '../../../EVM/UI/Web3State/createNonFungibleToken'
import { useI18N } from '../../locales'

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
    onAdd?(token: Web3Plugin.NonFungibleToken): void
}

export const AddDialog: FC<Props> = ({ onAdd, onClose, ...rest }) => {
    const { classes } = useStyles()
    const chainId = useChainId()
    const account = useAccount()
    const [contractAddress, setContractAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const t = useI18N()
    const allNetworks = useNetworkDescriptors()
    const network = useMemo(() => allNetworks.find((n) => n.chainId === chainId), [allNetworks, chainId])
    const erc721TokenContract = useERC721TokenContract(contractAddress)

    const [, checkOwner] = useAsyncFn(async () => {
        if (!erc721TokenContract || !account) return false
        const ownerAddress = await erc721TokenContract.methods.ownerOf(tokenId).call()
        return isSameAddress(ownerAddress, account)
    }, [erc721TokenContract, tokenId, account])

    const [message, setMessage] = useState('')
    const reset = useCallback(() => {
        setMessage('')
        setContractAddress('')
        setTokenId('')
    }, [])
    const handleAdd = useCallback(async () => {
        if (!erc721TokenContract) return
        const hasOwnership = await checkOwner()
        if (!hasOwnership) {
            setMessage(t.tip_add_collectibles_error())
            return
        }
        const erc721ContractDetailed = await getERC721ContractDetailed(erc721TokenContract, contractAddress, chainId)
        const erc721TokenDetailed = await getERC721TokenDetailed(
            erc721ContractDetailed,
            erc721TokenContract,
            tokenId,
            chainId,
        )

        const nonFungibleToken = erc721TokenDetailed ? createNonFungibleToken(erc721TokenDetailed) : null
        if (nonFungibleToken) {
            onAdd?.(nonFungibleToken)
            reset()
        }
    }, [onAdd, t, contractAddress, tokenId])

    const handleClose = useCallback(() => {
        onClose?.()
        reset()
    }, [onClose])

    const addButton = useMemo(() => {
        return (
            <Button disabled={!contractAddress || !tokenId} className={classes.addButton} onClick={handleAdd}>
                {t.tip_add()}
            </Button>
        )
    }, [t, handleAdd])

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
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.currentTarget.value)}
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
