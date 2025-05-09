import { align, createWidget, setStatusBarVisible, widget } from '@zos/ui'
import { localStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { setScrollLock } from '@zos/page'
import { setPageBrightTime } from '@zos/display'

import { getTable, isRound, Mark, SCREEN_HEIGHT, SCREEN_WIDTH, Table } from '../utils/constants'
import { back } from '@zos/router'

setScrollLock(true)
setPageBrightTime(60000)
setStatusBarVisible(false)

let tableArr = localStorage.getItem('table')

let winsCount = localStorage.getItem('winscount', {
  x: 0,
  o: 0
})

Page({
  onInit(params) {
    params = JSON.parse(params)

    let table = new Table({ table: getTable(false, tableArr, params.row, params.col), mainI: params.row, mainJ: params.col })
    let prevStep = localStorage.getItem('prevstep')
    table.draw(prevStep)

    let leftMark = new Mark(1, (SCREEN_WIDTH - table.getSize()) / 2 - px(isRound ? 30 : 20), SCREEN_HEIGHT / 2, px(40))
    leftMark.draw()
    createWidget(widget.TEXT_IMG, {
      x: (SCREEN_WIDTH - table.getSize()) / 2 - px(isRound ? 60 : 40),
      y: SCREEN_HEIGHT / 2 - px(50),
      w: px(isRound ? 60 : 40),
      h: px(20),
      font_array: Array.from(Array(10), (v, k) => `text/${k}r.png`),
      text: `${winsCount.x}`.split("").reverse().join(""),
      h_space: 2,
      align_h: align.CENTER_H
    })
    createWidget(widget.TEXT_IMG, {
      x: (SCREEN_WIDTH - table.getSize()) / 2 - px(isRound ? 60 : 40),
      y: SCREEN_HEIGHT / 2 + px(30),
      w: px(isRound ? 60 : 40),
      h: px(20),
      font_array: Array.from(Array(10), (v, k) => `text/${k}.png`),
      text: winsCount.x,
      h_space: 2,
      align_h: align.CENTER_H
    })

    let topMark = new Mark(prevStep?.player == 1 ? -1 : 1, SCREEN_WIDTH / 2, (SCREEN_HEIGHT - table.getSize()) / 2 - px(40), px(50))
    topMark.draw()

    let rightMark = new Mark(-1, (SCREEN_WIDTH + table.getSize()) / 2 + px(isRound ? 30 : 20), SCREEN_HEIGHT / 2, px(40))
    rightMark.draw()
    createWidget(widget.TEXT_IMG, {
      x: (SCREEN_WIDTH + table.getSize()) / 2,
      y: SCREEN_HEIGHT / 2 - px(50),
      w: px(isRound ? 60 : 40),
      h: px(20),
      font_array: Array.from(Array(10), (v, k) => `text/${k}r.png`),
      text: `${winsCount.o}`.split("").reverse().join(""),
      h_space: 2,
      align_h: align.CENTER_H
    })
    createWidget(widget.TEXT_IMG, {
      x: (SCREEN_WIDTH + table.getSize()) / 2,
      y: SCREEN_HEIGHT / 2 + px(30),
      w: px(isRound ? 60 : 40),
      h: px(20),
      font_array: Array.from(Array(10), (v, k) => `text/${k}.png`),
      text: `${winsCount.o}`,
      h_space: 2,
      align_h: align.CENTER_H
    })

    createWidget(widget.BUTTON, {
      x: (SCREEN_WIDTH - px(96)) / 2,
      y: SCREEN_HEIGHT - px(60),
      w: px(96),
      h: px(54),
      normal_src: 'buttons/back_gray.png',
      press_src: 'buttons/back.png',
      click_func: back
    })
  }
})
