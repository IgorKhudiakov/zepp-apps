import { align, createWidget, deleteWidget, event, prop, setStatusBarVisible, text_style, widget } from '@zos/ui'
import { localStorage } from '@zos/storage'
import { setScrollLock } from '@zos/page'
import { setPageBrightTime } from '@zos/display'
import { px } from '@zos/utils'
import { getText } from '@zos/i18n'

import { COLORS, getGameResult, isRound, Menu, SCREEN_HEIGHT, SCREEN_WIDTH, SESSION, showVictory } from '../utils/constants'

let session = localStorage.getItem('session', JSON.parse(JSON.stringify(SESSION)))

/**
 * Main game button
 */
class Button {
  constructor(count) {
    this.group = {}
    this.count = count ?? 0
    this.text = {}
    this.w = px(40)
    this.click = this.click.bind(this)
  }

  draw() {
    this.group = createWidget(widget.GROUP, {
      x: Math.floor((SCREEN_WIDTH - this.w) / 2),
      y: Math.floor((SCREEN_HEIGHT - this.w) / 2),
      w: this.w,
      h: this.w
    })
    this.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: this.w,
      h: this.w,
      radius: Math.floor(this.w / 2),
      color: COLORS.table.bg
    })
    this.text = this.group.createWidget(widget.TEXT, {
      x: 0,
      y: 0,
      w: this.w,
      h: this.w,
      text: `${this.count}`,
      text_size: px(24),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: COLORS.table.bg2
    })
  }

  setCount(count) {
    this.count = count
    this.update()
  }

  click() {
    this.count--
    table.rotate()
    if (!this.count) {
      session.step = 1
      session.current = (session.current == 'black' ? 'white' : 'black')
      current.setProperty(prop.COLOR, COLORS.marks[session.current])
    }
    this.update()
    table.update()
    table.checkDone()
  }

  update() {
    this.group.removeEventListener(event.CLICK_DOWN, this.click)
    if (this.count) this.group.addEventListener(event.CLICK_DOWN, this.click)
    this.text.setProperty(prop.TEXT, `${this.count}`)
  }
}

/**
 * Table class for drawing and game changing
 */
class Table {
  constructor({ table }) {
    this.table = table
    this.drawable = Array.from(Array(4), () => Array.from(Array(4)))
    this.cellSize = px(70)
    this.circleSize = px(40)
    this.w = this.cellSize * table.length
    this.h = this.cellSize * table.length
    this.x = (SCREEN_WIDTH - this.w) / 2
    this.y = (SCREEN_HEIGHT - this.h) / 2
    this.border = px(10)
    this.innerBorder = px(4)
    this.innerLineW = px(2)
    this.innerLineH = this.cellSize - px(30)
  }

  draw() {
    createWidget(widget.FILL_RECT, {
      x: this.x - this.border,
      y: this.y - this.border,
      w: this.w + this.border * 2,
      h: this.h + this.border * 2,
      radius: px(30),
      color: COLORS.table.bg
    })
    createWidget(widget.FILL_RECT, {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      radius: px(20),
      color: COLORS.table.bg2
    })
    createWidget(widget.STROKE_RECT, {
      x: this.x + this.cellSize - Math.floor(this.innerBorder / 2),
      y: this.y + this.cellSize - Math.floor(this.innerBorder / 2),
      w: this.w - this.cellSize * 2 + this.innerBorder,
      h: this.w - this.cellSize * 2 + this.innerBorder,
      radius: px(10),
      line_width: this.innerBorder,
      color: COLORS.table.bg
    })

    for (let i = 0; i < 12; i++) {
      createWidget(widget.FILL_RECT, {
        x: this.x + (i % 2 == 0 ? (Math.floor(i / 2) % 3 + 1) * this.cellSize - Math.floor(this.innerLineW / 2) : Math.floor(i / 6) * this.cellSize * 3 + Math.floor((this.cellSize - this.innerLineH) / 2)),
        y: this.y + (i % 2 == 1 ? (Math.floor(i / 2) % 3 + 1) * this.cellSize - Math.floor(this.innerLineW / 2) : Math.floor(i / 6) * this.cellSize * 3 + Math.floor((this.cellSize - this.innerLineH) / 2)),
        w: i % 2 == 0 ? this.innerLineW : this.innerLineH,
        h: i % 2 == 0 ? this.innerLineH : this.innerLineW,
        radius: Math.floor(this.innerLineW / 2),
        color: COLORS.table.bg
      })
    }
    for (let i = 0; i < 4; i++) {
      createWidget(widget.FILL_RECT, {
        x: this.x + (i % 2 == 0 ? this.w / 2 - Math.floor(this.innerLineW / 2) : this.w / 2 - this.cellSize * Math.floor(i / 2) + Math.floor((this.cellSize - this.innerLineH) / 2)),
        y: this.y + (i % 2 == 1 ? this.h / 2 - Math.floor(this.innerLineW / 2) : this.h / 2 - this.cellSize * Math.floor(i / 2) + Math.floor((this.cellSize - this.innerLineH) / 2)),
        w: i % 2 == 0 ? this.innerLineW : this.innerLineH,
        h: i % 2 == 0 ? this.innerLineH : this.innerLineW,
        radius: Math.floor(this.innerLineW / 2),
        color: COLORS.table.bg
      })
    }
  }

  update() {
    this.table.forEach((row, i) => {
      row.forEach((type, j) => {
        switch (session.step) {
          case 1:
            if (session.active.row >= 0) {
              if (type == 0
                && (i == session.active.row && (j == session.active.col + 1 || j == session.active.col - 1)
                  || j == session.active.col && (i == session.active.row - 1 || i == session.active.row + 1))) row[j] = session.current == 'white' ? 1 : -1
              else if (Math.abs(type) != 2) row[j] = 0
            }
            break
          case 2:
            if (session.current && (Math.abs(type) == 1 || type == 0)) row[j] = session.current == 'black' ? 1 : -1
            break
          case 3:
            if (Math.abs(type) == 1) row[j] = 0
            break
        }
      })
    })

    this.table.forEach((row, i) => {
      row.forEach((type, j) => {
        deleteWidget(this.drawable[i][j])
        this.drawable[i][j] = createWidget(widget.FILL_RECT, {
          x: this.x + j * this.cellSize + Math.floor(this.cellSize - this.circleSize) / 2,
          y: this.y + i * this.cellSize + Math.floor(this.cellSize - this.circleSize) / 2,
          w: this.circleSize,
          h: this.circleSize,
          radius: Math.floor(this.cellSize / 2),
          color: COLORS.marks[type > 0 ? 'black' : 'white'],
          alpha: type == 0 ? 0 : Math.abs(type) == 1 ? 50 : 255
        })
        if (session.step < 3) {
          this.drawable[i][j].addEventListener(event.CLICK_DOWN, () => {
            if (session.step == 1) {
              if (type == (session.current == 'black' ? -2 : 2)) {
                session.active = {
                  row: i,
                  col: j,
                  val: type
                }
              } else if (session.active.row >= 0 && Math.abs(type) == 1) {
                row[j] = session.active.val
                this.table[session.active.row][session.active.col] = 0
                session.active = {
                  row: -1,
                  col: -1,
                  val: 0
                }
                session.step++
              }
            } else {
              if (Math.abs(type) == 1) {
                row[j] = session.current == 'black' ? 2 : -2
                session[session.current].count--
                session.step++
                button.setCount(session[session.current].count ? 1 : 6)
                updateCounters()
              }
            }
            table.update()
          })
          if (step == 1 && i == session.active.row && j == session.active.col) {
            this.drawable[i][j].setProperty(prop.ANIM, {
              anim_steps: [
                {

                }
              ]
            })
          }
        }
      })
    })
    localStorage.setItem('session', session)
  }

  rotate() {
    const n = this.table.length;
    const layers = Math.floor(n / 2);

    for (let layer = 0; layer < layers; layer++) {
      const first = layer
      const last = n - 1 - layer
      const topLeft = this.table[first][first]

      for (let i = first; i < last; i++)
        this.table[first][i] = this.table[first][i + 1]
      for (let i = first; i < last; i++)
        this.table[i][last] = this.table[i + 1][last]
      for (let i = last; i > first; i--)
        this.table[last][i] = this.table[last][i - 1]
      for (let i = last; i > first; i--)
        this.table[i][first] = this.table[i - 1][first]

      this.table[first + 1][first] = topLeft
    }
  }

  save() {
    localStorage.setItem('session', session)
  }

  getSize() {
    return { w: this.w, h: this.h }
  }

  checkDone() {
    let result = getGameResult(this.table)
    if (Object.keys(result).length) {
      showVictory(result, session)
    }
  }
}

let table = new Table({ table: session.table })
let button = new Button(session.button.count)

let current = {}
let whiteCounter = {}
let blackCounter = {}

function updateCounters() {
  whiteCounter.setProperty(prop.TEXT, `${session.white.count}`)
  blackCounter.setProperty(prop.TEXT, `${session.black.count}`)
}

Page({
  build() {
    setScrollLock(true)
    setPageBrightTime(60000)
    setStatusBarVisible(false)

    table.draw()
    button.draw()

    createWidget(widget.CIRCLE, {
      center_x: SCREEN_WIDTH / 2,
      center_y: (SCREEN_HEIGHT - table.getSize().h) / 2 - px(50),
      radius: px(25),
      color: COLORS.primary
    })
    current = createWidget(widget.CIRCLE, {
      center_x: SCREEN_WIDTH / 2,
      center_y: (SCREEN_HEIGHT - table.getSize().h) / 2 - px(50),
      radius: px(23),
      color: COLORS.marks[session.current] ?? 0
    })

    createWidget(widget.FILL_RECT, {
      x: (SCREEN_WIDTH - table.getSize().w) / 2 - px(isRound ? 70 : 55),
      y: SCREEN_HEIGHT / 2 - px(30),
      w: px(40),
      h: px(40),
      radius: px(20),
      color: COLORS.marks.white
    })
    whiteCounter = createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH - table.getSize().w) / 2 - px(isRound ? 80 : 55),
      y: SCREEN_HEIGHT / 2 + px(30),
      w: px(isRound ? 60 : 40),
      h: px(20),
      text: 0,
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })

    createWidget(widget.STROKE_RECT, {
      x: (SCREEN_WIDTH + table.getSize().w) / 2 + px(isRound ? 30 : 15),
      y: SCREEN_HEIGHT / 2 - px(30),
      w: px(40),
      h: px(40),
      radius: px(20),
      line_width: px(2),
      color: COLORS.marks.white
    })
    blackCounter = createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH + table.getSize().w) / 2 + px(isRound ? 20 : 15),
      y: SCREEN_HEIGHT / 2 + px(30),
      w: px(isRound ? 60 : 40),
      h: px(20),
      text: 0,
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })

    const menu = new Menu()
    createWidget(widget.BUTTON, {
      x: (SCREEN_WIDTH - px(96)) / 2,
      y: SCREEN_HEIGHT - px(60),
      w: px(96),
      h: px(54),
      normal_src: 'buttons/show_menu_gray.png',
      press_src: 'buttons/show_menu.png',
      click_func: () => menu.show(session)
    })

    if (!session.current) {
      let currentTemp = 'white'
      let choosenGroup = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })
      choosenGroup.createWidget(widget.TEXT, {
        x: (SCREEN_WIDTH - px(50)) / 2,
        y: (SCREEN_HEIGHT - table.getSize().h) / 2 - px(75),
        w: px(50),
        h: px(50),
        text: "?",
        text_size: px(32),
        color: COLORS.primary,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      choosenGroup.createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
        alpha: 150
      })
      choosenGroup.createWidget(widget.TEXT, {
        x: px(isRound ? 50 : 20),
        y: SCREEN_HEIGHT / 2 - px(80) - px(60),
        w: (SCREEN_WIDTH - px(isRound ? 100 : 40)),
        h: px(80),
        text: getText('choosenText'),
        color: COLORS.primary,
        text_size: px(32),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.WRAP
      })

      let choosenSircleSize = px(80)
      let whiteCircle = choosenGroup.createWidget(widget.FILL_RECT, {
        x: SCREEN_WIDTH / 2 - px(40) - choosenSircleSize,
        y: (SCREEN_HEIGHT - choosenSircleSize) / 2,
        w: choosenSircleSize,
        h: choosenSircleSize,
        radius: choosenSircleSize / 2,
        color: COLORS.marks.white,
        alpha: 255
      })
      whiteCircle.addEventListener(event.CLICK_DOWN, () => {
        currentTemp = 'white'
        whiteCircle.setProperty(prop.ALPHA, 255)
        blackCircleBg.setProperty(prop.ALPHA, 100)
        blackCircle.setProperty(prop.ALPHA, 100)
      })
      let blackCircleBg = choosenGroup.createWidget(widget.FILL_RECT, {
        x: SCREEN_WIDTH / 2 + px(40),
        y: (SCREEN_HEIGHT - choosenSircleSize) / 2,
        w: choosenSircleSize,
        h: choosenSircleSize,
        radius: choosenSircleSize / 2,
        color: COLORS.primary,
        alpha: 100
      })
      let blackCircle = choosenGroup.createWidget(widget.FILL_RECT, {
        x: SCREEN_WIDTH / 2 + px(44),
        y: (SCREEN_HEIGHT - choosenSircleSize) / 2 + px(4),
        w: choosenSircleSize - px(8),
        h: choosenSircleSize - px(8),
        radius: (choosenSircleSize - px(8)) / 2,
        color: COLORS.marks.black,
        alpha: 100
      })
      blackCircle.addEventListener(event.CLICK_DOWN, () => {
        currentTemp = 'black'
        whiteCircle.setProperty(prop.ALPHA, 100)
        blackCircleBg.setProperty(prop.ALPHA, 255)
        blackCircle.setProperty(prop.ALPHA, 255)
      })

      choosenGroup.createWidget(widget.FILL_RECT, {
        x: (SCREEN_WIDTH - px(240)) / 2 - px(5),
        y: (SCREEN_HEIGHT + px(160)) / 2 - px(5),
        w: px(250),
        h: px(60),
        radius: px(15),
        alpha: 50
      })
      choosenGroup.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - px(240)) / 2,
        y: (SCREEN_HEIGHT + px(160)) / 2,
        w: px(240),
        h: px(50),
        radius: px(10),
        text: getText('start'),
        text_size: px(32),
        color: COLORS.primary,
        normal_color: COLORS.table.bg2,
        press_color: COLORS.table.bg,
        click_func: () => {
          session.current = currentTemp
          current.setProperty(prop.COLOR, COLORS.marks[session.current])
          deleteWidget(choosenGroup)
          updateCounters()
          table.update()
        }
      })
    } else {
      table.update()
      button.update()
      updateCounters()
      table.checkDone()
    }
  }
})
