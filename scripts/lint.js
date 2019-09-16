const path = require('path')
const argv = require('yargs').argv

const base = path.join(__dirname, '../')
process.chdir(base)

const reportOnly = argv.reportOnly
const { CLIEngine } = require('eslint')

const cli = new CLIEngine({
    fix: !reportOnly,
    cache: !reportOnly && !argv._.length,
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
})

const report = cli.executeOnFiles(argv._.length ? argv._ : ['.'])
if (!reportOnly) CLIEngine.outputFixes(report)

if (report.errorCount || report.warningCount) {
    report.results
        .filter(o => o.errorCount)
        .forEach(o => {
            return o.messages.forEach(m => {
                ;(m.severity === 2 ? console.error : console.warn)(
                    `At ${o.filePath}:${m.line}:${m.column} (${m.ruleId})\n\t${m.message}`,
                )
            })
        })
    if (report.errorCount) throw new Error('eslint found some error(s), please correct them.')
}
