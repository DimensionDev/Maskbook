import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { AddressNames } from './WalletList'
import { useCallback, useState, useEffect } from 'react'
import { downloadUrl } from '../../../utils'
import { NFTList } from './NFTList'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { uniqBy } from 'lodash-unified'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 8,
        right: 4,
    },

    button: {
        width: 219,
    },
    actions: {
        padding: theme.spacing(0, 2, 2, 2),
    },
}))

function isSameToken(token?: ERC721TokenDetailed, tokenInfo?: TokenInfo) {
    if (!token && !tokenInfo) return false
    return isSameAddress(token?.contractDetailed.address, tokenInfo?.address) && token?.tokenId === tokenInfo?.tokenId
}
interface NFTListDialogProps {
    onNext: () => void
    tokenInfo?: TokenInfo
    wallets?: BindingProof[]
    onSelected: (info: SelectTokenInfo) => void
}

export function NFTListDialog(props: NFTListDialogProps) {
    const { onNext, wallets, onSelected, tokenInfo } = props
    const { classes } = useStyles()

    const account = useAccount()
    const [open_, setOpen_] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed>()
    const [disabled, setDisabled] = useState(false)
    const [tokens, setTokens] = useState<ERC721TokenDetailed[]>([])
    const onChange = useCallback((address: string) => {
        setSelectedAccount(address)
    }, [])

    const onSelect = (token: ERC721TokenDetailed) => {
        setSelectedToken(token)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.info?.imageURL) return
        setDisabled(true)
        const image = await downloadUrl(selectedToken.info.imageURL)
        onSelected({ image: URL.createObjectURL(image), account: selectedAccount, token: selectedToken })
        onNext()
        setDisabled(false)
    }, [selectedToken, selectedAccount])

    const onClick = useCallback(() => {
        setOpen_(true)
    }, [])

    useEffect(() => {
        setDisabled(!selectedToken || isSameToken(selectedToken, tokenInfo))
    }, [selectedToken, tokenInfo])

    useEffect(() => setSelectedAccount(account || wallets?.[0]?.identity || ''), [account, wallets])

    const onAddClick = useCallback(
        (token: ERC721TokenDetailed) =>
            setTokens((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId)),
        [tokens],
    )

    return (
        <>
            <DialogContent sx={{ height: 612 }}>
                <AddressNames
                    account={account}
                    wallets={wallets ?? []}
                    classes={{ root: classes.AddressNames }}
                    onChange={onChange}
                />
                {(account || wallets?.length) && (
                    <NFTList tokenInfo={tokenInfo} address={selectedAccount} onSelect={onSelect} tokens={tokens} />
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                    <Typography variant="body1" color="textPrimary">
                        Can' find it.
                    </Typography>
                    <Typography variant="body1" color="#1D9BF0" sx={{ cursor: 'pointer' }} onClick={onClick}>
                        Add collectibles
                    </Typography>
                </Stack>

                <Button disabled={disabled} className={classes.button} onClick={onSave}>
                    Set NFT Avatar
                </Button>
            </DialogActions>
            <AddNFT open={open_} onClose={() => setOpen_(false)} onAddClick={onAddClick} />
        </>
    )
}
