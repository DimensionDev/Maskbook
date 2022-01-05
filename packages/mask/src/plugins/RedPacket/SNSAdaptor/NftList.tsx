import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ERC721ContractDetailed, useERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { List, ListItem, ListProps, Skeleton, Typography } from '@mui/material'
import classnames from 'classnames'
import type { FC, HTMLProps } from 'react'
import { useI18N } from '../../../utils'
// import { NftImage } from './NftImage'

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
            textOverflow: 'ellipsis',
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
    contract: ERC721ContractDetailed | undefined
    tokenId: string
    claimed?: boolean
}

export const NftItem: FC<NftItemProps> = ({ contract, tokenId, className, claimed, ...rest }) => {
    const { t } = useI18N()
    const result = useERC721TokenDetailed(contract, tokenId)
    const { classes } = useStyles()
    if (!result.tokenDetailed || !contract) {
        return (
            <div className={classnames(className, classes.nft, classes.loading)} {...rest}>
                <Skeleton height={185} width={120} />
            </div>
        )
    }

    return (
        <div className={classnames(className, classes.nft)} {...rest}>
            {/* <NftImage
                classes={{
                    loadingFailImage: classes.loadingFailImage,
                }}
                token={result.tokenDetailed}
                fallbackImage={new URL('./assets/nft_token_fallback.png', import.meta.url)}
            /> */}
            <Typography className={classes.name}>{result.tokenDetailed.info.name}</Typography>
            {claimed && <Typography className={classes.claimedBadge}>{t('plugin_red_packet_claimed')}</Typography>}
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
                <ListItem className={classes.listItem} key={tokenId}>
                    <NftItem contract={contract} claimed={statusList[index]} tokenId={tokenId} />
                </ListItem>
            ))}
        </List>
    )
}
