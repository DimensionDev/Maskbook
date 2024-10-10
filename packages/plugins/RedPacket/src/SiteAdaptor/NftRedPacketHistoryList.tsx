import { makeStyles } from '@masknet/theme'
import { EmptyStatus, LoadingStatus, useSharedTrans } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNonFungibleCollections } from '@masknet/web3-hooks-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { type NftRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { List } from '@mui/material'
import { useNftRedPacketHistory } from './hooks/useNftRedPacketHistory.js'
import { NftRedPacketHistoryItem } from './NftRedPacketHistoryItem.js'
import type { HTMLProps } from 'react'
import { Trans } from '@lingui/macro'

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
        placeholder: {
            boxSizing: 'border-box',
            textAlign: 'center',
            width: 360,
            height: 474,
            margin: '0 auto',
        },
    }
})

interface Props extends HTMLProps<HTMLDivElement> {
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void
}

export function NftRedPacketHistoryList({ onSend, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const sharedI18N = useSharedTrans()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: histories, isPending } = useNftRedPacketHistory(account, chainId)
    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        schemaType: SchemaType.ERC721,
    })

    if (isPending) {
        return (
            <LoadingStatus className={classes.placeholder} iconSize={30}>
                {sharedI18N.loading()}
            </LoadingStatus>
        )
    }

    if (!histories?.length) {
        return (
            <EmptyStatus className={classes.placeholder} iconSize={36}>
                <Trans>
                    You haven't created any NFT lucky drop yet. Try to create one and share fortune with your friends.
                </Trans>
            </EmptyStatus>
        )
    }

    return (
        <div {...rest} className={cx(classes.root, rest.className)}>
            <List style={{ padding: '16px 0 0' }}>
                {histories.map((history) => (
                    <NftRedPacketHistoryItem
                        key={history.txid}
                        collections={collections}
                        history={history}
                        onSend={onSend}
                    />
                ))}
            </List>
        </div>
    )
}
