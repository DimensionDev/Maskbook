import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, TextField, Typography, useTheme } from '@mui/material'
import { type SingletonModalRefCreator } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'

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

interface WalletAutoLockSettingDrawerProps extends BottomDrawerProps {}

enum OptionName {
    ONE_QUARTE = '15',
    TWO_QUARTE = '30',
    ONE_HOUR = '60',
    ONE_DAY = '1 Day',
    NEVER = 'Never',
}

function WalletAutoLockSettingDrawer({ ...rest }: WalletAutoLockSettingDrawerProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes, cx } = useStyles()
    const [time, setTime] = useState('15')
    const [noAutoLock, setNoAutoLock] = useState(false)
    const error = Number.isNaN(Number(time))

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
        <BottomDrawer {...rest}>
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
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <Typography color={theme.palette.maskColor.third}>
                                {t('popups_wallet_settings_minutes')}
                            </Typography>
                        ),
                        disableUnderline: true,
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
                            option.value === time ? classes.selected : '',
                        )}
                        onClick={() => {
                            setTime(option.value)
                        }}
                        key={index}>
                        {option.name}
                    </Box>
                ))}
            </Box>

            <ActionButton disabled={error} sx={{ marginTop: '16px' }}>
                {t('confirm')}
            </ActionButton>
        </BottomDrawer>
    )
}

export type WalletAutoLockSettingModalOpenProps = Omit<WalletAutoLockSettingDrawerProps, 'open'>

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
    return <WalletAutoLockSettingDrawer open={open} {...props} onClose={() => dispatch?.close(false)} />
})
