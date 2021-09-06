import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ERC721ContractDetailed, useERC721TokenDetailed } from '@masknet/web3-shared'
import { List, ListItem, ListProps, Skeleton } from '@material-ui/core'
import classnames from 'classnames'
import type { FC, HTMLProps } from 'react'

const useStyles = makeStyles()({
    list: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: 8,
    },
    nft: {
        position: 'relative',
        display: 'flex',
        width: 120,
        height: 185,
        flexDirection: 'column',
        margin: '0 auto',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.04)',
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
    },
    media: {
        height: 160,
        width: 120,
    },
    name: {
        fontSize: 12,
        padding: '2px 6px 6px',
        color: MaskColorVar.textSecondary,
    },
})

interface NftItemProps extends HTMLProps<HTMLDivElement> {
    contract: ERC721ContractDetailed | undefined
    tokenId: string
    claimed?: boolean
}

export const NftItem: FC<NftItemProps> = ({ contract, tokenId, className, claimed, ...rest }) => {
    const result = useERC721TokenDetailed(contract, tokenId)
    const { classes } = useStyles()
    if (!result.value || !contract) {
        return (
            <div className={classnames(className, classes.nft, classes.loading)} {...rest}>
                <Skeleton height={185} width={120} />
            </div>
        )
    }
    const info = result.value.info
    return (
        <div className={classnames(className, classes.nft)} {...rest}>
            <img className={classes.media} src={info.image} width="120" height="160" alt={info.name} />
            <div className={classes.name}>{info.name}</div>
            {claimed && <div className={classes.claimedBadge}>Claimed</div>}
        </div>
    )
}

interface NftListProps extends ListProps {
    contract: ERC721ContractDetailed | undefined
    statusList: boolean[]
    tokenIds: string[]
}

export const NftList: FC<NftListProps> = ({ contract, statusList, tokenIds, className, ...rest }) => {
    const { classes } = useStyles()
    return (
        <List className={classnames(className, classes.list)} {...rest}>
            {tokenIds.map((tokenId, index) => (
                <ListItem key={tokenId}>
                    <NftItem contract={contract} claimed={statusList[index]} tokenId={tokenId} />
                </ListItem>
            ))}
        </List>
    )
}
