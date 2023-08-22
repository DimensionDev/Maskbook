import urlcat from 'urlcat'
import { memo, useMemo, useState } from 'react'
import { EncryptPayloadNetwork, encryptPayloadNetworkToDomain, encodeByNetwork } from '@masknet/encryption'
import { Icons } from '@masknet/icons'
import { CopyButton, InjectedDialog, useSharedI18N } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Button, DialogContent, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material'
import { SOCIAL_MEDIA_NAME } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    content: {
        display: 'flex',
        padding: theme.spacing(2),
        height: 400,
        flexDirection: 'column',
    },
    textBorder: {
        flex: 1,
        border: `1px solid ${theme.palette.maskColor.borderSecondary}`,
        borderRadius: 8,
        padding: 8,
    },
    title: {
        paddingTop: 16,
        paddingBottom: 0,
        fontWeight: 700,
    },
    network: {
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 8,
        paddingBottom: 8,
    },
    actions: {
        gap: 12,
        display: 'flex',
        paddingTop: 8,
    },
    button: {
        flex: 1,
    },
}))

interface ShareSelectNetworkProps {
    open: boolean
    onClose: () => void
    message: Uint8Array
}

const SharedUrl: Record<EncryptPayloadNetwork, ((message: string) => URL) | undefined> = {
    [EncryptPayloadNetwork.Unknown]: undefined,
    [EncryptPayloadNetwork.Instagram]: undefined,
    [EncryptPayloadNetwork.Minds]: undefined,
    [EncryptPayloadNetwork.Twitter]: (message: string) => {
        const url = urlcat('https://twitter.com/intent/tweet', { text: message })
        return new URL(url)
    },
    [EncryptPayloadNetwork.Facebook]: (message: string) => {
        const url = urlcat('https://www.facebook.com/sharer/sharer.php', {
            quote: message,
            u: 'mask.io',
        })
        return new URL(url)
    },
}

export const ShareSelectNetwork = memo<ShareSelectNetworkProps>(({ open, onClose, message }) => {
    const { classes } = useStyles()
    const theme = useTheme()
    const t = useSharedI18N()
    const [network, setNetwork] = useState<EncryptPayloadNetwork>(EncryptPayloadNetwork.Twitter)
    const encodedText = useMemo(() => {
        if (!message) return
        const text = encodeByNetwork(network, message)
        return text
    }, [message, network])

    return (
        <InjectedDialog open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    <CopyButton size={17.5} text={encodedText ?? ''} />
                </div>
                <div className={classes.textBorder}>
                    <Typography sx={{ wordBreak: 'break-all' }}>{encodedText}</Typography>
                </div>
                <Typography className={classes.title}>{t.share_to_social_networks()}</Typography>
                <RadioGroup
                    className={classes.network}
                    defaultValue={network}
                    onChange={(e) => {
                        const network = Number.parseInt(e.currentTarget.value, 10) as EncryptPayloadNetwork
                        setNetwork(network)
                    }}>
                    {Object.entries(SharedUrl)
                        .filter(([_, converter]) => converter)
                        .map(([site]) => {
                            return (
                                <FormControlLabel
                                    key={site}
                                    label={SOCIAL_MEDIA_NAME[encryptPayloadNetworkToDomain(Number.parseInt(site, 10))]}
                                    value={site}
                                    control={
                                        <Radio
                                            color="primary"
                                            value={site}
                                            icon={
                                                <Icons.RadioButtonUnChecked
                                                    color={theme.palette.maskColor.line}
                                                    size={18}
                                                />
                                            }
                                            checkedIcon={<Icons.RadioButtonChecked size={18} />}
                                        />
                                    }
                                />
                            )
                        })}
                </RadioGroup>
                <div className={classes.actions}>
                    <Button className={classes.button} variant="roundedOutlined" onClick={onClose}>
                        {t.cancel()}
                    </Button>
                    <Button
                        className={classes.button}
                        variant="roundedContained"
                        disabled={!encodedText}
                        onClick={() => {
                            if (!encodedText) return
                            openWindow(SharedUrl[network]?.(encodedText))
                            onClose()
                        }}>
                        {t.share()}
                    </Button>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
})

ShareSelectNetwork.displayName = 'ShareSelectNetworkDialog'
