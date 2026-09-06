import { useTheme } from '@mui/material'

export const meta = {
    title: 'Color palette',
    description: 'theme.vars.palette.maskColor — the active palette follows the sidebar Light/Dark toggle.',
}

export default function ColorsDemo() {
    const theme = useTheme()
    const maskColor = theme.vars.palette.maskColor as Record<string, string>

    return (
        <div className="book-demo-grid">
            {Object.entries(maskColor).map(([name, value]) => (
                <div className="book-swatch" key={name}>
                    <div className="chip" style={{ background: value }} />
                    <div className="label">
                        <div>{name}</div>
                        <code>{value}</code>
                    </div>
                </div>
            ))}
        </div>
    )
}
