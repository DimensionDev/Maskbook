import { Box, Button, Typography } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import { makeStyles } from '@masknet/theme'
import StorageIcon from '@material-ui/icons/Storage'
import { InputBox } from '../../DashboardComponents/InputBox'
import { useCallback, useState } from 'react'

const useStyles = makeStyles()({
    root: {
        marginBottom: 0,
    },
    table: {
        paddingLeft: 28,
        paddingRight: 28,
        marginTop: 2,
        marginBottom: 28,
    },
    buttonText: {
        color: '#fff',
    },
    message: {
        '&:before': {
            content: '""',
            borderLeft: `2px solid`,
            paddingRight: 2,
        },
        alignSelf: 'self-start',
    },
    icon: {
        height: 64,
        width: 64,
    },
})

export function DashboardBindNFTAvatarDialog(
    props: WrappedDialogProps<{ onAdd: (userId: string, avatarId: string, address: string, tokenId: string) => void }>,
) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [message, setMessage] = useState('')
    const [userId, setUserId] = useState('')
    const [avatarId, setAvatarId] = useState('')
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')

    const _onAdd = useCallback(() => {
        if (!userId) {
            setMessage(t('nft_dashboard_input_userid_hint'))
            return
        }
        if (!avatarId) {
            setMessage(t('nft_dashboard_input_avatarid_hint'))
            return
        }
        if (!address) {
            setMessage(t('nft_dashboard_input_address_hint'))
            return
        }
        if (!tokenId) {
            setMessage(t('nft_dashboard_input_tokenid_hint'))
            return
        }

        props.ComponentProps?.onAdd(userId, avatarId, address, tokenId)
        props.onClose()
    }, [userId, avatarId, address, tokenId])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="medium"
                icon={<StorageIcon fontSize="large" className={classes.icon} />}
                iconColor="#699CF7"
                primary={t('bind_nft_avatar')}
                footer={
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            '& > * ': {
                                margin: 1,
                            },
                        }}>
                        <InputBox
                            label={t('nft_dashboard_input_userid_label')}
                            classes={{ root: classes.root }}
                            inputBaseProps={{ autoFocus: true }}
                            value={userId}
                            onChange={(val: string) => {
                                setUserId(val)
                                setMessage('')
                            }}
                        />
                        <InputBox
                            label={t('nft_dashboard_input_avatarid_label')}
                            value={avatarId}
                            onChange={(val: string) => {
                                setAvatarId(val)
                                setMessage('')
                            }}
                        />
                        <InputBox
                            label={t('nft_dashboard_input_address_label')}
                            value={address}
                            onChange={(val: string) => {
                                setAddress(val)
                                setMessage('')
                            }}
                        />
                        <InputBox
                            label={t('nft_dashboard_input_tokenid_label')}
                            value={tokenId}
                            onChange={(val: string) => {
                                setTokenId(val)
                                setMessage('')
                            }}
                        />

                        {message ? (
                            <Typography color="error" variant="body1" className={classes.message}>
                                {message}
                            </Typography>
                        ) : null}
                        <Button variant="contained" onClick={_onAdd}>
                            {t('nft_add_button_label')}
                        </Button>
                    </Box>
                }
            />
        </DashboardDialogCore>
    )
}
