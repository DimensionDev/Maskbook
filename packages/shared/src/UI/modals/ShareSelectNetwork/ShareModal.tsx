import urlcat from 'urlcat'
import { memo, useMemo, useState } from 'react'
import { SocialNetworkEnum, SocialNetworkEnumToProfileDomain, socialNetworkEncoder } from '@masknet/encryption'
import { Icons } from '@masknet/icons'
import { InjectedDialog, useSharedI18N } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { Button, DialogContent, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material'

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
        paddingTop: 8,
        paddingBottom: 8,
        fontWeight: 700,
    },
    network: {
        gap: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
    },
    actions: {
        gap: 12,
        display: 'flex',
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

const SharedUrl: Record<SocialNetworkEnum, ((message: string) => URL) | undefined> = {
    [SocialNetworkEnum.Unknown]: undefined,
    [SocialNetworkEnum.Instagram]: undefined,
    [SocialNetworkEnum.Minds]: undefined,
    [SocialNetworkEnum.Twitter]: (message: string) => {
        const url = urlcat('https://twitter.com/intent/tweet', { text: message })
        return new URL(url)
    },
    [SocialNetworkEnum.Facebook]: (message: string) => {
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

    const [network, setNetwork] = useState<SocialNetworkEnum>(SocialNetworkEnum.Twitter)

    const encodedText = useMemo(() => {
        if (!message) return
        const text = socialNetworkEncoder(network, message)
        return text
    }, [message, network])

    return (
        <InjectedDialog open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <div className={classes.textBorder}>
                    <Typography sx={{ wordBreak: 'break-all' }}>{encodedText}</Typography>
                </div>
                <Typography className={classes.title}>Network</Typography>
                <RadioGroup
                    className={classes.network}
                    defaultValue={network}
                    onChange={(e) => {
                        const network = Number.parseInt(e.currentTarget.value, 10) as SocialNetworkEnum
                        setNetwork(network)
                    }}>
                    {Object.entries(SharedUrl).map(([site, converter]) => {
                        if (!converter) return undefined
                        return (
                            <FormControlLabel
                                key={site}
                                label={SocialNetworkEnumToProfileDomain(Number.parseInt(site, 10) as SocialNetworkEnum)}
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
                        }}>
                        {t.share()}
                    </Button>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
})

ShareSelectNetwork.displayName = 'ShareSelectNetworkDialog'
