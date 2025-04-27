import { getText } from '@zos/i18n'
import { createWidget, widget, align, text_style, getTextLayout, setStatusBarVisible } from '@zos/ui'
import { localStorage } from '@zos/storage'

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createBack } from '../utils/constants'

const words = localStorage.getItem('words', {})

Page({
    onInit() {
        setStatusBarVisible(false)

        let statParams = ['games', 'solved', 'unsolved', 'average']
        const stat = {
            games: Object.keys(words).length,
            solved: 0,
            unsolved: 0,
            attempts: 0,
            average: 0
        }
        for (const key in words) {
            if (words[key].isSolved) {
                stat.solved ++
                stat.attempts += words[key].attempt
            } else stat.unsolved ++
        }
        stat.average = stat.solved ? Math.floor(stat.attempts / stat.solved * 100) / 100 : 0

        let startY = isRound ? 50 : 20
        let contentH = startY
        let M = isRound ? 60 : 30

        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: 50,
            text: getText('statistic'),
            text_size: 32,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.NONE
        })

        contentH += 70

        statParams.forEach(key => {
            let statW = getTextLayout(`${stat[key]}`, { text_size: 32, text_width: 0 }).width
            createWidget(widget.TEXT, {
                x: M,
                y: contentH,
                w: SCREEN_WIDTH - M * 2 - statW - 20,
                h: 50,
                text: getText(key),
                text_size: 32,
                align_h: align.LEFT,
                align_v: align.CENTER_V,
                text_style: text_style.NONE,
                color: COLORS.secondary
            })
            createWidget(widget.TEXT, {
                x: SCREEN_WIDTH - M - statW,
                y: contentH,
                w: statW,
                h: 50,
                text: `${stat[key]}`,
                text_size: 32,
                align_h: align.RIGHT,
                align_v: align.CENTER_V,
                text_style: text_style.NONE,
                color: COLORS.primary
            })
            contentH += 60
        })

        createBack({ y: contentH })
    },
    build() { },
    onDestroy() { },
});