import { getText } from "@zos/i18n"
import { back } from "@zos/router"
import { localStorage } from "@zos/storage"
import { createWidget, widget } from "@zos/ui"

let shift = localStorage.getItem('shift')

Page({
  onInit(params) {
    params = JSON.parse(params)
    let dataArray = [
      Array.from({ length: (params.param == 'hoursCount' ? 25 : params.param == 'alarm' ? 24 : 45) }, (v, k) => params.param == 'daysCount' ? k + 1 : k),
      Array.from({ length: (params.param == 'alarm' ? 60 : 4) }, (v, k) => params.param == 'alarm' ? k : k * 15)
    ]

    let parameter = {}
    switch (params.param) {
      case 'hoursCount':
        parameter = shift.shifts[params.id][params.param]
        break
      case 'alarm':
        parameter = shift.shifts[params.id].alarm.time
        break
      default:
        parameter = shift.shifts[params.id]
        break
    }
    createWidget(widget.WIDGET_PICKER, {
      title: getText(params.param),
      nb_of_columns: (params.param == 'daysCount' ? 1 : 2),
      single_wide: true,
      init_col_index: 0,
      data_config: [
        {
          data_array: dataArray[0],
          unit: params.param == 'daysCount' ? 'дн.' : 'ч.',
          support_loop: true,
          init_val_index: dataArray[0].indexOf(params.param == 'daysCount' ? parameter[params.param] : parameter.hours),
          font_size: px(32),
          select_font_size: px(48),
          unit_font_size: px(18),
          col_width: px(80)
        },
        params.param != 'daysCount' && {
          data_array: dataArray[1],
          unit: 'мин.',
          support_loop: true,
          init_val_index: dataArray[1].indexOf(parameter?.minutes),
          font_size: px(32),
          select_font_size: px(48),
          unit_font_size: px(18),
          col_width: px(80)
        }
      ],
      picker_cb: (picker, event_type, column_index, select_index) => {
        if (event_type == 2) back()
        else if (event_type == 1) {
          if (params.param != 'daysCount') parameter[column_index ? 'minutes' : 'hours'] = dataArray[column_index][select_index]
          else parameter[params.param] = dataArray[column_index][select_index]
        }
      }
    })
  },
  onDestroy() {
    localStorage.setItem('shift', shift)
  }
})