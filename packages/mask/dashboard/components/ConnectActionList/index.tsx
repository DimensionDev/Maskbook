import type { StyledComponent } from '@emotion/styled'
import { styled, listItemClasses, type Theme } from '@mui/material'
import type { MUIStyledCommonProps } from '@mui/system'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export const ConnectActionList: StyledComponent<
    MUIStyledCommonProps<Theme>,
    DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>
> = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    width: 520,
    // TODO: deep style
    [`& .${listItemClasses.root}`]: {
        marginBottom: theme.spacing(1.5),
    },
}))

export * from './ConnectActionListItem.js'
