import { Icons } from '@masknet/icons'
import { MaskColors, makeStyles } from '@masknet/theme'
import { IconButton } from '@mui/material'
import type { JSX } from 'react'

export interface BannerProps extends withClasses<'header' | 'content' | 'actions' | 'buttonText'> {
    description?: string
    nextStep:
        | 'hidden'
        | {
              onClick(): void
          }
    username?:
        | 'hidden'
        | {
              isValid(username: string): boolean
              value: string
              defaultValue: string
              onChange(nextValue: string): void
          }
    iconType?: string
}

const ICON_MAP: { [property: string]: JSX.Element } = {
    minds: <Icons.MaskInMinds size={18} />,
    default: <Icons.SharpMask size={17} color={MaskColors.light.maskColor.publicTwitter} />,
}
const useStyles = makeStyles()({
    buttonText: {
        width: 38,
        height: 38,
        margin: '10px 0',
    },
})

/**
 * The "sign in with Mask" entry point injected into the compose box on every site adaptor.
 * Pure UI: whether it should render at all, and what the default next step/username field are,
 * is decided by the caller (see packages/mask/content-script/components/Welcomes/Banner.tsx).
 */
export function Banner(props: BannerProps) {
    const { classes } = useStyles(undefined, { props })

    return props.nextStep === 'hidden' ?
            null
        :   <IconButton size="large" className={classes.buttonText} onClick={props.nextStep.onClick}>
                {ICON_MAP[props.iconType ?? 'default']}
            </IconButton>
}
