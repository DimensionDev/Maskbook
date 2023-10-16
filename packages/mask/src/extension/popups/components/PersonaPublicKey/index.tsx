import { Icons } from '@masknet/icons'
import { CopyButton } from '@masknet/shared'
import { formatPersonaFingerprint } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles<{ iconSize: number }>()((theme, { iconSize }) => ({
    text: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.palette.maskColor.third,
        display: 'flex',
        columnGap: 2,
        alignItems: 'center',
    },
    icon: {
        width: iconSize,
        height: iconSize,
        fontSize: iconSize,
        lineHeight: `${iconSize}px`,
        color: theme.palette.maskColor.third,
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
            <Link
                underline="none"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://web3.bio/${publicHexString}`}
                className={classes.icon}>
                <Icons.LinkOut size={iconSize} />
            </Link>
        </Typography>
    )
})
