import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { millisecondsToMinutes, minutesToMilliseconds, hoursToMilliseconds } from 'date-fns'
import { Box, Typography, useTheme } from '@mui/material'
import { type SingletonModalProps } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import Services from '#services'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useWalletAutoLockTime } from '../../pages/Wallet/hooks/useWalletAutoLockTime.js'
import { isUndefined } from 'lodash-es'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    list: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 16,
        gap: 12,
        alignSelf: 'stretch',
    },
    listItem: {
        borderRadius: 6,
        display: 'flex',
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
        height: 32,
        background: theme.palette.maskColor.thirdMain,
        flex: '1 0 0',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
    },
    selected: {
        color: theme.palette.maskColor.bottom,
        background: theme.palette.maskColor.main,
    },
    listItemOneDay: {
        flex: 'auto',
        width: 48,
    },
}))

enum OptionName {
    ONE_QUARTE = '15 Min',
    TWO_QUARTE = '30 Min',
    ONE_HOUR = '60 Min',
    ONE_DAY = '1 Day',
    NEVER = 'Never',
}

const DEFAULT_MIN_AUTO_LOCKER_TIME = 1000 * 60 * 15 // 15 minutes

const ONE_DAY_IN_MILLISECONDS = hoursToMilliseconds(24)

function WalletAutoLockSettingDrawer(props: BottomDrawerProps) {
    const theme = useTheme()
    const { classes, cx } = useStyles()
    const { value: autoLockerTime = DEFAULT_MIN_AUTO_LOCKER_TIME } = useWalletAutoLockTime()

    const [time, setTime] = useState<string>()

    const initialTime = millisecondsToMinutes(autoLockerTime).toString()

    const error = Number.isNaN(isUndefined(time) ? initialTime : time)

    const [{ loading }, setAutoLockerTime] = useAsyncFn(async (time: number) => {
        await Services.Wallet.setAutoLockerTime(time)
        props.onClose?.()
    }, [])

    const options = [
        {
            value: '15',
            name: OptionName.ONE_QUARTE,
        },
        {
            value: '30',
            name: OptionName.TWO_QUARTE,
        },
        {
            value: '60',
            name: OptionName.ONE_HOUR,
        },
        {
            value: '1440',
            name: OptionName.ONE_DAY,
        },
        {
            value: '',
            name: OptionName.NEVER,
        },
    ]

    return (
        <BottomDrawer {...props}>
            <Typography
                fontWeight={700}
                textAlign="center"
                color={theme.palette.maskColor.third}
                sx={{ marginTop: '12px' }}>
                <Trans>Please set up the amount of time before we automatically lock your wallet.</Trans>
            </Typography>
            <Box className={classes.list}>
                {options.map((option, index) => (
                    <Box
                        className={cx(
                            classes.listItem,
                            option.name === OptionName.ONE_DAY ? classes.listItemOneDay : '',
                            option.value === (time ?? initialTime) ? classes.selected : '',
                            option.value === '' && (time ?? initialTime) === '0' ? classes.selected : '',
                            (
                                option.value === '' &&
                                    minutesToMilliseconds(Number(time ?? initialTime)) > ONE_DAY_IN_MILLISECONDS
                            ) ?
                                classes.selected
                            :   '',
                        )}
                        onClick={() => {
                            setTime(option.value)
                        }}
                        key={index}>
                        {option.name}
                    </Box>
                ))}
            </Box>

            <ActionButton
                disabled={error || loading}
                loading={loading}
                sx={{ marginTop: '16px' }}
                onClick={() => setAutoLockerTime(minutesToMilliseconds(Number(time ?? initialTime)))}>
                <Trans>Confirm</Trans>
            </ActionButton>
        </BottomDrawer>
    )
}

export type WalletAutoLockSettingModalOpenProps = Omit<BottomDrawerProps, 'open'>

export function WalletAutoLockSettingModal({ ref }: SingletonModalProps<WalletAutoLockSettingModalOpenProps, boolean>) {
    const [props, setProps] = useState<WalletAutoLockSettingModalOpenProps>({
        title: '',
    })

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })

    if (!open) return null

    return <WalletAutoLockSettingDrawer open={open} {...props} onClose={() => dispatch?.close(false)} />
}
