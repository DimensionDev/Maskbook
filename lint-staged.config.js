export default {
    '*': 'prettier --write --ignore-unknown',
    'packages/**/*.{ts,tsx,js,jsx}': 'eslint --fix',
    'cspell.json': () => 'gulp reorder-spellcheck',
    'packages/**/*.svg': 'pnpm svgo',
}
