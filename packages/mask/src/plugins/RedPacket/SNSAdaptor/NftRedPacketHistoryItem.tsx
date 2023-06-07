import { type FC, memo, type MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntersectionObserver } from '@react-hookz/web'
import { fill } from 'lodash-es'
import { makeStyles, ActionButton } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, ListItem, Typography } from '@mui/material'
import { dateTimeFormat } from '../../ITO/assets/formatDate.js'
import type { NftRedPacketJSONPayload } from '../types.js'
import { Translate, useI18N } from '../locales/index.js'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket.js'
import { useNftAvailabilityComputed } from './hooks/useNftAvailabilityComputed.js'
import { useCreateNftRedPacketReceipt } from './hooks/useCreateNftRedPacketReceipt.js'
import { TokenIcon } from '@masknet/shared'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string }>()(
    (theme, { listItemBackground, listItemBackgroundIcon }) => {
        const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
        return {
            root: {
                width: '100%',
                padding: 0,
                background: theme.palette.common.white,
                marginBottom: theme.spacing(1.5),
                borderRadius: 8,
                '&:last-child': {
                    marginBottom: '80px',
                },
            },
            contentItem: {
                width: '100%',
                borderRadius: 8,
                position: 'static !important' as any,
                height: 'auto !important',
                padding: theme.spacing(1.5),
                background: listItemBackground ?? theme.palette.background.default,
                [smallQuery]: {
                    padding: theme.spacing(2, 1.5),
                },
                '&:before': {
                    position: 'absolute',
                    content: '""',
                    top: 45,
                    left: 400,
                    zIndex: 0,
                    width: 114,
                    opacity: 0.2,
                    height: 61,
                    filter: 'blur(1.5px)',
                    background: listItemBackgroundIcon,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '114px 114px',
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
                width: 18,
                height: 18,
                marginLeft: 6,
                zIndex: -1,
            },
            title: {
                color: theme.palette.maskColor.dark,
                whiteSpace: 'break-spaces',
                fontWeight: 500,
                fontSize: 16,
            },
            info: {
                color: theme.palette.maskColor.dark,
                [smallQuery]: {
                    fontSize: 13,
                },
                fontSize: 14,
            },
            infoTitle: {
                color: theme.palette.maskColor.secondaryDark,
                marginRight: 4,
                fontSize: 14,
                [smallQuery]: {
                    fontSize: 13,
                },
            },
            actionButton: {
                fontSize: 12,
                width: 88,
                height: 32,
                background: theme.palette.maskColor.dark,
                color: theme.palette.maskColor.white,
                borderRadius: '999px',
                minHeight: 'auto',
                [smallQuery]: {
                    marginTop: theme.spacing(1),
                },
                '&:disabled': {
                    background: theme.palette.maskColor.dark,
                    color: theme.palette.common.white,
                },
                '&:hover': {
                    background: theme.palette.maskColor.dark,
                    color: theme.palette.maskColor.white,
                    opacity: 0.8,
                },
            },
            footer: {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                marginTop: 15,
            },
            footerInfo: {
                fontSize: 14,
                color: theme.palette.maskColor.secondaryDark,
                '& span': {
                    color: theme.palette.maskColor.dark,
                    marginRight: 2,
                },
            },
            fullWidthBox: {
                width: '100%',
                display: 'flex',
            },
            ellipsis: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 360,
            },
        }
    },
)

export interface NftRedPacketHistoryItemProps {
    history: NftRedPacketJSONPayload
    collections: Array<NonFungibleCollection<ChainId, SchemaType>>
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void
    onShowPopover: (anchorEl: HTMLElement, text: string) => void
    onHidePopover: () => void
}
export const NftRedPacketHistoryItem: FC<NftRedPacketHistoryItemProps> = memo(
    ({ history, onSend, onShowPopover, onHidePopover, collections }) => {
        const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
        const [isViewed, setIsViewed] = useState(false)
        const ref = useRef<HTMLLIElement | null>(null)
        const entry = useIntersectionObserver(ref, {})
        const t = useI18N()

        const { value: receipt } = useCreateNftRedPacketReceipt(isViewed ? history.txid : '')
        const rpid = receipt?.rpid ?? ''
        const creation_time = receipt?.creation_time ?? 0
        const patchedHistory: NftRedPacketJSONPayload = useMemo(
            () => ({ ...history, rpid, creation_time }),
            [history, rpid, creation_time],
        )
        const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)

        const { classes, cx } = useStyles({
            listItemBackground: networkDescriptor?.backgroundGradient,
            listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
        })

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

        const { value: redpacketStatus } = useAvailabilityNftRedPacket(
            patchedHistory.rpid,
            account,
            patchedHistory.chainId,
        )
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
            <ListItem className={classes.root}>
                <section className={classes.contentItem} ref={ref}>
                    <Box className={classes.box}>
                        <Box className={classes.content}>
                            <section className={classes.section}>
                                <div>
                                    <div className={classes.fullWidthBox}>
                                        <Typography
                                            variant="body1"
                                            className={cx(classes.title, classes.message, classes.ellipsis)}>
                                            {patchedHistory.sender.message === ''
                                                ? t.best_wishes()
                                                : patchedHistory.sender.message}
                                        </Typography>
                                    </div>
                                    <div className={classes.fullWidthBox}>
                                        <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                            {t.create_time()}
                                        </Typography>
                                        {rpid ? (
                                            <Typography variant="body1" className={cx(classes.info, classes.message)}>
                                                {t.history_duration({
                                                    time: dateTimeFormat(new Date(patchedHistory.creation_time)),
                                                })}
                                            </Typography>
                                        ) : null}
                                    </div>
                                </div>

                                {canSend ? (
                                    <ActionButton
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={onHidePopover}
                                        onClick={handleSend}
                                        disabled={!isPasswordValid}
                                        className={classes.actionButton}
                                        size="large">
                                        {t.share()}
                                    </ActionButton>
                                ) : null}
                            </section>

                            <section className={classes.footer}>
                                <Typography variant="body1" className={classes.footerInfo}>
                                    <Translate.history_nft_claimed
                                        components={{
                                            span: <span />,
                                        }}
                                        values={{
                                            claimedShares: rpid ? bitStatusList.filter(Boolean).length.toString() : '0',
                                            shares: patchedHistory.shares.toString(),
                                            symbol: collection?.name ?? '',
                                        }}
                                    />
                                </Typography>
                                <TokenIcon
                                    className={classes.icon}
                                    address={collection?.address ?? ''}
                                    name={collection?.name ?? '-'}
                                    logoURL={
                                        collection?.iconURL ??
                                        new URL('../../../resources/maskFilledIcon.png', import.meta.url).toString()
                                    }
                                />
                            </section>
                        </Box>
                    </Box>
                </section>
            </ListItem>
        )
    },
)
