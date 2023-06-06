import { useRef, useState } from 'react'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNonFungibleCollections } from '@masknet/web3-hooks-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { List, Popper, Typography, Box } from '@mui/material'
import type { NftRedPacketJSONPayload } from '../types.js'
import { useNftRedPacketHistory } from './hooks/useNftRedPacketHistory.js'
import { NftRedPacketHistoryItem } from './NftRedPacketHistoryItem.js'
import { useI18N } from '../locales/index.js'
import { Icons } from '@masknet/icons'

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
            display: 'flex',
            flexDirection: 'column',
            height: 474,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: 360,
            margin: '0 auto',
        },
        emptyIcon: {
            width: 36,
            height: 36,
            marginBottom: 13,
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
            transform: 'translate(-50%, 6px)',
            [`&.${refs.atBottom}`]: {
                bottom: 'auto',
                top: 0,
                transform: 'translate(-50%, -6px) rotate(180deg)',
            },
        },
        atBottom: {},
        popperText: {
            cursor: 'default',
            color: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 1)',
            fontSize: 12,
        },
        loading: {
            fontSize: 14,
            marginTop: 13,
        },
    }
})

interface Props {
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void
}

export function NftRedPacketHistoryList({ onSend }: Props) {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { value: histories, loading } = useNftRedPacketHistory(account, chainId)
    const containerRef = useRef<HTMLDivElement>(null)
    const [popperText, setPopperText] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    const handleShowPopover = (anchor: HTMLElement, text: string) => {
        setAnchorEl(anchor)
        setPopperText(text)
    }
    const handleHidePopover = () => {
        setAnchorEl(null)
    }

    if (loading) {
        return (
            <Box
                style={{
                    height: 474,
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                <LoadingBase size={30} />
                <Typography className={classes.loading}>{sharedI18N.loading()}</Typography>
            </Box>
        )
    }

    if (!histories?.length) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                <Icons.EmptySimple className={classes.emptyIcon} />
                {t.nft_no_history()}
            </Typography>
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
                className={classes.popper}
                id="data-damaged"
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
