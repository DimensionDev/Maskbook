import { makeStyles } from '@masknet/theme'
import { ChainId, createERC721Token, ERC721TokenDetailed, EthereumTokenType } from '@masknet/web3-shared'
import { Button, DialogContent, Typography } from '@material-ui/core'
import { useCallback, useState } from 'react'
import { InputBox } from '../../extension/options-page/DashboardComponents/InputBox'
import { SearchInput } from '../../extension/options-page/DashboardComponents/SearchInput'
import { PluginCollectibleRPC } from '../../plugins/Collectible/messages'
import { InjectedDialog } from '../shared/InjectedDialog'

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
            content: '"|"',
            marginRight: theme.spacing(0.5),
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

    const onClick = useCallback(async () => {
        if (!address) {
            setMessage('Please input contract address')
            return
        }
        if (!tokenId) {
            setMessage('Please input token ID')
            return
        }

        getNFT(address, tokenId)
            .then((token) => {
                onAddClick(token)
                onClose()
            })
            .catch((error) => setMessage(error.message))
    }, [tokenId, address, onAddClick, onClose])

    const onAddressChange = useCallback((address: string) => {
        setAddress(address)
        setMessage('')
    }, [])
    const onTokenIdChange = useCallback((tokenId: string) => {
        setTokenId(tokenId)
        setMessage('')
    }, [])

    return (
        <InjectedDialog title="Add collectibles" open={open} onClose={onClose}>
            <DialogContent>
                <Button className={classes.addNFT} variant="outlined" size="small" onClick={() => onClick()}>
                    Add
                </Button>
                <div className={classes.input}>
                    <SearchInput label="Input Contract Address" onChange={(address) => onAddressChange(address)} />
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

async function getNFT(contract: string, tokenId: string) {
    const asset = await PluginCollectibleRPC.getAsset(contract, tokenId)
    return createERC721Token(
        {
            chainId: ChainId.Mainnet,
            type: EthereumTokenType.ERC721,
            name: asset.assetContract.name,
            symbol: asset.assetContract.tokenSymbol,
            address: asset.assetContract.address,
        },
        { name: asset.name, description: asset.description, image: asset.imageUrl ?? asset.imagePreviewUrl ?? '' },
        tokenId,
    )
}
