import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { ERC721TokenDetailed, isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { downloadUrl } from '../../../utils'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import type { BindingProof } from '@masknet/shared-base'
import type { SelectTokenInfo, TokenInfo } from '../types'
import { uniqBy } from 'lodash-unified'
import { useI18N } from '../locales'
import { AddressNames } from './WalletList'
import { NFTList } from './NFTList'
import { Application_NFT_LIST_PAGE } from '../constants'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 10,
        right: 10,
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
    const t = useI18N()
    const [tokens, setTokens] = useState<ERC721TokenDetailed[]>([])
    const [currentPage, setCurrentPage] = useState<Application_NFT_LIST_PAGE>(
        Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
    )
    const { showSnackbar } = useCustomSnackbar()
    const onChange = useCallback((address: string) => {
        setSelectedAccount(address)
    }, [])

    const onSelect = (token: ERC721TokenDetailed) => {
        setSelectedToken(token)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.info?.imageURL) return
        setDisabled(true)
        try {
            const image = await downloadUrl(selectedToken.info.imageURL)
            onSelected({ image: URL.createObjectURL(image), account: selectedAccount, token: selectedToken })
            onNext()
            setDisabled(false)
        } catch (error) {
            console.log(error)
        }
        setDisabled(false)
    }, [selectedToken, selectedAccount])

    const onClick = useCallback(() => {
        if (!account && !wallets?.length) {
            showSnackbar('Please connect your wallet!', { variant: 'error' })
            return
        }
        setOpen_(true)
    }, [account, wallets, showSnackbar])

    useEffect(() => {
        setDisabled(!selectedToken || isSameToken(selectedToken, tokenInfo))
    }, [selectedToken, tokenInfo])

    useEffect(() => setSelectedAccount(account || wallets?.[0]?.identity || ''), [account, wallets])

    const onAddClick = useCallback(
        (token: ERC721TokenDetailed) =>
            setTokens((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId)),
        [tokens],
    )

    const onChangePage = (name: Application_NFT_LIST_PAGE) => {
        setCurrentPage(name)
    }
    return (
        <>
            <DialogContent sx={{ height: 612, padding: 0 }}>
                <AddressNames
                    account={account}
                    wallets={wallets ?? []}
                    classes={{ root: classes.AddressNames }}
                    onChange={onChange}
                />
                {(account || Boolean(wallets?.length)) && (
                    <NFTList
                        tokenInfo={tokenInfo}
                        address={selectedAccount}
                        onSelect={onSelect}
                        onChangePage={onChangePage}
                        tokens={tokens}
                    />
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                {currentPage === Application_NFT_LIST_PAGE.Application_nft_tab_eth_page ? (
                    <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                        <Typography variant="body1" color="textPrimary">
                            {t.collectible_not_found()}
                        </Typography>
                        <Typography variant="body1" color="#1D9BF0" sx={{ cursor: 'pointer' }} onClick={onClick}>
                            {t.add_collectible()}
                        </Typography>
                    </Stack>
                ) : null}

                <Button disabled={disabled} className={classes.button} onClick={onSave}>
                    {t.set_avatar_title()}
                </Button>
            </DialogActions>
            <AddNFT title={t.add_collectible()} open={open_} onClose={() => setOpen_(false)} onAddClick={onAddClick} />
        </>
    )
}
