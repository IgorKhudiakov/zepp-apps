import { setStatusBarVisible, createWidget, widget, align, text_style, event, prop, getImageInfo } from "@zos/ui"
import { getText } from "@zos/i18n"
import { localStorage } from "@zos/storage"
import { statAssetsSync } from "@zos/fs"
import { px } from "@zos/utils"

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createSpace, SETTINGS, CARD, createCheckBox, checkbox } from "../utils/constants"

Page({
    onInit() {
        setStatusBarVisible(false)

        let startY = px(isRound ? 50 : 20)
        let contentH = startY
        let M = px(isRound ? 36 : 32)
        const sizes = {
            cat: {              // Категория
                T: px(32),      // Размер текста (text_size)
                H: px(40),      // Высота текстового блока (height)
                M: px(20)       // Отступ (margin)
            },
            elem: {             // Элемент настройки
                H: px(55),      // Высота элемента
                title: {        // Заголовок
                    T: px(24),
                    H: px(30),
                    M: px(5)
                },
                desc: {         // Описание
                    T: px(16),
                    H: px(20)
                },
                M: px(30),      // Отступ
                G: {            // Внутренний отступ (gap)
                    V: px(20),  // Вертикальный
                    H: px(10)   // Горизонтальный
                }
            }
        }

        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: px(50),
            text: getText('settings'),
            text_size: px(32),
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.NONE
        })
        contentH += px(70)

        contentH += sizes.cat.M
        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: sizes.cat.H,
            text: getText('gameProcess'),
            text_size: sizes.cat.T,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: COLORS.primary
        })
        contentH += sizes.cat.H + sizes.cat.M

        const checkBoxes = ['redeal', 'autoFace', 'flashCard', 'autoHome', 'failVibro']

        checkBoxes.forEach((val) => {
            createWidget(widget.TEXT, {
                x: M,
                y: contentH,
                w: SCREEN_WIDTH - M * 2 - checkbox.W - sizes.elem.G.H,
                h: sizes.elem.title.H,
                text: getText(val),
                text_size: sizes.elem.title.T,
                align_h: align.LEFT,
                align_v: align.CENTER_V,
                text_style: text_style.NONE,
                color: COLORS.primary
            })
            createCheckBox({ x: SCREEN_WIDTH - M - checkbox.W, y: contentH + (sizes.elem.H - checkbox.H) / 2, param: val })
            contentH += sizes.elem.title.H + sizes.elem.title.M
            createWidget(widget.TEXT, {
                x: M,
                y: contentH,
                w: SCREEN_WIDTH - M * 2 - checkbox.W - sizes.elem.G.H,
                h: sizes.elem.desc.H,
                text: getText(`${val}Desc`),
                text_size: sizes.elem.desc.T,
                align_h: align.LEFT,
                align_v: align.CENTER_V,
                text_style: text_style.NONE,
                color: COLORS.secondary
            })
            contentH += sizes.elem.desc.H + sizes.elem.M
        })

        contentH += sizes.cat.M
        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: sizes.cat.H,
            text: getText('customization'),
            text_size: sizes.cat.T,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: COLORS.primary
        })
        contentH += sizes.cat.H + sizes.cat.M

        let bgMini = {
            W: Math.floor(CARD.H * (SCREEN_WIDTH / SCREEN_HEIGHT)),
            H: CARD.H,
        }
        bgMini.R = isRound ? CARD.H / 2 : Math.floor(bgMini.W / 5)
        let bgCols = Math.floor((SCREEN_WIDTH - 2 * M) / bgMini.W)
        let bgRows = Math.ceil(COLORS.bgs.length / bgCols)
        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: sizes.elem.title.H,
            text: getText('bgColor'),
            text_size: sizes.elem.title.T,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: COLORS.primary
        })
        contentH += sizes.elem.title.H + sizes.elem.G.V
        const bgColors = []
        const bgColorsGroup = createWidget(widget.GROUP, {
            x: M,
            y: contentH,
            w: bgCols * bgMini.W + (bgCols - 1) * CARD.M,
            h: (bgMini.H + CARD.M) * bgRows
        })
        for (let i = 0; i < COLORS.bgs.length; i++) {
            bgColors[i] = bgColorsGroup.createWidget(widget.FILL_RECT, {
                x: (bgMini.W + CARD.M) * (i % bgCols),
                y: (bgMini.H + CARD.M) * Math.floor(i / bgCols),
                w: bgMini.W,
                h: bgMini.H,
                color: COLORS.bgs[i],
                radius: bgMini.R
            })
            bgColors[i].addEventListener(event.CLICK_DOWN, () => { updateSettings('bgColor', i) })
            if (COLORS.bgs[i] == 0) {
                bgColorsGroup.createWidget(widget.STROKE_RECT, {
                    x: (bgMini.W + CARD.M) * (i % bgCols),
                    y: (bgMini.H + CARD.M) * Math.floor(i / bgCols),
                    w: bgMini.W,
                    h: bgMini.H,
                    color: COLORS.secondary,
                    line_width: 2,
                    radius: bgMini.R,
                    alpha: 50
                }).addEventListener(event.CLICK_DOWN, () => { updateSettings('bgColor', 0) })
            }
        }
        const bgColorsFg = bgColorsGroup.createWidget(widget.STROKE_RECT, {
            x: 0,
            y: 0,
            w: bgMini.W,
            h: bgMini.H,
            color: COLORS.primary,
            line_width: 2,
            radius: bgMini.R
        })
        contentH += (bgMini.H + CARD.M) * bgRows + px(20)

        let cardsCols = Math.floor((SCREEN_WIDTH - 2 * M) / CARD.W)
        cardsCols = Math.floor((SCREEN_WIDTH - 2 * M - CARD.M * (cardsCols - 1)) / CARD.W)
        let colorsRows = Math.ceil(COLORS.shirts.length / cardsCols)
        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: sizes.elem.title.H,
            text: getText('shirtColor'),
            text_size: sizes.elem.title.T,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: COLORS.primary
        })
        contentH += sizes.elem.title.H + sizes.elem.G.V
        const shirtColors = []
        const shirtsColorsGroup = createWidget(widget.GROUP, {
            x: M,
            y: contentH,
            w: cardsCols * CARD.W + (cardsCols - 1) * CARD.M,
            h: (CARD.H + CARD.M) * colorsRows
        })
        for (let i = 0; i < COLORS.shirts.length; i++) {
            shirtColors[i] = shirtsColorsGroup.createWidget(widget.FILL_RECT, {
                x: (CARD.W + CARD.M) * (i % cardsCols),
                y: (CARD.H + CARD.M) * Math.floor(i / cardsCols),
                w: CARD.W,
                h: CARD.H,
                color: COLORS.shirts[i],
                radius: CARD.R
            })
            shirtColors[i].addEventListener(event.CLICK_DOWN, () => { updateSettings('shirtColor', i) })
        }
        const shirtColorsFg = shirtsColorsGroup.createWidget(widget.STROKE_RECT, {
            x: 0,
            y: 0,
            w: CARD.W,
            h: CARD.H,
            color: COLORS.primary,
            line_width: 2,
            radius: CARD.R
        })
        contentH += (CARD.H + CARD.M) * colorsRows + sizes.elem.M

        let files = true
        let patternsCount = 0
        while (files) {
            let result = statAssetsSync({
                path: `/image/cards/shirts/${patternsCount}.png`
            })
            if (result?.size) patternsCount++
            else files = false
        }
        let patternsRows = Math.ceil(patternsCount / cardsCols)
        if (patternsCount) {
            createWidget(widget.TEXT, {
                x: M,
                y: contentH,
                w: SCREEN_WIDTH - M * 2,
                h: sizes.elem.title.H,
                text: getText('shirtImage'),
                text_size: sizes.elem.title.T,
                align_h: align.LEFT,
                align_v: align.CENTER_V,
                text_style: text_style.NONE,
                color: COLORS.primary
            })
            contentH += sizes.elem.title.H + sizes.elem.G.V
        }
        const shirtPatternsBg = []
        const shirtPatterns = []
        let patternImageSrc = "image/cards/shirts/0.png"
        let patternImageInfo = getImageInfo(patternImageSrc)
        let shirtPatternsFg = {}
        if (patternsCount) {
            const shirtsPatternsGroup = createWidget(widget.GROUP, {
                x: M,
                y: contentH,
                w: cardsCols * CARD.W + (cardsCols - 1) * CARD.M,
                h: (CARD.H + CARD.M) * patternsRows
            })
            for (let i = 0; i < patternsCount; i++) {
                shirtPatternsBg[i] = shirtsPatternsGroup.createWidget(widget.FILL_RECT, {
                    x: (CARD.W + CARD.M) * (i % cardsCols),
                    y: (CARD.H + CARD.M) * Math.floor(i / cardsCols),
                    w: CARD.W,
                    h: CARD.H,
                    radius: CARD.R
                })
                shirtPatterns[i] = shirtsPatternsGroup.createWidget(widget.IMG, {
                    x: (CARD.W + CARD.M) * (i % cardsCols) + (CARD.W - patternImageInfo.width) / 2,
                    y: (CARD.H + CARD.M) * Math.floor(i / cardsCols) + (CARD.H - patternImageInfo.height) / 2,
                    src: `image/cards/shirts/${i}.png`
                })
                shirtPatterns[i].addEventListener(event.CLICK_DOWN, () => { updateSettings('shirtPattern', i) })
            }
            shirtPatternsFg = shirtsPatternsGroup.createWidget(widget.STROKE_RECT, {
                x: 0,
                y: 0,
                w: CARD.W,
                h: CARD.H,
                color: COLORS.primary,
                line_width: 2,
                radius: CARD.R
            })
            contentH += (CARD.H + CARD.M) * patternsRows + sizes.elem.M
        }

        function updateSettings(type, index) {
            if (typeof index == "number") {
                SETTINGS[type] = index
                localStorage.setItem('settings', SETTINGS)
            } else index = SETTINGS[type]
            if (type == 'bgColor') {
                for (let i = 0; i < bgColors.length; i++) {
                    if (i == index) {
                        bgColorsFg.setProperty(prop.MORE, {
                            x: bgColors[i].getProperty(prop.X),
                            y: bgColors[i].getProperty(prop.Y)
                        })
                    }
                }
            } else if (type == "shirtColor") {
                for (let i = 0; i < COLORS.shirts.length; i++) {
                    if (i == index) {
                        shirtColorsFg.setProperty(prop.MORE, {
                            x: shirtColors[i].getProperty(prop.X),
                            y: shirtColors[i].getProperty(prop.Y)
                        })
                        offsetBg.setProperty(prop.COLOR, COLORS.shirts[i])
                        shirtPatternsBg.forEach(el => { el.setProperty(prop.COLOR, COLORS.shirts[i]) })
                    }
                }
            } else if (type == "shirtPattern") {
                for (let i = 0; i < patternsCount; i++) {
                    if (i == index) {
                        shirtPatternsFg.setProperty(prop.MORE, {
                            x: shirtPatternsBg[i].getProperty(prop.X),
                            y: shirtPatternsBg[i].getProperty(prop.Y)
                        })
                    }
                }
            }
        }

        createWidget(widget.TEXT, {
            x: M,
            y: contentH,
            w: SCREEN_WIDTH - M * 2,
            h: sizes.elem.title.H,
            text: getText('cardOffset'),
            text_size: sizes.elem.title.T,
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: COLORS.primary
        })
        contentH += sizes.elem.title.H + sizes.elem.G.V

        function updateOffset(isChange) {
            index = SETTINGS.cardOffset
            if (isChange) {
                index = (index + 1) % 3
                SETTINGS.cardOffset = index
                localStorage.setItem('settings', SETTINGS)
            }
            offsetFg.setProperty(prop.SRC, `image/offset/${index}.png`)
        }
        let offsetImgSrc = 'image/offset/0.png'
        const offsetImg = getImageInfo(offsetImgSrc)
        const offsetBg = createWidget(widget.FILL_RECT, {
            x: M + 1,
            y: contentH + 1,
            w: offsetImg.width - 2,
            h: offsetImg.height - 2
        })
        const offsetFg = createWidget(widget.IMG, {
            x: M,
            y: contentH,
            w: offsetImg.width,
            h: offsetImg.height,
            src: offsetImgSrc,
            auto_scale: false
        })
        offsetFg.addEventListener(event.CLICK_DOWN, () => { updateOffset(true) })
        contentH += offsetImg.height

        updateSettings('bgColor')
        updateSettings('shirtColor')
        updateSettings('shirtPattern')
        updateOffset()

        createSpace({ y: contentH, h: (isRound ? 100 : 20) })
    }
})