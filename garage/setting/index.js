import { gettext } from "i18n"

import { COLORS, NEW_TRANSPORT, TRANSPORT_TYPES, TRANSPORT_DETAILS_PARAMS } from "../utils/constants"
import { validator } from "../utils/formatter"

AppSettingsPage({
    data: {
        transport: [],
        props: {}
    },
    toast: {
        show: false,
        message: ''
    },
    addTransport(data) {
        this.data.transport = [...this.data.transport, data]
        this.setData()
    },
    removeTransport(id) {
        this.data.transport.splice(id, 1)
        this.setData()
    },
    setData(isSave) {
        this.data.props.settingsStorage.setItem(isSave ? 'transport' : 'tempdata', JSON.stringify(this.data.transport))
        if (isSave) this.data.props.settingsStorage.removeItem('tempdata')
    },
    setProps(props) {
        this.data.props = props
        var transData = props.settingsStorage.getItem('tempdata') ?? props.settingsStorage.getItem('transport')
        if (transData) this.data.transport = JSON.parse(transData)
    },
    editTransport(index, data) {
        this.data.transport[index] = data
        this.setData()
    },
    changeDetailsPosition(dataIndex, data, index, isUp = false) {
        if (isUp && index == 0 || !isUp && index == data.details.length - 1) return;
        const entries = Object.entries(data.details);
        [entries[index], entries[index + (isUp ? -1 : 1)]] = [entries[index + (isUp ? -1 : 1)], entries[index]];
        data.details = Object.fromEntries(entries)
        this.editTransport(dataIndex, data)
    },
    build(props) {
        this.setProps(props)
        const items = []
        const detailsParams = TRANSPORT_DETAILS_PARAMS
        this.data.transport.forEach((e, i) => {
            const numberColors = []
            for (let c = 0; c < COLORS.carnum.bg.length; c++) {
                numberColors.push(
                    Button({
                        label: e.carnum.num,
                        style: {
                            height: '2em',
                            borderRadius: '.25em',
                            background: `#${COLORS.carnum.bg[c]}`,
                            border: `2px solid ${e.carnum.color == c ? '#00B9BC' : 'transparent'}`,
                            boxShadow: 'none',
                            color: `#${COLORS.carnum.text[c]}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: '.6em',
                            fontWeight: 'bold'
                        },
                        onClick: () => {
                            e.carnum.color = c
                            this.editTransport(i, e)
                        }
                    })
                )
            }
            const colors = []
            let colLen = COLORS.accentArray.length
            for (let c = 0; c <= colLen; c++) {
                colors.push(
                    Button({
                        label: c == colLen ? '◐' : ' ',
                        style: {
                            minWidth: '1.5em',
                            height: '1.5em',
                            borderRadius: '50%',
                            background: c == colLen ? 'transparent' : `#${COLORS.accentArray[c]}`,
                            boxShadow: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            border: `2px solid ${c == colLen ? e.accent.isCustom ? '#00B9BC' : 'gray' : c < colLen && !e.accent.isCustom && e.accent.color == COLORS.accentArray[c] ? '#00B9BC' : 'transparent'}`,
                            fontSize: '1.5em',
                            color: 'white'
                        },
                        onClick: () => {
                            e.accent.isCustom = c == colLen
                            if (c < colLen) e.accent.color = COLORS.accentArray[c]
                            this.editTransport(i, e)
                        }
                    })
                )
            }
            for (const key in detailsParams) {
                if (e.details[key] == undefined) e.details[key] = detailsParams[key]
            }
            const details = []
            const keys = Object.keys(e.details)
            for (const key in e.details) {
                details.push(
                    View(
                        {
                            style: {
                                background: "#333",
                                borderRadius: '.5em',
                                padding: '.5em .75em',
                                display: 'flex',
                                flexDirection: 'column',
                                color: 'white',
                                fontSize: '.8em',
                                fontWeight: 'bold',
                                gap: '.5em'
                            }
                        },
                        [
                            View(
                                {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%"
                                    }
                                },
                                [
                                    View(
                                        {
                                            style: {
                                                width: "2em",
                                                height: "2em",
                                                borderRadius: '.5em',
                                                background: '#222',
                                                color: '#aaa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: "1.2em",
                                                marginRight: ".25em",
                                                opacity: keys.indexOf(key) == 0 ? ".5" : "1"
                                            },
                                            onClick: () => {
                                                if (keys.indexOf(key) != 0) this.changeDetailsPosition(i, e, keys.indexOf(key), true)
                                            }
                                        },
                                        View({}, '⬆')
                                    ),
                                    View(
                                        {
                                            style: {
                                                width: "2em",
                                                height: "2em",
                                                borderRadius: '.5em',
                                                background: '#222',
                                                color: '#aaa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: "1.2em",
                                                marginRight: "1em",
                                                opacity: keys.indexOf(key) == keys.length - 1 ? ".5" : "1"
                                            },
                                            onClick: () => {
                                                if (keys.indexOf(key) != keys.length - 1) this.changeDetailsPosition(i, e, keys.indexOf(key))
                                            }
                                        },
                                        View({}, '⬇')
                                    ),
                                    View(
                                        {
                                            style: {
                                                flex: "1",
                                                fontSize: "1.2em",
                                                filter: "hue-rotate(204deg) saturate(4.4)"
                                            }
                                        },
                                        Toggle({
                                            label: gettext(key),
                                            value: e.details[key].visible,
                                            onChange: (val) => {
                                                e.details[key].visible = val
                                                this.editTransport(i, e)
                                            }
                                        })
                                    )
                                ]
                            ),
                            View(
                                {
                                    style: {
                                        display: e.details[key].visible ? 'flex' : 'none',
                                        gap: '.75em',
                                        flexDirection: 'column'
                                    }
                                },
                                [
                                    e.details[key].types &&
                                    View(
                                        {
                                            style: {
                                                display: "flex",
                                                flexDirection: "column"
                                            }
                                        },
                                        [
                                            gettext("subtype"),
                                            View(
                                                {
                                                    style: {
                                                        filter: "invert() hue-rotate(105deg)"
                                                    }
                                                },
                                                [
                                                    Select({
                                                        value: e.type,
                                                        options: Array.from(e.details[key].types.arr, (type, i) => {
                                                            return {
                                                                name: gettext(type),
                                                                value: i
                                                            }
                                                        }),
                                                        onChange: (val) => {
                                                            e.details[key].types.current = val
                                                            this.editTransport(i, e)
                                                        }
                                                    })
                                                ]
                                            )
                                        ]
                                    ),
                                    View(
                                        {
                                            style: {
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '.5em 1em',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                color: '#aaa'
                                            }
                                        },
                                        [
                                            gettext('lastReplace'),
                                            View(
                                                {
                                                    style: {
                                                        display: 'flex',
                                                        gap: '.5em',
                                                        color: 'white',
                                                        alignItems: 'center',
                                                        fontSize: '1.5em',
                                                        fontWeight: 'bold'
                                                    }
                                                },
                                                [
                                                    TextInput({
                                                        label: '',
                                                        bold: true,
                                                        value: e.details[key].lastUpdate,
                                                        subStyle: {
                                                            color: 'white',
                                                        },
                                                        onChange: (val) => {
                                                            e.details[key].lastUpdate = validator(val, 'number', 7)
                                                            this.editTransport(i, e)
                                                        }
                                                    }),
                                                    gettext('km')
                                                ]
                                            )
                                        ]
                                    ),
                                    View(
                                        {
                                            style: {
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '.5em 1em',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                color: '#aaa'
                                            }
                                        },
                                        [
                                            gettext('replacePeriod'),
                                            View(
                                                {
                                                    style: {
                                                        display: 'flex',
                                                        gap: '.5em',
                                                        color: 'white',
                                                        alignItems: 'center',
                                                        fontSize: '1.5em'
                                                    }
                                                },
                                                [
                                                    TextInput({
                                                        label: '',
                                                        bold: true,
                                                        value: e.details[key].period,
                                                        subStyle: {
                                                            color: 'white'
                                                        },
                                                        onChange: (val) => {
                                                            e.details[key].period = validator(val, 'number', 5)
                                                            this.editTransport(i, e)
                                                        }
                                                    }),
                                                    gettext('km')
                                                ]
                                            )
                                        ]
                                    )
                                ]
                            )
                        ]
                    )
                )
            }
            items.push(
                View(
                    {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1em',
                            background: '#111',
                            padding: '1em',
                            borderRadius: '1em',
                            color: '#aaa'
                        }
                    },
                    [
                        View(
                            {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: ".5em"
                                }
                            },
                            [
                                gettext("type"),
                                View(
                                    {
                                        style: {
                                            filter: "invert() hue-rotate(105deg)"
                                        }
                                    },
                                    [
                                        Select({
                                            value: e.type,
                                            options: Array.from(TRANSPORT_TYPES, (type) => {
                                                return {
                                                    name: gettext(type),
                                                    value: type
                                                }
                                            }),
                                            onChange: (val) => {
                                                e.type = val
                                                this.editTransport(i, e)
                                            }
                                        })
                                    ]
                                )
                            ]
                        ),
                        View(
                            {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.5em',
                                    color: '#aaa'
                                }
                            },
                            [
                                gettext('name'),
                                TextInput({
                                    label: '',
                                    bold: true,
                                    value: e.name,
                                    subStyle: {
                                        color: 'white',
                                        fontSize: '1.2em'
                                    },
                                    onChange: (val) => {
                                        e.name = validator(val, undefined, 20)
                                        this.editTransport(i, e)
                                    }
                                }),
                            ]
                        ),
                        View(
                            {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.5em',
                                    color: '#aaa'
                                }
                            },
                            [
                                gettext('model'),
                                TextInput({
                                    label: '',
                                    bold: true,
                                    value: e.model,
                                    subStyle: {
                                        color: 'white',
                                        fontSize: '1.2em'
                                    },
                                    onChange: (val) => {
                                        e.model = validator(val, undefined, 20)
                                        this.editTransport(i, e)
                                    }
                                }),
                            ]
                        ),
                        View(
                            {
                                style: {
                                    background: '#222',
                                    padding: '1em',
                                    borderRadius: '1em',
                                    color: '#aaa',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: '.5em 1em'
                                }
                            },
                            [
                                gettext("regNum"),
                                View(
                                    {
                                        style: {
                                            width: '100%',
                                            filter: "hue-rotate(204deg) saturate(4.4)"
                                        }
                                    },
                                    Toggle({
                                        label: gettext('regNumVisible'),
                                        value: e.carnum.visible,
                                        onChange: (val) => {
                                            e.carnum.visible = val
                                            this.editTransport(i, e)
                                        }
                                    })
                                ),
                                View(
                                    {
                                        style: {
                                            display: e.carnum.visible ? 'block' : 'none'
                                        }
                                    },
                                    [
                                        gettext('regNumNum'),
                                        TextInput({
                                            label: '',
                                            bold: true,
                                            value: e.carnum.num,
                                            subStyle: {
                                                color: 'white',
                                                fontSize: '1.2em'
                                            },
                                            onChange: (val) => {
                                                e.carnum.num = validator(val, undefined, 11)
                                                this.editTransport(i, e)
                                            }
                                        })
                                    ]
                                ),
                                View(
                                    {
                                        style: {
                                            display: e.carnum.visible ? 'block' : 'none'
                                        }
                                    },
                                    [
                                        gettext("regNumReg"),
                                        TextInput({
                                            label: '',
                                            bold: true,
                                            value: e.carnum.reg,
                                            subStyle: {
                                                color: 'white',
                                                fontSize: '1.2em'
                                            },
                                            onChange: (val) => {
                                                e.carnum.reg = validator(val, undefined, 3)
                                                this.editTransport(i, e)
                                            }
                                        })
                                    ]
                                ),
                                View(
                                    {
                                        style: {
                                            width: '100%',
                                            display: e.carnum.visible ? 'flex' : 'none',
                                            flexDirection: 'column',
                                            gap: '.5em'
                                        }
                                    },
                                    [
                                        gettext("regNumColor"),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '.25em .5em',
                                                    fontSize: '1.2em'
                                                }
                                            },
                                            [
                                                ...numberColors
                                            ]
                                        )
                                    ]
                                ),
                                View(
                                    {
                                        style: {
                                            width: '100%',
                                            display: e.carnum.visible ? 'flex' : 'none',
                                            flexDirection: 'column',
                                            gap: '.5em'
                                        }
                                    },
                                    [
                                        gettext("regNumFormat"),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em'
                                                }
                                            },
                                            [
                                                View(
                                                    {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '.1em',
                                                            flex: '1',
                                                            fontSize: '1.2em',
                                                            fontWeight: 'bold',
                                                            color: `#${COLORS.carnum.text[e.carnum.color]}`
                                                        }
                                                    },
                                                    [
                                                        View(
                                                            {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    borderRadius: '.25em .1em .1em .25em',
                                                                    background: `#${COLORS.carnum.bg[e.carnum.color]}`,
                                                                    padding: '0 .25em'
                                                                }
                                                            },
                                                            e.carnum.num
                                                        ),
                                                        View(
                                                            {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    borderRadius: '.1em .25em .25em .1em',
                                                                    background: `#${COLORS.carnum.bg[e.carnum.color]}`,
                                                                    padding: '0 .25em'
                                                                }
                                                            },
                                                            e.carnum.reg
                                                        )
                                                    ]
                                                ),
                                                Button({
                                                    label: e.carnum.format == 1 ? '◉' : '⭘',
                                                    style: {
                                                        height: '1.2em',
                                                        borderRadius: '1em',
                                                        background: 'none',
                                                        boxShadow: 'none',
                                                        color: e.carnum.format == 1 ? '#00B9BC' : 'gray',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.5em',
                                                        padding: '0',
                                                        minWidth: '1.2em'
                                                    },
                                                    onClick: () => {
                                                        e.carnum.format = 1
                                                        this.editTransport(i, e)
                                                    }
                                                })
                                            ]
                                        ),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em'
                                                }
                                            },
                                            [
                                                View(
                                                    {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '.1em',
                                                            flex: '1',
                                                            fontSize: '1.2em',
                                                            fontWeight: 'bold',
                                                            color: `#${COLORS.carnum.text[e.carnum.color]}`
                                                        }
                                                    },
                                                    [
                                                        View(
                                                            {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    borderRadius: '.25em .1em .1em .25em',
                                                                    background: `#${COLORS.carnum.bg[e.carnum.color]}`,
                                                                    padding: '0 .25em'
                                                                }
                                                            },
                                                            e.carnum.reg
                                                        ),
                                                        View(
                                                            {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    borderRadius: '.1em .25em .25em .1em',
                                                                    background: `#${COLORS.carnum.bg[e.carnum.color]}`,
                                                                    padding: '0 .25em'
                                                                }
                                                            },
                                                            e.carnum.num
                                                        )
                                                    ]
                                                ),
                                                Button({
                                                    label: e.carnum.format == 2 ? '◉' : '⭘',
                                                    style: {
                                                        height: '1.2em',
                                                        borderRadius: '1em',
                                                        background: 'none',
                                                        boxShadow: 'none',
                                                        color: e.carnum.format == 2 ? '#00B9BC' : 'gray',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.5em',
                                                        padding: '0',
                                                        minWidth: '1.2em'
                                                    },
                                                    onClick: () => {
                                                        e.carnum.format = 2
                                                        this.editTransport(i, e)
                                                    }
                                                })
                                            ]
                                        ),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em'
                                                }
                                            },
                                            [
                                                View(
                                                    {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '.1em',
                                                            flex: '1',
                                                            fontSize: '1.2em',
                                                            fontWeight: 'bold',
                                                            color: `#${COLORS.carnum.text[e.carnum.color]}`
                                                        }
                                                    },
                                                    [
                                                        View(
                                                            {
                                                                style: {
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    borderRadius: '.25em',
                                                                    background: `#${COLORS.carnum.bg[e.carnum.color]}`,
                                                                    padding: '0 .25em'
                                                                }
                                                            },
                                                            e.carnum.num
                                                        )
                                                    ]
                                                ),
                                                Button({
                                                    label: e.carnum.format == 3 ? '◉' : '⭘',
                                                    style: {
                                                        height: '1.2em',
                                                        borderRadius: '1em',
                                                        background: 'none',
                                                        boxShadow: 'none',
                                                        color: e.carnum.format == 3 ? '#00B9BC' : 'gray',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.5em',
                                                        padding: '0',
                                                        minWidth: '1.2em'
                                                    },
                                                    onClick: () => {
                                                        e.carnum.format = 3
                                                        this.editTransport(i, e)
                                                    }
                                                })
                                            ]
                                        )
                                    ]
                                )
                            ]
                        ),
                        View(
                            {
                                style: {
                                    background: '#222',
                                    padding: '1em',
                                    borderRadius: '1em',
                                    color: '#aaa',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexWrap: 'wrap',
                                    gap: '.75em'
                                }
                            },
                            [
                                gettext("mileage"),
                                View(
                                    {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '1em',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }
                                    },
                                    [
                                        gettext('current'),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em',
                                                    color: 'white',
                                                    fontSize: '1.2em',
                                                    fontWeight: 'bold',
                                                    alignItems: 'center'
                                                }
                                            },
                                            [
                                                TextInput({
                                                    label: '',
                                                    bold: true,
                                                    value: e.mileage.current,
                                                    subStyle: {
                                                        color: 'white'
                                                    },
                                                    onChange: (val) => {
                                                        e.mileage.current = validator(val, 'number', 7)
                                                        this.editTransport(i, e)
                                                    }
                                                }),
                                                gettext('km')
                                            ]
                                        )
                                    ]
                                ),
                                View(
                                    {
                                        style: {
                                            filter: "hue-rotate(205deg)"
                                        }
                                    },
                                    [
                                        Toggle({
                                            label: gettext('autoMileage'),
                                            value: e.mileage.auto,
                                            onChange: (val) => {
                                                e.mileage.auto = val
                                                this.editTransport(i, e)
                                            }
                                        })
                                    ]
                                ),
                                View(
                                    {
                                        style: {
                                            display: e.mileage.auto ? 'flex' : 'none',
                                            flexWrap: 'wrap',
                                            gap: '1em',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }
                                    },
                                    [
                                        gettext('perMonth'),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em',
                                                    color: 'white',
                                                    fontSize: '1.2em',
                                                    fontWeight: 'bold',
                                                    alignItems: 'center'
                                                }
                                            },
                                            [
                                                TextInput({
                                                    label: '',
                                                    bold: true,
                                                    value: e.mileage.perMonth,
                                                    subStyle: {
                                                        color: 'white'
                                                    },
                                                    onChange: (val) => {
                                                        e.mileage.perMonth = validator(val, 'number', 6)
                                                        this.editTransport(i, e)
                                                    }
                                                }),
                                                gettext('km')
                                            ]
                                        )
                                    ]
                                )
                            ]
                        ),
                        View(
                            {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.75em',
                                    background: '#222',
                                    padding: '1em',
                                    borderRadius: '1em'
                                }
                            },
                            [
                                gettext('maintenance'),
                                View(
                                    {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '1em',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }
                                    },
                                    [
                                        gettext('lastMaintenance'),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em',
                                                    color: 'white',
                                                    alignItems: 'center',
                                                    fontSize: '1.2em',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            [
                                                TextInput({
                                                    label: '',
                                                    bold: true,
                                                    value: e.maintenance.last,
                                                    subStyle: {
                                                        color: 'white'
                                                    },
                                                    onChange: (val) => {
                                                        e.maintenance.last = validator(val, 'number', 6)
                                                        this.editTransport(i, e)
                                                    }
                                                }),
                                                gettext('km')
                                            ]
                                        )
                                    ]
                                ),
                                View(
                                    {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '.5em 2em',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }
                                    },
                                    [
                                        gettext('maintenancePeriod'),
                                        View(
                                            {
                                                style: {
                                                    display: 'flex',
                                                    gap: '.5em',
                                                    color: 'white',
                                                    alignItems: 'center',
                                                    fontSize: '1.2em',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            [
                                                TextInput({
                                                    label: '',
                                                    bold: true,
                                                    value: e.maintenance.period,
                                                    subStyle: {
                                                        color: 'white'
                                                    },
                                                    onChange: (val) => {
                                                        e.maintenance.period = validator(val, 'number', 6)
                                                        this.editTransport(i, e)
                                                    }
                                                }),
                                                gettext('km')
                                            ]
                                        )
                                    ]
                                )
                            ]
                        ),
                        View(
                            {
                                style: {
                                    background: '#222',
                                    padding: '1em',
                                    borderRadius: '1em',
                                    color: '#aaa',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexWrap: 'wrap',
                                    gap: '.75em'
                                }
                            },
                            [
                                gettext("accent"),
                                View(
                                    {
                                        style: {
                                            display: "flex",
                                            flexWrap: 'wrap',
                                            gap: ".5em 2em"
                                        }
                                    },
                                    [
                                        View(
                                            {
                                                style: {
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: ".5em"
                                                }
                                            },
                                            [
                                                gettext("choose"),
                                                View(
                                                    {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '.5em',
                                                            flexWrap: 'wrap'
                                                        }
                                                    },
                                                    [
                                                        ...colors
                                                    ]
                                                )
                                            ],
                                        ),
                                        typeof e.accent == "object" && e.accent.isCustom &&
                                        View(
                                            {
                                                style: {
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: ".5em"
                                                }
                                            },
                                            [
                                                gettext("enter"),
                                                View(
                                                    {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '.5em',
                                                            color: 'white',
                                                            alignItems: 'center',
                                                            fontSize: '1.2em',
                                                            fontWeight: 'bold'
                                                        }
                                                    },
                                                    [
                                                        "#",
                                                        TextInput({
                                                            label: '',
                                                            bold: true,
                                                            value: e.accent.customColor ?? "000000",
                                                            subStyle: {
                                                                color: 'white'
                                                            },
                                                            onChange: (val) => {
                                                                e.accent.customColor = validator(val, "color", 6)
                                                                this.editTransport(i, e)
                                                            }
                                                        })
                                                    ]
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ]
                        ),
                        View(
                            {
                                style: {
                                    background: '#222',
                                    padding: '1em',
                                    borderRadius: '1em',
                                    color: '#aaa',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1em'
                                }
                            },
                            [
                                gettext("details"),
                                ...details
                            ]
                        ),
                        View(
                            {
                                style: {}
                            },
                            [
                                Button({
                                    label: gettext("delete"),
                                    style: {
                                        width: "100%",
                                        padding: ".5em 1em",
                                        borderRadius: '1em',
                                        background: '#333',
                                        color: '#ff3333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: "1.2em"
                                    },
                                    onClick: () => {
                                        this.removeTransport(i)
                                        this.toast.message = `Транспорт ${e.name}${e.model ? ` ${e.model}` : ''} удалён`
                                        this.toast.show = true
                                    }
                                })
                            ]
                        )
                    ]
                )
            )
        })
        return View(
            {
                style: {
                    background: 'black',
                    width: '100dvw',
                    height: '100%',
                    minHeight: '100vh',
                    padding: '1em',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1em'
                }
            },
            [
                items.length == 0 &&
                View(
                    {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: "#111",
                            borderRadius: "1em",
                            padding: "1em 2em",
                            color: "#aaa"
                        }
                    },
                    [
                        gettext("transportNull")
                    ]
                ),
                ...items,
                View(
                    {
                        style: {
                            display: "flex",
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1em',
                            flexDirection: "column"
                        }
                    },
                    [
                        Button({
                            label: gettext("add"),
                            style: {
                                padding: "1em 2em",
                                borderRadius: '2em',
                                background: '#333',
                                color: '#00aaff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: "1.2em"
                            },
                            onClick: () => {
                                const newTransport = NEW_TRANSPORT
                                newTransport.autoID = new Date().getTime()
                                newTransport.mileage.lastUpdate = Math.floor(new Date().getTime() / (1000 * 3600 * 24))
                                this.addTransport(NEW_TRANSPORT)
                            }
                        }),
                        props.settingsStorage.getItem('tempdata') &&
                        View(
                            {
                                style: {
                                    display: "flex",
                                    gap: "1em"
                                }
                            },
                            [
                                Button({
                                    label: gettext("cancel"),
                                    style: {
                                        padding: "1em 2em",
                                        borderRadius: '2em',
                                        background: '#333',
                                        color: '#ff3333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: "1.2em"
                                    },
                                    onClick: () => {
                                        this.data.props.settingsStorage.removeItem('tempdata')
                                    }
                                }),
                                Button({
                                    label: gettext("save"),
                                    style: {
                                        padding: "1em 2em",
                                        borderRadius: '2em',
                                        background: '#333',
                                        color: '#00B9BC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: "1.2em"
                                    },
                                    onClick: () => {
                                        this.setData(true)
                                    }
                                })
                            ]
                        )
                    ]
                ),
                View(
                    {
                        style: {
                            background: "#131",
                            display: "flex",
                            flexDirection: "column",
                            padding: "1em",
                            gap: "1em",
                            borderRadius: "1em",
                            color: "#aaa",
                            marginTop: "1em"
                        }
                    },
                    [
                        View({ style: { color: "white", fontSize: "1.2em" } }, gettext("appinfo")),
                        View(
                            {
                                style: {
                                    display: "flex",
                                    gap: "1em"
                                }
                            },
                            [
                                View({}, gettext("vender")),
                                View({ style: { color: "white" } }, gettext("venderText"))
                            ]
                        ),
                        View(
                            {
                                style: {
                                    display: "flex",
                                    gap: "1em",
                                    border: "1px solid #161",
                                    borderRadius: "1em",
                                    padding: "1em",
                                    flexWrap: "wrap"
                                }
                            },
                            [
                                gettext("links"),
                                Link({ source: "https://4pda.to/forum/index.php?showtopic=1052827&st=3280#entry136214711" },
                                    View({ style: { color: "white", textDecoration: "underline" } }, gettext("pdalink"))
                                ),
                                Link({ source: "https://t.me/igorkhudiakov" },
                                    View({ style: { color: "white", textDecoration: "underline" } }, gettext("tglink"))
                                ),
                                Link({ source: "mailto:khudiakov.i.v@gmail.com" },
                                    View({ style: { color: "white", textDecoration: "underline" } }, gettext("gmail"))
                                ),
                                Link({ source: "https://yoomoney.ru/to/4100119028733968/100" },
                                    View({ style: { color: "white", textDecoration: "underline" } }, gettext("donate"))
                                )
                            ]
                        ),
                        View(
                            {
                                style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: ".5em"
                                }
                            },
                            [
                                View({}, gettext("description")),
                                View({ style: { color: "white" } }, gettext("descriptionFull1")),
                                View({ style: { color: "white" } }, gettext("descriptionFull2")),
                                View({ style: { color: "white" } }, gettext("descriptionFull3")),
                                View({ style: { color: "white" } }, gettext("descriptionFull4"))
                            ]
                        )
                    ]
                ),
                Toast(
                    {
                        message: this.toast.message ?? '',
                        vertical: 'bottom',
                        visible: this.toast.show,
                        duration: 1000,
                        onClose: () => {
                            this.toast.show = false
                            this.setData()
                        }
                    }
                )
            ]
        )
    }
})