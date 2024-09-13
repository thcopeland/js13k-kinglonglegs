import copy from './rollup-plugin-copy.mjs'
import gsub from './rollup-plugin-gsub.mjs'
import html from './rollup-plugin-html.mjs'
import terser from '@rollup/plugin-terser'
import zip from './rollup-plugin-zip.mjs'

const release = !process.env.ROLLUP_WATCH

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'iife',
            strict: false,
            sourcemap: !release,
        },
        plugins: [
            gsub({
                IS_DEVELOPMENT_BUILD: !release // terser will remove dead code like `if (!1)`
            }),
            release && terser({
                mangle: {
                    properties: {
                        keep_quoted: false
                    }
                }
            }),
            copy({}),
            html({ template: 'src/index.html' }),
            release && zip({ file: 'dist/kinglonglegs.zip' })
        ]
    }
]
