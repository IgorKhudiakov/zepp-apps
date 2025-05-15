import { getText } from "@zos/i18n"
import { px } from "@zos/utils"
import hmUI, { align, createWidget, event, prop, setStatusBarVisible, widget } from "@zos/ui"
import { localStorage } from "@zos/storage"
import { create, id } from "@zos/media"
import { showToast } from "@zos/interaction"

import { ALARMS_PARAMS, checkbox, COLORS, CONTENT, createCheckBox, createSpace, getTimeFormatted, isRound, playVibro, SPEAKER_SUPPORT } from "../utils/constants"
import { push } from "@zos/router"

setStatusBarVisible(false)

let shift = localStorage.getItem('shift')
let content = JSON.parse(JSON.stringify(CONTENT))
let list = []
const player = create(id.PLAYER)
let controls = []
let playerState = false
let activeControl = -1

function controlSound(isPlay = false, sound, control, i) {
  if (isPlay && playerState != 'prepare') {
    if (playerState == 'play') {
      player.stop()
      playerState = false
    }
    if (!player.getVolume()) {
      showToast({ content: getText('toastSoundOff') })
      return
    }
    player.setSource(player.source.FILE, { file: `assets://raw/${sound}.mp3` })
    player.addEventListener(player.event.PREPARE, (result) => {
      if (result) {
        player.start()
        playerState = 'play'
        activeControl = i
        control.setProperty(prop.SRC, `buttons/pause.png`)
      } else {
        resetControls()
        playerState = false
        activeControl = -1
      }
    })
    player.addEventListener(player.event.COMPLETE, () => {
      resetControls()
      playerState = false
    })
    playerState = 'prepare'
    player.prepare()
  } else {
    player.stop()
    player.release()
    playerState = false
    resetControls()
  }
}

function resetControls(i) {
  controls.forEach((v, k) => v.setProperty(prop.SRC, `buttons/play.png`))
  activeControl = -1
}

Page({
  build() {
    content.H = content.Y

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.Y,
      w: content.W,
      h: px(50),
      text: getText('alarms'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    content.H += px(80)
    content.Y = content.H

    let listItemsH = 0
    let listItemsM = px(15)

    const entries = Object.values(shift.shifts)
    entries.forEach((val, i) => {
      list[i] = createWidget(widget.GROUP, {
        x: content.M,
        y: content.Y + listItemsH,
        w: content.W,
        h: 0
      })

      let listItemH = content.P
      const listItemBg = list[i].createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: content.W,
        h: 0,
        radius: content.R,
        color: COLORS.primary,
        alpha: content.A
      })
      list[i].createWidget(widget.TEXT, {
        x: content.P,
        y: listItemH,
        w: content.W - 2 * content.P,
        h: checkbox.H,
        text: (val.name.length ? val.name : `${getText(shift.params.alarms == 'perday' ? 'day' : 'shift')} ${i + 1}`) + ' | ' + getText(`${val.type}Type`),
        text_size: px(24),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      createCheckBox({ x: content.M + content.W - content.P - checkbox.W, y: content.Y + listItemsH + listItemH }, val.alarm, 'isOn')
      listItemH += px(50)
      list[i].createWidget(widget.TEXT, {
        x: content.P,
        y: listItemH,
        w: (content.W - content.P * 2) / 2,
        h: px(40),
        text: getTimeFormatted(val.alarm.time.hours, val.alarm.time.minutes),
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      }).addEventListener(event.CLICK_DOWN, () => 
        push({
          url: 'page/picker',
            params: {
              id: i,
              param: 'alarm'
            }
        })
      )
      list[i].createWidget(widget.TEXT, {
        x: content.P,
        y: listItemH + px(40),
        w: content.W / 2 - content.P,
        h: px(24),
        text: getText('time'),
        text_size: px(18),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      createCheckBox({ x: content.M + content.W - content.P - checkbox.W, y: content.Y + listItemsH + listItemH }, val.alarm.time, 'prevDay')
      list[i].createWidget(widget.TEXT, {
        x: content.W / 2,
        y: listItemH + px(40),
        w: content.W / 2 - content.P,
        h: px(24),
        text: getText('startPrev'),
        text_size: px(18),
        color: COLORS.secondary,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })
      listItemH += px(80)
      const vibroPlayButton = list[i].createWidget(widget.IMG, {
        x: content.P,
        y: listItemH,
        src: 'buttons/play.png'
      })
      vibroPlayButton.addEventListener(event.CLICK_UP, () => { playVibro(val.alarm.vibro.type, 5000) })
      const vibroType = list[i].createWidget(widget.TEXT, {
        x: content.P + px(44) + px(10),
        y: listItemH,
        w: content.W / 2 - content.P,
        h: px(40),
        text: getText('vibroType', `${val.alarm.vibro.type + 1}`),
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      })
      vibroType.addEventListener(event.CLICK_UP, () => {
        let index = val.alarm.vibro.type
        if (++index >= ALARMS_PARAMS.vibroTypes.length) index = 0
        val.alarm.vibro.type = index
        vibroType.setProperty(prop.TEXT, getText('vibroType', `${val.alarm.vibro.type + 1}`))
      })
      list[i].createWidget(widget.TEXT, {
        x: content.P,
        y: listItemH + px(40),
        w: content.W / 2 - content.P,
        h: px(24),
        text: getText('vibro'),
        text_size: px(18),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      createCheckBox({ x: content.M + content.W - content.P - checkbox.W, y: content.Y + listItemsH + listItemH }, val.alarm.vibro, 'isOn')
      list[i].createWidget(widget.TEXT, {
        x: content.W / 2,
        y: listItemH + px(40),
        w: content.W / 2 - content.P,
        h: px(24),
        text: getText('isOn'),
        text_size: px(18),
        color: COLORS.secondary,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })
      listItemH += px(80)

      if (SPEAKER_SUPPORT) {
        controls[i] = list[i].createWidget(widget.IMG, {
          x: content.P,
          y: listItemH,
          src: 'buttons/play.png'
        })
        controls[i].addEventListener(event.CLICK_UP, () => {
          if (activeControl == i) controlSound()
          else {
            resetControls(i)
            controlSound(true, val.alarm.sound.type, controls[i], i)
          }
        })
        let soundType = list[i].createWidget(widget.TEXT, {
          x: content.P + px(44) + px(10),
          y: listItemH,
          w: content.W / 2 - content.P,
          h: px(40),
          text: `${val.alarm.sound.type}`,
          text_size: px(32),
          color: COLORS.primary,
          align_v: align.CENTER_V
        })
        soundType.addEventListener(event.CLICK_UP, () => {
          let index = ALARMS_PARAMS.soundTypes.indexOf(val.alarm.sound.type)
          if (++index >= ALARMS_PARAMS.soundTypes.length) index = 0
          val.alarm.sound.type = ALARMS_PARAMS.soundTypes[index]
          soundType.setProperty(prop.TEXT, `${val.alarm.sound.type}`)
        })
        list[i].createWidget(widget.TEXT, {
          x: content.P,
          y: listItemH + px(40),
          w: content.W / 2 - content.P,
          h: px(24),
          text: getText('sound'),
          text_size: px(18),
          color: COLORS.secondary,
          align_v: align.CENTER_V
        })
        createCheckBox({ x: content.M + content.W - content.P - checkbox.W, y: content.Y + listItemsH + listItemH }, val.alarm.sound, 'isOn')
        list[i].createWidget(widget.TEXT, {
          x: content.W / 2,
          y: listItemH + px(40),
          w: content.W / 2 - content.P,
          h: px(24),
          text: getText('isOn'),
          text_size: px(18),
          color: COLORS.secondary,
          align_h: align.RIGHT,
          align_v: align.CENTER_V
        })
        listItemH += px(80)
      }

      const repeatCount = list[i].createWidget(widget.TEXT, {
        x: content.P,
        y: listItemH,
        w: content.W / 2 - content.P,
        h: px(40),
        text: `${val.alarm.repeats.count}`,
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      })
      repeatCount.addEventListener(event.CLICK_UP, () => {
        let index = ALARMS_PARAMS.repeat.counts.indexOf(val.alarm.repeats.count)
        if (++index >= ALARMS_PARAMS.repeat.counts.length) index = 0
        val.alarm.repeats.count = ALARMS_PARAMS.repeat.counts[index]
        repeatCount.setProperty(prop.TEXT, `${val.alarm.repeats.count}`)
      })
      list[i].createWidget(widget.TEXT, {
        x: content.P,
        y: listItemH + px(40),
        w: content.W / 2 - content.P,
        h: px(24),
        text: getText('repeatCount'),
        text_size: px(18),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      const repeatInterval = list[i].createWidget(widget.TEXT, {
        x: content.W / 2,
        y: listItemH,
        w: content.W / 2 - content.P,
        h: px(40),
        text: getText('intervalMinutes', `${val.alarm.repeats.interval}`),
        text_size: px(32),
        color: COLORS.primary,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })
      repeatInterval.addEventListener(event.CLICK_UP, () => {
        let index = ALARMS_PARAMS.repeat.intervals.indexOf(val.alarm.repeats.interval)
        if (++index >= ALARMS_PARAMS.repeat.intervals.length) index = 0
        val.alarm.repeats.interval = ALARMS_PARAMS.repeat.intervals[index]
        repeatInterval.setProperty(prop.TEXT, getText('intervalMinutes', `${val.alarm.repeats.interval}`))
      })
      list[i].createWidget(widget.TEXT, {
        x: content.W / 2,
        y: listItemH + px(40),
        w: content.W / 2 - content.P,
        h: px(24),
        text: getText('repeatInterval'),
        text_size: px(18),
        color: COLORS.secondary,
        align_h: align.RIGHT,
        align_v: align.CENTER_V
      })
      listItemH += px(64) + content.P

      listItemBg.setProperty(prop.MORE, {
        x: 0,
        y: 0,
        w: content.W,
        h: listItemH
      })

      listItemsH += listItemH + listItemsM
    })
    content.H = content.Y + listItemsH

    createSpace({ y: content.H, h: isRound ? 100 : 20 })
  },
  onDestroy() {
    localStorage.setItem('shift', shift)
  }
})

