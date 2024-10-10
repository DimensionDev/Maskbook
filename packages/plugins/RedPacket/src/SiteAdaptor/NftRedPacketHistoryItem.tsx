import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import { ActionButton, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { type NftRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { isSameAddress, type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, ListItem, Typography } from '@mui/material'
import { fill } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket.js'
import { useCreateNftRedPacketReceipt } from './hooks/useCreateNftRedPacketReceipt.js'
import { useNftAvailabilityComputed } from './hooks/useNftAvailabilityComputed.js'
import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string }>()((
    theme,
    { listItemBackground, listItemBackgroundIcon },
) => {
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
})

interface NftRedPacketHistoryItemProps {
    history: NftRedPacketJSONPayload
    collections: Array<NonFungibleCollection<ChainId, SchemaType>>
    onSend: (history: NftRedPacketJSONPayload, contract: NonFungibleCollection<ChainId, SchemaType>) => void
}
export const NftRedPacketHistoryItem = memo(function NftRedPacketHistoryItem({
    history,
    onSend,
    collections,
}: NftRedPacketHistoryItemProps) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [seen, ref] = useEverSeen<HTMLLIElement>()

    const { value: receipt } = useCreateNftRedPacketReceipt(seen ? history.txid : '', history.chainId)
    const rpid = receipt?.rpid || history.rpid || ''
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

    const { canSend, isPasswordValid, password } = useNftAvailabilityComputed(account, patchedHistory)

    const collection = collections.find((x) => isSameAddress(x.address, patchedHistory.token_address))

    const handleSend = useCallback(() => {
        if (!(canSend && collection && isPasswordValid)) return
        onSend({ ...patchedHistory, password: patchedHistory.password || password }, collection)
    }, [onSend, canSend, patchedHistory, collection, isPasswordValid, password])

    const { data: redpacketStatus } = useAvailabilityNftRedPacket(rpid, account, patchedHistory.chainId)
    const bitStatusList =
        redpacketStatus ? redpacketStatus.bitStatusList : fill(Array(patchedHistory.token_ids.length), false)
    const locale = useLingui().i18n.locale

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
                                        {patchedHistory.sender.message === '' ?
                                            <Trans>Best Wishes!</Trans>
                                        :   patchedHistory.sender.message}
                                    </Typography>
                                </div>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                        <Trans>Create time:</Trans>
                                    </Typography>
                                    {rpid ?
                                        <Typography variant="body1" className={cx(classes.info, classes.message)}>
                                            <Trans>
                                                {dateTimeFormat(locale, new Date(patchedHistory.creation_time))} (UTC+8)
                                            </Trans>
                                        </Typography>
                                    :   null}
                                </div>
                            </div>

                            <ShadowRootTooltip
                                placement="top"
                                title={
                                    canSend && !isPasswordValid ?
                                        <Trans>The Lucky Drop can't be sent due to data damage.</Trans>
                                    :   ''
                                }>
                                <span style={{ display: 'inline-block' }}>
                                    <ActionButton
                                        onClick={handleSend}
                                        disabled={!isPasswordValid}
                                        className={classes.actionButton}
                                        size="large">
                                        <Trans>Share</Trans>
                                    </ActionButton>
                                </span>
                            </ShadowRootTooltip>
                        </section>

                        <section className={classes.footer}>
                            <Typography variant="body1" className={classes.footerInfo}>
                                <Trans>
                                    Claimed:{' '}
                                    <span>
                                        {rpid ? bitStatusList.filter(Boolean).length.toString() : '0'}/
                                        {patchedHistory.shares}
                                    </span>{' '}
                                    <span>{collection?.name ?? ''}</span>
                                </Trans>
                            </Typography>
                            <TokenIcon
                                className={classes.icon}
                                address={collection?.address ?? ''}
                                name={collection?.name ?? '-'}
                                logoURL={
                                    collection?.iconURL ?? new URL('./assets/maskFilledIcon.png', import.meta.url).href
                                }
                            />
                        </section>
                    </Box>
                </Box>
            </section>
        </ListItem>
    )
})
function dateTimeFormat(locale: string, date: Date) {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(date)
}
