import { getText } from '@zos/i18n'
import { createWidget, widget, prop, align, text_style, getTextLayout, setStatusBarVisible } from '@zos/ui'
import { getLanguage } from '@zos/settings'

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createBack, AREA } from '../utils/constants'
const lang = getLanguage() == 4 ? 'ru' : 'en'

Page({
    onInit() {
        setStatusBarVisible(false)

        let startY = isRound ? 50 : 20
        let contentH = startY
        let M = isRound ? 50 : 20

        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: 50,
            text: getText('htp'),
            text_size: 32,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.NONE
        })
        contentH += 70


        let text = {
            ru: `В данной игре тебе предстоит отгадывать слова из ${AREA.COLS} букв. На каждое слово ${AREA.ROWS} попыток, которые дадут подсказки:`,
            en: `In this game, you have to guess the words from ${AREA.COLS} letters. For each word ${AREA.ROWS} of attempts that will give hints:`,
        }
        let textH = getTextLayout(text[lang], { text_size: 24, text_width: SCREEN_WIDTH - M * 2 }).height
        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: textH,
            text: text[lang],
            text_size: 24,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            color: COLORS.primary
        })
        contentH += textH + 30

        const letters = {
            ru: ['А', 'Б', 'В'],
            en: ['A', 'B', 'C']
        }
        const colors = [COLORS.green, COLORS.orange, COLORS.gray]
        let groups = []
        for (let i = 0; i < letters[lang].length; i++) {
            groups[i] = createWidget(widget.GROUP, {
                x: M,
                y: contentH,
                w: SCREEN_WIDTH - M * 2,
                h: 30
            })
            groups[i].createWidget(widget.BUTTON, {
                x: 0,
                y: 0,
                w: 40,
                h: 40,
                radius: 5,
                text: letters[lang][i],
                text_size: 24,
                color: COLORS.primary,
                normal_color: colors[i],
                press_color: colors[i]
            })
            groups[i].createWidget(widget.TEXT, {
                x: 50,
                y: 0,
                w: SCREEN_WIDTH - M * 2 - 40,
                h: 40,
                radius: 5,
                text: getText(`letter${i + 1}`),
                text_size: 24,
                color: COLORS.primary,
                align_h: align.LEFT,
                align_v: align.CENTER_V
            })
            contentH += 50
        }
        contentH += 20
        
        text = {
            ru: 'Весь прогресс в игре сохраняется, пропустить слово нельзя. Если выйти из игры и вернуться, игра продолжится с того же места. Новые слова выбираются случайным образом.',
            en: 'All the progress in the game is saved, you can not skip a word. If you exit the game and come back, the game will continue from the same place. New words are randomly selected.',
        }
        textH = getTextLayout(text[lang], { text_size: 24, text_width: SCREEN_WIDTH - M * 2 }).height
        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: textH,
            text: text[lang],
            text_size: 24,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            color: COLORS.primary
        })
        contentH += textH + 10

        createBack({ y: contentH })
    },
    build() { },
    onDestroy() { },
});