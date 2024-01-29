import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { formatBalance } from '@masknet/web3-shared-base'
import { Box, ListItem, Typography } from '@mui/material'
import { memo } from 'react'
import { RedPacketTrans, useRedPacketTrans } from '../locales/index.js'
import { FireflyRedPacketActionButton } from './FireflyRedPacketActionButton.js'
import { format } from 'date-fns'

const useStyles = makeStyles<{ listItemBackground?: string; listItemBackgroundIcon?: string }>()((
    theme,
    { listItemBackground, listItemBackgroundIcon },
) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        message: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            [smallQuery]: {
                whiteSpace: 'normal',
            },
        },
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
        box: {
            display: 'flex',
            width: '100%',
        },
        content: {
            transform: 'RedPacketTransY(-4px)',
            width: '100%',
            [smallQuery]: {
                paddingLeft: theme.spacing(1.5),
                width: 'auto',
            },
        },
        section: {
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
            [smallQuery]: {
                flexWrap: 'wrap',
            },
        },
        div: {
            maxWidth: 350,
        },
        title: {
            color: theme.palette.maskColor.dark,
            fontWeight: 700,
            fontSize: 14,
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
        footer: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        icon: {
            width: 18,
            height: 18,
            marginLeft: 6,
        },
        moreDetails: {
            fontSize: 12,
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '16px',
            background: 'none',
            cursor: 'pointer',
            border: 'none',
            color: '#181818',
        },
        invisible: {
            visibility: 'hidden',
        },
    }
})

interface Props {
    history: FireflyRedPacketAPI.RedPacketSentInfo
    handleOpenDetails: (rpid: string) => void
}
export const FireflyRedPacketInSentHistoryList = memo(function FireflyRedPacketInSentHistoryList({
    history,
    handleOpenDetails,
}: Props) {
    const {
        rp_msg,
        redpacket_id,
        create_time,
        claim_numbers,
        total_amounts,
        token_decimal,
        claim_amounts,
        token_symbol,
        token_logo,
        chain_id,
        redpacket_status,
    } = history
    const t = useRedPacketTrans()

    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, Number(chain_id))

    const { classes, cx } = useStyles({
        listItemBackground: networkDescriptor?.backgroundGradient,
        listItemBackgroundIcon: networkDescriptor ? `url("${networkDescriptor.icon}")` : undefined,
    })

    return (
        <ListItem className={classes.root}>
            <section className={classes.contentItem}>
                <Box className={classes.box}>
                    <Box className={classes.content}>
                        <section className={classes.section}>
                            <div className={classes.div}>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.title, classes.message)}>
                                        {rp_msg === '' ? t.best_wishes() : rp_msg}
                                    </Typography>
                                </div>
                                <div className={classes.fullWidthBox}>
                                    <Typography variant="body1" className={cx(classes.infoTitle, classes.message)}>
                                        {t.create_time()}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className={cx(
                                            classes.info,
                                            classes.message,
                                            redpacket_id ? '' : classes.invisible,
                                        )}>
                                        {t.history_duration({
                                            time: format(new Date(Number(create_time) * 1000), 'M/d/yyyy HH:mm'),
                                        })}
                                    </Typography>
                                </div>
                            </div>
                            {redpacket_status === FireflyRedPacketAPI.RedPacketStatus.View ? null : (
                                <FireflyRedPacketActionButton redpacketStatus={redpacket_status} />
                            )}
                        </section>

                        <section className={classes.footer}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" className={classes.footerInfo}>
                                    <RedPacketTrans.history_claimed
                                        components={{
                                            span: <span />,
                                        }}
                                        values={{
                                            claimedShares: String(claim_numbers),
                                            shares: String(0),
                                            amount: formatBalance(total_amounts, token_decimal ?? 18, {
                                                significant: 2,
                                                isPrecise: true,
                                            }),
                                            claimedAmount: formatBalance(claim_amounts, token_decimal, {
                                                significant: 2,
                                                isPrecise: true,
                                            }),
                                            symbol: token_symbol,
                                        }}
                                    />
                                </Typography>
                                {token_logo ?
                                    <TokenIcon
                                        className={classes.icon}
                                        address={''}
                                        name={token_symbol}
                                        logoURL={token_logo}
                                    />
                                :   null}
                            </div>
                            <button
                                type="button"
                                className={classes.moreDetails}
                                onClick={() => {
                                    handleOpenDetails(redpacket_id)
                                }}>
                                {t.more_details()}
                            </button>
                        </section>
                    </Box>
                </Box>
            </section>
        </ListItem>
    )
})
