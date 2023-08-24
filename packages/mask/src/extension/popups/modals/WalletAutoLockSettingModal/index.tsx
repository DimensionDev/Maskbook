import { forwardRef, useState } from 'react'
import { useAsyncFn } from 'react-use'
import millisecondsToMinutes from 'date-fns/millisecondsToMinutes'
import minutesToMilliseconds from 'date-fns/minutesToMilliseconds'
import hoursToMilliseconds from 'date-fns/hoursToMilliseconds'
import { Box, TextField, Typography, useTheme } from '@mui/material'
import { type SingletonModalRefCreator } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import Services from '../../../service.js'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { useWalletAutoLockTime } from '../../pages/Wallet/hooks/useWalletAutoLockTime.js'
import { isPositive } from '@masknet/web3-shared-base'

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
        padding: '8px 12px',
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
    ONE_QUARTE = '15',
    TWO_QUARTE = '30',
    ONE_HOUR = '60',
    ONE_DAY = '1 Day',
    NEVER = 'Never',
}

const DEFAULT_MIN_AUTO_LOCKER_TIME = 1000 * 60 * 15 // 15 mins

const ONE_DAY_IN_MILLISECONDS = hoursToMilliseconds(24)

function WalletAutoLockSettingDrawer(props: BottomDrawerProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes, cx } = useStyles()
    const { value: autoLockerTime = DEFAULT_MIN_AUTO_LOCKER_TIME } = useWalletAutoLockTime()

    const [time, setTime] = useState<string>()

    const initialTime = millisecondsToMinutes(autoLockerTime).toString()

    const error = Number.isNaN(Number(time ?? initialTime))

    const [{ loading }, setAutoLockerTime] = useAsyncFn(async (time: number) => {
        await Services.Wallet.setAutoLockerTime(
            time > ONE_DAY_IN_MILLISECONDS || time === 0 ? 0 : Math.max(time, DEFAULT_MIN_AUTO_LOCKER_TIME),
        )
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
                {t('popups_wallet_settings_auto_lock_tips')}
            </Typography>
            <Box display="flex" justifyContent="center" mx={0.5}>
                <TextField
                    sx={{ mt: 2 }}
                    error={error}
                    fullWidth
                    placeholder={'15'}
                    value={time ?? initialTime}
                    onChange={(e) => {
                        if (!e.target.value) setTime('')
                        if (!isPositive(e.target.value)) return
                        setTime(e.target.value)
                    }}
                    InputProps={{
                        endAdornment: (
                            <Typography color={theme.palette.maskColor.third}>
                                {t('popups_wallet_settings_minutes')}
                            </Typography>
                        ),
                        disableUnderline: true,
                        inputProps: {
                            min: 0,
                            type: 'number',
                        },
                    }}
                />
            </Box>

            {error ? (
                <Typography fontSize={14} color={theme.palette.maskColor.danger} mt={1}>
                    {t('popups_wallet_settings_auto_lock_number_only')}
                </Typography>
            ) : null}

            <Box className={classes.list}>
                {options.map((option, index) => (
                    <Box
                        className={cx(
                            classes.listItem,
                            option.name === OptionName.ONE_DAY ? classes.listItemOneDay : '',
                            option.value === (time ?? initialTime) ? classes.selected : '',
                            option.value === '' && (time ?? initialTime) === '0' ? classes.selected : '',
                            option.value === '' &&
                                minutesToMilliseconds(Number(time ?? initialTime)) > ONE_DAY_IN_MILLISECONDS
                                ? classes.selected
                                : '',
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
                onClick={() => setAutoLockerTime(minutesToMilliseconds(Number(time)))}>
                {t('confirm')}
            </ActionButton>
        </BottomDrawer>
    )
}

export type WalletAutoLockSettingModalOpenProps = Omit<BottomDrawerProps, 'open'>

export const WalletAutoLockSettingModal = forwardRef<
    SingletonModalRefCreator<WalletAutoLockSettingModalOpenProps, boolean>
>((_, ref) => {
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
})
