import { memo, useState } from 'react'
import { getMaskColor, MaskColorVar, MaskDialog } from '@masknet/theme'
import { Button, makeStyles, Stack, Typography } from '@material-ui/core'
import classNames from 'classnames'
import { Check } from '@material-ui/icons'
import styled from '@emotion/styled'
import { MaskAlert } from '../MaskAlert'
import { useDashboardI18N } from '../../locales'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '10px 40px 40px 40px',
    },
    card: {
        marginBottom: 15,
        borderRadius: Number(theme.shape.borderRadius) * 3,
        backgroundColor: getMaskColor(theme).secondaryBackground,
        display: 'flex',
        padding: theme.spacing(1.25),
        minWidth: 320,
        cursor: 'pointer',
    },
    persona: {
        lineHeight: '16px',
        color: `${MaskColorVar.secondaryInfoText}`,
        fontSize: `${theme.typography.caption.fontSize}`,
    },
    status: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        marginRight: theme.spacing(1.25),
        marginTop: theme.spacing(0.625),
    },
    statusInactivated: {
        backgroundColor: MaskColorVar.iconLight,
    },
    statusActivated: {
        backgroundColor: MaskColorVar.greenMain,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: theme.typography.caption.fontSize,
    },
    content: {
        marginTop: theme.spacing(1.25),
        paddingRight: theme.spacing(1.25),
    },
}))

export interface PersonaInfo {
    nickname?: string
    identifier: string
    linkedProfiles: {
        identifier: string
        nickname?: string
    }[]
}

interface PersonaSelectorProps {
    personas: PersonaInfo[]
    onSubmit(identifier: string): void
}

const CheckICon = styled(Check)(
    ({ theme }) => `
    width: 14px;
    height: 14px;
    padding: 2px;
    background-color: ${MaskColorVar.greenMain.alpha(0.2)};
    color: ${MaskColorVar.greenMain};
    border-radius: 50%
`,
)

export const PersonaSelector = memo(({ personas, onSubmit }: PersonaSelectorProps) => {
    const t = useDashboardI18N()
    const classes = useStyles()
    const [selected, setSelected] = useState('')
    const [isOpen, open] = useState(true)

    return (
        <MaskDialog title="Select Persona" open={isOpen}>
            <div className={classes.root}>
                {personas.map((persona, index) => {
                    return (
                        <div className={classes.card} key={index} onClick={() => setSelected(persona.identifier)}>
                            <div
                                className={classNames(
                                    classes.status,
                                    persona.identifier === selected
                                        ? classes.statusActivated
                                        : classes.statusInactivated,
                                )}
                            />
                            <div style={{ flex: 1 }}>
                                <div className={classes.header}>
                                    <Typography variant="subtitle2" sx={{ cursor: 'pointer' }}>
                                        {persona.nickname}
                                    </Typography>
                                </div>
                                <div className={classes.content}>
                                    {persona.linkedProfiles.map((profile, index) => {
                                        return <div key={index}>@{profile.nickname}</div>
                                    })}
                                </div>
                            </div>
                            <div>{persona.identifier === selected && <CheckICon />}</div>
                        </div>
                    )
                })}
                <MaskAlert
                    description="As our new version of Dashboard optimized data structures, we need you to choose an old persona as your identity, which will be used to sign in and post encrypted messages."
                />
                <Stack direction="row" spacing={2}>
                    <Button color="secondary">{t.wallets_import_wallet_cancel()}</Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            onSubmit(selected)
                            open(false)
                        }}
                        disabled={!selected}>
                        {t.wallets_import_wallet_import()}
                    </Button>
                </Stack>
            </div>
        </MaskDialog>
    )
})
