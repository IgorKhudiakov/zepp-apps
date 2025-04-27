import * as service from '@zos/app-service'
import { Time } from '@zos/sensor'
import { localStorage } from '@zos/storage'
import { getPackageInfo } from '@zos/app'
import { notify } from "@zos/notification"
import { getText } from "@zos/i18n"

import { changeSettings } from '../utils/functions'

AppService({
    onEvent(e) {
        let result = JSON.parse(e) ?? {}
        if (result.action == "settings") changeSettings(result.param, result.val)
    },
    onInit(e) {
        const settings = localStorage.getItem('settings', {})
        const notifications = localStorage.getItem('notifications', {
            update: {}
        })
        let serviceFile = "app-service/index"
        if (settings.bgService) {
            const time = new Time()
            time.onPerHourEnd(() => {
                let hour = time.getHours()
                let day = Math.floor(time.getTime() / (1000 * 3600 * 24))

                if (hour >= 14 && hour <= 16) {
                    let transport = localStorage.getItem('transport', [])
                    if (transport.length == 0) return

                    if (hour == 14 && settings.notifUpdate) {
                        let nDay = notifications.update.last ?? day - 1
                        if (day - nDay >= parseInt(settings.freq)) {
                            notifications.update.last = day
                            localStorage.setItem('notifications', notifications)
                            notify({
                                title: getPackageInfo().name,
                                content: getText("notif1Text"),
                                actions: [
                                    {
                                        text: getText("make"),
                                        file: "page/index"
                                    }/*,
                                    {
                                        text: "Не напоминать",
                                        file: "app-service/index",
                                        param: {
                                            action: "settings",
                                            param: "notifUpdate",
                                            val: false
                                        }
                                    }*/
                                ]
                            })
                        }
                    } else if ((hour == 15 || hour == 16) && settings.notifTO) {
                        let notifyText = ''
                        let show = false
                        let firstI = -1
                        for (let i = 0; i < transport.length; i++) {
                            let mileage = parseInt(transport[i].mileage.current)
                            let perMonth = parseInt(transport[i].mileage.perMonth)
                            if (transport[i].mileage.auto && perMonth != 0) {
                                let lastUpdate = parseInt(transport[i].mileage.lastUpdate)
                                if (lastUpdate != day) {
                                    transport[i].mileage.current = mileage + Math.round(perMonth / 30) * (day - lastUpdate)
                                    transport[i].mileage.lastUpdate = day
                                }
                            }

                            if (hour == 15) {
                                let addTransport = true
                                for (const key in transport[i].details) {
                                    let detail = transport[i].details[key]
                                    if (detail.visible) {
                                        let tar = parseInt(detail.period)
                                        let cur = parseInt(transport[i].mileage.current) - parseInt(detail.lastUpdate)
                                        let ratio = cur / tar
                                        if (ratio >= 0.9) {
                                            if (firstI < 0) firstI = i
                                            if (!show) notifyText = getText("notif3Text")
                                            notifyText += `${show ? ', ' : ''}`
                                            notifyText += `${addTransport
                                                ? `${getText(transport[i].type).toLowerCase()} ${transport[i].name}${transport[i].model
                                                    ? ` ${transport[i].model}`
                                                    : ''}: `
                                                : ''}`
                                            notifyText += `${getText(key).toLowerCase()} (${Math.floor(ratio * 100)}%)`
                                            show = true
                                            addTransport = false
                                        }
                                    }
                                }
                            }
                            else {
                                if ((parseInt(transport[i].maintenance.last) + parseInt(transport[i].maintenance.period)) < mileage) {
                                    if (firstI < 0) firstI = i
                                    if (!show) notifyText = getText("notif2Text")
                                    notifyText += `${show ? ', ' : ''}${getText(transport[i].type).toLowerCase()} ${transport[i].name}${transport[i].model
                                        ? ` ${transport[i].model}`
                                        : ''}`
                                    show = true
                                }
                            }
                        }
                        if (transport != localStorage.getItem('transport', [])) localStorage.setItem('transport', transport)
                        if (show) {
                            notify({
                                title: getPackageInfo().name,
                                content: notifyText,
                                actions: [
                                    {
                                        text: getText("more"),
                                        file: "page/index",
                                        param: JSON.stringify({
                                            id: firstI < 0 ? 0 : firstI
                                        })
                                    }
                                ]
                            })
                        }
                    }
                }
            })
        } else service.stop({ file: serviceFile, complete_func: () => { } })
    },
    onDestroy() {}
})