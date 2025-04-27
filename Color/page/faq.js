import { getText } from '@zos/i18n'
import { createWidget, widget, align, text_style, getTextLayout, setStatusBarVisible } from '@zos/ui'
import { getLanguage } from '@zos/settings'

import { isRound, SCREEN_WIDTH, SCREEN_HEIGHT, COLORS, createBottomSpace } from '../utils/constants'
const lang = getLanguage()

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
            text: getText('faq'),
            text_size: 32,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.NONE
        })
        contentH += 70


        let text = {
            4: `На главной странице добавьте цветовые схемы. Затем нажмите на нужную схему, чтобы перейти к редактированию. Выберите элемент и поменяйте цвет, либо вкл/выкл видимость кнопкой ◉. Изменения будут отображаться сразу. Кнопка справа продублирует схему. Чтобы удалить схему, нажмите на неё и удерживайте. Подтвердите удаление.`,
            2: `Add color schemes on the main page. Then click on the desired scheme to proceed to editing. Select an item and change the color, or turn on/off visibility with the ◉ button. The changes will be displayed immediately. The button on the right duplicates the diagram. To delete a diagram, tap and hold on it. Confirm the deletion.`,
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
        contentH += textH + 10

        if (isRound) createBottomSpace(contentH)
    },
    build() { },
    onDestroy() { },
});