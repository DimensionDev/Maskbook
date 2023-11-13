import { memo, useCallback } from 'react'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Switch, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useSupportedSites } from '../../hooks/useSupportedSites.js'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { SOCIAL_MEDIA_ICON_FILTER_COLOR } from '../../constants.js'
import { type EnhanceableSite, InjectSwitchSettings, SOCIAL_MEDIA_NAME, EMPTY_LIST } from '@masknet/shared-base'
import Services from '#services'
import { range } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    description: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        lineHeight: '18px',
    },
    list: {
        marginTop: theme.spacing(2),
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
    },
    item: {
        padding: '5px 12px',
    },
    name: {
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        fontSize: 12,
        lineHeight: '16px',
    },
    icon: {
        minWidth: 32,
    },
}))

export const SupportedSitesModal = memo<ActionModalBaseProps>(function SupportedSitesModal(props) {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const { data = EMPTY_LIST, isLoading, refetch } = useSupportedSites()

    const handleSwitch = useCallback(
        async ({
            allowInject,
            hasPermission,
            networkIdentifier,
        }: {
            allowInject: boolean
            hasPermission: boolean
            networkIdentifier: EnhanceableSite
        }) => {
            if (!hasPermission) {
                const result = await Services.SiteAdaptor.requestPermissionBySite(networkIdentifier)
                if (!result) return
            }

            await Services.Settings.setInjectSwitchSetting(networkIdentifier, !allowInject)
            await refetch()
        },
        [InjectSwitchSettings, refetch],
    )

    return (
        <ActionModal header={t.popups_settings_supported_sites()} {...props}>
            <Typography className={classes.description}>{t.popups_settings_supported_sites_description()}</Typography>
            <List className={classes.list}>
                {!isLoading && data ?
                    data?.map((x) => {
                        const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[x.networkIdentifier]

                        return (
                            <ListItemButton
                                key={x.networkIdentifier}
                                className={classes.item}
                                onClick={() =>
                                    handleSwitch({ ...x, networkIdentifier: x.networkIdentifier as EnhanceableSite })
                                }>
                                {Icon ?
                                    <ListItemIcon className={classes.icon}>
                                        <Icon
                                            size={24}
                                            style={{
                                                filter: SOCIAL_MEDIA_ICON_FILTER_COLOR[x.networkIdentifier],
                                                backdropFilter: 'blur(8px)',
                                                borderRadius: 99,
                                            }}
                                        />
                                    </ListItemIcon>
                                :   null}
                                <ListItemText
                                    classes={{ primary: classes.name }}
                                    primary={SOCIAL_MEDIA_NAME[x.networkIdentifier]}
                                />
                                <Switch checked={!!x.hasPermission && !!x.allowInject} />
                            </ListItemButton>
                        )
                    })
                :   range(5).map((i) => (
                        <ListItem key={i} className={classes.item} style={{ height: 48 }}>
                            <ListItemIcon className={classes.icon}>
                                <Skeleton variant="circular" style={{ width: 24, height: 24 }} />
                            </ListItemIcon>
                            <ListItemText primary={<Skeleton width={100} />} />
                            <Skeleton width={40} />
                        </ListItem>
                    ))
                }
            </List>
        </ActionModal>
    )
})
