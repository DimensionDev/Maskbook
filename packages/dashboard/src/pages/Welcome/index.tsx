import { makeStyles } from '@masknet/theme'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { Services } from '../../API.js'
import { FooterLine } from '../../components/FooterLine/index.js'
import { HeaderLine } from '../../components/HeaderLine/index.js'
import { useDashboardI18N } from '../../locales/index.js'
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
    label: {
        marginTop: theme.spacing(2),
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
    const [read, setRead] = useState(true)
    const [allowedToCollect, setAllowedToCollect] = useState(false)

    const handleAgree = useCallback(async () => {
        const url = await Services.SocialNetwork.setupSite('twitter.com', false)
        if (url) location.assign(url)
        if (allowedToCollect) {
            Services.Settings.setLogEnable(true)
        }
    }, [])

    const t = useDashboardI18N()
    const { classes } = useStyles()
    return (
        <div className={classes.page}>
            <HeaderLine className={classes.header} />
            <main className={classes.content}>
                <Article className={classes.article} />
                <FormGroup className={classes.checkboxGroup}>
                    <FormControlLabel
                        className={classes.label}
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
                            <Typography>
                                I have read and agree to the{' '}
                                <a
                                    className={classes.link}
                                    target="_blank"
                                    href="https://legal.mask.io/maskbook/Service-Agreement-beta=%20browser.html">
                                    Service Agreement
                                </a>{' '}
                                and{' '}
                                <a
                                    className={classes.link}
                                    target="_blank"
                                    href="https://legal.mask.io/maskbook/privacy-policy-browser.html">
                                    Privacy Policy
                                </a>
                                .
                            </Typography>
                        }
                    />
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                className={classes.checkbox}
                                checked={allowedToCollect}
                                onChange={(event) => {
                                    setAllowedToCollect(event.currentTarget.checked)
                                }}
                            />
                        }
                        label="Allow us to collect your usage information to help us make improvements."
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
