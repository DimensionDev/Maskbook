import { useScrollBottomEvent } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import { ERC721ContractDetailed, useAccount, useChainId } from '@masknet/web3-shared-evm'
import { List, Popper, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import type { NftRedPacketHistory } from '../types'
import { useNftRedPacketHistory } from './hooks/useNftRedPacketHistory'
import { NftRedPacketHistoryItem } from './NftRedPacketHistoryItem'

const useStyles = makeStyles()((theme, _, createRef) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    const atBottom = {
        ref: createRef(),
    } as const
    return {
        root: {
            display: 'flex',
            width: 568,
            padding: '0 12px',
            boxSizing: 'border-box',
            height: '100%',
            flexDirection: 'column',
            margin: '0 auto',
            overflow: 'auto',
            [smallQuery]: {
                width: '100%',
                padding: 0,
            },
        },
        placeholder: {
            textAlign: 'center',
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
            [`&.${atBottom.ref}`]: {
                bottom: 'auto',
                top: 0,
                transform: 'translate(-50%, -6px) rotate(180deg)',
            },
        },
        atBottom,
        popperText: {
            cursor: 'default',
            color: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 1)',
            fontSize: 12,
        },
    }
})

interface Props {
    onSend: (history: NftRedPacketHistory, contract: ERC721ContractDetailed) => void
}

export function NftRedPacketHistoryList({ onSend }: Props) {
    const { classes } = useStyles()
    const account = useAccount()
    const chainId = useChainId()
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

    if (loading) {
        return (
            <Typography className={classes.placeholder} color="textSecondary">
                Loading...
            </Typography>
        )
    }
    if (!histories?.length) {
        return null
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
