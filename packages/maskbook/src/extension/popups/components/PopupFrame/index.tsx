import { memo } from 'react'
import { Box, GlobalStyles, Paper } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { ArrowBackIcon, MiniMaskIcon } from '@masknet/icons'
import { NavLink, useHistory, useRouteMatch } from 'react-router-dom'
import { PopupRoutes } from '../../index'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'
import { InitialPlaceholder } from '../InitialPlaceholder'
import { useI18N } from '../../../../utils'
import { useLocation } from 'react-router'

function GlobalCss() {
    return (
        <GlobalStyles
            styles={{
                body: {
                    minWidth: 350,
                    overflowX: 'hidden',
                    margin: '0 auto !important',
                    maxWidth: '100%',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                },
            }}
        />
    )
}

const useStyles = makeStyles()((theme) => ({
    container: {
        minHeight: 550,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '0 10px',
        backgroundColor: theme.palette.primary.main,
        height: 50,
        display: 'flex',
        justifyContent: 'space-between',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
    },
    right: {
        display: 'flex',
        paddingTop: 6,
    },
    nav: {
        width: 86,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: '4px 4px 0px 0px',
        fontSize: 16,
        fontWeight: 500,
        color: theme.palette.primary.contrastText,
        textDecoration: 'none',
    },
    active: {
        color: theme.palette.primary.main,
        cursor: 'inherit',
        backgroundColor: '#ffffff',
    },
}))

export interface PopupFrameProps extends React.PropsWithChildren<{}> {}

export const PopupFrame = memo<PopupFrameProps>((props) => {
    const { t } = useI18N()
    const history = useHistory()
    const { classes } = useStyles()
    const location = useLocation()
    const personas = useMyPersonas()

    const excludePath = useRouteMatch({
        path: [
            PopupRoutes.Wallet,
            PopupRoutes.Personas,
            PopupRoutes.WalletSignRequest,
            PopupRoutes.ContractInteraction,
            PopupRoutes.Unlock,
        ],
        exact: true,
    })

    const excludePersonaPath = useRouteMatch({
        path: [
            PopupRoutes.ContractInteraction,
            PopupRoutes.WalletSignRequest,
            PopupRoutes.GasSetting,
            PopupRoutes.SelectWallet,
        ],
        exact: true,
    })

    return (
        <>
            <GlobalCss />
            <Paper elevation={0} style={{ height: '100vh', overflowY: 'auto', minHeight: 600 }}>
                <Box className={classes.header}>
                    <Box className={classes.left}>
                        {excludePath || history.length === 1 ? (
                            <MiniMaskIcon style={{ fontSize: 30 }} />
                        ) : (
                            <ArrowBackIcon
                                onClick={history.goBack}
                                style={{ fill: '#ffffff', cursor: 'pointer', fontSize: 30 }}
                            />
                        )}
                    </Box>
                    <Box className={classes.right}>
                        <NavLink
                            style={{ marginRight: 5 }}
                            to={!excludePersonaPath ? PopupRoutes.Wallet : location}
                            className={classes.nav}
                            activeClassName={classes.active}>
                            {t('wallets')}
                        </NavLink>
                        {!excludePersonaPath ? (
                            <NavLink to={PopupRoutes.Personas} className={classes.nav} activeClassName={classes.active}>
                                {t('personas')}
                            </NavLink>
                        ) : null}
                    </Box>
                </Box>
                <Box className={classes.container}>
                    {personas.length === 0 ? <InitialPlaceholder /> : props.children}
                </Box>
            </Paper>
        </>
    )
})
