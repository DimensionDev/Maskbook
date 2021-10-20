import { TokenIcon } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ERC721ContractDetailed, useAccount, useERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { Box, ListItem, Typography } from '@mui/material'
import classNames from 'classnames'
import { fill } from 'lodash-es'
import { FC, memo, MouseEventHandler, useCallback } from 'react'
import { Trans } from 'react-i18next'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils/i18n-next-ui'
import { dateTimeFormat } from '../../ITO/assets/formatDate'
import type { NftRedPacketHistory } from '../types'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket'
import { useNftAvailabilityComputed } from './hooks/useNftAvailabilityComputed'
import { NftList } from './NftList'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: 10,
        border: `solid 1px ${theme.palette.divider}`,
        marginBottom: theme.spacing(1.5),
        position: 'static !important' as any,
        height: 'auto !important',
        padding: theme.spacing(2),
        backgroundColor: MaskColorVar.lightBackground,
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
        padding: theme.spacing(0, '1rem'),
    },
    section: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
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
    },
    nftList: {
        width: 390,
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
}))

export interface NftRedPacketHistoryItemProps {
    history: NftRedPacketHistory
    onSend: (history: NftRedPacketHistory, contract: ERC721ContractDetailed) => void
    onShowPopover: (anchorEl: HTMLElement, text: string) => void
    onHidePopover: () => void
}
export const NftRedPacketHistoryItem: FC<NftRedPacketHistoryItemProps> = memo(
    ({ history, onSend, onShowPopover, onHidePopover }) => {
        const account = useAccount()
        const { t } = useI18N()
        const { classes } = useStyles()
        const {
            computed: { canSend, isPasswordValid },
        } = useNftAvailabilityComputed(account, history.payload)
        const { value: contractDetailed } = useERC721ContractDetailed(history.token_contract.address)

        const handleSend = useCallback(() => {
            if (canSend && contractDetailed && isPasswordValid) {
                onSend(history, contractDetailed)
            }
        }, [onSend, canSend, history, contractDetailed, isPasswordValid])

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
            onShowPopover(anchor, t('plugin_nft_red_packet_data_broken'))
        }

        return (
            <ListItem className={classes.root}>
                <Box className={classes.box}>
                    <TokenIcon
                        classes={{ icon: classes.icon }}
                        address={contractDetailed?.address ?? ''}
                        name={contractDetailed?.name ?? '-'}
                        logoURI={contractDetailed?.iconURL ?? ''}
                    />
                    <Box className={classes.content}>
                        <section className={classes.section}>
                            <div>
                                <Typography variant="body1" className={classNames(classes.title, classes.message)}>
                                    {history.message === '' ? t('plugin_red_packet_best_wishes') : history.message}
                                </Typography>
                                <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                    {t('plugin_red_packet_history_duration', {
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
                                    {t('plugin_red_packet_history_send')}
                                </ActionButton>
                            ) : null}
                        </section>
                        <section className={classes.nftList}>
                            <NftList
                                contract={contractDetailed}
                                statusList={bitStatusList}
                                tokenIds={history.token_ids}
                            />
                        </section>
                        <section className={classes.footer}>
                            <Typography variant="body1" className={classes.footerInfo}>
                                <Trans
                                    i18nKey="plugin_red_packet_history_claimed"
                                    components={{
                                        strong: <strong />,
                                    }}
                                    values={{
                                        claimedShares: history.claimers.length,
                                        shares: history.shares,
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
