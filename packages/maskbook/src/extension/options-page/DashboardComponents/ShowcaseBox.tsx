import { useRef } from 'react'
import { useCopyToClipboard } from 'react-use'
import { createStyles, Paper, Typography, makeStyles, TypographyProps } from '@material-ui/core'
import { selectElementContents } from '../../../utils/utils'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { useSnackbar } from 'notistack'

const useStyle = makeStyles((theme) =>
    createStyles({
        title: {
            fontSize: 12,
            lineHeight: 1.75,
            marginTop: theme.spacing(2),
        },
        paper: {
            height: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'light' ? '#FAFAFA' : '',
            boxShadow: 'none',
            padding: theme.spacing(2, 3),
        },
        scroller: {
            userSelect: 'text',
            height: '100%',
            overflow: 'auto',
            wordBreak: 'break-word',
        },
        tip: {
            textAlign: 'right',
            color: theme.palette.grey[500],
        },
    }),
)

export interface ShowcaseBoxProps {
    title?: string
    TitleProps?: TypographyProps<'h5'>
    ContentProps?: TypographyProps<'div'>
    children?: React.ReactNode
}

export default function ShowcaseBox(props: ShowcaseBoxProps) {
    const { t } = useI18N()
    const classes = useStyle()
    const { title, children, TitleProps, ContentProps } = props
    const ref = useRef<HTMLDivElement>(null)
    const xsMatch = useMatchXS()
    const [, copy] = useCopyToClipboard()
    const { enqueueSnackbar } = useSnackbar()
    const copyText = xsMatch
        ? () => {
              copy(ref.current!.innerText)
              enqueueSnackbar(t('copy_success_of_text'), {
                  variant: 'success',
                  preventDuplicate: false,
                  anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'center',
                  },
              })
          }
        : () => selectElementContents(ref.current!)
    return (
        <>
            {title ? (
                <Typography className={classes.title} component="h5" {...TitleProps}>
                    {title}
                </Typography>
            ) : null}
            <Paper className={classes.paper}>
                <div className={classes.scroller} data-testid="prove_textarea">
                    <Typography component="div" variant="body1" onClick={copyText} ref={ref} {...ContentProps}>
                        {children}
                    </Typography>
                    {xsMatch ? (
                        <Typography component="p" variant="body2" className={classes.tip}>
                            {t('copy_to_clipboard')}
                        </Typography>
                    ) : null}
                </div>
            </Paper>
        </>
    )
}
