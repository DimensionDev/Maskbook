import { Button } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import Services from '../../../service'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'

const LinkOffIcon = () => (
    <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M43.7853 35.3366L50.1249 29C52.9203 26.1956 54.49 22.3973 54.49 18.4376C54.49 14.4778 52.9203 10.6796 50.1249 7.87514C47.3212 5.07823 43.5226 3.50751 39.5624 3.50751C35.6022 3.50751 31.8037 5.07823 29 7.87514L26.8878 9.98733L31.1122 14.2117L33.2244 12.0995C34.9079 10.4235 37.1868 9.48252 39.5624 9.48252C41.938 9.48252 44.2169 10.4235 45.9005 12.0995C47.578 13.7823 48.5199 16.0615 48.5199 18.4376C48.5199 20.8137 47.578 23.0928 45.9005 24.7756L39.5609 31.1122C38.835 31.8333 37.9796 32.4111 37.0395 32.8151L33.2244 29L37.4487 24.7756L35.3366 22.6634C33.9532 21.2716 32.3075 20.1681 30.4947 19.4168C28.6818 18.6655 26.738 18.2814 24.7756 18.2867C24.0736 18.2867 23.3894 18.3823 22.7112 18.4839L4.22437 0L0 4.22437L53.7756 58L58 53.7756L41.461 37.2366C42.2885 36.6869 43.0683 36.0536 43.7853 35.3366ZM24.7756 45.9005C23.0921 47.5765 20.8132 48.5175 18.4376 48.5175C16.062 48.5175 13.7831 47.5765 12.0995 45.9005C10.422 44.2177 9.48006 41.9385 9.48006 39.5624C9.48006 37.1863 10.422 34.9072 12.0995 33.2244L16.5091 28.8178L12.2847 24.5934L7.87514 29C5.07969 31.8044 3.50997 35.6027 3.50997 39.5624C3.50997 43.5222 5.07969 47.3204 7.87514 50.1249C9.26098 51.5127 10.9074 52.613 12.7198 53.3625C14.5322 54.1121 16.4748 54.4962 18.4361 54.4926C20.3979 54.4967 22.3411 54.1129 24.1541 53.3633C25.967 52.6138 27.6139 51.5132 29 50.1249L31.1122 48.0127L26.8878 43.7883L24.7756 45.9005Z"
            fill="#F4637D"
        />
    </svg>
)

export function DashboardPersonaUnlinkConfirmDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { nickname, identifier } = props.ComponentProps!

    const onClick = useSnackbarCallback(() => Services.Identity.detachProfile(identifier), [identifier], props.onClose)

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<LinkOffIcon />}
                iconColor="#699CF7"
                primary={t('disconnect_profile')}
                secondary={t('dashboard_disconnect_profile_hint', {
                    persona: nickname,
                    network: identifier.network,
                    profile: identifier.userId,
                })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onClick}>
                            {t('confirm')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}
