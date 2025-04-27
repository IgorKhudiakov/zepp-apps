import { getText } from '@zos/i18n'
import { createWidget, widget, prop, align, text_style, getTextLayout, setStatusBarVisible, deleteWidget } from '@zos/ui'
import { getScrollTop, scrollTo, setScrollLock } from '@zos/page'
import { localStorage } from '@zos/storage'
import { getLanguage } from '@zos/settings'

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, KEYBOARDS, BUTTON_PARAMS, SESSION_TEMPLATE, AREA, getNewWord } from '../utils/constants'
import { push, replace } from '@zos/router'
import { Vibrator } from '@zos/sensor'

const lang = localStorage.getItem('lang', getLanguage() == 4 ? 'ru' : 'en')

const words = localStorage.getItem('words', {})
let isDone = false

const vibrator = new Vibrator()

function saveSession() {
  localStorage.setItem('session', session)
}

const session = localStorage.getItem('session', SESSION_TEMPLATE)
if (session.c.length == 0) {
  let newWord = getNewWord(lang, words)
  if (newWord) {
    session.c = newWord
    saveSession()
  } else isDone = true
}

Page({
  build() {

    setStatusBarVisible(false)

    function scrollTop() {
      scrollTo(-(padding.top + btn.H))
    }

    function clearData() {
      for (let i = 0; i < session.s.length; i++) {
        for (let j = 0; j < session.s[i].length; j++) {
          session.s[i][j] = ''
          text[i][j].setProperty(prop.TEXT, '_')
        }
      }
      session.c = []
      session.a = []
      session.i = 0
      session.w = []
      session.wordsCount = Object.keys(words).length
      saveSession()
      scrollTop()
    }

    function saveWord(data) {
      words[session.c.join('')] = {
        isSolved: data.isSolved,
        attempt: data.attempt
      }
      localStorage.setItem('words', words)
    }

    function showInfo(isSolved) {
      setScrollLock({
        lock: true
      })
      const showGroup = createWidget(widget.GROUP, {
        x: 0,
        y: - getScrollTop(),
        w: 0,
        h: 0
      })
      showGroup.createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })
      const letter = {
        W: 50,
        H: 50,
        R: 10,
        M: 5
      }
      showGroup.createWidget(widget.TEXT, {
        x: padding.left,
        y: (SCREEN_HEIGHT - letter.H) / 2 - 60,
        w: SCREEN_WIDTH - 2 * padding.left,
        h: 40,
        text: getText(isSolved ? "congratulation" : "fail"),
        text_size: 24,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        color: COLORS.secondary
      })
      for (let i = 0; i < AREA.COLS; i++) {
        showGroup.createWidget(widget.BUTTON, {
          x: (SCREEN_WIDTH - (letter.W + letter.M) * AREA.COLS) / 2 + (letter.W + letter.M) * i,
          y: (SCREEN_HEIGHT - letter.H) / 2,
          w: letter.W,
          h: letter.H,
          radius: letter.R,
          text: session.c[i],
          text_size: Math.floor(letter.H / 3 * 2),
          color: COLORS.primary,
          normal_color: isSolved ? COLORS.green : COLORS.orange,
          press_color: isSolved ? COLORS.green : COLORS.orange
        })
      }
      const button = {
        ...BUTTON_PARAMS,
        T: getText('newWord'),
        normal: COLORS.green,
        press: COLORS.green2
      }
      button.W = getTextLayout(button.T, { text_size: button.size, text_width: 0 }).width + 2 * button.P
      showGroup.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - button.W) / 2,
        y: (SCREEN_HEIGHT + letter.H) / 2 + 30,
        w: button.W,
        h: button.H,
        radius: button.R,
        text: button.T,
        text_size: button.size,
        color: COLORS.primary,
        normal_color: button.normal,
        press_color: button.press,
        click_func: () => {
          clearData()
          changeBlocks()
          let newWord = getNewWord(lang, words)
          if (newWord) session.c = newWord
          else {
            replace({
              url: 'page/index'
            })
          }
          deleteWidget(showGroup)
          setScrollLock({
            lock: false
          })
        }
      })
      vibrator.setMode(VIBRATOR_SCENE_NOTIFICATION)
      vibrator.start()
    }

    function checkData(isCheck) {
      let arr = Array.from(session.w)
      let isSolved = arr.length && JSON.stringify(arr) == JSON.stringify(session.c)
      if (isSolved || session.i == (AREA.ROWS - 1)) {
        saveWord({
          word: session.w,
          isSolved: isSolved,
          attempt: session.i + 1
        })
        showInfo(isSolved)
      } else {
        if (session.w.length != AREA.COLS) isCheck = false
        if (isCheck) {
          session.s[session.i] = arr
          arr.forEach((v, i) => { if (v == session.c[i]) session.a.push(v) })
          session.w = []
          session.i++
          saveSession()
        }
        changeBlocks(session.i, isCheck)
      }
    }

    function changeText(key) {
      if (key == 'backspace' && session.w.length == 0 || key != 'backspace' && session.w.length >= AREA.COLS) return
      key == 'backspace' ? session.w.pop() : session.w[session.w.length] = key
      text[session.i].forEach((e, j) => e.setProperty(prop.TEXT, session.w[j] ?? '_'))
      saveSession()
    }

    function changeBlocks(indexR = 0, isCheck = false) {
      keyboardGroup.setProperty(prop.VISIBLE, indexR < AREA.ROWS)
      level.setProperty(prop.TEXT, `${getText('level')} ${session.wordsCount + 1}`)
      check.text = `${getText('check')} ${session.i + 1}/${AREA.ROWS}`
      check.W = getTextLayout(check.text, { text_size: check.size, text_width: 0 }).width + check.P * 2
      checkButton.setProperty(prop.MORE, {
        x: check.X,
        y: check.Y,
        w: check.W,
        h: check.H,
        text: check.text
      })

      blocks.forEach((r, i) => {
        block.wArr[i] = i < indexR ? block.W - 10 : i > indexR ? block.W / (i - indexR + 1) : block.W
        block.yArr[i] = i == 0 ? block.Y : block.yArr[i - 1] + block.wArr[i - 1] + (i == indexR || i == indexR + 1 ? block.M * 2 : block.M)
        let bgColor = i > indexR ? '0x'.padEnd(8, COLORS.lettersBg[i - indexR]) : '0x'.padEnd(8, COLORS.lettersBg[0])

        r.forEach((c, j) => {
          let blockX = Math.round((SCREEN_WIDTH - ((block.wArr[i] + block.M) * (AREA.COLS - 1) + block.wArr[i])) / 2 + j * (block.wArr[i] + block.M))
          let currentBgColor = indexR > 0
            ? session.s[i][j] == session.c[j]
              ? COLORS.green
              : session.c.includes(session.s[i][j])
                ? COLORS.orange
                : bgColor
            : bgColor

          c.setProperty(prop.MORE, {
            x: blockX,
            y: block.yArr[i],
            w: block.wArr[i],
            h: block.wArr[i],
            color: i == indexR ? "0x333333" : currentBgColor
          })
          c.setProperty(prop.VISIBLE, i <= indexR)

          let symbolText = i == session.i
            ? session.w[j] ?? '_'
            : session.s[i][j] ?? '_'
          text[i][j].setProperty(prop.MORE, {
            x: blockX,
            y: block.yArr[i],
            w: block.wArr[i],
            h: block.wArr[i],
            text: symbolText,
            text_size: Math.floor(block.wArr[i] / 3 * 2)
          })
          text[i][j].setProperty(prop.VISIBLE, i <= indexR)
        })
      })

      keysBg.forEach((ks, i) => {
        ks.forEach((k, j) => {
          let isGreen = session.a.includes(typeof keys[i][j] == "object" ? keys[i][j][0] : keys[i][j])
          let isIncludes = false
          if (!isGreen) isIncludes = session.s.some(row => row.includes(typeof keys[i][j] == "object" ? keys[i][j][0] : keys[i][j]))
          let isOrange = false
          if (isIncludes) isOrange = session.c.includes(typeof keys[i][j] == "object" ? keys[i][j][0] : keys[i][j])
            
          k.setProperty(prop.MORE, {
            x: k.getProperty(prop.X),
            y: k.getProperty(prop.Y),
            w: key.W,
            h: key.H,
            color: isGreen ? COLORS.green : isOrange ? COLORS.orange : isIncludes ? COLORS.gray : COLORS.darkgray
          })
        })
      })

      keyboardGroup.setProperty(prop.Y, Math.ceil(block.yArr[indexR] + block.wArr[indexR] + 20))

      if (isCheck && indexR != 0) {
        let scrollY = (block.yArr[0] + block.yArr[indexR] + block.wArr[indexR] - SCREEN_HEIGHT) / 2 - padding.top + btn.H
        scrollTo(-scrollY)
      }
    }

    const padding = {
      top: 50,
      left: 30,
      right: 30,
      bottom: 50
    }

    const btn = {
      W: 64,
      H: 64,
      M: 20
    }
    let buttons = ['statistic', 'faq', 'info']
    for (let i = 0; i < buttons.length; i++) {
      createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - (btn.W + btn.M) * (buttons.length - 1) - btn.W) / 2 + (btn.W + btn.M) * i,
        y: padding.top,
        w: btn.W,
        h: btn.H,
        normal_src: `image/${buttons[i]}_gray.png`,
        press_src: `image/${buttons[i]}.png`,
        click_func: () => {
          push({
            url: `page/${buttons[i]}`
          })
        }
      })
    }

    let contentH = padding.top + btn.H

    let level = {}
    let block = {}
    let blocks = []
    let text = []
    let keyboardGroup = {}
    let key = {}
    let keys = []
    let check = {}
    let checkButton = {}
    let keysBg = []

    if (!isDone) {
      createWidget(widget.FILL_RECT, {
        x: 0,
        y: contentH,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })

      level = createWidget(widget.TEXT, {
        x: padding.left,
        y: contentH + padding.top,
        w: SCREEN_WIDTH - 2 * padding.left,
        h: 30,
        text: '',
        text_size: 24,
        text_style: text_style.NONE,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        color: COLORS.primary
      })

      contentH += padding.top + 60

      block = {
        M: 5,
        col: AREA.COLS,
        row: AREA.ROWS,
        Y: contentH,
        yArr: [],
        wArr: []
      }
      block.W = Math.round((SCREEN_WIDTH - 2 * padding.left - (AREA.COLS - 1) * block.M) / AREA.COLS)
      if (block.W > 60) block.W = 60
      block.H = block.W
      block.R = Math.ceil(block.W / 10)

      blocks = Array.from({ length: AREA.ROWS }, () => Array(AREA.COLS))
      text = Array.from({ length: AREA.ROWS }, () => Array(AREA.COLS))

      for (let i = 0; i < blocks.length; i++) {
        for (let j = 0; j < blocks[i].length; j++) {
          blocks[i][j] = createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            radius: block.R
          })
          text[i][j] = createWidget(widget.TEXT, {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            text: '',
            text_style: text_style.NONE,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            color: COLORS.primary
          })
        }
      }

      keyboardGroup = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: 0
      })

      key = {
        W: SCREEN_WIDTH <= 390 ? 46 : SCREEN_WIDTH <= 416 ? 42 : 40,
        H: 50,
        MB: 5,
        R: 10
      }
      key.count = Math.floor(SCREEN_WIDTH / key.W)
      if (key.count > KEYBOARDS[lang].qwerty[0].length) key.count = KEYBOARDS[lang].qwerty[0].length
      key.M = Math.floor((SCREEN_WIDTH - key.count * key.W) / (key.count - 1))

      keys = []
      if (key.count >= KEYBOARDS[lang].qwerty[0].length) keys = KEYBOARDS[lang].qwerty
      else {
        let start = 0
        let end = key.count
        while (start < KEYBOARDS[lang].abc.length) {
          keys[keys.length] = Array.from(KEYBOARDS[lang].abc.slice(start, start + end))
          start += end
          if (isRound && keys.length > 1) end--
        }
      }
      keys[keys.length - 1].push('⇦')

      keysBg = Array.from({ length: AREA.ROWS }, () => Array(AREA.COLS))
      for (let i = 0; i < keys.length; i++) {
        let keysW = (key.W + key.M) * keys[i].length - key.M
        for (let j = 0; j < keys[i].length; j++) {
          keysBg[i][j] = keyboardGroup.createWidget(widget.FILL_RECT, {
            x: (SCREEN_WIDTH - keysW) / 2 + (key.W + key.M) * j,
            y: (key.H + key.MB) * i,
            w: key.W,
            h: key.H,
            radius: key.R,
            color: COLORS.darkgray
          })
          keyboardGroup.createWidget(widget.BUTTON, {
            x: (SCREEN_WIDTH - keysW) / 2 + (key.W + key.M) * j,
            y: (key.H + key.MB) * i,
            w: key.W,
            h: key.H,
            text: typeof keys[i][j] == "object" ? keys[i][j][0] : keys[i][j],
            text_size: 24,
            normal_src: '',
            press_src: '',
            click_func: () => changeText(keys[i][j] == '⇦' ? 'backspace' : typeof keys[i][j] == "object" ? keys[i][j][0] : keys[i][j]),
            longpress_func: () => {
              if (typeof keys[i][j] == "object") changeText(keys[i][j][1])
            }
          })
        }
      }

      check = {
        ...BUTTON_PARAMS,
        Y: (key.H + key.MB) * keys.length + 10,
        text: `${getText('check')} ${session.i + 1}/${AREA.ROWS}`,
        normal: COLORS.green,
        press: COLORS.green2
      }
      check.W = getTextLayout(check.text, { text_size: BUTTON_PARAMS.size, text_width: 0 }).width + BUTTON_PARAMS.P * 2
      check.X = (SCREEN_WIDTH - check.W) / 2
      checkButton = keyboardGroup.createWidget(widget.BUTTON, {
        x: check.X,
        y: check.Y,
        w: check.W,
        h: check.H,
        radius: check.R,
        text: check.text,
        text_size: check.size,
        normal_color: check.normal,
        press_color: check.press,
        click_func: () => checkData(true)
      })

      keyboardGroup.createWidget(widget.FILL_RECT, {
        x: 0,
        y: (key.H + key.MB) * keys.length + 70,
        w: SCREEN_WIDTH,
        h: isRound ? 30 : 10
      })

      scrollTop()
      checkData()
    } else {
      let isChangedlang = localStorage.getItem('langchanged', false)
      let text = isChangedlang ? getText("fullText2") : getText("fullText")
      let textH = getTextLayout(text, {
        text_size: 24, text_width: SCREEN_WIDTH - 2 * padding.left
      }).height
      createWidget(widget.TEXT, {
        x: padding.left,
        y: contentH + padding.top,
        w: SCREEN_WIDTH - 2 * padding.left,
        h: textH,
        text: text,
        text_size: 24,
        text_style: text_style.WRAP,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        color: COLORS.primary
      })
      contentH += padding.top + textH + 30


      let buttonText = isChangedlang ? getText("toStat") : getText("try")
      let buttonW = getTextLayout(buttonText, { text_size: BUTTON_PARAMS.size, text_width: 0 }).width + BUTTON_PARAMS.P * 2
      createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - buttonW) / 2,
        y: contentH,
        w: buttonW,
        h: BUTTON_PARAMS.H,
        radius: BUTTON_PARAMS.R,
        text: buttonText,
        text_size: BUTTON_PARAMS.size,
        normal_color: COLORS.green,
        press_color: COLORS.green2,
        click_func: () => {
          if (isChangedlang) {
            push({
              url: 'page/statistic'
            })
          }
        },
        longpress_func: () => {
          if (!isChangedlang) {
            localStorage.setItem('lang', lang == 'ru' ? 'en' : 'ru')
            localStorage.setItem('langchanged', true)
            replace({
              url: 'page/index'
            })
          }
        }
      })

      if (!isChangedlang) {
        contentH += BUTTON_PARAMS.H + 10

        createWidget(widget.TEXT, {
          x: padding.left,
          y: contentH,
          w: SCREEN_WIDTH - 2 * padding.left,
          h: 20,
          text: getText("pressandhold"),
          text_size: 14,
          color: COLORS.secondary,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.NONE
        })
      }
    }
  }
})
