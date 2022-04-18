import { Card, Typography, Link, Box } from '@mui/material'
import { LinkOutIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import {
    useCollectibles,
    useCollections,
    ChainId,
    ERC721ContractDetailed,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { useMemo, useState } from 'react'
import { useI18N } from '../../locales'
import { ImageIcon } from './ImageIcon'
import { uniqBy } from 'lodash-unified'
import { RSS3 } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

const useStyles = makeStyles()((theme) => {
    console.log({ theme })
    return {
        wrapper: {},

        walletInfo: {
            display: 'flex',
            alignItems: 'center',
        },
        walletName: {
            fontSize: '16px',
            fontWeight: 400,
            marginLeft: '4px',
        },
        collectionWrap: {
            width: '90px',
            height: '90px',
            borderRadius: '12px',
            marginTop: '12px',
            marginRight: '5px',
            border: `1px solid ${theme.palette.divider}`,
            background: 'rgba(229,232,235,1)',
            cursor: 'pointer',
            '&:nth-child(5n)': {
                marginRight: 0,
            },
        },
        link: {
            cursor: 'pointer',
            lineHeight: '10px',
            marginTop: 2,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        linkIcon: {
            fill: 'none',
            width: 12,
            height: 12,
            marginLeft: theme.spacing(0.5),
        },
    }
})

export interface WalletAssetsCardProps extends withClasses<never | 'root'> {
    networkIcon?: URL
    address: string
    onSetting: () => void
}

export function WalletAssetsCard(props: WalletAssetsCardProps) {
    // const { avatar, nickName = 'unknown', platformId = 'unknown', isCurrent = false, openImageSetting } = props
    const { networkIcon, address, onSetting } = props
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [open, setOpen] = useState(false)
    // const {value} = useAsyncRetry(async()=>{
    //     return usePersonaBoundPlatform
    // },[])

    const { value: nameInfo } = useAsyncRetry(async () => {
        return RSS3.getNameInfo(address)
    }, [address])
    console.log({ nameInfo, address })

    const chainId = ChainId.Mainnet
    const { data: collectionsFormRemote } = useCollections(address, chainId)
    const {
        data: collectibles,
        state: loadingCollectibleDone,
        retry: retryFetchCollectible,
    } = useCollectibles(address, chainId)
    // const isLoading = loadingCollectibleDone !== SocketState.done
    // const renderWithRarible = useMemo(() => {
    //     if (isLoading) return []
    //     return collectibles.filter((item) => !item.collection)
    // }, [collectibles?.length])
    const collections = useMemo(() => {
        return uniqBy(
            collectibles.map((x) => x.contractDetailed),
            (x) => x.address.toLowerCase(),
        )
            .map((x) => {
                const item = collectionsFormRemote.find((c) => isSameAddress(c.address, x.address))
                if (item) {
                    return {
                        name: item.name,
                        symbol: item.name,
                        baseURI: item.iconURL,
                        iconURL: item.iconURL,
                        address: item.address,
                    } as ERC721ContractDetailed
                }
                return x
            })
            .filter((collection) => collection?.iconURL)
    }, [collectibles.length, collectionsFormRemote.length])
    console.log('assetsCollection', collections)

    return (
        <Card className={classes.wrapper}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={classes.walletInfo}>
                        <ImageIcon
                            icon={new URL('../assets/ethereum.png', import.meta.url)}
                            size={20}
                            borderRadius="0"
                        />
                        <Typography className={classes.walletName}>{nameInfo?.ensName}</Typography>
                        <Link
                            className={classes.link}
                            href="https://etherscan.io/address/0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41#code"
                            target="_blank"
                            rel="noopener noreferrer">
                            <LinkOutIcon className={classes.linkIcon} />
                        </Link>
                    </div>
                    <div onClick={() => onSetting()}>
                        <ImageIcon size={20} icon={new URL('../assets/settingIcon.png', import.meta.url)} />
                    </div>
                </div>
            </div>

            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {collections?.slice(0, 10)?.map((collection, i) => (
                    <div key={i} className={classes.collectionWrap}>
                        <ImageIcon size={89} borderRadius="12px" icon={collection?.iconURL} />
                    </div>
                ))}
            </Box>
        </Card>
    )
}
