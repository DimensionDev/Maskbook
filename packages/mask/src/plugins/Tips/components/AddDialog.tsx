import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useChainContext, useNetworkDescriptors, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { useERC721TokenContract } from '@masknet/web3-hooks-evm'
import { ImageIcon, InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Button, DialogContent, FormControl, InputBase, Typography } from '@mui/material'
import { useI18N } from '../locales/index.js'

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
    onAdd?(token: NonFungibleToken<ChainId, SchemaType>): void
}

export const AddDialog: FC<Props> = ({ onAdd, onClose, ...rest }) => {
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [contractAddress, setContractAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const web3Connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const t = useI18N()
    const allNetworks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)
    const network = useMemo(() => allNetworks.find((n) => n.chainId === chainId), [allNetworks, chainId])
    const erc721TokenContract = useERC721TokenContract(chainId, contractAddress)

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

    useEffect(() => {
        setMessage('')
    }, [tokenId, contractAddress])

    const [state, handleAdd] = useAsyncFn(async () => {
        if (!erc721TokenContract || !EthereumAddress.isValid(contractAddress)) {
            setMessage(t.tip_add_collectibles_error())
            return
        }

        const hasOwnership = await checkOwner()
        if (!hasOwnership) {
            setMessage(t.tip_add_collectibles_error())
            return
        }
        const erc721TokenDetailed = await web3Connection?.getNonFungibleToken(
            contractAddress,
            tokenId,
            SchemaType.ERC721,
            {
                chainId,
                account,
            },
        )

        if (!erc721TokenDetailed) {
            setMessage(t.tip_add_collectibles_error())
            return
        }
        await Token?.addToken?.(account, erc721TokenDetailed)
        onAdd?.(erc721TokenDetailed)
        reset()
    }, [onAdd, t, contractAddress, tokenId, account, chainId])

    const handleClose = useCallback(() => {
        onClose?.()
        reset()
    }, [onClose])

    const addButton = useMemo(() => {
        return (
            <Button
                disabled={!contractAddress || !tokenId || state.loading}
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
                    <InputBase
                        fullWidth
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.currentTarget.value)}
                        placeholder={t.tip_add_collectibles_contract_address()}
                    />
                </FormControl>
                <FormControl fullWidth className={classes.row}>
                    <InputBase
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
