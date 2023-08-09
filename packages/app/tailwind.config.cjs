const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
        },
        colors: {
            black: '#000000',
            white: '#FFFFFF',
            link: { light: '#1C68F3', dark: '#ffffff' },
            menu: {
                light: 'rgb(249, 250, 250)',
                dark: 'rgb(37, 40, 70)',
            },
            item: {
                light: 'rgb(17, 20, 50)',
                dark: 'rgba(255, 255, 255, 0.8)',
            },
            line: {
                dark: 'rgb(50, 54, 91)',
                light: 'rgb(228, 232, 241)',
            },
            button: {
                dark: '#262947',
                light: '#F3F3F4',
            },
        },
    },
    variants: {},
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')],
    content: ['./src/**/*.ts', './src/**/*.tsx'],
}
