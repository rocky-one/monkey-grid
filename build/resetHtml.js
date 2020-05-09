const path = require('path')
const cheerio = require('cheerio')
const fs = require('fs')
const chalk = require('chalk')
const DISTPATH = path.resolve(__dirname, '../dist/index.html');//'../dist/index.html'
const prefix = ['default', 'green', 'red']
const cssUrls = {}

function extractCss() {
    fs.readFile(DISTPATH, 'utf8', (err, data) => {
        if (err) {
            throw err
        }
        const $ = cheerio.load(data)
        /**
         * 删除所有主题css，相关链接保存在window.cssUrls中
         */
        $('link').each((index, item) => {
            const href = $(item).attr('href')
            for (const val of prefix) {
                if (href.indexOf(val) !== -1) {
                    cssUrls[val] = href
                    $(item).remove()
                }
            }
        })
        /**
         * 删除无用的js
         */
        $('script').each((index, item) => {
            const src = $(item).attr('src')
            for (const val of prefix) {
                if (src && src.indexOf(val) !== -1) {
                    $(item).remove()
                }
            }
        })

        //插入行内js
        $('#app').after(`<script>window.cssUrls=${JSON.stringify(cssUrls)}</script>`)
        fs.writeFile(DISTPATH, $.html(), err => {
            if (err) {
                throw err
            }
            console.log(chalk.cyan('extract css url complete.\n'))
        })
    })
}
extractCss()
