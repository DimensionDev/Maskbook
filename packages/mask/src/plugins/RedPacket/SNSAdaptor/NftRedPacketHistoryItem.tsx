import { FC, memo, MouseEventHandler, useCallback } from 'react'
import classNames from 'classnames'
import { fill } from 'lodash-unified'
import { TokenIcon } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { WalletMessages } from '@masknet/plugin-wallet'
import { NetworkPluginID, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { useAccount, useNonFungibleTokenContract } from '@masknet/plugin-infra/web3'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, ListItem, Typography } from '@mui/material'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { dateTimeFormat } from '../../ITO/assets/formatDate'
import type { NftRedPacketHistory } from '../types'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket'
import { useNftAvailabilityComputed } from './hooks/useNftAvailabilityComputed'
import { NftList } from './NftList'
import { Translate, useI18N } from '../locales'

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
        primary: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        secondary: {
            fontSize: 12,
        },
        message: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            [smallQuery]: {
                whiteSpace: 'normal',
            },
        },
        strong: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        span: {
            maxWidth: 350,
            display: 'inline-flex',
        },
        time: {
            fontSize: 12,
            color: theme.palette.text.secondary,
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
            fontSize: 14,
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
    history: NftRedPacketHistory
    onSend: (history: NftRedPacketHistory, contract: NonFungibleTokenContract<ChainId, SchemaType.ERC721>) => void
    onShowPopover: (anchorEl: HTMLElement, text: string) => void
    onHidePopover: () => void
}
export const NftRedPacketHistoryItem: FC<NftRedPacketHistoryItemProps> = memo(
    ({ history, onSend, onShowPopover, onHidePopover }) => {
        const account = useAccount(NetworkPluginID.PLUGIN_EVM)
        const t = useI18N()
        const { classes } = useStyles()
        const {
            computed: { canSend, isPasswordValid },
        } = useNftAvailabilityComputed(account, history.payload)
        const { value: contractDetailed } = useNonFungibleTokenContract(
            NetworkPluginID.PLUGIN_EVM,
            history.token_contract.address,
            undefined,
            undefined,
            { account },
        )
        const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
            WalletMessages.events.ApplicationDialogUpdated,
        )
        const handleSend = useCallback(() => {
            if (!(canSend && contractDetailed && isPasswordValid)) return
            onSend(history, contractDetailed as NonFungibleTokenContract<ChainId, SchemaType.ERC721>)
            closeApplicationBoardDialog()
        }, [onSend, closeApplicationBoardDialog, canSend, history, contractDetailed, isPasswordValid])

        const { value: redpacketStatus } = useAvailabilityNftRedPacket(history.rpid, account)
        const bitStatusList = redpacketStatus
            ? redpacketStatus.bitStatusList
            : fill(Array(history.token_ids.length), false)
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
                <Box className={classes.box}>
                    <TokenIcon
                        classes={{ icon: classes.icon }}
                        address={contractDetailed?.address ?? ''}
                        name={contractDetailed?.name ?? '-'}
                        logoURL={
                            contractDetailed?.iconURL ??
                            new URL('../../../resources/maskFilledIcon.png', import.meta.url).toString()
                        }
                    />
                    <Box className={classes.content}>
                        <section className={classes.section}>
                            <div>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.title, classes.message, classes.ellipsis)}>
                                    {history.message === '' ? t.best_wishes() : history.message}
                                </Typography>
                                <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                    {t.history_duration({
                                        startTime: dateTimeFormat(new Date(history.creation_time)),
                                        endTime: dateTimeFormat(
                                            new Date(history.creation_time + history.duration),
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
                                    className={classNames(
                                        classes.actionButton,
                                        isPasswordValid ? '' : classes.disabledButton,
                                    )}
                                    variant="contained"
                                    size="large">
                                    {t.send()}
                                </ActionButton>
                            ) : null}
                        </section>
                        <section className={classes.nftList}>
                            <NftList
                                contract={contractDetailed ?? history.token_contract}
                                statusList={bitStatusList}
                                tokenIds={history.token_ids}
                            />
                        </section>
                        <section className={classes.footer}>
                            <Typography variant="body1" className={classes.footerInfo}>
                                <Translate.history_claimed
                                    components={{
                                        strong: <strong />,
                                    }}
                                    values={{
                                        claimedShares: history.claimers.length.toString(),
                                        shares: history.shares.toString(),
                                    }}
                                />
                            </Typography>
                        </section>
                    </Box>
                </Box>
            </ListItem>
        )
    },
)
