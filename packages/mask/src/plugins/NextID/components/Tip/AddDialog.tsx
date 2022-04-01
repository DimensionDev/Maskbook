import { useNetworkDescriptors, Web3Plugin } from '@masknet/plugin-infra'
import { ImageIcon, InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    isSameAddress,
    useAccount,
    useChainId,
    useERC721ContractDetailed,
    useERC721TokenContract,
    useERC721TokenDetailed,
} from '@masknet/web3-shared-evm'
import { Button, DialogContent, FormControl, TextField, Typography } from '@mui/material'
import { FC, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
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

export const AddDialog: FC<Props> = ({ onAdd, ...rest }) => {
    const { classes } = useStyles()
    const chainId = useChainId()
    const account = useAccount()
    const [contractAddress, setContractAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const t = useI18N()
    const allNetworks = useNetworkDescriptors()
    const network = useMemo(() => allNetworks.find((n) => n.chainId === chainId), [allNetworks, chainId])
    const contract = useERC721TokenContract(contractAddress)
    const { value: isMine, loading: isChecking } = useAsync(async () => {
        console.log('contract', contract)
        if (!contract || !account) return false
        const ownerAddress = await contract.methods.ownerOf(tokenId).call()
        console.log('ownerAddress', ownerAddress)
        return isSameAddress(ownerAddress, account)
    }, [contract, tokenId, account])

    const isStable = !isChecking && !!contractAddress && !!tokenId
    const { value: detailedContract } = useERC721ContractDetailed(contractAddress)
    const { tokenDetailed } = useERC721TokenDetailed(detailedContract, tokenId)
    const nonFungibleToken = useMemo(
        () => (tokenDetailed ? createNonFungibleToken(tokenDetailed) : null),
        [tokenDetailed],
    )

    const addButton = useMemo(() => {
        return (
            <Button
                disabled={!isMine}
                className={classes.addButton}
                onClick={() => {
                    if (!nonFungibleToken) return
                    onAdd?.(nonFungibleToken)
                }}>
                {t.tip_add()}
            </Button>
        )
    }, [t, isMine, nonFungibleToken])

    if (!network) return null
    return (
        <InjectedDialog title={t.tip_add_collectibles()} titleTail={addButton} {...rest}>
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
                {isStable && !isMine ? (
                    <FormControl fullWidth className={classes.row}>
                        <Typography className={classes.error}>{t.tip_add_collectibles_error()}</Typography>
                    </FormControl>
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
