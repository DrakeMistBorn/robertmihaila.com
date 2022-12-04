(this.webpackJsonpqrbtf = this.webpackJsonpqrbtf || []).push([
    [0], {
        122: function (e, A) {
            function o(e) {
                this.mode = i.MODE_8BIT_BYTE,
                this.data = e,
                this.parsedData = [];
                for (var A = 0, o = this.data.length; A < o; A++) {
                    var t = [],
                        r = this
                            .data
                            .charCodeAt(A);
                    r > 65536
                        ? (
                            t[0] = 240 | (1835008 & r) >>> 18,
                            t[1] = 128 | (258048 & r) >>> 12,
                            t[2] = 128 | (4032 & r) >>> 6,
                            t[3] = 128 | 63 & r
                        )
                        : r > 2048
                            ? (
                                t[0] = 224 | (61440 & r) >>> 12,
                                t[1] = 128 | (4032 & r) >>> 6,
                                t[2] = 128 | 63 & r
                            )
                            : r > 128
                                ? (t[0] = 192 | (1984 & r) >>> 6, t[1] = 128 | 63 & r)
                                : t[0] = r,
                    this
                        .parsedData
                        .push(t)
                }
                this.parsedData = Array
                    .prototype
                    .concat
                    .apply([], this.parsedData),
                this.parsedData.length != this.data.length && (
                    this.parsedData.unshift(191),
                    this.parsedData.unshift(187),
                    this.parsedData.unshift(239)
                )
            }
            function t(e, A) {
                this.typeNumber = e,
                this.errorCorrectLevel = A,
                this.modules = null,
                this.moduleCount = 0,
                this.position = [],
                this.dataCache = null,
                this.dataList = []
            }
            o.prototype = {
                getLength: function (e) {
                    return this.parsedData.length
                },
                write: function (e) {
                    for (var A = 0, o = this.parsedData.length; A < o; A++) 
                        e.put(this.parsedData[A], 8)
                }
            },
            t.prototype = {
                addData: function (e) {
                    var A = new o(e);
                    this
                        .dataList
                        .push(A),
                    this.dataCache = null
                },
                isDark: function (e, A) {
                    if (e < 0 || this.moduleCount <= e || A < 0 || this.moduleCount <= A) 
                        throw new Error(e + "," + A);
                    return this.modules[e][A]
                },
                getModuleCount: function () {
                    return this.moduleCount
                },
                getPositionTable: function () {
                    return this.position
                },
                make: function () {
                    if (this.typeNumber < 1) {
                        var e = 1;
                        for (e = 1; e < 40; e++) {
                            for (
                                var A = h.getRSBlocks(e, this.errorCorrectLevel),
                                o = new B,
                                t = 0,
                                i = 0;
                                i < A.length;
                                i++
                            ) 
                                t += A[i].dataCount;
                            for (var r = 0; r < this.dataList.length; r++) {
                                var a = this.dataList[r];
                                o.put(a.mode, 4),
                                o.put(a.getLength(), R.getLengthInBits(a.mode, e)),
                                a.write(o)
                            }
                            if (o.getLengthInBits() <= 8 * t) 
                                break
                        }
                        this.typeNumber = e
                    }
                    this.makeImpl(!1, this.getBestMaskPattern())
                },
                makeImpl: function (e, A) {
                    this.moduleCount = 4 * this.typeNumber + 17,
                    this.modules = new Array(this.moduleCount);
                    for (var o = 0; o < this.moduleCount; o++) {
                        this.modules[o] = new Array(this.moduleCount);
                        for (var i = 0; i < this.moduleCount; i++) 
                            this.modules[o][i] = null
                    }
                    this.setupPositionProbePattern(0, 0),
                    this.setupPositionProbePattern(this.moduleCount - 7, 0),
                    this.setupPositionProbePattern(0, this.moduleCount - 7),
                    this.setupPositionAdjustPattern(),
                    this.setupTimingPattern(),
                    this.setupTypeInfo(e, A),
                    this.typeNumber >= 7 && this.setupTypeNumber(e),
                    null == this.dataCache && (
                        this.dataCache = t.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)
                    ),
                    this.mapData(this.dataCache, A)
                },
                setupPositionProbePattern: function (e, A) {
                    for (var o = -1; o <= 7; o++) 
                        if (!(e + o <= -1 || this.moduleCount <= e + o)) 
                            for (var t = -1; t <= 7; t++) 
                                A + t <= -1 || this.moduleCount <= A + t || (
                                    this.modules[e + o][A + t] = 0 <= o && o <= 6 && (0 == t || 6 == t) || 0 <= t && t <= 6 && (0 == o || 6 == o) || 2 <= o && o <= 4 && 2 <= t && t <= 4
                                )
                },
                getBestMaskPattern: function () {
                    for (var e = 0, A = 0, o = 0; o < 8; o++) {
                        this.makeImpl(!0, o);
                        var t = R.getLostPoint(this);
                        (0 == o || e > t) && (e = t, A = o)
                    }
                    return A
                },
                setupTimingPattern: function () {
                    for (var e = 8; e < this.moduleCount - 8; e++) 
                        null == this.modules[e][6] && (this.modules[e][6] = e % 2 == 0);
                    for (var A = 8; A < this.moduleCount - 8; A++) 
                        null == this.modules[6][A] && (this.modules[6][A] = A % 2 == 0)
                },
                setupPositionAdjustPattern: function () {
                    var e = R.getPatternPosition(this.typeNumber);
                    this.position = [];
                    for (var A = 0; A < e.length; A++) 
                        for (var o = 0; o < e.length; o++) {
                            var t = e[A],
                                i = e[o];
                            if (null == this.modules[t][i]) {
                                this
                                    .position
                                    .push([t, i]);
                                for (var r = -2; r <= 2; r++) 
                                    for (var a = -2; a <= 2; a++) 
                                        this.modules[t + r][i + a] = -2 == r || 2 == r || -2 == a || 2 == a || 0 == r && 0 == a
                            }
                        }
                    },
                setupTypeNumber: function (e) {
                    for (var A = R.getBCHTypeNumber(this.typeNumber), o = 0; o < 18; o++) {
                        var t = !e && 1 == (A >> o & 1);
                        this.modules[Math.floor(o / 3)][o % 3 + this.moduleCount - 8 - 3] = t
                    }
                    for (var i = 0; i < 18; i++) {
                        var r = !e && 1 == (A >> i & 1);
                        this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = r
                    }
                },
                setupTypeInfo: function (e, A) {
                    for (
                        var o = this.errorCorrectLevel << 3 | A,
                        t = R.getBCHTypeInfo(o),
                        i = 0;
                        i < 15;
                        i++
                    ) {
                        var r = !e && 1 == (t >> i & 1);
                        i < 6
                            ? this.modules[i][8] = r
                            : i < 8
                                ? this.modules[i + 1][8] = r
                                : this.modules[this.moduleCount - 15 + i][8] = r
                    }
                    for (var a = 0; a < 15; a++) {
                        var K = !e && 1 == (t >> a & 1);
                        a < 8
                            ? this.modules[8][this.moduleCount - a - 1] = K
                            : a < 9
                                ? this.modules[8][15 - a - 1 + 1] = K
                                : this.modules[8][15 - a - 1] = K
                    }
                    this.modules[this.moduleCount - 8][8] = !e
                },
                mapData: function (e, A) {
                    for (
                        var o = -1,
                        t = this.moduleCount - 1,
                        i = 7,
                        r = 0,
                        a = this.moduleCount - 1;
                        a > 0;
                        a -= 2
                    ) 
                        for (6 == a && a--;;) {
                            for (var K = 0; K < 2; K++) 
                                if (null == this.modules[t][a - K]) {
                                    var n = !1;
                                    r < e.length && (n = 1 == (e[r] >>> i & 1)),
                                    R.getMask(A, t, a - K) && (n = !n),
                                    this.modules[t][a - K] = n,
                                    -1 == --i && (r++, i = 7)
                                }
                            if ((t += o) < 0 || this.moduleCount <= t) {
                                t -= o,
                                o = -o;
                                break
                            }
                        }
                    }
            },
            t.PAD0 = 236,
            t.PAD1 = 17,
            t.createData = function (e, A, o) {
                for (var i = h.getRSBlocks(e, A), r = new B, a = 0; a < o.length; a++) {
                    var K = o[a];
                    r.put(K.mode, 4),
                    r.put(K.getLength(), R.getLengthInBits(K.mode, e)),
                    K.write(r)
                }
                for (var n = 0, l = 0; l < i.length; l++) 
                    n += i[l].dataCount;
                if (r.getLengthInBits() > 8 * n) 
                    throw new Error(
                        "code length overflow. (" + r.getLengthInBits() + ">" + 8 * n + ")"
                    );
                for (
                    r.getLengthInBits() + 4 <= 8 * n && r.put(0, 4);
                    r.getLengthInBits() % 8 != 0;
                ) 
                    r.putBit(!1);
                for (
                    ;
                    !(r.getLengthInBits() >= 8 * n) && (r.put(t.PAD0, 8), !(r.getLengthInBits() >= 8 * n));
                ) 
                    r.put(t.PAD1, 8);
                return t.createBytes(r, i)
            },
            t.createBytes = function (e, A) {
                for (
                    var o = 0,
                    t = 0,
                    i = 0,
                    r = new Array(A.length),
                    a = new Array(A.length),
                    K = 0;
                    K < A.length;
                    K++
                ) {
                    var n = A[K].dataCount,
                        l = A[K].totalCount - n;
                    t = Math.max(t, n),
                    i = Math.max(i, l),
                    r[K] = new Array(n);
                    for (var f = 0; f < r[K].length; f++) 
                        r[K][f] = 255 & e.buffer[f + o];
                    o += n;
                    var c = R.getErrorCorrectPolynomial(l),
                        F = new m(r[K], c.getLength() - 1).mod(c);
                    a[K] = new Array(c.getLength() - 1);
                    for (var U = 0; U < a[K].length; U++) {
                        var s = U + F.getLength() - a[K].length;
                        a[K][U] = s >= 0
                            ? F.get(s)
                            : 0
                    }
                }
                for (var g = 0, u = 0; u < A.length; u++) 
                    g += A[u].totalCount;
                for (var d = new Array(g), C = 0, p = 0; p < t; p++) 
                    for (var v = 0; v < A.length; v++) 
                        p < r[v].length && (d[C++] = r[v][p]);
            for (var h = 0; h < i; h++) 
                    for (var B = 0; B < A.length; B++) 
                        h < a[B].length && (d[C++] = a[B][h]);
            return d
            };
            for (
                var i = {
                    MODE_NUMBER: 1,
                    MODE_ALPHA_NUM: 2,
                    MODE_8BIT_BYTE: 4,
                    MODE_KANJI: 8
                },
                r = 1,
                a = 0,
                K = 3,
                n = 2,
                l = 0,
                f = 1,
                c = 2,
                F = 3,
                U = 4,
                s = 5,
                g = 6,
                u = 7,
                R = {
                    PATTERN_POSITION_TABLE: [
                        [],
                        [
                            6, 18
                        ],
                        [
                            6, 22
                        ],
                        [
                            6, 26
                        ],
                        [
                            6, 30
                        ],
                        [
                            6, 34
                        ],
                        [
                            6, 22, 38
                        ],
                        [
                            6, 24, 42
                        ],
                        [
                            6, 26, 46
                        ],
                        [
                            6, 28, 50
                        ],
                        [
                            6, 30, 54
                        ],
                        [
                            6, 32, 58
                        ],
                        [
                            6, 34, 62
                        ],
                        [
                            6, 26, 46, 66
                        ],
                        [
                            6, 26, 48, 70
                        ],
                        [
                            6, 26, 50, 74
                        ],
                        [
                            6, 30, 54, 78
                        ],
                        [
                            6, 30, 56, 82
                        ],
                        [
                            6, 30, 58, 86
                        ],
                        [
                            6, 34, 62, 90
                        ],
                        [
                            6, 28, 50, 72, 94
                        ],
                        [
                            6, 26, 50, 74, 98
                        ],
                        [
                            6, 30, 54, 78, 102
                        ],
                        [
                            6, 28, 54, 80, 106
                        ],
                        [
                            6, 32, 58, 84, 110
                        ],
                        [
                            6, 30, 58, 86, 114
                        ],
                        [
                            6, 34, 62, 90, 118
                        ],
                        [
                            6,
                            26,
                            50,
                            74,
                            98,
                            122
                        ],
                        [
                            6,
                            30,
                            54,
                            78,
                            102,
                            126
                        ],
                        [
                            6,
                            26,
                            52,
                            78,
                            104,
                            130
                        ],
                        [
                            6,
                            30,
                            56,
                            82,
                            108,
                            134
                        ],
                        [
                            6,
                            34,
                            60,
                            86,
                            112,
                            138
                        ],
                        [
                            6,
                            30,
                            58,
                            86,
                            114,
                            142
                        ],
                        [
                            6,
                            34,
                            62,
                            90,
                            118,
                            146
                        ],
                        [
                            6,
                            30,
                            54,
                            78,
                            102,
                            126,
                            150
                        ],
                        [
                            6,
                            24,
                            50,
                            76,
                            102,
                            128,
                            154
                        ],
                        [
                            6,
                            28,
                            54,
                            80,
                            106,
                            132,
                            158
                        ],
                        [
                            6,
                            32,
                            58,
                            84,
                            110,
                            136,
                            162
                        ],
                        [
                            6,
                            26,
                            54,
                            82,
                            110,
                            138,
                            166
                        ],
                        [
                            6,
                            30,
                            58,
                            86,
                            114,
                            142,
                            170
                        ]
                    ],
                    G15: 1335,
                    G18: 7973,
                    G15_MASK: 21522,
                    getBCHTypeInfo: function (e) {
                        for (var A = e << 10; R.getBCHDigit(A) - R.getBCHDigit(R.G15) >= 0;) 
                            A ^= R.G15 << R.getBCHDigit(A) - R.getBCHDigit(R.G15);
                        return (e << 10 | A) ^ R.G15_MASK
                    },
                    getBCHTypeNumber: function (e) {
                        for (var A = e << 12; R.getBCHDigit(A) - R.getBCHDigit(R.G18) >= 0;) 
                            A ^= R.G18 << R.getBCHDigit(A) - R.getBCHDigit(R.G18);
                        return e << 12 | A
                    },
                    getBCHDigit: function (e) {
                        for (var A = 0; 0 != e;) 
                            A++,
                            e >>>= 1;
                        return A
                    },
                    getPatternPosition: function (e) {
                        return R.PATTERN_POSITION_TABLE[e - 1]
                    },
                    getMask: function (e, A, o) {
                        switch (e) {
                            case l:
                                return (A + o) % 2 == 0;
                            case f:
                                return A % 2 == 0;
                            case c:
                                return o % 3 == 0;
                            case F:
                                return (A + o) % 3 == 0;
                            case U:
                                return (Math.floor(A / 2) + Math.floor(o / 3)) % 2 == 0;
                            case s:
                                return A * o % 2 + A * o % 3 == 0;
                            case g:
                                return (A * o % 2 + A * o % 3) % 2 == 0;
                            case u:
                                return (A * o % 3 + (A + o) % 2) % 2 == 0;
                            default:
                                throw new Error("bad maskPattern:" + e)
                        }
                    },
                    getErrorCorrectPolynomial: function (e) {
                        for (var A = new m([1], 0), o = 0; o < e; o++) 
                            A = A.multiply(new m([
                                1, d.gexp(o)
                            ], 0));
                        return A
                    },
                    getLengthInBits: function (e, A) {
                        if (1 <= A && A < 10) 
                            switch (e) {
                                case i.MODE_NUMBER:
                                    return 10;
                                case i.MODE_ALPHA_NUM:
                                    return 9;
                                case i.MODE_8BIT_BYTE:
                                case i.MODE_KANJI:
                                    return 8;
                                default:
                                    throw new Error("mode:" + e)
                            }
                        else if (A < 27) 
                            switch (e) {
                                case i.MODE_NUMBER:
                                    return 12;
                                case i.MODE_ALPHA_NUM:
                                    return 11;
                                case i.MODE_8BIT_BYTE:
                                    return 16;
                                case i.MODE_KANJI:
                                    return 10;
                                default:
                                    throw new Error("mode:" + e)
                            }
                        else {
                            if (!(A < 41)) 
                                throw new Error("type:" + A);
                            switch (e) {
                                case i.MODE_NUMBER:
                                    return 14;
                                case i.MODE_ALPHA_NUM:
                                    return 13;
                                case i.MODE_8BIT_BYTE:
                                    return 16;
                                case i.MODE_KANJI:
                                    return 12;
                                default:
                                    throw new Error("mode:" + e)
                            }
                        }
                    },
                    getLostPoint: function (e) {
                        for (var A = e.getModuleCount(), o = 0, t = 0; t < A; t++) 
                            for (var i = 0; i < A; i++) {
                                for (var r = 0, a = e.isDark(t, i), K = -1; K <= 1; K++) 
                                    if (!(t + K < 0 || A <= t + K)) 
                                        for (var n = -1; n <= 1; n++) 
                                            i + n < 0 || A <= i + n || 0 == K && 0 == n || a == e.isDark(t + K, i + n) && r++;
                            r > 5 && (o += 3 + r - 5)
                            }
                        for (var l = 0; l < A - 1; l++) 
                            for (var f = 0; f < A - 1; f++) {
                                var c = 0;
                                e.isDark(l, f) && c++,
                                e.isDark(l + 1, f) && c++,
                                e.isDark(l, f + 1) && c++,
                                e.isDark(l + 1, f + 1) && c++,
                                0 != c && 4 != c || (o += 3)
                            }
                        for (var F = 0; F < A; F++) 
                            for (var U = 0; U < A - 6; U++) 
                                e.isDark(F, U) && !e.isDark(F, U + 1) && e.isDark(F, U + 2) && e.isDark(
                                    F,
                                    U + 3
                                ) && e.isDark(F, U + 4) && !e.isDark(F, U + 5) && e.isDark(F, U + 6) && (
                                    o += 40
                                );
                    for (var s = 0; s < A; s++) 
                            for (var g = 0; g < A - 6; g++) 
                                e.isDark(g, s) && !e.isDark(g + 1, s) && e.isDark(g + 2, s) && e.isDark(
                                    g + 3,
                                    s
                                ) && e.isDark(g + 4, s) && !e.isDark(g + 5, s) && e.isDark(g + 6, s) && (
                                    o += 40
                                );
                    for (var u = 0, R = 0; R < A; R++) 
                            for (var d = 0; d < A; d++) 
                                e.isDark(d, R) && u++;
                    return o += 10 * (Math.abs(100 * u / A / A - 50) / 5)
                    }
                },
                d = {
                    glog: function (e) {
                        if (e < 1) 
                            throw new Error("glog(" + e + ")");
                        return d.LOG_TABLE[e]
                    },
                    gexp: function (e) {
                        for (; e < 0;) 
                            e += 255;
                        for (; e >= 256;) 
                            e -= 255;
                        return d.EXP_TABLE[e]
                    },
                    EXP_TABLE: new Array(256),
                    LOG_TABLE: new Array(256)
                },
                C = 0; C < 8; C++
            ) 
                d.EXP_TABLE[C] = 1 << C;
            for (var p = 8; p < 256; p++) 
                d.EXP_TABLE[p] = d.EXP_TABLE[p - 4] ^ d.EXP_TABLE[p - 5] ^ d.EXP_TABLE[p - 6] ^ d.EXP_TABLE[p - 8];
            for (var v = 0; v < 255; v++) 
                d.LOG_TABLE[d.EXP_TABLE[v]] = v;
            function m(e, A) {
                if (void 0 == e.length) 
                    throw new Error(e.length + "/" + A);
                for (var o = 0; o < e.length && 0 == e[o];) 
                    o++;
                this.num = new Array(e.length - o + A);
                for (var t = 0; t < e.length - o; t++) 
                    this.num[t] = e[t + o]
            }
            function h(e, A) {
                this.totalCount = e,
                this.dataCount = A
            }
            function B() {
                this.buffer = [],
                this.length = 0
            }
            m.prototype = {
                get: function (e) {
                    return this.num[e]
                },
                getLength: function () {
                    return this.num.length
                },
                multiply: function (e) {
                    for (
                        var A = new Array(this.getLength() + e.getLength() - 1),
                        o = 0;
                        o < this.getLength();
                        o++
                    ) 
                        for (var t = 0; t < e.getLength(); t++) 
                            A[o + t] ^= d.gexp(d.glog(this.get(o)) + d.glog(e.get(t)));
                return new m(A, 0)
                },
                mod: function (e) {
                    if (this.getLength() - e.getLength() < 0) 
                        return this;
                    for (
                        var A = d.glog(this.get(0)) - d.glog(e.get(0)),
                        o = new Array(this.getLength()),
                        t = 0;
                        t < this.getLength();
                        t++
                    ) 
                        o[t] = this.get(t);
                    for (var i = 0; i < e.getLength(); i++) 
                        o[i] ^= d.gexp(d.glog(e.get(i)) + A);
                    return new m(o, 0).mod(e)
                }
            },
            h.RS_BLOCK_TABLE = [
                [
                    1, 26, 19
                ],
                [
                    1, 26, 16
                ],
                [
                    1, 26, 13
                ],
                [
                    1, 26, 9
                ],
                [
                    1, 44, 34
                ],
                [
                    1, 44, 28
                ],
                [
                    1, 44, 22
                ],
                [
                    1, 44, 16
                ],
                [
                    1, 70, 55
                ],
                [
                    1, 70, 44
                ],
                [
                    2, 35, 17
                ],
                [
                    2, 35, 13
                ],
                [
                    1, 100, 80
                ],
                [
                    2, 50, 32
                ],
                [
                    2, 50, 24
                ],
                [
                    4, 25, 9
                ],
                [
                    1, 134, 108
                ],
                [
                    2, 67, 43
                ],
                [
                    2,
                    33,
                    15,
                    2,
                    34,
                    16
                ],
                [
                    2,
                    33,
                    11,
                    2,
                    34,
                    12
                ],
                [
                    2, 86, 68
                ],
                [
                    4, 43, 27
                ],
                [
                    4, 43, 19
                ],
                [
                    4, 43, 15
                ],
                [
                    2, 98, 78
                ],
                [
                    4, 49, 31
                ],
                [
                    2,
                    32,
                    14,
                    4,
                    33,
                    15
                ],
                [
                    4,
                    39,
                    13,
                    1,
                    40,
                    14
                ],
                [
                    2, 121, 97
                ],
                [
                    2,
                    60,
                    38,
                    2,
                    61,
                    39
                ],
                [
                    4,
                    40,
                    18,
                    2,
                    41,
                    19
                ],
                [
                    4,
                    40,
                    14,
                    2,
                    41,
                    15
                ],
                [
                    2, 146, 116
                ],
                [
                    3,
                    58,
                    36,
                    2,
                    59,
                    37
                ],
                [
                    4,
                    36,
                    16,
                    4,
                    37,
                    17
                ],
                [
                    4,
                    36,
                    12,
                    4,
                    37,
                    13
                ],
                [
                    2,
                    86,
                    68,
                    2,
                    87,
                    69
                ],
                [
                    4,
                    69,
                    43,
                    1,
                    70,
                    44
                ],
                [
                    6,
                    43,
                    19,
                    2,
                    44,
                    20
                ],
                [
                    6,
                    43,
                    15,
                    2,
                    44,
                    16
                ],
                [
                    4, 101, 81
                ],
                [
                    1,
                    80,
                    50,
                    4,
                    81,
                    51
                ],
                [
                    4,
                    50,
                    22,
                    4,
                    51,
                    23
                ],
                [
                    3,
                    36,
                    12,
                    8,
                    37,
                    13
                ],
                [
                    2,
                    116,
                    92,
                    2,
                    117,
                    93
                ],
                [
                    6,
                    58,
                    36,
                    2,
                    59,
                    37
                ],
                [
                    4,
                    46,
                    20,
                    6,
                    47,
                    21
                ],
                [
                    7,
                    42,
                    14,
                    4,
                    43,
                    15
                ],
                [
                    4, 133, 107
                ],
                [
                    8,
                    59,
                    37,
                    1,
                    60,
                    38
                ],
                [
                    8,
                    44,
                    20,
                    4,
                    45,
                    21
                ],
                [
                    12,
                    33,
                    11,
                    4,
                    34,
                    12
                ],
                [
                    3,
                    145,
                    115,
                    1,
                    146,
                    116
                ],
                [
                    4,
                    64,
                    40,
                    5,
                    65,
                    41
                ],
                [
                    11,
                    36,
                    16,
                    5,
                    37,
                    17
                ],
                [
                    11,
                    36,
                    12,
                    5,
                    37,
                    13
                ],
                [
                    5,
                    109,
                    87,
                    1,
                    110,
                    88
                ],
                [
                    5,
                    65,
                    41,
                    5,
                    66,
                    42
                ],
                [
                    5,
                    54,
                    24,
                    7,
                    55,
                    25
                ],
                [
                    11, 36, 12
                ],
                [
                    5,
                    122,
                    98,
                    1,
                    123,
                    99
                ],
                [
                    7,
                    73,
                    45,
                    3,
                    74,
                    46
                ],
                [
                    15,
                    43,
                    19,
                    2,
                    44,
                    20
                ],
                [
                    3,
                    45,
                    15,
                    13,
                    46,
                    16
                ],
                [
                    1,
                    135,
                    107,
                    5,
                    136,
                    108
                ],
                [
                    10,
                    74,
                    46,
                    1,
                    75,
                    47
                ],
                [
                    1,
                    50,
                    22,
                    15,
                    51,
                    23
                ],
                [
                    2,
                    42,
                    14,
                    17,
                    43,
                    15
                ],
                [
                    5,
                    150,
                    120,
                    1,
                    151,
                    121
                ],
                [
                    9,
                    69,
                    43,
                    4,
                    70,
                    44
                ],
                [
                    17,
                    50,
                    22,
                    1,
                    51,
                    23
                ],
                [
                    2,
                    42,
                    14,
                    19,
                    43,
                    15
                ],
                [
                    3,
                    141,
                    113,
                    4,
                    142,
                    114
                ],
                [
                    3,
                    70,
                    44,
                    11,
                    71,
                    45
                ],
                [
                    17,
                    47,
                    21,
                    4,
                    48,
                    22
                ],
                [
                    9,
                    39,
                    13,
                    16,
                    40,
                    14
                ],
                [
                    3,
                    135,
                    107,
                    5,
                    136,
                    108
                ],
                [
                    3,
                    67,
                    41,
                    13,
                    68,
                    42
                ],
                [
                    15,
                    54,
                    24,
                    5,
                    55,
                    25
                ],
                [
                    15,
                    43,
                    15,
                    10,
                    44,
                    16
                ],
                [
                    4,
                    144,
                    116,
                    4,
                    145,
                    117
                ],
                [
                    17, 68, 42
                ],
                [
                    17,
                    50,
                    22,
                    6,
                    51,
                    23
                ],
                [
                    19,
                    46,
                    16,
                    6,
                    47,
                    17
                ],
                [
                    2,
                    139,
                    111,
                    7,
                    140,
                    112
                ],
                [
                    17, 74, 46
                ],
                [
                    7,
                    54,
                    24,
                    16,
                    55,
                    25
                ],
                [
                    34, 37, 13
                ],
                [
                    4,
                    151,
                    121,
                    5,
                    152,
                    122
                ],
                [
                    4,
                    75,
                    47,
                    14,
                    76,
                    48
                ],
                [
                    11,
                    54,
                    24,
                    14,
                    55,
                    25
                ],
                [
                    16,
                    45,
                    15,
                    14,
                    46,
                    16
                ],
                [
                    6,
                    147,
                    117,
                    4,
                    148,
                    118
                ],
                [
                    6,
                    73,
                    45,
                    14,
                    74,
                    46
                ],
                [
                    11,
                    54,
                    24,
                    16,
                    55,
                    25
                ],
                [
                    30,
                    46,
                    16,
                    2,
                    47,
                    17
                ],
                [
                    8,
                    132,
                    106,
                    4,
                    133,
                    107
                ],
                [
                    8,
                    75,
                    47,
                    13,
                    76,
                    48
                ],
                [
                    7,
                    54,
                    24,
                    22,
                    55,
                    25
                ],
                [
                    22,
                    45,
                    15,
                    13,
                    46,
                    16
                ],
                [
                    10,
                    142,
                    114,
                    2,
                    143,
                    115
                ],
                [
                    19,
                    74,
                    46,
                    4,
                    75,
                    47
                ],
                [
                    28,
                    50,
                    22,
                    6,
                    51,
                    23
                ],
                [
                    33,
                    46,
                    16,
                    4,
                    47,
                    17
                ],
                [
                    8,
                    152,
                    122,
                    4,
                    153,
                    123
                ],
                [
                    22,
                    73,
                    45,
                    3,
                    74,
                    46
                ],
                [
                    8,
                    53,
                    23,
                    26,
                    54,
                    24
                ],
                [
                    12,
                    45,
                    15,
                    28,
                    46,
                    16
                ],
                [
                    3,
                    147,
                    117,
                    10,
                    148,
                    118
                ],
                [
                    3,
                    73,
                    45,
                    23,
                    74,
                    46
                ],
                [
                    4,
                    54,
                    24,
                    31,
                    55,
                    25
                ],
                [
                    11,
                    45,
                    15,
                    31,
                    46,
                    16
                ],
                [
                    7,
                    146,
                    116,
                    7,
                    147,
                    117
                ],
                [
                    21,
                    73,
                    45,
                    7,
                    74,
                    46
                ],
                [
                    1,
                    53,
                    23,
                    37,
                    54,
                    24
                ],
                [
                    19,
                    45,
                    15,
                    26,
                    46,
                    16
                ],
                [
                    5,
                    145,
                    115,
                    10,
                    146,
                    116
                ],
                [
                    19,
                    75,
                    47,
                    10,
                    76,
                    48
                ],
                [
                    15,
                    54,
                    24,
                    25,
                    55,
                    25
                ],
                [
                    23,
                    45,
                    15,
                    25,
                    46,
                    16
                ],
                [
                    13,
                    145,
                    115,
                    3,
                    146,
                    116
                ],
                [
                    2,
                    74,
                    46,
                    29,
                    75,
                    47
                ],
                [
                    42,
                    54,
                    24,
                    1,
                    55,
                    25
                ],
                [
                    23,
                    45,
                    15,
                    28,
                    46,
                    16
                ],
                [
                    17, 145, 115
                ],
                [
                    10,
                    74,
                    46,
                    23,
                    75,
                    47
                ],
                [
                    10,
                    54,
                    24,
                    35,
                    55,
                    25
                ],
                [
                    19,
                    45,
                    15,
                    35,
                    46,
                    16
                ],
                [
                    17,
                    145,
                    115,
                    1,
                    146,
                    116
                ],
                [
                    14,
                    74,
                    46,
                    21,
                    75,
                    47
                ],
                [
                    29,
                    54,
                    24,
                    19,
                    55,
                    25
                ],
                [
                    11,
                    45,
                    15,
                    46,
                    46,
                    16
                ],
                [
                    13,
                    145,
                    115,
                    6,
                    146,
                    116
                ],
                [
                    14,
                    74,
                    46,
                    23,
                    75,
                    47
                ],
                [
                    44,
                    54,
                    24,
                    7,
                    55,
                    25
                ],
                [
                    59,
                    46,
                    16,
                    1,
                    47,
                    17
                ],
                [
                    12,
                    151,
                    121,
                    7,
                    152,
                    122
                ],
                [
                    12,
                    75,
                    47,
                    26,
                    76,
                    48
                ],
                [
                    39,
                    54,
                    24,
                    14,
                    55,
                    25
                ],
                [
                    22,
                    45,
                    15,
                    41,
                    46,
                    16
                ],
                [
                    6,
                    151,
                    121,
                    14,
                    152,
                    122
                ],
                [
                    6,
                    75,
                    47,
                    34,
                    76,
                    48
                ],
                [
                    46,
                    54,
                    24,
                    10,
                    55,
                    25
                ],
                [
                    2,
                    45,
                    15,
                    64,
                    46,
                    16
                ],
                [
                    17,
                    152,
                    122,
                    4,
                    153,
                    123
                ],
                [
                    29,
                    74,
                    46,
                    14,
                    75,
                    47
                ],
                [
                    49,
                    54,
                    24,
                    10,
                    55,
                    25
                ],
                [
                    24,
                    45,
                    15,
                    46,
                    46,
                    16
                ],
                [
                    4,
                    152,
                    122,
                    18,
                    153,
                    123
                ],
                [
                    13,
                    74,
                    46,
                    32,
                    75,
                    47
                ],
                [
                    48,
                    54,
                    24,
                    14,
                    55,
                    25
                ],
                [
                    42,
                    45,
                    15,
                    32,
                    46,
                    16
                ],
                [
                    20,
                    147,
                    117,
                    4,
                    148,
                    118
                ],
                [
                    40,
                    75,
                    47,
                    7,
                    76,
                    48
                ],
                [
                    43,
                    54,
                    24,
                    22,
                    55,
                    25
                ],
                [
                    10,
                    45,
                    15,
                    67,
                    46,
                    16
                ],
                [
                    19,
                    148,
                    118,
                    6,
                    149,
                    119
                ],
                [
                    18,
                    75,
                    47,
                    31,
                    76,
                    48
                ],
                [
                    34,
                    54,
                    24,
                    34,
                    55,
                    25
                ],
                [
                    20,
                    45,
                    15,
                    61,
                    46,
                    16
                ]
            ],
            h.getRSBlocks = function (e, A) {
                var o = h.getRsBlockTable(e, A);
                if (void 0 == o) 
                    throw new Error(
                        "bad rs block @ typeNumber:" + e + "/errorCorrectLevel:" + A
                    );
                for (var t = o.length / 3, i = [], r = 0; r < t; r++) 
                    for (
                        var a = o[3 * r + 0],
                        K = o[3 * r + 1],
                        n = o[3 * r + 2],
                        l = 0;
                        l < a;
                        l++
                    ) 
                        i.push(new h(K, n));
            return i
            },
            h.getRsBlockTable = function (e, A) {
                switch (A) {
                    case r:
                        return h.RS_BLOCK_TABLE[4 * (e - 1) + 0];
                    case a:
                        return h.RS_BLOCK_TABLE[4 * (e - 1) + 1];
                    case K:
                        return h.RS_BLOCK_TABLE[4 * (e - 1) + 2];
                    case n:
                        return h.RS_BLOCK_TABLE[4 * (e - 1) + 3];
                    default:
                        return
                }
            },
            B.prototype = {
                get: function (e) {
                    var A = Math.floor(e / 8);
                    return 1 == (this.buffer[A] >>> 7 - e % 8 & 1)
                },
                put: function (e, A) {
                    for (var o = 0; o < A; o++) 
                        this.putBit(1 == (e >>> A - o - 1 & 1))
                },
                getLengthInBits: function () {
                    return this.length
                },
                putBit: function (e) {
                    var A = Math.floor(this.length / 8);
                    this.buffer.length <= A && this
                        .buffer
                        .push(0),
                    e && (this.buffer[A] |= 128 >>> this.length % 8),
                    this.length++
                }
            },
            A.qrcode = t
        },
        132: function (e, A, o) {
            e.exports = o(331)
        },
        137: function (e, A, o) {},
        18: function (e, A, o) {},
        331: function (e, A, o) {
            "use strict";
            o.r(A);
            var t = o(0),
                i = o.n(t),
                r = o(44),
                a = o.n(r),
                K = (o(137), o(36), o(18), o(17));
            function n() {
                K
                    .a
                    .event({category: "URL", action: "Upload"})
            }
            function l() {
                K
                    .a
                    .event({category: "URL", action: "Input"})
            }
            function f(e) {
                K
                    .a
                    .event({category: "ScrollContainer", action: "Scroll", label: e})
            }
            var c = function (e) {
                    return i
                        .a
                        .createElement("a", Object.assign({
                            onClick: function (A) {
                                return o = e.href,
                                void K
                                    .a
                                    .event({category: "Link", action: "Click", label: o});
                                var o
                            }
                        }, e), e.children)
                },
                F = (new Date).getFullYear(),
                U = function () {
                    return i
                        .a
                        .createElement("div", {
                            className: "Qr-titled"
                        }, i.a.createElement(
                            "div",
                            {
                                className: "Qr-Centered Qr-footer note-font"
                            },
                            i.a.createElement(
                                "div",
                                {
                                    className: "Qr-footer-part"
                                },
                                i.a.createElement("strong", null, "\u4f5c\u8005"),
                                "\u2003",
                                i.a.createElement(c, {
                                    href: "https://blog.ciaochaos.com/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "ciaochaos"),
                                "\u2003",
                                i.a.createElement(c, {
                                    href: "https://github.com/CPunisher/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "CPunisher"),
                                i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002"),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://www.yuque.com/qrbtf/docs/privacy",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u9690\u79c1\u653f\u7b56"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://www.yuque.com/qrbtf/docs/terms",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u4f7f\u7528\u6761\u6b3e"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://www.yuque.com/qrbtf/docs/contact",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u8054\u7cfb\u6211\u4eec"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement(
                                    "span",
                                    null,
                                    i.a.createElement(c, {
                                        href: "https://www.yuque.com/qrbtf/docs/api",
                                        rel: "noopener noreferrer",
                                        target: "_blank"
                                    }, "API \u63a5\u53e3 ", i.a.createElement("sup", null, "\u6d4b\u8bd5")),
                                    i.a.createElement("span", {
                                        className: "gray"
                                    }, "\u2002\u4e28\u2002")
                                ),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://www.yuque.com/qrbtf/docs/coop",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u5408\u4f5c\u54a8\u8be2"))
                            ),
                            i.a.createElement(
                                "div",
                                {
                                    className: "Qr-footer-part"
                                },
                                i.a.createElement("strong", null, "\u66f4\u591a\u4ea7\u54c1"),
                                "\u2003",
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mdnice.com",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "mdnice \u516c\u4f17\u53f7\u6392\u7248"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://urlify.cn/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "Urlify \u77ed\u94fe\u63a5"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://imgkr.com/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "imgkr \u56fe\u58f3\u56fe\u5e8a"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://blog.ciaochaos.com/mpmath/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "mpMath \u516c\u4f17\u53f7\u516c\u5f0f\u63d2\u4ef6"))
                            ),
                            i.a.createElement(
                                "div",
                                {
                                    className: "Qr-footer-part"
                                },
                                i.a.createElement("strong", null, "\u81f4\u8c22"),
                                "\u2003",
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://github.com/davidshimjs/qrcodejs",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "Sangmin, Shim"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://github.com/cozmo/jsQR",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "Cosmo Wolfe"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/61kI-2TmxNza1U9tw-MNPA",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u8463\u65af\u4f73"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/qCTnkPWEX6AfL2CJua_AqQ",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u91ce\u751f\u7b26\u53f7"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://github.com/kongxiangyan",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "Cigaret"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/NdVsF_FJxqSZOyGionoo1Q",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "JaBi \u624e\u6bd4"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "http://nav.6soluo.com/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u4e00\u4e3a"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://reactjsexample.com/a-simple-web-app-to-beautify-your-qr-code/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "React.js Example"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/J-odC4GPd9N2V7QRhEJ23g",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u6728\u5b50\u6dc7"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://github.com/gexin1/beautify-qrcode",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "River"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/yy7knjp9MJ3LEuMF42gtqw",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u7f16\u7a0b\u5982\u753b"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/YWStNIYUZ7UmcHGhIwE6eg",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "JZ Creative"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/5r3PNDSaQb3sOXtDQt3Jnw",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u5de5\u5177\u72c2\u4eba"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://sspai.com/post/61118",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u5c11\u6570\u6d3e"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement(
                                    "span",
                                    null,
                                    i.a.createElement(
                                        c,
                                        {
                                            href: "https://www.creative-tim.com/blog/web-development/best-reactjs-project-example" +
                                                    "s/",
                                            rel: "noopener noreferrer",
                                            target: "_blank"
                                        },
                                        "Creative Tim"
                                    ),
                                    i.a.createElement("span", {
                                        className: "gray"
                                    }, "\u2002\u4e28\u2002")
                                ),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/bg69nfB0MK8_bd4yEErxIA",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "PPT \u8fdb\u5316\u8bba"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/AoxOxZcBmo_1FK71CHviGQ",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u65c1\u95e8\u5de6\u9053"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://www.iplaysoft.com/qrbtf.html",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u5f02\u6b21\u5143"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://mp.weixin.qq.com/s/zSzH8WilPsACmF1K2cWPVA",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "Topbook"), i.a.createElement("span", {
                                    className: "gray"
                                }, "\u2002\u4e28\u2002")),
                                i.a.createElement("span", null, i.a.createElement(c, {
                                    href: "https://www.v2ex.com/t/675982",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "V2EX"))
                            ),
                            i.a.createElement(
                                "div",
                                {
                                    className: "Gray"
                                },
                                "Copyright \xa9 ",
                                F,
                                " QRBTF. \u4fdd\u7559\u6240\u6709\u6743\u5229\u3002",
                                i.a.createElement("br", null),
                                i.a.createElement(c, {
                                    href: "https://beian.miit.gov.cn/",
                                    rel: "noopener noreferrer",
                                    target: "_blank"
                                }, "\u6d59 ICP \u5907 19005869 \u53f7")
                            )
                        ))
                },
                s = o(8),
                g = "GENERATE_QR_INFO",
                u = "CHANGE_STYLE",
                R = "CHANGE_CORRECT_LEVEL",
                d = "CREATE_PARAM",
                C = "CHANGE_PARAM",
                p = "LOAD_DOWNLOAD_DATA",
                v = "CHANGE_TITLE",
                m = "CHANGE_ICON",
                h = function (e) {
                    return {type: g, text: e}
                },
                B = function (e, A, o) {
                    var t;
                    return t = o,
                    K
                        .a
                        .event({category: "Style", action: "Switch", label: t}), {
                        type: u,
                        rendererIndex: e,
                        rendererType: A,
                        value: o
                    }
                },
                b = function (e, A, o) {
                    return {type: C, rendererIndex: e, paramIndex: A, value: o}
                },
                y = function (e) {
                    return {type: p, data: e}
                },
                k = function (e) {
                    return {type: m, icon: e}
                },
                P = ["image/jpeg", "image/pjpeg", "image/png"];
            function E(e) {
                return P.includes(e.type)
            }
            function w(e, A) {
                var o = document.createElement("canvas"),
                    t = o.getContext("2d"),
                    i = document.createElement("img");
                return i.setAttribute("src", URL.createObjectURL(e)),
                new Promise((function (r) {
                    i.onload = function () {
                        var a,
                            K;
                        i.width < i.height
                            ? K = (a = i.width) / A
                            : a = (K = i.height) * A,
                        console.log(a + " " + K),
                        o.setAttribute("width", a),
                        o.setAttribute("height", K),
                        t.fillStyle = "white",
                        t.fillRect(0, 0, a, K),
                        t.drawImage(i, (i.width - a) / 2, (i.height - K) / 2, a, K, 0, 0, a, K),
                        r(o.toDataURL(e.type, .9))
                    }
                }))
            }
            var Q = o(122),
                S = o(123),
                x = o.n(S),
                H = 1,
                D = 2,
                N = 3,
                q = 4,
                j = 5,
                X = 0,
                V = 0;
            function L(e, A) {
                return e + (X = (9301 * X + 49297) % 233280) / 233280 * (A - e)
            }
            function J() {
                return (V += 1).toString()
            }
            function T(e, A) {
                for (var o = 0; o < e.length; o++) 
                    e[o] || (e[o] = A);
                return e
            }
            function I(e) {
                return document
                    .getElementsByClassName("Qr-item-svg")[e]
                    .outerHTML
            }
            function W(e, A) {
                return "string" != typeof e || (
                    e.length <= 0 && (e = A),
                    isNaN(e) || (e = parseInt(e))
                ),
                e
            }
            function O(e, A) {
                for (var o in A) 
                    e[o] = A[o];
                return e
            }
            function G() {
                document
                    .documentElement
                    .style
                    .setProperty("--scrollbar-width", function () {
                        var e = document.createElement("div");
                        e.style.visibility = "hidden",
                        e.style.overflow = "scroll",
                        e.style.msOverflowStyle = "scrollbar",
                        document
                            .body
                            .appendChild(e);
                        var A = document.createElement("div");
                        e.appendChild(A);
                        var o = e.offsetWidth - A.offsetWidth;
                        return e
                            .parentNode
                            .removeChild(e),
                        o
                    }() + "px")
            }
            var z = 0,
                M = 1,
                Z = 2,
                Y = 3,
                _ = 4,
                $ = 5,
                ee = 6,
                Ae = 7;
            function oe(e) {
                if (!e.text || e.text.length <= 0) 
                    return null;
                e = O({
                    render: "canvas",
                    width: 256,
                    height: 256,
                    typeNumber: -1,
                    correctLevel: 1,
                    background: "#ffffff",
                    foreground: "#000000"
                }, e);
                var A = new Q.qrcode(e.typeNumber, e.correctLevel);
                return A.addData(e.text),
                A.make(),
                A
            }
            function te(e) {
                for (var A = e.getModuleCount(), o = e.getPositionTable(), t = [
                    [
                        3, 3
                    ],
                    [
                        3, A - 4
                    ],
                    [
                        A - 4,
                        3
                    ]
                ], i = new Array(A), r = 0; r < A; r++) 
                    i[r] = new Array(A);
                for (var a = 8; a < A - 7; a++) 
                    i[a][6] = i[6][a] = $;
                for (var K = 0; K < o.length; K++) {
                    i[o[K][0]][o[K][1]] = Y;
                    for (var n = -2; n <= 2; n++) 
                        for (var l = -2; l <= 2; l++) 
                            0 === n && 0 === l || (i[o[K][0] + n][o[K][1] + l] = _)
                }
                for (var f = 0; f < t.length; f++) {
                    i[t[f][0]][t[f][1]] = M;
                    for (var c = -4; c <= 4; c++) 
                        for (var F = -4; F <= 4; F++) 
                            t[f][0] + c >= 0 && t[f][0] + c < A && t[f][1] + F >= 0 && t[f][1] + F < A && (
                                0 === c && 0 === F || (i[t[f][0] + c][t[f][1] + F] = Z)
                            )
                }
                for (var U = 0; U <= 8; U++) 
                    6 !== U && (i[U][8] = i[8][U] = ee),
                    U < 7 && (i[A - U - 1][8] = ee),
                    U < 8 && (i[8][A - U - 1] = ee);
                for (var s = A - 11; s <= A - 9; s++) 
                    for (var g = 0; g <= 5; g++) 
                        i[s][g] = i[g][s] = Ae;
            for (var u = 0; u < A; u++) 
                    for (var R = 0; R < A; R++) 
                        i[u][R] || (i[u][R] = z);
            return i
            }
            var ie = Object(s.b)()((function (e) {
                var A = e.dispatch,
                    o = Object(t.useRef)();
                return i
                    .a
                    .createElement(i.a.Fragment, null, i.a.createElement("div", {
                        className: "Qr-input-upload-div"
                    }, i.a.createElement("div", {
                        className: "Qr-input-upload"
                    }, i.a.createElement("label", {
                        htmlFor: "image_scanner",
                        className: "Qr-upload",
                        style: {
                            textAlign: "center"
                        }
                    }, i.a.createElement("svg", {
                        className: "Qr-upload-svg",
                        version: "1.1",
                        id: "\u56fe\u5c42_1",
                        zoomAndPan: "disable",
                        xmlns: "http://www.w3.org/2000/svg",
                        x: "0px",
                        y: "0px",
                        viewBox: "0 -5 30 40",
                        preserveAspectRatio: "none"
                    }, i.a.createElement("g", {
                        className: "st0"
                    }, i.a.createElement("line", {
                        x1: "15",
                        y1: "0",
                        x2: "15",
                        y2: "30"
                    }), i.a.createElement("line", {
                        x1: "25",
                        y1: "10",
                        x2: "15",
                        y2: "0"
                    }), i.a.createElement("line", {
                        x1: "5",
                        y1: "10",
                        x2: "15",
                        y2: "0"
                    })))), i.a.createElement("input", {
                        type: "file",
                        id: "image_scanner",
                        hidden: !0,
                        accept: ".jpg, .jpeg, .png",
                        onClick: function (e) {
                            return e.target.value = null
                        },
                        onChange: function (e) {
                            if (e.target.files.length > 0) {
                                var t = e
                                    .target
                                    .files[0];
                                E(t) && (n(), function (e) {
                                    var A = document.createElement("canvas"),
                                        o = A.getContext("2d"),
                                        t = document.createElement("img");
                                    return t.setAttribute("src", URL.createObjectURL(e)),
                                    new Promise((function (e) {
                                        t.onload = function () {
                                            var i = Math.min(t.width, t.height) / 400;
                                            A.width = t.width / i,
                                            A.height = t.height / i,
                                            o.drawImage(t, 0, 0, A.width, A.height);
                                            var r = x()(o.getImageData(0, 0, A.width, A.height).data, A.width, A.height);
                                            e(r)
                                        }
                                    }))
                                }(t).then((function (e) {
                                    e && (o.current.value = e.data, console.log(e.data), A(h(e.data)))
                                })).catch(console.err))
                            }
                        }
                    }), i.a.createElement("input", {
                        className: "Qr-input big-input",
                        placeholder: "https://hola.com",
                        ref: o,
                        onBlur: function (e) {
                            l(),
                            A(h(e.target.value))
                        },
                        onKeyPress: function (e) {
                            "Enter" === e.key && (A(h(e.target.value)), l(), e.target.blur())
                        }
                    })), i.a.createElement("div", {
                        className: "Qr-input-hint"
                    }, "Sube un código QR simple o introduce una URL")))
            }));
            var re = function (e) {
                    return t.createElement(
                        "svg",
                        Object.assign({
                            viewBox: "71 71 2521 686"
                        }, e),
                        t.createElement(
                            "g",
                            {
                                fill: "none",
                                strokeWidth: 18
                            },
                            t.createElement("g", {
                                strokeDasharray: "600,600",
                                strokeDashoffset: 600
                            }, t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-width",
                                begin: "2.2s",
                                values: "18; 72",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-dashoffset",
                                begin: "1.7s",
                                values: "-600; 0",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("path", {
                                stroke: "currentColor",
                                strokeLinejoin: "round",
                                d: "M2407.38 576V417.92c0-2.078 0-4.157-.004-6.235l-.005-2.002a627.587 627.587 0 0" +
                                        "0-.024-3.732 371.187 371.187 0 00-.05-3.61c-.022-1.155-.051-2.31-.09-3.465a180" +
                                        ".675 180.675 0 00-.137-3.307 136.027 136.027 0 00-.196-3.14c-.074-.99-.16-1.98" +
                                        "-.26-2.968a88.781 88.781 0 00-.331-2.812 75.628 75.628 0 00-.404-2.658 66.999 " +
                                        "66.999 0 00-.48-2.521 62.67 62.67 0 00-1.215-4.814 64.154 64.154 0 00-1.19-3.6" +
                                        "2 74.396 74.396 0 00-5.005-10.995 74.163 74.163 0 00-93.513-32.244 74.247 74.2" +
                                        "47 0 00-16.95 9.952 74.224 74.224 0 00-16.53 18.063 74.082 74.082 0 00-7.98 16" +
                                        ".447 61.644 61.644 0 00-1.977 7.21 67.403 67.403 0 00-.479 2.522c-.15.883-.285" +
                                        " 1.77-.404 2.658a88.487 88.487 0 00-.33 2.812c-.102.988-.188 1.978-.261 2.968a" +
                                        "136.027 136.027 0 00-.196 3.14 179.787 179.787 0 00-.138 3.307c-.038 1.155-.06" +
                                        "7 2.31-.089 3.466-.023 1.203-.039 2.406-.05 3.609a611.07 611.07 0 00-.03 5.734" +
                                        "c-.003 2.078-.003 4.157-.003 6.235V576"
                            })),
                            t.createElement("g", {
                                strokeDasharray: "288,288",
                                strokeDashoffset: 288
                            }, t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-width",
                                begin: "2.2s",
                                values: "18; 72",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-dashoffset",
                                begin: "1.7s",
                                values: "-288; 0",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("path", {
                                stroke: "currentColor",
                                strokeLinejoin: "round",
                                d: "M2259.06 576V288"
                            })),
                            t.createElement("g", {
                                strokeDasharray: "600,600",
                                strokeDashoffset: 600
                            }, t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-width",
                                begin: "2.2s",
                                values: "18; 72",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-dashoffset",
                                begin: "1.7s",
                                values: "-600; 0",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("path", {
                                stroke: "currentColor",
                                strokeLinejoin: "round",
                                d: "M2555.7 576V417.92c0-2.078 0-4.157-.004-6.235a890.055 890.055 0 00-.029-5.734 " +
                                        "380.954 380.954 0 00-.05-3.61c-.022-1.155-.051-2.31-.09-3.465a180.675 180.675 " +
                                        "0 00-.137-3.307 139.471 139.471 0 00-.196-3.14c-.074-.99-.16-1.98-.26-2.968a88" +
                                        ".781 88.781 0 00-.331-2.812 75.628 75.628 0 00-.404-2.658 66.801 66.801 0 00-." +
                                        "48-2.521 62.118 62.118 0 00-1.215-4.814 63.784 63.784 0 00-1.19-3.62 74.396 74" +
                                        ".396 0 00-5.005-10.995 74.216 74.216 0 00-11.75-15.734 74.201 74.201 0 00-24.2" +
                                        "76-16.51 74.214 74.214 0 00-18.933-5.145 74.197 74.197 0 00-29.258 1.943 74.2 " +
                                        "74.2 0 00-26.246 13.154 74.19 74.19 0 00-21.336 26.68 74.109 74.109 0 00-3.173" +
                                        " 7.83 61.644 61.644 0 00-1.977 7.21 67.61 67.61 0 00-.48 2.522c-.15.883-.285 1" +
                                        ".77-.404 2.658a89.37 89.37 0 00-.33 2.812c-.102.988-.187 1.978-.261 2.968a136." +
                                        "027 136.027 0 00-.196 3.14 182.48 182.48 0 00-.138 3.307c-.038 1.155-.067 2.31" +
                                        "-.09 3.466a387.756 387.756 0 00-.05 3.609 654.104 654.104 0 00-.028 5.734c-.00" +
                                        "4 2.078-.004 4.157-.004 6.235V576"
                            }))
                        ),
                        t.createElement("g", {
                            fill: "none",
                            strokeDasharray: "679,679",
                            strokeDashoffset: 679,
                            strokeWidth: 18
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "2.05s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "1.55s",
                            values: "679; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M2119.04 432a107.978 107.978 0 00-7.583-39.753 107.986 107.986 0 00-60.663-60." +
                                    "664 107.984 107.984 0 00-59.406-5.78 107.988 107.988 0 00-56.715 29.828 107.99" +
                                    "1 107.991 0 00-29.83 96.02 107.988 107.988 0 0029.827 56.715A107.99 107.99 0 0" +
                                    "02011.04 540a107.985 107.985 0 0039.753-7.583 107.991 107.991 0 0066.443-80.76" +
                                    "5A107.995 107.995 0 002119.04 432z"
                        })),
                        t.createElement("g", {
                            fill: "none",
                            strokeDasharray: "475,475",
                            strokeDashoffset: 475,
                            strokeWidth: 18
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.9s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "1.4s",
                            values: "475; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M1810.827 342.464a107.986 107.986 0 00-54.74-18.316 108 108 0 1054.74 197.388"
                        })),
                        t.createElement("g", {
                            opacity: "0"
                        }, t.createElement("animateTransform", {
                            attributeName: "transform",
                            type: "translate",
                            begin: "1.75s",
                            values: "1507.655 530.172",
                            dur: "1s",
                            fill: "freeze",
                            additive: "sum"
                        }), t.createElement("animateTransform", {
                            attributeName: "transform",
                            type: "scale",
                            begin: "1.75s",
                            values: "0; 1",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1",
                            additive: "sum"
                        }), t.createElement("animateTransform", {
                            attributeName: "transform",
                            type: "translate",
                            begin: "1.75s",
                            values: "-1507.655 -530.172",
                            dur: "1s",
                            fill: "freeze",
                            additive: "sum"
                        }), t.createElement("animateTransform", {
                            attributeName: "transform",
                            type: "scale",
                            values: 0,
                            dur: "1.75s",
                            additive: "sum"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "opacity",
                            begin: "0.1s",
                            values: "0; 1",
                            dur: "0.1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            fill: "currentColor",
                            d: "M1553.483 530.172a45.826 45.826 0 00-62.697-42.61 45.823 45.823 0 00-28.959 42" +
                                    ".61A45.823 45.823 0 001507.655 576a45.823 45.823 0 0045.828-45.828z"
                        })),
                        t.createElement("g", {
                            fill: "none",
                            strokeWidth: 18
                        }, t.createElement("g", {
                            strokeDasharray: "235,235",
                            strokeDashoffset: 235
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.6s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "1.1s",
                            values: "235; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M1230.626 324h230.4"
                        })), t.createElement("g", {
                            strokeDasharray: "560,560",
                            strokeDashoffset: 560
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.6s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "1.1s",
                            values: "560; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M1460.146 121.75a72.053 72.053 0 00-24.33-11.466 72.023 72.023 0 00-40.059 1.1" +
                                    "81 72.055 72.055 0 00-23.653 12.915 72.072 72.072 0 00-9.584 9.52 72.038 72.03" +
                                    "8 0 00-12.721 22.514 67.392 67.392 0 00-1.323 4.27 66.701 66.701 0 00-1.14 4.8" +
                                    "88c-.3 1.544-.55 3.097-.757 4.655a97.901 97.901 0 00-.53 5.036c-.146 1.822-.24" +
                                    "9 3.649-.321 5.476a206.353 206.353 0 00-.143 5.928 371.593 371.593 0 00-.009 6" +
                                    ".353c.007 1.164.018 2.327.03 3.491.02 1.76.044 3.52.067 5.28.027 2.018.054 4.0" +
                                    "36.076 6.053a1246.942 1246.942 0 01.077 16.156v352"
                        }))),
                        t.createElement("g", {
                            fill: "none",
                            strokeWidth: 18
                        }, t.createElement("g", {
                            strokeDasharray: "235,235",
                            strokeDashoffset: 235
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.45s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "0.95s",
                            values: "235; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M959.222 324h230.4"
                        })), t.createElement("g", {
                            strokeDasharray: "430,430",
                            strokeDashoffset: 430
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.45s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "0.95s",
                            values: "430; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M1074.422 208.8v230.4a4582.118 4582.118 0 01-.008 8.728l-.01 4.62-.001 1.847c-" +
                                    ".001 1.642 0 3.284.01 4.925.01 1.569.026 3.137.056 4.706.028 1.475.067 2.95.12" +
                                    "5 4.426.041 1.048.092 2.096.155 3.143.04.667.084 1.333.135 2a99.8 99.8 0 00.35" +
                                    "6 3.77c.133 1.17.29 2.336.476 3.497.175 1.096.376 2.188.605 3.273a61.087 61.08" +
                                    "7 0 002.073 7.448 72.097 72.097 0 008.524 16.954 72.007 72.007 0 0039.151 28.5" +
                                    "26 72.023 72.023 0 0032.596 1.888 72.026 72.026 0 0030.077-12.702"
                        }))),
                        t.createElement("g", {
                            fill: "none",
                            strokeWidth: 18
                        }, t.createElement("g", {
                            strokeDasharray: "504,504",
                            strokeDashoffset: 504
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.3s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "0.8s",
                            values: "504; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M679.557 72v504"
                        })), t.createElement("g", {
                            strokeDasharray: "679,679",
                            strokeDashoffset: 679
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.3s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "0.8s",
                            values: "679; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M679.557 432a107.986 107.986 0 007.583 39.753 107.99 107.99 0 0060.662 60.664 " +
                                    "107.988 107.988 0 0079.509 0 107.99 107.99 0 0060.663-60.662 107.996 107.996 0" +
                                    " 00-24.048-116.121 107.991 107.991 0 00-96.02-29.831 107.985 107.985 0 00-56.7" +
                                    "15 29.828A107.991 107.991 0 00679.557 432z"
                        }))),
                        t.createElement("g", {
                            fill: "none",
                            strokeWidth: 18
                        }, t.createElement("g", {
                            strokeDasharray: "288,288",
                            strokeDashoffset: 288
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.15s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "0.65s",
                            values: "-288; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M468.049 576V288"
                        })), t.createElement("g", {
                            strokeDasharray: "340,340",
                            strokeDashoffset: 340
                        }, t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-width",
                            begin: "1.15s",
                            values: "18; 72",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("animate", {
                            attributeType: "CSS",
                            attributeName: "stroke-dashoffset",
                            begin: "0.65s",
                            values: "-340; 0",
                            dur: "1s",
                            fill: "freeze",
                            calcMode: "spline",
                            keySplines: "0.8 0 0.2 1"
                        }), t.createElement("path", {
                            stroke: "currentColor",
                            strokeLinejoin: "round",
                            d: "M582.37 337.75a72.032 72.032 0 00-29.386-12.578 72.031 72.031 0 00-24.08-.304 " +
                                    "72.068 72.068 0 00-15.476 4.235 72.02 72.02 0 00-26.353 18.136 72.002 72.002 0" +
                                    " 00-15.127 25.392 59.246 59.246 0 00-2.174 8.153c-.181.934-.341 1.873-.483 2.8" +
                                    "15-.089.59-.17 1.183-.246 1.776a91.27 91.27 0 00-.34 3.122c-.102 1.111-.187 2." +
                                    "224-.257 3.337a153.872 153.872 0 00-.18 3.554 198.122 198.122 0 00-.116 3.762c" +
                                    "-.03 1.317-.05 2.634-.065 3.951-.014 1.37-.023 2.741-.028 4.112l-.007 2.515c-." +
                                    "003 2.09-.003 4.181-.003 6.272v160"
                        }))),
                        t.createElement(
                            "g",
                            {
                                fill: "none",
                                strokeWidth: 18
                            },
                            t.createElement("g", {
                                strokeDasharray: "679,679",
                                strokeDashoffset: 679
                            }, t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-width",
                                begin: "1s",
                                values: "18; 72",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-dashoffset",
                                begin: "0.5s",
                                values: "679; 0",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("path", {
                                stroke: "currentColor",
                                strokeLinejoin: "round",
                                d: "M324 432a107.986 107.986 0 00-7.583-39.753 107.99 107.99 0 00-60.662-60.664 10" +
                                        "7.988 107.988 0 00-79.508 0 107.99 107.99 0 00-60.664 60.662 107.988 107.988 0" +
                                        " 000 79.508 107.99 107.99 0 0060.662 60.664 107.988 107.988 0 0079.508 0 107.9" +
                                        "9 107.99 0 0060.664-60.662A107.988 107.988 0 00324 432z"
                            })),
                            t.createElement("g", {
                                strokeDasharray: "468,468",
                                strokeDashoffset: 468
                            }, t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-width",
                                begin: "1s",
                                values: "18; 72",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("animate", {
                                attributeType: "CSS",
                                attributeName: "stroke-dashoffset",
                                begin: "0.5s",
                                values: "468; 0",
                                dur: "1s",
                                fill: "freeze",
                                calcMode: "spline",
                                keySplines: "0.8 0 0.2 1"
                            }), t.createElement("path", {
                                stroke: "currentColor",
                                strokeLinejoin: "round",
                                d: "M324 288v468"
                            }))
                        )
                    )
                },
                ae = function () {
                    return i
                        .a
                        .createElement(
                            "div",
                            {
                                className: "Qr-Centered"
                            },
                            i.a.createElement("div", null, i.a.createElement("h1", {
                                className: "Qr-title"
                            }, i.a.createElement(re, {className: "Qr-title-svg"}))),
                            i.a.createElement("p", {
                                className: "Qr-subtitle"
                            }, "Generador de código QR parametrizado"),
                            i.a.createElement(ie, null)
                        )
                },
                Ke = o(124),
                ne = o(65),
                le = o(125),
                fe = o.n(le),
                ce = o(126),
                Fe = function (e) {
                    var A = e.href,
                        o = e.value;
                    return i
                        .a
                        .createElement(c, {
                            href: A,
                            rel: "noopener noreferrer",
                            target: "_blank"
                        }, i.a.createElement("button", {
                            className: "dl-btn"
                        }, o))
                },
                Ue = o(34),
                se = function (e) {
                    var A = e.zoom,
                        o = Object(Ue.a)(e, ["zoom"]),
                        t = i
                            .a
                            .useRef(A.clone(o));
                    return t
                        .current
                        .on("open", (function (e) {
                            var A;
                            A = e.target.src,
                            K
                                .a
                                .event({category: "Image", action: "Zoom", label: A})
                        })),
                    i
                        .a
                        .createElement("img", Object.assign({
                            alt: "zoom",
                            ref: function (e) {
                                t
                                    .current
                                    .attach(e)
                            }
                        }, o))
                };
            function ge() {
                for (var e = navigator.userAgent, A = [
                    "Android",
                    "iPhone",
                    "SymbianOS",
                    "Windows Phone",
                    "iPad",
                    "iPod"
                ], o = !0, t = 0; t < A.length; t++) 
                    if (e.indexOf(A[t]) > 0) {
                        o = !1;
                        break
                    }
                return o
            }
            var ue,
                Re = [
                    "https://7172-qrbtf-1d845d-1255694434.tcb.qcloud.la/QrbtfGallery/gallery04.jpg",
                    "https://7172-qrbtf-1d845d-1255694434.tcb.qcloud.la/QrbtfGallery/gallery02.jpg",
                    "https://7172-qrbtf-1d845d-1255694434.tcb.qcloud.la/QrbtfGallery/gallery01.jpg",
                    "https://7172-qrbtf-1d845d-1255694434.tcb.qcloud.la/QrbtfGallery/gallery03.jpg",
                    "https://7172-qrbtf-1d845d-1255694434.tcb.qcloud.la/QrbtfGallery/gallery05.jpg",
                    "https://7172-qrbtf-1d845d-1255694434.tcb.qcloud.la/QrbtfGallery/gallery06.jpg"
                ],
                de = function (e) {
                    var A = e.contents,
                        o = Object(ce.a)(),
                        t = i
                            .a
                            .useRef(o);
                    return A.map((function (e, A) {
                        return i
                            .a
                            .createElement(fe.a, {
                                key: "lazy_gallery_" + A,
                                offsetVertical: 200
                            }, i.a.createElement(se, {
                                key: "gallery_" + A,
                                zoom: t.current,
                                background: "rgba(0, 0, 0, 0.8)",
                                className: "Qr-gallery-image",
                                src: e
                            }))
                    }))
                },
                Ce = function () {
                    return i
                        .a
                        .createElement(
                            "div",
                            {
                                className: "Qr-titled-nobg"
                            },
                            i.a.createElement("div", {
                                className: "Qr-Centered title-margin"
                            }, i.a.createElement("div", {
                                className: "Qr-s-title"
                            }, "More"), i.a.createElement("p", {
                                className: "Qr-s-subtitle"
                            }, "\u66f4\u591a"), i.a.createElement(
                                "div",
                                {
                                    className: "Qr-s-subtitle Qr-rel"
                                },
                                ge()
                                    ? i.a.createElement("div", {
                                        className: "Qr-style-hint"
                                    }, "\u62d6\u62fd\u6ed1\u52a8")
                                    : null
                            )),
                            i.a.createElement("div", {
                                className: "title-margin"
                            }, i.a.createElement(
                                "div",
                                {
                                    className: "Qr-article"
                                },
                                i.a.createElement("div", {
                                    className: "Qr-Centered"
                                }, i.a.createElement("p", null, i.a.createElement(Ke.a, {
                                    href: "https://github.com/ciaochaos/qrbtf",
                                    "data-color-scheme": "no-preference: light; light: light; dark: dark;",
                                    "data-icon": "octicon-star",
                                    "data-size": "large",
                                    "data-show-count": "true",
                                    "aria-label": "Star ciaochaos/qrbtf on GitHub"
                                }, "Star")), i.a.createElement("h2", null, "\u8bbe\u8ba1\u5206\u4eab")),
                                i.a.createElement(ne.a, {
                                    className: "Qr-s Qr-s-gallery",
                                    onStartScroll: function (e) {
                                        return f("gallery")
                                    },
                                    hideScrollbars: !1,
                                    horizontal: !0,
                                    vertical: !1
                                }, i.a.createElement("div", {
                                    className: "Qr-box"
                                }, i.a.createElement(de, {contents: Re}))),
                                i.a.createElement(
                                    "div",
                                    {
                                        className: "Qr-Centered"
                                    },
                                    i.a.createElement("h2", null, "\u6700\u65b0\u6d88\u606f"),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.9.1"),
                                        i.a.createElement("br", null),
                                        "\u65b0\u589e C3 \u6837\u5f0f\u3001\u56fe\u6807\u63d2\u5165\u3001 PNG \u4e0b" +
                                                "\u8f7d\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.6.29"),
                                        i.a.createElement("br", null),
                                        "\u65b0\u7684\u53cd\u9988\u6e20\u9053\uff01\u6211\u4eec\u5f00\u59cb\u5f81\u96c6" +
                                                "\u597d\u73a9\u7684\u4e8c\u7ef4\u7801\u8bbe\u8ba1\u5566\uff0c\u53ef\u4ee5\u662f" +
                                                "\u63a8\u9001\u5c3e\u56fe\u3001\u6d77\u62a5\u7b49\u7b49\uff0c\u5feb\u6765\u4e0a" +
                                                "\u4f20\u5427\u3002",
                                        i.a.createElement(c, {
                                            href: "https://qrbtf-com.mikecrm.com/J2wjEEq",
                                            rel: "noopener noreferrer",
                                            target: "_blank"
                                        }, "\u70b9\u51fb\u63d0\u4ea4"),
                                        "\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.6.24"),
                                        i.a.createElement("br", null),
                                        "\u65b0\u589e\u6df1\u8272\u6a21\u5f0f\uff0c\u65b0\u589e SP \u2014 3 \u6837" +
                                                "\u5f0f\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.6.22"),
                                        i.a.createElement("br", null),
                                        "\u65b0\u589e A \u2014 a1\u3001A \u2014 a2\u3001A \u2014 b1\u3001A \u2014 b2 " +
                                                "\u6837\u5f0f\uff0c\u6dfb\u52a0\u6837\u5f0f\u63cf\u8ff0\uff0c\u65b0\u589e\u684c" +
                                                "\u9762\u7aef\u6a2a\u5411\u62d6\u62fd\u6ed1\u52a8\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.6.11"),
                                        i.a.createElement("br", null),
                                        "QRBTF React \u7ec4\u4ef6\u53d1\u5e03\uff01\u5feb\u5728\u4f60\u7684\u5e94\u7528" +
                                                "\u4e2d\u5f15\u5165 react-qrbtf \u5427\u3002",
                                        i.a.createElement(c, {
                                            href: "https://github.com/cpunisher/react-qrbtf",
                                            rel: "noopener noreferrer",
                                            target: "_blank"
                                        }, "\u8bbf\u95ee\u9879\u76ee"),
                                        "\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.5.23"),
                                        i.a.createElement("br", null),
                                        "\u7f51\u7ad9\u5f00\u6e90\u5566\uff01",
                                        i.a.createElement(c, {
                                            href: "https://github.com/ciaochaos/qrbtf",
                                            rel: "noopener noreferrer",
                                            target: "_blank"
                                        }, "\u70b9\u51fb\u8bbf\u95ee"),
                                        " \u6211\u4eec\u7684 Github\u3002\u671f\u5f85\u4f60\u4e5f\u6765\u53c2\u4e0e" +
                                                "\u8bbe\u8ba1\u3001\u5f00\u53d1\uff01\u7ed9\u4e2a Star \u652f\u6301\u4e00\u4e0b" +
                                                "\u4e0d\uff1f\u67e5\u770b\u6587\u7ae0 ",
                                        i.a.createElement(
                                            c,
                                            {
                                                href: "https://mp.weixin.qq.com/s/GFEMCWQu3e2qhTuBabnHmQ",
                                                rel: "noopener noreferrer",
                                                target: "_blank"
                                            },
                                            "QRBTF \u5f00\u6e90\u5566\uff01\u6765\u5199\u4e2a\u4e8c\u7ef4\u7801\u6837\u5f0f" +
                                                    "\u5427\uff5e"
                                        ),
                                        "\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        i.a.createElement("b", null, "2020.5.22"),
                                        i.a.createElement("br", null),
                                        "\u65b0\u589e C2 \u6837\u5f0f\u3001\u4e0b\u8f7d\u8ba1\u6570\uff08\u597d\u50cf" +
                                                "\u8fd8\u4e0d\u592a\u7a33\u5b9a\uff09\u3001\u666e\u901a\u4e8c\u7ef4\u7801\u4e0a" +
                                                "\u4f20\u3001\u989c\u8272\u9009\u62e9\u3001\u80cc\u666f\u56fe\u7247\u4e0a\u4f20" +
                                                "\u3001\u8f93\u5165\u63d0\u793a\u3001\u684c\u9762\u7aef\u6a2a\u5411\u6eda\u52a8" +
                                                "\u63d0\u793a\u3002"
                                    ),
                                    i.a.createElement(
                                        "h2",
                                        null,
                                        "\u4e3a\u4ec0\u4e48\u8981\u505a\u4e00\u4e2a\u4e8c\u7ef4\u7801\u751f\u6210\u5668" +
                                                "\uff1f"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u770b\u8fd9\u91cc\uff0c",
                                        i.a.createElement(c, {
                                            href: "https://mp.weixin.qq.com/s/_Oy9I9FqPXhfwN9IUhf6_g",
                                            rel: "noopener noreferrer",
                                            target: "_blank"
                                        }, "\u5982\u4f55\u5236\u4f5c\u4e00\u4e2a\u6f02\u4eae\u7684\u4e8c\u7ef4\u7801"),
                                        " \u8fd9\u7bc7\u6587\u7ae0\u7b80\u8981\u4ecb\u7ecd\u4e86\u6211\u4eec\u7684" +
                                                "\u521d\u5fc3\u4e0e\u613f\u666f\u3002"
                                    ),
                                    i.a.createElement(
                                        "h2",
                                        null,
                                        "\u8fd9\u4e2a\u751f\u6210\u5668\u7684\u7279\u522b\u4e4b\u5904\u5728\u54ea\u91cc" +
                                                "\uff1f"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u666e\u901a\u7684\u4e8c\u7ef4\u7801\u6837\u5f0f\u5355\u4e00\uff0c\u4e0d\u80fd" +
                                                "\u4e0e\u73af\u5883\u8f83\u597d\u7684\u878d\u5408\u3002\u8fd9\u4e00\u4e2a\u751f" +
                                                "\u6210\u5668\u6709\u7740 ",
                                        i.a.createElement(
                                            "b",
                                            null,
                                            "\u4e30\u5bcc\u7684\u53c2\u6570\u5316\u6837\u5f0f\u3001\u57fa\u4e8e SVG \u7684" +
                                                    "\u4e8c\u7ef4\u7801\u751f\u6210\u80fd\u529b"
                                        ),
                                        "\uff0c\u5728\u4e3a\u6211\u4eec\u63d0\u4f9b\u7cbe\u7f8e\u6837\u5f0f\u7684\u540c" +
                                                "\u65f6\uff0c\u4e0d\u9650\u5236\u53c2\u6570\u5982\u6570\u503c\u3001\u989c\u8272" +
                                                "\u3001\u80cc\u666f\u56fe\u7247\u7684\u9009\u62e9\uff0c\u53c8\u56e0 SVG \u6709" +
                                                "\u8f83\u597d\u7684\u62d3\u5c55\u6027\uff0c\u53ef\u4ee5\u5b8c\u7f8e\u517c\u5bb9" +
                                                "\u77e2\u91cf\u5236\u56fe\u6d41\u7a0b\u3002"
                                    ),
                                    i.a.createElement("h2", null, "\u5982\u4f55\u4f7f\u7528\uff1f"),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u4ece\u8f93\u5165 URL \u5f00\u59cb\uff08\u522b\u5fd8\u4e86 http://\uff09" +
                                                "\u3002\u6ca1\u6709\u786e\u8ba4\u6846\uff0c\u6ca1\u6709\u989d\u5916\u7684\u9875" +
                                                "\u9762\uff0c\u9009\u62e9\u6837\u5f0f\u540e\u81ea\u52a8\u66f4\u65b0\uff0c\u8c03" +
                                                "\u6574\u53c2\u6570\u540e\u4e0b\u8f7d\u5373\u53ef\u3002"
                                    ),
                                    i.a.createElement("h2", null, "\u6211\u5e94\u8be5\u4e0b\u8f7d SVG \u8fd8\u662f JPG\uff1f"),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u8fd9\u4e2a\u5de5\u5177\u5f00\u53d1\u7684\u521d\u8877\u4e4b\u4e00\u5c31\u662f" +
                                                "\u4fbf\u5229\u8bbe\u8ba1\u5e08\u5c06\u5176\u7eb3\u5165\u81ea\u5df1\u7684\u5de5" +
                                                "\u4f5c\u6d41\u7a0b\u4e2d\u3002SVG \u662f\u4e00\u4e2a\u4f18\u79c0\u7684\u3001" +
                                                "\u6807\u51c6\u7684\u77e2\u91cf\u56fe\u7247\u683c\u5f0f\uff0c\u5404\u5927\u8bbe" +
                                                "\u8ba1\u8f6f\u4ef6\u5982 Adobe Illustrator\u3001Sketch \u7b49\u90fd\u5bf9 SVG " +
                                                "\u6709\u7740\u5f88\u597d\u7684\u652f\u6301\u3002\u7528\u6237\u53ef\u4ee5\u5728" +
                                                "\u4e0b\u8f7d SVG \u540e\u5bfc\u5165\u8fd9\u4e9b\u8f6f\u4ef6\u8fdb\u884c\u4e8c" +
                                                "\u6b21\u52a0\u5de5\uff0c\u5982\u5220\u9664\u4e2d\u592e\u7684\u4fe1\u606f\u70b9" +
                                                " ",
                                        i.a.createElement("b", null, "\u653e\u5165\u81ea\u5df1\u7684 Logo"),
                                        " \u7b49\u3002\u5982\u679c\u9700\u8981\u76f4\u63a5\u5206\u4eab\u4e8c\u7ef4" +
                                                "\u7801\u56fe\u50cf\uff0c\u8bf7\u76f4\u63a5\u4e0b\u8f7d JPG \u683c\u5f0f\u3002"
                                    ),
                                    i.a.createElement(
                                        "h2",
                                        null,
                                        "\u4e8c\u7ef4\u7801\u65e0\u6cd5\u8bc6\u522b\u7684\u539f\u56e0\u662f\u4ec0\u4e48" +
                                                "\uff1f"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u4e8c\u7ef4\u7801\u65e0\u6cd5\u8bc6\u522b\u6709\u5f88\u591a\u539f\u56e0\u3002" +
                                                "\u6bd4\u5982\u5b9a\u4f4d\u70b9\u4e0d\u5339\u914d\u8bc6\u522b\u6a21\u5f0f\u3001" +
                                                "\u4fe1\u606f\u70b9\u989c\u8272\u5bf9\u6bd4\u4e0d\u591f\u3001\u906e\u6321\u90e8" +
                                                "\u5206\u592a\u5927\u3002\u5efa\u8bae\u5c1d\u8bd5\u8c03\u6574\u5bb9\u9519\u7387" +
                                                "\u3001\u989c\u8272\u3001\u56fe\u6807\u5927\u5c0f\u7b49\u53c2\u6570\u5e76\u5728" +
                                                "\u5404\u79cd\u4e8c\u7ef4\u7801\u626b\u63cf\u5668\u4e2d\u6d4b\u8bd5\uff0c\u4ee5" +
                                                "\u4fdd\u8bc1\u4e8c\u7ef4\u7801\u88ab\u8bc6\u522b\u7684\u6210\u529f\u7387"
                                    ),
                                    i.a.createElement(
                                        "h2",
                                        null,
                                        "\u4f7f\u7528\u9047\u5230\u4e86\u95ee\u9898\uff0c\u600e\u4e48\u53cd\u9988\uff1f"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u6211\u4eec\u662f\u4e24\u4f4d\u5927\u4e00\u7684\u5b66\u751f\uff0c\u5fd9\u4e8e" +
                                                "\u5b66\u4e1a\uff0c\u53ef\u80fd\u5728\u8bbe\u8ba1\u4e0e\u5f00\u53d1\u7684\u8fc7" +
                                                "\u7a0b\u4e2d\u6709\u4e00\u4e9b\u758f\u6f0f\uff0c\u656c\u8bf7\u8c05\u89e3\u3002" +
                                                "\u5982\u679c\u9047\u5230\u6d4f\u89c8\u5668\u517c\u5bb9\u95ee\u9898\uff0c\u8bf7" +
                                                "\u6682\u65f6\u9009\u62e9\u66f4\u6362\u8f6f\u4ef6\u6216\u8bbe\u5907\u5c1d\u8bd5" +
                                                "\u3002"
                                    ),
                                    i.a.createElement(
                                        "p",
                                        null,
                                        "\u7f16\u5199\u4e8c\u7ef4\u7801\u6837\u5f0f\u662f\u4e00\u4e2a\u953b\u70bc\u8bbe" +
                                                "\u8ba1\u4e0e\u5f00\u53d1\uff08JavaScript\uff09\u80fd\u529b\u7684\u7edd\u4f73" +
                                                "\u673a\u4f1a\uff0c\u5982\u679c\u4f60\u6709\u5174\u8da3\u548c\u6211\u4eec\u4e00" +
                                                "\u8d77\u73a9\u8fd9\u4e2a\u9879\u76ee\uff0c\u6b22\u8fce\u6dfb\u52a0\u6211\u7684" +
                                                "\u5fae\u4fe1\uff08\u5fae\u4fe1\u53f7\uff1a",
                                        i.a.createElement("span", {
                                            style: {
                                                userSelect: "text"
                                            }
                                        }, "nhciao"),
                                        "\uff0c\u8bf7\u5907\u6ce8\u771f\u5b9e\u59d3\u540d\uff09\u6216\u53d1\u9001\u90ae" +
                                                "\u4ef6\u81f3 ",
                                        i.a.createElement(c, {
                                            href: "mailto:contact@qrbtf.com"
                                        }, "contact@qrbtf.com"),
                                        " \u8054\u7cfb\u6211\u4eec\uff01"
                                    )
                                )
                            )),
                            i.a.createElement("div", {
                                className: "Qr-Centered btn-row"
                            }, i.a.createElement("div", {
                                className: "div-btn"
                            }, i.a.createElement(Fe, {
                                href: "https://www.yuque.com/qrbtf/docs/donate",
                                value: "\u6253\u8d4f"
                            }), i.a.createElement(Fe, {
                                href: "https://github.com/ciaochaos/qrbtf",
                                value: "Github"
                            })), i.a.createElement("div", {
                                className: "div-btn"
                            }, i.a.createElement(Fe, {
                                href: "https://qrbtf-com.mikecrm.com/J2wjEEq",
                                value: "\u53cd\u9988"
                            }), i.a.createElement(Fe, {
                                href: "https://mp.weixin.qq.com/s/GFEMCWQu3e2qhTuBabnHmQ",
                                value: "\u5f00\u53d1"
                            })))
                        )
                },
                pe = o(3),
                ve = function (e) {
                    var A = e.rendererIndex,
                        o = e.paramIndex,
                        t = e.value,
                        r = e.info,
                        a = e.onBlur,
                        K = e.onKeyPress;
                    return i
                        .a
                        .createElement("input", {
                            type: "number",
                            key: "input_" + A + "_" + o,
                            className: "Qr-input small-input",
                            placeholder: r.default,
                            defaultValue: String(t),
                            onBlur: a,
                            onKeyPress: K
                        })
                },
                me = Object(s.b)((function (e, A) {
                    return {
                        rendererIndex: A.rendererIndex,
                        paramIndex: A.paramIndex,
                        value: e.paramValue[A.rendererIndex][A.paramIndex],
                        info: e.paramInfo[A.rendererIndex][A.paramIndex]
                    }
                }), (function (e, A) {
                    return {
                        onBlur: function (o) {
                            return e(b(A.rendererIndex, A.paramIndex, o.target.value))
                        },
                        onKeyPress: function (o) {
                            "Enter" === o.key && (
                                e(b(A.rendererIndex, A.paramIndex, o.target.value)),
                                o.target.blur()
                            )
                        }
                    }
                }))(ve),
                he = function (e) {
                    var A = e.rendererIndex,
                        o = e.paramIndex,
                        t = e.value,
                        r = e.info,
                        a = e.onChange;
                    return i
                        .a
                        .createElement("select", {
                            className: "Qr-select",
                            key: "select_" + A + "_" + o,
                            value: t,
                            onChange: a
                        }, r.choices.map((function (e, t) {
                            return i
                                .a
                                .createElement("option", {
                                    key: "option_" + A + "_" + o + "_" + t,
                                    value: t
                                }, e)
                        })))
                },
                Be = Object(s.b)((function (e, A) {
                    return {
                        rendererIndex: A.rendererIndex,
                        paramIndex: A.paramIndex,
                        value: e.paramValue[A.rendererIndex][A.paramIndex],
                        info: e.paramInfo[A.rendererIndex][A.paramIndex]
                    }
                }), (function (e, A) {
                    return {
                        onChange: function (o) {
                            e(b(A.rendererIndex, A.paramIndex, o.target.value))
                        }
                    }
                }))(he),
                be = o(12),
                ye = o(5),
                ke = o.n(ye),
                Pe = o(127),
                Ee = function (e) {
                    var A = e.rendererIndex,
                        o = e.paramIndex,
                        r = e.value,
                        a = e.onChange,
                        K = Object(t.useState)(!1),
                        n = Object(be.a)(K, 2),
                        l = n[0],
                        f = n[1],
                        c = ke()({
                            default: {
                                btn: {
                                    borderColor: l
                                        ? "#44D7B6"
                                        : null,
                                    color: l
                                        ? "#44D7B6"
                                        : null
                                },
                                container: {
                                    position: "relative"
                                },
                                popover: {
                                    marginTop: "10px",
                                    position: "absolute",
                                    right: "0",
                                    zIndex: "2"
                                },
                                cover: {
                                    position: "fixed",
                                    top: "0px",
                                    right: "0px",
                                    bottom: "0px",
                                    left: "0px"
                                }
                            }
                        });
                    return i
                        .a
                        .createElement(
                            "div",
                            {
                                style: c.container
                            },
                            i.a.createElement("button", {
                                className: "dl-btn",
                                style: c.btn,
                                onClick: function () {
                                    return f(!l)
                                }
                            }, "Color"),
                            l
                                ? i.a.createElement("div", {
                                    style: c.popover
                                }, i.a.createElement("div", {
                                    style: c.cover,
                                    onClick: function () {
                                        return f(!1)
                                    }
                                }), i.a.createElement(Pe.TwitterPicker, {
                                    key: "input_" + A + "_" + o,
                                    triangle: "hide",
                                    color: r,
                                    colors: [
                                        "#FF6900",
                                        "#FCB900",
                                        "#7BDCB5",
                                        "#00D084",
                                        "#8ED1FC",
                                        "#0693E3",
                                        "#ABB8C3",
                                        "#EB144C",
                                        "#F78DA7",
                                        "#9900EF"
                                    ],
                                    onChangeComplete: a
                                }))
                                : null
                        )
                },
                we = Object(s.b)((function (e, A) {
                    return {
                        rendererIndex: A.rendererIndex,
                        paramIndex: A.paramIndex,
                        value: e.paramValue[A.rendererIndex][A.paramIndex]
                    }
                }), (function (e, A) {
                    return {
                        onChange: function (o) {
                            e(b(A.rendererIndex, A.paramIndex, o.hex))
                        }
                    }
                }))(Ee),
                Qe = function (e) {
                    var A = e.rendererIndex,
                        o = e.paramIndex,
                        t = e.onChange;
                    return i
                        .a
                        .createElement(i.a.Fragment, null, i.a.createElement("label", {
                            htmlFor: "image_upload",
                            key: "label_" + A + "_" + o,
                            className: "dl-btn ul-btn",
                            style: {
                                textAlign: "center"
                            }
                        }, "\u4e0a\u4f20\u56fe\u7247"), i.a.createElement("input", {
                            type: "file",
                            key: "input_" + A + "_" + o,
                            id: "image_upload",
                            hidden: !0,
                            accept: "image/*",
                            onChange: t
                        }))
                },
                Se = Object(s.b)((function (e, A) {
                    return {
                        rendererIndex: A.rendererIndex,
                        paramIndex: A.paramIndex,
                        value: e.paramValue[A.rendererIndex][A.paramIndex],
                        info: e.paramInfo[A.rendererIndex][A.paramIndex]
                    }
                }), (function (e, A) {
                    return {
                        onChange: function (o) {
                            if (o.target.files.length > 0) {
                                var t = o
                                    .target
                                    .files[0];
                                E(t) && (n(), w(t, 1).then((function (o) {
                                    e(b(A.rendererIndex, A.paramIndex, o))
                                })))
                            }
                        }
                    }
                }))(Qe),
                xe = function (e) {
                    var A = e.rendererIndex,
                        o = e.paramIndex,
                        t = e.value,
                        r = e.onChange;
                    return i
                        .a
                        .createElement("input", {
                            type: "checkbox",
                            className: "Qr-checkbox",
                            key: "checkbox_" + A + "_" + o,
                            checked: t,
                            onChange: r
                        })
                },
                He = Object(s.b)((function (e, A) {
                    return {
                        rendererIndex: A.rendererIndex,
                        paramIndex: A.paramIndex,
                        value: e.paramValue[A.rendererIndex][A.paramIndex]
                    }
                }), (function (e, A) {
                    return {
                        onChange: function (o) {
                            e(b(A.rendererIndex, A.paramIndex, o.target.checked))
                        }
                    }
                }))(xe),
                De = function (e) {
                    var A = e.paramName,
                        o = e.children,
                        t = Object(Ue.a)(e, ["paramName", "children"]);
                    return i
                        .a
                        .createElement("table", Object.assign({
                            className: "Qr-table"
                        }, t), i.a.createElement(
                            "tbody",
                            null,
                            i.a.createElement("tr", null, i.a.createElement("td", null, A), i.a.createElement("td", null, o))
                        ))
                },
                Ne = (ue = {}, Object(pe.a)(ue, H, me), Object(pe.a)(ue, D, Be), Object(pe.a)(
                    ue,
                    N,
                    we
                ), Object(pe.a)(ue, q, He), Object(pe.a)(ue, j, Se), ue),
                qe = function (e) {
                    var A = e.rendererIndex;
                    return e
                        .paramInfo
                        .map((function (e, o) {
                            return i
                                .a
                                .createElement(De, {
                                    key: "tr_" + A + "_" + o,
                                    paramName: e.key
                                }, i.a.createElement(Ne[e.type], {
                                    rendererIndex: A,
                                    paramIndex: o
                                }))
                        }))
                },
                je = Object(s.b)((function (e) {
                    return {
                        rendererIndex: e.selectedIndex,
                        paramInfo: e.paramInfo[e.selectedIndex]
                    }
                }), null)(qe),
                Xe = function (e) {
                    var A = e.value,
                        o = e.onChange;
                    return i
                        .a
                        .createElement(De, {
                            paramName: "Tolerancia a fallos "
                        }, i.a.createElement("select", {
                            className: "Qr-select",
                            value: A,
                            onChange: o
                        }, i.a.createElement("option", {
                            value: 1
                        }, "7%"), i.a.createElement("option", {
                            value: 0
                        }, "15%"), i.a.createElement("option", {
                            value: 3
                        }, "25%"), i.a.createElement("option", {
                            value: 2
                        }, "30%")))
                },
                Ve = Object(s.b)((function (e) {
                    return {value: e.correctLevel}
                }), (function (e) {
                    return {
                        onChange: function (A) {
                            var o;
                            e((o = A.target.value, {
                                type: R,
                                correctLevel: o
                            }))
                        }
                    }
                }))(Xe),
                Le = o(15),
                Je = Object(s.b)((function (e, A) {
                    return {rendererIndex: -1, paramIndex: -1}
                }), (function (e, A) {
                    return {
                        onChange: function (e) {
                            if (e.target.files.length > 0) {
                                var o = e
                                    .target
                                    .files[0];
                                E(o) && w(o, 1).then((function (e) {
                                    A.onChange(Object(Le.a)(Object(Le.a)({}, A.icon), {}, {src: e}))
                                }))
                            }
                        }
                    }
                }))(Qe),
                Te = function (e) {
                    var A = e.icon,
                        o = e.onBlur,
                        t = e.onKeyPress,
                        r = A.enabled,
                        a = (A.src, A.scale),
                        K = [];
                    return 1 == W(r, 0) && K.push(i.a.createElement(De, {
                        paramName: "\u56fe\u6807\u6e90"
                    }, i.a.createElement(Je, {
                        icon: A,
                        onChange: o
                    }))),
                    0 != W(r, 0) && K.push(i.a.createElement(De, {
                        paramName: "\u56fe\u6807\u7f29\u653e"
                    }, i.a.createElement("input", {
                        type: "number",
                        className: "Qr-input small-input",
                        defaultValue: a,
                        onBlur: function (e) {
                            return o(Object(Le.a)(Object(Le.a)({}, A), {}, {scale: e.target.value}))
                        },
                        onKeyPress: function (e) {
                            return t(e, Object(Le.a)(Object(Le.a)({}, A), {}, {scale: e.target.value}))
                        }
                    }))),
                    K
                },
                Ie = function (e) {
                    var A = e.icon,
                        o = e.onBlur,
                        t = e.onKeyPress;
                    return i
                        .a
                        .createElement(i.a.Fragment, null, i.a.createElement(De, {
                            paramName: "\u56fe\u6807"
                        }, i.a.createElement("select", {
                            className: "Qr-select",
                            defaultValue: A.enabled,
                            onChange: function (e) {
                                return o(Object(Le.a)(Object(Le.a)({}, A), {}, {enabled: e.target.value}))
                            }
                        }, i.a.createElement("option", {
                            value: 0
                        }, "\u65e0"), i.a.createElement("option", {
                            value: 1
                        }, "\u81ea\u5b9a\u4e49"), i.a.createElement("option", {
                            value: 2
                        }, "\u5fae\u4fe1 \u2014 \u5c0f"), i.a.createElement("option", {
                            value: 3
                        }, "\u5fae\u4fe1"), i.a.createElement("option", {
                            value: 4
                        }, "\u5fae\u4fe1\u652f\u4ed8"), i.a.createElement("option", {
                            value: 5
                        }, "\u652f\u4ed8\u5b9d"))), i.a.createElement(Te, {
                            icon: A,
                            onBlur: o,
                            onKeyPress: t
                        }))
                },
                We = Object(s.b)((function (e, A) {
                    return {icon: e.icon}
                }), (function (e, A) {
                    return {
                        onBlur: function (A) {
                            e(k(A))
                        },
                        onKeyPress: function (A, o) {
                            "Enter" === A.key && e(k(o))
                        }
                    }
                }))(Ie),
                Oe = function () {
                    return i
                        .a
                        .createElement("div", {
                            className: "Qr-titled-nobg"
                        }, i.a.createElement("div", {
                            className: "Qr-Centered title-margin"
                        }, i.a.createElement("div", {
                            className: "Qr-s-title"
                        }, "Párametros"), i.a.createElement("p", {
                            className: "Qr-s-subtitle"
                        }, "\u53c2\u6570\u8c03\u6574")), i.a.createElement("div", {
                            className: "Qr-Centered"
                        }, i.a.createElement(
                            "div",
                            {
                                className: "Qr-div-table"
                            },
                            i.a.createElement(Ve, null),
                            i.a.createElement(We, null),
                            i.a.createElement(je, null)
                        )))
                },
                Ge = function (e) {
                    var A = e.value;
                    return isNaN(A)
                        ? null
                        : (
                            A >= 1e4 && (A = (A / 1e4).toFixed(1) + "\u4e07"),
                            i.a.createElement("sup", {
                                className: "Gray"
                            }, A)
                        )
                },
                ze = function () {
                    return "micromessenger" === window
                        .navigator
                        .userAgent
                        .toLowerCase()
                        .match(/MicroMessenger/i)
                            ? i
                                .a
                                .createElement(
                                    "div",
                                    {
                                        className: "note-font",
                                        id: "wx-message-inner"
                                    },
                                    "\u5f53\u524d\u5ba2\u6237\u7aef\u4e0d\u652f\u6301\u4e0b\u8f7d SVG\uff0c",
                                    i.a.createElement("br", null),
                                    "\u8bf7\u4e0b\u8f7d JPG \u5e76\u957f\u6309\u4e8c\u7ef4\u7801\u4fdd\u5b58\u3002"
                                )
                            : null
                },
                Me = function (e) {
                    var A = e.imgData;
                    return A.length > 0
                        ? i
                            .a
                            .createElement("div", {
                                id: "dl-image"
                            }, i.a.createElement("div", {
                                id: "dl-image-inner"
                            }, i.a.createElement("img", {
                                id: "dl-image-inner-jpg",
                                src: A,
                                alt: "\u957f\u6309\u4fdd\u5b58\u4e8c\u7ef4\u7801"
                            })))
                        : null
                },
                Ze = function (e) {
                    var A = e.value,
                        o = e.downloadCount,
                        r = e.onSvgDownload,
                        a = e.onImgDownload,
                        K = Object(t.useState)(""),
                        n = Object(be.a)(K, 2),
                        l = n[0],
                        f = n[1];
                    return i
                        .a
                        .createElement("div", {
                            className: "Qr-titled"
                        }, i.a.createElement("div", {
                            className: "Qr-Centered title-margin"
                        }, i.a.createElement("div", {
                            className: "Qr-s-title"
                        }, "Descargar"), i.a.createElement(
                            "p",
                            {
                                className: "Qr-s-subtitle"
                            },
                            i.a.createElement("span", null, "Descarga el QR \u2014 ", A),
                            i.a.createElement(Ge, {value: o})
                        )), i.a.createElement(
                            "div",
                            {
                                className: "Qr-Centered"
                            },
                            i.a.createElement("div", {
                                className: "btn-row"
                            }, i.a.createElement("div", {
                                className: "div-btn img-dl-btn"
                            }, i.a.createElement("button", {
                                className: "dl-btn",
                                onClick: function () {
                                    a("jpg").then((function (e) {
                                        return f(e)
                                    }))
                                }
                            }, "JPG"), i.a.createElement("button", {
                                className: "dl-btn",
                                onClick: function () {
                                    a("png").then((function (e) {
                                        return f(e)
                                    }))
                                }
                            }, "PNG"), i.a.createElement("button", {
                                className: "dl-btn",
                                onClick: r
                            }, "SVG"))),
                            i.a.createElement("div", {
                                id: "wx-message"
                            }, i.a.createElement(ze, null)),
                            i.a.createElement("div", null, i.a.createElement(Me, {imgData: l}))
                        ))
                },
                Ye = {
                    jpg: "image/jpeg",
                    png: "image/png"
                };
            var _e,
                $e = o(1),
                eA = o.n($e),
                AA = o(6),
                oA = o(128).init({env: "qrbtf-1d845d"}),
                tA = oA.auth(),
                iA = oA.database(),
                rA = iA.command;
            function aA() {
                return (aA = Object(AA.a)(eA.a.mark((function e() {
                    var A;
                    return eA
                        .a
                        .wrap((function (e) {
                            for (;;) 
                                switch (e.prev = e.next) {
                                    case 0:
                                        if (!_e) {
                                            e.next = 2;
                                            break
                                        }
                                        return e.abrupt("return");
                                    case 2:
                                        return e.next = 4,
                                        tA.signInAnonymously();
                                    case 4:
                                        return e.next = 6,
                                        tA.getLoginState();
                                    case 6:
                                        A = e.sent,
                                        _e = A;
                                    case 8:
                                    case "end":
                                        return e.stop()
                                }
                            }), e)
                })))).apply(this, arguments)
            }
            function KA(e) {
                _e && iA
                    .collection("QRCounter")
                    .get()
                    .then((function (A) {
                        e && e(A)
                    }))
            }
            function nA(e, A, o) {
                return new Promise((function (t) {
                    var i,
                        r;
                    i = e.value,
                    r = function () {
                        !function (e, A) {
                            var o = e.text,
                                t = e.value,
                                i = e.type,
                                r = e.params,
                                a = e.history;
                            _e && iA
                                .collection("QRDownloadData")
                                .add({
                                    date: (new Date).toString(),
                                    text: o,
                                    value: t,
                                    type: i,
                                    params: r,
                                    history: a
                                })
                                .then((function (e) {
                                    A && A(e)
                                }))
                                .catch(console.error)
                            }({
                            text: e.textUrl,
                            value: e.value,
                            type: A,
                            params: e
                                .paramInfo[e.selectedIndex]
                                .map((function (A, o) {
                                    var t = function (e, A) {
                                        return e.type === D
                                            ? e.choices[A]
                                            : A
                                    }(A, e.paramValue[e.selectedIndex][o]);
                                    return "string" != typeof t || t.length <= 128
                                        ? {
                                            key: A.key,
                                            value: t
                                        }
                                        : {}
                                })),
                            history: e.history
                        }, (function () {
                            KA((function (e) {
                                var A = [];
                                e
                                    .data
                                    .forEach((function (e) {
                                        A[e.value] = e.count
                                    })),
                                o(A),
                                t()
                            }))
                        }))
                    },
                    _e && iA
                        .collection("QRCounter")
                        .where({value: rA.eq(i)})
                        .get()
                        .then((function (e) {
                            e.data.length > 0
                                ? iA
                                    .collection("QRCounter")
                                    .where({value: rA.eq(i)})
                                    .update({
                                        count: rA.inc(1),
                                        date: (new Date).toString()
                                    })
                                    .then((function () {
                                        r && r()
                                    }))
                                    .catch(console.error)
                                : iA
                                    .collection("QRCounter")
                                    .add({
                                        value: i,
                                        count: 1,
                                        date: (new Date).toString()
                                    })
                                    .then((function () {
                                        r && r()
                                    }))
                                    .catch(console.error)
                                }))
                }))
            }
            var lA = Object(s.b)((function (e, A) {
                return {
                    value: e.value,
                    downloadCount: e.downloadData[e.value],
                    onSvgDownload: function () {
                        var o;
                        !function (e, A) {
                            var o = new Blob(
                                    ['<?xml version="1.0" encoding="utf-8"?>\n <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG' +
                                            ' 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">\n' +
                                            A],
                                    {type: "image/svg+xml"}
                                ),
                                t = document.createElement("a"),
                                i = "QRcode_" + e + ".svg";
                            t.href = URL.createObjectURL(o),
                            t.download = i,
                            t.hidden = !0,
                            t.click()
                        }(e.value, I(e.selectedIndex)),
                        nA(e, "svg", A.updateDownloadData),
                        o = e.value,
                        K
                            .a
                            .event({category: "Style", action: "DownloadSvg", label: o})
                    },
                    onImgDownload: function (o) {
                        return new Promise((function (t) {
                            (function (e, A, o, t, i) {
                                if (!Ye[i]) 
                                    throw "Error image type";
                                var r = "QRcode_" + e + "." + i,
                                    a = document.createElement("div");
                                a.innerHTML = A;
                                var K = a
                                    .firstChild
                                    .cloneNode(!0);
                                K.setAttribute("width", o),
                                K.setAttribute("height", t);
                                var n = (new XMLSerializer).serializeToString(K),
                                    l = document.createElement("canvas");
                                l.setAttribute("width", o),
                                l.setAttribute("height", t);
                                var f = l.getContext("2d"),
                                    c = document.createElement("img");
                                return c.setAttribute("src", "data:image/svg+xml;base64," + btoa(n)),
                                new Promise((function (e) {
                                    c.onload = function () {
                                        f.fillStyle = "white",
                                        "jpg" === i && f.fillRect(0, 0, o, t),
                                        f.drawImage(c, 0, 0, o, t);
                                        var A = document.createElement("a"),
                                            a = l.toDataURL(Ye[i], .8);
                                        A.setAttribute("href", a),
                                        A.setAttribute("target", "download"),
                                        A.setAttribute("download", r),
                                        A.click(),
                                        e(a)
                                    }
                                }))
                            })(e.value, I(e.selectedIndex), 1500, 1500, o).then((function (i) {
                                nA(e, o, A.updateDownloadData).then((function () {
                                    !function (e, A) {
                                        K
                                            .a
                                            .event({
                                                category: "Style",
                                                action: "Download" + A
                                                    .charAt(0)
                                                    .toUpperCase() + A.slice(1),
                                                label: e
                                            })
                                    }(e.value, o),
                                    t(i)
                                }))
                            }))
                        }))
                    }
                }
            }), null)(Ze);
            function fA(e) {
                return !0 === e
                    ? "Qr-item Qr-item-selected"
                    : "Qr-item"
            }
            var cA = function (e) {
                    var A = e.value,
                        o = e.renderer,
                        t = e.selected,
                        r = e.details,
                        a = e.onSelected;
                    return i
                        .a
                        .createElement("div", {
                            className: fA(t),
                            onClick: a
                        }, i.a.createElement("div", {
                            className: "Qr-item-image"
                        }, i.a.createElement("div", {
                            className: "Qr-item-image-inner"
                        }, o)), i.a.createElement("div", {
                            className: "Qr-item-detail"
                        }, A), i.a.createElement("div", {
                            className: "Qr-item-desc"
                        }, i.a.createElement("div", {
                            className: "Qr-item-desc-inner"
                        }, r)))
                },
                FA = function (e) {
                    var A = e.styles,
                        o = e.onSelected;
                    return i
                        .a
                        .createElement("div", {
                            className: "Qr-box"
                        }, A.map((function (e, A) {
                            return i
                                .a
                                .createElement(cA, Object.assign({
                                    key: e.value
                                }, e, {
                                    onSelected: function () {
                                        return o(A)
                                    }
                                }))
                        })))
                };
            var UA = function (e) {
                if (!e) 
                    return "0 0 0 0";
                var A = e.getModuleCount();
                return String(-A / 5) + " " + String(-A / 5) + " " + String(A + A / 5 * 2) +
                        " " + String(A + A / 5 * 2)
            };
            function sA(e) {
                var A = e.qrcode,
                    o = e.icon,
                    t = e.params;
                return 1 === W(o.enabled, 0)
                    ? function (e) {
                        var A = e.qrcode,
                            o = (e.params, e.title, e.icon);
                        if (!A) 
                            return [];
                        var t = 0,
                            r = A.getModuleCount(),
                            a = [],
                            K = "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                    "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                    "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                    "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                    "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                    "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                    "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                    "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                    "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                    "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                    "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                    "11e-16 32.048565,-1.29480038e-15 Z";
                        if (o) {
                            var n = W(o.enabled, 0),
                                l = o.src,
                                f = o.scale,
                                c = Number(r * (
                                    f > 33
                                        ? 33
                                        : f
                                ) / 100),
                                F = (r - c) / 2;
                            if (o && n) {
                                var U = J(),
                                    s = J();
                                a.push(i.a.createElement("path", {
                                    d: K,
                                    stroke: "#FFF",
                                    strokeWidth: 100 / c * 1,
                                    fill: "#FFF",
                                    transform: "translate(" + String(F) + "," + String(F) + ") scale(" + String(
                                        c / 100
                                    ) + "," + String(c / 100) + ")"
                                })),
                                a.push(i.a.createElement("g", {
                                    key: t++
                                }, i.a.createElement("defs", null, i.a.createElement("path", {
                                    id: "defs-path" + U,
                                    d: K,
                                    fill: "#FFF",
                                    transform: "translate(" + String(F) + "," + String(F) + ") scale(" + String(
                                        c / 100
                                    ) + "," + String(c / 100) + ")"
                                }), "                    "), i.a.createElement("clipPath", {
                                    id: "clip-path" + s
                                }, i.a.createElement("use", {
                                    xlinkHref: "#defs-path" + U,
                                    overflow: "visible"
                                })), i.a.createElement("g", {
                                    clipPath: "url(#clip-path" + s + ")"
                                }, i.a.createElement("image", {
                                    overflow: "visible",
                                    key: t++,
                                    xlinkHref: l,
                                    width: c,
                                    x: F,
                                    y: F
                                }))))
                            }
                        }
                        return a
                    }({qrcode: A, icon: o, params: t})
                    : function (e) {
                        var A = e.qrcode,
                            o = (e.params, e.title, e.icon);
                        if (!A) 
                            return [];
                        var t = 0,
                            r = A.getModuleCount(),
                            a = [],
                            K = "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                    "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                    "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                    "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                    "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                    "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                    "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                    "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                    "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                    "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                    "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                    "11e-16 32.048565,-1.29480038e-15 Z";
                        if (o) {
                            var n = W(o.enabled, 0),
                                l = (o.src, o.scale),
                                f = Number(r * (
                                    l > 33
                                        ? 33
                                        : l
                                ) / 100),
                                c = (r - f) / 2,
                                F = i
                                    .a
                                    .createElement("g", null, i.a.createElement("rect", {
                                        width: "100",
                                        height: "100",
                                        fill: "#07c160"
                                    }), i.a.createElement("path", {
                                        d: "M39.061,44.018a4.375,4.375,0,1,1,4.374-4.375,4.375,4.375,0,0,1-4.374,4.375m21." +
                                                "877,0a4.375,4.375,0,1,1,4.376-4.375,4.375,4.375,0,0,1-4.376,4.375M28.522,69.06" +
                                                "3a2.184,2.184,0,0,1,.92,1.782,2.581,2.581,0,0,1-.116.7c-.552,2.06-1.437,5.361-" +
                                                "1.478,5.516a3.237,3.237,0,0,0-.177.8,1.093,1.093,0,0,0,1.094,1.093,1.243,1.243" +
                                                ",0,0,0,.633-.2L36.581,74.6a3.427,3.427,0,0,1,1.742-.5,3.3,3.3,0,0,1,.965.144A3" +
                                                "8.825,38.825,0,0,0,50,75.739c18.123,0,32.816-12.242,32.816-27.346S68.122,21.04" +
                                                "9,50,21.049,17.185,33.29,17.185,48.393c0,8.239,4.42,15.656,11.337,20.67",
                                        fill: "#fff"
                                    })),
                                U = i
                                    .a
                                    .createElement(
                                        "g",
                                        null,
                                        i.a.createElement("rect", {
                                            width: "100",
                                            height: "100",
                                            fill: "#07c160"
                                        }),
                                        i.a.createElement("path", {
                                            d: "M48.766,39.21a2.941,2.941,0,1,1,2.918-2.94,2.929,2.929,0,0,1-2.918,2.94m-16.45" +
                                                    "5,0a2.941,2.941,0,1,1,2.918-2.941,2.93,2.93,0,0,1-2.918,2.941m8.227-17.039c-13" +
                                                    ".632,0-24.682,9.282-24.682,20.732,0,6.247,3.324,11.87,8.528,15.67a1.662,1.662," +
                                                    "0,0,1,.691,1.352,1.984,1.984,0,0,1-.087.528c-.415,1.563-1.081,4.064-1.112,4.18" +
                                                    "1a2.449,2.449,0,0,0-.132.607.825.825,0,0,0,.823.828.914.914,0,0,0,.474-.154l5." +
                                                    "405-3.144a2.57,2.57,0,0,1,1.31-.382,2.442,2.442,0,0,1,.725.109,28.976,28.976,0" +
                                                    ",0,0,8.057,1.137c.455,0,.907-.012,1.356-.032a16.084,16.084,0,0,1-.829-5.082c0-" +
                                                    "10.442,10.078-18.908,22.511-18.908.45,0,.565.015,1.008.037-1.858-9.9-11.732-17" +
                                                    ".479-24.046-17.479",
                                            fill: "#fff"
                                        }),
                                        i.a.createElement("path", {
                                            d: "M70.432,55.582A2.589,2.589,0,1,1,73,52.994a2.578,2.578,0,0,1-2.568,2.588m-13.7" +
                                                    "13,0a2.589,2.589,0,1,1,2.568-2.588,2.578,2.578,0,0,1-2.568,2.588m20.319,16a16." +
                                                    "3,16.3,0,0,0,7.106-13.058c0-9.542-9.208-17.276-20.568-17.276s-20.57,7.734-20.5" +
                                                    "7,17.276S52.216,75.8,63.576,75.8a24.161,24.161,0,0,0,6.714-.947,2.079,2.079,0," +
                                                    "0,1,.6-.091,2.138,2.138,0,0,1,1.092.319l4.5,2.62a.78.78,0,0,0,.4.129.688.688,0" +
                                                    ",0,0,.685-.691,2.081,2.081,0,0,0-.11-.5l-.927-3.486a1.641,1.641,0,0,1-.073-.44" +
                                                    ",1.385,1.385,0,0,1,.577-1.126",
                                            fill: "#fff"
                                        })
                                    ),
                                s = i
                                    .a
                                    .createElement("g", null, i.a.createElement("rect", {
                                        width: "100",
                                        height: "100",
                                        fill: "#07c160"
                                    }), i.a.createElement("path", {
                                        d: "M41.055,57.675a2.183,2.183,0,0,1-2.893-.883l-.143-.314L32.046,43.37a1.133,1.13" +
                                                "3,0,0,1-.105-.461,1.094,1.094,0,0,1,1.748-.877l7.049,5.019a3.249,3.249,0,0,0,2" +
                                                ".914.333L76.8,32.63c-5.942-7-15.728-11.581-26.8-11.581-18.122,0-32.813,12.243-" +
                                                "32.813,27.345,0,8.24,4.42,15.656,11.338,20.669a2.185,2.185,0,0,1,.919,1.781,2." +
                                                "569,2.569,0,0,1-.116.7c-.552,2.062-1.437,5.362-1.478,5.516a3.212,3.212,0,0,0-." +
                                                "177.8,1.094,1.094,0,0,0,1.1,1.094,1.236,1.236,0,0,0,.631-.2L36.583,74.6a3.438," +
                                                "3.438,0,0,1,1.742-.5,3.281,3.281,0,0,1,.965.145A38.844,38.844,0,0,0,50,75.739c" +
                                                "18.122,0,32.813-12.243,32.813-27.345a23.668,23.668,0,0,0-3.738-12.671L41.3,57." +
                                                "537Z",
                                        fill: "#fff"
                                    })),
                                g = i
                                    .a
                                    .createElement("g", null, i.a.createElement("rect", {
                                        width: "100",
                                        height: "100",
                                        fill: "#009ce1"
                                    }), i.a.createElement("path", {
                                        d: "M100,67.856c-.761-.1-4.8-.8-17.574-5.066-4.012-1.339-9.4-3.389-15.395-5.552A80" +
                                                ".552,80.552,0,0,0,75.4,36.156H55.633v-7.1H79.848V25.094H55.633V13.258H45.749a1" +
                                                ".68,1.68,0,0,0-1.733,1.707V25.094H19.524v3.963H44.016v7.1H23.8V40.12H63.013a69" +
                                                ".579,69.579,0,0,1-5.65,13.763c-12.724-4.187-26.3-7.58-34.834-5.491C17.074,49.7" +
                                                "33,13.56,52.125,11.5,54.63,2.02,66.125,8.815,83.585,28.824,83.585c11.831,0,23." +
                                                "228-6.579,32.061-17.417C73.49,72.211,97.914,82.4,100,83.267ZM26.956,76.9c-15.6" +
                                                ",0-20.215-12.255-12.5-18.958,2.573-2.266,7.276-3.372,9.782-3.621,9.268-.913,17" +
                                                ".846,2.613,27.972,7.541C45.087,71.118,36.023,76.9,26.956,76.9Z",
                                        fill: "#fff"
                                    }));
                            if (o && n) {
                                var u = J(),
                                    R = J();
                                a.push(i.a.createElement("path", {
                                    d: K,
                                    stroke: "#FFF",
                                    strokeWidth: 100 / f * 1,
                                    fill: "#FFF",
                                    transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                        f / 100
                                    ) + "," + String(f / 100) + ")"
                                })),
                                a.push(i.a.createElement("g", {
                                    key: t++
                                }, i.a.createElement("defs", null, i.a.createElement("path", {
                                    id: "defs-path" + u,
                                    d: K,
                                    fill: "#FFF",
                                    transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                        f / 100
                                    ) + "," + String(f / 100) + ")"
                                }), "                    "), i.a.createElement("clipPath", {
                                    id: "clip-path" + R
                                }, i.a.createElement("use", {
                                    xlinkHref: "#defs-path" + u,
                                    overflow: "visible"
                                })), i.a.createElement("g", {
                                    clipPath: "url(#clip-path" + R + ")"
                                }, i.a.createElement(
                                    "g",
                                    {
                                        transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                            f / 100
                                        ) + "," + String(f / 100) + ")"
                                    },
                                    2 === n
                                        ? F
                                        : 3 === n
                                            ? U
                                            : 4 === n
                                                ? s
                                                : 5 === n
                                                    ? g
                                                    : void 0
                                ))))
                            }
                        }
                        return a
                    }({qrcode: A, icon: o, params: t})
            }
            function gA(e) {
                return e = O({
                    getViewBox: UA,
                    listPoints: function (e) {
                        e.qrcode,
                        e.params,
                        e.icon;
                        return []
                    },
                    getParamInfo: function () {
                        return []
                    },
                    beginRendering: function (e) {
                        e.qrcode,
                        e.params,
                        e.setParamInfo
                    },
                    beforeListing: function (e) {
                        e.qrcode,
                        e.params,
                        e.setParamInfo
                    },
                    drawIcon: sA
                }, e),
                function (A) {
                    var o = A.qrcode,
                        r = A.params,
                        a = A.title,
                        K = A.icon,
                        n = A.setParamInfo;
                    return Object(t.useEffect)((function () {
                        n(e.getParamInfo())
                    }), [n]),
                    e.beginRendering({qrcode: o, params: r, setParamInfo: n}),
                    i
                        .a
                        .createElement(
                            "svg",
                            {
                                className: "Qr-item-svg",
                                width: "100%",
                                height: "100%",
                                viewBox: e.getViewBox(o),
                                fill: "white",
                                xmlns: "http://www.w3.org/2000/svg",
                                xmlnsXlink: "http://www.w3.org/1999/xlink"
                            },
                            e.beforeListing({qrcode: o, params: r, setParamInfo: n}),
                            e.listPoints({qrcode: o, params: r, icon: K}),
                            e.drawIcon({qrcode: o, params: r, title: a, icon: K})
                        )
                }
            }
            var uA = i
                    .a
                    .memo((function (e) {
                        var A = e.rendererType,
                            o = Object(Ue.a)(e, ["rendererType"]);
                        return i
                            .a
                            .createElement(A, o)
                    }), (function (e, A) {
                        return !(!0 === e.selected || !0 === A.selected)
                    })),
                RA = Object(s.b)((function (e, A) {
                    return {
                        rendererType: A.rendererType,
                        rendererIndex: A.index,
                        qrcode: e.qrcode,
                        params: T(e.paramValue[A.index].slice(), 0),
                        title: e.title,
                        icon: e.icon,
                        selected: e.selectedIndex === A.index
                    }
                }), (function (e, A) {
                    return {
                        setParamInfo: function (e) {
                            return A.setParamInfo(A.index, e)
                        }
                    }
                }))(uA);
            var dA = gA({
                listPoints: function (e) {
                    var A = e.qrcode,
                        o = e.params;
                    if (e.icon, !A) 
                        return [];
                    var t = A.getModuleCount(),
                        r = te(A),
                        a = [],
                        K = [],
                        n = [],
                        l = o[0] / 100,
                        f = o[1] / 100,
                        c = o[2] / 100,
                        F = o[3],
                        U = 0;
                    l <= 0 && (l = 70),
                    f <= 0 && (f = 70);
                    for (var s = [], g = [], u = 0; u < t; u++) {
                        s[u] = [],
                        g[u] = [];
                        for (var R = 0; R < t; R++) 
                            s[u][R] = !0,
                            g[u][R] = !0
                    }
                    for (var d = 0; d < t; d++) 
                        for (var C = 0; C < t; C++) 
                            if (!1 !== A.isDark(C, d)) 
                                if (r[C][d] === M) 
                                    0 === F
                                        ? a.push(i.a.createElement("rect", {
                                            width: 1,
                                            height: 1,
                                            key: U++,
                                            fill: "#0B2D97",
                                            x: C,
                                            y: d
                                        }))
                                        : 1 === F && (a.push(i.a.createElement("rect", {
                                            width: 3 - (1 - c),
                                            height: 3 - (1 - c),
                                            key: U++,
                                            fill: "#0B2D97",
                                            x: C - 1 + (1 - c) / 2,
                                            y: d - 1 + (1 - c) / 2
                                        })), a.push(i.a.createElement("rect", {
                                            width: c,
                                            height: 3 - (1 - c),
                                            key: U++,
                                            fill: "#0B2D97",
                                            x: C - 3 + (1 - c) / 2,
                                            y: d - 1 + (1 - c) / 2
                                        })), a.push(i.a.createElement("rect", {
                                            width: c,
                                            height: 3 - (1 - c),
                                            key: U++,
                                            fill: "#0B2D97",
                                            x: C + 3 + (1 - c) / 2,
                                            y: d - 1 + (1 - c) / 2
                                        })), a.push(i.a.createElement("rect", {
                                            width: 3 - (1 - c),
                                            height: c,
                                            key: U++,
                                            fill: "#0B2D97",
                                            x: C - 1 + (1 - c) / 2,
                                            y: d - 3 + (1 - c) / 2
                                        })), a.push(i.a.createElement("rect", {
                                            width: 3 - (1 - c),
                                            height: c,
                                            key: U++,
                                            fill: "#0B2D97",
                                            x: C - 1 + (1 - c) / 2,
                                            y: d + 3 + (1 - c) / 2
                                        })));
                                else if (r[C][d] === Z) 
                                    0 === F && a.push(i.a.createElement("rect", {
                                        width: 1,
                                        height: 1,
                                        key: U++,
                                        fill: "#0B2D97",
                                        x: C,
                                        y: d
                                    }));
                                else {
                                    if (s[C][d] && g[C][d] && C < t - 2 && d < t - 2) {
                                        for (var p = !0, v = 0; v < 3; v++) 
                                            for (var m = 0; m < 3; m++) 
                                                !1 === g[C + v][d + m] && (p = !1);
                                    if (p && A.isDark(C + 2, d) && A.isDark(C + 1, d + 1) && A.isDark(C, d + 2) && A.isDark(
                                            C + 2,
                                            d + 2
                                        )) {
                                            K.push(i.a.createElement("line", {
                                                key: U++,
                                                x1: C + f / Math.sqrt(8),
                                                y1: d + f / Math.sqrt(8),
                                                x2: C + 3 - f / Math.sqrt(8),
                                                y2: d + 3 - f / Math.sqrt(8),
                                                fill: "none",
                                                stroke: "#0B2D97",
                                                strokeWidth: f
                                            })),
                                            K.push(i.a.createElement("line", {
                                                key: U++,
                                                x1: C + 3 - f / Math.sqrt(8),
                                                y1: d + f / Math.sqrt(8),
                                                x2: C + f / Math.sqrt(8),
                                                y2: d + 3 - f / Math.sqrt(8),
                                                fill: "none",
                                                stroke: "#0B2D97",
                                                strokeWidth: f
                                            })),
                                            s[C][d] = !1,
                                            s[C + 2][d] = !1,
                                            s[C][d + 2] = !1,
                                            s[C + 2][d + 2] = !1,
                                            s[C + 1][d + 1] = !1;
                                            for (var h = 0; h < 3; h++) 
                                                for (var B = 0; B < 3; B++) 
                                                    g[C + h][d + B] = !1
                                        }
                                    }
                                    if (s[C][d] && g[C][d] && C < t - 1 && d < t - 1) {
                                        for (var b = !0, y = 0; y < 2; y++) 
                                            for (var k = 0; k < 2; k++) 
                                                !1 === g[C + y][d + k] && (b = !1);
                                    if (b && A.isDark(C + 1, d) && A.isDark(C, d + 1) && A.isDark(C + 1, d + 1)) {
                                            K.push(i.a.createElement("line", {
                                                key: U++,
                                                x1: C + f / Math.sqrt(8),
                                                y1: d + f / Math.sqrt(8),
                                                x2: C + 2 - f / Math.sqrt(8),
                                                y2: d + 2 - f / Math.sqrt(8),
                                                fill: "none",
                                                stroke: "#0B2D97",
                                                strokeWidth: f
                                            })),
                                            K.push(i.a.createElement("line", {
                                                key: U++,
                                                x1: C + 2 - f / Math.sqrt(8),
                                                y1: d + f / Math.sqrt(8),
                                                x2: C + f / Math.sqrt(8),
                                                y2: d + 2 - f / Math.sqrt(8),
                                                fill: "none",
                                                stroke: "#0B2D97",
                                                strokeWidth: f
                                            }));
                                            for (var P = 0; P < 2; P++) 
                                                for (var E = 0; E < 2; E++) 
                                                    s[C + P][d + E] = !1,
                                                    g[C + P][d + E] = !1
                                        }
                                    }
                                    if (s[C][d] && g[C][d] && (
                                        0 === d || d > 0 && (!A.isDark(C, d - 1) || !g[C][d - 1])
                                    )) {
                                        for (var w = d, Q = d, S = !0; S && Q < t;) 
                                            A.isDark(C, Q) && g[C][Q]
                                                ? Q++
                                                : S = !1;
                                        if (Q - w > 2) {
                                            for (var x = w; x < Q; x++) 
                                                g[C][x] = !1,
                                                s[C][x] = !1;
                                            n.push(i.a.createElement("rect", {
                                                width: l,
                                                height: Q - w - 1 - (1 - l),
                                                key: U++,
                                                fill: "#E02020",
                                                x: C + (1 - l) / 2,
                                                y: d + (1 - l) / 2
                                            })),
                                            n.push(i.a.createElement("rect", {
                                                width: l,
                                                height: l,
                                                key: U++,
                                                fill: "#E02020",
                                                x: C + (1 - l) / 2,
                                                y: Q - 1 + (1 - l) / 2
                                            }))
                                        }
                                    }
                                    if (s[C][d] && g[C][d] && (
                                        0 === C || C > 0 && (!A.isDark(C - 1, d) || !g[C - 1][d])
                                    )) {
                                        for (var H = C, D = C, N = !0; N && D < t;) 
                                            A.isDark(D, d) && g[D][d]
                                                ? D++
                                                : N = !1;
                                        if (D - H > 1) {
                                            for (var q = H; q < D; q++) 
                                                g[q][d] = !1,
                                                s[q][d] = !1;
                                            n.push(i.a.createElement("rect", {
                                                width: D - H - (1 - l),
                                                height: l,
                                                key: U++,
                                                fill: "#F6B506",
                                                x: C + (1 - l) / 2,
                                                y: d + (1 - l) / 2
                                            }))
                                        }
                                    }
                                    s[C][d] && a.push(i.a.createElement("rect", {
                                        width: l,
                                        height: l,
                                        key: U++,
                                        fill: "#F6B506",
                                        x: C + (1 - l) / 2,
                                        y: d + (1 - l) / 2
                                    }))
                                }
                            for (var j = 0; j < K.length; j++) 
                        a.push(K[j]);
                    for (var X = 0; X < n.length; X++) 
                        a.push(n[X]);
                    return a
                },
                getParamInfo: function () {
                    return [
                        {
                            type: H,
                            key: "\u4fe1\u606f\u70b9\u7f29\u653e",
                            default: 70
                        }, {
                            type: H,
                            key: "x \u5bbd\u5ea6",
                            default: 70
                        }, {
                            type: H,
                            key: "\u5b9a\u4f4d\u70b9\u5bbd\u5ea6",
                            default: 90
                        }, {
                            type: D,
                            key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                            default: 1,
                            choices: ["\u77e9\u5f62", "DSJ"]
                        }
                    ]
                }
            });
            dA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u590d\u523b\u4e86 DSJ \u7684 ",
                    i.a.createElement(c, {
                        href: "https://qrbtf.com/img/dsj.jpg",
                        rel: "noopener noreferrer",
                        target: "_blank"
                    }, "\u624b\u5de5\u4f5c\u54c1"),
                    "\uff0c\u5411\u65f6\u4ee3\u81f4\u656c"
                );
            var CA = dA;
            var pA = gA({
                listPoints: function (e) {
                    var A = e.qrcode,
                        o = e.params;
                    if (e.icon, !A) 
                        return [];
                    for (
                        var t = A.getModuleCount(),
                        r = te(A),
                        a = [],
                        K = [],
                        n = [],
                        l = 0,
                        f = o[0],
                        c = o[1],
                        F = [],
                        U = [],
                        s = 0;
                        s < t;
                        s++
                    ) {
                        F[s] = [],
                        U[s] = [];
                        for (var g = 0; g < t; g++) 
                            F[s][g] = !0,
                            U[s][g] = !0
                    }
                    for (var u = 0; u < t; u++) 
                        for (var R = 0; R < t; R++) 
                            if (A.isDark(R, u) && r[R][u] === M) 
                                a.push(i.a.createElement("circle", {
                                    key: l++,
                                    fill: c,
                                    cx: R + .5,
                                    cy: u + .5,
                                    r: 1.5
                                })),
                                a.push(i.a.createElement("circle", {
                                    key: l++,
                                    fill: "none",
                                    strokeWidth: "1",
                                    stroke: c,
                                    cx: R + .5,
                                    cy: u + .5,
                                    r: 3
                                }));
                            else if (A.isDark(R, u) && r[R][u] === Z) 
                            ;
                            else {
                                if (F[R][u] && U[R][u] && R < t - 2 && u < t - 2) {
                                    for (var d = !0, C = 0; C < 3; C++) 
                                        for (var p = 0; p < 3; p++) 
                                            !1 === U[R + C][u + p] && (d = !1);
                                if (d && A.isDark(R + 1, u) && A.isDark(R + 1, u + 2) && A.isDark(R, u + 1) && A.isDark(
                                        R + 2,
                                        u + 1
                                    )) {
                                        K.push(i.a.createElement("circle", {
                                            key: l++,
                                            cx: R + 1 + .5,
                                            cy: u + 1 + .5,
                                            r: 1,
                                            fill: "#FFFFFF",
                                            stroke: f,
                                            strokeWidth: L(.33, .6)
                                        })),
                                        A.isDark(R + 1, u + 1) && K.push(i.a.createElement("circle", {
                                            r: .5 *L(.5, 1),
                                            key: l++,
                                            fill: f,
                                            cx: R + 1 + .5,
                                            cy: u + 1 + .5
                                        })),
                                        F[R + 1][u] = !1,
                                        F[R][u + 1] = !1,
                                        F[R + 2][u + 1] = !1,
                                        F[R + 1][u + 2] = !1;
                                        for (var v = 0; v < 3; v++) 
                                            for (var m = 0; m < 3; m++) 
                                                U[R + v][u + m] = !1
                                    }
                                }
                                if (R < t - 1 && u < t - 1 && A.isDark(R, u) && A.isDark(R + 1, u) && A.isDark(R, u + 1) && A.isDark(
                                    R + 1,
                                    u + 1
                                )) {
                                    K.push(i.a.createElement("circle", {
                                        key: l++,
                                        cx: R + 1,
                                        cy: u + 1,
                                        r: Math.sqrt(.5),
                                        fill: "#FFFFFF",
                                        stroke: f,
                                        strokeWidth: L(.33, .6)
                                    }));
                                    for (var h = 0; h < 2; h++) 
                                        for (var B = 0; B < 2; B++) 
                                            F[R + h][u + B] = !1,
                                            U[R + h][u + B] = !1
                                }
                                F[R][u] && u < t - 1 && A.isDark(R, u) && A.isDark(R, u + 1) && (
                                    a.push(i.a.createElement("circle", {
                                        key: l++,
                                        cx: R + .5,
                                        cy: u + 1,
                                        r: .5 *L(.95, 1.05),
                                        fill: "#FFFFFF",
                                        stroke: f,
                                        strokeWidth: L(.36, .4)
                                    })),
                                    F[R][u] = !1,
                                    F[R][u + 1] = !1
                                ),
                                F[R][u] && R < t - 1 && A.isDark(R, u) && A.isDark(R + 1, u) && (
                                    a.push(i.a.createElement("circle", {
                                        key: l++,
                                        cx: R + 1,
                                        cy: u + .5,
                                        r: .5 *L(.95, 1.05),
                                        fill: "#FFFFFF",
                                        stroke: f,
                                        strokeWidth: L(.36, .4)
                                    })),
                                    F[R][u] = !1,
                                    F[R + 1][u] = !1
                                ),
                                F[R][u] && (
                                    A.isDark(R, u)
                                        ? a.push(i.a.createElement("circle", {
                                            r: .5 *L(.5, 1),
                                            key: l++,
                                            fill: f,
                                            cx: R + .5,
                                            cy: u + .5
                                        }))
                                        : r[R][u] === z && L(0, 1) > .85 && n.push(i.a.createElement("circle", {
                                            r: .5 *L(.85, 1.3),
                                            key: l++,
                                            fill: "#FFFFFF",
                                            stroke: f,
                                            strokeWidth: L(.15, .33),
                                            cx: R + .5,
                                            cy: u + .5
                                        }))
                                )
                            }
                        for (var b = 0; b < K.length; b++) 
                        a.push(K[b]);
                    for (var y = 0; y < n.length; y++) 
                        a.push(n[y]);
                    return a
                },
                getParamInfo: function () {
                    return [
                        {
                            type: N,
                            key: "\u5706\u5708\u989c\u8272",
                            default: "#8ED1FC"
                        }, {
                            type: N,
                            key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                            default: "#0693E3"
                        }
                    ]
                }
            });
            pA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u5706\u5706\u5708\u5708\uff0c\u6c14\u6c14\u6ce1\u6ce1"
                );
            var vA = pA;
            var mA = gA({
                    listPoints: function (e) {
                        var A = e.qrcode;
                        if (e.params, e.icon, !A) 
                            return [];
                        for (var o = A.getModuleCount(), t = [], r = 0, a = [], K = 0; K < o; K++) 
                            for (var n = 0; n < o; n++) 
                                a.push([K, n]);
                    a.sort((function () {
                            return.5 - Math.random()
                        }));
                        for (var l = 0; l < a.length; l++) {
                            var f = a[l][0],
                                c = a[l][1];
                            if (A.isDark(f, c)) {
                                var F = L(.8, 1.3),
                                    U = L(50, 230),
                                    s = [
                                        "rgb(" + Math.floor(20 + U) + "," + Math.floor(170 - U / 2) + "," + Math.floor(
                                            60 + 2 * U
                                        ) + ")",
                                        "rgb(" + Math.floor(-20 + U) + "," + Math.floor(130 - U / 2) + "," + Math.floor(
                                            20 + 2 * U
                                        ) + ")"
                                    ];
                                t.push(i.a.createElement("rect", {
                                    key: r++,
                                    opacity: "0.9",
                                    fill: s[1],
                                    width: 1 *F + .15,
                                    height: 1 *F + .15,
                                    x: f - (F - 1) / 2,
                                    y: c - (F - 1) / 2
                                })),
                                t.push(i.a.createElement("rect", {
                                    key: r++,
                                    fill: s[0],
                                    width: 1 *F,
                                    height: 1 *F,
                                    x: f - (F - 1) / 2,
                                    y: c - (F - 1) / 2
                                }))
                            }
                        }
                        return t
                    },
                    getParamInfo: function () {
                        return []
                    }
                }),
                hA = mA;
            mA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u6709\u4e00\u70b9\u70b9\u9a9a\u7684\u914d\u8272\uff0c\u5f88\u9002\u5408\u4f60"
                );
            var BA = [
                    Math.sqrt(3) / 2,
                    .5
                ],
                bA = [
                    -Math.sqrt(3) / 2,
                    .5
                ],
                yA = [
                    0, 0
                ],
                kA = "matrix(" + String(BA[0]) + ", " + String(BA[1]) + ", " + String(bA[0]) +
                        ", " + String(bA[1]) + ", " + String(yA[0]) + ", " + String(yA[1]) + ")";
            var PA = gA({
                    listPoints: function (e) {
                        var A = e.qrcode,
                            o = e.params;
                        if (e.icon, !A) 
                            return [];
                        var t = A.getModuleCount(),
                            r = te(A),
                            a = new Array(t),
                            K = 1.001,
                            n = o[0],
                            l = o[1],
                            f = o[2],
                            c = o[3],
                            F = o[4],
                            U = 0;
                        n <= 0 && (n = 1),
                        l <= 0 && (l = 1);
                        for (var s = 0; s < t; s++) 
                            for (var g = 0; g < t; g++) 
                                !1 !== A.isDark(s, g) && (
                                    r[s][g] === Z || r[s][g] === M
                                        ? (a.push(i.a.createElement("rect", {
                                            width: 1.001,
                                            height: 1.001,
                                            key: U++,
                                            fill: f,
                                            x: s + (1 - 1.001) / 2,
                                            y: g + (1 - 1.001) / 2,
                                            transform: kA
                                        })), a.push(i.a.createElement("rect", {
                                            width: l,
                                            height: 1.001,
                                            key: U++,
                                            fill: c,
                                            x: 0,
                                            y: 0,
                                            transform: kA + "translate(" + String(s + (1 - 1.001) / 2 + 1.001) + "," + String(
                                                g + (1 - 1.001) / 2
                                            ) + ") skewY(45) "
                                        })), a.push(i.a.createElement("rect", {
                                            width: 1.001,
                                            height: l,
                                            key: U++,
                                            fill: F,
                                            x: 0,
                                            y: 0,
                                            transform: kA + "translate(" + String(s + (1 - 1.001) / 2) + "," + String(
                                                g + 1.001 + (1 - 1.001) / 2
                                            ) + ") skewX(45) "
                                        })))
                                        : (a.push(i.a.createElement("rect", {
                                            width: K,
                                            height: K,
                                            key: U++,
                                            fill: f,
                                            x: s + (1 - K) / 2,
                                            y: g + (1 - K) / 2,
                                            transform: kA
                                        })), a.push(i.a.createElement("rect", {
                                            width: n,
                                            height: K,
                                            key: U++,
                                            fill: c,
                                            x: 0,
                                            y: 0,
                                            transform: kA + "translate(" + String(s + (1 - K) / 2 + K) + "," + String(
                                                g + (1 - K) / 2
                                            ) + ") skewY(45) "
                                        })), a.push(i.a.createElement("rect", {
                                            width: K,
                                            height: n,
                                            key: U++,
                                            fill: F,
                                            x: 0,
                                            y: 0,
                                            transform: kA + "translate(" + String(s + (1 - K) / 2) + "," + String(
                                                g + K + (1 - K) / 2
                                            ) + ") skewX(45) "
                                        })))
                                );
                    return a
                    },
                    getParamInfo: function () {
                        return [
                            {
                                type: H,
                                key: "\u67f1\u4f53\u9ad8\u5ea6",
                                default: .5
                            }, {
                                type: H,
                                key: "\u5b9a\u4f4d\u70b9\u67f1\u4f53\u9ad8\u5ea6",
                                default: .5
                            }, {
                                type: N,
                                key: "\u4e0a\u4fa7\u989c\u8272",
                                default: "#FF7F89"
                            }, {
                                type: N,
                                key: "\u5de6\u4fa7\u989c\u8272",
                                default: "#FFD7D9"
                            }, {
                                type: N,
                                key: "\u53f3\u4fa7\u989c\u8272",
                                default: "#FFEBF3"
                            }
                        ]
                    },
                    getViewBox: function (e) {
                        if (!e) 
                            return "0 0 0 0";
                        var A = e.getModuleCount();
                        return String(-A) + " " + String(-A / 2) + " " + String(2 * A) + " " +
                                String(2 * A)
                    },
                    drawIcon: function (e) {
                        var A = e.qrcode,
                            o = e.icon,
                            t = e.params;
                        return 1 === W(o.enabled, 0)
                            ? function (e) {
                                var A = e.qrcode,
                                    o = (e.params, e.title, e.icon);
                                if (!A) 
                                    return [];
                                var t = 0,
                                    r = A.getModuleCount(),
                                    a = [],
                                    K = "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                            "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                            "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                            "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                            "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                            "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                            "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                            "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                            "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                            "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                            "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                            "11e-16 32.048565,-1.29480038e-15 Z";
                                if (o) {
                                    var n = W(o.enabled, 0),
                                        l = o.src,
                                        f = o.scale,
                                        c = Number(r * (
                                            f > 33
                                                ? 33
                                                : f
                                        ) / 100),
                                        F = (r - c) / 2;
                                    if (o && n) {
                                        var U = J(),
                                            s = J();
                                        a.push(i.a.createElement("g", {
                                            transform: kA
                                        }, i.a.createElement("path", {
                                            d: K,
                                            stroke: "#FFF",
                                            strokeWidth: 100 / c * 1,
                                            fill: "#FFF",
                                            transform: "translate(" + String(F) + "," + String(F) + ") scale(" + String(
                                                c / 100
                                            ) + "," + String(c / 100) + ")"
                                        }))),
                                        a.push(i.a.createElement("g", {
                                            key: t++,
                                            transform: kA
                                        }, i.a.createElement("defs", null, i.a.createElement("path", {
                                            id: "defs-path" + U,
                                            d: K,
                                            fill: "#FFF",
                                            transform: "translate(" + String(F) + "," + String(F) + ") scale(" + String(
                                                c / 100
                                            ) + "," + String(c / 100) + ")"
                                        }), "                    "), i.a.createElement("clipPath", {
                                            id: "clip-path" + s
                                        }, i.a.createElement("use", {
                                            xlinkHref: "#defs-path" + U,
                                            overflow: "visible"
                                        })), i.a.createElement("g", {
                                            clipPath: "url(#clip-path" + s + ")"
                                        }, i.a.createElement("image", {
                                            overflow: "visible",
                                            key: t++,
                                            xlinkHref: l,
                                            width: c,
                                            x: F,
                                            y: F
                                        }))))
                                    }
                                }
                                return a
                            }({qrcode: A, icon: o, params: t})
                            : function (e) {
                                var A = e.qrcode,
                                    o = (e.params, e.title, e.icon);
                                if (!A) 
                                    return [];
                                var t = 0,
                                    r = A.getModuleCount(),
                                    a = [],
                                    K = "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                            "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                            "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                            "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                            "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                            "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                            "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                            "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                            "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                            "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                            "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                            "11e-16 32.048565,-1.29480038e-15 Z";
                                if (o) {
                                    var n = W(o.enabled, 0),
                                        l = (o.src, o.scale),
                                        f = Number(r * (
                                            l > 33
                                                ? 33
                                                : l
                                        ) / 100),
                                        c = (r - f) / 2,
                                        F = i
                                            .a
                                            .createElement("g", null, i.a.createElement("rect", {
                                                width: "100",
                                                height: "100",
                                                fill: "#07c160"
                                            }), i.a.createElement("path", {
                                                d: "M39.061,44.018a4.375,4.375,0,1,1,4.374-4.375,4.375,4.375,0,0,1-4.374,4.375m21." +
                                                        "877,0a4.375,4.375,0,1,1,4.376-4.375,4.375,4.375,0,0,1-4.376,4.375M28.522,69.06" +
                                                        "3a2.184,2.184,0,0,1,.92,1.782,2.581,2.581,0,0,1-.116.7c-.552,2.06-1.437,5.361-" +
                                                        "1.478,5.516a3.237,3.237,0,0,0-.177.8,1.093,1.093,0,0,0,1.094,1.093,1.243,1.243" +
                                                        ",0,0,0,.633-.2L36.581,74.6a3.427,3.427,0,0,1,1.742-.5,3.3,3.3,0,0,1,.965.144A3" +
                                                        "8.825,38.825,0,0,0,50,75.739c18.123,0,32.816-12.242,32.816-27.346S68.122,21.04" +
                                                        "9,50,21.049,17.185,33.29,17.185,48.393c0,8.239,4.42,15.656,11.337,20.67",
                                                fill: "#fff"
                                            })),
                                        U = i
                                            .a
                                            .createElement(
                                                "g",
                                                null,
                                                i.a.createElement("rect", {
                                                    width: "100",
                                                    height: "100",
                                                    fill: "#07c160"
                                                }),
                                                i.a.createElement("path", {
                                                    d: "M48.766,39.21a2.941,2.941,0,1,1,2.918-2.94,2.929,2.929,0,0,1-2.918,2.94m-16.45" +
                                                            "5,0a2.941,2.941,0,1,1,2.918-2.941,2.93,2.93,0,0,1-2.918,2.941m8.227-17.039c-13" +
                                                            ".632,0-24.682,9.282-24.682,20.732,0,6.247,3.324,11.87,8.528,15.67a1.662,1.662," +
                                                            "0,0,1,.691,1.352,1.984,1.984,0,0,1-.087.528c-.415,1.563-1.081,4.064-1.112,4.18" +
                                                            "1a2.449,2.449,0,0,0-.132.607.825.825,0,0,0,.823.828.914.914,0,0,0,.474-.154l5." +
                                                            "405-3.144a2.57,2.57,0,0,1,1.31-.382,2.442,2.442,0,0,1,.725.109,28.976,28.976,0" +
                                                            ",0,0,8.057,1.137c.455,0,.907-.012,1.356-.032a16.084,16.084,0,0,1-.829-5.082c0-" +
                                                            "10.442,10.078-18.908,22.511-18.908.45,0,.565.015,1.008.037-1.858-9.9-11.732-17" +
                                                            ".479-24.046-17.479",
                                                    fill: "#fff"
                                                }),
                                                i.a.createElement("path", {
                                                    d: "M70.432,55.582A2.589,2.589,0,1,1,73,52.994a2.578,2.578,0,0,1-2.568,2.588m-13.7" +
                                                            "13,0a2.589,2.589,0,1,1,2.568-2.588,2.578,2.578,0,0,1-2.568,2.588m20.319,16a16." +
                                                            "3,16.3,0,0,0,7.106-13.058c0-9.542-9.208-17.276-20.568-17.276s-20.57,7.734-20.5" +
                                                            "7,17.276S52.216,75.8,63.576,75.8a24.161,24.161,0,0,0,6.714-.947,2.079,2.079,0," +
                                                            "0,1,.6-.091,2.138,2.138,0,0,1,1.092.319l4.5,2.62a.78.78,0,0,0,.4.129.688.688,0" +
                                                            ",0,0,.685-.691,2.081,2.081,0,0,0-.11-.5l-.927-3.486a1.641,1.641,0,0,1-.073-.44" +
                                                            ",1.385,1.385,0,0,1,.577-1.126",
                                                    fill: "#fff"
                                                })
                                            ),
                                        s = i
                                            .a
                                            .createElement("g", null, i.a.createElement("rect", {
                                                width: "100",
                                                height: "100",
                                                fill: "#07c160"
                                            }), i.a.createElement("path", {
                                                d: "M41.055,57.675a2.183,2.183,0,0,1-2.893-.883l-.143-.314L32.046,43.37a1.133,1.13" +
                                                        "3,0,0,1-.105-.461,1.094,1.094,0,0,1,1.748-.877l7.049,5.019a3.249,3.249,0,0,0,2" +
                                                        ".914.333L76.8,32.63c-5.942-7-15.728-11.581-26.8-11.581-18.122,0-32.813,12.243-" +
                                                        "32.813,27.345,0,8.24,4.42,15.656,11.338,20.669a2.185,2.185,0,0,1,.919,1.781,2." +
                                                        "569,2.569,0,0,1-.116.7c-.552,2.062-1.437,5.362-1.478,5.516a3.212,3.212,0,0,0-." +
                                                        "177.8,1.094,1.094,0,0,0,1.1,1.094,1.236,1.236,0,0,0,.631-.2L36.583,74.6a3.438," +
                                                        "3.438,0,0,1,1.742-.5,3.281,3.281,0,0,1,.965.145A38.844,38.844,0,0,0,50,75.739c" +
                                                        "18.122,0,32.813-12.243,32.813-27.345a23.668,23.668,0,0,0-3.738-12.671L41.3,57." +
                                                        "537Z",
                                                fill: "#fff"
                                            })),
                                        g = i
                                            .a
                                            .createElement("g", null, i.a.createElement("rect", {
                                                width: "100",
                                                height: "100",
                                                fill: "#009ce1"
                                            }), i.a.createElement("path", {
                                                d: "M100,67.856c-.761-.1-4.8-.8-17.574-5.066-4.012-1.339-9.4-3.389-15.395-5.552A80" +
                                                        ".552,80.552,0,0,0,75.4,36.156H55.633v-7.1H79.848V25.094H55.633V13.258H45.749a1" +
                                                        ".68,1.68,0,0,0-1.733,1.707V25.094H19.524v3.963H44.016v7.1H23.8V40.12H63.013a69" +
                                                        ".579,69.579,0,0,1-5.65,13.763c-12.724-4.187-26.3-7.58-34.834-5.491C17.074,49.7" +
                                                        "33,13.56,52.125,11.5,54.63,2.02,66.125,8.815,83.585,28.824,83.585c11.831,0,23." +
                                                        "228-6.579,32.061-17.417C73.49,72.211,97.914,82.4,100,83.267ZM26.956,76.9c-15.6" +
                                                        ",0-20.215-12.255-12.5-18.958,2.573-2.266,7.276-3.372,9.782-3.621,9.268-.913,17" +
                                                        ".846,2.613,27.972,7.541C45.087,71.118,36.023,76.9,26.956,76.9Z",
                                                fill: "#fff"
                                            }));
                                    if (o && n) {
                                        var u = J(),
                                            R = J();
                                        a.push(i.a.createElement("g", {
                                            transform: kA
                                        }, i.a.createElement("path", {
                                            d: K,
                                            stroke: "#FFF",
                                            strokeWidth: 100 / f * 1,
                                            fill: "#FFF",
                                            transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                                f / 100
                                            ) + "," + String(f / 100) + ")"
                                        }))),
                                        a.push(i.a.createElement("g", {
                                            key: t++,
                                            transform: kA
                                        }, i.a.createElement("defs", null, i.a.createElement("path", {
                                            id: "defs-path" + u,
                                            d: K,
                                            fill: "#FFF",
                                            transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                                f / 100
                                            ) + "," + String(f / 100) + ")"
                                        }), "                    "), i.a.createElement("clipPath", {
                                            id: "clip-path" + R
                                        }, i.a.createElement("use", {
                                            xlinkHref: "#defs-path" + u,
                                            overflow: "visible"
                                        })), i.a.createElement("g", {
                                            clipPath: "url(#clip-path" + R + ")"
                                        }, i.a.createElement(
                                            "g",
                                            {
                                                transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                                    f / 100
                                                ) + "," + String(f / 100) + ")"
                                            },
                                            2 === n
                                                ? F
                                                : 3 === n
                                                    ? U
                                                    : 4 === n
                                                        ? s
                                                        : 5 === n
                                                            ? g
                                                            : void 0
                                        ))))
                                    }
                                }
                                return a
                            }({qrcode: A, icon: o, params: t})
                    }
                }),
                EA = PA;
            PA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u901a\u5411\u4e09\u7ef4\u7684\u534a\u8def\u3002\u53ef\u80fd\u6709\u4e00\u70b9" +
                            "\u70b9\u96be\u4ee5\u8bc6\u522b"
                );
            var wA = "https://qrbtf.com",
                QA = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYd" +
                        "pAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAEOKADAAQAAAABAAAEOAAAAAD/w" +
                        "AARCAQ4BDgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgE" +
                        "DAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJ" +
                        "icoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5i" +
                        "ZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/" +
                        "8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxE" +
                        "EBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHS" +
                        "ElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba" +
                        "3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwACAgICAgIDAgIDBQMDA" +
                        "wUGBQUFBQYIBgYGBgYICggICAgICAoKCgoKCgoKDAwMDAwMDg4ODg4PDw8PDw8PDw8P/9sAQwECAgI" +
                        "EBAQHBAQHEAsJCxAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE" +
                        "BAQ/90ABABE/9oADAMBAAIRAxEAPwD9IKESiigAooooAKKKKACiiigAoRKKKACiiigAooooAKKKKAC" +
                        "hEoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKESiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooA//Q/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//R/SCiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//S/SCiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooA//T/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "//U/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//V/SCiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooA//W/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooA//X/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Q/SCiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//R/SCiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooA//S/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKK0rPSrm8f5E+T+/XVJ4YtvJ2O/7+gDg6K1b/R7mzf503p/frKoAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/0/0gooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAop6I8z7E+d66fTfDE03768+RP7lAHNw21zcvstk3122m+G4Yf31587/" +
                        "3K6G2tobZNlsmyrdAESQpCmxE2VLRRQBE6JMmx031yupeG4Zv31t8j/3K6+igDyC5s5rZ9kybKrV7B" +
                        "NbW1ynkzJvrjNS8MPD++s/nT+5QByVFPmheF9kybHplABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABR" +
                        "RRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFA" +
                        "BRRRQAUUUUAf//U/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoorSs9Nubx9lsn/A6AM" +
                        "2tuw0G5vPnf5IK6rTfD1tbfPc/PPXR0AZdno9nYJ+5T9//frUoooAKKKKACiiigAooooAKKKKAMi80" +
                        "q2v02TJ8/8AfrjNS0G5s/nT50r0qovv0AeOUV6Lf6DbXnzw/uHrjLzSrmwf98nyf36AM2iiigAoooo" +
                        "AKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoo" +
                        "ooAKKKKACiiigAooooAKKKKACiiigD/1f0gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiijY7/IlABU1" +
                        "tbTTP5Nsm963tN8NzXP765/cJ/wCP13NtYW1mnkwpsoA5XTfDGz99f/P/ALFdbDbJCmyFNiVYooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACmvDDMmyZN6U9Emd9iJvd67DTfDDzfvr/wCRP7n8dAH" +
                        "ktz4MfUpv+JUnz/3K4y/sLnTrh7O/TyZk++lfXSfYNNh8m2RE/wBhK+cviFM83iR3f+4lAHDUUUUAF" +
                        "FFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUU" +
                        "AFFFFABRRRQAUUUUAFFFFABRRRQB//9b9IKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACirNtYXN4+yFN9dzpvh" +
                        "u2tv31z+/f/AMcoA5Kw0e8v33omxP7713lho9nYfcTfP/fetJPkTYlS0AFFFFABRRRQAUUUUAFFFFA" +
                        "BRRRQAUUUUAN/2KdRRQAUUVdsNNvNSfZbJ8n8b/wUAUq29N8P31987/JD/feuo07w9Y6b++uf38399" +
                        "/uVtTX/APBD/wB90AV7PTdO0pMp9/8Avv8Afpk15NN8kP7tKrO7v87/AH6SgArwbx//AMjFN/uJXvN" +
                        "eEePv+Q8/+4lAHDUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQ" +
                        "AUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//1/0gooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAqOpKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoorodN8" +
                        "N3Nz++m/cQ/8Aj9AGDDDNcv5MKb3rsNN8Kv8A66//AO+K6ez022sE2Qp/wP8Ajq9QBFDbQ20Pk2ybE" +
                        "qWiigAooooAKKKKACiiigAooooAKKKKACiiigAoopvzv9ygB1SQwzTTeTCju7/wV0Om+GLm52PefuE" +
                        "/8feuwtobPTYfJtk/+L/4HQBgab4YRP32ov8A8AX/ANnrpBNDCnk2yJ8n937lUZrmab7/ANz+5UdAC" +
                        "u7u++Z99JRRQAUUUUAFeDeP/wDkYpv9xK95rwLx5/yHX/3EoA4yiiigAooooAKKKKACiiigAooooAK" +
                        "KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoooo" +
                        "AKKKKAP/9D9IKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKmhtrm8fybZN9AENaVho95fv+5TYn9966rTfDFtD++vP37/3P4K6dERE2J8l" +
                        "AGVpuiWdh8+zz5/771tUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRVqzsLm/m2Wyb/8A2" +
                        "Su1sPDdnZp51+/nv/44lAHJ6bot/qT70Ty4P7713dtpWnaUnnfff++/3/8AgFXZr/5P9GrKd3d97vv" +
                        "oAuTXk03yQ/u0qt89JRQAUUUUAFFL/uUlABRRRQAV4R4+/wCQ8/8AuJXvH+/Xgnjz/kPf8AoA4miii" +
                        "gAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACi" +
                        "iigAooooAKKKKACiiigAooooAKKKKAP/R/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA" +
                        "KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKeiPM+xPnd629N0G8vPnf8AcQf33rubDSrawT/Rk+f++" +
                        "/36AOV03wrNN++v/kg/ufx12cMMNtD5MKIif7FWKKACiiigAooooAKKKKACiiigAooooAKKKKACiii" +
                        "gAoore07w/eXJ82b9zB/t/ff/AIBQBz8MM0zpDEju7/wJXa6b4Yd/32ovsT/nin/s9dFDbabpSbIU+" +
                        "f8A8fpk00033/kT+5QBMJrazg8mzjTYn937lU5neb53eo6KACiil+SgBKKKKACiiigAooooAKKX+Ck" +
                        "oAK8C+IH/ACHX/wByvfa8F8ef8h7/AIBQBxNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQA" +
                        "UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/0v0gooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoqaGG5uZvJtk3vX" +
                        "bab4YhT99fvvf+4n3KAOSsNKvNSf/AEZPk/v/AMFdzpvh62s/3037+f8AvvW2iJCiQomxEqWgAoooo" +
                        "AKKKKACiiigAooooAKKKKACiiigAooooAKKKnhtprybZbI7v/sUAQVd03Sr/Un/ANGT5P77/crrdN8" +
                        "Kww/vtSfe/wDc/grb+2IibLNNiJQBn2Gg2Glfvpv38/8Aff8A9kSrs15NN8kP7tKrO7zPvf56SgAop" +
                        "fuUlABRRRQAUUUUAFFFFABRRRQAUv8Av0lFABRRRQAV4L48/wCQ9/wCveq8F8ef8h7/AIBQBxNFFFA" +
                        "BRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFF" +
                        "FABRRRQAUUUUAFFFFABRRRQAUUUUAf/0/0gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKAGO6Im966rTfDc1zsmvH8iB/n2J996868Q/JpUm9N+x0/8AQ6oeHvGepaO/k2z" +
                        "+fB/z7zfc/wCAUAfRVtZ21nD5NsmxKt1zOieLdK1vZDC/kXX/ADyf/wBk/v101ABRRRQAUUUUAFFFF" +
                        "ABRRRQAUUUUAFFFFABRRRQAUqI7vsT53ra03Qb6/wBjbPIh/vv/AOyV2lnpum6Un7lN7/33+/QBzGm" +
                        "+FXuf32o/In9z+P8A+wrrIXsLBPJsESoZruab/YT+5UNAEjzO/wA8z1HRRQAUUUUAFFFFAColJRRQA" +
                        "vyUlFFABS/JSUUAFFFFABRRRQAUUUUAFeC+PP8AkPf8Ar3qvAvHn/IbkoA4yiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKAP//U/SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooA5/xJ/yB5v8AgH/odeZ16Z4k/wCQPN/wD/0OvL6ANC2v5ofv/P8A+h16j4e+It5Z7Ib/AP0qD+/" +
                        "/AMtk/wDi68ipiO6fOlAH2BpWsabrFt51hMk399P40/30rXr5DsNYubOaC5hneCdP40r2PQfiQk2y2" +
                        "1tP+3iH/wBnSgD1miq9tcw3MKXNs6TwP9x0qxQAUUUUAFFFFABRRRQAUVJDDLM/k2yO7v8AwJXYWHh" +
                        "jZ++1V/8AgCf+zvQBzFhpt5qL7LdN/wDt/wAFdrYeHrCwTzrx/Pf/AMc/74rWeZLZPJs0RESqG93fe" +
                        "776ALk1+7/InyJVKiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKX5KP46SgAooooAX56Sii" +
                        "gArwLxz/yHH/3K99rwLxz/wAhx/8AcoA4yiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//V/SCiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA5/xJ/yB5v8AgH/odeX16h4" +
                        "k/wCQPN/wD/0OvL6ACiiigAqSGZ4fnSio6AOr0HxVf6PNvs5vI/vo/wA6PXuWg+PNN1XZbXn+i3X+3" +
                        "9x/9x6+ZqmhvHh/20oA+zqK+cPD3jzUtK2Qo/2q1/54zfwf7j17Zo/ifStbT/Rn2T/xwv8AfoA6Oii" +
                        "tbTdHvNS+dE2J/ff7lAGTXRab4bvLzY95+4g/8feums9K03Sk3/fm/vv9/wD+wqea8mm/2EoAlhS20" +
                        "qH7NZx/P/n771Xmlmm++9R0UAFFFFABRRRQAUUUUAFFFFABRRRQAUUqUlABRS/7FJQAUUUUAFFFFAB" +
                        "RRRQAUUUUAFFFFABXgXjz/kNyV77XgXjz/kNyUAcZRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQA" +
                        "UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9b" +
                        "9IKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACo6kooAKKKKACiiigAooooAKKKKACiiigAooooA57xL/yB5/8AgFe" +
                        "YV6f4l/5A8/8AwCvMKACipKjoAKKKKAJKjqSo6AJKuW1/NC6P/c/jT76VTooA+tvhNqtvqtt/xPbpJ" +
                        "7p/9Sj/AH9iff3/AN+vdprx/uQ/IlfJfwl/5Cul/wDbb/0B6+pKAF/36SiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKbs9qAHUUUUAFFFFABRRRQAUuykooAKKKKACvAvHn/Ibkr32vAvHn/IY" +
                        "egDjKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooA//X/SCiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooA57xL/yB5/8AgFeYV6h4k/5A83/AP/Q68voAKKKKACiiigAqSo6KA" +
                        "JKKjooA98+Ev/IV0v8A7bf+gPX1JXy58Iv+Qrpf+5N/6A9fUdABRRRQAUUUr0AJRS/JSUAFFFFABRR" +
                        "RQAUUUUAFFFFABRS/JSUAFFFK9ACUUUUAFFFFABRRRQAUUUUAFFFL8lACV4F48/5DD177XgXjz/kMP" +
                        "QBxlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQA" +
                        "UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//Q/SCiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooA5/xJ/yB5v8AgH/odeX16f4l/wCQPP8A8ArzCgAooooAKKKKACipK" +
                        "KAI6KkqOgD334Rf8hXS/wDcm/8AQHr6jr5f+EX/ACEtL/3Jv/QHr6goAKKKKACiiigAooooAX/cpKK" +
                        "KACiiigApfno+/SUAFFFFABRRRQAUUUUAFFKlJQAUUUUAFFFFABRRRQAUUUUAFeBePP8AkMPXvteC+" +
                        "PP+QxQBxNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAB" +
                        "RRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/R/SCiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACo6kooAKKKKACiiigAooqOgCSiiig" +
                        "AooooAKKKKACio6koAKKKKACiiigAooooA57xL/yB5/8AgFeYV6f4l/5A8/8AwCvMKACpKjooAKkqO" +
                        "igAqSiigCOpKKKAPePhF/yEtL/7bf8AoD19SV8t/CX/AJCul/8Abb/0B6+pKACil/3KSgAooooAKKK" +
                        "X/boASiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKX/YpKKAF30lFFABRRRQAV4N45/5Ct" +
                        "e814F45/wCQwKAOMooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiii" +
                        "gAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//S/SCiiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiio6AJKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACo6kooAKKKKACiiigDnvEv/IHn/wCAV5hXp/iX/kDz/wDAK8woAKKko" +
                        "oAKKjooAkqOpKjoAKkoooA94+Ev/IV0v/tt/wCgPX1JXy38Jf8AkK6X/wBtv/QHr6koAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigApfuUlFABRRRQAUUUUAFFFFABRRRQAUUUUAFeDeOf+QrXv" +
                        "NeDeOf+QrQBxFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFF" +
                        "FFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/T/SCiiigAooooAKKjqSgAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACo6kooAKKKKACiiigAooooAKKKKAC" +
                        "iiigCOpKKKACiiigAooooAjqSiigAqOpKKACiiigDnvEv/IHn/wCAV5hXp/iX/kDz/wDAK8woAKKKK" +
                        "ACpKKKACiiigAooooA94+Ev/IV0v/tt/wCgPX1JXy38Iv8AkJaX/wBtv/QHr6koAKKKKACiiigAooo" +
                        "oAKKKKAF/gpKKKAClekooAKKKKACiiigBfv0fwUlL89ACUUUUAL/t0bKSigAooooAKKKKAF/3KSiig" +
                        "Arwbxz/AMhWvZb/AFK2sEd7l68E8T6rDqt+80P3KAOeooooAKKKKACiiigAooooAKKKKACiiigAooo" +
                        "oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/" +
                        "9T9HKKKKACiiigAooooAKKKKACiiigAooooAKKKKAJKjoooAkoqOigCSio6KAJKKKKACiiigAooqOg" +
                        "CSiiigAooooAjqSiigAooooAKKjqSgCOpKKKACiiigAooooAjoqSigAooqOgCSiio6AJKjqSigAqOi" +
                        "igDC8S/8gef/gFeYV6f4l/5A8//AACvMKACpKKKACiiigAooooAKKKKAPefhF/yFdL/ANyb/wBAevq" +
                        "OvmH4Rf8AIV0v/cm/9Aevp6gBd9JRRQAUUUUAFFFFABRRRQAUvyUlFABRRS/7FACUv+5SUUAFFFFAB" +
                        "RRRQAUUUUAFFFFABRRRQAv+xSUruiJveuM1jxhYaajoj73oA6qaaG2h3zPsrz3W/HkNt+5sPnnrzrW" +
                        "PE+paq/zvsSueoA0r/VbzUn3zPWbRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRR" +
                        "QAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9X9HKKjqOg" +
                        "CxRVeigCSio6KAJKKjooAkoqOjfQBJRUe+jfQBZ30lV6N9AFiiq9SUASUVHRQBLvpKjooAkopd9JQB" +
                        "JRUdFAElFR0UAFSVHUlABRRRQBHUlFFABRRUdAElFFFABRUdSUAFFFR0ASVHUlFAEdFFFABRRUlABU" +
                        "dSVHQAUVJUdAElFR0UAYvif8A5BU//AK8tr0/xJ/yCp68woAkooooAKKKKACiiigAooooA9++EX/IV" +
                        "07/ALbf+gPX09Xy98JP+Qpp/wDuTf8AoD19Q0AFFL/t0lABRSpSUAFFFFABRRRQAUUUUAFFL/BSUAF" +
                        "FFFABRRRQAUUUUAFFFFABRRVS81K2sE33L7KALdc/qviGw0pP3z/P/crgNe8eO++203/vuvNJrm5uX" +
                        "86Z98lAHYa342vNSfybb5IK4x3eZ97/ADvTKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoo" +
                        "ooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA" +
                        "ooooA//1v0Uoopm+gB9FR0UASUVHRQBJTN9Rb6N9AFimb6i30b6ALFFV99G+gCXfT6r76N9AFiiq++" +
                        "jfQBYoqvvp2/3oAmo31Dv96N/vQBNRvpm+jfQBPRUG+n0AWd9G+q1G+gCxRUdFAElFFLvoAfRTN9JQ" +
                        "AVJRRQAUVHRQAVJRRQBHUlFR0ASVHRUlAEdFSVHQAUVJRQAUVHRQAUUVJQBHRRRQBheIf8AkDzV5hX" +
                        "p/iT/AJBU9eYUASUUUUAFFFSUAR0VJRQBHRUlFAHu/wAJP+Qpp/8AuTf+gPX1DXyz8KP+Qrp//bb/A" +
                        "NAevqagAooooAKKKKACiiigAooooAKKKKACiiigBfkpKKKACiiigAoopX+SgBKrzTJCm+b5Erm9Y8W" +
                        "6bpSbN/nz/wByvH9Y8T6lqr/PJsg/uJQB6Rrfjy2tt8Nh8715RqWq3+qvvuX/AOAVlUUAFFFFABRRR" +
                        "QAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABR" +
                        "RRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//1/0Mo31V3+9TUASb6g30zf70b/egB" +
                        "++jfTN/vTd9ADt/vRv96bvo30AO3+9G/wB6hooAm3+9G/3qGigCbf70b/eoaKAJt/vRv96hooAm3+9" +
                        "G/wB6hooAm3+9P31WooAs76N9Vqk30AXN9G+qe+nb/egC5v8Aejf71T3+9G/3oAv76fVDfRvoAv76N" +
                        "9V99O3+9AFqpKqb6fQBZ30lV99SUASUUu+jfQAlFFFABRRRQAUUUUAFFFFABRRRQBJUdFFABUlR0UA" +
                        "FFFFAGF4h/wCQPNXllep+Jv8AkDz15QlAFipKjqSgAqSo6koAKKkqSgCOipKKAPb/AIU/8hXTv+23/" +
                        "oD19Q18w/Cj5NV07/cm/wDQHr6eoAKKKKACil/2KSgAooooAKVKSigAooooAKKKKACiiigAoqjc3lt" +
                        "Zw+dcvsRK80174hffttK/77oA9C1XW7DTYd9y/wDwCvH9b8c3l/vhs/3EFcZc3lzeTedcvveqtAE7u" +
                        "8z73fe9MoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9D9A" +
                        "N9R0UzfQA+imb6N9AD6KZvpm/3oAfvo30zf70b/AHoAfvo30zf703fQBLvo31FvqDfQBc30zf71W30" +
                        "b6ALO/wB6N/vVbfRvoAs7/ejf71W31FvoAvb/AHp++qe+jfQBc30b6zt9S76ALm+jfVPfRvoAub6fV" +
                        "ffTt/vQBNUm+qu/3o3+9AFrfTt/vVbfRvoAub6n31n1JvoAvb/en76ob/ejf70AaVG+qG+p99AFypd" +
                        "9U99G+gC5vo31W31JQBJRS76N9ACUUUUAFFFSUAR0UUUAFSVHRQAUUUUAc/4q/wCQPNXkqPXq/i35N" +
                        "Enrx9HoAubKspWaj1ZR6AL9SVVR6mR6ALKU+mI9PoAKKkooA9u+Ff8AyGNO/wByb/0B6+nq+XvhX/y" +
                        "GNO/7ea+oaAJKjoooAKX/AG6SigAopXpKACiiigAooooAKKK5nWPFWlaOjo775/7iUAdI7pCm+Z9iJ" +
                        "XB6345s7DfDZ/v56831vxhqWqvs3+RB/cSuVoA1dV1u/wBVm865n/4BWVUdSUAFFR0UAFSVHRQAUVJ" +
                        "RQBHUlFR0ASUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUU" +
                        "UAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//0fvbf70b/em76g3" +
                        "0AWd/vTd9U99G+gC5vqDfUW+o99AEzvTd9V6KALG+jfVeo99AFjfRvqvvo30ASUVHvo30ASUVU30b6" +
                        "ALdFVN9G+gC3RVHf70b/egC9RVHf70b/egC9RVHf70/fQBbqTzXqhvo84UAX/NepPONU/ONG+gC55x" +
                        "qXfVBJqPOoA1t9O86smpPNegDV30b6zvONS76AL9Sb6p+cadv96ALm/3o3+9U/tPvT0moA099O3+9U" +
                        "d9O86gC/vp9Zu/3p/nCgC/vqSqe+pd9AFzfSVXo30AWKKjqXfQAlFFFABRRRQBzPjN9mgz14ak1e8e" +
                        "KrO5v9EntrNN718zX9zc2Ez21yjwOn9+gDp0uU61ZS5rjEv8AfV+G830AdbDNVyF65uG5rYhmoA3Eq" +
                        "xWbC9X0egCdKkqNKkoA9n+FH/IVsv8Acmr6hr5i+F//ACGNO/4HX07QAUUUUAFFL9ykoAKKKKACiiq" +
                        "800NtC80zokaf36ALFZ2parZ6bC815Mif7Fee698QoYd9tpSb3/v15XeX9zfzfabl3d6AO517x/c3m" +
                        "+2039xB/f8A464CaZ5n3zPveoKKACiiigAooooAkqOiigAooqSgAoqOpKACo6KkoAKjqSo6AJKKKKA" +
                        "CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK" +
                        "KACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//S+6N9R76jqPfQBJRUe+jfQBJUe+oN9M3+9AF" +
                        "rfRvqnvqDfQBc30zf71W30b6ALO/3pu+oN9RUAS76N9Vt9M30AXN9G+qe+jfQBc30b6ob/ej7T70AW" +
                        "vtElFU99G+gC59oko+0SVT31B5woA0/tElH2iSszzhR5woA0/tElO86srzhU++gC951P31nb6d9p96" +
                        "AL/nCp/ONZnnCjfQBq/afen+cKx99T/aJKANjzjTvOrH86n76ANPfVjzXrL84077T70Aa3nGpd9Z3n" +
                        "GnedQBqpNT/ADqykekoA1vtPvU2+svzjUqTUAavnUb/AHqgk1CTUAaW+pkes3fU++gDR30+s3zqfvo" +
                        "A06l31nb6ydV8Q2elQ75n3v8A3EoA6R3RE3vXnXif4kaVo++2s/8ASrr/AGPuV5X4n8Ya9rO+FP8AR" +
                        "bX+4ledOj/x0Adt/wALI8Tpf/b/AD/k/wCeP8Fd/Z+JPB/jyH7BrCJa3X9+vAnqq6UAeqeJPh7rGib" +
                        "7yw/02y/2Pv1wcN5sfY/yPXT+GPiRreg7La8/02y/uP8Afr0t9N8E/EK2+06a6Wt7/wCP0AeXW15W9" +
                        "bXlc3rfhXXvDE3+mQeZB/BMn3KrWepUAekW1zWwj1xNneb66S2moA3kqxVGF6tJQB7d8Kv+QxZf8Dr" +
                        "6er5h+FX/ACGLL/gdfT1ABRRRQAUUUUAFLv8Ak3v9yue1XxJpWlJ++fe/9xPv14/rfjbVdV3wwv5Fr" +
                        "/cSgD0vXvG2m6Vvhtv391/sfcrxzVfEOpaxNvuZ/k/ufwVh0UAFFFFABRRRQAUUUUAFFFFABRRRQAU" +
                        "VJUdABUlR0UASVHRRQBJUdSUUAR0UUUASUUVHQBJRUdSUAFFFFABRRRQAVHUlFABRRRQAUUUUAFFFF" +
                        "ABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/" +
                        "T+3N9Qb6Zv96rb6ALO/3pu+oN9Qu9AE2+h3qtvooAkqPfTN9Rb6AJd9G+qe+mb/egC5v96bvqrv8Ae" +
                        "m76AJd9M86oaZ5rUAWd/vR51U9/vRv96ALW+o99V/ONQb6AL++mecKp76N9AFzzhR5rVnecaPONAGj" +
                        "5rUea1Z3nGjzjQBo+a1HmtWd5xo840AaPnCjzhWd5xqXfQBf31JvrM30b6ANXzqPOqnv96N/vQBrb6" +
                        "d9p96x9/vT/ADhQBsecKN9ZW+npNQBs/aJKck1Y/nU/zhQBsecKs/afesdJqmR6ANhJqmSasRJqek1" +
                        "AG2j09JqxPOFWUmoA1vONXPONZKTVNbJNczJDbJvd/wCBKAL6TVch3zfcrpNK8GXLp52pfJ/sV1qaJ" +
                        "DCmyFKAPK7m2vHTZD8lclc+Hnmd3f79e6vo+/8AgqnNon+xQB85XPht/wC5XN3nhj/Yr6im0H/YrKu" +
                        "fDe/76UAfJ154bmT7iVg3Om3MP8FfWlz4V3/wVzdz4M37/koA+V5rZ0+/UMM1zZzJc2cjwOn8aV79f" +
                        "+Bt+/YlcTf+CblPuJQBseG/i1MkP2DxVB59r9zzf/i66TUvAGieJLb+1fB90iO/z+T/AAV4zeeHr+2" +
                        "/gqtpupax4euftNhM8D/+OUAdJc22paDc/Y9SgeB/9v7lbdhfo+yuq0f4kaD4ntk0rxhaojv8nnfwV" +
                        "W1j4e3lmn2/wxN9qtX+fZ/H/wAAoAv2cyPWqj1wFhfvDN5Nymx0/geu2tpt6UAe9/Cv/kK2P+49fT1" +
                        "fL3wr/wCQrZP/ALD19Q0AFFRTTQ20LzTPsRP79eda98QobbfDpSee/wDz2/goA7y/1Kz02HzrydIEr" +
                        "yXXviFNc77bR4/IT/nt/HXB3+pXmpTedeTvO9Z9AE8001y7zTPvd/43qCiigAooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigCSo6KKACiiigAqSo6KACpKjqSgCOiipKAI6koooAKKKKACiiigAqOpKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKAP/1PsnfUVR76KADfTN9M3+9Vt9AFnf71W3093qs70AP3+9G/3qGmO9AD6Zvqs71JvoA" +
                        "dv96hd6ZvqF3oAsu9M31W31X30AXPONHnGqe+o3egC5vpm+qDvTfONAF7zqPOqjvqDzhQBp+caPONZ" +
                        "m+medQBf84UecKoedT99AFzzhR5wqh51P30AafnGnedWVvo84UAavnUedWV5wqffQBo76N9Z2+jzjQ" +
                        "Bqb6k841k7/AHp/nCgDVSan76x/OFT+caANdJqej1j+dT99AGx5rU9Jqx99SecaANpJqek1Y++no9A" +
                        "G8k1TI+6sRJq7bwZqtnpVz9pvIUuv/Q0oA6Tw94G1XWNlzc/6La/33++9e06V4e03RIdltB8/99/v1" +
                        "No+t6brEO+wn3/7H8da1AEdM2JT6KAH+UtVnhSpqKAK32aKoXsIXq/RQBlSabbPVabRIXreooA5Kbw" +
                        "3C/8ABWVc+D4X/gr0KmbKAPIrz4ewzfwVxOpfChJv+WFfSVFAHxLqvwcufne2Ssqw03x/4Jm32G+e1" +
                        "/jhf7lfdrwwv9+Oq01hZzffgR6APlGG/wDDfjNPs2q2r6dqP+38j/8AAHpk3h7UtEf/AJ+rX++lfTl" +
                        "z4S0G8/4+bKF/+AVfsPhr9oh8nTd8EP8Afl+5QBxXwo/5Ctj/ALj17LrfjPStH3wo/wBqn/uJXiF/p" +
                        "Vz4c1Wazd/JmT5Pk/26of7b0Ab2seJ9V1t/9JfZB/zxT7lYFFFABRRRQAUUUUAFFFFABRRRQAUUUUA" +
                        "FFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBJUdSUUAFFFR0ASUUVHQAVJRRQAUUUUAFFFF" +
                        "ABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFF" +
                        "FFABRRRQB/9X663+9Md6h30zf70ATO9Q7/eoXemb6AH0x3pjvULvQBJUbvTHemO9AD3eoXemO9Vneg" +
                        "CWonel31BvoAn31V3+9NqDfQBM71Dvod6ioAl31FUe+mb6AH76ZvqKigB2/3o3+9Q0UATb/AHo3+9Q" +
                        "0UATb/ejf71DRQBNv96fvqtRQBZ30b6rUzfQBf30b6r76N9AFzfTvOqjvo30AXvOp++s7fRvoA0d9H" +
                        "nCqG/3o3+9AGt5xp2/3rK84VP5xoA2PONOSasRJqek1AG8k1bds7+SjpXHo9dPYf8eyUAdJZ6xc20y" +
                        "TI7o/99K9j0H4i/cttY+dP+eyf+yV4FUqTPC/yPQB9k21zbXkP2m2dJ0f+NKmr5X0TxJeaVN51tP5L" +
                        "/3P4Hr2/QfHlhqXkW1//os/9/8AgegDuaKN+9N6UUAFFFFABRUlFAEdFSUUAR1I9FIiPM/kwpvd/wC" +
                        "BKAGVNZ2FzfzbLZN711mneFppf32pPsT/AJ5J9+uujezsIfJs9n/AKAMPTfCVtbfvr9/Pf+5/BW5Nf" +
                        "oibLZKpzTTTf66o6APnzxy7v4nunf7/AMlcdXUeOf8AkZL3/gFcvQAUUUUAFFFFABRRRQAUUUUAFFF" +
                        "FABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFSUVHQAUUVJQBHUlFR0ASUVHRQBJUdSUU" +
                        "AR1JRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAF" +
                        "FFFABRRRQAUUUUAFFFFAH/9b6rd6hd6HeqzvQBNv96bUbvTN9AE++qe+jfVegCR3qvvpHemO9AD3eo" +
                        "XemO9N30AI70u+oN9G+gA30b6iqDfQA/fTN9M3+9NoAkqOo6KACiiigAooooAKKKKACiiigAooooAK" +
                        "KKKACiiigAooooAKKKKACiiigAooooAZvqzv96bsqSgCRHrtrD/j0SuJrttO/48EoAvUVHRQBJU8Nz" +
                        "ND/ALlQUUAegeHvG2paU6Qwv58H/PF//ZK9v0TxVpWtpshfyLr/AJ4vXyhWhbX80L/P/wDZ0AfYFSV" +
                        "4Z4e+IVzbJHbal/pVr/f/AOWyV7BpusWGq23nWE6P/sfxp/wCgDTooooAKK0bDSrzUn2WyfJ/G/8AB" +
                        "Xa2Gg2mm/vrn9/P/ef7n/AEoA5jTfD1/f7Jn/cf7b/+yV3VrYado8OYU+f+9/G9Omvnf5YfkSqP36A" +
                        "JZruab/YT+5UNFFABRRRQB86eOf8AkY7r/gFctXS+Nf8AkZLr/gFctQBJRRRQAUUUUAFFFFABRRRQA" +
                        "UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVJUdFABRRRQAUUUUASVHRUlAEdSUVH" +
                        "QAUVJRQAUUUUAFFR1JQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFA" +
                        "BRRRQAUUUUAFFFFABRRRQB//9f6cd6ZvpjvUO+gB7vULvUW+o3egB7vS76gd6ioAc702oN9G+gA30b" +
                        "6iqPfQBJUe+mb6ioAdv8Aem76KjoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK" +
                        "KKKACiiigAooqSgAqSm7PaptlADNlP2VJUqJQAbK62w/wCPRK5hErp7D/j2SgC1UlR0UASUUVHQBJR" +
                        "RRQBKjuj70rRsNbvLOZLmGd4J0/jSsmigD6C8N/EL7Y8Fnqqfv532JND/AB/76V9E2PhlIf3upPv/A" +
                        "NhPuf8AA3r4W8K3M1trcM0L+W6b3SvtrwrfXmpeHrK5u5vOnkT/ANnoA7N7iGFPJtE2In/fFUXeaZ9" +
                        "7vSUUAFFFFABRRS/79ACUUUUAfOHjX/kZLr/gFclXW+Nf+Rkuv+AVyyUASUUUUAFFFFABRRRQAUUUU" +
                        "AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUlR0UAFFFFAElR0UUASVHRR" +
                        "QAUUUUAFFSVHQBJRRRQAUVHUlABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRR" +
                        "QAUUUUAFFFFABRRRQAUUUUAf//Q+jKid6Y71C70AP30x3pjvUO+gCZ3qF3o31C70ATb6rb6Zvpm/wB" +
                        "6AH76Zv8Aem0UAG+o6KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooq" +
                        "SgCOpNlO2e1P2UAM2e1TbKNlWdlAEVS7KNlTIlAEOypkSpkSpkSgCFErpLP/j2SsdErZtv9SlAE1FF" +
                        "FABUlR1JQBHUlR1JQAUUUUAbXhj/kKx/7j19veBv+RYsv9x//AEOviPw3/wAhaD/gdfbfgn/kWbL/A" +
                        "HH/APQ6AOpooooAX56SiigAooooAKKKKAPnTxz/AMjPP/wCuSrr/Gyf8VJPXKUAFFFFABRRRQAUUUU" +
                        "AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUlR0UAF" +
                        "SUVHQAUUVJQAUVHRQBJRUdFAElFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFA" +
                        "BRRRQAUUUUAFFFFABRRRQAUUUUAf/0foF6iepXqJ6AIHeoqleqz0AM30b6So6ACio6KACiiigAoooo" +
                        "AKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooqSgCOpNlGynbPagB1Lsp+ypKAI9lPRKm" +
                        "2VPsoAgRKmRKeiVMiUAQ7ParWykRKsolADESpkSpkSnolADEhq/D/AKmmIlPoAKkqOpKACiiigAqSo" +
                        "6koAKKKKANnw9/yFYP+B19veCf+RZsv9x//AEOviHw9/wAhWD/gdfb3gn/kWbL/AHH/APQ6AOpoooo" +
                        "AKKKKACiiigAooooA+efHH/IyT1yNdd44/wCRknrkaACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAkooqOg" +
                        "CSiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKAP//S+h3SqzpWk6VWdKAKDpVZ0q+6Ux0oAobKZsq5so2UAUNntTdlXKj2UAU6Ks7KZs9qAIaKk2V" +
                        "HQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFSU7Z7UANp2z2p+yp6AINlT1Lsp6JQAzZT0Sn" +
                        "olTIlAEVSolTIlTIlAEKJVlEp6JVlEoAhRKmRKESrKJQAxEqZIamRKmRKABEqu/360USs2X/X0AMoo" +
                        "ooAkoqOpKACiiigCSio6KAOg8Pf8AIVT/AIHX2x4JT/imLL/cf/0Ovifw9/yFU/4HX234J/5Fux/3H" +
                        "/8AQ6AOpooooAKXfSUUAFFFFABS/wC3R8lJQB88+OP+Rknrka67xr/yMU9cjQAUUUUAFFFFABRRRQA" +
                        "UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRUlAEdFFFABRRRQAUU" +
                        "UUAFFSVHQAVJUdSUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUU" +
                        "UUAFFFSUAR0UUUAFFSVHQAUVJRQB//9P6ZdKhdK0nSqzpQBQ2VC6VpPDUXkmgCnsqrs9q1XSoXSgDO" +
                        "2VBsrT2VA6UAU9lRVedKY6UAUNlM2Vc2UbKAKGz2ptWNlM2UAVqKm2e1N2UAR0UUUAFFFFABRRRQAU" +
                        "VJRsoAKkpdlP2UAM2U/ZUlS7KAIUSptlTIlPRKAG7Kds9qmRKeiUAMRKeiVZRKmRKAGIlTIlPRKsol" +
                        "AFZEqyiU9Eq4iUAVkSrKJUyJUyJQBCiVMiVZRKmRKAIUSsS8+S5euqRK5a//wCPl6AIKKKKACpKjqS" +
                        "gAooooAKkqOpKANzw9/yFU/4HX234G/5FbTv9z/2eviTw9/yFU/4HX234J/5Fmy/3H/8AQ6AOppdlJ" +
                        "RQAUUUUAFFFFABRRRQB88+Nf+Rinrka67xr/wAjFPXI0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAF" +
                        "FFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFSVHRQAUUUUAFFSUUAR1JRRQAUUUUAF" +
                        "FFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFSUAR0UUUAFSUUUAR0UVJQAUUUUAR" +
                        "0UVJQBHRUlFAH/9T6u2e1MdK0tlMdKAMp0pmz2rSdKrOlAFTZUDpVx0pjpQBQdKhdK09lQOlAGdsqN" +
                        "0rQ2VA6UAUNntTdlW3SoXSgCm6UbKmdKh2UARVBsq5sqF0oAgqPZVjZUdAFeipKKAI6koqSgBuz2p+" +
                        "yn1JQAVKiUlWEoAjRKeiU9Eq0lAECJUyJQiVcRKAIUSp9lWEShEoAESpkSnpDVlEoArIlWUhp6Q1cR" +
                        "KAIUSpkSnolWUSgCFEqykNTJDVlEoAhSGrKQ09EqyiUAQolchqX/H5JXdolcHqvyX89AFOio6koAKK" +
                        "KKAJKKjqSgAooooA6Dw9/yFU/4HX254G/5Fiy/wByviDw9/yFYP8Agdfb/gz/AJFmy/3KAOoooooAK" +
                        "KKKACiiigAooooA+efGv/Iekrka67xr/wAjFPXI0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFA" +
                        "BRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUVJQAVHUlFAEdSUUUAR1JRRQAUUUUAFFFFABRRR" +
                        "QAUUUUAFFFFABRRRQAUUUUAFFFFABUlFFAEdFFSUAFR1JUdABRUlFAEdSUUUAFFFFABUdSUUAFFFFA" +
                        "BRRRQAUUUUAf/1fsl0qs6VpOlQulAFDZULpWk6VWdKAM3Z7VC6VpOlQulAFB0qs6VfdKhdKAItlVXS" +
                        "rjpULpQBn1Hsq86VWegCm9QulXHSoXoApvQ9T1HQBXqvV16rUAR0UUUAFFFFAElSJUG+n0AWUqeq9S" +
                        "I9AEyVaSqSPUyPQBfSrKVmo9X0egC1VhKpo9WUegC+iVMiVCj1coAESpkhp6VcRKAIUSrKQ1ZRKeiU" +
                        "AMRKmRKmRKsolADEhp6JUyJT0SgBledav8A8fz16iiV5dr3yalPQBmUVHUlAElFFFABUlR0UASUUUU" +
                        "Abvhv/kKpX2/4G/5Fiy/3K+HfD3/ISj/4HX3D4J/5Fiyf/YoA6r/co/jpKKACiiigAooooAX7lJRRQ" +
                        "B88+M/+Q89cjXXeMP8AkPzVyNABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRR" +
                        "QAUUUUAFFSVHQAVJRRQBHRRRQAVJUdSUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRUlR0AF" +
                        "FSUUAFFFFABRRRQAUUUUAFFFFABRRRQBHUlFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9b7c2U" +
                        "bKubKgdKAKDpULpWq6VWdKAMp0pjpV90qF0oAzXSqzpWk6VC6UAZrpULpWk6VWdKAKDpVZ0q+6VC6U" +
                        "AZb0PVt0qm6UAVnqs9WXqs9ACVXqy9VnoAjooqOgAoqOigCxTd/vUNSUAWN9PR6qb6l30AXEepkeqC" +
                        "PT0egDSR6mR6zUepkegDYSariTVgpNVlJqANtJquJNWIk1WUmoA6FHq/DNXNw3NX4bmgDp0erkL1zE" +
                        "NzWlDc0AbyJVlErKhuUrShmSgC4iVNs9qhSZHq4mygARK8i17/kIz17ClePa/8A8hWegDIooooAkqS" +
                        "o6koAKKKKAJKKjqSgDd8N/wDIVSvt7wT/AMi1a/7lfD3h7/kJR/8AA6+4vA3/ACLFl/uUAdRRRRQAv" +
                        "+5SUv8ABSUAL/HSUUUAFFFFAHzz4w/5D81crXW+Nv8AkPT1yVAEdFSUUAR1JRRQBHRUlR0AFSUVHQA" +
                        "UVJUdABRRUlABUdSVHQBJUdSUUAFFFFAEdFFSUAR1JRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQA" +
                        "UUUUAFFFSUAR1JRUdABUlR1JQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUU" +
                        "AFFFFABRRRQAUUUUAFFFFABRRRQB//9f722e1VnSr9MdKAM10qF0rVdKhdKAKDpVPZWk6VC6UAZTpT" +
                        "HStJ0qs6UAZrpVZ0rSdKrOlAGU6VC6VqulU3SgDNdKpularpVZ0oAx3SqzpWq6VQdKAKb1WerLpVN6" +
                        "AEqOio6ACiiigAooooAKKKKAJN9O3+9Q0UATb/epkeqdM30AaqTUJNWVvqffQBrpNVlLmsH7T70/7T" +
                        "QB0iXNWUua5hLmpkuaAOwS5q+l/XBpeVZS8oA9ChvK0ob+vN0v6spqVAHp0N+laUN/XlaaxVyHWKAP" +
                        "V0vExXlfiF9+pO9XIdY/26568ufOuXkoAKkoShKACpKjqSgCSiiigAqSo6koA3fDf/ISSvt7wT/yLV" +
                        "r/uV8Q+G/8AkJJX294J/wCRatf9ygDqaKKKACiiigAooooAKKKKAPnzxt/yHp65Kut8bf8AIenrkqA" +
                        "CiiigAooooAKKKKACiiigCOpKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACi" +
                        "pKKAI6KkooAjqSiigAqOpKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigA" +
                        "ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Q/QXZTNntWlULpQBm0x0q+6VDs9qAKbpVZ" +
                        "0rSdKhdKAM10qF0rVdKrOlAGU6VWdK1XSmOlAGO6VTdK1XSqzpQBlOlUHhrbdKoPDQBlOlUHSth4ap" +
                        "vDQBiOlUHSt54apvDQBiOlQ1sPDVN4aAKdFTOlQ0AFFFFABUdSUUAR0UUUAFFFFABRRRQAUUUUAFFF" +
                        "FADd/vT970lFAEnmvR5r1HRQBP5z0/7Y/rVWigDQS/et62m3w7642umsH/cpQBrJVxKz0qRKALlFCU" +
                        "UAWKKjqSgAqSo6koA3fDf/ISSvuLwZ/yKtr/uV8O+G/8AkJJX294Mf/im7X/coA6miiigAopfnpKAC" +
                        "m/cp1FABRRRQB8+eNv+Q9PXJV1vjn/kOT1yVABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUV" +
                        "JQBHRUlFABUdSUUAR0VJRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRUlR0AFFSVHQ" +
                        "AUUUUAFFFFABRRRQAUUUUAFFFFABRRUlAEdFFFABRRRQAUUVJQBHRRRQAUUUUAFFFFABRRRQAUUUUA" +
                        "FFFFAH//R/Rio9lWKKAK7pULpVqo3SgCm6VC6VfdKi2UAUnSqzpWk6VWdKAKDpULpWk6VC6UAZTpVZ" +
                        "4a1XSqzw0AY7w1TdK3nhqs8NAGC8NU3hrbeGoXSgDBdKrPDW88NU3tqAMF4apvDXSPDVN7agDnnhqs" +
                        "8NdC9tVN7agDBeGq2yt50qs8NAGbRVx4ar7KAK9FLspKACiiigAooooAKKKKACiiigAooooAKKKKAC" +
                        "iio6ACugtn/AHNc/W7bP+5oA0kerKPVBHqZHoA0kqeqqPUyPQBMlOqOpKAFSn0xKfQB0Phv/kJJX29" +
                        "4M/5Fu1T/AG6+HPD3/ISjr7j8GJ/xTdr/ALlAHU0UUUAFFL9+koAKKKKACiiigD588Y/8hqeuSrrfH" +
                        "P8AyHJ65KgAooooAKKkqOgAooooAKKKKACiipKAI6koooAKKKKACiiigAqSiigCOipKKACiiigAooo" +
                        "oAKKKKAI6koooAKKKKACiiigCOpKKKACiiigAooooAKKKKACiiigAooooAjoqSo6AJKKKKACiiigAq" +
                        "OipKAI6KkqOgCSo6kqOgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//S/SCo6kooAjp" +
                        "dlJRQBHUdWKXZQBQ2e1MdKs7KKAKbpVfZWjsqF0oAzXSoXhrVdKheGgDKeGoXhrVdKheGgDKdKrPDW" +
                        "28NVnhoAwXhqs8NdC8NQvDQBzzw1Te2rpHtqrPbUAc29tVZ4a6R4arPbUAcw9tUL21dI9tVZ7agDm3" +
                        "tqpvDXVPbVTe2oA557aqzw10j21QvbUAc28NVtldC8NVntqAMaitB7aoXhoAq0UuykoAKKKKACiiig" +
                        "AooooAKjqSo6ACtG2f5KynqZHoA3kerKPWOk1XEegDYR6so9ZSPVxHoA00pyVWR6ej0AXKKjqSgDc8" +
                        "Pf8hKOvubwR/yLdl/uV8M+Hv+QlHX3H4J/wCRatf9ygDrajpf46P4KAEooooAKb81OooAbv8AenUUU" +
                        "AfPnjb/AJDD1yVdV42f/idvXK0AFFFSUAR0VJRQAUUUUAFFFSUAR0VJRQBHUlFFABRRRQAUUUUAFFF" +
                        "FABRRRQAUVJUdABRRRQAUVJUdABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRR" +
                        "QAUUUUAFFFFABRRRQAUUUUAFR1JRQAUUUUAFFFFAEdFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/0/0" +
                        "gooqOgAoqSo6ACipKjoAKXZSUUAR1HsqxRQBU2UzZ7VaooAzNlPdKuUzZQBQ8modlaWz2puygDJeGm" +
                        "PDV/wAmjyaAMd4aheGtt4aheGgDE8mqz21bzw0PDQBzb21QvbV0P2b2qHZQBzbw1We2rp3hqF7agDm" +
                        "Hs6rPbV1T2dQvZ0Ack9tVZ7aute2qF7agDj3s6pvbV2D2dQvYUAcS9tUL21dg9nVN7CgDkntn6VW2P" +
                        "XVPYVTezoAwKK2Xs6oPbP0oAq0Uux6SgAqOpKjoAjSqE1z9m+er71z2pI7psSgC/Z63ZzPs37HroYZ" +
                        "q+ctYs7+F/Ohd0eptH+It5pT/AGbVU3p/foA+mYZquQzVxOieIbDVYfOs5t9dJDNQB0KPWglYEM1aS" +
                        "PQBfSpqr1KlAG/4e/5CUdfc3gz/AJFu1/3K+GfD3/ISjr7j8E/8i1a/7lAHW0UUUAR0UUUAFFFc/rf" +
                        "ifStBhea8nTf/AHKAN53T771yWseLdK0eF037568W1v4l6rrcz22lR+Ra/wB+sG2s7m5+ebe70Aaus" +
                        "aq+sX73P9+s3ZVl7N4X2PT9lAEWypKXZRsoASiil2UAJRRRQAUUuykoAKKKKACiipKAI6KkooAjqSi" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKjqSigCOipKKAI6KkooAjooooAKKKKACiiigAo" +
                        "oooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACio6KAJKjqSigCOipKKACo6kqOgAoqSo6ACii" +
                        "igAooooA//9T9IKKKKACo6KkoAKKKKAI6KkqOgAooooAKKKKAF2UbKSigCOo9lWKKAK9M8kVc2UbKA" +
                        "KH2b2puytHZRsoAx/JFM8mtao9lAGb5NN2VqbKZsoAx/JFMe2rb8kUeSKAOe+y+9Me2rofs3tUP2X3" +
                        "oA557aofs1dP9l96PsvvQByr21Vns66r7NTPsvvQBx72dVns67B7ah7OgDhns6pvZ13j2dVns6AOAe" +
                        "wqg9hXor2FU3sKAPN5rCqE1g9enPptZs2m0AeaPZulVnhevRZtN/wBis2bSu9AHBulULmHfXZzaU9Z" +
                        "VzprpQBwd5pqTJsrz3WPCqTb3RK9mms3T+CqE1nvoA+Zvs2seHrn7Tpsjp/sV6j4V+K6O6WevfuX/A" +
                        "L9dDf6JDcp9yvN9b8H/ANxKAPpmw1W2vIfOtn3pW9DNXxJpuseJPCU2+zd3gT+B6948JfFHStb2W1z" +
                        "+4uv7j0Ae8QvVlKx7O5SZN6PvrVhegDpPDf8AyE0r7n8Gf8i3a/7lfDHhv/kJpX3J4M/5F61oA62o6" +
                        "kqGaaGFPOmfZGn9+gB1Ub/UrDTYXubydIK8r8W/FfStH32elf6Vdf7FeFalqviHxVN52pTvsf8AgSg" +
                        "D07xP8Xd7vYeG03/wedXl32PVdbuftOpTvO710OieEnm2fJXruj+EkREd0oA4DRPCrvs3pXqOm+G4Y" +
                        "U3vXVWelQ2yJsSrkybE2JQB5Lr1mkM3yVyTw16LryfO9cZMlAGRsqOrjpVfZQBHTNlT0UAR0zZT6KA" +
                        "CiiigApmyn0UAFFFFABRUlFAEdFSUUAFFFFABRRRQAUUUbKADZRsoooAKKKKACiiigAqOpKKAI6Kko" +
                        "oAjooooAKKKKACiiigAqOpKKAI6KkqOgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii" +
                        "igAqOpKKACiiigAqOpKjoAKKKKACiiigAooooA//V/SCiiigAoqOpKAI6koooAKKKjoAKKKKAJKKKj" +
                        "oAKkoqOgAooooAKKKKACiiigAooooAKKKKACiiigBdlGykooAXZTPJp1FAEf2eSo9lWKKAIvs1L5Jq" +
                        "SigCp5IqH7HWjRQBkPbUx7OtqigDn3sKrPYV0nlLS7EoA5F9NqhNpW/8AgrudqUzyUoA86m0f/YrNu" +
                        "dEr1d7aGoXsEegDxa58Pf8ATOuevPDb19AvpSPVabRIXoA+ZrnQZk+4lc9eaU/8aV9UTeG0f+CsS58" +
                        "Ho/8ABQB8f6r4bhm/gryvWPB80L+dD8j/AN+vu2/8Ab/uJXDar8Orn+BN9AHy14b+IviHwrMltf77q" +
                        "1/8fr6c8K+OdE8SQo9nP5b/ANyvMde+G9ym/wD0WvIrzwxquiXn2mw3wTp/coA/Qnw3/wAhJK+7PBf" +
                        "/ACLdrX5I/CX4i+JPtiW2sWTzon/LZK+1X+JGvXOjwaVpUH2WP+N/46APoTxP4/0TwxC/2mfz5/8An" +
                        "ilfOWveOfEniqZ4Ud7W1/uJ9+sez0G5v7n7Tcu887/xvXqmj+D/ALjulAHnWj+GJpn37Pv161ong/Z" +
                        "s3pXc6V4bhtkTfHXVQ2yQp8iUAY9ho9tCn3K20hRE+Sn7KnoAjqnM/wAlXKoXNAHDaqm964y5T567b" +
                        "VU31yUyUAY7pUNXHSq70AV6jqxUdAEdFSVHQAUUUUAFFFFABRRUlAEdFSUUAR1JRUlAEdFSbKKACo6" +
                        "sUUAR1HVjZRsoAjo2VJRQBHRUmyjZQBXoqxRQBXoqTZRsoAr0bKsbKjoAjoqSo6ACo6k2UUAR0VJUd" +
                        "ABRRRQAUUUUAFR1JRQBHRUlR0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFF" +
                        "AEdFFSUAR0VJUdABRRRQB/9b9IKKKKACiiigAqOpKKACo6kooAKKKKAI6kqOpKACo6kqOgCSo6KkoA" +
                        "jooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKkoAjo" +
                        "qSigBmyjZT6KAK9QPDC/8FX6KAMSbSrOb/XQpWJeeBvD1/wD661Suz2UbKAOVsPBOlWHyWcCJXf6P4" +
                        "V8759lFmn76vVNBhRIaAIdK8Nww7N6V21tZww7ERKfD8lW6AGonl1aqOigCSjfUdFADHes25+7WjWR" +
                        "N0oA5jUv9iuVuu1dbeVzFz3oAx3qm6Vfeqb0ARVHUj0UAV6KkooAjoqSigCOipKKAI6KkqSgCOipKN" +
                        "lABRRRQAbKKkooAjoqSigApuz2p1LsoASm7Pan7KfQBDs9qNntT9lGygBKjqSigCOjZUlFAEeyijZR" +
                        "QBHUdWKj2UAV6KsVHQBHRRRQAVHUlFAEdFFFABRRRQAVHUlFABUdSUUAR0UUUAFFFFABRRRQAUUUUA" +
                        "FFFFABRRRQAUUUUAFFFFABRRRQBHUlFR0AFFFSUAR0UUUAf/9f9IKKKKAI6koqOgAqSio6ACpKKKAI" +
                        "6kqOpKACiiigAqOpKKACo6KKACpKjqSgAqOpKKAI6KKKACipKjoAKKKKACipKKAI6KKKAJKjoooAKK" +
                        "KKACiiigAooooAKKKKACiipKACiipKACiiigAooooAjqSipKAI6ciU6pESgC5YJ89eqaU+yFK80s0+" +
                        "evRdK+5QB2CPV9Kx4Xq/voAsUUqUlAC76SionegAd6zZnq471QuX+TmgDnryuem+/XQ3lYT0AYc1V3" +
                        "q86VTegCrUdS7KSgCOiiigAooooAKKKKACipKbs9qAG1JRRQAUUuyn0AR0uyn1JsoAjoqSpKAK9SbK" +
                        "ds9qfsoAip2z2qambKAGbPajZ7U/ZRsoAZs9qhqzspmz2oAbsqN0qxTdntQBVoqxsqB6AIqKkooAr0" +
                        "VJRQBXqOrFR0AR0UUUAFR1JRQBHRRRQAUUUUAFFFFAEdFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFF" +
                        "FABRRRQAVHUlFAEdSUVHQAUUVJQBHRRRQB//Q/SCiiigAooqOgCSiiigAooooAKKKKACiiigAqOipK" +
                        "ACiiigCOipKKAI6koooAKjqSigAooooAKKKKAI6KkooAjqSio6ACiipKAI6kqOigAooqSgCOiiigAq" +
                        "So6koAKKKKACpKKKACpKKKACiiigAooooAKkoqaFKANWzQ767/TfuVwtn9+u0saAOqheriPWVbPWkj" +
                        "0AWakqDfT99AElFR0x6AGO9UZutW3es25oAx7msKbrW7c1iT0AZTpVB6vzdKrPQBTpjpU9QbKAEpuz" +
                        "2qao6ACiiigAooqSgCOipKKAGbKfUlFABsop2z2p+ygCKnbPapqKAGbKfUmynbPagCGirFFAEeyjZU" +
                        "lFAEeynbPajZ7UbPagBuyjZUlFAFembKs7Pam7KAK9R7KlekoAr1HUlMegBKjqSo6ACo6kqOgCOo6s" +
                        "VHQBHRRRQAVHUlR0AFFFFABRRRQAVHUlFAEdFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQA" +
                        "VHUlFABRUdFAElFR0UAf//R/SCiiigAooooAKKKKACiiigAooooAKKKKAI6koooAKKKKACiiigAooo" +
                        "oAKKKKACo6kooAKKKKACiiigAoqOpKACiiigCOpKKjoAKkoooAKKjqSgAooooAKKKKAJKKKkoAKKKK" +
                        "ACiiigAqSimJQA+rMPSoqsQ0AattXW2dcra966qzoA6S2er8L1m2z1fgoAtVJVRKnoAsVDv96dTXoA" +
                        "rO9U3q49Ztz92gDNuax5ulbFzWVMlAGW9UnSr9z3qm9AFZ6iqw9Q7PagCGipKKAI6KkooAjoqSigCO" +
                        "ptntTqXZQAzZ7VNRRQAzZT6m2e1OoAj2U7Z7UbPajZ7UAOpuz2p+yp9lAEGyjZVnZ7U/ZQBFRsqXZT" +
                        "6AK+yirGymbKAItlQbKubKSgCi9PdKm/gqs9ADXqOrFRvQBXqN6c9D0AVaKkqOgCOh6kqOgCOo6sVH" +
                        "QBHUdSVHQAUUUUAR0VJUdABRRRQAUUUUAFR0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABR" +
                        "RRQAUUVHQAUUUUAf/0v0gooooAKKKKACiiigAooooAKKKKACiiigAooooAKjqSigAooooAKKKKACii" +
                        "igAooooAKKKKACiiigAooooAKKKKACiiigCOpKKKACiiigAooooAKkqOpKACpKjqSgAooooAKkqOpK" +
                        "ACiiigCRKtxfdqFKspQBsW3auhtq56Ct62egDoUq+lZtt2q+j0AXEqeqqPU1AElQPU9R0AV3qrc96t" +
                        "PVV6AMq5rHm6VsTdKx5ulAFN6pulab1mOlAET1HVio6AINlJUlFAEOz2o2e1TUUAQ7PapqKkoAjqTZ" +
                        "TtntRs9qAG07Z7U6l2UAJRVjZUlAEeynbPan7KfsoAjqSpKKACipdlGygCKk2f3Km2UbKAItiUVLsp" +
                        "KAI6jqzsqF0oArPTHSpaa9AFWilekoAr1C9WXSmUAU6Y9WXqGgCOo6kooAjqOpKKAK9FSVHQBHRRRQ" +
                        "AVHUlFAEdFFFABRRRQAUUUUAR0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUdSUUAR0VJ" +
                        "RQB/9P9IKKKKACiiigAooooAKKKKACiiigAooooAjqSiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooAKkoooAKkqOpKACiiigCSiiigAqSo6koAlSriVWSt" +
                        "BKAL0FbcPSsSCtuHpQBvpV5KyoelX0egDQSpKro9SUAS76Y9OqOgAeqb1K71E9AGZN0rNl+7WlN0rN" +
                        "l+7QBUqq9WX/26hegCg9OpXpKAG7Pam1JRQBHTtntTqKAG7PanU3Z7U/ZQAlN2e1P2VboAiRKfs9qf" +
                        "sp+ygBmyn7KkqXZQBFRUuyjZQAbKNlGypkSgCHZU+ykRKloAj2UbKds9qdQBHsqDZVuo6AI3SmbKne" +
                        "oNlAELpUL1PUb0AV3qq9XqqPQBE9R1M9Q0AQ7PamvUlV6AI6KkqOgCOiiigCOo6kooAr0UUUAFFFFA" +
                        "EdFFFABRRRQAUUUUAR0VJUdABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBHUlR1JQBHRUlFAH/" +
                        "/1P0gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKkoAKKKKAJKKKKACiipKACiiigCShKKEoAuJVxKppVxKAL0F" +
                        "bdtWIlbdtQBq23atZKyUq4lAF9KfUdSUASb6joooAY9U3qy9U3oArTdKoPVp6qvQBWeqz1ZeonoApv" +
                        "UdWKKAKmykqxsooAg2U+pKds9qAG7KkpdlPRKAGbKeiVJRQAUiJU2yjZQAIlPRKeiUqUAGyjZTkSnU" +
                        "ANRKdRS7KAEpdlPooAjqSj/booAjoqSo6AI6jdKsVHQBA9RPUlR0AVXptSvUT0AV6jenPTXoAr016e" +
                        "9MegCs9JVh6r0AR0VJUdAEdFFFAEdR1JUdABRRRQAVHUlR0AFFFFABRRRQAVHUlR0AFFFFABRRRQAU" +
                        "UUUAFFFFABRRRQAUUUUAFFFFABRRRQBHRRRQB/9X9IKKKKACiiigAooooAKKKKACiiigAooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACpKjqSgAooooA" +
                        "kooooAKkqOpKACiiigCSpUqJKkoAsJV5KopV5KALkFbaViJWtD1oA2Eq5VNKsJQBcR6sVUSrO/wB6A" +
                        "H76N9M3+9OoAa9UaleoqAKb1Xqw9V6AKj1E9SvUVAEdR1Yeo9lAEdFSbKKAGbKfUlFABRUuyjZQAbK" +
                        "NlGyp9lABsop2z2p1ADUp1Ls/gp9ABUmyo6k2UAGyipKj2UAFSVJRQBXoqSigCPZUdSbKjoAjqOpKj" +
                        "oAgf5KiqV6ioAjeq71YeoXoApvTXpz0PQBWeoqsPUL0AQ1HVh6r0AFRvUlR0AFR1JUdAEdR1JUdABR" +
                        "RRQAVHUlR0AFFFFABRRRQBHUlFR0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUdSUUAR0VJR" +
                        "QB//9b9IKKKKACiiigAooooAKjqSigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiig" +
                        "AooooAKKKKACiiigAooooAKKKKACiiigAqSo6koAKKKkoAKKKKAJKKKKACpKjqSgAqwlV0qxQBMlXE" +
                        "qmlXEoAuQVrQ9ayYK0kegDVR6uJWclW0egC+j09KiqSgCxvqN3pm+jfQAx6a9FQPQBE9V6sPVV6AKz" +
                        "0PU71A9AEVFFFABUuyoql2UAGyjZT6ZsoAfUlGypKAIkSpaKXZQAlKiU+pKAI0SpNlSUUAR7KNlSVJ" +
                        "QAUUUUAFFFFABUdSfJRQBHUb0UPQBXopXpj/PQBWeh6HoegCJ6pvVx6qvQBVopr0PQBC9R1I9QvQA1" +
                        "6r1JUdABUdSVHQAVHUlR0AR1HUlR0AFFFFABUdSVHQAUUUUAFFFFABUdSVHQAUUUUAFFFFABRRRQAU" +
                        "UUUAFFFFABRRRQAUUUUAR0VJUdABRUlFAH/1/0gooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooqSgAooooAKkoooAKKKK" +
                        "AJKKjqSgAqRKjqSgAqxVerCUATJVxKppVxKALkFayVkwVfSgC5D0q+j1QSrdAF1HqffUCPT99AElFR" +
                        "76N9AElQPT6rvQAPVV6e9MegBr1A9T1HQBHRUlFABRUmyigA2UVJTUoAdSolPqTZQBHUlFSUAR7Kkq" +
                        "SigCOpNlFSUAR1JRRQAUUUUAFR1JRQBHRRRQBHVerFRvQBHUM/3Ke9JQBUeoqsUx6AInqq9Wnqm9AF" +
                        "V6dTXp1AFd6hepqjoAr0UUUAR1HUlR0AFR1JUdAEdR1JUdABRRRQAVHUlR0AFFFFABRRRQAUUUUAR0" +
                        "UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFR1JRQBHRUlFAH/0P0gooooAKKKKACiiigAooooAKK" +
                        "KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqSiig" +
                        "AooooAKkqOpKACiiigAqSo6koAKkqOpKACrCVXSrCUATJVxKppVxKALiVfSqCVcSgC+j1ZR6o1cSgC" +
                        "wj1JvqBHp9AFiio99G+gA31G/9+pHqvQAUU16bQAUUUUAGyiiigAqSmpTqACpKKKACpKEqSgAqSihK" +
                        "AD/AGKKKkoAKKKKACiiigAooooAKjqSigCOmPT6KAI6jeh6HoAjqu9SVG9AED0PQ9RUAR1XerFV3oA" +
                        "qvQ9D06gCu9V6leoqAB6r1JUdABUdSVG9ABUdSVHQBHUdSVHQAUUUUAFR1JUdABRRRQAUUUUAFFR0U" +
                        "AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRUdABRRRQB//9H9IKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKkoo" +
                        "oAKKKKAJKKjqSgAooooAKkqOpKACpKjqSgCSpEqvVhKAJkq4lU0q0lAFxKlSqyVMlAGslSpVNHq4lA" +
                        "EyPT9/vUKPUm+gCSio6N9AElFR76KACiiigAooooAKkpqU6gAoqSigCRKEqOpKAJKkqOpKACiipKAC" +
                        "iiigAooooAKKKKACiiigAqOpKjegAqOpKrvQAVHUj1A9ACVG9SVG9AED1FUr1E9AEb1XepXqm9ACVG" +
                        "9SVG9AEdR0r0x6AIajpXpKACo6kqOgCOipKjoAjqOpKjoAKKKKAI6KKKACiiigAooooAjooooAKKKK" +
                        "ACiiigAooooAKKKKACiiigAooooAKKKKACiio6ACipKKAP/0v0gooooAKKKKACiiigAooooAKKKKAC" +
                        "iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACpKjqSgAooooAKK" +
                        "KKAJKKKKACiiigAqSo6koAKkqOpKAJUp6UxKelAEyVaSqqVaSgCVKt1USrdAE6PVlHqmlWEoAsVLvq" +
                        "KigCxRRRQBJUdSVHQBJRRRQAUUUUAFSVHUlACpT6YlPoAKsVXqxQBJRRRQAVJUdSUAFFFFABRRRQAU" +
                        "UUUAFFFFAEdFFFAEdR1JUdAEdR1JUdAEb0PQ9D0AU6HooegCq9Vnqy9VnoASo3qSo3oAgeoqleoqAI" +
                        "HpKV6SgCOh6KHoAjpj0+mPQAlR1JUdABRRRQBHRRRQAUUUUAFFFFABUdSVHQAUUUUAFFFFABRRRQAU" +
                        "UUUAFFFFABRRRQAVHUlR0AFFFFABRRRQB//2Q==";
            var SA = gA({
                    listPoints: function (e) {
                        var A = e.qrcode,
                            o = e.params;
                        if (e.icon, !A) 
                            return [];
                        var t = A.getModuleCount(),
                            r = te(A),
                            a = new Array(t),
                            K = o[1],
                            n = o[2] / 100 / 3,
                            l = o[3] / 100,
                            f = o[4],
                            c = o[5],
                            F = o[6],
                            U = o[7],
                            s = 0,
                            g = [
                                3, -3
                            ],
                            u = [3, -3];
                        n <= 0 && (n = 1),
                        a.push(i.a.createElement("image", {
                            key: s++,
                            x: "0",
                            y: "0",
                            width: t,
                            height: t,
                            xlinkHref: o[0]
                        }));
                        for (var R = 0; R < t; R++) 
                            for (var d = 0; d < t; d++) 
                                if (r[R][d] === Y || r[R][d] === _ || r[R][d] === $) 
                                    A.isDark(R, d)
                                        ? 0 === K
                                            ? a.push(i.a.createElement("rect", {
                                                opacity: l,
                                                width: n,
                                                height: n,
                                                key: s++,
                                                fill: f,
                                                x: R + (1 - n) / 2,
                                                y: d + (1 - n) / 2
                                            }))
                                            : 1 === K && a.push(i.a.createElement("circle", {
                                                opacity: l,
                                                r: n / 2,
                                                key: s++,
                                                fill: f,
                                                cx: R + .5,
                                                cy: d + .5
                                            }))
                                        : 0 === K
                                            ? a.push(i.a.createElement("rect", {
                                                opacity: l,
                                                width: n,
                                                height: n,
                                                key: s++,
                                                fill: c,
                                                x: R + (1 - n) / 2,
                                                y: d + (1 - n) / 2
                                            }))
                                            : 1 === K && a.push(i.a.createElement("circle", {
                                                opacity: l,
                                                r: n / 2,
                                                key: s++,
                                                fill: c,
                                                cx: R + .5,
                                                cy: d + .5
                                            }));
                                else if (r[R][d] === M) {
                                    if (A.isDark(R, d)) 
                                        if (0 === F) 
                                            a.push(i.a.createElement("rect", {
                                                width: 1,
                                                height: 1,
                                                key: s++,
                                                fill: U,
                                                x: R,
                                                y: d
                                            }));
                                        else if (1 === F) 
                                            a.push(i.a.createElement("circle", {
                                                key: s++,
                                                fill: "white",
                                                cx: R + .5,
                                                cy: d + .5,
                                                r: 5
                                            })),
                                            a.push(i.a.createElement("circle", {
                                                key: s++,
                                                fill: U,
                                                cx: R + .5,
                                                cy: d + .5,
                                                r: 1.5
                                            })),
                                            a.push(i.a.createElement("circle", {
                                                key: s++,
                                                fill: "none",
                                                strokeWidth: "1",
                                                stroke: U,
                                                cx: R + .5,
                                                cy: d + .5,
                                                r: 3
                                            }));
                                        else if (2 === F) {
                                            a.push(i.a.createElement("circle", {
                                                key: s++,
                                                fill: "white",
                                                cx: R + .5,
                                                cy: d + .5,
                                                r: 5
                                            })),
                                            a.push(i.a.createElement("circle", {
                                                key: s++,
                                                fill: U,
                                                cx: R + .5,
                                                cy: d + .5,
                                                r: 1.5
                                            })),
                                            a.push(i.a.createElement("circle", {
                                                key: s++,
                                                fill: "none",
                                                strokeWidth: "0.15",
                                                strokeDasharray: "0.5,0.5",
                                                stroke: U,
                                                cx: R + .5,
                                                cy: d + .5,
                                                r: 3
                                            }));
                                            for (var C = 0; C < g.length; C++) 
                                                a.push(i.a.createElement("circle", {
                                                    key: s++,
                                                    fill: U,
                                                    cx: R + g[C] + .5,
                                                    cy: d + .5,
                                                    r: .5
                                                }));
                                            for (var p = 0; p < u.length; p++) 
                                                a.push(i.a.createElement("circle", {
                                                    key: s++,
                                                    fill: U,
                                                    cx: R + .5,
                                                    cy: d + u[p] + .5,
                                                    r: .5
                                                }))
                                        }
                                    }
                            else 
                            r[R][d] === Z
                                ? A.isDark(R, d)
                                    ? 0 === F && a.push(i.a.createElement("rect", {
                                        width: 1,
                                        height: 1,
                                        key: s++,
                                        fill: U,
                                        x: R,
                                        y: d
                                    }))
                                    : 0 === F && a.push(i.a.createElement("rect", {
                                        width: 1,
                                        height: 1,
                                        key: s++,
                                        fill: "white",
                                        x: R,
                                        y: d
                                    }))
                                : A.isDark(R, d)
                                    ? 0 === K
                                        ? a.push(i.a.createElement("rect", {
                                            opacity: l,
                                            width: n,
                                            height: n,
                                            key: s++,
                                            fill: f,
                                            x: R + (1 - n) / 2,
                                            y: d + (1 - n) / 2
                                        }))
                                        : 1 === K && a.push(i.a.createElement("circle", {
                                            opacity: l,
                                            r: n / 2,
                                            key: s++,
                                            fill: f,
                                            cx: R + .5,
                                            cy: d + .5
                                        }))
                                    : 0 === K
                                        ? a.push(i.a.createElement("rect", {
                                            opacity: l,
                                            width: n,
                                            height: n,
                                            key: s++,
                                            fill: c,
                                            x: R + (1 - n) / 2,
                                            y: d + (1 - n) / 2
                                        }))
                                        : 1 === K && a.push(i.a.createElement("circle", {
                                            opacity: l,
                                            r: n / 2,
                                            key: s++,
                                            fill: c,
                                            cx: R + .5,
                                            cy: d + .5
                                        }));
                        return a
                    },
                    getParamInfo: function () {
                        return [
                            {
                                type: j,
                                key: "\u80cc\u666f\u56fe\u7247",
                                default: QA
                            }, {
                                type: D,
                                key: "\u4fe1\u606f\u70b9\u6837\u5f0f",
                                default: 0,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62"]
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u7f29\u653e",
                                default: 100
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u6df1\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u6d45\u8272",
                                default: "#FFFFFF"
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 0,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f"]
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                }),
                xA = SA;
            function HA(e) {
                if (!e) 
                    return "0 0 0 0";
                var A = 3 * e.getModuleCount();
                return String(-A / 5) + " " + String(-A / 5) + " " + String(A + A / 5 * 2) +
                        " " + String(A + A / 5 * 2)
            }
            SA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "estoy" +
                            "\u5417"
                );
            function DA(e) {
                var A = e.qrcode,
                    o = e.icon,
                    t = e.params;
                return 1 === W(o.enabled, 0)
                    ? function (e) {
                        var A = e.qrcode,
                            o = (e.params, e.title, e.icon);
                        if (!A) 
                            return [];
                        var t = 0,
                            r = A.getModuleCount(),
                            a = [],
                            K = "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                    "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                    "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                    "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                    "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                    "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                    "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                    "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                    "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                    "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                    "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                    "11e-16 32.048565,-1.29480038e-15 Z";
                        if (o) {
                            var n = W(o.enabled, 0),
                                l = o.src,
                                f = o.scale,
                                c = Number(r * (
                                    f > 33
                                        ? 33
                                        : f
                                ) / 100 * 3),
                                F = (3 * r - c) / 2;
                            if (o && n) {
                                var U = J(),
                                    s = J();
                                a.push(i.a.createElement("path", {
                                    d: K,
                                    stroke: "#FFF",
                                    strokeWidth: 100 / c * 3,
                                    fill: "#FFF",
                                    transform: "translate(" + String(F) + "," + String(F) + ") scale(" + String(
                                        c / 100
                                    ) + "," + String(c / 100) + ")"
                                })),
                                a.push(i.a.createElement("g", {
                                    key: t++
                                }, i.a.createElement("defs", null, i.a.createElement("path", {
                                    id: "defs-path" + U,
                                    d: K,
                                    fill: "#FFF",
                                    transform: "translate(" + String(F) + "," + String(F) + ") scale(" + String(
                                        c / 100
                                    ) + "," + String(c / 100) + ")"
                                }), "                    "), i.a.createElement("clipPath", {
                                    id: "clip-path" + s
                                }, i.a.createElement("use", {
                                    xlinkHref: "#defs-path" + U,
                                    overflow: "visible"
                                })), i.a.createElement("g", {
                                    clipPath: "url(#clip-path" + s + ")"
                                }, i.a.createElement("image", {
                                    overflow: "visible",
                                    key: t++,
                                    xlinkHref: l,
                                    width: c,
                                    x: F,
                                    y: F
                                }))))
                            }
                        }
                        return a
                    }({qrcode: A, icon: o, params: t})
                    : function (e) {
                        var A = e.qrcode,
                            o = (e.params, e.title, e.icon);
                        if (!A) 
                            return [];
                        var t = 0,
                            r = A.getModuleCount(),
                            a = [],
                            K = "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                    "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                    "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                    "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                    "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                    "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                    "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                    "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                    "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                    "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                    "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                    "11e-16 32.048565,-1.29480038e-15 Z";
                        if (o) {
                            var n = W(o.enabled, 0),
                                l = (o.src, o.scale),
                                f = Number(r * (
                                    l > 33
                                        ? 33
                                        : l
                                ) / 100 * 3),
                                c = (3 * r - f) / 2,
                                F = i
                                    .a
                                    .createElement("g", null, i.a.createElement("rect", {
                                        width: "100",
                                        height: "100",
                                        fill: "#07c160"
                                    }), i.a.createElement("path", {
                                        d: "M39.061,44.018a4.375,4.375,0,1,1,4.374-4.375,4.375,4.375,0,0,1-4.374,4.375m21." +
                                                "877,0a4.375,4.375,0,1,1,4.376-4.375,4.375,4.375,0,0,1-4.376,4.375M28.522,69.06" +
                                                "3a2.184,2.184,0,0,1,.92,1.782,2.581,2.581,0,0,1-.116.7c-.552,2.06-1.437,5.361-" +
                                                "1.478,5.516a3.237,3.237,0,0,0-.177.8,1.093,1.093,0,0,0,1.094,1.093,1.243,1.243" +
                                                ",0,0,0,.633-.2L36.581,74.6a3.427,3.427,0,0,1,1.742-.5,3.3,3.3,0,0,1,.965.144A3" +
                                                "8.825,38.825,0,0,0,50,75.739c18.123,0,32.816-12.242,32.816-27.346S68.122,21.04" +
                                                "9,50,21.049,17.185,33.29,17.185,48.393c0,8.239,4.42,15.656,11.337,20.67",
                                        fill: "#fff"
                                    })),
                                U = i
                                    .a
                                    .createElement(
                                        "g",
                                        null,
                                        i.a.createElement("rect", {
                                            width: "100",
                                            height: "100",
                                            fill: "#07c160"
                                        }),
                                        i.a.createElement("path", {
                                            d: "M48.766,39.21a2.941,2.941,0,1,1,2.918-2.94,2.929,2.929,0,0,1-2.918,2.94m-16.45" +
                                                    "5,0a2.941,2.941,0,1,1,2.918-2.941,2.93,2.93,0,0,1-2.918,2.941m8.227-17.039c-13" +
                                                    ".632,0-24.682,9.282-24.682,20.732,0,6.247,3.324,11.87,8.528,15.67a1.662,1.662," +
                                                    "0,0,1,.691,1.352,1.984,1.984,0,0,1-.087.528c-.415,1.563-1.081,4.064-1.112,4.18" +
                                                    "1a2.449,2.449,0,0,0-.132.607.825.825,0,0,0,.823.828.914.914,0,0,0,.474-.154l5." +
                                                    "405-3.144a2.57,2.57,0,0,1,1.31-.382,2.442,2.442,0,0,1,.725.109,28.976,28.976,0" +
                                                    ",0,0,8.057,1.137c.455,0,.907-.012,1.356-.032a16.084,16.084,0,0,1-.829-5.082c0-" +
                                                    "10.442,10.078-18.908,22.511-18.908.45,0,.565.015,1.008.037-1.858-9.9-11.732-17" +
                                                    ".479-24.046-17.479",
                                            fill: "#fff"
                                        }),
                                        i.a.createElement("path", {
                                            d: "M70.432,55.582A2.589,2.589,0,1,1,73,52.994a2.578,2.578,0,0,1-2.568,2.588m-13.7" +
                                                    "13,0a2.589,2.589,0,1,1,2.568-2.588,2.578,2.578,0,0,1-2.568,2.588m20.319,16a16." +
                                                    "3,16.3,0,0,0,7.106-13.058c0-9.542-9.208-17.276-20.568-17.276s-20.57,7.734-20.5" +
                                                    "7,17.276S52.216,75.8,63.576,75.8a24.161,24.161,0,0,0,6.714-.947,2.079,2.079,0," +
                                                    "0,1,.6-.091,2.138,2.138,0,0,1,1.092.319l4.5,2.62a.78.78,0,0,0,.4.129.688.688,0" +
                                                    ",0,0,.685-.691,2.081,2.081,0,0,0-.11-.5l-.927-3.486a1.641,1.641,0,0,1-.073-.44" +
                                                    ",1.385,1.385,0,0,1,.577-1.126",
                                            fill: "#fff"
                                        })
                                    ),
                                s = i
                                    .a
                                    .createElement("g", null, i.a.createElement("rect", {
                                        width: "100",
                                        height: "100",
                                        fill: "#07c160"
                                    }), i.a.createElement("path", {
                                        d: "M41.055,57.675a2.183,2.183,0,0,1-2.893-.883l-.143-.314L32.046,43.37a1.133,1.13" +
                                                "3,0,0,1-.105-.461,1.094,1.094,0,0,1,1.748-.877l7.049,5.019a3.249,3.249,0,0,0,2" +
                                                ".914.333L76.8,32.63c-5.942-7-15.728-11.581-26.8-11.581-18.122,0-32.813,12.243-" +
                                                "32.813,27.345,0,8.24,4.42,15.656,11.338,20.669a2.185,2.185,0,0,1,.919,1.781,2." +
                                                "569,2.569,0,0,1-.116.7c-.552,2.062-1.437,5.362-1.478,5.516a3.212,3.212,0,0,0-." +
                                                "177.8,1.094,1.094,0,0,0,1.1,1.094,1.236,1.236,0,0,0,.631-.2L36.583,74.6a3.438," +
                                                "3.438,0,0,1,1.742-.5,3.281,3.281,0,0,1,.965.145A38.844,38.844,0,0,0,50,75.739c" +
                                                "18.122,0,32.813-12.243,32.813-27.345a23.668,23.668,0,0,0-3.738-12.671L41.3,57." +
                                                "537Z",
                                        fill: "#fff"
                                    })),
                                g = i
                                    .a
                                    .createElement("g", null, i.a.createElement("rect", {
                                        width: "100",
                                        height: "100",
                                        fill: "#009ce1"
                                    }), i.a.createElement("path", {
                                        d: "M100,67.856c-.761-.1-4.8-.8-17.574-5.066-4.012-1.339-9.4-3.389-15.395-5.552A80" +
                                                ".552,80.552,0,0,0,75.4,36.156H55.633v-7.1H79.848V25.094H55.633V13.258H45.749a1" +
                                                ".68,1.68,0,0,0-1.733,1.707V25.094H19.524v3.963H44.016v7.1H23.8V40.12H63.013a69" +
                                                ".579,69.579,0,0,1-5.65,13.763c-12.724-4.187-26.3-7.58-34.834-5.491C17.074,49.7" +
                                                "33,13.56,52.125,11.5,54.63,2.02,66.125,8.815,83.585,28.824,83.585c11.831,0,23." +
                                                "228-6.579,32.061-17.417C73.49,72.211,97.914,82.4,100,83.267ZM26.956,76.9c-15.6" +
                                                ",0-20.215-12.255-12.5-18.958,2.573-2.266,7.276-3.372,9.782-3.621,9.268-.913,17" +
                                                ".846,2.613,27.972,7.541C45.087,71.118,36.023,76.9,26.956,76.9Z",
                                        fill: "#fff"
                                    }));
                            if (o && n) {
                                var u = J(),
                                    R = J();
                                a.push(i.a.createElement("path", {
                                    d: K,
                                    stroke: "#FFF",
                                    strokeWidth: 100 / f * 3,
                                    fill: "#FFF",
                                    transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                        f / 100
                                    ) + "," + String(f / 100) + ")"
                                })),
                                a.push(i.a.createElement("g", {
                                    key: t++
                                }, i.a.createElement("defs", null, i.a.createElement("path", {
                                    id: "defs-path" + u,
                                    d: K,
                                    fill: "#FFF",
                                    transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                        f / 100
                                    ) + "," + String(f / 100) + ")"
                                }), "                    "), i.a.createElement("clipPath", {
                                    id: "clip-path" + R
                                }, i.a.createElement("use", {
                                    xlinkHref: "#defs-path" + u,
                                    overflow: "visible"
                                })), i.a.createElement("g", {
                                    clipPath: "url(#clip-path" + R + ")"
                                }, i.a.createElement(
                                    "g",
                                    {
                                        transform: "translate(" + String(c) + "," + String(c) + ") scale(" + String(
                                            f / 100
                                        ) + "," + String(f / 100) + ")"
                                    },
                                    2 === n
                                        ? F
                                        : 3 === n
                                            ? U
                                            : 4 === n
                                                ? s
                                                : 5 === n
                                                    ? g
                                                    : void 0
                                ))))
                            }
                        }
                        return a
                    }({qrcode: A, icon: o, params: t})
            }
            var NA = function (e) {
                    var A = e.qrcode,
                        o = e.params,
                        r = e.setParamInfo,
                        a = e.icon,
                        K = o[5];
                    Object(t.useEffect)((function () {
                        r([
                            {
                                type: j,
                                key: "\u80cc\u666f\u56fe\u7247",
                                default: "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QEWRXhpZgAATU0AKgAAAAgABwEO" +
                                        "AAIAAAAYAAAAYgESAAMAAAABAAEAAAEaAAUAAAABAAAAegEbAAUAAAABAAAAggEoAAMAAAABAAIAAA" +
                                        "ExAAIAAAAJAAAAiodpAAQAAAABAAAAlAAAAABQcm9jZXNzZWQgd2l0aCBNYXhDdXJ2ZQAAAABIAAAA" +
                                        "AQAAAEgAAAABTWF4Q3VydmUAAAAIkAAABwAAAAQwMjIxkAQAAgAAABQAAAD6kQEABwAAAAQBAgMAoA" +
                                        "AABwAAAAQwMTAwoAEAAwAAAAEAAQAAoAIABAAAAAEAAAISoAMABAAAAAEAAAISpAYAAwAAAAEAAAAA" +
                                        "AAAAADIwMjA6MDU6MTQgMjA6NDY6MTMA/+0AfFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAABDHAFaAA" +
                                        "MbJUccAgAAAgACHAI+AAgyMDIwMDUxNBwCPwAGMjA0NjEzHAJ4ABdQcm9jZXNzZWQgd2l0aCBNYXhD" +
                                        "dXJ2ZQA4QklNBCUAAAAAABCQrEhpTykhBw18M4lq86qT/8AAEQgCEgISAwEiAAIRAQMRAf/EAB8AAA" +
                                        "EFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFB" +
                                        "BhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVl" +
                                        "dYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TF" +
                                        "xsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAg" +
                                        "MEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkj" +
                                        "M1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3" +
                                        "h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj" +
                                        "5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCg" +
                                        "oKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgMDBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQ" +
                                        "EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAIv/aAAwDAQACEQMRAD8A/f" +
                                        "yiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK" +
                                        "wvEfiTQfCGhX/ijxRfxaZpOlwvcXV1OwSOGJBlmZj2H8+BycUAbtVrm5hsrd7q4bbFEMscEnA9gCTX" +
                                        "5K+Lf25fHXxoudQ0b9n22t/D3h+zZVfW9SuYEmu4mjbeYYwzeUARw2S3QgrnFfIs174K1S0gi8XeI/" +
                                        "+E58v/n/AN//AMcNAH9BGneMPDGrW63NhqcDo3Tc2xv++Xw36Vk23xO+H19xY+IrG4I7R3CN/Wvzr8" +
                                        "L/ABC+GVqrpBoGkRAY6OfTHcnNfQvgP40/B29hSOzt9Ptgeiqy8euM0AfSfhjx3p/im3FxbWdzaA9r" +
                                        "gRK3/jkj12bukSGSRgiKMkngAe5NfLumeMvhkujedMVsh/etnYY75BV69Z8MeLPDGp2At7ZrhFXqJS" +
                                        "wP57j/ADoA9NorjJNA0bWLeb7BdXFs8n3p7S4liJbpn5WwT9Qaiji8d6TBbL59rroRdsu9DaTMezBg" +
                                        "zofcFR9aAO4orkNF8Y6dqtrBLfQzaNcTqD9mvwsMoJGSBhmRiO+1jXX0AFFFFABRRRQAUUUUAFFFFA" +
                                        "BRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9D9/KKKKACiiigAooooAKKK" +
                                        "KACiiigAooooAKKKKACiiigAooooAKKK/Mj4hftZ6n8WPiBJ8OPgLdvc+ELS3uIdX1+xl2i7aZFUpp" +
                                        "1zGC6GDcSbiNgd2Ch+UMQD9N6K8Z8O/Ea0sLh9J8W6nD9oYhwRtQWqFBiObc24HIOHYDOeelfL/wAe" +
                                        "f29vAHwouNMtrQSyWl4yvNe+X/qYs85hfa4z2LD8O9AH3H4l8V+HvB2lza14mv47CytxuklkyQi5xu" +
                                        "O0EgDucYHevnv4jftC+JvDOkXWveCPAV94o0y1CsbxJooYiQzB1IkIbjGAV3nJ5Tsfza+DfwB+Jn7V" +
                                        "vjTTfjH+0F4l0i5s9N3Xen+FhG7RhRkA9FVhkrt1AvqHmLxuyor9t9K0/TrHRrTTNPgWGwggSGGED5" +
                                        "UiVQqoB6BeKAPzr8U/EX4x/Fm8uIPAni+Ox0wxeZCujeWl1/FyTI5POB/GB6AV5fa+MPjK2tHSvC3j" +
                                        "me1gT/ll4g1C4a+/75RwK8Su/DPx88VfEj4i6x8P9DuPEHh7QfEmq6ZHC8hUC20e7KeUhIG45JAwST" +
                                        "g9a7HTPD/imHUTNF4XxqMf04/H/HmgD6c8M/G34q+CdI8JaZPquneL2v12yyXF7B5r8feEnmAsffn3" +
                                        "r7N8M/Emz1iddN16xl8P6jiP91dOhjd5BkLHMjFHbr8uQ3tX5kpD4murwrJ4W3oPu5Pl9+e1cde/E7" +
                                        "4maDp+oST239lO38ZD0AftnX8zX7eP7bi/Gr4kaj8PvBFz9p8J+ELh4dPWK6jFvqOoxCQPePsOJYgV" +
                                        "KQjdgg7hgvitzxh/wVK8WaT8Ctb+E1xodv4p1XVbafSodYvC8lu8UhC3f2iMt+/JhlKxFWUYKO4YEq" +
                                        "fxhsLO71zU0tVfM905JdyTzyzMT196APYLn4n+MvE/itJba+lnkmbbHbksyE+gG6v0X/Z//ZW+Mniy" +
                                        "6j1LxSDpMEfdt27/ANDr560zQ/AXwX0ANomnyar42Rvkvyx8uP8A3F7flzXpukftr/ELUfD50fWJ/M" +
                                        "Cd8Y9/xoA/Tbw/+yR4fjjKapr7Dfxx7f419C6H+zT8FI49l5qBm+rgV+Wfhn43eKZOvhrPX++Pwr6J" +
                                        "8KePrrVWk3kAp68Y/wDH/wCdAH6B23wN8KyJ5nhrUmj78HPU/hU//CpPEljn+yvEDp7EAivCfDMW4F" +
                                        "MY/ng/8D/WvadH8azWi7bnUdRtx/00UH/2agC1DpXinSLtGj0VXjX0LV1dr8TX8ML5Pih7mY/3jAf5" +
                                        "5NdZp9/LsYHUheY9No/ka0bvw14S8XRbdU0xJxuPDgdfwNAGreJ4X8W6c+m+ILS1vraT79vdLHNGfq" +
                                        "rZWvOrH4bax4Wu21b4ceJblrZl2/2ZqExu9PxnIEPO6HH+wceorotZ+Hvm77zw1ftpl438ajcp/Cqe" +
                                        "j+IdT8O3clh4pgufJAyLxwGRvbjkUAR6b8WrK1vrXQPiDYSeEtYuI94W6kje0kYEAiG5RirdR97afb" +
                                        "ivWYZYp4knhdZI5FDKynKlSMggjqD2NYFncaN4y0dhc2yXlnONrxTxq6MPdTkH8a8u0T4cXHwa0n7J" +
                                        "8JLaa90aFfl0S6vZHWM8YNtNOZXTvlCdpJzwaAPdqK57RfEuj66Xt7O6iN5Cqma2EiNLDuAOHVScde" +
                                        "vT0roaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/R/fyi" +
                                        "iigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK8o+NXxX0f4K/DLXfiNrELXh0q2ke1soyfO" +
                                        "vrsITDbRYVjvlYbchTtGWIwpoA+Dv+Chf7R2r2Gn2/7LfwcvY38b+Nx9n1W5iYSHRdOdVdvOXDBXuo" +
                                        "ty4Y7li3Pgbo2rG+E93ov7Pfw5sPCPhLRGl1STqNnLH5+c18I+DvGM/g/VtR+JfxEudQ1jxH4le5k1" +
                                        "TWJIFiV2vWB/cxqwVUSNFCqAABgKMYA+OPHHxw8ffFzxjD4J+Hob7TqubGNFPL7n4AzQB7j8ff28fi" +
                                        "d4i8Qy+FtP2nV7aQRGewJCs/oo5z2/lX2V+x3+y5f3v/ABcf4lRsSchdPvwDph98Hr+PFUv2Rf2JbD" +
                                        "4TWLeOfiP4dhn8WH/VweIlCwx57qvzc+pPNer/ALTH7Xmi/C3wwfCWhqGnYYs7P2Hr7elAH1x4q+Of" +
                                        "gv4akaLb3Gl6AecBiAMd+AMV5o/xZ+Kf7U0J8KfBg6j4H0+AkX+qyoodf9hO/PqP5V8S/ss/sfeKf2" +
                                        "mrpvjF8bpSun3ZPlRg/PJj27Cv3U8H+D9D8D6HBoOgWy21rAOFXufWgC74f0K38P6bDYxO08qIoknk" +
                                        "x5kzAY3OVAGT9K+UPi9rmveBPjfo2s6dp4l0DV7Dy9SkXr9pjdxCT77ePwFfZDusamSQhVUEkk4AA7" +
                                        "n2r87/AIh2E/xv8Y32taBqqx22lzR28RXo9ogcu3/AnJI9qAPU9O8Laxa6+733iEvGNny9On/Au9N8" +
                                        "T+EvAt4qDXCFQepx0/4FXK3XheKI+RrJyknP/wBc/J/n8q+Ufij4o+KMMIRPDfB9/wDP+fegD8Z/2z" +
                                        "/grB8MPixqep+FLgah4W10rqNrLGdwh+2Dfsf0yfunuMDtz8co7RuHQlWXoR2r63/ah8b3XjvXH8YS" +
                                        "zf2UddMe7Q1zttVhQYJ+Yjk9OPWvkWgC8+o3zytN57h36kHH8q+sPgd8ONJa7sdX8aauLC3lb5V6lR" +
                                        "6mvk6xjaa6SOM4lJGz/e7V9r/DjxNbWmkWh8ToWAJz7igD9MvhPoXhMaZ5h/znrmv0C8HL4ai0Aor8" +
                                        "fj0r8nLD4yfBbwvpmwLuI/Lnr+la2mft/wDhbw14e8pLYs/pnpQB+xfh2x8M6kmdK0RUA9QOP/Ha9J" +
                                        "m8D+HdQXM0QJ/PpX5oaF+398EmDbCxLn+7/n6V9K+Bv2xPgnrG9LvxEisP4m4/H71AHr178JbW11ga" +
                                        "x4an1GwkfqFYbT+BU/zqK31v4i+E9aaEaL9v09+jK2CPwr0bwT470DxRoovPDepiVB3uPvflnNd9Ct" +
                                        "y9v5l2tqT3KglPzNAHIeGfHOh63C/2S98qZesdydrD3xxXbXKW13EItRgDZ/hPP5V5p4n+FfgrxuPt" +
                                        "ywLDdkcTIMHHPXI9zXgia78cfhP4vhsPHOlp4x8IMrSv4lDJFLpqjqHh6lcd1/EmgD6Y1vRNeUHUfC" +
                                        "d/5TqDi3cZjb8e1WNI8USJELfX1EFwOpHQ1a8P63pOu6UNT0K+WeB+Qw5H5ZrpJra3vE2zoGz1oA5T" +
                                        "xN4L0bxY9jqhP2fUtPcS2l7CF82I98ZBDKw4IOQa5bwp4s8S6Lf23gX4kIbjU4bRZP7cijjt9Pv2XC" +
                                        "tiPzWeGXJ5Qjb1KtggDrGGsaVeqr3afYT03LyPbNbPmaZrli1jfCG5juY8Swth1ZWHIIPUUAbVFcR4" +
                                        "T0a58I2kHhcSSXen26hLSRljXyokUBYSE25C/wAJ29OOgBPb0AFFFFABRRRQAUUUUAFFFFABRRRQAU" +
                                        "UUUAFFFFABRRRQAUUUUAFFFFABRRRQB//S/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooqr" +
                                        "eXdrp9pNfXsqwW1sjSSSOcKiIMsxJ6ADkmgAu7u10+1nv76dLa2tkaSWWRgkccaDczMzHAUAZJPAHJ" +
                                        "NfgD42+Pc3x9+Llv8AHq5t7yTw54blVfBGmXBW2e0mVVE9zcAPFl5pVGR5jbV2rk4Br2Cw/bM8Sftp" +
                                        "/HbT/wBnfwJo9x4V8LwalJNqU12B9suLPT1MhSeIkoI5XUZiByeAzEEg+/fHz9k/9nS18HWekeONf1" +
                                        "C68R3avHo7X+oIbq+vILJoV3xqiebHFM/2x1VQElYiMLEUgoA/DXxt8RvH/wAWfFUXgr4db7+9ZRZ3" +
                                        "F2BgwDOMZ7D3/Cv1a/ZK/Ym8NfBDwA3jHXsX/jTUgdt0D8kSnsmf1r2L9l39nHwv+zh8LIpBow/4TT" +
                                        "Vl/wCJjf33UnPCjrhR6fnXxb+07+2tLp+hN8OfBR8q9PEjWR4A9Px9qAOE/a9/bDt4NTi0HwnIniXx" +
                                        "NGdr3JUlEA7Ko6mu5/ZA/wCCeXiv4v6rpn7RP7Q2tG6F0xlj04g+bJt4Uyt0UDqAK7/9i3/gnddWGr" +
                                        "L8X/jnYjVfEHmGSKCWT5A5/jYdC2OnpX7exx22l22wNtiToCf0FAFbRtC03QdMtdJ02IQ21moSNR0A" +
                                        "AxXi37QH7SPw0/Zy8G3Xi3x/fiAKNltAg3SXE5BKxqB3OOc4wK88/ad/bI+GP7OHgjUte1S/ttS1uJ" +
                                        "AlppMcmZp5nyApx0HGST0AJr8j/wBlD9nL4nft2fF2b9qD9pWKS68GRTPPptjclhb3u2YlbeFecWsR" +
                                        "yGOP3hGDn5qAPu/9mzxt8eP2sfE0XxP+Iwk0D4ZzpKLDQItqrcAoFJvtyEzod2QOBnnHav0Y8V+GNN" +
                                        "1/SLi2uLeN2KqQWGP9U25QcYOOtb2mabZ6RYQabYRJBBboERUUKoCjHAHFeD/tD6nr0/hqDwT4beOG" +
                                        "fxCXgnnN2LWW3iKnY6HIbLS7VyD0yKAN4eE9JGqeeuq32P7mTj69a4P4r+DdN1fSQtjGNw/z/erm7T" +
                                        "wt8R9f04KfEWk5P3s6CcL7Dc9YtxoXinQIw2oTLPs/u6AefyJoA/ng/a9+A6eBNV1fxRFb/ZFuLlXV" +
                                        "O2G6/wCfpXwNX7c/t7/JoEQ1g5lB4/z/AJ/pX4jUAOUsrBlOCORXQTeJdSntYrLCLFF0CjrXO11nhS" +
                                        "a20+8OtXOWFiVYKO5PAoA1PB/gnVvGOofZikuOzMQuT7F+K+ttF/Z78AtpC3ssVz5pxzeuY1/JcV8x" +
                                        "6p8Tdev1Fhpl5ePF/Cjvn9FzXE/2d4inY3ctjeuD/EqOP120AfpHF8EPhna+IvL1XWbDw5jp5+hu4/" +
                                        "Imu4f4CPndpL/2e/OP7OycV+X9l4x1HS5jH9njs2H+zISM+oMgr0bwv8X7PR5PMYz2ZP8Az6gLQB+q" +
                                        "Vt4Y+NfhPL6F4l/tEHPv/aPv/SvdPgn+1x8YtK+IY8PfEDVYY9BZSFtb5Asy/Rx834GvkX4ZftOjUN" +
                                        "AMOueG/wC1sf8ALTn/AEAD8/rX6LfCzXvhj8b9Jl0mSTRfG8AUn7A3/IYGOpOccfl9aAPtXwr8fvhz" +
                                        "4gvLfT7zV7fTdUnHyW5k5b8cV7vNDbX0DQzos0MgwVPIIr8Ffjd+zz8UPgfrL658HB9t8D4G5UO7WV" +
                                        "J64PGfY/mK9N/ZN/bu1DU7Z/DviG4k8W6i3+ptoAFlGPQkc/iKAPrf4kfB/wCJXww8TT/EL4CtCuky" +
                                        "sbm/0YjaryKOWj9iO3Y1698Df2gvC/xXshp8zrZeKbdB9us/4o2+vp6V7L4N8Y6P440WLW9GZvKk+8" +
                                        "jjDo3dWHrXzP8AHz9nLUfENl/wmXwMu4fCHj6wfz4byNBsmwMFJFxjkeowemKAPr1khu4drqJI3HQ9" +
                                        "CK5/+zZNNuzeR3G2Ej94X5Ir5d/Zl/aDfxre6j8GvHANv8QPBkaJqi/wPngOuP1r7HKhgVbkGgDMsL" +
                                        "ppYxHcEJJkheR86juOc1oK2MJIwMmMnHH5DmqUduLGPy4fuHFZcN6Y5CkzhkjX5LrOVwFGfO5ABz26" +
                                        "H2oA6aiqdu8uDHPy6BcsBw3HXHbnPGauUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAU" +
                                        "UUUAFFFFAH/9P9/KKKKACiiigAooooAKKKKACiiigAooryf48eKdb8DfA74ieNvDTrHrHh7w5q+oWT" +
                                        "OodRc2lnLLESp4IDqMg9aAPWKK/nZ/4Jk/tB+I4tQ1hvHfjO61C2nkAMWo313d3L3TAYKqwZSCP1r9" +
                                        "zPh18WNG8cTS6HePBp/iS1QyTaf5yySGEEDzoxwzR5YAnHyng9QSAetV+Un/BWz9oJ/hL8ArT4baWj" +
                                        "HV/iZLPaByuY47CyEbXTFuzlpYVUY5DMe3P6t1/Jj/wVQ+OB+Kn7VWteG9Iu1m0XwDCmhRGLeoe5iz" +
                                        "Je7w2PnS4d4TgYIjBGRyQDB+Fn7TH/AAw9qUsnwf0Iap4zvrV7PVJ/ES+ZaLA8iSqLeCyuI3U5QZ8y" +
                                        "Q8dMV+vHg+ab48eMx+0v8TlTTF1C1Ol6VZWzKX8O2IYuo1Nt6EySyMzsexOBgAAfzDy3s+oX4vNTme" +
                                        "d5GBkd2LMeeeTX6WeFv2xfGfhz4dWPh3wtH5Xkk5vT1FAH1n+1t+134xvry/8AhppEbaR4vQhWsxhu" +
                                        "o6A+pr6O/Yf/AGE9A0jwuvjX466Alz4xdyVWRsrGvY4B5Y+tfIn7BPh+DV/jA/j74ohtQ8YrmRL52z" +
                                        "1GDz0JOev9K/oytfL+zp5X3McUARyNBp9qzgbY4xnFfn3+1/8Atb+Gfg14Pu0u70fbbu0PkwoMszOc" +
                                        "D86b+2/+1anwD8HO2lX6jUZbpI1UDcyjqa/KT9lD9l34gfttfEOf4z/GGS5tvA2magTHpjO+JT97yo" +
                                        "dxAWNeAzAZbpQBmfsrfs+/EP8A4KDfFK4+J/xi1S/TwN4fZ0tJQ8MhaaOUSJZgHkLtOZX2ZbgAj+H+" +
                                        "mzR9G0vw/psGj6Lax2VlaqEjiiUKiqOwAqh4V8KeH/BWhWvhvwvYQ6bp1kgSKGFQiKPYCujoAw/Eni" +
                                        "HR/CPh7U/FXiK6Wy0rRraa8u53+7FBAhkkc47Kqk1+DHxF+P1x8YPHuq+L9Qshpmt2wW10ZOSf7KDy" +
                                        "FmY+pJJP449K8z/4Ke/tzQ/F3Vrz9mb4SmSfQdF1IR6veqPl1G9s24ghBGTDDMDlsYkdAyExhWbxH4" +
                                        "bfDPUDrFy3jXUJvFeuo37lfDxV7XH+0V+zLn6UAfb3hL9or4n6so1yXX12eh4x/n3r23wh+1FfeKfE" +
                                        "X9l+KYdZ0vHbaMfkK838C/DvX7N9+q+HdDcp/rOf0/1dekeJv2eF1O3L6UdaEh4HI7/0+lAHyj+1H4" +
                                        "nfXfBGo6Rqh+3WGYyCOoPyHrX4Y6lbfY7+4td4l8p2XcO+D1r9mf2ivC2rPb6m6f8AEv0rQ8cZzX4x" +
                                        "XlvLbXMkM3Dqefx5BoAq1oWP2V7iOK9kZIC3OOR9T0rPrb00WNvC95dsGcHCRbc7vU59vwoA+2fhH8" +
                                        "IvE1jPDPZ6Lp14dXG2LznLcegyfev0F+E/7MMfi3954h8PaKjye59OtfjXpfxm1jw7qw1fwzpGmWUw" +
                                        "6b7SOZf++XGz/wAdrs7L9r79oHTrs3tn4naOQ9/Ji/8AiKAP3Gl/YHv30YaQbKK98KEbgm/bLj1A7/" +
                                        "Wvg/8Aai/4J5X+geMJdQ+FtjD4f0a6KJBZSC5a1hUdWe6uZ7iUsfQBh/u1xPwq/wCCqX7RXgW+C+Kx" +
                                        "p3i7T3IDJfWiK6DuVaDyefY1+unwC/4Kkfs+/Gy4fSvHwh+G9+3CrqV9mCT0xceXEg/EigD+Z/VPD/" +
                                        "ij4ZayLTxVY3dvDKJEikt5Wt47hFOC8EwUq65xkgHqAcdK+tv2av2gE8B2dwNTlk8Qyjn7NKCMAnqC" +
                                        "c5r+hD4j/sUfAj4teDksdH060n0t/wB9bRwt+43Y+8kkRyM9ODX8yn7QH7Nfj79m7xrLHrGk3F3oFt" +
                                        "co1vc3ER8uRQcqk+zgE9D0z2x0oA/pE/Z3/aK8JfF7w82m34AnXgr149a8F/a5/Yc1j4p6fF4m+E0y" +
                                        "eFX0aHH/AAjFjGiJKeuRswisfTGOK/G/9nX9oPXfCNxBYaZeNZ6ijZRuNrD/AOtX9Fn7NHxr0zVPDx" +
                                        "XxL4iXVHQ/8f5wFbHqaAPyR/Z3/a01P4W+PJdE8aapqsfiW3Yw6ksoWRGKnoQzdRmv6LfA/jLTPHXh" +
                                        "208Q6Wf3Vygbb6e1fAX7cH7FejfHDwtL418BaSlt47gAMb5CeYvo3bI7GvzD/ZM+P3iT4RfEW48G/E" +
                                        "fVtZg8R2ANvZaW67kYt/AwPt07UAftJ+018AbnxxfeGPip4H1RfDvinwHI89vcBAUeFh88bDpjGfwJ" +
                                        "BruvgR8d7T4rQ6jpOsWE3h7xJpMzRz6ZekC6VB0cr6GvSvh78QtH+IGjJqWnNh/407g18k/tJ+BvHn" +
                                        "wz8SQ/tNfCaIalf6cI4/FVrIFe4vPDkB3z29gvH+lAcwjcvPG48KQD7zlVmjKqcE9DWfJcraqNxy7S" +
                                        "Y+ua4/4WfEjwx8W/A+mfEHwfd/bNJ1iPzoHxtIXoQR1BBGCK7OfT4priO6HDoQf5/wCNAENqt69rsn" +
                                        "mQ3iDBYD5QT7ZpukXV7JF9l1QIL2EASFOFfgHcoySBz3qO4eXUIpraxuhZX0WN/wAocrkdweoPauN8" +
                                        "Za+dE0KbxnZQNOlkjLNhB5qxMwDTqM4IQDdjuM/SgD0+iuf8L+ItL8XeHtO8T6JOlzY6lCk8UiMGVl" +
                                        "cZ6jjjofeugoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9T9/KKKKACiiigA" +
                                        "ooooAKKKKACiiigArxj9o2zfUP2evihp8f37rwtrcQ+r2Myj+dez1heKNEh8TeGdX8OXPEOq2lxaP/" +
                                        "uzxmM/oaAP5Gv2H/HUnh3x5pFpNZebALg4cd88nP0r9vPi38Rrj4YL4c+J+mXt+9p4Nmke/klXfFNB" +
                                        "Mmx0YH1z17HGDkCv58f2Wr5o/FpsX5ilYH8utfpj8e/F+s6d8L/F8fbWrKHJ9s80Aft5d/HXwPp/wE" +
                                        "T9o3UmmsvC0nh+HxGEn8uO5+zT2y3McO0ybPPcOsap5mGkIUMcgn+G5mZ2LuSzMcknnrX3JrP7Xj6h" +
                                        "+wboX7JFtDcWmo6X4hmuZ54gotbrRt8l6kUrFi7S/bpt+FVVCxJySSK+F6AADNe7+ArIy6I+OcHO31" +
                                        "968Ss38u5R/evfvBt1s01s84/KgD9GPg54uPhG50+TSTnNfofY/tceL4fDwn0+2WRx69v8a/IP4cf8" +
                                        "gCT/AK519j/BXwprWuX4kfmIe2Py5oA+1PBfwKvPj/4iPxD+LigQxf8AHhp38KD1J61+ifh7w/pfhf" +
                                        "R7XQtFgW3s7RAkaKMAAVm+CPD9j4a8NWek6emyKFAPxrraACvyA/4Kd/t2/wDCkvDsvwM+Eer+V8Q9" +
                                        "biX+0bq2b97o1hMuRhx/q7q4Ujy8fPHGfN+Rmhc/TH7eH7Y+m/sg/DC11Ows11Txl4oae10S0lyIVe" +
                                        "FAZbqcgcxW5ePMYIeRnVQVUs6fy0eB/BfxC/ah+KGr6lqesW9xqt402sa1qOpXcNtttw2+7uT5hTKx" +
                                        "JukYIMIingKBQB3/AOyt8GvEnxF16bUrD7SlvEpjgtYWtw+r3QyVs4luXVGJA+YlXAGehxX9DPgL4O" +
                                        "fB/wDZZ8B3Oo+N/EA/4RAY+eb7oJ4GduT+ArltT1HwV+xR4T8U/EifT20Dw6bpJLWytlDtNLL8qqo/" +
                                        "2ifXGOSQM1/PH+0b+1H8UP2mvFC+IvHt4Y4Yo0SKxgYi2jK/xBOAWPqRwOB3oA/cL49f8FTvhf8ADP" +
                                        "xUujfDBNN8Yw2krQXBso3dIymPmS6BWCdTjhonYH1xzXwEv/BU7x3/AGvd6lL4RV47z78X9r3ePwPb" +
                                        "8q/KmigD9yPhx+3f8DfjS0vhT4vaYvgzWNUBj/tnUn/tKzX72N7+Wrp16ldo7sOtflh+0b4N/wCEH+" +
                                        "Jt/oP2r7c1sI43m/vSKoDV4NXdP4jTXtHi0bxAzzXVrhba5ZgSkaptSJvkLFQenPfHYUAcLT327jsz" +
                                        "t7Zrbh0jVLXUfsd3pk7TxoJmgZGSQRKnnFiCuQPLBbOPu89Kyrq1ls7iS2mGHiYqfwoArUVI8ckR2y" +
                                        "KVPvUdABRRRQB9q/sp/tufE/8AZZ1CSPw641DQbpw9zp0mBFMSSSxO3Ik5+V85AG0grwP6YfDPin4J" +
                                        "/tv/AAe1LW/AM6Ry3qtA1y0KLf2F2i/KXByQV474I6V/GTX0L+z3+0b47/Zx8Xx+MvBE7m8hKYikmk" +
                                        "FrJGpLPFNCpAdJM4PQjqpB5oA7r9rb9lvxr+y18RZLO8tJbfQr+aR9KuC+/wDdg5EbOOCyg/UgZ9a9" +
                                        "3/Zz/abln0y78Oa/oEd6gHmXsqceZGeASPrX7r+MV+G//BQf9lLWtO8IXVvfzX0LCEFmX7HqsHzIr8" +
                                        "KwG7uRyD9a/lL+K3w58UfAn4oax4E1tJoLzRrl0jlkjaA3NuT+7lCn+GVOcZI6jOQaAP7D/gf8TbDW" +
                                        "NMtPC1/qaXWowJgn+9jpXwr/AMFKP2UdV+IXhaz8YeA4v9N0YYjhU4C59PrXxt+xx8bn1ay1C5uNbN" +
                                        "pqN7J5VlA/Zx+f51+5Hwk8aaJ8YvhvbTLOtxdPHtmnVVyLlcg3MYI4y3zKe3TpQB/Ph+xR+3hrnwyv" +
                                        "l0vxuv2yw0u2FtDgEEKzdD9MV/ThpOo6P4u8PW2rWLJeabq9usikHckkUy/qCDiv5mv+Cg/7MGtfA3" +
                                        "4o23x58EaXeN4SupLSXUpZbqNmjvWbDRmMYlVJQnU7hkkZAwK+v/8AgmD+1tpmrSD4P+LL3Ze67NJL" +
                                        "paMOfMjXMkefcLkUAenX0+j/APBPL9oC2061N5/wqH4tXeIYxtFr4b1JpsNj7qJZkz5wecenk5m/XN" +
                                        "HDosg5DAH868R/aM+E1l8a/hHrngO7jEktwqT2+7tPAwdD+Yx+NfPP7EPxn1Xx34d13wD4+1FZvF3h" +
                                        "PUZ9NmjHBZLIIhYevJ5+tAH25PBDaaidXfq6LCfpnj9aranCNsxJALDDf9cBjcP51u3FvHcxmOQZBr" +
                                        "HuisdtbMOkTCP8elAHHfD28mtbjVfCc06zx6NIkUBH3hH5akhvoxr1Cvk278XaVoXx20K7XUVf/hIb" +
                                        "NbSaPqPMfb5ZHpk4/OvrKgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/1f38oo" +
                                        "ooAKKKKACiiigAooooAKKKKACiiigD+Jb9mTWjo/jiRscPEa+6P2iLxtN+G3i9X66vIv8AMf5/yK+L" +
                                        "/AvgO+8AftIXfwrvJVuLvTPEj+G5JF4V5Ir0WTsPZicivQP2hfibb61p8VjNd6e85/gt0LN9Sf8AGg" +
                                        "D4cu5zc3U1yesrs/8A30c1XoooAu2EJnuo09SK+j/Bn+s/AV4v4Q/18n+7/WvpLwPZbpN45I/r3oA9" +
                                        "/wDhlYZPP3frX7K/s4fDmGK70y6b+BSa/Or4M+EjfeJtN8w56/y6/wCetftt8DPCEWg+HbYdcLn/AA" +
                                        "oA98gjEUSRjsKloooA/l3/AOCyniLT9f8A2rtD8PadqUc7aH4asbW7i3/LaXc9zdXBWQfws0EsLn/Y" +
                                        "Kn0r9O/2Bf2aNA+HvwYi8PappZXWNahY+J0mbJF2rv5UQHTCIQP16k18Iab4F8PftU/8FRfiZ4m1Sw" +
                                        "mOkeD9TEBtiVImvNEgWwjZ2Gf3TyWbSgdcbQe4r3f/AIKxftAjwN8J7D4F6Ex/tPx7i8vpMcLp0LKy" +
                                        "qDtHMkigfQN6igD8if2xP2qPEv7S/wAQpJheTL4N0Jng0azYlVESnb9odT/y1lHJyMqML6k/H1Fb/h" +
                                        "/QNQ8QXotLCBpz3C0AYSqznaoyT6V1WkeDNc1diLe3YgV9C/Df4EXepazjVhmMdEB+/wDRulfengD4" +
                                        "G6PPb2qHQTIp8vKf/r/z36UAfEfw8/ZO8VeLvE9jZvp88mn3B+ZgSDj0zt/lX3Z4C/ZG+GHgaPRbzX" +
                                        "dLs9S8QbtzQTTu6E9vlK4r7Z8M/DzSvD2RG/3/AOPivWV8Ef25xJoesEnq5YD+tAHxT8WLvwrr/hc2" +
                                        "2lryCf8AP+pr4Q8U/BXwrqGgx3tppDIR3B/Log61+0GvfswJokJfQZcO/VMH5/zdq8K174LaHpTx2+" +
                                        "p6ACEwO2P/AECgD8Zbz4NMSTp2iONnXO8185a74fu9Mv2tltnjH908mv2i8S/CCxUxgaBgj/PNfL3x" +
                                        "I+HFzAQrjkvn1/8AZcUAfm2VYDJBAPtTK+kvH/w3v3ug7EWgPIRlUf4V89XdhdWLlJ0xjuOlAFKiii" +
                                        "gD71/YN/a+179l/wCJax3Mb6n4X13EF5ZhsFGJ+SSM4OCCeQByK/YH/gpz8EdG+NvwJHxz8J6jYT2+" +
                                        "k6fFrNtdu+POtEiaTEEmD8lzBIDjq8kcCjgk1/MTX9Cv/BJb9om88a+CvFH7N3jPVA8mm2jT6N9oIO" +
                                        "LeTcssQJHIjYqQCeAcAcUAfhr8LviPqvw18RjVbBj9nnAjuY/78f8AiO1f0zfsk+MzoieGIvDDAeDL" +
                                        "2GYXDt/DLj5T+fWvwL/bl+CknwK/aP8AEvhaIMNO1Upq9iWxnyL7LkfRJRIg9lFe9fsS/HzVdD0+78" +
                                        "BXS5062HnzP3MR3Z/ImgD+ln48fCfwv8Y/h5qPhvxJp66iBE8lsrdVnA+RgfXNfx5arY+LP2afjVq/" +
                                        "h6SYr4j8DalIthPGuU+1Qyr5cyqf4XQBgM+gr+xv4L+MrPxf4I068guBO7RBwfVG6V/Px/wV++Aj+C" +
                                        "PiFoHxe0uNn0/xLG1ldSn/AJ+7cblz/vRk/wDfJoA/fr9nr4q23xn+Efh7x9CQJr6AC4Ufwzp8rj8x" +
                                        "n8a/PX44Jpv7MH7efhT41XdyLHwn8V7V7LVycnF5p8eFbHYEGD/x6vmf/gkB8eYrPWfEfwz8S32+48" +
                                        "UXTX0Jfq12F+cZ/wBpRn8K/U79uPwbY+LP2ePELSxCS+sDbTWjd1lFzH0+ooA+vVYMAy8g81G2C/l9" +
                                        "iK8/+E3je3+I3w38NeN7UbYtbsYbpR/vqM11Wq3AgvNOTvNMV/8AHSf6UAfHHjRho3xN8NX7H5pbsL" +
                                        "t+rR19tWsrT2sM7p5bSIrFeuCRnFflb+0zY+L7G98JNEPMTS9S0j/0aoPP5V+pOkTm60qzuD1lhjf/" +
                                        "AL6UGgDSooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9b9/KKKKACiiigAooooAK" +
                                        "KKKACiiigAooooA/ie/aKhv3/a7+Llno7+RNJ4y8RRqRwAv9oT5H5Vi/tB6LpmleLpZ4kaLUbyWR5o" +
                                        "+CmAcA/Wvof9r3RdG+D37fnxOg3Pe2b6hNqr+ZgESa1ZrqEi8fwpJcsq98AZ5r5E+LniiTxZ43u79j" +
                                        "+7gVLeP/djGP55oA8yooooA67wzbebKT6c19mfC7w6JbaUGXj6V8veDLfdJb+5r7P+EVjmbZ0I+goA" +
                                        "/Vb9mbwv5XjGR8YUA89/wr9YtDtvs9t9a+MP2XPD6QWEurf2L9mMnfp9eK+54RiJR7UASVw/xL8b2X" +
                                        "wz+HPir4kalbyXlp4U0q+1aaCIgSSx2EDzuiFsAMwQgZ4z1ruK/N//AIKtePLLwZ+xj4n0uaeaC98X" +
                                        "3um6PZtEDhpDcLeSo5B+VGtraZSe+Qp+9QB8zf8ABLfwKY/h1ffEzWdSk1XVte1CfVLqedzJILlkK/" +
                                        "vHY5aRgWdi2SSxyea/Fj9rD4h6f8XP2g/FeueE52ufDgvns9DRQQgsom2QrGD0DfewectX9Dtna6X+" +
                                        "zx+wdr/iO25ZfCHA4+aW4Uqv/j01fzMeEPBV1qPiBbaROI87l/AnHJWgDA8O+E9S1q/GmxWbyXD/AH" +
                                        "V6ZPpivsnwD8MPsVoskmgmVV/jP8Z/OvRvhz8MNHvtMRFBTxs55yelfoT8KvhWkWkumtSZx7/gaAM7" +
                                        "4N/CIS+GhFrGidefrz/jX2B4V+HseibkOhYCZ712Xw98NaNpenB4NECZ/X3ruNP0ZG1VdyfrQB5xB4" +
                                        "cN1H5estnH5V3CeHdVa5Z010kt90Y6fnXTR6EDC5++n97/AD9a7KHETfYU+fPX2oA8L/4V03/PWt3S" +
                                        "9BKf8xonH5e9ei2MN7bYH9mBce9dUNNjt2+1rYBT+GaAPmC5+DttasfKcha87uvg3pOdxfea+2fsAn" +
                                        "Py/uKZceHoWX5tPU5+lAH5HeLf2ftI1sID0FfBfxq+AOnWjjY2D+H9T/Ov6Gdb+Hlje6oJv7IVn/vV" +
                                        "8vfF/wCD9teESQ6CMeoxQB/Mh8RPhnqHhK6Robd1t3HGecV5VPBNazNb3KGOWM4ZWGCD6Gv2T+MX7O" +
                                        "+u3EkjRJ8g2fx+vWvzm+J/wY1DwZBFeRv5idCvXH/AulAHz9XffDDx9qvwt8faL8QdEGb3RJxPFnpu" +
                                        "2le/sa4GtjRtMvdbvU0ewG+W4OVHqUUntQB++v8AwVk+Geh+P/h9pn7Quj3keLOGymtXll2C40+8ZI" +
                                        "WiihxzKJZI5eSMRiQ9QAfwg8DeLb7wN4r03xVp43TafLvK9nQja6n6qSK/o0/ZTu5fjb+wF4n+D/iq" +
                                        "Vhrnh+bUvCNzMcFopJiY4nXPXZFMoB6fKc96/mkuIJbaeS2nG2SJmRh6MpwR+FAH9eX7HvjlH8PeEt" +
                                        "JnGH1nTWkUe6Mx/pTv+Clvwtm+Jn7KfisWJC3egRjVVz3Sy3SyD8U3AV+ZP7CHxou9a03QoNPQ/a/D" +
                                        "tzpsF+T/ABRb5FVh9RX9B+uW2m+JvDGpWd589je21xbzA/3HUo4/nQB/Ht+wD4hPhj9rLwFqCruL3Z" +
                                        "gx/wBdVK/1r+rX9pq20W//AGfPH+neITixutGvkk9cGJsY+lfyXfAwS/CP9sfwxppBvp9B8VLpqmM/" +
                                        "6yT7QbVWX6lga/rY+NWmS3vwT12yu/vR2hJ/4BQB8cf8Ev8A4of8J/8AsqaVoU4xL4RjuNLYjuiOWj" +
                                        "P/AHwVr9Gp7wHWLaJTgYavwA/4JH+Ihe+HvF3g8aje20uj6tFqSpAcxFLmAxHI9cxc/ga/cLT23Rk/" +
                                        "7P8AWgD5Z+MCyyGXSgcB7xf0dDX2Z8MoxD8OPC0SjATS7MD8IVr82Pi1/wAjj4J/7Cf/ALWr9PfCFu" +
                                        "bTwro1q3WGzgQ/8BjAoA6OiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9f9/KKK" +
                                        "KACiiigAooooAKKKKACiiigAooooA/ms/wCC1HwsudC+Mng74vWkMEeneKtJbTpjGD5zX2myMzSTcb" +
                                        "TugnhSM7icRMCAFXP4rk55PJr+pT/gsvoepat+ybpd/YxeZBoninT7u6bP+rhe2u7YN/39nRfxr+Wq" +
                                        "gAqzaLvmA7VWrs/CERkvYsdS1AHtfgPRGmP2AHBNfp3+zl4V36Fp0n+s8zPHrn8a+TPgJ4b+0+JgM8" +
                                        "f5/L2/+vX67fs5fC2O01x5SA4AP4f7n9aAP0r8D6YNN0eGIHIC4rtaoaZF5NnGntV+gAr8Nf8Agpnq" +
                                        "tl8R/wBrj9nL9nu4MltELqPUbmRm/cTrqt9HbRRhRz5i/YpVBP8Az1GP4q/cqv5n/FfxV1j4x/8ABW" +
                                        "mDUIJXji8MX9zoukwM6FZotJtLj9wrjaDHfziXbknAuAMmgD9Av+Cm1+2j/sq6N4XjG8avPb2X/fIU" +
                                        "/nxX4XfCr4avJ8QrC1m+4Svv1TOK/cj/AIKa6QdU0PwH4fi+/JcyBPwMQr4P+DHwz+w29rdry7/5z/" +
                                        "n/APUAep/C34Xt5gK8g/Sv0l+HHh3y/DJXPX/OK8a+Gnhhl+UjGa+u/BNoUsyuOP7tAGppejodC2KM" +
                                        "fd/TtTri2inZnXdurrvJP2Fmz92nqmLjco4NAGUGFoGbd8ozuar9iUGW/hNE8Rjj8z5SV5psMpQl36" +
                                        "n/AOtQB01WTGs3fpVEuT3xW1Zx4UHsKAE+x/7dILBRWjRQBjSWQPA4rzrVPCscq89/yxXr1VZ4BIMg" +
                                        "c0AfCXjb4Rxa6NSTVdEX+zhs7jnHWvgP9of9mj7PZPLoT4QfJj/D8K/bjWtMFxnI3Zz/AJ/Wvnz4tf" +
                                        "B201jSm2uRIO9AH8nHxL+Fdz4cvZpYTlEPPt9a828L6LNqF2rqMDnFfsL+0p8CBodyFVPkm/w6V8Ux" +
                                        "fC5tD8RkaUd6R9+fyoA+z/8Agnp4zt/gD+0zrfw61ydn8OfE23NmkhQ4/tCCSXyl4/7aqf8AeHpXxL" +
                                        "/wUE+H9h8O/wBrLx3pmi2DWGlX1xBfW4I+VnureKW4Kn0+0NJ9Pyr9Gvjt4N8Q2vgyD4heEtMEfir4" +
                                        "eapY+KYC3I8rRI5p2yAgyBwcZ5xXO/8ABU3wVoHxI+H3g/8Aai8LTNIt4/2KQEbQ1o+TC+OuVfj/AI" +
                                        "F7UAfnx+yH8RV8H6z4p0G4vWtE1vTHEJ/h+0REFc/VSfyr+sn9nzXYtd+GWmFTk26mJvfBr+IbR9Qb" +
                                        "StVtNSUbvs0qSEf3gp5H4jiv7Bf2OvH0etaFcadO+FumEtqPVAOR0HSgD8GP29/DGvfCH9ty98ZXTs" +
                                        "IdXvY7+FhwFtw3leUPpAq5/wB6v6PfizqGk658D9SlnS+ew1O3UHyhiXa7L07gf/Xr4T/4K8/Bqbxd" +
                                        "8Crf4s6eyxT/AA/ngmc9WaK8nS3KKB38yVGPspr7N8S3a3P7NcNyzff0QH/yQJoA/mt/4J6auNN+Or" +
                                        "QL1dEm/wCAwSgt/wCOtX9N2roTptonQ6neD5f1/pX8rf7CFx5X7VPhSEjIuY9UiP0NhcN/Sv6tUiH2" +
                                        "Xwwo4UXg4H0NAHwl+0lelfFccelff0qKLUfTka3EDX6xWNvFaWNvawjEcMaIo9lAAr8ePjXqsdr8Wo" +
                                        "9SvB+61W8j+Hv4O6Nn9a/Y+MbY1UdgBQA+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK" +
                                        "KKAP/9D9/KKKKACiiigAooooAKKKKACiiigAooooA+ZP2zPAMvxN/ZZ+J3g62JFxc6LcXEIxndNYgX" +
                                        "cS/wDAniC/jX8T1f38siupRwGVgQQe/qK/hE+KXgLUvhZ8SvFXw11hhJeeFtTvNNkdQQshtZWi8xcg" +
                                        "Ha4UMpIGQQaAOBr6P+E+jmW6VR1fFfOsK7pVX1NfeX7P+g/arBu3f1/z/k0AfcfwO8L7oZCPXPr6jn" +
                                        "/Cv2D+DfgZNMs8k5Jr5g+AXwwjtrN3fQQhPc+v8+n/AOoV+ivhOzW001QvegDp0GFA9KdRRQB81ftf" +
                                        "fGH/AIUP+zb49+JVvdNZ6lY6dJb6bKiq7JqN5/o9o4R8hgk0iuwIPyqxwQCK/ln/AGObeTw5+2T4Xt" +
                                        "3HzaPeaqCG/wCnWyuuv/fNfef/AAV5/aAfxt8XvDH7OHhknVNO8HyRahqtpGGAn1W6T9zCxK8+Tavk" +
                                        "MhwDO6t8yYX82f2b9QlX9pXwDJ/aJhfU/EMdsbsdf+JiywFjn1EpzQB/SF+3fpR1Hwf4U1APh47gdP" +
                                        "dozmvnH4XWBF3bbT0P5/J/ntX3t8YLMeJfhx4fVNa8gO0Tbxj5zujwa+Q9L0vN67Hj/wDY/wA9v/rA" +
                                        "H0J8PrPzIASCgHt6V7xYZVI2/vf/AGNedeCYk/stj/tL+Vd5JMPtcRXtv+b3oA9DrSjhz+NYel3GQF" +
                                        "HetuHpQBm4CjrVm0BkJpTk9eRmtmCAIvHAoAreSnqf8/hW5b8x/jSxx7eTU1ABRRRQAUUUUANZdwI9" +
                                        "a4/xHp4l05oz3rsqawVlIbpQB+a/7QHwOi8S+XNn/PvX52eN/hhrPhPxhNEDkHYc1+9fjXS/P0p4+m" +
                                        "R+Vfm78fLHStMLNq5wH/2/84oA4f4H6g/h/RPGQ1YnUoNXIsTz28l0/wBr+/V1PAfh/wAUeAfGn7KW" +
                                        "uiFLezVr74f24UhzpWrO7RkHahOxtwyTnB5yK8i8M/FX4DaDpRutX+KWkxTLwUt9UmlZwHYdISmAQo" +
                                        "7dwe4zP4o/a8/ZWuvGXhbxZofjMxeL9AMcNv4imsJ8pYuZWuoGSAD72/A469DQB+CGu6NfeHtXu9G1" +
                                        "OMxXFpIUZW46dD+I5FfoT+wx+1VqnwW1K40q/bzLGWWzijHA2qZHyPun+9nNer/8FKPgZZX0ej/tOf" +
                                        "CdNCm+G2rww2kcmhBVRZuzyKvynceMgcHgjNfktp+o3ulXaXunzPBMnRkYqcHqMgjg96AP7q57C0+J" +
                                        "vgu2ttbgV9H8R6c8WoWUgJEkF7Bh4yeCOGwa8Mv/AIf3fgD4Paj4Dhdbu20iPZ4bnbmWMhP3SsR/Ep" +
                                        "4BHavlz/gnX+1ePitoJ8G63PHCtnb77NX4kARmDoSAAQOo5r9HfG8F/c6Xc2trD56SwMCuM4z7e9AH" +
                                        "8Xvw+1k/DH9oJLyI5i0y/v7OT/rhKk1tN2P/ACzdu1f1z6m/2jxl4MZeQRKen/TJa/k7+IPgHxN8Fv" +
                                        "2loNN8TaXcy3Flq1jfvDfj7Y8qzCG9aOZl+WZtkoEuDnnk85r+q3wLeJbW/grw14ldW8X/ANnhiO/E" +
                                        "XzY9qAPjL4v3H9ufHvwR4dj0gXVjPr9jqk8hzgw3tzb27Z/7+81+vIGMAdBX4/8A7NXi+XxX+2HHqM" +
                                        "ll5BTRbuBm9DIIZv6V+wNABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//R/fyi" +
                                        "iigAooooAKKKKACiiigAooooAKKKKACv5gf+Cy3wpPhH9ozRfifZWhisfH+kx+dMZA5m1HSiLeYBM5" +
                                        "QJataD0Y5I53V/T9X5V/8ABYD4Y2XjL9k6Xx1i3ivvAGq2V8szwh53tr2QWEtvFJ1jV5J4ZXHRvJXI" +
                                        "yFIAP5cNAsG1PV7WyH/LRx+lftH+zp8IHuZdOdz3/wD1f54r8n/groUuvePLC2S0N2ob7vv2r+mL9n" +
                                        "T4ax2ujWDy6CICO5x6UAfbnw28KppelKg717AqhRtHSs/SrNbOzjjUYOK0qACvnP8Aaq+Pek/s2/A7" +
                                        "xL8UL54mv7K3aLTLeU8XOoSjZbxlQQSu4hnxyEDHNes/EDx74V+F3grWfiH43vl03QtAtpLu7nYFts" +
                                        "aDoqrlmZjhUVclmIUAkiv5OP2i/wBo/Vf20vjTrfia5W4TRtLtni8K6BJgsQMAFwjbfNk+aSTDN2RS" +
                                        "VUGgD5jvPFniS8+LcvxG1fXDrWs3V9LfXGpgH57ssXL9gPmwRgAYOAMYqfSo20Tw7o3jePpp3iK3C/" +
                                        "WOMS/+yVHZ6Rp93qMiB9o0+1B7Hoy0usBLP4TJa4wbu9s7n84JhQB/XX8WYYb7wZoJ8OH+OEp/u5T8" +
                                        "uK8m1Sw1NdQ1BtTOQenHps47CvVZbrTr7wd4Yl0w/IRFt/KOvMLNdYUEscke3rs60Aet/D+1U6Cp+b" +
                                        "nmvQWGQR61zPgZfl3erGum27RaD03UAdfIPnc/7tYd9/DW84JZ/wAP1rAv/wCD8f6UAWbbt/nvXQ2H" +
                                        "/HzWBbrwh/3q6Cx/4+6ANLT/APj3Wr9UNP8A+Pdav0AFFFFABRRRQAV8fftDftwfAL9m4fYPGOs/2l" +
                                        "rrgFdK00xz3mCSAzqZEVBkEfM2c9q+Hf8AgoR+2b4v0Xxm/wCzr8JL2PTz9nV9b1TBLw+YspMCEMAO" +
                                        "EBY9ecZ61+TukeBL3xZ4w0/SfhPoWq+L71RuawIbgb+/38AbucnHc+tAH1z+0b/wVW+MnjOS/wBK+D" +
                                        "emr4Y8MsAq3MsZ/tQ+pyszIv8AwEZx3r8f/FPijxr461J9d8Xane67eNwbi6keZiPTcxOBX74/Bf8A" +
                                        "4JM6trcf9u/G7X5fDaTDK6Toskbuucf6yaSNlHToob61+tnwl/Z2+EPwU0a00nwJ4dtYJbVdn26aKO" +
                                        "S9kzjJefaGJOB0wOOlAH8i/hr9iX9rPxTdmzs/hT4hsmH8eo6dPp8f/fd0sY/KvYLT/gmz+0Qbgxay" +
                                        "lnpyDqx+0ynPHZIPf19a/rVl0u7WGZreRRNP1/drj+YrzPXPhxe3m6R59442rhcL+lAH4m/DH4H+Iv" +
                                        "gd8Fda8I/EjXl+IPgzUmNzb+ERo9yzNeKd3mI7x+ZGfpxnkckmvzl+L37IHjf4fXTy+HBLr9mGyxjg" +
                                        "IMYPQM+Sp9+n0r+qrUfhC1nblrecsf8AP+9nrXNWvw80q1g2NpKF/wC9sB/9ptQB/I78OdX+Knwq8R" +
                                        "T+L/DNpc2baDKv27zYR5KmM8xyeapRZPmIXjzFzlMHmv3T/ZJ/4KKeDvHWkv4A+LWtWGmWYRo44tfu" +
                                        "nmuBCCf9bqN87R3jNkfK6o/bDAV7V8dP2Xrj4oaUY4NB0WF1zsPf+EZyET+5X4X/AB7/AGPvFfwe1h" +
                                        "NJRXuAkPnyztny9vHQKpIxketAH9P0Piv4La34a1HxJb+JtHn8IadzeyLqrXMcC7eAx3qunkbc/KR+" +
                                        "B5p6/EXwvfWnhrxJpS2njHTprZh/wkXh9o5UiK/IduxpMBu+GIGCMcV/Ob4K+Pnj/wDZJ10+GPjH4R" +
                                        "tPidoeqQJcWgv7lvmiORut7kpMFwchgUJ49wa/ZH4OfGH4U+Ivhz4f1bwN4ZvtF0GbSWkgt1GRHP5n" +
                                        "2mZAwCgkM55HB7UAeNfsUakPE/7Ucd+XydN0C7UD/ea2B/nX7X1+MX7Ien2/hz9tzxBcXOlmwPivR9" +
                                        "eubNj3RdQsmKfj1/AV+ztABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//S/fyi" +
                                        "iigAooooAKKKKACiiigAooooAKKKKACvyZ/4LG/EKfwp+y3YeD7C4jjuPGeuWtrNEwJd7K1jkupGTs" +
                                        "Ns0cAJ9GxjnNfq1b31ldNLHa3EczW7FJAjBijD+FsZwfY1/P3/AMFWPCPxg+Jn7QHha1vfC2qwfC/w" +
                                        "fpXm/wBsG2Mulia6cyXUhubYO0TSeVDbiKVllaRB5UZEqNIAfJv7DPwpk8ReJ9C1CbRjcBpGYu3Qj+" +
                                        "lf0u/DrQBb6Ytq2qNdsn3jX4yfsl6H4y8KeD50cYfWf+Yht/4lV/2H/E4Gefz9q/dPwjbSx6f9ouLL" +
                                        "7DNL1TaVIx7EmgDqkRY0CL0HFPor4A/4KIftbr+yv8GG/wCEdkK+OvGQuLHQ/k3C3Mar9ovW3fL/AK" +
                                        "OsilFIO6V48qybyAD8s/8AgsF+1IPGvja0/Zn8LukmjeD54tQ1aYA731ZonVIASMbIIZcttJDPIQcG" +
                                        "MV+WPwT1Ke08XLY2q5m1Dy4kPofMU15Lc3Nxe3Et5eStPPOzSSSSEs7uxyzMxySSTkk9a9b+BehX2v" +
                                        "fELT7awgM8gbI9BQB6F4wOk6N4m8Za74fJaw006faJ6nhQf/QKn8W+Wf2dLmeVcTz+Lo44R6RRWk+7" +
                                        "/wAeIrgPilJpyNqS2Dkvc61dyTKexAXb+rGs201aLxpqXhb4dJM9tpD6rgs2MBr6WONpMeygd/WgD+" +
                                        "uHw1d6tYfCDwkETDiOMP8Ad4+eP8Pwrx7RPH8Wj3bqdZ8xH9diY+XrX4rfGj/gpX+0DqniLUPC/wAM" +
                                        "tet9B8JaQ81hp7WkKzSXNrFJtSeSS4EhLTKoY/KAAcY6k/C978Sfit4t1S7uJvEGqXl3qBLTJBNIok" +
                                        "+scRC49guKAP6i4v2ofgF4c8WS3/iT4q6CCAPkh1hZsfUKT+Vav/Dbf7GsWoLK/wAQNLLH+IXczKPr" +
                                        "jIr+VHT/AIWfE7VrY3mleENYvLf/AJ6Q6fcSJ/30qEfrVW/+HXxA0pTJqfhjVLRR3mspox+bIKAP6s" +
                                        "9B/wCCgn7Hm3e3xA0yLH3Va1mjxndnqPf8K+mvAf7RnwQ+J96+heAfHeleJrtBkpZTJIwA29gxz17C" +
                                        "v4gmBVirDBHY1r6B4g17wtq1vrvhnUbjStStW3w3NrK8MsZ9VdCCPzoA/uju7X+Icbuv6Vp+HI9iAe" +
                                        "gH8jXyt+xePiprP7Pvha/+OlkyeILy3t590wAle3BBgaVeNshTazA4564PFfVejAAjAxwKANKGUEcd" +
                                        "K1x0rmLUck10y9aAHUUUUAFFFFAHxz8eP2F/2f8A9oXXV8XeMNMuNP8AEKoqHUdMlW3uGC5xv3I6Nj" +
                                        "ceSufevVvhF+zp8GfgZp6WPw18LWelyKu1roRI11IDjO+bG45wMgYHtXuFFABRjNFfN3x6/az+Af7N" +
                                        "loj/ABX8V2+n6hOiyQaZBm51GZH37JFtosusTGN1ErhY9w27w2AQD6RqN0WThq/nF+Lv/Baf4m3fib" +
                                        "ULX4HeFdMsPDRCraz67byy6kfkG53S3u/IQh87V/eDABJ5wPk3xT/wVK/bW8TXdxNB42g0S1nGBa2G" +
                                        "mWKxxjvskmhln595DQB/XYYwTnOD+FV2sbdiSVzmv5G/Av8AwVF/bK8EO4fxdb+ILZ0Ci31Owt5EQ9" +
                                        "mVoUhkyAMcuQe4J5r7R+DP/Ba7xLZzw6d8f/A0GpWuSG1Hw8xt7hFWI4LWd07xyu8oG4rPCqqSQhKh" +
                                        "WAP6EprG3mBDjg1yt54B8L6i2/UNH064P+3ZRk/mc1hfB/41fDD49+DYvHvwm16HX9GkkaBpIw6SQz" +
                                        "IAWimikVZIpACG2uoJVlYZVlJ9UoA/K/8A4KKfsceHviV8BdR134d6JaWXiXwq639uIVERmt0DCeHg" +
                                        "YyVbco4+ZQCQCTX5l/sM/FuS6+DXin4Vand/2dPZzxrYXfleaVS6DlkK7WzhlJB9CBjjJ/p8uvO+zS" +
                                        "/Z/wDW7Ttz/exxX8p37UHw+j/Yx/aq1K/n8PLd/D3xkZ5xpSHyI5bKaRhJBCw3bTE3KN2BxgUAfdmk" +
                                        "/HqLwv8AH+1+Jza5GPC3hzUU0bXTN8scMt5tjlnb2TbK3/Aa/ctWV1DKcgjI/Gvzn+F7fsv/ALUHwP" +
                                        "h8E+IrOz8pgouB9n+xTKI5EZB9oZBlipSNxnLZPGCK+3fhp4b1zwf4I0rwzr+vDxLc6dH5K3/2dbUy" +
                                        "wKT5O6NHdd6x7VZgQHILbVzgAHe0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9" +
                                        "P9/KKKKACiiigAooooAKKKKACiiigArI17T7nV9D1DSrK9k024vLeWGO6h5kt3kQqsqZ43ITuHuKyf" +
                                        "G3jnwh8NvDV54y8eavbaHolgFM93dSCOJN7BFBJ6lmICgZJJAHNfmtf/APBYb9kqw8UN4fFr4kubJZ" +
                                        "vLGrRWEBsXT/nqoNyLnYP+uG//AGaAPhP4jeHP2h/2F/hbc2P7RXhnSfil4T8QSWtnpl5ZeItSisrH" +
                                        "UrPzLrT7W40yXyrWe0haKW4+zCx8qVyRLKcqtfJHwS/aI/ajli8Z3GgeIG1G6+JctlB4g1W6uUj1IW" +
                                        "+nRi1j23jHzIv3dwEDAFlCjaRzntf20v2m7L9rz9p/TdP06/Evwv8AClwLPSWaJoRJGQjXt7KNxkKy" +
                                        "uh2kbGNvHGBGsu/P6S/sD/s+2p8K20viEZZct5eP50Add4T8YfFv4g6nomva14I0nTxZ6adQ8MeDFk" +
                                        "UWOl60JzKup38UarLOQXBiMYxE25lVZG3j7V8Eaz8TtPsPhro/jXSV8U3s1ncz+I/E91Lb2B027S0E" +
                                        "gltbP7LEzxSSSyWwDRwSQxr/AKQGdjv+kLKygsLZbW3G1Eq5QB51YfErQ21mDw74mUeFdV1S9u7TRr" +
                                        "PU7ywW41qGzRZHu7CK3uZnkhKNu2uEmQDMkSAgn+Sj/gol4h+K3ib9rLxtf/FbTbnSnt7uay0WOe2n" +
                                        "tYZdFsZ5ba0uLVbgkvDP5bymRGMbyNIyYB2j99P2/tS8XS22keFPhLKNG8ZahAl9Lq5umtkhs9N1Kx" +
                                        "SJZYfLZbvyZr7zgd2bQB5eBJh/kD/grGmoT/sl/By8+MUenQ/FqHU44Z1tpQxZPsMg1OS3XCZhedLV" +
                                        "nwuI2aNdxBBYA/nsXG4bulfTHwbt7Dw/od14rv57jSJ4it/b6msW+KNbOTaY1H8TvI6qPfFeBeHPDu" +
                                        "q+KtYttD0WAz3Vy21VUZ+p+ldp4l+JWu6j4Ps/hnZ30h8L6ZdSXdtbFmKI8wBYYIHCndyc5Jz6UAcD" +
                                        "quqXesX82o3rb5ZjnjgKBwAB2AHAr6H/AGWPh54Y8d/Ey2bx5cz2Og2UckrSwIzM86hRHGCqPjlwTx" +
                                        "2HrXznZQRzSZlSWRF+8Ih82PryB+VfpT8BtTsb34fxeDLHSNORbSQvLcwsWlmY/P8AMxUE/cx14A4o" +
                                        "A+pPh3+xn+zz4GvDe36T+I5k6DW9NuGib6RgBM/ga+w/AvhX9n7w6DK/hLSLN/8AqH+H3/8AjJPavg" +
                                        "m08eajqKjcN+zB/wCJgR6V7teeLbW9iEuinZvPyf5D0AfcWn+HPAV0RJo6qn/cCLY/8crJ1bwZp+9D" +
                                        "PoaEj7vAx79NHNeD+G/GckZfyYemP4/U12I+ImtXCb18O5H8vx8ygDvv+GTPgH4x16/udY8I6U5kxw" +
                                        "ox9zvjtWn4b/Zs/ZP0rxNaX+m/C3T11TTCG87+xm8rd67Su0nvkg+xr500f40aXf687RvrG/VuG4PF" +
                                        "ew+AfHE+p2N7puraGYtvbGOv/A6APsXwlrMVug07TV22w+52/wDZa7xdVj3hd+D6bcf0r5k0TWdyOy" +
                                        "gu6fdXP5/x/SvYvDUSnou5h/Fu/wDsqAO2qxUdr/FUlAHVg5ANLVSy/wBQPxq3QAUUUUAFFFfjf/wV" +
                                        "w/auHwy+H1v+z54NvAnibxvbtJqqvbLNHFoUqywMu+UFFluJVKoUDOixu2Y2MTMAeBftuf8ABWG/mu" +
                                        "NU+FX7LN0sFrte2vPFG1hOXDLuGmZICDAZDO6kkEtFtISU/nN8E/2Lf2jv2tfCHjL4z+Djb6pFpl1c" +
                                        "faJtSvWN/q2peWLqeKH5ZGknYSozPO0aO0gxIWD7fimv0W/Zi/4KUfGf9mH4W6l8MNEsLPxLZo0TaE" +
                                        "mp8W2klp5Z73MdusU9wLky5Aa4URsNyghmUgH54TQzW0z29wjRyxsVdGBVlZTggg8gg8EEUiSyxrIs" +
                                        "bsgkXawBxuXIOD6jIB/DNX9a1nVvEmsX/iLX7yXUdT1S4luru5ncyTT3E7l5JZHbJZ3YlmYnJJJNZV" +
                                        "AHufwQ+KWh+A/Etpp3xJ0j/hK/h7fT7dW0iT5/3UwWOa5tFLosd4kQxHIGVug3rwy/pX+1P/wSf8V+" +
                                        "DNCvPiT+z3MfFOhwxxzf2VGWlvzb+WN0sPB805G4opJbJ2DgKfyg+F+l+AtZ+IPh/Tvilq8+geD572" +
                                        "FNVv7WFp5re0JzIY0VHJcqCFOx9ud2x8bT/YV+yX40/ZmvfCWp/Cj9mDUFvPDnw+uBbOsUtzdQq17u" +
                                        "ui8NzcM5lR5GkGQ2AysAAu3IB/Jz+zZ+0Z4+/Ze+KFj8SfA7LO0G+K90+4eVbW+gdWQxzLG6kld2+M" +
                                        "nO1wrYIBU/2UfBr4u+Dfjr8N9D+KfgG4e40XXYfNj81NksbqxjlhkXJAeKRWRsEjIJViuCfwB/4K6/" +
                                        "smxeAvFkX7SnhNgNJ8X3i2ep2iRBFtb4Q5SYOHO4XCxuWGwBXXJYlwBt/wDBGn47avpPiTxh8Cb6Bb" +
                                        "jR5rKbxHbSGYJJBNbmGC4ijj2EymZWjYDeoTymIDFzgA/o0r8Nv+CrPgHUfiB8V/h7onh/Tjd6k3hv" +
                                        "xFMCO4t4xIo/A5I+tfuQDkAjoa/Nz9rq90fRP2kfhF4i8SjOgaV4d8Z3mq4G4/YrO3tJ5Bjvyo4oA+" +
                                        "cP2e/2ZLn4K/D7w5qXjO/1LX/FdtDJPFY25LRQK7QMI03IT8oXHXntgV+ivwW+J9013afDbxuzQa69" +
                                        "t59u02N1yfmaQBtxy4XEgA/hyei1/Mb8Yv26/iz48/aJ1j4u+G9d1HTtAluVitdHW4litX0yFREsUt" +
                                        "uZJo1aeNd0uNwEjsy9q/on1LXdI8VfC3QPix4Zu/OtzHZ+JvDYjiZW+dFEkMiHB+ZZCrLwfm56UAfd" +
                                        "NFVrS4F1aw3SggSor4PBG4Z5qzQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/1P38oo" +
                                        "ooAKKKKACiiigAooooAKKKKAPln9sf9nI/tS/AjWfhTbamuj6nLLBe6fdSqzwpdWrblWZV+by5FLIS" +
                                        "MlNwcKxXaf5FvjV+zn8a/wBnbVrLRvjL4UufDc+pxtJau7xXFvOEwHEdxbvLC7JuXeiuWTcpYAMuf7" +
                                        "j6/kE/4KK/Hhv2kv2odbn8LuL3w14SX+w9Jki2sk8Vq7faLoPHJLHIk1w0jRSqVDQCIsobNAGv4E+N" +
                                        "bP8ABr4gfCzXtStfh98UvCl1capYa5DYW+mXGq2UAaO+0G5KC0k80Oxnt1nWVmKtAFjZYlPafBz/AI" +
                                        "Kc/HjwjDcTeIV07xLrN7fxrDNc2ttp0Rjm2+YjSwCC3gAKKd7Rn7xLEKua+RPDv7NPxZ8fXM76HZyX" +
                                        "ixiF1eb5JZIbgnY4RiTj2z+NfRulf8E1f2kb4akLbS5bNbZdlzbOT9oZYkE0y7AoVwJlEFvzi6kAmi" +
                                        "/cfvAAfp58Pf8Agsd8Prz4g2vg34weCLnwDo/2UGfVTcvqH2e5EQkVXtbe28zyn+6roXYEruTaWZPv" +
                                        "jwZ+3D+yJ480kazofxa8PW8Bdk2aneppNxlev+j3/kTbfRtm09ia/A34w/sfftqfEfw78P8ATPE/gq" +
                                        "zutV8C6VDoMN6rfZ7qawhzJaW1yJHNk/2SPzGSSHDvEwFwDch0X518H+Cfjn8ANU8RWXjbwdqF1ouv" +
                                        "wPp+sWcVygW6SzvoxOo2+ZHcNG6MuFDgFt2cZoA+mf8Agq58Y01X9qrwzr/ww8WxSyeF9Dtktr7Rbz" +
                                        "Mlpd/abiRytxA3yyjcuQrZUY6V+Ynji6l1fWW8UzXf2ybXQbyd8ci5l+adT64cn86+xvEv7HH7WX7N" +
                                        "0eqeMvFPwxt7vRtIMN1JfSSW17AsXm+SoXybhn/eNIFaMgsRzt2jdXmvxI8ZW3xU8KeKdUS00rRL3Q" +
                                        "9TtWk0+x0y10NZ7REktorpLWAt/pPmOTeJkjDIQxCEgA+V0nmgDCFym4Mp2nBKsMEEjqD6dKr0UUAd" +
                                        "F4f1ePSLqK5CSs6yKXMbhd0ODvQcHk+vT2r6G8PeP9KnTdI39nuPQdq+WASDkHBFWBcMfLWfMscfRS" +
                                        "eAPb0/KgD7H8P+PokbyG19ksv+fzZ8wx7bqgh+OekeCtR13VvBWrFvt7RrHFFZJAJopds37yMgoyxy" +
                                        "QrHKkhOdwKGRMkfH0k8jxJCW+RCWUAAYJABPHchRz/XNWdV0/wDsrUbnTjOlybZ2jMkYcIxXg4Eio4" +
                                        "59VBoA9u1r9pb4ra1Atr/aEdtDGSFVIlc+WekbGUOWUeh/GuFs/id4itFt18iwmNq29GksYGYH3Ozm" +
                                        "vOq67wHZ+EdR8ceHdP8AiBfTaX4XudStItVu7dd81vYPMq3MsShJCXSIsygI2SANp6EA+j/C37aXxe" +
                                        "0Sxk0XW5Idc0pxj7Kwa0jB9QLUx/yr6u8Bft1aFrltPb69fX/g29mQrIVuTcWMiqMoSiwkoB02pGWO" +
                                        "eDUH/BR79mj9mr9nnQPB9n8ONZUfEC68mG+0uG482I6fBA0X2x4lhOyR5Y1DM0yGRi7LG53un5N0Af" +
                                        "026V8erKbxa+lxeJd9/wD3vL4x/wB8V9T/AA58barqcXmSpx0/IV/JT4d+IfiPQtSsb6W9mvE0/Jt0" +
                                        "mkZxA4iEMbxhiQrRqqbCMFdi7SCqlf1n/Yh+MFzHrQiu9ckSBMfJadX4fjFAH9AvhK/+3aQj4rsDcA" +
                                        "9q8x8Ea6LqUjbiu8hf7nHrQB1lt/q/xqxXOaHLvTJ710dABRRRQAV/On8S9Mk/aC+Ov7anxg0uW5En" +
                                        "wr8MXOgaZFdjzFtRDE9pqTwHeViSWKzv9qgfMLp3IV85/osr8wv2LfAfhPxjH+1r4a8TWhuovFHxL8" +
                                        "VaVqcW5ojNp8w2BdyEMoZZ5sMpBGcg9DQB/KBXvvjv9ojxd8Qfg74I+CWraPoVno3gN55LO7sdMitt" +
                                        "QnafhjcXCdSQBvMap5zKsk/myqrjjfjB8Mte+DHxS8U/CvxMrjUPDGoT2TSPE8PnxxsfKuESQBhFPH" +
                                        "tljPRkdWBIINekfAD9nbW/jlr1vpdldwWkVwxUM8gDZB54waAPmyux8A+Errx54z0fwhZyCKTVblIT" +
                                        "IeiKT87f8BUE4r9Br3/gmv4u03XdU07WPE8VnbWVsHhMFs17LLO3RMBoQsX+22JP+mNfp9+xV/wT10" +
                                        "X9njUrD4m+J5ZfEvjG9t2jijuLBUtdMLj5inzvulI+XzNw4yAACSQD50vP+CefhnwF8BpvFp0ay8Ya" +
                                        "23hh7gkSOoFwW3+YmD1Cng13v/BHXwT4g+HHjv47+C/FFr9j1KwHhzzYicld4vnTnv8AKwNftX4m07" +
                                        "SW0HUJdRjBhSGR3J7ALk18qfsffCpfAuofFvxjdQeVfeMvFt7cE+tvAAkYH0dpD+NAHW/tteBrT4h/" +
                                        "sm/FLw7dqz+XoV1qEQRdzmfTF+2xKo6/M8Krxzg9+lfhn/wRZ0fV5f2kvFfiC3tTJp1l4XntribICx" +
                                        "y3V5avCpHXLiCTH+6c44z/AEB/tKeOdB+G3wB+IHjTxLc/ZbHT9FvBuBwzTTxmGCNT/fkldI07bmGe" +
                                        "K/N7/gj78Ctc8C/BzxT8TfFljcadP8Rrq1+ww3UW1ZdOso3e3ukRwG2yvPKVYna6KjLwQSAfsbHF5Y" +
                                        "wDxX84H/BVb4s+KtB+JdtoWlXjJaaroP2KCWJ5Y2W3mkIuuuAfMUGBh0K7ga/pCY7VOK/lC/4Kw6/N" +
                                        "qv7TkljJP58dlYxiM/3UJKhf/HMn60AfmMiPIwjjBZm4AAySfpX7k/8ABJL48rCdX+AnijWjptvHKL" +
                                        "7Td5A+WTcJ4QT0/elG9yxHtX5V/sv6pcaR+0Z8NLiCZYUn8QadaT78bHtbydLe5jfII2SQyOjf7LGv" +
                                        "0s0PwbZ/Bf8AbwuYIkSW08VeH7v7GPK+RZvL8pgB6/uSc/7WKAP6E/hRp9lpfw90Wy05dtusJZR/vu" +
                                        "zH8ya9EryL4MXLTeF7i0frY3RgP/AYo2/rXrtABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUU" +
                                        "UUAf/9X9/KKKKACiiigAooooAKKKKACiiigD5q/a2+Nj/AL4F6/4804xvrcgjsNKieaKFnvbttiuhm" +
                                        "DI7QR77gxsMOsTKSAcj+fT4B/AG51PzdKOiH/hKbBjZlDnjPrX6D/t5/FaTxL8ZPDHw20zXbZfC2hq" +
                                        "J9T8oCR/tyXKpPAHDFXaNHiZkwDFtZ2+6BWt8ONOi086cNF8P+VHrH/Ey1L/AD/9agD3X9nH4UQaVc" +
                                        "x3MmiLb+Wqcn6Z6V+g0FtHbrtTvXjnwiwNFg/4lv2V9o9PTrXtdABWXqOlW2pPaNcruFpOLhf99VZR" +
                                        "/wChVqUUAfP37WENnN+y98XRfRmWGLwlrkpUHBzFYzSLg9iCoIr+LvRfCnix/Cuq/EKy0uW58PaXPF" +
                                        "pl5dLjy4rjUIZ2gQjO45ELsSBtXaoYqXTd/cf8RvCLeP8A4f8AiXwIt0tkPEem3emmd4vPWNbuFoWc" +
                                        "x7k37QxONwz61/N5+2l41+EP7MvwMT/gnv8AB77Tr+qxXdrqvi/W5ri5hh/tEJFJ5cVus3ls0gSNmi" +
                                        "O+3gUIMSXe6WEA/Hyit/QP7PPiOwW9VprNrhFceXuYxlgM+WCcnHO3PPTPesEgg4IwRQAlFFFAH2T+" +
                                        "x58ENX+JHxD0zxJci5sPDuizGa+vBaNNGIQNpER+7I5JIZf4RzySAPjpiGYsBgE9P6V++P7Ho03Tba" +
                                        "z8PQ3EmqR+I5tYtrfwxJohbTbST+y97F3Yknd0bJywJB65r8mv2jP2htR/aF1rRtY1PQrTR5tItWt3" +
                                        "liWOS5upHbLPPcLFG7qNoEcZysfzbMb2yAfN9FFFAHsXwE0j4Oa78WdB0r4/63d+HPAM5uf7Tv7BWe" +
                                        "5hCW8jQbAkFyx3ziNGxE3DHlfvL5/4tXwsvirWV8DNdv4bF7cjTG1DyxeGy81vs5uBF+7E3l7fM2fL" +
                                        "uzt4xXO0UAfS/wCzN8A9Y/aL1nxn4I8M2zXOu6b4cudX09VdUBuLS4tl2MXIBWRJHj5I+Zlb+HB5r4" +
                                        "Y6nNpHj+38PeNre7yzfYZEbd9qgG3ytio4bG1eANvGB24r9C/+CK+7/hqfxPtPH/CG32fp/aOn03/g" +
                                        "p1+zxb/Cb9p3SviD4c0918PeOrZrwAN8iapZqRNEvGVDKIZACcks+OFIAB+wfwP8SJNpbr/bwlI7Y6" +
                                        "fSvb5degK5/tlAR7ivzr/Z+vyvhzHT+lfT83iTC7vJyRx/nnpQB9a+GdU81N1emqQwDetfE3w8+Iwu" +
                                        "7ooef1f/AD/n0r7C0K8W+05JlOQaANmiiigArivCvgDwt4L1TxNrHh20+y3Pi/Uf7V1FskiS6+zw2x" +
                                        "YD+EFIEJH94s3Umu1ooA/Hb/gp9+whefGzSZPj58JbIS+N9BtCup2EKfvNXsrdSVaMKMvdwrkKuN0s" +
                                        "eI1JZI0b82v2MfiB4WtNQ8O+HD4YPinxPcSt5cn2neEXPQWeMNgd+/Wv6rq+d/Hn7Nnw/wDFnjiz+L" +
                                        "Xh2BPCfxE0998ev2FvD9omHl+UY7xHUrcxlMLh/mUABXUCgDm7vwbps2oQXviDT5LBXhHmK0sajRE2" +
                                        "9UkjJUgnjIJHfoK970HUNPGmLqtvJaRaQ0YeO4RgqlfUt0x75r88fi5+zF+2X4o8dW/xB8N/E3Rr3W" +
                                        "beNbdGjl1bw1bQ2hyzRC1t5dSSQs5zvcg9Mk443dJ/YP8AF2po0PxK+K93qcUmd39mWK2MgOONpkmn" +
                                        "iyD2khdCOka9aAPSPiR8Rrj41eKdW+B/wM8QaRJe2fnWXihp08ya1imTyxdWpBAeeykCkoeN5VSQRm" +
                                        "vru0t9C8H6Db2MXk6ZpemwpFGCRHFHHGNqgE9Kxvh98OPAvwq8NW/g74daHa+H9GtclLe0jEalz952" +
                                        "xyzNjlmyT3NXofCunT6hZ67rsMOpazZKRFdNFjydww/kKxfyg3fDFiOCxGMAHz148+Eup/tK6l4fl8" +
                                        "fXl3pHw10zy7y58JyW6Ry6vqMUqywHVJfMljmsolVWW0VdryndM7bFjX6rCgKEAwAMYHHHoPSpKKAO" +
                                        "c8R3qWWnzXLdIFLGv5W/+CoHgzXbX4y2PxPn0CTQtC8UxS2ln5rLvmm0zYLh9gOQP3yYJ4Pboa/p/w" +
                                        "DG96YvDl846hTX4l/8FYNF8D2P7N/wxmuTbx+J4dbvIdLVCRIdMZJGvOM4IWb7PnPQsMdTQB+JNhp9" +
                                        "9/wrweLNNspYrjQ9VRf7QjYr5YkQOifVZF3Ajn5q/pR8XMml/FD4f/EZH/4TU7VsOMcZHX06nmvxo/" +
                                        "ZL1D4S33wq8deEfihr7aAr3tpfwSqMljbwTPgAe6fyxX61a7cf8JNbfAvR9HOBqtkl7t9QFH/66AP0" +
                                        "x+DUcP8Awjl7fQLtW/vpZ8f7yoP6V67Xmvwjit4vh/pSwAB1QxykdTLATExP/fGPwr0qgAooooAKKK" +
                                        "KACiiigAooooAKKKKACiiigAooooAKKKKAP//W/fyiiigAooooAKKKKACiiigArC8R69YeF9Dvdf1J" +
                                        "1S3soy53ME3N0VAWwNzsQqjuxAHJrdr4M/bS8e3UllY/BjTJVg/t+3e61CV423QwxsWtHjfIUk3EWH" +
                                        "QAtt54BGQD82/B3hWw8SX/AIs8W+J9TitPE9x9qvIJ418uJby+u/tVz9qReEnvVWZEQcLKNqjgCv1Z" +
                                        "+EmlLa30qryqf59K+OfgbcSzaRpkbjYda/T1/Sv0Q+G2mJpVjAY2yt+N31oA9i0tNluec5JrSpqrtU" +
                                        "L6U6gAooooA5Txz4w0j4eeCfEPj7Xy40vw1p13qd35S75Ps9lE00mxcjLbUOBnk1/Cp4w8V63498Xa" +
                                        "5458Tzi51jxFfXOo3sqosayXN5K00rBEAVdzsTgAAdAMCv7V/wBrH/k1n4yf9iZ4h/8ATdPX8QVABW" +
                                        "vdq1zYw6lJKXlLeQynrtiRQp+m3A/Csir9pOwSWyCoftWxNzjlMMDkHt6H2oAoU4EAg4yKVlZWKsME" +
                                        "dRTKAP6Pf2J9ZDeIrJH4WTTP+Jf9M8/n3/8A11+Kf7WPwq8TfCL46eI9B8VXK31zqcz6rHcrx58V87" +
                                        "SByMnB3bgfpnoa+4v2BviJeatoEvguXxJNpkGlXSXGoeZfGFYNOxskuwpRQQiYi2+b8qAjADKK/TT9" +
                                        "p79l/TP2vfh1pmgXOurH4k0vc/hbWrgkRT+btNxbzKuSVcIvIBIIVuQCpAP5YYba4nDNDEzhCoYgZA" +
                                        "3HAB+p4FEdtO5bZGW8vkjHOK9Z1vwX4r+Cvi1fDnxc8J3Fk6kyGC5RoHniGVDQTjh42I++hKnBAYHk" +
                                        "eoeMvC/wfh0x/EPgDxtZyaLuAGm3ETx6uD7gqAR7g4oA+fNH0a1aW5j1YD92vyBW5Zh6Y7U7xBZeU9" +
                                        "7JvtcpMBiE5bnPT29ajTxNdwmfyzEfM/2P5V+oHgn4U+Af29dJ+GfgH4Q/Du98EeIfDokg8aeM44c6" +
                                        "GYYIjiXy1ZRPe3rbZMN5Uik7SZIgZIgD6s/4IofBm807RvHfx41rTlRNW8jRNHumZhI0MLtNfgL90x" +
                                        "vILcBuTujYDGDn3P8A4KEeM9O8aeOPBHwV02cNJBctd6iP7iMhVR9cDP4ivq/W9f8ABX7M/wAO9D+E" +
                                        "nwQsLQS6SFEFgrrsSGGTz7rz2BJE1wizFWYZaQlj0Nfnxp/wVvLqWL4weONf/wCEn8e6uBqCxL8oAH" +
                                        "QAb+g6en5UAdh4X0r+xo+uUz+WK0tU8V9lHrgY+uBj/P8AKtuUZjb/AD0r5I+Lnij+zpQpk5P+etAH" +
                                        "c6V8ZIdO8Z+ar1+s/wCz745h8Y+E4po33lR/dx0r+XT4jfECa31G01T+22Y49K/Xj/gnL8QPt0aafN" +
                                        "rXno6n5G7/AOfegD9laKYjpKgdDlW5Bp9ABRRRQAUUUUAFFFFABRRRQAUhOAT6UtVb2Xybd3xmgD5L" +
                                        "/aD1S3tfDeoxMPtDairJ9j/vnG4f+khx+Nfym/tF/Hzxp+058UbvxVqFl/Z1pNKY9L0KyaSW1sY9qI" +
                                        "EhToZZQitM6qvmPlgqjaq/1hWd8978RrLRotL0xLiwQ3d01z/rF018gFOOu7149a0NG8AfAr4Y+Io9" +
                                        "U8F+AfD/AIQu7uB0TV9K0uytZgjEFo3khjRtrEAlQcHA7gUAfxneCvCGreOfFGn+F9HhaWe8lVGKgf" +
                                        "u48je7Z4CqOSSfbqRX7feDtFstb8XaPB4McC60bwNaW/gZZG2l9U0Zo2XKkqoGr/N8xOSCcnIFfcvx" +
                                        "D0vQPEPi99V8VeHv+EmCjA+wcn8ea9p/ZW8N2cWlXGuaCgtvDMGbXTbbHzBoziSUntkYUfjQB9YaPY" +
                                        "nTNJstOLmQ2sMcW5urbFC5P5Vp0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9f9" +
                                        "/KKKKACiiigAooooAKKKKACvxgv/AIlav8WvHmuePpY1TTNUtja2rIpTZZTSEWwlUl8TRRSBpgGwJo" +
                                        "mAwMCvuL9sfx7q3hjwBpnhDw5f3Wmav4yv0s47mz8xbiKGFTPL5TrbXEZeQqkRicKZI5JPLJdQK8L+" +
                                        "Hml6tpiGOfn+9/n+dAH0pdKtx22j+lexaBpyTQ2hcfNZcD8q8q8KeH/L1+1nHZT7da+grNcFjQBeFF" +
                                        "FFABRRRQBy3jbwlo/xA8G694D8RI76V4ksLrTbtY22O1veRNDKFbnBKOcHtX8Flf3+V/IT/wAFPvhc" +
                                        "Phh+2N4xazslstN8Xrb+IbQLJv8AM+3Ji7lOclS97HcHb24wMYFAH580UUUAXbgCSNLtpd8srNvXHI" +
                                        "Iwc/jn9DVKngn7ucA0ygDo9K1gWP2RLa1t4p4muRJdOnmvJFcxiIoyTF4R5YDmNljV1Zy24lY9n6w/" +
                                        "D39urx1a6ZaaTqvgvTtUu2mCW9voGranoVtDF3aS1tZV09+5+WZfQjvX4/KzIwZTgggg/SvV/BPj++" +
                                        "0YRQXGqSQJGxxwWwDQB+/XjT9qv9lH9ovw9ZfD74yfBzxPqTwDzLeGPTILgh8AFdOm0y9SbnuUGCOG" +
                                        "yK+XPiN+wp+xfb6W+r+HPGfjvwoM/d1jQZljHsBe2+nn85K+U/hd8Zvsxw/mh/8Aa8UyRfpX2x4V8f" +
                                        "2V9L+8f/OOfX/JoA6TwT/wTk/Zw8M3mlT+JdJ8T+MJZVmFws99aW9luj6MIbYJcJg9pZVHqD0r6A0/" +
                                        "xh4luNBTw5pB0Xwd4RRXH/CP+GQmm2p8wkv+92jbuJywUAHqR3rl/CevI/hlFWTZs4/Hf3x78V0d3q" +
                                        "dq2ZVPr/8AWFAGFD4GbUF3zp5bj/gYQ9+le0WGgqig+Xynrxj/AD/n0rT0TSREm+BMxj8K4LxtftGi" +
                                        "LHzIE7+3/wCqgDj9KH+qiz/z07fnX5+/Hq+xd6jpIjwBj+f1r9AdY/5ef+2dfD/xk+F0scmo63GmM+" +
                                        "3HPXNAH5IazeTHUpGjuWlAPDAkV93fsVfGTxFonjmx0VNWaAOeA3NfC/inSodG1mexgnFwqnO4V2Xw" +
                                        "aubmy8dWV5b/APLPOecUAf3FeGr9NS0OzvEmE/mRjLjue9btfm5+y38btb8Q+HfCWif2pHdmWIiRS3" +
                                        "JAH+5k4+tfo/GWaNWcYYjkUASUUUUAFFFFABRRRQAUUUUAFcj4oK/Z3Df3T/MV11fO/wATbyyt9O1C" +
                                        "/wBLFxa6zO1hbK4GwS3R1AWdkX7bfNJJPTZyegFAHxVZfHCD4deMfGvjASN47sr10sQYyEKk/wAIOM" +
                                        "Y5wau63+0b8Pr9Yk0U48bawoCph8jHTP0xivsfW/2Yvg5450gW3xD8L2+p3U8i3Mx86QMs+BuVJofI" +
                                        "dkBGBkDI6jHA9S8G/DfwD8PrSKx8EeHrHRI4olhBtYEjdo16BpAN79OrEnPJOaAPkT4a/s7aj42uJ/" +
                                        "FPxZ0pdGsribfHoXlwOgG3hyw3FGyfvArIfVeK+5bCwsdJsbfTNMt47SztI1ihhhRY4440G1URVAAU" +
                                        "AYAHAFXaKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/0P38ooooAKKKKACiii" +
                                        "gAoory/wCMnxCsPhZ8NNe8cX8hj+wQEQ4aNWNxMRFCAZTs++y5znAycHpQB+Yn7S3xp1L4gfFubSNG" +
                                        "vn03wr4X3afdR3KoJXuorphcXUAUsGiki8va7H7u04UsRXqHguFbuF42k2IMfwV5HoCtP/xJPM/4ls" +
                                        "eN9fWvgWwXS7p3Gi+WknegD6R8NW2y9kbdnpXpdt/qE+lcb4ftxHGR613HSgAooooAKKKKACvyh/4K" +
                                        "4fs8XXxb+ANv8UdDaeXWPhY1xem2jG9JtNvPJW+JUDIaEQxzbt2FjjkBBLKV/V6qV9Y2Wq2VxpupW8" +
                                        "d3Z3cbwzQzIJI5Y5BtdHRshlZSQQRgjg0AfwIUV9X/ALZn7M2sfsq/HHVvh3Pvn0G7H9oaFdSOrvca" +
                                        "ZM7rF5hQDEsTK0UgKrllLqoR0J+UKACiipEbYwbGcdjnn2oAjooooA7Dwl4kn0LUYZF+6Gr9G/hN8U" +
                                        "Uv9EKO2CBj8K/LSvoH4V+PZtMuTC/tQB+63w01oRW8kjfc/wCen9a99u2W5m3r8hHOPrX5x/D3xObS" +
                                        "Lf08z3x19M/5/nX1r8MvGK3d1LFjEaeX3/nQB6rZ+LQV34z/ADpNS1QXo24/yKxfC+n7R8wwIv8AP+" +
                                        "eK+iz4FXnH5bv60AfF3/CNf7X+f+/dcL400FT8yydx/kV982Nmu4HO7zPz98V53qdkCGQp+f8An/P6" +
                                        "0AfjF+0j+y+1/qbeKNBuBhh+8yNmPX1/z0rzH4c/BHW7S7ttPtZMySHJ/r0r9+rb4caNq42KPkR87T" +
                                        "616J4B+CXhRpzc6jHlx6/57UAbH7JPw6m8EfD62W8OZZF+76V9a1Q06wg061S2gXaFH41foAKKKKAC" +
                                        "iiigAooooAKKKKACvEdN0C41T4q3WsXFuq2OmxLcRyY5lubhSi49kjXn3INekeMNROleG76+U4MUZI" +
                                        "rJ+HGh674d8KW2meJZ4LnUUknZ5LcbUMbSsYRyB8yw7EJ9QccUAd5RRRQAUUUUAFFFFABRRRQAUUUU" +
                                        "AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/R/fyiiigAooooAKKKKACvzS/bt+Iuow+IfCXwustLF3" +
                                        "Hdhr7zrhYGtRcsxhjP73LBoYhKzgYBjkPUgY/SC/v7LSrG51PU50tbOzjeaaaVgqRxxgs7sxwAqgEk" +
                                        "ngCvxKk1XxX4m8YeNfFiXu5/EUzXltbZz5VlPPM0cbHuwgZQT3oA9u8B+Xq9ydaUcn/P5V9jeGbLdq" +
                                        "Fq6JwCf8/Wvi/wnNJ9ok0jqOOOvNfYXwctTHpYwPvZ/wDQqAPd9B/1f4mulqjp3/HrH9KvUAFFFFAB" +
                                        "RRRQAUUUUAfI37ZP7J3hH9rX4VT+EtUWK08TaUs1xoGptw1neOmNjsFZvs8xVVnQA5AVwN6IR/Hz8S" +
                                        "fhn47+EHjHUPh98StGm0HxBpbBZ7WbaSNw3KyOhZHRgcq6MysMFSRX939eH/HP9nT4PftH+GofC3xf" +
                                        "8PRa3bWbvLaTB3gubWRxhmhniZXXOBuXJR9q71baMAH8OdFftD8Yf+CLvxn8Mrc6l8GfFOneNrOKNp" +
                                        "Fs7wHS9Rdy5CwxbjLbPhMEySTQgnICDjPy7/w65/bs/wCiZ/8AlZ0f/wCTaAPgNNucP0NOlikhkeGV" +
                                        "djoSrA9iOCK/Y34Yf8EXfj34lFpe/FDxVo3gm0uYDJJDAJNW1C3m/hikij8m2Pu0d04HGAcnGn+2D/" +
                                        "wSn1f4O/CwfEz4T+Ib/wAaDw9EP7VsriBROtou5nuYPLPKRZ+ePaSEy+7CkEA/Fqus8Ja/LoWqQzry" +
                                        "oYfhXJ0UAfoN8H/E8cXhi8jbkP5fevsn4Xaqv2ja/Lp/nivyG8DeLbjR7C4jzxbbXX8TX6S/CXXCk5" +
                                        "A7dOT0/wA/5zQB+j/hKZb4bEOeMf149a+yLGxOnndJwhz82BXw18Fbr+zvEDZ6Afjn1/z7V+kekwLc" +
                                        "hz6UAeWeIk3mQHt/9lmvNZdjHZv6H0rmv2wvGfiH4F+HIPixeaZqfiMCUQtbaGzQxxZBIeVsMQvGN2" +
                                        "Otfmjaf8FLPAAbVLbW9N13Ujc42nUPstmQR2P9lLbkH8PxoA/WWZGcDbzj3xXV/CfVdZ1DxBLvQCxA" +
                                        "496/F/8A4a6+E9w4vU8a2NhL/wA81g1Zv1+wf59quWH/AAU50Pwyk8trqviLxDPbZFpaajpmkz2n1N" +
                                        "5GLO5/OIH2oA/pQqJmWNdzsFQd+gH41/OaP+Cqnjaa30uz0Dwp4s1C+1YbftEN7p1s1zKDjbbxPo98" +
                                        "G/A5zxima3+1n+2h8VL5ovg9oP8Awhem66gmvpdQ1E+Jfs96rEPHseORNPDqAFsTaq3BbawYYAP6LJ" +
                                        "tSsLcfvp0X8a+Nvid+35+zp8MPGVt8PJNUufFnia7Z4I9O8NRR6xc/bUk8r7C0dvIWS6L/ACiNwDnj" +
                                        "Ocivlnwf/wAE/wD4l/HXS7LxR+1t8a/E/iHT9Xitru88I2kS6NZQX0LLmOaOKSW2cKFZHaCCMux8yO" +
                                        "YjDv8Aov8ACH9nv4KfAXTW0v4ReDtP8NLIgjlngi33c6BiwWe7lL3EwUsSvmSNjoMCgD51+G/ij9tz" +
                                        "45S3es+ItE0r4E+DbqMLaQzxtq3isSKEJkxKy2UUbsXx59uZF27TEQVkP27pWk2WjWMem6eJFgiGFD" +
                                        "yvIwH+87M361p0UAFFFFABSdBS1xOq3819e2mm2cZNwl5hpF5WKONNzMx7E5CgepFAHMx22o+L/GEq" +
                                        "6jbK/hmwWC5s5EkeJ/tiSLKrFQFJzjPXBUlTkORXrlUNN0+y0mxg0zTohBbWyCONF6KqjAA/Cr9ABR" +
                                        "RRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/9L9/KKKKACiiigAoooo" +
                                        "A+UP20PF0PhX4Ca7BNEsqa2rWDFj8qB43kBK4O4MyLH9XB9q+M1mTQbqWNfm/XOOtdr+2Fq95qfxR/" +
                                        "4RyS5ay02TT7a2jdyPLa+jaa43J7+XL5bf71cVf2Dxx+Uo/wBz6fJ0NAH0p4bATe2eNv8A+uvcfDwx" +
                                        "pOwdO3515f4IXbogX0X/ANnr2/weAIj9RQB6oi7R70+mqNq4FOoAKKKKACiiigAooooAKKKKACiiig" +
                                        "AooooA/nT/AOCkf/BOFvCT6p+0J+z5pY/4R/FxfeI9HjdVXTgo817y0Rsf6N94ywqT5JwY18nKw/hf" +
                                        "X9/lfgn+3n/wSwtry31X4zfsu6aIryPNxf8AhO2jVYpEA/eSaWiAbXGNxtcYcFhDhgkLgH4A6ddmzd" +
                                        "5QcHFfYXwd1m6OtWEw1kggjbx0454r4ygKiQB22q3DEDOAfbIzjqK9W+HPjCXRruN3GVtPn/AUAf0M" +
                                        "fA7Wf7Rvy2M4/wA4/wA//Wr9SfCf+haGirzgV/O9+zt8aF0nxJpGRwOM9vr+lfuj8MfHkeueForpTn" +
                                        "j8j6UAdP8AE7wjpPxB8JahpOsx7oplx9MfWvxV+OvwJ8LwANeaCdn/AD0XSCP1r97hcWtxDkE4NeL/" +
                                        "ABI+GWi+KtAe1g0lHJwemKAP5+dB+B3hHXv+QdobeC17l2LH9a+n9C/Za+EBBzNpGohON+fbvzX2L4" +
                                        "t/ZvtdXAtvN1Yj/e6/jWD4c+DeqeD1dtHLgmgC/wCBf2Oo4dba5bWdNn08fwLHkn/P1r7n8B/Crw14" +
                                        "HsBaabp2mx+8Gnx2/wD6Ca+YPDnhj4jWF5tn8Rbk/wB38q+0/D8d2NPT7VdfaHPccUAbapHDvZFxuO" +
                                        "447n1qaiigAooooAKKK8w13x9Lp94+n6XZLrF1NEZLezt5lS5mCjkjzCqgD1JwKAMn4h+Pbrw/ZrYa" +
                                        "Dp13qfiC+8yCxtYdqLNdIm8BnZlVVUDLEkADPpXpGj6Qmn+beTAPfXm1p5OvIHCA9di87R9T1NYvhj" +
                                        "wzcWfl6x4m+zX2vsrI11HAI9kZORHH1ZVx1yxPqSAK7egAooooAKKKKACiiigAooooAKKKKACiiigA" +
                                        "ooooAKKKKACiiigAooooAKKKKACiiigD/9P9/KKKKACiiigAqCeeG1hkubhxFFEpd3Y4VVUZJJPQAc" +
                                        "1PXhn7Q/xL0v4XfDK+1fULlbabUpE0603Z+ae4B4GO4jV3H+7QB+ROjf8ACTfEHW9V8VWU0etahrN3" +
                                        "dzxyW3FujXkqvc7ASTtjZFUDrgDJr6N8Nxh9K05+pD/h/HXkPg0aro0pj/4R06d0/CvrT4a2eLd0Dk" +
                                        "jef/Z6APovQf8Ajx/75/pXqOnW4FiFHNeaaEMWKA9sCvXtIj2Wy0Aa46UUUUAFFFFABRRRQAUUUUAF" +
                                        "FFFABRRRQAUUUUAFFFFAH50ftqf8E7vhr+1RaX/jXQdnhj4nrbBLbU1ytrfPCAIo9RjVWLrtHlidB5" +
                                        "sa7M+akawn+ZH43fs7fGr9mrxFBoHxc8NTaFNeb2s7g7J7S7WIjc0FxGXjcruUsgbegZd6qWAP9wtY" +
                                        "fiLw7oXi3RLzw34n0+DVdK1CMxXFrcxrLDKh5wysCDyMj0OCOaAP4z/hH8adQ0yQWOoao1tzwfn6ex" +
                                        "Ga/Tv9nD4yEvJ5viD9w2eK7X9o7/gjNoms3j+IP2Y9ci0Ayuu/RdZlmltI1xgm3vAJp1xjOyVZCxJ/" +
                                        "eKAFr8iPGPgj9oT9k7VE0b4leFpPC13qSF7aaa2trhJCmN3k3EfmROV3DcFclcjIGRQB/VN8OvipoX" +
                                        "iCMGLV1kP+/wDlX0Hp13az2QKXYYHvxX8u/wAKP2w59Nbyp9Za3+u//Pav0p+GP7cnhW5XbdayD35F" +
                                        "AH6pC0s7kcjOaj07wrp8QI65/wA8V87+G/jp4b1bITXUYj/Y617XpXjrQ5zsXV0Y/UUAd7H4f02IYW" +
                                        "L9a144khUJGMAVTstQhu0yrZP5VoUAFFFFABTJHEaFz0FDukYy5AHua8v8Ya7BNBISfKsbP53us/Kp" +
                                        "H+HrQBF4o8bXj6nJ4O8L2E2oaw0Pn/K6xRRpnALyMeMnjua1/Cnw48OeE9RvNct0a71a9LB7uch5Vj" +
                                        "Yg+VGf4IwQDtHU4JJwMXvh7B9m8DaCr6U+hSyWVvJLYSOJHtJZIwzwswJDNGxKkg4JHFdnQAUUUUAF" +
                                        "FFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/9T9/KKKKACiii" +
                                        "gAr4c/bE17ZN4V0M3CSWVpJLqWo2ZHzSQxjbA303hx/kV9x1+KP7VXjnVNZ/ak1jQ9Qs1tz4bm0vSr" +
                                        "CZUKGazurW3vmZpDkEi6lMfHQADGckgHp/hhGHh0LnGP84/Gux0iM6YmEP8A+qibQowxbCgH/wDVXT" +
                                        "Wmgto32AL9wYoA+mfBSEQHcMfNXr2nDERPqa8/0q12pt+teh2Eey3Q+1AF6iiigAooooAKKKKACiii" +
                                        "gAooooAKKKKACiiigAooooAKKKKACsfXNB0TxNpdzofiPT7fVNOvY2intrqJZoZY2+8ro4KspHUEYr" +
                                        "YooA/Iv4x/8Edf2ePG6JdfCrUb/wCHd9GiRiONm1KycBiXd4rl/PMjAhQVuFUYB2E5z+Q3xh/YG/ae" +
                                        "/ZZ0W88d+JtG0rXfDWmQw3F5q+m3iyw23mSmBYTHciCcsWK7isLJhl+bO4L/AF218Af8FRv+TFPiZ/" +
                                        "3Bf/TxZUAfz7fD79pePS3/ANK1SS3PHUGvuj4X/tFRRnafEWCcdRwPx96/COtjSNb1LRbgXGn3DQN3" +
                                        "KnrQB/WH8Kv2gIb6FFefP/AT+Ar6/wDDPxO0XUgwWXcR7f8A16/lW+EHxq8Xs7qdbZB6Hp/n/OK/Tf" +
                                        "4KQ6zqg07+2dfx174+n/1qAP2q1Hxr4W0ld9/qMUY68tXFav8AFqxgh8zQbKXU29EAA/nXz58OPhNZ" +
                                        "WmsSjVtabUyG6HH/AMTX1lp+kado9oEsLILt9B/9agDz3TLDx7qmsS654rCQQx8Wdohzj1LH1ryZLK" +
                                        "1t9S0S10TTMQeJvGM1xOxPRYonkZj+EfSvrWVmCnd0FeQ6uU1Pxt4ctu1tqyk8d49OuJB+uKAPdKKK" +
                                        "KACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9X9/K" +
                                        "KKKACvGPjZ+0B8I/2efCz+Lfiz4it9Ft2R2trdmD3l40ZRWS1t1/eSsC6Bto2oGDOVXLD86v26v+Cn" +
                                        "nh34Hy658IPgns1v4hQRm3uNTzHLp+j3DMySKV+bz7uELzER5cblfMLskkNfzffEj4oePvi94rvvG/" +
                                        "xJ1ufX9b1GV5Zbm5bLDeciNFGFjiTpHEgVEHCKBxQB+w/xk/4LVeP9Y+16V8DfBdn4ctm+2QpqOryG" +
                                        "+vCj4W1uIoE8uCCVBl2jkNyhYqvKqd7/ANnnx5qPxN1vVPid8XbyPU/F+pRxi1CAxRytcOLiUqLIZA" +
                                        "TYi47AYr8Nq/av9lWG5m0yW4bj+xf9BP47+1AH6aeGbomQM/Pl/rn/AD/nrXsWmx4hdh/e/LNfO/he" +
                                        "83+ITjD57D+vy19DeGIjg56YSgD6E8OrgE+tdun3RXBeG4wA3eu+AwKAFooooAK/DT9pX/grxrPwp+" +
                                        "LHjH4X/DrwbY6qPCmq/wBnfbr6WYLK1qrR3ymFNhVkuQUjYMQVUtj5hj9lviN42074afD/AMT/ABF1" +
                                        "iKS4sPC2mXuq3EcIBleGxgad1TJA3FUwMnGa/hL1bV9V8Qape67rl5NqGpajNJc3NzcSNLNPPMxeSS" +
                                        "R3yzO7EszEkkkknNAH60eMf+Ctn7UvjRo9J8G6loXhNElDm/tdJfzTHgjEqXs1/GozydoJ9G6isu+/" +
                                        "bX8deMhaaf8AGr46fEHRTav5kf8Awj+hWWiEhwA4d7S6gkl4Hy7wVBzgc5r8mQSOnFW4b68tiTBPJG" +
                                        "SMfKxGR3HFAH9Gvws+K/7MXizxH4ZtPiX8R7y++IenXTweFtQ1i8fU75bvVPkDP9gvNS0yMZZUVX27" +
                                        "cDKqa/TbSNC+Hll4p0DRfEniaHUfG9jaTlbe8ntra9ntL8tu32Vn5MDglcBxEfunBySa/iQVoREcBh" +
                                        "MGBBB+XHcY6598/h3r7U+FUP7Q/wADbO7/AGgP2dtai8VWN5YyabrN5pNtLez6ZBcFJ3g1CGeBZrUt" +
                                        "5QK3EfyfKRHPnIoA/frw3/wT/tPh14gXVPhV8b/HXhtEu47uexGoJcWc3PIlhMYWTPI+cMB6Gvp+++" +
                                        "I118NvEX9ieMtWudXi1CaW4SSSzRfKjdRtghe3WKNYoyCd025zkhpDxj+UDR/24v2nNA+FWo/CPSPG" +
                                        "99b6bqupy6pcXwlc6oZriTz5lW9LGVElnzLJtIZmZ9zFXdW6H9lP9qfVvgbqnjyb7ULfxD4+sVsLfx" +
                                        "FdoLo6XO8hdrqX91Lcshdg8nlFj8m4xTOIwoB/W18OPi78P/ixpz6l4H1VL4RYEsRBSaMnsyNgj68j" +
                                        "3r0uv5bv2O/21fCmkXOq6d+0BrMmm3fmT6nDrhQvvf8AdKlpHbWdm8gmZi0nnSSCPaixjy2Cuf6DPh" +
                                        "N4rt9W8Pr4u8M6yuseDL0I9o82/wA1FcRRoquzMrRoFZVVFUk/e3OS5APoWivJvh58aPAXxHjtbbSt" +
                                        "QjstcuIHuW0a7lij1SGJGCM8lqHZwoJXLYwNwDYbKj1mgAooooAKKKKACiiigAr4q/4KKeF7rxh+xX" +
                                        "8VNJs/9ZBp0OoH/c027hvZP/HITX2rXwj/AMFMdTn0n9h74oXdvje8GnW5z/dudTtYX/8AHXNAH8eN" +
                                        "FFFAHs3w1/5Cmge9y386/dr9lqPzHsPXNfiB8IMf2tafj/Kv3A/ZY/1ln9DQB+ifge73B2J5PzV65o" +
                                        "yHadx6c15/8PbBUQbeg/hxXu9rAAOO9AGhCMRjnNeW3WuJY/E/TtHx82qpIv8A35hMmf6V6vXJ2FkF" +
                                        "8SXN03JSLYOP720nn/gNAHWUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFF" +
                                        "FFABRRRQAUUUUAFFFFAH//1v38r8X/APgpr/wUE1L4O/bP2ePgvdSWfjW6gT+2NXTcj6Vb3MayJFat" +
                                        "x/pM0bBvNH+pRgUPmsGh/V/4p/Evwn8HPh7rnxM8cXa2Oi6Bb+dPI3clgkca+rySMqIO7MBX8V3x38" +
                                        "OePtM8cy+LfiLf2ur6n47WTxCb6zeJorhr6eUysyRBVhkWZZFkhKqY2G3aBigDyC8vLvUbyfUNQne5" +
                                        "urp2llllYvJJI5LMzMxJLEkkk8k81UrQmkW4j2wRLGkKqx5Gc7VRjnqdzDOO2T2yaz6ACv2u/ZD1Y3" +
                                        "WqmJY97v6evlydf8a/FGv2O/ZQvVil8LTL8rXtoLw5/wBhiOv1H5UAfp3ZwgSSH+M4/T/9Ve4+AIWB" +
                                        "Ydw3/wCoVwPg+HdpCM5yDXtngeJhn/f/AKUAe16CoAJxzn9a6msDRlIUk+prfHFABRRRQB8Bf8FP9U" +
                                        "l0v9h34kvbXDW81yul26lSQWWXU7VZE47NHuB9QSK/kAr+k7/gtr4006y+C/gD4ePu/tDWNffVI8fd" +
                                        "EGm2ssEmfq14mPoa/mxoAKKKKACrlnfXmnzpc2M7wSoQysjFSCOnIqnRQB6T4iuIvHo1nx2g0rRb61" +
                                        "Fo11ptsBZrc+Z+6kurSAAQj94EaaCMqVMu+GLyEkEHm1FFABXr/wAJ/jv8W/gfqNzqnwt8SXGhTXkf" +
                                        "lTCMJJG64OMxyq6ZGThtuRk4PNeQUUAbOja/rfhzWLPxBoN/Pp+p6fKk9vc28jRzQyxsGR0dTuVlIB" +
                                        "BHev6I/wBkP/gqsNa8R6X8Gf2nDaxazPI9uniy1nt00+WVvmjW6SMJFEOsfnRMU3bQUVd0lfzh19V6" +
                                        "F8Qta+NOpeBPgtqMdpp3gnSNSjFpp+90W2tpCzXUzzjMkh2bnk53lj+5TcxUgH9otle2mpWkGoadPH" +
                                        "dWl1GssM0Th45I3G5XR1yGVgQQRwRyKuV/IX+z7+1h8Wv2ONU1Dw/oV5Y6pEJNi2aOt9Yyi5USCR1t" +
                                        "pozMcKgU+aJIiQoYL5sMn9TfwZ+Mvg746+AtO+IPgwXMFnqCFja30X2e8gIYqVmiywU5BwQzKRyrEU" +
                                        "Aes0UUUAFFFFABX5K/8Fj/AIm/8Ij+y9ZeALO7gS88eazbW81tIMzSafp4N5LJF6eXcpahm9Hx/Fkf" +
                                        "rVX8q/8AwVy+On/C0P2lB8OdKukuNC+Gdt9gXyniljbUroJNfuHQblZcRW8kbMdjwNwrFhQB+VdFFX" +
                                        "tOtGvbyK3X+I0AfQfwWtDLcnjd/nrX9BPwBsw2neGBv7H/AD7V+NX7OXw5e8lLtvxxnA+f8q/db4Te" +
                                        "Fg3h2yccfz57ZoA+6vD8eLc49B+PNdogxn/Paud0NP3J4yP/ALKuloAK4LTIdPHiyJrf/WwWMsf/AA" +
                                        "FplP8AMV3tZsEIhvHHUuC35Ef40AaVFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAF" +
                                        "FFFABRRRQAUUUUAFFFFABRRRQB//1/Vf+C1XxQvvDnwc8E/CmxEka+NdTuLy5lVgEa30dIyYHXGTvm" +
                                        "uYpAc8GLvmvxE8G/EO28W/CC++A3ilDMsU0mp6A0FqjXKaqAkccPm5TFvNG83nl84KxuCSuK/oL/bD" +
                                        "8YWvgv8Aa6+Ez+KNQsrbTvEukXeg6Wb2PzBaXepXAgvLmGQYNrJte1AnP8KsvQtX4VftUfAK9+Gf7S" +
                                        "SeDNY8YQano3ia4tZLTxHcOXiW0nl+zmS5MYODblGDhcnYoYfeAoA+L6KuXvkG6k+y48oH5cZxx3G7" +
                                        "nB7ZqnQAV9t/s4+MJbrUdM0m1vZEv4bV9PSPsRPLsVR+Lj6fhXxJXsnwW8Zv4W8T/wBn3N5NZ6brG2" +
                                        "K4eGXy9rKG8tz8r52sf7uSCR3NAH9F/wAJ/En9saW7n7nP/wBf/PpX1h4D1sypsbvmvw3/AGcvFbf8" +
                                        "JFJvbqOByP0r9INMuWzv6n60AfpDpk2UG3oK7ayk8y2Rq8B8Cau02iK+zH49s4r2nSNVS6iGaAN+ii" +
                                        "qN/fw2FuZ5TwKAPwI/4LO2UninxH4CsNKXzrrR4LrzFHYXDKf/AGQV+BkkbxOY5AVYdQRX79ft7/ET" +
                                        "R5JvFGqwDLgJGv1HHHpX4J6xcre6nc3KDCyOSKAM2iiigAooooAKKKKACiiigDf8N+GPEvjLWYPDnh" +
                                        "DSbvXNWuw5hs7GCS5uJBEjSOUiiVmbais7YHCgk8A19sfBjwR8HfAHhTx78Urzxpo+u+M/CdvoFz4W" +
                                        "XF0Ibe/uLhZby5NrMtsbiawRP3Mcu63lc7JI33BB6F/wTK8GeI/FfxQbUfAtkH8UeGtW0jUre7mieO" +
                                        "0isxBqEF7FPfRAyRiWKX5LZcfaWQbyI4mI+6P2pdY8A+Ov2ZfHvxCtvhsdF8SfBD4hzajG8+lxjTdR" +
                                        "ubvXXt7mOW4cyfa4pVwL9InH+kJEP9Uq5APkr4o/Cq/+OWreBP2l/hRLa+JNN8beM4dMntLm2iS2g1" +
                                        "CeHTo4f7W020d4rZb+/WaS9KsQRPGwDM6B/sjUPjTpf7DnhBofDMtm918T9eHiLQdGttKtpbnw/wCE" +
                                        "tSjS6cXFtby25eZrpzZrGb7y2CqbZlKGMfMvxhsrv4O+NvFFn+yhrd98MPDXjrwNY+PLqO9b7JcmSC" +
                                        "6fUE0ywkiGbN44rhf3at/CYySrZb239qPX/Cvwo8R+DvH2kR2vxE/tTxDquoz6xLpy6lpH9kTkjSNF" +
                                        "srwRQK0lnZj7VY2tvqKqLqB3eMu8LIAfoH8P/wBtm2F74k0X4++CdY+GD+Fwvm6nqMJl065XOCyTQq" +
                                        "QGPUKAwIOQw6Va+N3/AAUS/Zn+BYtI9d1a7128urj7P9m0m2854gF3NK7TNCnlrlQSjs2WGFPOPx/0" +
                                        "f9q74iWGleMfit8CdU07xV4LlWSbxB4A11Ee9sXvIt17cWKczXGj+aqtM0cqyYZvtESgG4PzN+0j4g" +
                                        "074zeGdR+NHgQW93o9zdQxaiW3rqekjyh9mtNTgMbQsgkV4dLvLY7hbKYLp8sscQB9V/Hr/gsp8W/E" +
                                        "0kmjfAfR7XwVZxSEf2lcBNSvZVRvlKJPEII1dfvK0UjejKQc/MP/AA9N/bn/AOiip/4JtJ/+RK/Pei" +
                                        "gD9ddK/wCCz37U2n2a217oXhbU5QSTPPZXayHJ4BEN3GmB2woPrk1+TOo6lqGs6jdavq11Je319LJP" +
                                        "cTzO0ks0srFnd3YkszMSWJ5JJJqhT0RnOFBJ9hQAyvYfht4Zl1K93Sae0+PrXmulaXd6hcBIoGlHsK" +
                                        "+7/hd8MblHQxv857UAeufBfwLrEYLBN+yv3X+FcxNppzeT5YK/3/8A7EV+Z/wZ+Ds9ww39B/nr/Sv1" +
                                        "Q+HmiTaNE8IfKD/P4UAfSVl/x4r/AJ71o1iacP8AiXD2/wAa26ACsO9fUDeaabFR5P2p1uM/88fJlw" +
                                        "R7+aE/DNbleQ+M7ufwzbP4ohlMurLHBEiLpwuE3udpYIuyc8E/KbkAdz1BAPXqK/nD0z/gs78efCfj" +
                                        "K70f4ofDzQL+20yae1urXTmvNOuhPCShAluJboKFcfMphyeR8p5r9ev2Nf2utK/bB+H9/wCNdM8K3v" +
                                        "hiTSLo2V3HPPDc2xuMGQJbzIUlk2wmN3LwRgF9ql9pagD7CooooAKKKKACiiigAooooAKKKKACiiig" +
                                        "AooooAKKKKACiiigAooooAKKKKACiiigAooooA//0PvP/gpp8HrX4rfstazquZlvvAM6eI7fyFQllt" +
                                        "I5I51kL9IlhleV9pzmMHnGD+HHxc+H3he++CegXngjxdb61plzqurXtneIu2x0+7fT2k1bSUKxwE3N" +
                                        "68MRsYvsFnCVjxGzmRmr+rjX9C0nxRoWo+GtftlvNM1e2ms7uB87ZbedDHJG2OcMrEHFfyMfGP4K6n" +
                                        "+zN4l8Z/Bb4pQZS+vkuPDHiK+iuFTZprNcRy27wiYMtzHcmO4j8hgtwyfOAkjAA+DftLizNmAhRnEh" +
                                        "PlpvBAIx5mNwGD0zjPOMgGqlfTXhT4UeF73w9dnU7+K/1LWvCmp6jovlOITHf6Xqm1sLkGYT2lvcLG" +
                                        "kgWXc/EXyxM/z1qGmT6VLHFemJzNGJF8ieKYbWyBuaJnCnI5U4YegyDQBlUUUUAem+EviL4i0FDpdl" +
                                        "qsmmQXr/AOlToWZnj7hsZJx2x9K/UD4LftG3KFEutc/tJ3xhD7fhX45VpWWq6hp5lNnM0YnG2QA8Ou" +
                                        "c4PqM0Af0u/C/40JNFjVzg/jxn3r7w0H4haHDo4kfV1IHc8V/J74L/AGo/iD4ZjFtd3b3EQzggDI/O" +
                                        "vcbT9sXVDa+VBqUkLDsy479qAP6ibb4m6A+niYapGeOvFfPfxa/ab8K6GBBFq6IT6f0zX4AP+2p4jt" +
                                        "OIdWkkB/2ev5V4b8SP2l/FvjC5H2e7covduOfp+lAHQftKftAX/wARfFniCGIYiu5sFvZT2+tfHxOc" +
                                        "k8k1avb251G6lvbxzJNMxZmPc1UoAKKKKACiiigBwBYhRyTX0dF+zB8SdL+MyfAfxzbDQvFkthe3a2" +
                                        "kDxarKJoLGa7t7eRLCWby3nMSodxBjVxK67MZ+uv2Kv2cNI+JnwT8b65Pp0Wpa343h1/wv4fZneK5t" +
                                        "/Eej2Vlr2lxW0m8RR/ahHctNLKoCrbLGsqCZ0k/oV+Hfwu8CePIE+MPjjwFZ23in4heHdEl12G+ssP" +
                                        "8AaPsVxBLDNbTh/LkSC7ltZAzFzEfKkJVQCAfyPfDH4MT+L9Jh8Vamc6ReWXjQwrFIqTC68LaEuq5I" +
                                        "bqm6eDIHJUOB6jwGv7IPih+wn8BfGHwwu/hf4Q0eLwNHe+eqTaWskahLy7sbu8V4Y5ESTzzp9umZMl" +
                                        "FRQhUDB/MXxT/wRT8TX/jjT4vDHj6ztPDc8M8mpXtzbF7qO6aadoktbGFYovKEXkI26dcNvdRt2xqA" +
                                        "fGX7A/7T/jj9lq2+IHjLw74IuvGuh3I0warHbXaW32cQreNC8gNvcSbPmfLrtVMfOSWXH9H/AIQ0WL" +
                                        "4q+HPHmna7ol54a074h2FvPFb3NtJFLHp2sWGHF3a3RuLMaklx9oW4RU/1YgEqtwD+Xv7J/hL4e/sf" +
                                        "fFz4ofs/aD8XNK8Z6p4x0N4Fayj/ALP1Oz1/SDcRpZRpcObNpWW4Ypvvo2EqFHRcb6/VzwT4l8BfHu" +
                                        "68EfF/wnqj6poN3o1xKtkLqKS3S5ml0+8gN3aozqL2zKfKc5hLuDyykAHwfd/EPwdrPwl0m60PwV4e" +
                                        "g+LXgTxJbfDK/treC2vntrIapHpl5Fpv9obGNlNFLtiVwVhWVo2O1Xavya/bM8Uj4N+P4vhB8Jr/AF" +
                                        "Pw1ZeDYIbe2tXnkzBY6hNbeJbMW/mW9vPDLbXUvzSTAXXyxh5HIYL/AEsj9mP4N3usaT4v8QeF9Ovf" +
                                        "FWl6r/bg1RLVIpjqRfzWmBAJxvAYAk4IB6jNfFX/AAUr/ZEu/jJ4Cn8c+B9Tk03WNO2zXViP+PbVXj" +
                                        "VY4POJYBZI1yqMcjnBHegD+ZPw94q8T+B72x1/Rs2N/ue4trt48mWGQSW88bBwY57eYb45UkV0YB0I" +
                                        "2tIrbGkv4h8ffEC3svAVtb6Jq3iFRZLBb3UWm20stxb/AGe5HmTSRQwpdFpN0W5IgJDEiqm1BLaeIN" +
                                        "Ui8La18L/Ed1qaK+oRz2Wkm5+yabaarvWKe7ubdwV8xYFaAKFQjfuaQLF5cn7t/wDBKb9jyXwN4k8T" +
                                        "fHLxXd2mtR27tpnhvUtIvmm069iUyxahMFGxpI/MVEj85FwyM6qfkagDwb9kf/gkr4/1rxY3iL9qTS" +
                                        "v7B0LSJo/+JI0sdydXimjkV8XWnXyvbeS+xgTnceMEAg+uf8FH/wBhL4U+BvhR4M8YfBXwkPDuneFL" +
                                        "s22uTWKxSv8A2XcsCbif7RcR3F3cRSYWJQzOyuys6qqkfu7LcyreQWkdvK6Sh2adDH5cWzaQrhmDZf" +
                                        "PG1W6HJXjPE/Evwh4d8b/DXW/CPjFTqGkXtmy3WYftDyJGA5YRRqSz5XIEa792DHhtpAB/DdaeFNYv" +
                                        "bhrOKErNGfnDdEHHX866bQfh9rN3cxCeykYGcR+341+5njn9mzw6Ipf7B0DzNnoX/wBj/aryXRfg1p" +
                                        "WoTSLFxsz82euTQB+f3gD4aXE2ogDSGcDHXP4mv0W+DPwradw0vt97/wCvXs/hb4AjOf8AhH8Z46/5" +
                                        "FfVvwt+Fw0MFmOMUAdV8M/C2jxIcDlPr198V9W6ZagL061wvgbTNPsItkXP4V6/YSW+PlH0oAt2AxC" +
                                        "KvVSsWBtQc5xU8rdu1AEjHapPpXxv+1Z4vg0bwBqLqMnH/AOrmvpvX/EMFhp1xPLwqA1+Hn/BSH4p3" +
                                        "sfhiXTwmBuA9O/egD8YNS8FjW/E+ua9p0N7qvhDw1JZnV722AaWK2kdIWZBL3JyE3ZAwM4Wv1m/Z9/" +
                                        "aS0b9mr4dRW+iT6h4i+C2sT/bbDxFpNjE+q+DtTuXBuNN1GGcNHLjcqea2BKhZoS/CR/nN4e/aV+N/" +
                                        "wFvrzwDY6tDrOjpNZSalpGuWlrqtnLPbwqjwsk3nmIIubcmKSOTy1AYRuCqeQ+GfjF4o8BeKtY8T/D" +
                                        "i3svDSazbzWclgkAv7NbO4ZGltgmpG7Zo3CBX8xnLoWRiUZlIB/Yd+zX+0/wDDL9pbwdFrvgrVoLnU" +
                                        "7ZAt/ZjMc0EgA3ERv83lkn5W9wCc19KV/CGPGS+H/EVp4t+Gr3/hPVLRklie2vW328wX5ngmRUkUFj" +
                                        "8qklkAwXfOR+9X7G3/AAVs0zxJLpvw2/agZNO1WdhDD4nURxWkru3yC9hjRFt+y+avycguEAZ6AP3S" +
                                        "oqpZ3tnqVpBqGnTpdWtyiyRSxMHjkjcblZGXIKkHIIOCKt0AFFFFABRRRQAUUUUAFFFFABRRRQAUUU" +
                                        "UAFFFFABRRRQAUUUUAFFFFABRRRQB//9H9/K8z+KHwj+H/AMYdDj0Lx7o8GppayfaLOaSNWms7kAhZ" +
                                        "4HIJR1z1HBHBBBIr0yigD+ZL45fsv67+ztr3je38E/DyTxhpuh2ul3Wl32qWct3p2kzToJtUNsJ4jY" +
                                        "XSMdqBLlZHTjEZIJP5E6vpVxp17dQllnjgdQZoh+7IkG5P9wsOdjAMvKsoZSB/fCwVhtYZBr+fP/gq" +
                                        "J+yN408KTXvxv+DkWp3mgavFfHxHZWVtE0dnFNcf2hdTzzRst1LBLP8AviskcqQ7XJliiWKIAH4I0V" +
                                        "sNb2cuj/2g13Gt4kyQi2VGDtFsJ80naEABAXGSzEkkDGWx6ACiiigAooooAKKKKACiiigAooooAK9h" +
                                        "+EXwN+IXxvl8S2/w/sReSeFdJn1m7B3828DIhRCqsDKxcbVbaCAxJABrx6v0p+DvwT+L/wCyn8Wfhz" +
                                        "8U5df8O3fiCLxFDpmoeFdK12zu9dtYJo7gXP2qIN9kiRrWOTEklwUVnj34+YKAfpH/AMEgNR163/ZD" +
                                        "+JI8L2IuNZsvEOoT2HmqTDLdtpdoIoyQVJw6LuAIwGHPOa/Z651G0022ludVuEt4rWFp555MxwIiDL" +
                                        "uzt8qhQCTluByeOa/K/wAO+KLX9nTxn448aeHNV1DTPhXJ8RNVmv4JbETNr+ta1bW8U5a9uILK20jS" +
                                        "9Ou2RYp3mkW48uT94V2B/wA+/wBtB/21f2gfjbb/AA0ubmbS9C8ReF7TxQPDcN69rp2l6TGT5z6p5q" +
                                        "wK0tvcxOZHlUsG2qgHyIAD9Ivh5+2v8Nfid8XvFnhX4Cf8JF8QPF2oxD7Jqtxp8y+FbGKKIywQOI3F" +
                                        "xawvJmGS4a2LtMd3zxhAN/VP+CinwV+D0N34T+O2oX1n4/8AD+m273VtHpt0i6jPJEJP9EDRrGocng" +
                                        "uUTnG44OPyI0PVf2g/2Zv2cH8TfBGXwpJoFtJE3i3UdEvoJfEdslxcCCG11h0EF5aiWZmS3W1k8yIL" +
                                        "IDIG+evn/wDai/bR1T9q/wAC+ENJ+IPha3t/GHhKV1XXLW4ZFubWaCNJ45bXZt3vPGsocPhRlFQAli" +
                                        "AftJ+y940/Zi/bC1f4z2ms+F7C70vRPHh8V2a38H+gywz2MWnxXsiy7AXuTbTyyxSphTIpIZhkfbvw" +
                                        "R/ZM+EP7Pcuu/wDCsoL7TbXXtQXUJLX7fcNbRMowsccO/ZsXJ+8CcYBJAUD+Yr/gnd4d8a+MP2jIfC" +
                                        "fw98Z3PgTXdV0jUo7fUre2hvUBSLzCk0ExCvGwU5wdwbaQR1H7a+AvAH7YvhDVPBeqfELxND8SvDXi" +
                                        "CC48DeLdPsYm0y6t7SwvL+O11SGWXyZZmjjlcTNbrFI6KjKLnAmAB+qhD7gCTyG5GMDnj8cf1qnaW1" +
                                        "5FptvaXlytzdRxos03lhRK4xvfYOF3nJwDxmuE+Gur+OLj4Y6bqXj3R7q38UQW0i3VnLLZy3M8sDOi" +
                                        "uHtmS1BuQgkQAoqhwrbSGA9OoA/mq/4KsfsZ6l4F8Vy/tF+BLfz/AA3rjxxanbQQyFrC4RNomkbcy+" +
                                        "VIAFBAQKQAQSSx+Ov2If2uPEH7JvjHWPENlFb6ho2pxWyalYXEkkb3MMc2wfZ2RXCzR+c0gLLjYHHJ" +
                                        "IFf1GftZfBzX/j9+z54w+E3hTU4dH1jX4IYre6nDGJfKuYp3jfZ8wWVIzGxAOA2drY2n+NH4o/DfxR" +
                                        "8IPiJ4h+GPjSAQaz4bvJbK4CBvLcxnCyxGRUZopVxJGxUbkZWwM0Af2faR+0R4P1TxBP4eXTdVleOJ" +
                                        "bqO8sLCbVbCeyuZFWyuY7nT1uI9l1GwljBIIRXZwqruPtllq+lak7x6deQ3TRY3iKRZCu7pnaTjPbN" +
                                        "fypfsi/tV+JvhNoOrP8OVu/FHxm+JOujRzb6heKYrl9SgkWzvQZI18y4ivzFk3UsqBGmVfJNw8lf0F" +
                                        "/szfDK7+DHhbxd4j+J0+j2XjXxnqU/irxIdOVoLK0e6Q/u1eaR2MUXlStvZgCxkbHJJAPVvFHg/Tb6" +
                                        "bUNOe1iW0vWXU52eOVYTNbtGAXeNwCxCZx1IGTkZz4zbfCMafqAfSwAF+9x/sV9I6dfrd6rfx3dxG9" +
                                        "9Z5RLaGUMRbkgrMYiSQxJxk56YBPd2o2yLcMsvIb9eBQB47a/DSIZ5wX/wA+9d5a+C7hAwzz69zXfx" +
                                        "Q8ZJrY6UAedWvhedB8xzXXWVhbRr8o6Vr01VC9KAKczTjgDAqrd3R8r1rYrP1MZtWPpQB8dfHfxlHo" +
                                        "Hnmc/Jj/ANkJr+Z79sf4wyfFPx1aRQma3s9Gjkijs5f+WLSOWz0XnbtHrX6sf8FIviHZaPor2dtrex" +
                                        "3OBGv8eVX86/nmmlaeV5n+85LH8aAGE55PJNNoooAKKKKAPsP9kv8AbO+KX7KPjC31HQry41bwjPM0" +
                                        "mp+H3n2Wt3vj8vepZJBDMMIRIihjsVWymVP9U3wK/a1+Af7RGk2F58OfFdnJqd8rt/Y1zPHBqsRiGZ" +
                                        "A9oW8whRyXTch7MecfxLU9HeM7kYqR3BoA/v5or+Tr4Gf8FWv2nvhHb2+i+J72D4h6NCQNmtb3vlTO" +
                                        "SEvUYSMxzgGbzQBwABgD9h/gJ/wVd/Zq+LiWmleOLmT4b+Ibhghg1NvMsGclsbL9FVFUKAWadYQCcD" +
                                        "djNAH6fUVnaZqmma3p1tq+i3cN/YXiLLBcW8iyxSxsMq6OhKsp7EEg9q0aACiiigAooooAKKKKACii" +
                                        "igAooooAKKKKACiiigAooooAKKKKAP/S/fyiiigApjKrKVYZB6in0UAfjj+1P/wSK+GHxIjvPFn7Pc" +
                                        "sXgTxPK4c6dIW/sOfc0jSERojyWrneoXycwqsYVYAWLj+ej4r/AAP+LnwN1pdA+LXhS/8ADN1I0iQt" +
                                        "dRHyLgxBDIbe4XdDOE3puMTsBuAJBNf3S1zPizwd4S8e6Dc+F/HGi2XiDR7zZ51lqFvHdW0nlusib4" +
                                        "pVZW2uqsMjhgD1FAH8FNFf1FfHv/gj/wDAX4mahP4g+FWpXHw01O6k3ywQRC90sl5JJJGS0d43iJ3h" +
                                        "VWKZIY1QBYupP5T+P/8Agkr+2N4KjtpdH0fS/GaTLK0p0bUEBtxHggOt8tozF8naIg5+U5wduQD8za" +
                                        "K9F8Z/CL4sfDa1tr74ieCtb8L2147RwS6rp1zYpK6jJVGnjQMwHJAycc151QAUUVNDBNcSCG3RpZG4" +
                                        "CqCzH6AUAQ0V7/8ADr9lz9oL4s6HP4k+HngfUNZ0y3fY88aqq7uvyh2Vm6/wg1+jfwY/4JA+Ndes7f" +
                                        "xB8bfFMXhq3huYjd6Vp6faL02jIGci4IaOKUZOF8qQcZJ5xQB+MtFf2S/DH/gn3+yf8NvDb+Hf+Fc6" +
                                        "Nr7SFWlvNWtV1C5kYIqlvMuzMY92MlYikeSSqLk19Ax33wr+FkOm/DvRrOx0NUtZZdP0u0t0toRDES" +
                                        "zCMKqwxjcf4mUZOSe9AH8pnwG/Yn+OniPW9W1Px/o2q/DnwnpFpu1S61S2u9PkvI5wdtlbr5Lyv520" +
                                        "+fKkMqW0KvLIjlUik/UuH4B/s5/Dbw78PfEPxk8NaLo1jqstvLo+mR2t1pmq6hDcQCY6Zq+mb7+51C" +
                                        "5W7e2lKT3rRhkVCbZQ6T9B+1X8bfEvxi8DJ4f8E3Xh261Xw2w1y+0641t45NgvAbAQC2eTS757HyN2" +
                                        "pG6MtlbTryzRgsfz40P9s/8A4Vba6B8LvFfgfRfiPaaBJ4gu7m3uJ4dduLmXWPPkj+06nskhmli8w/" +
                                        "aDboYZUP8AC6kIAew/Ff8AaW/ae8MeIvDuo+LNZPgTwJ4d0ixXS7a0sbg2GtWswia5e2eHULyy1R1s" +
                                        "yq4m1dAAwMGy7INaJ/aig+OXwH/aGg+FmlXPhuDTNFt9Un1fWJVupz9p1Hfe6Z9oceWtveqWMFo7s0" +
                                        "kj3IHmBgo85+IX7Yfw58L/ALKviD4Gw39v8RvEPiXxE9xe2XkyQaFZwRzwXFwLPYsRWymlib7OkTi4" +
                                        "Zna9klgncwL8IeDfjRZ+Bv2Z/iH8ItM3XOqfE7U9JW/WaImK107RHN3FJBKsqnzprl9rK0bKI0PIZg" +
                                        "QAdX8PP2p2+FXwO8SfDXwZ4ZtY/EXja1v9I1rV7hnl87SrqFYkSOMMNsyAuAxJRQc7SxyvyBRRQB6R" +
                                        "8JPij4s+CvxI0H4o+B7j7LrPh+4E8LEBlZSCkkbA5BWSNmRhjox71/TFqn7TGszWVl4Kh1Sbw1q2o+" +
                                        "J9N8Q6f5tnqzf2z4WuLhfEbtYTGMFXWB/sN8txIlpCqurtbRsFX+VWv63v2d9Z8E/H3xF8G/ipoGmS" +
                                        "+J7rwX4Tmsr7xlFLDaAX8ttbRPpd7ZQzZMzeZLcPCyyQ27bDE7+aXUA++PC/i3QPGXhnQ/GHh26+1a" +
                                        "T4ktLe+sJtrJ51vdQieJ9rAMN0ZDYYA+vNb0M6SsyruyuPvKy/eAI6gZ/oeOvAr2FrZabbQaVptvHb" +
                                        "WlnGsUUUIVI4kQAIioMbQB0AGAB24rQoAYQSwxjH61/NZ/wWG/Zv1Lwn8S4/2lYtbju9N8bz2unSWE" +
                                        "mRPa3NpZiNTF1DwukG5iSCrt0IYEf0rV+LX/BZv4cf8JP8KPDHj+PXFs38G3Mgk0+XzNt3FqBSLzEC" +
                                        "Bx5sMiIBuVV2yNukyUVgD+fT4Q+O7b4a/EXQ/Gd9Zy39nptwkk8EE72szxg9YZ4iJIZVOGjkRlZHAZ" +
                                        "WBGR+inwd/bK+Hnxg8XXngP9t3WdZ1f4eLYNbaBdXRhubrS2hVtpvLmxtIr24mmi/dyXEZAmbi5hkR" +
                                        "w0P5P0UAf08+Bf2wPB/xP/Zd8XfEXVtJTw54V+HOvro2kaw9oZnjsoUgFpMYQrBblxIiOiHYC6jpgn" +
                                        "9HfAPxS8FfE/w7/bXgzW7DXdPLGES6beC4iSQAZRpkAKsM5IIBxjiv4fE1fVU0mXQo7yZdNnmS4kth" +
                                        "I3kvNGrIkjR52l1VmAbGQGIHBr9AP+Ccv7Qmh/Bn4rXnhfxpdSW3h3xkttETGrMv2+2kLWqvg/Kjl3" +
                                        "BO1vn8sOREZKAP63LdEQfLNv8Ayq4CD0OaahyOo/Cn0AFFFFACFgoJPAFeJfFP4oad4P0+1Z/mNy/H" +
                                        "/Aea9D8YXn2LRp5z0C1/Lb+2r+1n4n1zxrqXg7wvqUi2sEhDSjHKsFIAG0dcde1AHyx+0v8AG3WPi9" +
                                        "4wdr82bxacxijuLFdiXEI5h3DA+ZASM+59OfmeiigAooooAKKKKACvSfAj/C26ebS/iTFqdmsyMtvq" +
                                        "WlyRubaQo5Vri0mU/aE37ARHNAyrubMjbVrzavSfh9411/w1qn/Eu0XT/E0UqLHLY6npsOpI8CNveN" +
                                        "PMRpYNwyDJbvHKASVdTg0AfY/w4/YA1r4k2tv4s8I+NNJ8TeB724khk1jTZXik0e3iKtLe6pb30dvF" +
                                        "CsKH95bm5WchhJCJo0Jbgv2q/wBhb4z/ALKmpG58QwL4h8J3Jla11zT0cwGJJRGv2qMgtbSHfH8rFk" +
                                        "JcKkkhDY9P/Zm+KPwX8CeMNL1F9f1v4FfEuzWbTr/U1g/tPw9crvLTi+03alzE0/8AqTHE6pC6JKpR" +
                                        "uE/WPxD428b6V4S0L4ieF/C8Wu+BdAgtdC1W106NdR0nxr4cvt1uFsbIFTby2Tby9sLP+IIkn2UOWA" +
                                        "PwK+HnxT/aa/Z20TQvHvw+8Qa14T8P+Ibm4msHjlcabqE9iVhnLW77oJ/KJCsJEYDgdq/Yb4O/8Fsd" +
                                        "CmshZfHzwJPbXccbk3vhxlljmk3/ACL9ku5UaICP7zfaXyw4UA4G5+3X4A8IfC/9gzT/AA98ANLhPw" +
                                        "6vboXEst0Znurdbm8W6iZGn/eYaTMfz8gbRnkmv5zaAP7pPhL8cPhP8dfD3/CT/CXxRZ+JLFceb9nc" +
                                        "ieAsSFWeBws0LNtJUSIpIGQCMGvWK/gu8GeNvFvw68S2HjHwNq1zomtaXJ5ttdWsjRyxtgqcEHkMpK" +
                                        "sDkMpKkEEiv6PP2Uv+CtHwu8ZeGtJ8KftDXZ8MeLIvs1k+pMheyv5WXabmTyo1S1ywG8H92ud2VQHa" +
                                        "AfsrRVa1uba9t4ryzlWeCdVeOSNgyOjDIZWHBBHII61ZoAKKKKACiiigAooooAKKKKACiiigAooooA" +
                                        "KKKKAP/9P9/KKKKACiiigAooooAKKKKAI3ijlAEiBx/tDNeDeLf2Xf2fvGvhSfwTrPgXTIdHuCpaOw" +
                                        "hGnuCpyNs1p5Uq89drDI4PFe+0UAfBPjP/gnt8JvFuovd23iXxHoNkw/48NPu7dLUH/dlt5X/wDHq8" +
                                        "j8S/sV/GrwXqel3nwc1fw/4tih3faf+Ev8+KQemw2kMsZ98oPxr9UqKAPxV17Xv+Cl/hO2e51r4TWO" +
                                        "vweHlLXdzp2qJINXQdTFaJJ5hJ648gN2C9q+a/GX7dX7WXwostR8Q+P/AAVf6RDr8oh3a3pF1aW0jt" +
                                        "abdqQyLEpww5wx6HrX9H1RyRRyjEqBx7gHFAH88Df8FjvEmq217KmhWmiGyCsigvNPfk5GFPlFI8DB" +
                                        "PmHGOhJyK8U+Pn7eun3fj/Stc8D3dr4u0cRb54JLGKDy3yMx5urNj2yGGR9O/wDRd4x/Z/8AgT8QtY" +
                                        "PiHx78O/D3iPVDGsRutR0q1up/LT7qeZLGzbVycDPFfGXjD/gkx+xl4m05rPRvDuoeFrlm3fatO1O5" +
                                        "klH+yFvWuYsf9s8+hoA/l18Y/FPxl48uXvfE9xBdXEltHaGVbS3jlMETKY1MiRhyV2qNxbdtG0krkH" +
                                        "iIL+8tIpobWZoUuU8uUIdpdMhtrYwSpIBweMgHFf0U/ED/AIIk/DzVdVS6+GnxG1Dw5YEHzLfUbKPU" +
                                        "zuJ/5ZyRyWhVcY4YOc87uw+FPiP/AMEhv2tPBzJL4QttK8bwTSsipp98tvPGgGQ8q3wtkAPTCSOc9g" +
                                        "OaAPyzor1P4sfBX4qfA3xCnhb4s+Grrw3qUsfmxJcBWSWPOC0UsZaOQA8EoxweDzxXllABRU8IRpkW" +
                                        "XdsLDdt5bHfHv6VPc2jwT3MMTC5jtnZTLHkoQG2hgSOh7ZxQBRr9OP8Aglp43+GOm/tBWHw6+J+jw6" +
                                        "gvii5t5NFvLy5McGm6tYrJNbukLuIjcTuEihkx5yuVjj4lcH8x61dG1jVfDusWPiDQbyWw1LTJ4rq1" +
                                        "uIHKSwTwOHjkRwQVZWAKkcgjNAH9pH7P3hb4l6NpsOsfFfUYb/x7fQBfEdxZ2ixafePFdXkds0BVYs" +
                                        "TQwiOORiDujVMrkqw+gX8O6TPY6npl/E1/Z6w0v2qC7ke6idJlCPGEmLKsTKMGJQE5Py5JJ/Gz9kv/" +
                                        "AIKlfD/xFYDw78btW/4R/wAQa5epDb3V7Obi0S6kgXzZZfLtLaKysXnx5QM0zoWk81441WRv0I/Y9/" +
                                        "aP0L9pj4N6f4wsryK51zTCun62kKSRIuoRIpd40lCv5MoIeMkHqUJLIwAB9U18ofto/A3wr8ev2fvF" +
                                        "PhjxDbK93Y2st/p1yfle2u7dS6OjdgQCjA8FWII9PePE/ha51XV9H8R6HLbWGs6VIIftdxbNcP8A2b" +
                                        "cTQyX1rHtli2m4FvGN7bwjKr7GKivir/go1+11c/sr/B2CHwk6Dx142aey0dpI2dLaOFV+1XnTYWgE" +
                                        "sYjVjzJIjFXRHWgD+Q+iiigApRxyOMUlFAH9bX/BN39pvUP2kvgaj+NtVXUvGfg26a11dpFVJJY5iz" +
                                        "2NxhVCgMm6PIwS0bHHTP6RV/Hv/wAE7/j7dfBL4/6Zpl9qkeleF/Grx6Zq8rQGWQJljAYmjVpUYykL" +
                                        "lfl+bcwO1WX+vK3cSxKTnHNAGtUM80VvE0szbUXqTTo5EkG5G3Cvjr9q343w/DDwbd3OnakkN1gBRg" +
                                        "HHK5/nQB+f3/BS39qDR9Ftbz4fWc9td3jQRywi11By6yNJEcskeBwNx5PNfzsXN7d3pjN3O85hRYkL" +
                                        "sW2xr91Rk8AdhXXfELx7rnxI8UXfinX5N1xckYUYCooHCqBgYrhqACiiigAor6h1L4ZfDLUP2bNL+J" +
                                        "tnr9noPjbSZBFeaRJeLcSa3aXd3dRQXVtCrGW3uLdoWS4idBCYBDMriRzHJ8vUAFFFFABX2N8Cf26f" +
                                        "2gv2eNCHhfwDqVodHhtbu3t7S6tI3iglu5PNa7+QIZZ0b7jTGQBfk2lAFHxzX6BfDj9tzw/8CdQsz8" +
                                        "GPhH4dtobKwWza91eJ7/VLqVv+PieW43JsE+TmJAAq7U3FVGQD6En/AOCm+l/FnwDL4F/aE+H2h+KV" +
                                        "uIbppftdvIIFmhsikE8DxF5YriZ3kjDRrGYyyssyBndNX4afGGy8D/C3x/a+Ebae4+Et3cTtf2xZdZ" +
                                        "svDmoS26rp8pkktN+oQOYLcWUVxPGqtmzvo1yl3XZ+Fv8Agrf8dviBp66Lovwa03xFqunWd7e6n/Z1" +
                                        "reXkXlRFfInFsjO8EMJIEzvJICSpUx/dL/2ff2pbf41/BH4yfs9fDnwdoXhfxbquk/a9A06C0sYW1h" +
                                        "xGItRWaOCKwtJrlYU8xP3YO3LeW6xFaAPnj/gnd8bLLxJ8WfD/AOzj8c7Cx8a+BvEP2i00pdd2TjRL" +
                                        "toXdfsXnK4jS72+Q8KbQ7OhB4Kv6V+2X/wAEpfGnww/tX4l/s/iTxR4VM808uiojG/0u2I3r5bM7td" +
                                        "xJyvH70DblZPncc54a/YZtvBXxR+F3xL+E3xXg1rwnd+I7IR63FYPDJaSQ3HyyIJVltpAssflhnbYz" +
                                        "YyhUkV/Td4cmt7nw7ptxa6r/AMJBBLbQsmoboX+2KUGJ91uqQnzfvZjVU5+UBcCgD+CEgg4IwRSV/T" +
                                        "7+1n/wSj+FfxOg1Pxz8FEm8LeM7y7N1PbrKZtPvGuZy07GKZ/3LKGLIInWMBdoj5BH80Xirwzrngrx" +
                                        "Nq3g/wAT2psdX0K7nsby3YqzRXFu5jlQlSykqykZBI9DQB+pf/BMv9o348+EdU1/4Q/Dv+z9Y0wQXP" +
                                        "iM6dqSSmSY2Fu3nW1nNGUWGW7IhiEk7GKIgPsc7kf95/2af2uPhn+0xZX9j4fMmjeLtACrrGhXePtN" +
                                        "nJuKMUcALNEHUgSLgj5fMSNmC1/FzZ3t3p11FfafO9tcwMrxyxMUdHU5DKwOQQRkHqK+vv2DPj3dfs" +
                                        "+ftOeFfF086R6LrMo0XWTLIkSCwv5EV5XkdHKiCVY7g7cFhHs3KHY0Af2ZUU1WDAMpyDyPoadQAUUU" +
                                        "UAFFFFABRRRQAUUUUAFFFFABRRRQB//U/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK" +
                                        "KKKAPkT9t/9nGH9p39nvX/AABaRK3iOyxqehSM23bqVqreWhO5F2zo8kBL5VRJvxuVa/i+r+/yv5AP" +
                                        "+CmvwrHws/bG8aJZ6b/Z2k+LPI8QWWZRN5/29M3c3Luybr9LkbG24x8qiMpQB8P63pSaWNP2MzfbLS" +
                                        "K4JYY5kznHsMYr6G1LT9U1L4ZeIPGHhiB7e2vNJ09dfjZhsAt7y1giKjO795OFcg5wc44ryr4pukOt" +
                                        "adoS3jXn9haZaWTOcbA6oZHWMjqitIQD9e2M/tf4u+D178Uv+Calz4g8L3WJfDemR30yzfL5kGlgXN" +
                                        "zjBPzBEYrkckD1yAD8AqK9Y+N/wxb4NfFPxB8M3v5NTOhSxx/aZbV7J5RJEkoLW8hZo+Hxgk+oODXk" +
                                        "9ABX2D+x1+2J45/ZA8c3fiDw/arrPh/WljTV9JkdYReLAsnkMs+yRoniaViGCkEEhlI6fH1FAH9Lf7" +
                                        "Rf/BXv4baD8OPD+tfs0XNr4i8Wajcwvfadren3qJY2bwO8iSNG8CG4SXy0/dyyx/fwWG1q/An47fHf" +
                                        "4kftG/ES/wDiZ8T9S+26nd4jhhQFLWytVJMdtbR5PlxJk4GSzMWd2aRmY+NUUAFFFFABRRRQAo45HG" +
                                        "K/q4/4J9/tet+0j8J00DxIkVv408Mrb6ffTklzeBYZGS9Zf4DKsb+Y33fMyAArKo/lGr6C/Z3/AGgv" +
                                        "F37PvjNNd0S4ml0a9eH+1NNWQiG9jgLGPcudvmRbmMUhBMZYleSaAP7GviR4+0z4f6OdR1C/WEJjru" +
                                        "/oGr+UT9s79oMfFvx9qo0Q3FlBdz79Qg3YglliCiIqvByMEtkdcelb37WH7ZXiP4vX+m+HvCss2j6H" +
                                        "oImjW1BUo0jsNzH5ByMYGRwBx1zXwCSSck5JoASiivdPjd+zt8U/2e7zQbP4maWbL/hI7Fb+zljDvA" +
                                        "4ziSESlFQywkr5iqW2hkOSHUkA8Lor3Hxdq/wp+Ilpf+J9PsF8A+Ki8tzcWFsry6DebyTssYwrz2Lr" +
                                        "gYidp4XZmKvaxokTeHUAFFFFABRRRQAUUUUAfsr/AME0rDwpf/DHx94U8T+DpNZi8aXUUM95JfyaPY" +
                                        "DTdKWOa6W8v4rlpRDEJwTFFZEOXxPI0O5rb7F+Jvw3/Yn1fxp4a0b4EX1t8NPiJfyM/hrxFohlstA1" +
                                        "m7kZhc6VBqcCmF2YHyjNbAtbSvGiEyg2z/z7SfFvxfH8MbX4S6VdSaX4fS4nur2G2lkjXUZ5WQq92g" +
                                        "bZIYhGix5X5QMjnmvvz/gnH418V+CNW1T4kvZ2WpeGvAhiW6luLH+0dQtk1SURR2OkW8QS5e+1K42x" +
                                        "W+Jlt4f30kyNvXIB7d8O9f8AHnwp+KfgL4CeM9Ij8N6DFqiaZHp95HbrfadqGtXtrcrDpl1H/aLvHZ" +
                                        "Xpa8tpL+YJe24eF1kwQf39T4neCV+KH/Clvt+PFq6OuuizMbDdpxnNqZQ4XZxKu0rncMg4wa/LXxv8" +
                                        "LLDxvP4cuvC+l3WufB7x/qkdhDHGllqkXhJpo7YvDFLbz6hmx/tKCLNtEI7a3uLVkdms3Mcv6ARfst" +
                                        "/CmH4061+0H9nuH8c6xFBCl80ufsaQWotALaPGxN0a5bcGyxPbigDV/aJ/aE8H/s0fD2X4leOrHUb7" +
                                        "Sopo7dhp0CzSK8vClt7oqqTxuLYzgdSK/kl/bV+MHhv48/tNeNfil4R3HRtWlto7VnjaJpI7S1itg5" +
                                        "RskF/K3YPPPIFf1vfFD4reH/hl4k8CweOvElv4e0zxLdyaaIp9OubqK91CZU+zQrfx4htCG3ECdf3w" +
                                        "zsK+W5r8J/8Agrl8PPAGr+M9M+J/wwEE97bWki+I5YpQsOFlhhtDFvYJLJl2V0gBZQA7jblgAfihUi" +
                                        "kA5wG//VUdFAH9gn/BO79pkftJ/ApLzWbkSeKPDFy9jqEZ8tX8piXtZAiYOwxHyw5Ub3ik64Jr74r+" +
                                        "Nj9gr9oi4/Z1/aK8OeIdQ1Z9L8K6w/8AZmuARCeN7Sc/K7ozLt8qXY/mIQ6KrYDgtG/9kisrqHU5DD" +
                                        "I+hoAfRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9X9/KKKKACiiigAooooAKKKKACiiigAooooAKKK" +
                                        "KACiiigAooooAK/nv/4Ld/DeGPWvhl8XLO1kaa7gvdCvbjfmMLbutzZRhCeGJmuiWA5AAPRa/oQr84" +
                                        "v+Cj+haLq/g34YLfWqS6je+MrbSbSZ/wDll9vsbsuPoxiX15A96APwZ/4KH6XoejfFjwZp3h61jsrO" +
                                        "LwXooWKPovM2M++3H4Yr+ij9km6t/ih+yzpOq3UH2fTdchM0cPXZGW8wqcdcOSOlfgN/wVGi8S2/x6" +
                                        "8MW3iS0isjD4R06O1SKdrkG3S5u13l3AOXkEhx6EHrmv3B/wCCYej+PtG/ZW8Pp4/uGmfUNl9pqsct" +
                                        "HpUsSR2i8cY8uLKjsD3NAH4D/wDBRjwx4l8P/tErqHjYhfEev+H9FvNShXBWC5htRYlAR1DLbK592P" +
                                        "YCvg6v3w/4LZfCeSC4+G/xqsLZnhMU/hy/uC4+VoybqxTaTklgbslgMfKAxyVFfkV+0P8As7eOv2af" +
                                        "Gtp4H8ezWV1c3+n2+o28+nzGe3kgn3LwSqsCroyHKjJGRwQSAeCUUUUAFFFFABRRRQAUUUUAFFFFAB" +
                                        "RRRQAV9m+FP2om8V/BpP2bf2g577WPBOnFJdBvrSGCe/0CeFLna0UbmBrtJHmVDHLcqI4htjIGFr4y" +
                                        "ooA29d0yz0fUDZWOq2utReXE/wBosxOIt0iB2TFxFC+6Mko3ybdwO1mXDHEoooAKKKKACiiigAp6qz" +
                                        "MFUZJ6CmV6t8EfCPxL8cfFjwz4f+Dtqbvxn9qF3piK8cbCewU3e8NMyp+7WEvgnnGACSAQD6Q/ZT/Z" +
                                        "A+MXxdudX+Knh/w9Z6ppHwu1C3uNS0bVC8M2rSWZNzPpsERtrlGmdIxGyTIFzKgIYFgP1z/ai8NeN/" +
                                        "gl+zta6fbeBvDnw5+HvjPxBat46h0C7Ymw097m1RDAojtfNlniUx3K29uRtT5UKFmH6JfCjwRq2otf" +
                                        "fELxto1j4R+IeqW6abr6aM8csNzcWTPFHdPIVzOklv5b2yXKl4In2EBi4qj4o+A/hn4s/AjxP4B1PX" +
                                        "9R8R2vjxRqX2661GSYC4LpdWrWxjJjgt45I4ysduoj2gkAliSAfm3YfDT4jfsy6SPg9+zt47vfGGhe" +
                                        "NfDHjDXNEmmvDNDDpyW1jNZJZwxv5UlybmScrJaKhf7SJWVggC+9fHXx/wCLNY+Lf7Od1+z349j8M6" +
                                        "b8T7rUdb1G8uFa4s77ytMsIrJbizuJrV2WWORI1gDRNvkWTb5qg19oaRa+GtS03Qbzw/c2OqeLdIH9" +
                                        "lQaiWtJ9R+xWl3BHqCNKYxtJVFFzGijZIQoAYKRyv7Qvx7+FP7Gvwzs/HXijQ7gaLeastlHbaPbQ+Z" +
                                        "9qvRNcySbHeFPm8uRmO7JYj1yADg/jT8B/ih8V9GubDWvHia5oCWtun9kf2HbNs1i3kBF+C9zAs0AJ" +
                                        "/e2dwZIpYNy/MxUn8+f+CnP7ac2g+G7j9m7TfD8Nr4jvkki1vz5fNFtZzQRvB5PkMql5g+8b/uBACh" +
                                        "Dgj8oP2qf2otd+O37QOv8Axa8IXepeH9KluAdJtjcMkttFHBHbeYBG22OSZYw8gQnBJXcwG4/Jss0t" +
                                        "w5kndpGOMsxyTjigCGiiigAr+t//AIJjfGI+P/2dNN+HuuagLzxN8O0j0+5U4Df2fLufTJAFVQFNuB" +
                                        "GucsfKLMSTmv5IK/W/9i/xfL+yxJ8Mfj/Lr1xd+HvHc91oHinTvsTCKxtUmItLrz4jI0zR8Sf6vcqB" +
                                        "4geQKAP6jaKYrK6h15BGR+NPoAKKKKACiiigAooooAKKKKACiiigD//W/fyiiigAooooAKKKKACiii" +
                                        "gAooooAKKKKACiiigAooooAKKKKACvmH9p/Qzr2n/Dq1CB/I8ZaXP/AN+4rg5r6eryb4kTeHry80PS" +
                                        "NUv1t7i0u01FYs/M6QpIASPTJ6+1AH82H/BXxBD+0x4etI93lW3hOyjj39dgvb79OTX7Ef8ABKzxpZ" +
                                        "+Mf2PvDUQ1A3+qaDPd6ZfKwwYTBKxtos4GQto0IB9MDqK/Hj/gsKLkftZWguRgDw3Y+X+88z5PtF1j" +
                                        "j+Hv8v496+rv+CInja8bT/ix8O5b0NHA+marZWbSBf3kizwXUir1wRHbK7AHHy56igD7V/4KbeB9H+" +
                                        "JP7KvirQ5NreItChTxdpsEtwIyi6W0cV86qG+fZaXEo24K73Uj5tpH4Vf8FA9Q8YeJNd+C3jbxlci/" +
                                        "ufEXwy8OXn2lYDCrySiaSVWP3XkDuWYrj7yjAGM/1CfF7wpqOpeJ/hp450eyF3P4R19pbomVYtmm6h" +
                                        "Y3NhdMxY4ZIzNFMV6nyhj1r8Gv2tv2Z/FEPw38I/C7TRYaVoXwo+JGq+DrKeSad0TS/GDWusadd310" +
                                        "0beTFbLcLbzOVYCThS5+8Afi7RX63/8ABQL/AIJ3aB+zxY3vxT+Duux3nhaCaM6jol5cIb/So7uUR2" +
                                        "8kRZg9xbtI3lAEeanysTKpkeP8kKACiivsf4W/sN/HH41fCC4+MfwtTS/E1paSSRTaTaX6HWIijMuZ" +
                                        "LZgFXIXeqlw7oQUU5FAHxxRX7a/sm/8ABJ3xb4y0/wAA/GH4p6qmiWMl5b6je+HL/T0ne709JI5o4y" +
                                        "6XPyi6hJVxJGkkJJDIx4r9a/EH/BOf9i7xN4huPEt/8MLCC6uYjC0dlLc2NoFaIwkpa20sduj7TkOs" +
                                        "YYP84O/DUAfxv0V/Sr8ZP+CL3wk8V6t/avwa8V3fgOKVl8ywuYW1a0RQiriBpJo7hSSGdvMllyWwux" +
                                        "QAPyJ/aq/YI+OX7KtxLquv2i+JPBrFjFr2mpI1vGhm8mJb1CM2sr5jOGLRlpAkcsjBsAHxBRRRQAUV" +
                                        "+qf/AATJ/Yn8KftPeJvEHjf4r2s914I8KeXbCzUzQR6je3Uch2faYXjdRaqEkdUYMS8WTsJVv2n+OX" +
                                        "/BNb9lr4veHb630Lwdp/gjxE1mbaw1LSIGtIrWTduWWSytpIYLg5JB8xSxU4DDCkAH8gtFe+/tL/s/" +
                                        "eJ/2Zvi9q/wo8TTrqAs1juLHUI4nhhv7G4XdDcRq447pIAzKkqOgd9u4+BUAFFFFABRRRQAUUUUAFf" +
                                        "px+wT+xufjHpl9+0F4p8Yw+FfB3gvVVs7tFjma4u08lXu41khlhMO6KeNEYGTcXYMhVdkn5j1+6P8A" +
                                        "wR++Hmi/FDwV8aPCHivVp7jRL+PTrW50eKaWNdlylyHncAbMyKuxSrbhsbcANhIB+uJ+D+m237RHhT" +
                                        "xH4i+I3ijW9QXRLqay0ee/FvpjS6YLS1mvmtrJLaMzOLoeYGUxsZDhVCoo+ldDjvTcavLPfPc20t2R" +
                                        "bQvB5JtI44o4miDfekVpVeVXPZwq/Kq18Z6/+zz8KLrwH8NvHnxU8daz/aPgmXSJj4mOu3EIknW3Sw" +
                                        "dTLPM4tor6TYLgW5jeWQqzvnc1fbtnqOn3lxJbWkqvLHHFKcEHdHLnZICOqttYA+oI7UAaCxooAVQM" +
                                        "egr8Iv8AguLrF9B4b+EegRPizvbrWbmVfWS2S0SM/gJn/Ov3hr+fT/guNrVhNqXwh8PRyA3tpFrV1J" +
                                        "H3WK4a0SNvxaFwPpQB+B1FdTrXhuLSdJ0nWLbV7HVItVjZmS1d/OtJo8b4LiKZI3DqrKQ6B4X3EJIz" +
                                        "JIqctQAUUUUAFfsn+xPpOv8A7Uvwu8YeAr7xBLaav4e0200aKeaAXEa2FxbTWsKIkcsH+qt45FG4kn" +
                                        "AJcDivxsr9Vv8AgmJ8dviD4U8bT/BDwfop1qDxfewXM+PKAtoYo3jmlcupbHzRjAYY5xknBAP6O/2c" +
                                        "tfuPE3wJ8Catf6gNU1D+x7SC+uVUoJL63jEN1lcDBE6ODx1HHFe118/fCXXo7HxBrXg3UGhtpdSkk1" +
                                        "fSYkPMunbYYpWA/wCmczDd/vrX0DQAUUUUAFFFFABRRRQAUUUUAFFFFAH/1/38ooooAKKKKACiiigA" +
                                        "ooooAKKKKACiiigAooooAKKKKACiiigAr4Ph+IVrqn/BRe+8AQ3Imi0j4fQCSL/nleTX0k7fiYDCfo" +
                                        "RX3hX49fso+Jbn45ftu/GH4uQXsLaZ4dvrjSofsp3RXFvat9ktZg2SCHhQNkcEknpigD8ev+Cj+iTa" +
                                        "X+0/qmoPd/bItY0+xuIpPJMP7uCM2QGP4ubY/N36dqX9hnV/jD8I/Gc37Rng/SZLzwX4WJi8RTq6Mq" +
                                        "WRCtP/AKOG82SRYixiKqFVvmdhGslepf8ABXDT9P0n9qHTdL06LyktfDVijgdC5ubpifxyK+pf2QP2" +
                                        "kfhJoH7Bf/CrfiBcSeG7OfWrvQr/AFFrcPDPHqBkvJdp+YOwgbymBGV3KcYwSAfvHoOreH9V0PS7fT" +
                                        "9VhvbbVLMS2M0U8e68tAiHz4TDtBQq6ndHwNykYyK/MH9on4qeA/Hvivxn+xf8UtPm0LxRplpbax4O" +
                                        "1O8hXUNLvZNNRb21upppbS5niOFkgvnkSSHyIrjLruIPPfsOfDL4ozeIfiV8G/HFnL4c8H/D7xVb6n" +
                                        "p5icpqUd1NawG1t476ylghaFbBY/OT7IN4n5KklR9I/tTfDbwn8VbG1+KfgaymtPil4C1iGz0W5vdN" +
                                        "NqL28sZ0u008T6na+T5Vw6eXZ3i/uRcSbI5WWaaKYA/nU+LMfxz/AGo/iB8T/wBqLwl4b1b7B4Znsr" +
                                        "zWiZ4WutHdYViVQkS28rR25gYB0hLRQxh52yryH4rr9wj8bfiJ4V8GftO+LfA1vq/hOLVdM8N/2Dp8" +
                                        "Oky6RaaRNb3trol5aiSKOELd2Bk+xxlH/fC3ZpUIRUX6G+If7AfwW+IH7TGk698J9J/4SNdG8Uyp8R" +
                                        "9P1I3MOliPVYpNTM0VwhhH2iFZUSO1tPMQF4PtAiXzDKAfFv7Fv7D3xZu9c+Cv7SWgWmqXWltriy63" +
                                        "ZFToNzY2aSwm3ure4uS32+zuLabzpPIjXzI1kgR97B1/pT8H/DvwD8PYru28B+G9O8OxX7iW4TTrSK" +
                                        "0WaQcBnESqGIHc80nw+8AeE/hZ4L0j4e+BbH+zNB0OAW9nb73l8uMEnBeVmdiSSSWYkk5JrrZpkgQP" +
                                        "IGwWVflUucuwUcKCcZPJ6AcnABIAJgMcdBSZ5Ax1p1NUg9KAMDxVea9p/hjWL/wtZJqetW1ncS2NrK" +
                                        "/lR3F0kbNDEz/wh3wpbsDmodAtddvvB+mWfxBisbjWp7GBNVjtFdrF7polFysKzZcwmTdsD/Ntxu5z" +
                                        "Tr+98VR+ItLtNL0u2uNFlEx1C8mvGhntyF/cC2t1glE5d+JN8sIjXDL5hJUdLQB/Nt+1x/wSY1D4Z+" +
                                        "D/ABn8ZfhN4ij1HS9Im1DV30OWA2/2LRkzN5cNxJPIZntYw2d+DIoyMOAr/iZX9x37RnjnwP8ADv4K" +
                                        "+LPEfxJd4/Dj2b2V4yddl/8A6Koz23NKBkcjPANfw40Afuh/wRe+Pul+H/Eniv8AZ68Q3gt/+EkZNX" +
                                        "0ZXIVHvII/Lu4hnkySQrE6j+7C/fAr+idRJ/GwPXoCO/HfsOvr7dK/gLRmRtyMVI7g9K+79I/4KVft" +
                                        "jaH4Hj8C2HjuQwxHCXsttBNfrHjHl/aJEZse5+bsGxQB79/wWD8f6Brvx68O/DPS7cSal8P9GittSv" +
                                        "CpV5Z74LdJFgjBWOJkkDAn5pWXjbz+R9WLi5uLy4kurqVpppWLO7kszMeSSTkkmq9ABRRRQAUUUUAF" +
                                        "FaGmaZqOtalaaNo9rLfX9/NHb29vAhklmmlYIkaIuWZmYgKAMkkAVZ8QaFqnhfXdQ8N63CbbUdKuJb" +
                                        "W4iJ5SaFyjqfowIoAxq/VX/gkFe35/anl0SLxNc6HZ3Oj3VxJZwzCOLU5bdkWOGSNsrIY0lklXjcoV" +
                                        "iCMmvyqr3f8AZjTSX/aA8BDXWRdOGrW7XBkvxpiCJW3MWujjYAB0zl/uDBYGgD+nPwH8OP2Z/CXwr8" +
                                        "c2t+t14msdf8SeJrbUIte1G2bUo7iWSSz1Yw3d5JbSxolpE1xITN53kKZMvIct96aVp/h+zWK50a3g" +
                                        "T7TEm2WELmSJEVUO8csoUKAcnjHavnzwj4a8AWvxQ+JPjPQbO703WYxp2k30NvbWkqF4rVWtLmIQCY" +
                                        "+Z5VztJm2uI9plTyBCw+gfDk+lv4f0t9IUixeCJbcBRxGFwudg2jAHb5fTjFAHQV/Kj/wV/wDGUnib" +
                                        "9r2fQHsWtF8JaJp2mrKzFhdCYPfmVRgbQDdGPGTyhOecD+q6v56dM+Ifhz/gpF8RvjV8FPF1jpes3m" +
                                        "jxavqHw211A+m3kMdu/k21tIQgeaCX93NIsq7lJkJU/IIgD5h/4J3+BfBXxy8A/Hn9n7xNC9xq+taH" +
                                        "a61ouELi3utKaZDMmGXEnmXMC4yN6llJxkH8ytW0rUdC1S80TV7aSzvrCaS3nhlUpJHLE210dW5VlI" +
                                        "IIPINft3/wRI8FaTfePfir4zvULaho2nafpkXPyeTqM00k4I7nNpHj05r59/4KE/sla54B8ffFb482" +
                                        "dtd2XhK98V2Vtp6zxA/bJ9Xs5b++mjcFdtvBcDyozsIYuF3bo2yAflnRRRQAV93fsK/H7T/gR4u1u7" +
                                        "u4IHl1ZbYJM6FpYhAJvM8o9iUkOc+gr4Rr0X4TaT4X134i6FpXjWXydCuLjF4+8R4hCsW+YsoB49c+" +
                                        "mTwQD+tb4V/G3w78crXSviNpdgz6v4b1NrCNDLsQR3kkMN3IwA+6kX7yPPUDtkmvuGvzu0b9o34U+C" +
                                        "/Fvhb4feAXZ01qGzmtdGsF062sYLGRTGJVbKnKeQxwD04GMivtnwv4m0691HUvBj3qT614eW3NzGOH" +
                                        "NvcqWt59pZiUkCsu/gGSOQD7tAHcUUUUAFFFFABRRRQAUUUUAFFFFAH/0P38ooooAKKKKACiiigAoo" +
                                        "ooAKKKKACiiigAooooAKKKKACiiigAr8CP+CJv/IP+If8A1823/oo1++9fgR/wRN/5B/xD/wCvm2/9" +
                                        "FGgD40/4K6/8nl6t/wBgfS//AEUayP2SwG/Yw/a43DO2w8MEZ7H7Re1r/wDBXX/k8vVv+wPpf/oo1k" +
                                        "/slf8AJmP7XP8A2D/DH/pRe0AfuL/wTaJb4NagzHJN4OT/ALpr8NfGV3d6f45/bN8M2Ez22jrd37Cy" +
                                        "iYpbBrbxJEID5S4TMQJCHHy5OMV+5X/BNn/kjOof9fg/9BNfhb4+/wCSqftnf9fWrf8AqSQ0Afpx+3" +
                                        "Rx8L/2mMcf8Uf8Lj+J12/z+dfXfgPU9Rg/a38e6VDdyx2Vz4nlklgV2EUjp4S0LazIDtJGTgkZFfIn" +
                                        "7dP/ACS/9pj/ALE74W/+n2/r6u8Ef8njeN/+xkn/APUS0GgD7/ooooAKKKKACvhTUPFviuO+/a4WPW" +
                                        "r1R4ctYW0sC5kAsGPhiCcm1+b9yTKTJlNvzkt97mvuuvzz1P8A4/8A9tL/AK84P/UTt6APH/8AgsAT" +
                                        "/wAKP8EjsfFVn/6Lkr+YzxL/AMh69/3/AOgr+nP/AILAf8kP8Ef9jVZ/+i5K/mN8S/8AIevf9/8AoK" +
                                        "AMGiiigAooooAKKKKACiiigD379lP/AJOb+FH/AGNOjf8ApZHXhd4Sbyck5PmN/M17p+yn/wAnN/Cj" +
                                        "/sadG/8ASyOvC7v/AI+5/wDro38zQBVpR1pKUdaAP7FtLJHiL9l7HG/S73d7/wDEoTrX3EOFFfDmmf" +
                                        "8AIxfsuf8AYKvf/TQlfcg+6KAMvXf+QHqP/XvN/wCgGv5h/wDgjj/ydzrP/Ys6j/6V2lf08a7/AMgP" +
                                        "Uf8Ar3m/9ANfzD/8EcP+TudZ/wCxZ1H/ANK7SgD9bf2GFVdV/ah2gDHxS8Sjj0ASvKf+C0X/ACan4d" +
                                        "/7G+w/9IL+vWP2Gf8AkK/tQ/8AZUvEv8o68n/4LRf8mp+Hf+xvsP8A0gv6AP5eqKKKACtbQv8AkN6d" +
                                        "/wBfEX/oYrJrW0L/AJDenf8AXxF/6GKAP2W/ZE5/a40vP/P1r3/pBplfr2v/ACkCiHr8PLjP/gzt6/" +
                                        "IX9kT/AJO50z/r617/ANINMr9el/5SBQ/9k8uf/TnbUAfatFFFABRRRQAUUUUAFFFFABRRRQB//9k="
                            }, {
                                type: H,
                                key: "\u5bf9\u6bd4\u5ea6",
                                default: 0
                            }, {
                                type: H,
                                key: "\u66dd\u5149",
                                default: 0
                            }, {
                                type: D,
                                key: "\u5c0f\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 0,
                                choices: ["\u65e0", "\u767d", "\u9ed1\u767d"]
                            }, {
                                type: D,
                                key: "\u65f6\u949f\u6837\u5f0f",
                                default: 0,
                                choices: ["\u65e0", "\u767d", "\u9ed1\u767d"]
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ])
                    }), [r]);
                    var n = Object(t.useState)([]),
                        l = Object(be.a)(n, 2),
                        f = l[0],
                        c = l[1];
                    return Object(t.useMemo)((function () {
                        (function (e, A, o, t) {
                            var r = document.createElement("canvas"),
                                a = r.getContext("2d"),
                                K = document.createElement("img"),
                                n = [];
                            r.style.imageRendering = "pixelated",
                            A *= 3,
                            K.src = e[0];
                            var l = e[1] / 100,
                                f = e[2] / 100;
                            return new Promise((function (e) {
                                K.onload = function () {
                                    r.width = A,
                                    r.height = A,
                                    a.imageSmoothingEnabled = !1,
                                    a.drawImage(K, 0, 0, A, A);
                                    for (var t = 0; t < r.width; t++) 
                                        for (var c = 0; c < r.height; c++) {
                                            var F = a
                                                    .getImageData(t, c, 1, 1)
                                                    .data,
                                                U = (s = F[0], g = F[1], u = F[2], Math.pow(
                                                    (Math.pow(s, 2.2) + Math.pow(1.5 * g, 2.2) + Math.pow(.6 * u, 2.2)) / (1 + Math.pow(1.5, 2.2) + Math.pow(.6, 2.2)),
                                                    1 / 2.2
                                                ));
                                            Math.random() > (U / 255 + f - .5) * (l + 1) + .5 && (
                                                t % 3 !== 1 || c % 3 !== 1
                                            ) && n.push(i.a.createElement("use", {
                                                key: "g_" + t + "_" + c,
                                                x: t,
                                                y: c,
                                                xlinkHref: o
                                            }))
                                        }
                                    var s,
                                        g,
                                        u;
                                    e(n)
                                }
                            }))
                        })(o, A.getModuleCount(), "#S-black").then((function (e) {
                            return c(e)
                        }))
                    }), [c, o[0], o[1], o[2], A]),
                    i
                        .a
                        .createElement(
                            "svg",
                            {
                                className: "Qr-item-svg",
                                width: "100%",
                                height: "100%",
                                viewBox: HA(A),
                                fill: "white",
                                xmlns: "http://www.w3.org/2000/svg",
                                xmlnsXlink: "http://www.w3.org/1999/xlink"
                            },
                            i.a.createElement("defs", null, i.a.createElement("rect", {
                                id: "B-black",
                                fill: K,
                                width: 3.08,
                                height: 3.08
                            }), i.a.createElement("rect", {
                                id: "B-white",
                                fill: "white",
                                width: 3.08,
                                height: 3.08
                            }), i.a.createElement("rect", {
                                id: "S-black",
                                fill: K,
                                width: 1.02,
                                height: 1.02
                            }), i.a.createElement("rect", {
                                id: "S-white",
                                fill: "white",
                                width: 1.02,
                                height: 1.02
                            }), i.a.createElement("rect", {
                                id: "B",
                                width: 3.08,
                                height: 3.08
                            }), i.a.createElement("rect", {
                                id: "S",
                                width: 1.02,
                                height: 1.02
                            })),
                            f.concat(function (e) {
                                var A = e.qrcode,
                                    o = e.params,
                                    t = e.icon;
                                if (!A) 
                                    return [];
                                console.log(t);
                                for (
                                    var r = A.getModuleCount(),
                                    a = te(A),
                                    K = new Array(r),
                                    n = o[3],
                                    l = o[4],
                                    f = o[6],
                                    c = 0,
                                    F = 0;
                                    F < r;
                                    F++
                                ) 
                                    for (var U = 0; U < r; U++) {
                                        var s = 3 * F,
                                            g = 3 * U;
                                        a[F][U] === Y || a[F][U] === _
                                            ? A.isDark(F, U)
                                                ? 2 === n
                                                    ? K.push(i.a.createElement("use", {
                                                        key: c++,
                                                        xlinkHref: "#B-black",
                                                        x: s - .03,
                                                        y: g - .03
                                                    }))
                                                    : K.push(i.a.createElement("use", {
                                                        key: c++,
                                                        xlinkHref: "#S-black",
                                                        x: s + 1 - .01,
                                                        y: g + 1 - .01
                                                    }))
                                                : 0 === n
                                                    ? K.push(i.a.createElement("use", {
                                                        key: c++,
                                                        xlinkHref: "#S-white",
                                                        x: s + 1,
                                                        y: g + 1
                                                    }))
                                                    : K.push(i.a.createElement("use", {
                                                        key: c++,
                                                        xlinkHref: "#B-white",
                                                        x: s - .03,
                                                        y: g - .03
                                                    }))
                                            : a[F][U] === $
                                                ? A.isDark(F, U)
                                                    ? 2 === l
                                                        ? K.push(i.a.createElement("use", {
                                                            key: c++,
                                                            xlinkHref: "#B-black",
                                                            x: s - .03,
                                                            y: g - .03
                                                        }))
                                                        : K.push(i.a.createElement("use", {
                                                            key: c++,
                                                            xlinkHref: "#S-black",
                                                            x: s + 1,
                                                            y: g + 1
                                                        }))
                                                    : 0 === l
                                                        ? K.push(i.a.createElement("use", {
                                                            key: c++,
                                                            xlinkHref: "#S-white",
                                                            x: s + 1,
                                                            y: g + 1
                                                        }))
                                                        : K.push(i.a.createElement("use", {
                                                            key: c++,
                                                            xlinkHref: "#B-white",
                                                            x: s - .03,
                                                            y: g - .03
                                                        }))
                                                : a[F][U] === M
                                                    ? A.isDark(F, U) && K.push(i.a.createElement("use", {
                                                        key: c++,
                                                        fill: f,
                                                        xlinkHref: "#B",
                                                        x: s - .03,
                                                        y: g - .03
                                                    }))
                                                    : a[F][U] === Z
                                                        ? A.isDark(F, U)
                                                            ? K.push(i.a.createElement("use", {
                                                                key: c++,
                                                                fill: f,
                                                                xlinkHref: "#B",
                                                                x: s - .03,
                                                                y: g - .03
                                                            }))
                                                            : K.push(i.a.createElement("use", {
                                                                key: c++,
                                                                xlinkHref: "#B-white",
                                                                x: s - .03,
                                                                y: g - .03
                                                            }))
                                                        : A.isDark(F, U) && K.push(i.a.createElement("use", {
                                                            key: c++,
                                                            xlinkHref: "#S-black",
                                                            x: s + 1,
                                                            y: g + 1
                                                        }))
                                    }
                                return K
                            }({qrcode: A, params: o, icon: a})),
                            DA({qrcode: A, params: o, icon: a})
                        )
                },
                qA = NA;
            function jA(e) {
                var A = e.qrcode,
                    o = e.params,
                    t = e.icon;
                if (!A) 
                    return [];
                var r = A.getModuleCount(),
                    a = W(t.enabled, 0),
                    K = (t.src, t.scale),
                    n = Number(r * (
                        K > .33
                            ? .33
                            : K
                    ));
                function l(e, A) {
                    return Math.pow((r - 1) / 2 - e, 2) + Math.pow((r - 1) / 2 - A, 2) < Math.pow(
                        n / 2,
                        2
                    )
                }
                var f = te(A),
                    c = new Array(r),
                    F = o[0],
                    U = o[1] / 100,
                    s = o[2] / 100,
                    g = o[3],
                    u = 0,
                    R = o[4],
                    d = o[5],
                    C = [
                        3, -3
                    ],
                    p = [3, -3];
                U <= 0 && (U = 1);
                for (var v = 0; v < r; v++) 
                    for (var m = 0; m < r; m++) 
                        if (!1 !== A.isDark(v, m)) 
                            if (f[v][m] === Y || f[v][m] === _ || f[v][m] === $) 
                                0 === F
                                    ? c.push(i.a.createElement("rect", {
                                        opacity: s,
                                        width: U,
                                        height: U,
                                        key: u++,
                                        fill: R,
                                        x: v + (1 - U) / 2,
                                        y: m + (1 - U) / 2
                                    }))
                                    : 1 === F
                                        ? c.push(i.a.createElement("circle", {
                                            opacity: s,
                                            r: U / 2,
                                            key: u++,
                                            fill: R,
                                            cx: v + .5,
                                            cy: m + .5
                                        }))
                                        : 2 === F && c.push(i.a.createElement("circle", {
                                            key: u++,
                                            opacity: s,
                                            fill: R,
                                            cx: v + .5,
                                            cy: m + .5,
                                            r: U / 2
                                        }));
                            else if (f[v][m] === M) 
                                if (0 === g) 
                                    c.push(i.a.createElement("rect", {
                                        width: 1,
                                        height: 1,
                                        key: u++,
                                        fill: d,
                                        x: v,
                                        y: m
                                    }));
                                else if (1 === g) 
                                    c.push(i.a.createElement("circle", {
                                        key: u++,
                                        fill: d,
                                        cx: v + .5,
                                        cy: m + .5,
                                        r: 1.5
                                    })),
                                    c.push(i.a.createElement("circle", {
                                        key: u++,
                                        fill: "none",
                                        strokeWidth: "1",
                                        stroke: d,
                                        cx: v + .5,
                                        cy: m + .5,
                                        r: 3
                                    }));
                                else if (2 === g) {
                                    c.push(i.a.createElement("circle", {
                                        key: u++,
                                        fill: d,
                                        cx: v + .5,
                                        cy: m + .5,
                                        r: 1.5
                                    })),
                                    c.push(i.a.createElement("circle", {
                                        key: u++,
                                        fill: "none",
                                        strokeWidth: "0.15",
                                        strokeDasharray: "0.5,0.5",
                                        stroke: d,
                                        cx: v + .5,
                                        cy: m + .5,
                                        r: 3
                                    }));
                                    for (var h = 0; h < C.length; h++) 
                                        c.push(i.a.createElement("circle", {
                                            key: u++,
                                            fill: d,
                                            cx: v + C[h] + .5,
                                            cy: m + .5,
                                            r: .5
                                        }));
                                    for (var B = 0; B < p.length; B++) 
                                        c.push(i.a.createElement("circle", {
                                            key: u++,
                                            fill: d,
                                            cx: v + .5,
                                            cy: m + p[B] + .5,
                                            r: .5
                                        }))
                                }
                            else 
                    3 === g && (c.push(i.a.createElement("circle", {
                        key: u++,
                        fill: d,
                        cx: v + .5,
                        cy: m + .5,
                        r: 1.5
                    })), c.push(i.a.createElement("path", {
                        key: u++,
                        d: "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                "11e-16 32.048565,-1.29480038e-15 Z",
                        stroke: d,
                        strokeWidth: 100 / 6 *(1 - .75 * (1 - U)),
                        fill: "none",
                        transform: "translate(" + String(v - 2.5) + "," + String(m - 2.5) + ") scale(" +
                                String(.06) + "," + String(.06) + ")"
                    })));
                else 
                    f[v][m] === Z
                        ? 0 === g && c.push(i.a.createElement("rect", {
                            width: 1,
                            height: 1,
                            key: u++,
                            fill: d,
                            x: v,
                            y: m
                        }))
                        : 0 === F
                            ? c.push(i.a.createElement("rect", {
                                opacity: s,
                                width: U,
                                height: U,
                                key: u++,
                                fill: R,
                                x: v + (1 - U) / 2,
                                y: m + (1 - U) / 2
                            }))
                            : 1 === F
                                ? (!a || l(v, m), c.push(i.a.createElement("circle", {
                                    opacity: s,
                                    r: U / 2,
                                    key: u++,
                                    fill: R,
                                    cx: v + .5,
                                    cy: m + .5
                                })))
                                : 2 === F && c.push(i.a.createElement("circle", {
                                    opacity: s,
                                    key: u++,
                                    fill: R,
                                    cx: v + .5,
                                    cy: m + .5,
                                    r: .5 *L(.33, 1)
                                }));
                return c
            }
            NA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u6ee1\u6ee1\u79d1\u6280\u611f\u7684\u91cd\u91c7\u6837\u4e8c\u503c\u5316\u50cf" +
                            "\u7d20\u70b9\u9635\uff0c\u6709\u70b9\u4e1c\u897f"
                );
            var XA = gA({
                    listPoints: jA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u4fe1\u606f\u70b9\u6837\u5f0f",
                                default: 0,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u968f\u673a"]
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u7f29\u653e",
                                default: 100
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 0,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                }),
                VA = gA({
                    listPoints: jA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u4fe1\u606f\u70b9\u6837\u5f0f",
                                default: 1,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u968f\u673a"]
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u7f29\u653e",
                                default: 50
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u4e0d\u900f\u660e\u5ea6",
                                default: 30
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 1,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                }),
                LA = gA({
                    listPoints: jA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u4fe1\u606f\u70b9\u6837\u5f0f",
                                default: 2,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u968f\u673a"]
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u7f29\u653e",
                                default: 80
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 2,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                });
            function JA(e) {
                var A = e.qrcode,
                    o = e.params;
                e.icon;
                if (!A) 
                    return [];
                var t = A.getModuleCount(),
                    r = te(A),
                    a = new Array(t),
                    K = o[0],
                    n = o[1] / 100,
                    l = o[2] / 100,
                    f = o[3],
                    c = 0,
                    F = o[4],
                    U = o[5],
                    s = [
                        3, -3
                    ],
                    g = [3, -3];
                n <= 0 && (n = 1);
                for (var u = [], R = [], d = 0; d < t; d++) {
                    u[d] = [],
                    R[d] = [];
                    for (var C = 0; C < t; C++) 
                        u[d][C] = !0,
                        R[d][C] = !0
                }
                for (var p = 0; p < t; p++) 
                    for (var v = 0; v < t; v++) 
                        if (!1 !== A.isDark(p, v)) 
                            if (r[p][v] === M) 
                                if (0 === f) 
                                    a.push(i.a.createElement("rect", {
                                        width: 1,
                                        height: 1,
                                        key: c++,
                                        fill: U,
                                        x: p,
                                        y: v
                                    }));
                                else if (1 === f) 
                                    a.push(i.a.createElement("circle", {
                                        key: c++,
                                        fill: U,
                                        cx: p + .5,
                                        cy: v + .5,
                                        r: 1.5
                                    })),
                                    a.push(i.a.createElement("circle", {
                                        key: c++,
                                        fill: "none",
                                        strokeWidth: "1",
                                        stroke: U,
                                        cx: p + .5,
                                        cy: v + .5,
                                        r: 3
                                    }));
                                else if (2 === f) {
                                    a.push(i.a.createElement("circle", {
                                        key: c++,
                                        fill: U,
                                        cx: p + .5,
                                        cy: v + .5,
                                        r: 1.5
                                    })),
                                    a.push(i.a.createElement("circle", {
                                        key: c++,
                                        fill: "none",
                                        strokeWidth: "0.15",
                                        strokeDasharray: "0.5,0.5",
                                        stroke: U,
                                        cx: p + .5,
                                        cy: v + .5,
                                        r: 3
                                    }));
                                    for (var m = 0; m < s.length; m++) 
                                        a.push(i.a.createElement("circle", {
                                            key: c++,
                                            fill: U,
                                            cx: p + s[m] + .5,
                                            cy: v + .5,
                                            r: .5
                                        }));
                                    for (var h = 0; h < g.length; h++) 
                                        a.push(i.a.createElement("circle", {
                                            key: c++,
                                            fill: U,
                                            cx: p + .5,
                                            cy: v + g[h] + .5,
                                            r: .5
                                        }))
                                }
                            else 
                    3 === f && (a.push(i.a.createElement("circle", {
                        key: c++,
                        fill: U,
                        cx: p + .5,
                        cy: v + .5,
                        r: 1.5
                    })), a.push(i.a.createElement("path", {
                        key: c++,
                        d: "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                "11e-16 32.048565,-1.29480038e-15 Z",
                        stroke: U,
                        strokeWidth: 100 / 6 *(1 - .75 * (1 - n)),
                        fill: "none",
                        transform: "translate(" + String(p - 2.5) + "," + String(v - 2.5) + ") scale(" +
                                String(.06) + "," + String(.06) + ")"
                    })));
                else if (r[p][v] === Z) 
                    0 === f && a.push(i.a.createElement("rect", {
                        width: 1,
                        height: 1,
                        key: c++,
                        fill: U,
                        x: p,
                        y: v
                    }));
                else {
                    if (0 === K) {
                        if (0 === p || p > 0 && (!A.isDark(p - 1, v) || !R[p - 1][v])) {
                            for (var B = 0, b = !0; b && p + B < t;) 
                                A.isDark(p + B, v) && R[p + B][v]
                                    ? B++
                                    : b = !1;
                            if (B - 0 > 1) {
                                for (var y = 0; y < B; y++) 
                                    R[p + y][v] = !1,
                                    u[p + y][v] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + B - 0 - .5,
                                    y2: v + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        u[p][v] && a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: n / 2,
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                    if (1 === K) {
                        if (0 === v || v > 0 && (!A.isDark(p, v - 1) || !R[p][v - 1])) {
                            for (var k = 0, P = !0; P && v + k < t;) 
                                A.isDark(p, v + k) && R[p][v + k]
                                    ? k++
                                    : P = !1;
                            if (k - 0 > 1) {
                                for (var E = 0; E < k; E++) 
                                    R[p][v + E] = !1,
                                    u[p][v + E] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + .5,
                                    y2: v + k - 0 - 1 + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        u[p][v] && a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: n / 2,
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                    if (2 === K) {
                        if (0 === v || v > 0 && (!A.isDark(p, v - 1) || !R[p][v - 1])) {
                            for (var w = 0, Q = !0; Q && v + w < t;) 
                                A.isDark(p, v + w) && R[p][v + w] && w - 0 <= 3
                                    ? w++
                                    : Q = !1;
                            if (w - 0 > 1) {
                                for (var S = 0; S < w; S++) 
                                    R[p][v + S] = !1,
                                    u[p][v + S] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + .5,
                                    y2: v + w - 0 - 1 + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        if (0 === p || p > 0 && (!A.isDark(p - 1, v) || !R[p - 1][v])) {
                            for (var x = 0, H = !0; H && p + x < t;) 
                                A.isDark(p + x, v) && R[p + x][v] && x - 0 <= 3
                                    ? x++
                                    : H = !1;
                            if (x - 0 > 1) {
                                for (var D = 0; D < x; D++) 
                                    R[p + D][v] = !1,
                                    u[p + D][v] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + x - 0 - .5,
                                    y2: v + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        u[p][v] && a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: n / 2,
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                    if (3 === K) {
                        if (p > v ^ p + v < t) {
                            if (0 === v || v > 0 && (!A.isDark(p, v - 1) || !R[p][v - 1])) {
                                for (var N = 0, q = !0; q && v + N < t;) 
                                    A.isDark(p, v + N) && R[p][v + N] && N - 0 <= 3
                                        ? N++
                                        : q = !1;
                                if (N - 0 > 1) {
                                    for (var j = 0; j < N; j++) 
                                        R[p][v + j] = !1,
                                        u[p][v + j] = !1;
                                    a.push(i.a.createElement("line", {
                                        opacity: l,
                                        x1: p + .5,
                                        y1: v + .5,
                                        x2: p + .5,
                                        y2: v + N - 0 - 1 + .5,
                                        strokeWidth: n,
                                        stroke: F,
                                        strokeLinecap: "round",
                                        key: c++
                                    }))
                                }
                            }
                        } else if (0 === p || p > 0 && (!A.isDark(p - 1, v) || !R[p - 1][v])) {
                            for (var X = 0, V = !0; V && p + X < t;) 
                                A.isDark(p + X, v) && R[p + X][v] && X - 0 <= 3
                                    ? X++
                                    : V = !1;
                            if (X - 0 > 1) {
                                for (var J = 0; J < X; J++) 
                                    R[p + J][v] = !1,
                                    u[p + J][v] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + X - 0 - .5,
                                    y2: v + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        u[p][v] && a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: n / 2,
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                    if (4 === K) {
                        if (0 === v || 0 === p || v > 0 && p > 0 && (!A.isDark(p - 1, v - 1) || !R[p - 1][v - 1])) {
                            for (var T = 0, I = !0; I && v + T < t && p + T < t;) 
                                A.isDark(p + T, v + T) && R[p + T][v + T]
                                    ? T++
                                    : I = !1;
                            if (T - 0 > 1) {
                                for (var W = 0; W < T; W++) 
                                    R[p + W][v + W] = !1,
                                    u[p + W][v + W] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + T - 0 - 1 + .5,
                                    y2: v + T - 0 - 1 + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        u[p][v] && a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: n / 2,
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                    if (5 === K) {
                        if (0 === p || v === t - 1 || p > 0 && v < t - 1 && (!A.isDark(p - 1, v + 1) || !R[p - 1][v + 1])) {
                            for (var O = 0, G = !0; G && p + O < t && v - O >= 0;) 
                                A.isDark(p + O, v - O) && u[p + O][v - O]
                                    ? O++
                                    : G = !1;
                            if (O - 0 > 1) {
                                for (var z = 0; z < O; z++) 
                                    R[p + z][v - z] = !1,
                                    u[p + z][v - z] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + (O - 0 - 1) + .5,
                                    y2: v - (O - 0 - 1) + .5,
                                    strokeWidth: n,
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        u[p][v] && a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: n / 2,
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                    if (6 === K) {
                        if (0 === p || v === t - 1 || p > 0 && v < t - 1 && (!A.isDark(p - 1, v + 1) || !R[p - 1][v + 1])) {
                            for (var Y = 0, _ = !0; _ && p + Y < t && v - Y >= 0;) 
                                A.isDark(p + Y, v - Y) && R[p + Y][v - Y]
                                    ? Y++
                                    : _ = !1;
                            if (Y - 0 > 1) {
                                for (var $ = 0; $ < Y; $++) 
                                    R[p + $][v - $] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + (Y - 0 - 1) + .5,
                                    y2: v - (Y - 0 - 1) + .5,
                                    strokeWidth: n / 2 *L(.3, 1),
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        if (0 === v || 0 === p || v > 0 && p > 0 && (!A.isDark(p - 1, v - 1) || !u[p - 1][v - 1])) {
                            for (var ee = 0, Ae = !0; Ae && v + ee < t && p + ee < t;) 
                                A.isDark(p + ee, v + ee) && u[p + ee][v + ee]
                                    ? ee++
                                    : Ae = !1;
                            if (ee - 0 > 1) {
                                for (var oe = 0; oe < ee; oe++) 
                                    u[p + oe][v + oe] = !1;
                                a.push(i.a.createElement("line", {
                                    opacity: l,
                                    x1: p + .5,
                                    y1: v + .5,
                                    x2: p + ee - 0 - 1 + .5,
                                    y2: v + ee - 0 - 1 + .5,
                                    strokeWidth: n / 2 *L(.3, 1),
                                    stroke: F,
                                    strokeLinecap: "round",
                                    key: c++
                                }))
                            }
                        }
                        a.push(i.a.createElement("circle", {
                            opacity: l,
                            r: .5 *L(.33, .9),
                            key: c++,
                            fill: F,
                            cx: p + .5,
                            cy: v + .5
                        }))
                    }
                }
                return a
            }
            XA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u6700\u57fa\u672c\u7684\u4e8c\u7ef4\u7801\uff0c\u4e5f\u6709\u6709\u8da3\u7684" +
                            "\u73a9\u6cd5"
                ),
            VA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u5927\u5382\u559c\u6b22\u7684\u6837\u5f0f\uff0c\u975e\u5e38\u9002\u5408\u5728" +
                            "\u4e2d\u95f4\u653e\u7f6e Logo"
                ),
            LA.detail = i
                .a
                .createElement(
                    "div",
                    null,
                    "\u968f\u673a\u5706\u70b9\uff0c\u6df7\u4e71\u4e0e\u79e9\u5e8f\u3002\u6e90\u4e8e" +
                            " ",
                    i.a.createElement(c, {
                        href: "https://ncf.cz-studio.cn/",
                        rel: "noopener noreferrer",
                        target: "_blank"
                    }, "NCFZ")
                );
            var TA = gA({
                    listPoints: JA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u8fde\u7ebf\u65b9\u5411",
                                default: 2,
                                choices: [
                                    "\u5de6\u53f3",
                                    "\u4e0a\u4e0b",
                                    "\u7eb5\u6a2a",
                                    "\u56de\u73af",
                                    "\u5de6\u4e0a \u2014 \u53f3\u4e0b",
                                    "\u53f3\u4e0a \u2014 \u5de6\u4e0b",
                                    "\u4ea4\u53c9"
                                ]
                            }, {
                                type: H,
                                key: "\u8fde\u7ebf\u7c97\u7ec6",
                                default: 50
                            }, {
                                type: H,
                                key: "\u8fde\u7ebf\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 3,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u8fde\u7ebf\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                }),
                IA = gA({
                    listPoints: JA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u8fde\u7ebf\u65b9\u5411",
                                default: 6,
                                choices: [
                                    "\u5de6\u53f3",
                                    "\u4e0a\u4e0b",
                                    "\u7eb5\u6a2a",
                                    "\u56de\u73af",
                                    "\u5de6\u4e0a \u2014 \u53f3\u4e0b",
                                    "\u53f3\u4e0a \u2014 \u5de6\u4e0b",
                                    "\u4ea4\u53c9"
                                ]
                            }, {
                                type: H,
                                key: "\u8fde\u7ebf\u7c97\u7ec6",
                                default: 50
                            }, {
                                type: H,
                                key: "\u8fde\u7ebf\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 0,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u8fde\u7ebf\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                });
            function WA(e) {
                var A = e.qrcode,
                    o = e.params;
                e.icon;
                if (!A) 
                    return [];
                var t = A.getModuleCount(),
                    r = te(A),
                    a = new Array(t),
                    K = o[0],
                    n = o[1] / 100,
                    l = o[1],
                    f = o[3],
                    c = 0,
                    F = o[4],
                    U = o[5],
                    s = o[6],
                    g = [
                        3, -3
                    ],
                    u = [3, -3];
                n <= 0 && (n = 1),
                1 === l && 1 === K && a.push(i.a.createElement("circle", {
                    key: c++,
                    fill: "none",
                    strokeWidth: t / 15,
                    stroke: U,
                    cx: t / 2,
                    cy: t / 2,
                    r: t / 2 *Math.sqrt(2) * 13 / 40
                }));
                for (var R = 0; R < t; R++) 
                    for (var d = 0; d < t; d++) 
                        if (A.isDark(R, d) && r[R][d] === M) 
                            if (0 === f) 
                                a.push(i.a.createElement("rect", {
                                    width: 1,
                                    height: 1,
                                    key: c++,
                                    fill: s,
                                    x: R,
                                    y: d
                                }));
                            else if (1 === f) 
                                a.push(i.a.createElement("circle", {
                                    key: c++,
                                    fill: s,
                                    cx: R + .5,
                                    cy: d + .5,
                                    r: 1.5
                                })),
                                a.push(i.a.createElement("circle", {
                                    key: c++,
                                    fill: "none",
                                    strokeWidth: "1",
                                    stroke: s,
                                    cx: R + .5,
                                    cy: d + .5,
                                    r: 3
                                }));
                            else if (2 === f) {
                                a.push(i.a.createElement("circle", {
                                    key: c++,
                                    fill: s,
                                    cx: R + .5,
                                    cy: d + .5,
                                    r: 1.5
                                })),
                                a.push(i.a.createElement("circle", {
                                    key: c++,
                                    fill: "none",
                                    strokeWidth: "0.15",
                                    strokeDasharray: "0.5,0.5",
                                    stroke: s,
                                    cx: R + .5,
                                    cy: d + .5,
                                    r: 3
                                }));
                                for (var C = 0; C < g.length; C++) 
                                    a.push(i.a.createElement("circle", {
                                        key: c++,
                                        fill: s,
                                        cx: R + g[C] + .5,
                                        cy: d + .5,
                                        r: .5
                                    }));
                                for (var p = 0; p < u.length; p++) 
                                    a.push(i.a.createElement("circle", {
                                        key: c++,
                                        fill: s,
                                        cx: R + .5,
                                        cy: d + u[p] + .5,
                                        r: .5
                                    }))
                            }
                        else 
                    3 === f && (a.push(i.a.createElement("circle", {
                        key: c++,
                        fill: s,
                        cx: R + .5,
                        cy: d + .5,
                        r: 1.5
                    })), a.push(i.a.createElement("path", {
                        key: c++,
                        d: "M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-" +
                                "16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.482002" +
                                "5,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,3" +
                                "2.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.21" +
                                "05713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1" +
                                "364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 " +
                                "16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746," +
                                "91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.09541" +
                                "92 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.904" +
                                "5808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535" +
                                "463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.523163" +
                                "11e-16 32.048565,-1.29480038e-15 Z",
                        stroke: s,
                        strokeWidth: 14.16666666666667,
                        fill: "none",
                        transform: "translate(" + String(R - 2.5) + "," + String(d - 2.5) + ") scale(" +
                                String(.06) + "," + String(.06) + ")"
                    })));
                else if (A.isDark(R, d) && r[R][d] === Z) 
                    0 === f && a.push(i.a.createElement("rect", {
                        width: 1,
                        height: 1,
                        key: c++,
                        fill: s,
                        x: R,
                        y: d
                    }));
                else {
                    var v = Math.sqrt(Math.pow((t - 1) / 2 - R, 2) + Math.pow((t - 1) / 2 - d, 2)) / (
                        t / 2 * Math.sqrt(2)
                    );
                    if (0 === l) {
                        var m = (1 - Math.cos(Math.PI * v)) / 6 + .2,
                            h = F,
                            B = Number(A.isDark(R, d));
                        0 === K
                            ? (m += .2, a.push(i.a.createElement("rect", {
                                opacity: B,
                                width: m,
                                height: m,
                                key: c++,
                                fill: h,
                                x: R + (1 - m) / 2,
                                y: d + (1 - m) / 2
                            })))
                            : 1 === K && a.push(i.a.createElement("circle", {
                                opacity: B,
                                r: m,
                                key: c++,
                                fill: h,
                                cx: R + .5,
                                cy: d + .5
                            }))
                    }
                    if (1 === l) {
                        var b = 0,
                            y = F,
                            k = Number(A.isDark(R, d));
                        v > .25 && v < .4
                            ? (b = .5, y = U, k = 1)
                            : (b = 1 / 4, 0 === K && (b = .15)),
                        0 === K
                            ? (
                                b = 2 * b + .1,
                                A.isDark(R, d)
                                    ? a.push(i.a.createElement("rect", {
                                        opacity: k,
                                        width: b,
                                        height: b,
                                        key: c++,
                                        fill: y,
                                        x: R + (1 - b) / 2,
                                        y: d + (1 - b) / 2
                                    }))
                                    : (b -= .1, a.push(i.a.createElement("rect", {
                                        opacity: k,
                                        width: b,
                                        height: b,
                                        key: c++,
                                        stroke: y,
                                        strokeWidth: .1,
                                        fill: "#FFFFFF",
                                        x: R + (1 - b) / 2,
                                        y: d + (1 - b) / 2
                                    })))
                            )
                            : 1 === K && (
                                A.isDark(R, d)
                                    ? a.push(i.a.createElement("circle", {
                                        opacity: k,
                                        r: b,
                                        key: c++,
                                        fill: y,
                                        cx: R + .5,
                                        cy: d + .5
                                    }))
                                    : a.push(i.a.createElement("circle", {
                                        opacity: k,
                                        r: b,
                                        key: c++,
                                        stroke: y,
                                        strokeWidth: .1,
                                        fill: "#FFFFFF",
                                        cx: R + .5,
                                        cy: d + .5
                                    }))
                            )
                    }
                }
                return a
            }
            TA.detail = i
                .a
                .createElement("div", null, "Mirada continua, dirección seleccionable"),
            IA.detail = i
                .a
                .createElement("div", null, "Escalonado");
            var OA = gA({
                    listPoints: WA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u4fe1\u606f\u70b9\u6837\u5f0f",
                                default: 1,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62"]
                            }, {
                                type: D,
                                key: "\u5e72\u6270\u51fd\u6570",
                                default: 0,
                                choices: ["A", "B"]
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 1,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272 1",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272 2",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                }),
                GA = gA({
                    listPoints: WA,
                    getParamInfo: function () {
                        return [
                            {
                                type: D,
                                key: "\u4fe1\u606f\u70b9\u6837\u5f0f",
                                default: 1,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62"]
                            }, {
                                type: D,
                                key: "\u5e72\u6270\u51fd\u6570",
                                default: 1,
                                choices: ["A", "B"]
                            }, {
                                type: H,
                                key: "\u4fe1\u606f\u70b9\u4e0d\u900f\u660e\u5ea6",
                                default: 100
                            }, {
                                type: D,
                                key: "\u5b9a\u4f4d\u70b9\u6837\u5f0f",
                                default: 1,
                                choices: ["\u77e9\u5f62", "\u5706\u5f62", "\u884c\u661f", "\u5706\u89d2\u77e9\u5f62"]
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272 1",
                                default: "#ABB8C3"
                            }, {
                                type: N,
                                key: "\u4fe1\u606f\u70b9\u989c\u8272 2",
                                default: "#000000"
                            }, {
                                type: N,
                                key: "\u5b9a\u4f4d\u70b9\u989c\u8272",
                                default: "#000000"
                            }
                        ]
                    }
                });
            OA.detail = i
                .a
                .createElement("div", null, "\u70b9\u5e72\u6270"),
            GA.detail = i
                .a
                .createElement("div", null, "\u7ebf\u5e72\u6270");
            var zA = gA({
                    listPoints: function (e) {
                        var A = e.qrcode,
                            o = e.params;
                        if (e.icon, !A) 
                            return [];
                        var t = A.getModuleCount(),
                            r = new Array(t),
                            a = o[1],
                            K = o[2] / 100,
                            n = 0;
                        r.push(i.a.createElement("image", {
                            key: n++,
                            x: "-0.01",
                            y: "-0.01",
                            width: t + .02,
                            height: t + .02,
                            xlinkHref: o[0]
                        })),
                        r.push(i.a.createElement("rect", {
                            key: n++,
                            x: "-0.01",
                            y: "-0.01",
                            width: t + .02,
                            height: t + .02,
                            fill: a,
                            opacity: K
                        }));
                        for (var l = 0; l < t; l++) 
                            for (var f = 0; f < t; f++) 
                                A.isDark(l, f) || r.push(i.a.createElement("rect", {
                                    width: 1.02,
                                    height: 1.02,
                                    key: n++,
                                    fill: "#FFF",
                                    x: l - .01,
                                    y: f - .01
                                }));
                    return r
                    },
                    getParamInfo: function () {
                        return [
                            {
                                type: j,
                                key: "\u80cc\u666f\u56fe\u7247",
                                default: QA
                            }, {
                                type: N,
                                key: "\u8986\u76d6\u989c\u8272",
                                default: "#000000"
                            }, {
                                type: H,
                                key: "\u8986\u76d6\u4e0d\u900f\u660e\u5ea6",
                                default: 10
                            }
                        ]
                    }
                }),
                MA = zA;
            zA.detail = i
                .a
                .createElement("div", null, "Relleno de imagen");
            var ZA = [
                    {
                        value: "A1",
                        renderer: XA
                    }, {
                        value: "C2",
                        renderer: qA
                    }, {
                        value: "SP \u2014 1",
                        renderer: CA
                    }, {
                        value: "A \u2014 a1",
                        renderer: TA
                    }, {
                        value: "SP \u2014 3",
                        renderer: vA
                    }, {
                        value: "A2",
                        renderer: VA
                    }, {
                        value: "A3",
                        renderer: LA
                    }, {
                        value: "A \u2014 b2",
                        renderer: GA
                    }, {
                        value: "C1",
                        renderer: xA
                    }, {
                        value: "C3",
                        renderer: MA
                    }, {
                        value: "B1",
                        renderer: EA
                    }, {
                        value: "A \u2014 a2",
                        renderer: IA
                    }, {
                        value: "A \u2014 b1",
                        renderer: OA
                    }, {
                        value: "SP \u2014 2",
                        renderer: hA
                    }
                ],
                YA = new Array(16).fill(new Array(16)),
                _A = new Array(16).fill(new Array(16)),
                $A = function (e, A) {
                    YA[e] = A,
                    _A[e] = A.map((function (e) {
                        return e.default
                    }))
                },
                eo = function (e) {
                    return {
                        styles: ZA.map((function (A, o) {
                            return {
                                value: A.value,
                                selected: e.selectedIndex === o,
                                details: A.renderer.detail,
                                renderer: t.createElement(RA, {
                                    rendererType: A.renderer,
                                    index: o,
                                    setParamInfo: $A
                                })
                            }
                        }))
                    }
                },
                Ao = function (e) {
                    return {
                        onSelected: function (A) {
                            e(B(A, ZA[A].renderer, ZA[A].value))
                        }
                    }
                },
                oo = function (e) {
                    var A = e.setParamInfo,
                        o = Object(s.b)(eo, Ao)(FA);
                    return A(YA, _A),
                    o
                },
                to = function (e) {
                    var A = e.setParamInfo,
                        o = Object(t.useState)(!1),
                        r = Object(be.a)(o, 2),
                        a = r[0],
                        K = r[1];
                    Object(t.useEffect)((function () {
                        K(!0)
                    }), []);
                    var n = i
                        .a
                        .createElement(oo({setParamInfo: A}));
                    return i
                        .a
                        .createElement("div", {
                            className: "Qr-titled",
                            id: "Qr-style"
                        }, i.a.createElement("div", {
                            className: "Qr-Centered title-margin"
                        }, i.a.createElement("div", {
                            className: "Qr-s-title"
                        }, "Estilos"), i.a.createElement(
                            "div",
                            {
                                className: "Qr-s-subtitle Qr-rel"
                            },
                            "Elige tu estilo",
                            ge()
                                ? i.a.createElement("div", {
                                    className: "Qr-style-hint"
                                }, "Arrastra y Desliza")
                                : null
                        )), i.a.createElement(ne.a, {
                            className: "Qr-s",
                            onStartScroll: function (e) {
                                return f("style")
                            },
                            hideScrollbars: !1,
                            horizontal: !0,
                            vertical: !1,
                            style: {
                                visibility: a
                                    ? "visible"
                                    : "hidden"
                            }
                        }, n))
                },
                io = Object(s.b)(null, (function (e) {
                    return {
                        setParamInfo: function (A, o) {
                            return e(function (e, A) {
                                return {type: d, paramInfo: e, paramValue: A}
                            }(A, o))
                        }
                    }
                }))(to);
            K
                .a
                .initialize("UA-165845289-1"),
            K
                .a
                .addTrackers([
                    {
                        trackingId: "UA-165845289-1",
                        gaOptions: {
                            name: "trackerUA"
                        }
                    }, {
                        trackingId: "G-3NKS6ZG27V",
                        gaOptions: {
                            name: "trackerG"
                        }
                    }
                ], {
                    alwaysSendToDefaultTracker: !1
                });
            var ro = Object(s.b)()((function (e) {
                var A = e.dispatch,
                    o = Object(t.useCallback)((function (e) {
                        return A(y(e))
                    }), []);
                return G(),
                Object(t.useEffect)((function () {
                    (function () {
                        return aA.apply(this, arguments)
                    })().then((function () {
                        KA((function (e) {
                            var o = [];
                            e
                                .data
                                .forEach((function (e) {
                                    o[e.value] = e.count
                                })),
                            A(y(o))
                        }))
                    }))
                })),
                i
                    .a
                    .createElement("div", {
                        className: "App"
                    }, i.a.createElement("header", {
                        className: "App-header"
                    }, i.a.createElement("div", {
                        className: "Layout"
                    }, i.a.createElement(
                        "div",
                        {
                            className: "Qr-outer"
                        },
                        i.a.createElement(ae, null),
                        i.a.createElement(io, null),
                        i.a.createElement(Oe, null),
                        i.a.createElement(lA, {updateDownloadData: o}),
                        i.a.createElement(Ce, null),
                        i.a.createElement(U, null)
                    ))))
            }));
            Boolean(
                "localhost" === window.location.hostname || "[::1]" === window.location.hostname || window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
            );
            var ao = {
                selectedIndex: 0,
                value: "A1",
                rendererType: XA,
                correctLevel: 0,
                textUrl: wA,
                history: [],
                downloadData: [],
                qrcode: oe({text: wA, correctLevel: 0}),
                icon: {
                    enabled: 0,
                    src: "",
                    scale: 22
                },
                title: {
                    enabled: 0,
                    text: "",
                    color: "black",
                    size: 20,
                    align: "middle"
                },
                paramInfo: new Array(16).fill(new Array(16)),
                paramValue: new Array(16).fill(new Array(16))
            };
            var Ko = o(62),
                no = Object(Ko.b)((function () {
                    var e = arguments.length > 0 && void 0 !== arguments[0]
                            ? arguments[0]
                            : ao,
                        A = arguments.length > 1
                            ? arguments[1]
                            : void 0;
                    switch (A.type) {
                        case g:
                            var o = A.text;
                            return o && 0 !== o.length || (o = wA),
                            Object.assign({}, e, {
                                textUrl: o,
                                qrcode: oe({text: o, correctLevel: e.correctLevel})
                            });
                        case u:
                            return Object.assign({}, e, {
                                value: A.value,
                                rendererType: A.rendererType,
                                selectedIndex: A.rendererIndex,
                                history: e
                                    .history
                                    .slice()
                                    .concat(A.value)
                            });
                        case R:
                            return Object.assign({}, e, {
                                correctLevel: parseInt(A.correctLevel),
                                qrcode: oe({
                                    text: e.textUrl,
                                    correctLevel: parseInt(A.correctLevel)
                                })
                            });
                        case d:
                            return Object.assign({}, e, {
                                paramInfo: A.paramInfo,
                                paramValue: A.paramValue
                            });
                        case C:
                            return Object.assign({}, e, {
                                paramValue: e
                                    .paramValue
                                    .map((function (o, t) {
                                        if (t !== A.rendererIndex) 
                                            return o;
                                        var i = o.slice();
                                        return i[A.paramIndex] = W(
                                            A.value,
                                            e.paramInfo[A.rendererIndex][A.paramIndex].default
                                        ),
                                        i
                                    }))
                            });
                        case p:
                            return Object.assign({}, e, {downloadData: A.data});
                        case v:
                            return Object.assign({}, e, {title: Object.assign({}, e.title, A.title)});
                        case m:
                            return Object.assign({}, e, {icon: Object.assign({}, e.icon, A.icon)});
                        default:
                            return e
                    }
                }));
            a
                .a
                .render(i.a.createElement(i.a.StrictMode, null, i.a.createElement(s.a, {
                    store: no
                }, i.a.createElement(ro, null))), document.getElementById("root")),
            "serviceWorker" in navigator && navigator
                .serviceWorker
                .ready
                .then((function (e) {
                    e.unregister()
                }))
                .catch((function (e) {
                    console.error(e.message)
                }))
            },
        36: function (e, A, o) {}
    },
    [
        [132, 1, 2]
    ]
]);