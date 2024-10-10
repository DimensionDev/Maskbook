import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { unreachable } from '@masknet/kit'
import { ConnectPersonaBoundary } from '@masknet/shared'
import { EncryptionTargetType, currentPersonaIdentifier } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { PopoverListTrigger } from './PopoverListTrigger.js'
import { PopoverListItem } from './PopoverListItem.js'
import { E2EUnavailableReason } from './CompositionUI.js'
import { usePersonasFromDB } from '../../../shared-ui/hooks/usePersonasFromDB.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import Services from '#services'
import { Plural, Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        lineHeight: '18px',
        fontSize: 14,
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    divider: {
        width: '100%',
        height: 1,
        background: theme.palette.divider,
        margin: '8px 0',
    },
    mainTitle: {
        color: theme.palette.text.primary,
        fontWeight: 700,
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 4,
        boxSizing: 'border-box',
    },
    create: {
        cursor: 'pointer',
        fontWeight: 700,
        color: theme.palette.maskColor.primary,
        textAlign: 'right',
    },
    rightIcon: {
        marginLeft: 'auto',
    },
}))

interface EncryptionTargetSelectorProps {
    target: EncryptionTargetType
    e2eDisabled: E2EUnavailableReason | undefined
    onClick(v: EncryptionTargetType): void
    selectedRecipientLength: number
}
export function EncryptionTargetSelector(props: EncryptionTargetSelectorProps) {
    const { classes } = useStyles()

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const allPersonas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const e2eDisabledMessage =
        props.e2eDisabled && props.e2eDisabled !== E2EUnavailableReason.NoLocalKey ?
            <div className={classes.flex}>
                <Typography className={classes.mainTitle}>
                    <Trans>Persona required.</Trans>
                </Typography>
                <Box flex={1} />
                <ConnectPersonaBoundary
                    personas={allPersonas}
                    identity={lastRecognized}
                    currentPersonaIdentifier={currentIdentifier}
                    openDashboard={Services.Helper.openDashboard}
                    customHint
                    handlerPosition="top-right"
                    enableVerify={false}
                    createConfirm={false}>
                    {(s) => {
                        if (!s.hasPersona)
                            return (
                                <Typography className={classes.create}>
                                    <Trans>Create</Trans>
                                </Typography>
                            )
                        // TODO: how to handle verified
                        if (!s.connected || !s.verified)
                            return (
                                <Typography className={classes.create}>
                                    <Trans>Connect</Trans>
                                </Typography>
                            )

                        return null
                    }}
                </ConnectPersonaBoundary>
            </div>
        :   null
    const noLocalKeyMessage = props.e2eDisabled === E2EUnavailableReason.NoLocalKey && (
        <div className={classes.flex}>
            <Typography className={classes.mainTitle}>
                <Trans>No local key</Trans>
            </Typography>
        </div>
    )

    const selectedTitle = () => {
        const selected = props.target
        const shareWithNum = props.selectedRecipientLength
        if (selected === EncryptionTargetType.E2E)
            return <Plural one="1 friend" other="# friends" value={shareWithNum} />
        else if (selected === EncryptionTargetType.Public) return <Trans>All</Trans>
        else if (selected === EncryptionTargetType.Self) return <Trans>Private</Trans>
        unreachable(selected)
    }
    return (
        <>
            <Typography className={classes.optionTitle}>
                <Trans>Visible To</Trans>
            </Typography>
            <PopoverListTrigger
                selected={props.target}
                selectedTitle={selectedTitle()}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={(v) => {
                    props.onClick(v as EncryptionTargetType)
                    if (v === EncryptionTargetType.E2E) setAnchorEl(null)
                }}>
                <PopoverListItem
                    value={EncryptionTargetType.Public}
                    title={<Trans>All</Trans>}
                    subTitle={<Trans>Everyone</Trans>}
                />
                <div className={classes.divider} />
                <PopoverListItem
                    disabled={!!props.e2eDisabled}
                    value={EncryptionTargetType.Self}
                    title={<Trans>Private</Trans>}
                    subTitle={<Trans>Just Me</Trans>}
                />
                {e2eDisabledMessage}
                {noLocalKeyMessage}
                <div className={classes.divider} />
                <PopoverListItem
                    itemTail={<Icons.RightArrow className={classes.rightIcon} />}
                    disabled={!!props.e2eDisabled}
                    value={EncryptionTargetType.E2E}
                    title={<Trans>Share with</Trans>}
                    subTitle={<Trans>Just Selected Contacts</Trans>}
                    onClick={(v: string) => {
                        if (props.e2eDisabled) return
                        props.onClick(v as EncryptionTargetType)
                        if (v === EncryptionTargetType.E2E) setAnchorEl(null)
                    }}
                />
                {e2eDisabledMessage}
                {noLocalKeyMessage}
            </PopoverListTrigger>
        </>
    )
}
