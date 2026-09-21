export default {
    consonants: new Map([
        ["p", {
            glyph: "p",
            extend: [
                0,
                2
            ],
            hook: "top"
        }],
        ["b", {
            glyph: "b",
            extend: [
                0,
                2
            ],
            hook: "bottom"
        }],
        ["t", {
            glyph: "t",
            hook: true,
            except: [
                {
                    glyph: "l",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                }
            ]
        }],
        ["d", {
            glyph: "d",
            hook: true,
            except: [
                {
                    glyph: "l",
                    hook: "bottom"
                }
            ]
        }],
        ["k", {
            glyph: "k",
            hook: "top",
            except: [
                {
                    glyph: "g",
                    hook: "top-bottom"
                }
            ]
        }],
        [
            "g", {
            glyph: "g",
            hook: "bottom",
            except: [
                {
                    glyph: "k",
                    hook: "bottom-top"
                },
                {
                    glyph: "l",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                },
                {
                    glyph: "r",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                }
            ]
        }
        ],
        ["r", {
            glyph: "r",
            hook: true,
            extend: [
                4,
                4
            ],
            except: [
                {
                    glyph: "g",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                },
                {
                    glyph: "n",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                }
            ]
        }],
        ["h", {
            glyph: "h",
            hook: "bottom"
        }],
        ["n", {
            glyph: "n",
            hook: "bottom"
        }],
        ["h", {
            glyph: "hr",
            hook: "top"
        }],
        ["hr", {
            glyph: "c",
            hook: "top",
            except: [
                {
                    glyph: "n",
                    hook: "top",
                    extend: [
                        0,
                        4
                    ]
                }
            ]
        }],
        ["dj", {
            glyph: "dj",
            hook: "top",
            except: [
                {
                    glyph: "h",
                    hook: "bottom",
                    extend: [
                        0,
                        4
                    ]
                }
            ]
        }],
        ["tc", {
            glyph: "tc",
            hook: "top",
            except: [
                {
                    glyph: "n",
                    hook: "top",
                    extend: [
                        0,
                        4
                    ]
                }
            ]
        }],
        ["s", {
            glyph: "s",
            hook: true,
            extend: [
                2.4,
                2.1
            ]
        }],
        ["dz", {
            glyph: "dz",
            hook: "top"
        }],
        ["ts", {
            glyph: "ts",
            hook: "bottom",
            except: [
                {
                    glyph: "h",
                    hook: "bottom",
                    extend: [
                        0,
                        4
                    ]
                }
            ]
        }],
        ["c", {
            glyph: "c",
            hook: "top"
        }],
        ["y", {
            glyph: "y",
            hook: "top"
        }],
        ["f", {
            glyph: "f",
            hook: true
        }],
        ["m", {
            glyph: "m",
            hook: true
        }],
        ["l", {
            glyph: "l",
            hook: true,
            extend: [
                4,
                4
            ],
            except: [
                {
                    glyph: "g",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                },
                {
                    glyph: "n",
                    hook: "bottom",
                    extend: [
                        0,
                        0
                    ]
                }
            ]
        }]
    ]),
    punctuation: new Map([
        ["bottom", {glyph: "open-bottom"}],
        ["top", {glyph: "open-top"}]
    ]),
    vowels: new Map([
        ["a", {glyph: "a"}],
        ["e", {glyph: undefined}],
        ["i", {glyph: "i"}],
        ["o", {glyph: "o"}],
        ["u", {glyph: "u"}],
    ])
}