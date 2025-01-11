import { Trans } from '@lingui/react/macro'
import { RoutePaths } from '@masknet/plugin-redpacket'
import { ApplicationBoardModal, EmptyStatus, LoadingStatus, NetworkTab } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, RedPacketNftMetaKey } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useNonFungibleCollections } from '@masknet/web3-hooks-base'
import type { NftRedPacketJSONPayload } from '@masknet/web3-providers/types'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { List, ListItem } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { nftDefaultChains } from '../../constants.js'
import { NftRedPacketRecord } from '../components/NftRedPacketRecord.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useNftRedPacketHistory } from '../hooks/useNftRedPacketHistory.js'
import { openComposition } from '../openComposition.js'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            width: 568,
            padding: 0,
            boxSizing: 'border-box',
            height: 474,
            flexDirection: 'column',
            margin: '0 auto',
            overflow: 'auto',
            [smallQuery]: {
                width: '100%',
                padding: 0,
            },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        item: {
            width: '100%',
            padding: 0,
            background: theme.palette.common.white,
            marginBottom: theme.spacing(1.5),
            borderRadius: 8,
            '&:last-child': {
                marginBottom: '80px',
            },
        },
        placeholder: {
            boxSizing: 'border-box',
            textAlign: 'center',
            width: 360,
            height: 474,
            margin: '0 auto',
        },
    }
})

export function NftHistory() {
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: histories, isLoading } = useNftRedPacketHistory(account, chainId)
    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        schemaType: SchemaType.ERC721,
    })
    const { creator: senderName } = useRedPacket()

    const compositionType = useContext(CompositionTypeContext)
    const navigate = useNavigate()
    const onSend = useCallback(
        (history: NftRedPacketJSONPayload, collection: NonFungibleCollection<ChainId, SchemaType>) => {
            const { rpid, txid, duration, sender, password, chainId } = history
            openComposition(
                RedPacketNftMetaKey,
                {
                    id: rpid,
                    txid,
                    duration,
                    message: sender.message,
                    senderName,
                    contractName: collection.name,
                    contractAddress: collection.address,
                    contractTokenURI: collection.iconURL ?? '',
                    privateKey: password,
                    chainId,
                },
                compositionType,
            )
            ApplicationBoardModal.close()
            navigate(RoutePaths.Exit)
        },
        [senderName, compositionType, navigate],
    )

    return (
        <div className={classes.root}>
            <NetworkTab chains={nftDefaultChains} hideArrowButton pluginID={NetworkPluginID.PLUGIN_EVM} />
            {isLoading ?
                <LoadingStatus className={classes.placeholder} iconSize={30} />
            : !histories?.length ?
                <EmptyStatus className={classes.placeholder} iconSize={36}>
                    <Trans>
                        You haven't created any NFT lucky drop yet. Try to create one and share fortune with your
                        friends.
                    </Trans>
                </EmptyStatus>
            :   <List style={{ padding: '16px 0 0' }}>
                    {histories.map((history) => (
                        <ListItem className={classes.item} key={history.txid}>
                            <NftRedPacketRecord collections={collections} history={history} onSend={onSend} />
                        </ListItem>
                    ))}
                </List>
            }
        </div>
    )
}
