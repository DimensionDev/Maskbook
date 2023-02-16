import urlcat from 'urlcat'
import { memo, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { Services } from '../../API.js'
import { FooterLine } from '../../components/FooterLine/index.js'
import { HeaderLine } from '../../components/HeaderLine/index.js'
import { TermsAgreedContext } from '../../hooks/useTermsAgreed.js'
import { DashboardTrans, useDashboardI18N } from '../../locales/index.js'
import { Article } from './Article.js'

const useStyles = makeStyles()((theme) => ({
    page: {
        display: 'flex',
        height: '100%',
        maxWidth: 1440,
        marginLeft: 'auto',
        marginRight: 'auto',
        minHeight: '100vh',
        flexDirection: 'column',
    },
    content: {
        width: 660,
        margin: '86px auto 0',
        padding: theme.spacing(1, 4),
        flexGrow: 1,
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(1, 0),
        },
    },
    article: {
        minHeight: 500,
    },
    checkboxGroup: {},
    checkboxRow: {
        marginTop: theme.spacing(2),
        marginLeft: 0,
    },
    label: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        fontFamily: 'PingFang SC',
        marginRight: 0,
        marginLeft: 0,
    },
    link: {
        color: theme.palette.maskColor.main,
        textDecoration: 'underline',
    },
    checkbox: {
        padding: 0,
        marginRight: theme.spacing(1.5),
    },
    buttonGroup: {
        margin: '16px auto 0',
        display: 'flex',
        justifyContent: 'space-around',
        width: 180,
    },
    header: {
        marginTop: 37,
        paddingLeft: 54,
    },
    footer: {
        width: 972,
        margin: '0 auto',
    },
}))

export default memo(function Welcome() {
    const [agreed, setAgreed] = TermsAgreedContext.useContainer()
    const [read, setRead] = useState(agreed)
    const [allowedToCollect, setAllowedToCollect] = useState(false)
    const [params] = useSearchParams()
    const navigate = useNavigate()

    const handleAgree = useCallback(async () => {
        if (allowedToCollect) {
            await Services.Settings.setTelemetryEnabled(true)
        }
        setAgreed(true)
        const from = params.get('from')
        if (from && from !== DashboardRoutes.Personas) {
            const search = params.get('search')
            navigate(urlcat(from, search ? new URLSearchParams(search).entries() : {}))
        }

        const url = await Services.SocialNetwork.setupSite('twitter.com', false)
        if (!url) return
        if (from && from !== DashboardRoutes.Personas) {
            browser.tabs.create({
                active: true,
                url,
            })
        } else {
            location.assign(url)
        }
    }, [params, allowedToCollect])

    const t = useDashboardI18N()
    const { classes } = useStyles()
    return (
        <div className={classes.page}>
            <HeaderLine className={classes.header} />
            <main className={classes.content}>
                <Article className={classes.article} />
                <FormGroup className={classes.checkboxGroup}>
                    <FormControlLabel
                        className={classes.checkboxRow}
                        classes={{ label: classes.label }}
                        control={
                            <Checkbox
                                className={classes.checkbox}
                                checked={read}
                                onChange={(event) => {
                                    setRead(event.currentTarget.checked)
                                }}
                            />
                        }
                        label={
                            <DashboardTrans.welcome_agreement_policy
                                components={{
                                    agreement: (
                                        <a
                                            className={classes.link}
                                            target="_blank"
                                            href="https://legal.mask.io/maskbook/service-agreement-beta-browser.html"
                                        />
                                    ),
                                    policy: (
                                        <a
                                            className={classes.link}
                                            target="_blank"
                                            href="https://legal.mask.io/maskbook/privacy-policy-browser.html"
                                        />
                                    ),
                                }}
                            />
                        }
                    />
                    <FormControlLabel
                        className={classes.checkboxRow}
                        classes={{ label: classes.label }}
                        control={
                            <Checkbox
                                className={classes.checkbox}
                                checked={allowedToCollect}
                                onChange={(event) => {
                                    setAllowedToCollect(event.currentTarget.checked)
                                }}
                            />
                        }
                        label={t.welcome_request_to_collect()}
                    />
                </FormGroup>
                <div className={classes.buttonGroup}>
                    <Button color="secondary" onClick={() => window.close()}>
                        {t.cancel()}
                    </Button>
                    <Button color="primary" onClick={handleAgree} disabled={!read}>
                        {t.agree()}
                    </Button>
                </div>
            </main>
            <FooterLine className={classes.footer} />
        </div>
    )
})
