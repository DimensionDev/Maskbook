import { Box, Button } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import { makeStyles } from '@masknet/theme'
import StorageIcon from '@material-ui/icons/Storage'
import type { AvatarMetaDB } from '../../../../components/InjectedComponents/NFT/NFTAvatar'

const useStyles = makeStyles()({
    root: {
        marginBottom: 0,
    },
    icon: {
        height: 64,
        width: 64,
    },
})

interface AvatarMetaDBProps {
    avatar: AvatarMetaDB
}
export function DashboardUnbindNFTAvatarDialog(
    props: WrappedDialogProps<AvatarMetaDBProps & { onDeleted: () => void }>,
) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const avatar = props.ComponentProps?.avatar
    const onClick = () => {
        props.ComponentProps?.onDeleted()
        props.onClose()
    }
    if (!avatar) return null
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<StorageIcon fontSize="large" className={classes.icon} />}
                iconColor="#f76969"
                primary={t('unbind_nft_avatar')}
                secondary={t('delete_nft_avatar', { userId: avatar.userId })}
                footer={
                    <Box>
                        <Button variant="contained" fullWidth onClick={onClick}>
                            {t('delete')}
                        </Button>
                    </Box>
                }
            />
        </DashboardDialogCore>
    )
}
