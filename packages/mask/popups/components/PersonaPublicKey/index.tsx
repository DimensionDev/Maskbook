import { CopyButton } from '@masknet/shared'
import { formatPersonaFingerprint } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles<{ iconSize: number }>()((theme, { iconSize }) => ({
    text: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.vars.palette.maskColor.third,
        display: 'flex',
        columnGap: 2,
        alignItems: 'center',
    },
    icon: {
        width: iconSize,
        height: iconSize,
        fontSize: iconSize,
        lineHeight: `${iconSize}px`,
        color: theme.vars.palette.maskColor.third,
    },
}))

interface PersonaPublicKeyProps extends withClasses<'text' | 'icon'> {
    rawPublicKey: string
    publicHexString: string
    iconSize: number
}

export const PersonaPublicKey = memo<PersonaPublicKeyProps>(function PersonaPublicKey({
    rawPublicKey,
    publicHexString,
    iconSize,
    ...rest
}) {
    const { classes } = useStyles({ iconSize }, { props: rest })

    return (
        <Typography className={classes.text}>
            {formatPersonaFingerprint(rawPublicKey, 4)}
            <CopyButton text={rawPublicKey} className={classes.icon} size={iconSize} />
        </Typography>
    )
})
