import fs from 'fs'

/**
 * A Rollup plugin to combine JS and HTML into a single file.
 */

export default function ({ template }) {
    return {
        name: 'html',
        generateBundle: function (options, bundle) {
            for (const file in bundle) {
                const data = bundle[file]

                if (data.type == 'chunk') {
                    const bundled = fs.readFileSync(template)
                        .toString()
                        .replace('{{{ }}}', () => data.code.trim())

                    this.emitFile({
                        type: 'asset',
                        source: bundled,
                        name: 'Final Output',
                        fileName: 'index.html'
                    })
                }
            }
        }
    }
}
