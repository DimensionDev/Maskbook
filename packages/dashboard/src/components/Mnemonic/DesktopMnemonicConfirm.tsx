import { TextField, experimentalStyled as styled } from '@material-ui/core'
import { useRef, memo } from 'react'

const Container = styled('div')({
    display: 'inline-grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    '& > *': {
        width: 124,
        height: 48,
    },
})
const a12 = [...Array(12).keys()]
export interface DesktopMnemonicConfirmProps {
    onChange(mnemonics: (string | undefined)[]): void
}
export const DesktopMnemonicConfirm = memo((props: DesktopMnemonicConfirmProps) => {
    const value = useRef<Readonly<Record<string, string>>>({ length: 12 as any })
    return (
        <Container>
            {a12.map((i) => (
                <TextField
                    key={i}
                    label={i + 1 + '.'}
                    variant="filled"
                    size="small"
                    onChange={(e) => {
                        value.current = { ...value.current, [i]: e.currentTarget.value }
                        props.onChange(Array.from(value.current as any))
                    }}
                />
            ))}
        </Container>
    )
})
