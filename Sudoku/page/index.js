import { align, createWidget, event, prop, setStatusBarVisible, text_style, widget } from '@zos/ui'
import { localStorage } from '@zos/storage'
import { setScrollLock } from '@zos/page'
import { setPageBrightTime } from '@zos/display'
import { px } from '@zos/utils'
import { getText } from '@zos/i18n'

import { COLORS, defaultCounters, getGame, getGameResult, getSFA, isRound, Keyboard, Menu, SCREEN_HEIGHT, SCREEN_WIDTH, showVictory } from '../utils/constants'
import { push } from '@zos/router'
import { showToast } from '@zos/interaction'

let session = localStorage.getItem('session')
if (!session) {
  session = { counters: defaultCounters }
  localStorage.setItem('session', session)
}

let activeCell = {
  row: -1,
  col: -1
}

/**
 * Table class for drawing and game changing
 */
class Table {
  constructor() {
    this.tableArr = []
    this.drawableCells = Array.from(Array(9), () => Array.from(Array(9), () => ({})))
    this.drawableText = Array.from(Array(9), () => Array.from(Array(9), () => ({})))
    this.cellSize = px(36)
    this.size = this.cellSize * 9 + 12
    this.x = (SCREEN_WIDTH - this.size) / 2
    this.y = (SCREEN_HEIGHT - this.size) / 2
    this.matchHightlight = {
      on: false
    }
  }

  draw() {
    for (let i = 0; i < this.drawableCells.length; i++) {
      for (let j = 0; j < this.drawableCells[i].length; j++) {
        this.drawableCells[i][j] = createWidget(widget.FILL_RECT, {
          x: this.x + j * (this.cellSize + 1) + Math.floor(j / 3) * 2,
          y: this.y + i * (this.cellSize + 1) + Math.floor(i / 3) * 2,
          w: this.cellSize,
          h: this.cellSize,
          radius: Math.floor(this.cellSize / 10),
          color: COLORS.cell.default
        })
        this.drawableText[i][j] = createWidget(widget.TEXT, {
          x: this.x + j * (this.cellSize + 1) + Math.floor(j / 3) * 2,
          y: this.y + i * (this.cellSize + 1) + Math.floor(i / 3) * 2,
          w: this.cellSize,
          h: this.cellSize,
          text: Array.isArray(this.tableArr[i][j]) ? getSFA(this.tableArr[i][j]) : this.tableArr[i][j] == 0 ? '' : this.tableArr[i][j],
          text_size: Math.floor(this.cellSize / 4) * (Array.isArray(this.tableArr[i][j]) ? 1 : this.tableArr[i][j] == session.table.start[i][j] ? 2 : 3),
          color: COLORS[Array.isArray(this.tableArr[i][j]) ? 'secondary' : 'primary'],
          text_style: text_style.WRAP,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          char_space: 5,
          line_space: -10
        })
        this.drawableText[i][j].addEventListener(event.CLICK_DOWN, () => {
          if (activeCell.row != i || activeCell.col != j) {
            let oldRow = activeCell.row
            let oldCol = activeCell.col
            activeCell.row = i
            activeCell.col = j
            if (oldRow >= 0 && oldCol >= 0) {
              this.updateText(oldRow, oldCol)
              this.updateBgs(oldRow, oldCol)
            }
            this.updateText(i, j)
            this.updateBgs(i, j)
            this.matchHightlight.val = this.tableArr[i][j]

            cellCounter.group.setProperty(prop.VISIBLE, !Array.isArray(this.tableArr[i][j]) && this.tableArr[i][j] != 0)
            cellHighlight.group.setProperty(prop.VISIBLE, !Array.isArray(this.tableArr[i][j]) && this.tableArr[i][j] != 0)
            if (!Array.isArray(this.tableArr[i][j]) && this.tableArr[i][j] != 0) {
              cellCounter.cell.setProperty(prop.TEXT, `${this.tableArr[i][j]}`)
              cellHighlight.cell.setProperty(prop.TEXT, `${this.tableArr[i][j]}`)
              let count = this.tableArr.flat().filter(x => x == this.tableArr[i][j]).length
              cellCounter.counter.setProperty(prop.TEXT, `x${count}`)
            }
          } else {
            if (this.tableArr[i][j] != 0 && this.tableArr[i][j] == session.table.start[i][j]) {
              showToast({ content: getText('toastText') })
              return
            }
            const keyboard = new Keyboard(this.tableArr[i][j])
            keyboard.draw()
            keyboard.onChanged = (newVal) => {
              this.tableArr[i][j] = newVal
              this.updateText(i, j)
              this.save()
              this.checkDone()
            }
          }
        })
      }
    }
  }

  updateBgs(rowIndex, colIndex) {
    this.drawableCells.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (i == rowIndex || j == colIndex || this.tableArr[i][j] == this.matchHightlight?.val) {
          let color = COLORS.cell[i == activeCell.row && j == activeCell.col ? 'active' : i == activeCell.row || j == activeCell.col ? 'inline' : 'default']
          cell.setProperty(prop.COLOR, color)
        }
        if (this.matchHightlight.on && !Array.isArray(this.tableArr[i][j]) && this.tableArr[i][j] && this.tableArr[activeCell.row][activeCell.col] == this.tableArr[i][j]) {
          if (!(i == activeCell.row && j == activeCell.col)) cell.setProperty(prop.COLOR, COLORS.cell.highlight)
        }
      })
    })
    if (!this.matchHightlight.on && this.matchHightlight?.val) delete this.matchHightlight.val
  }

  updateText(i, j, val) {
    let text = val ?? this.tableArr[i][j]
    this.drawableText[i][j].setProperty(prop.MORE, {
      text: Array.isArray(text) ? getSFA(text) : text == 0 ? '' : text,
      text_size: Math.floor(this.cellSize / 4) * (Array.isArray(this.tableArr[i][j]) ? 1 : this.tableArr[i][j] == session.table.start[i][j] ? 2 : 3),
      color: COLORS[Array.isArray(text) ? 'secondary' : 'primary']
    })
  }

  save() {
    localStorage.setItem('session', session)
  }

  setTable(table) {
    this.tableArr = table
  }

  checkDone() {
    let result = getGameResult()
    if (result) showVictory(session)
  }
}

let table = new Table()
let cellCounter = {}
let cellHighlight = {}

Page({
  build() {
    setScrollLock(true)
    setPageBrightTime(60000)
    setStatusBarVisible(false)

    if (!session?.difficulty) {
      push({
        url: 'page/choosen'
      })
      return
    }

    if (!session?.table) {
      session.table = getGame(session.difficulty)
      localStorage.setItem('session', session)
    }
    table.setTable(session.table.current)
    table.draw()

    cellCounter.group = createWidget(widget.GROUP)
    cellCounter.group.createWidget(widget.FILL_RECT, {
      x: isRound ? (SCREEN_WIDTH - table.size) / 2 - px(50) : px(70),
      y: isRound ? (SCREEN_HEIGHT - px(60)) / 2 : (SCREEN_HEIGHT + table.size) / 2 + px(10),
      w: px(40),
      h: px(40),
      radius: px(3),
      color: COLORS.cell.default
    })
    cellCounter.cell = cellCounter.group.createWidget(widget.TEXT, {
      x: isRound ? (SCREEN_WIDTH - table.size) / 2 - px(50) : px(70),
      y: isRound ? (SCREEN_HEIGHT - px(60)) / 2 : (SCREEN_HEIGHT + table.size) / 2 + px(10),
      w: px(40),
      h: px(40),
      text: '',
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    cellCounter.counter = cellCounter.group.createWidget(widget.TEXT, {
      x: isRound ? (SCREEN_WIDTH - table.size) / 2 - px(50) : px(20),
      y: isRound ? (SCREEN_HEIGHT + px(20)) / 2 : (SCREEN_HEIGHT + table.size) / 2 + px(10),
      w: px(40),
      h: px(isRound ? 24 : 40),
      text: '',
      text_size: px(16),
      color: COLORS.secondary,
      align_h: isRound ? align.CENTER_H : align.RIGHT,
      align_v: align.CENTER_V
    })
    cellCounter.group.setProperty(prop.VISIBLE, false)

    cellHighlight.group = createWidget(widget.GROUP)
    cellHighlight.bg = cellHighlight.group.createWidget(widget.FILL_RECT, {
      x: isRound ? (SCREEN_WIDTH + table.size) / 2 + px(10) : SCREEN_WIDTH - px(110),
      y: isRound ? (SCREEN_HEIGHT - px(60)) / 2 : (SCREEN_HEIGHT + table.size) / 2 + px(10),
      w: px(40),
      h: px(40),
      radius: px(3),
      color: COLORS.cell.default
    })
    cellHighlight.cell = cellHighlight.group.createWidget(widget.TEXT, {
      x: isRound ? (SCREEN_WIDTH + table.size) / 2 + px(10) : SCREEN_WIDTH - px(110),
      y: isRound ? (SCREEN_HEIGHT - px(60)) / 2 : (SCREEN_HEIGHT + table.size) / 2 + px(10),
      w: px(40),
      h: px(40),
      text: '',
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    cellHighlight.counter = cellHighlight.group.createWidget(widget.TEXT, {
      x: isRound ? (SCREEN_WIDTH + table.size) / 2 + px(10) : SCREEN_WIDTH - px(60),
      y: isRound ? (SCREEN_HEIGHT + px(20)) / 2 : (SCREEN_HEIGHT + table.size) / 2 + px(10),
      w: px(40),
      h: px(isRound ? 24 : 40),
      text: getText('all'),
      text_size: px(16),
      color: COLORS.secondary,
      align_h: isRound ? align.CENTER_H : align.LEFT,
      align_v: align.CENTER_V
    })
    cellHighlight.group.addEventListener(event.CLICK_DOWN, () => {
      table.matchHightlight.on = !table.matchHightlight.on
      table.matchHightlight.val = table.tableArr[activeCell.row][activeCell.col]
      cellHighlight.bg.setProperty(prop.COLOR, COLORS.cell[table.matchHightlight.on ? 'highlight' : 'default'])
      table.updateBgs()
    })
    cellHighlight.group.setProperty(prop.VISIBLE, false)

    createWidget(widget.TEXT, {
      x: (SCREEN_WIDTH - px(300)) / 2,
      y: (SCREEN_HEIGHT - table.size) / 2 - px(50),
      w: px(300),
      h: px(40),
      text: getText(`${session.difficulty}Level`, session.counters[session.difficulty] + 1),
      text_size: px(24),
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

    table.checkDone()
  }
})
