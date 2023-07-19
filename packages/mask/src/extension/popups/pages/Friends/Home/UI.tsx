// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles, useTabs } from '@masknet/theme'
import { useTheme } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { useSearchParams } from 'react-router-dom'
import { HomeTabType } from '../../Wallet/type.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    info: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
    },
    controller: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12,
        padding: '0 16px 16px 16px',
    },
    emptyHeader: {
        height: 140,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.maskColor.modalTitleBg,
    },
    placeholder: {
        textAlign: 'center',
        height: 233,
        padding: theme.spacing(2, 2, 0, 2),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    placeholderTitle: {
        fontSize: 24,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    placeholderDescription: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        marginTop: theme.spacing(1.5),
    },
    edit: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        background: theme.palette.maskColor.bottom,
        borderRadius: 99,
        width: 18,
        height: 18,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    settings: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    header: {
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
    },
    logo: {
        width: 100,
        height: 28,
    },
    menu: {
        color: theme.palette.maskColor.main,
    },
    tabs: {
        paddingLeft: 16,
        paddingRight: 16,
    },
    panel: {
        padding: theme.spacing(2),
        background: theme.palette.maskColor.bottom,
        flex: 1,
        maxHeight: 288,
        overflow: 'auto',
    },
}))

export interface FriendsHomeUIProps {}

export const FriendsHomeUI = memo<FriendsHomeUIProps>(({}) => {
    const theme = useTheme()
    const { t } = useI18N()
    const { classes } = useStyles()

    const [params] = useSearchParams()

    const [currentTab, onChange] = useTabs(
        params.get('tab') || HomeTabType.SocialAccounts,
        HomeTabType.SocialAccounts,
        HomeTabType.ConnectedWallets,
    )

    return <div className={classes.container} />
})
