import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainId, formatTokenId, SchemaType } from '@masknet/web3-shared-evm'
import { List, ListItem, ListProps, Typography } from '@mui/material'
import classnames from 'classnames'
import { FC, HTMLProps, useState } from 'react'
import { useI18N } from '../../../utils'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import type { Web3Plugin } from '@masknet/plugin-infra/web3-types'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        list: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridGap: theme.spacing(1),
            [smallQuery]: {
                gridTemplateColumns: '1fr 1fr',
                gridGap: 0,
                padding: 0,
            },
        },
        listItem: {
            padding: theme.spacing(1),
        },
        nft: {
            position: 'relative',
            display: 'flex',
            width: 120,
            height: 185,
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            margin: '0 auto',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.04)',
            [smallQuery]: {
                width: 90,
                height: 140,
            },
        },
        loading: {
            boxShadow: 'none',
        },
        claimedBadge: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 36,
            margin: 'auto',
            height: 70,
            width: 70,
            borderRadius: '100%',
            backgroundColor: 'rgba(255, 95, 95, 0.4)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            pointerEvents: 'none',
            [smallQuery]: {
                height: 60,
                width: 60,
            },
        },
        media: {
            width: 120,
            height: 160,
            objectFit: 'cover',
            [smallQuery]: {
                width: 90,
                height: 120,
            },
        },
        name: {
            fontSize: 12,
            height: 18,
            textOverflow: 'ellipsis',
            textAlign: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            padding: '2px 2px 6px',
            color: MaskColorVar.textSecondary,
        },
        loadingFailImage: {
            minHeight: '0px !important',
            maxWidth: 'none',
            transform: 'translateY(-10px)',
            width: 64,
            height: 64,
        },
    }
})

interface NftItemProps extends HTMLProps<HTMLDivElement> {
    contract: Web3Plugin.NonFungibleToken<ChainId, SchemaType.ERC721>['contract']
    tokenId: string
    claimed?: boolean
    renderOrder: number
}

export const NftItem: FC<NftItemProps> = ({ contract, tokenId, className, claimed, renderOrder, ...rest }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [name, setName] = useState(formatTokenId(tokenId, 2))

    return (
        <div className={classnames(className, classes.nft)} {...rest}>
            <NFTCardStyledAssetPlayer
                classes={{
                    loadingFailImage: classes.loadingFailImage,
                }}
                tokenId={tokenId}
                renderOrder={renderOrder}
                contractAddress={contract.address}
                chainId={contract.chainId}
                setERC721TokenName={setName}
            />
            <Typography className={classes.name}>{name}</Typography>
            {claimed && <Typography className={classes.claimedBadge}>{t('plugin_red_packet_claimed')}</Typography>}
        </div>
    )
}

interface NftListProps extends ListProps {
    contract: ERC721ContractDetailed
    statusList: boolean[]
    tokenIds: string[]
}

export const NftList: FC<NftListProps> = ({ contract, statusList, tokenIds, className, ...rest }) => {
    const { classes } = useStyles()
    return (
        <List className={classnames(className, classes.list)} {...rest}>
            {tokenIds.map((tokenId, index) => (
                <ListItem className={classes.listItem} key={tokenId}>
                    <NftItem contract={contract} claimed={statusList[index]} tokenId={tokenId} renderOrder={index} />
                </ListItem>
            ))}
        </List>
    )
}
