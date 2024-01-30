import { memo, useCallback } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useMediaQuery, type Theme } from '@mui/material'
import { useRedPacketTrans } from '../locales/index.js'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
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
    }
})

interface Props {
    redpacketStatus: FireflyRedPacketAPI.RedPacketStatus
}

export const FireflyRedPacketActionButton = memo(function FireflyRedPacketActionButton(props: Props) {
    const { redpacketStatus } = props
    const { classes, cx } = useStyles()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const t = useRedPacketTrans()
    const statusToTransMap = {
        [FireflyRedPacketAPI.RedPacketStatus.Send]: t.share(),
        [FireflyRedPacketAPI.RedPacketStatus.Expired]: t.expired(),
        [FireflyRedPacketAPI.RedPacketStatus.Empty]: t.empty(),
        [FireflyRedPacketAPI.RedPacketStatus.Refund]: t.expired(),
        [FireflyRedPacketAPI.RedPacketStatus.View]: t.view(),
        [FireflyRedPacketAPI.RedPacketStatus.Refunding]: t.refund(),
    }

    const handleClick = useCallback(() => {
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Send) {
            // to do
        }
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refunding) {
            // to do
        }
    }, [redpacketStatus])

    return (
        <ActionButton
            fullWidth={isSmall}
            onClick={() => {
                handleClick()
            }}
            className={cx(classes.actionButton)}
            disabled={
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Empty ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Expired ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refund
            }
            size="large">
            {statusToTransMap[redpacketStatus]}
        </ActionButton>
    )
})
