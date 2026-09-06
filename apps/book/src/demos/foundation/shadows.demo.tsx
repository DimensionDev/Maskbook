import { Box, Paper, Stack, Typography, useTheme } from '@mui/material'

export const meta = {
    title: 'Shadows & elevation',
    description: 'theme.vars.palette.shadow.* tokens plus MUI Paper elevation.',
}

export default function ShadowsDemo() {
    const theme = useTheme()
    const shadow = theme.vars.palette.shadow as Record<string, string>

    return (
        <Stack spacing={4}>
            <div>
                <Typography variant="subtitle2" gutterBottom>
                    Mask shadow tokens
                </Typography>
                <div className="book-demo-grid">
                    {Object.entries(shadow).map(([name, value]) => (
                        <Box
                            key={name}
                            sx={{
                                width: 200,
                                height: 96,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.paper',
                                boxShadow: value,
                            }}>
                            {name}
                        </Box>
                    ))}
                </div>
            </div>

            <div>
                <Typography variant="subtitle2" gutterBottom>
                    MUI elevation
                </Typography>
                <div className="book-demo-grid">
                    {[0, 1, 2, 4, 8, 16, 24].map((elevation) => (
                        <Paper
                            key={elevation}
                            elevation={elevation}
                            sx={{
                                width: 140,
                                height: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            elevation={elevation}
                        </Paper>
                    ))}
                </div>
            </div>
        </Stack>
    )
}
