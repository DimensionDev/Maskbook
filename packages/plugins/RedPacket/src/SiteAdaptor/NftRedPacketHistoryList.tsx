import { useRef, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { EmptyStatus, LoadingStatus, useSharedTrans } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNonFungibleCollections } from '@masknet/web3-hooks-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { type NftRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { List, Popper, Typography } from '@mui/material'
import { useNftRedPacketHistory } from './hooks/useNftRedPacketHistory.js'
import { NftRedPacketHistoryItem } from './NftRedPacketHistoryItem.js'
import { useRedPacketTrans } from '../locales/index.js'

const useStyles = makeStyles<void, 'atBottom'>()((theme, _, refs) => {
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
        popper: {
            overflow: 'visible',
            padding: 6,
        },
        popperContent: {
            position: 'relative',
            overflow: 'visible',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff',
            borderRadius: 8,
            padding: 10,
        },
        arrow: {
            position: 'absolute',
            bottom: 0,
            right: 74,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff'}`,
            transform: 'RedPacketTrans(-50%, 6px)',
            [`&.${refs.atBottom}`]: {
                bottom: 'auto',
                top: 0,
                transform: 'RedPacketTrans(-50%, -6px) rotate(180deg)',
            },
        },
        atBottom: {},
        popperText: {
            cursor: 'default',
            color: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 1)',
            fontSize: 12,
        },
    }
})

interface Props {
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void
}

export function NftRedPacketHistoryList({ onSend }: Props) {
    const { classes, cx } = useStyles()
    const t = useRedPacketTrans()
    const sharedI18N = useSharedTrans()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: histories, isPending } = useNftRedPacketHistory(account, chainId)
    const containerRef = useRef<HTMLDivElement>(null)
    const [popperText, setPopperText] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        schemaType: SchemaType.ERC721,
    })

    const handleShowPopover = (anchor: HTMLElement, text: string) => {
        setAnchorEl(anchor)
        setPopperText(text)
    }
    const handleHidePopover = () => {
        setAnchorEl(null)
    }

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
                {t.nft_no_history()}
            </EmptyStatus>
        )
    }

    return (
        <>
            <div ref={containerRef} className={classes.root}>
                <List style={{ padding: '16px 0 0' }}>
                    {histories.map((history) => (
                        <NftRedPacketHistoryItem
                            key={history.txid}
                            collections={collections}
                            history={history}
                            onSend={onSend}
                            onShowPopover={handleShowPopover}
                            onHidePopover={handleHidePopover}
                        />
                    ))}
                </List>
            </div>
            <Popper
                placeholder={undefined}
                className={classes.popper}
                open={!!anchorEl}
                placement="top"
                anchorEl={anchorEl}
                disablePortal>
                {({ placement }) => {
                    return (
                        <div className={classes.popperContent}>
                            <Typography className={classes.popperText}>{popperText}</Typography>
                            <div className={cx(classes.arrow, placement === 'bottom' ? classes.atBottom : '')} />
                        </div>
                    )
                }}
            </Popper>
        </>
    )
}
