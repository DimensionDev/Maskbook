import { useScrollBottomEvent } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { List, Popper, Typography, Box } from '@mui/material'
import { useRef, useState } from 'react'
import type { NftRedPacketHistory } from '../types'
import { useNftRedPacketHistory } from './hooks/useNftRedPacketHistory'
import { NftRedPacketHistoryItem } from './NftRedPacketHistoryItem'
import { useI18N as useBaseI18n } from '../../../utils'
import { useI18N } from '../locales'
import { LoadingAnimation } from '@masknet/shared'

const useStyles = makeStyles<void, 'atBottom'>()((theme, _, refs) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            width: 568,
            padding: 0,
            boxSizing: 'border-box',
            height: '100%',
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
            height: 350,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: 360,
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
    }
})

interface Props {
    onSend: (history: NftRedPacketHistory, contract: NonFungibleTokenContract<ChainId, SchemaType.ERC721>) => void
}

export function NftRedPacketHistoryList({ onSend }: Props) {
    const { classes } = useStyles()
    const { t: tr } = useBaseI18n()
    const t = useI18N()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { histories, fetchMore, loading } = useNftRedPacketHistory(account, chainId)
    const containerRef = useRef(null)
    const [popperText, setPopperText] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    useScrollBottomEvent(containerRef, fetchMore)

    const handleShowPopover = (anchor: HTMLElement, text: string) => {
        setAnchorEl(anchor)
        setPopperText(text)
    }
    const handleHidePopover = () => {
        setAnchorEl(null)
    }

    if (chainId === ChainId.BSC) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                {t.chain_not_supported({ chain: 'Binance Smart Chain' })}
            </Typography>
        )
    }

    if (loading) {
        return (
            <Box style={{ height: 350, alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                <LoadingAnimation />
            </Box>
        )
    }

    if (!histories?.length) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                {t.nft_no_history()}
            </Typography>
        )
    }

    return (
        <>
            <div ref={containerRef} className={classes.root}>
                <List>
                    {histories.map((history) => (
                        <NftRedPacketHistoryItem
                            key={history.rpid}
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
                            <div
                                className={classNames(classes.arrow, placement === 'bottom' ? classes.atBottom : '')}
                            />
                        </div>
                    )
                }}
            </Popper>
        </>
    )
}
