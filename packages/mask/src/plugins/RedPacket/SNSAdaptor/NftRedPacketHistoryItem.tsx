import { type FC, memo, type MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntersectionObserver } from '@react-hookz/web'
import { fill } from 'lodash-es'
import { TokenIcon } from '@masknet/shared'
import { makeStyles, ActionButton } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, ListItem, Typography } from '@mui/material'
import { dateTimeFormat } from '../../ITO/assets/formatDate.js'
import type { NftRedPacketJSONPayload } from '../types.js'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket.js'
import { useNftAvailabilityComputed } from './hooks/useNftAvailabilityComputed.js'
import { useCreateNftRedPacketReceipt } from './hooks/useCreateNftRedPacketReceipt.js'
import { NftList } from './NftList.js'
import { Translate, useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            borderRadius: 10,
            border: `solid 1px ${theme.palette.divider}`,
            marginBottom: theme.spacing(1.5),
            position: 'static !important' as any,
            height: 'auto !important',
            padding: theme.spacing(2),
            backgroundColor: theme.palette.background.default,
            [smallQuery]: {
                padding: theme.spacing(2, 1.5),
            },
        },
        message: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            [smallQuery]: {
                whiteSpace: 'normal',
            },
        },
        box: {
            display: 'flex',
            width: '100%',
        },
        content: {
            transform: 'translateY(-4px)',
            width: '100%',
            paddingLeft: theme.spacing(1),
        },
        section: {
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
            [smallQuery]: {
                marginBottom: 0,
            },
        },
        icon: {
            width: 27,
            height: 27,
        },
        title: {
            whiteSpace: 'break-spaces',
            fontWeight: 500,
            fontSize: 16,
        },
        info: {
            color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
            [smallQuery]: {
                fontSize: 13,
            },
        },
        nftList: {
            width: 390,
            [smallQuery]: {
                width: '100%',
            },
        },
        actionButton: {
            height: 26,
            minHeight: 'auto',
            position: 'relative',
        },
        footer: {
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: theme.spacing(2),
            [smallQuery]: {
                marginTop: theme.spacing(1),
            },
        },
        footerInfo: {
            fontSize: 15,
            color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
            '& strong': {
                color: theme.palette.text.primary,
            },
        },
        disabledButton: {
            color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            boxShadow: 'none',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            cursor: 'default',
            '&:hover': {
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            },
        },
        ellipsis: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 360,
        },
    }
})

export interface NftRedPacketHistoryItemProps {
    history: NftRedPacketJSONPayload
    collections: Array<NonFungibleCollection<ChainId, SchemaType>>
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void
    onShowPopover: (anchorEl: HTMLElement, text: string) => void
    onHidePopover: () => void
}
export const NftRedPacketHistoryItem: FC<NftRedPacketHistoryItemProps> = memo(
    ({ history, onSend, onShowPopover, onHidePopover, collections }) => {
        const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
        const [isViewed, setIsViewed] = useState(false)
        const ref = useRef<HTMLLIElement | null>(null)
        const entry = useIntersectionObserver(ref, {})
        const t = useI18N()
        const { classes, cx } = useStyles()
        const { value: receipt } = useCreateNftRedPacketReceipt(history.txid)
        const rpid = receipt?.rpid ?? ''
        const creation_time = receipt?.creation_time ?? 0
        const patchedHistory: NftRedPacketJSONPayload = useMemo(
            () => ({ ...history, rpid, creation_time }),
            [history, rpid, creation_time],
        )

        useEffect(() => {
            if (entry?.isIntersecting && rpid) setIsViewed(true)
        }, [entry?.isIntersecting, rpid])

        const {
            computed: { canSend, isPasswordValid },
        } = useNftAvailabilityComputed(account, patchedHistory)

        const collection = collections.find((x) => isSameAddress(x.address, patchedHistory.token_address))

        const handleSend = useCallback(() => {
            if (!(canSend && collection && isPasswordValid)) return
            onSend(patchedHistory, collection)
        }, [onSend, canSend, patchedHistory, collection, isPasswordValid])

        const { value: redpacketStatus } = useAvailabilityNftRedPacket(patchedHistory.rpid, account)
        const bitStatusList = redpacketStatus
            ? redpacketStatus.bitStatusList
            : fill(Array(patchedHistory.token_ids.length), false)
        const handleMouseEnter: MouseEventHandler<HTMLButtonElement> = (event) => {
            if (canSend && !isPasswordValid) {
                handleShowPopover(event.currentTarget)
            }
        }
        const handleShowPopover = (anchor: HTMLElement) => {
            onShowPopover(anchor, t.nft_data_broken())
        }

        return (
            <ListItem className={classes.root} ref={ref}>
                {!rpid ? null : (
                    <Box className={classes.box}>
                        <TokenIcon
                            className={classes.icon}
                            address={collection?.address ?? ''}
                            name={collection?.name ?? '-'}
                            logoURL={
                                collection?.iconURL ??
                                new URL('../../../resources/maskFilledIcon.png', import.meta.url).toString()
                            }
                        />
                        <Box className={classes.content}>
                            <section className={classes.section}>
                                <div>
                                    <Typography
                                        variant="body1"
                                        className={cx(classes.title, classes.message, classes.ellipsis)}>
                                        {patchedHistory.sender.message === ''
                                            ? t.best_wishes()
                                            : patchedHistory.sender.message}
                                    </Typography>
                                    <Typography variant="body1" className={cx(classes.info, classes.message)}>
                                        {t.history_duration({
                                            startTime: dateTimeFormat(new Date(patchedHistory.creation_time)),
                                            endTime: dateTimeFormat(
                                                new Date(patchedHistory.creation_time + patchedHistory.duration),
                                                false,
                                            ),
                                        })}
                                    </Typography>
                                </div>
                                {canSend ? (
                                    <ActionButton
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={onHidePopover}
                                        onClick={handleSend}
                                        className={cx(
                                            classes.actionButton,
                                            isPasswordValid ? '' : classes.disabledButton,
                                        )}
                                        size="large">
                                        {t.send()}
                                    </ActionButton>
                                ) : null}
                            </section>
                            <section className={classes.nftList}>
                                {isViewed ? (
                                    <NftList
                                        collection={collection}
                                        statusList={bitStatusList}
                                        tokenIds={patchedHistory.token_ids}
                                    />
                                ) : null}
                            </section>
                            <section className={classes.footer}>
                                <Typography variant="body1" className={classes.footerInfo}>
                                    <Translate.history_claimed
                                        components={{
                                            strong: <strong />,
                                        }}
                                        values={{
                                            claimedShares: bitStatusList.filter((x) => x).length.toString(),
                                            shares: patchedHistory.shares.toString(),
                                        }}
                                    />
                                </Typography>
                            </section>
                        </Box>
                    </Box>
                )}
            </ListItem>
        )
    },
)
