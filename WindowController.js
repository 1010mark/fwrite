const { BrowserWindow, screen, Notification } = require('electron');
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));//timeはミリ秒

class WindowController {
    constructor(startTime) {
        // ウィンドウをidをキーにして管理するオブジェクト
        this.windows = {};
        this.startTime = startTime;
    }

    /**
     * _createWindow(id, name, width, height, positionX, positionY)
     * 指定のパラメータでフレームレスのウィンドウを作成し、
     * 初期は非表示状態とする。positionX, positionYが省略された場合は画面中央に配置する。
     * 作成したウィンドウは内部のthis.windowsにidとともに保持する。
     */
    _createWindow(id, name, width, height, positionX, positionY, frame = true, other = {}) {
        width = Math.round(width);
        height = Math.round(height);
        // positionX, positionYが指定されなかった場合、画面中央に配置する
        if (positionX === undefined || positionY === undefined) {
            other.center = true;
           // const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
           // positionX = Math.round((screenWidth - width) / 2);
           // positionY = Math.round((screenHeight - height) / 2);
        }

        // フレームレスかつ初期非表示のウィンドウ作成
        let settings = {
            width: width,
            height: height,
            frame: frame,
            icon: __dirname + '/img/icon.png',
            show: false, // 初期は非表示
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
           // useContentSize: true,
            ...other
        }
        if (!settings.center) {
            settings.x = positionX;
            settings.y = positionY;
        }
        const win = new BrowserWindow(settings);

        // 指定のHTMLファイルをロードする（例: ./view/example.html）
        win.loadFile(`./view/${name}.html`);

        // 作成したウィンドウを内部変数に保持
        if (id in this.windows) console.error(`this id ${id} already exists`);
        else this.windows[id] = win;
    }

    /**
     * _deleteWindow(id)
     * 指定されたidのウィンドウを削除する。
     */
    _deleteWindow(id) {
        const win = this.windows[id];
        if (win) {
            win.close(); // ウィンドウを閉じる
            delete this.windows[id]; // 内部管理から削除
        }
    }

    /**
     * deleteSetTime(id, time)
     * 指定されたidのウィンドウを、time (ミリ秒) 後に削除する。
     */
    deleteSetTime(id, time) {
        setTimeout(async () => {
            this._deleteWindow(id);
        }, this.startTime + time);
    }

    /**
     * deletePositiveWindows(time)
     * 正の数のidのウィンドウを、time (ミリ秒) 後に削除する。
     * delay (ms) 毎に1つずつ削除する。
     */
    deletePositiveWindows(time, delay = 0) {
        setTimeout(async () => {
            for (const id in this.windows) {
                if (id > 0) {
                    this._deleteWindow(id);
                    await sleep(delay);
                }
            }
        }, this.startTime + time);
    }

    /**
     * createSetTime(id, time, name, width, height, positionX, positionY)
     * 即座に_createWindowでウィンドウを作成し、
     * time (ミリ秒) 後にウィンドウを表示(show)する。
     * 表示後、webContents.send('start')でメッセージを送信する。
     */
    createSetTime(id, time, name, width, height, positionX, positionY, frame = false, other = {}, message = {}) {
        this._createWindow(id, name, width, height, positionX, positionY, frame, other);
        setTimeout(() => {
            const win = this.windows[id];
            if (win) {
                win.show();
                win.webContents.send('start', message);
            } else {
                console.error(`this id ${id} does not exist`);
            }
        }, this.startTime + time);
    }

    /**
     * _easeInOutQuad(t)
     * Ease-in-out（二次）補間のためのヘルパー関数。
     */
    _easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * moveWindow(id, time1, time, posX, posY, easing)
     * 指定されたウィンドウを、time1 (ms) 後に
     * 現在位置から目標位置(posX, posY)へ
     * time (ms) かけて線形補間またはease-in-out補間により移動させる。
     */
    moveWindow(id, time1, time, posX, posY, easing = 'linear') {
        const win = this.windows[id];
        time1 += this.startTime;
        if (!win) {
            console.error(`Window with id ${id} does not exist.`);
            return;
        }
        // time1 (ms) 後にアニメーションを開始
        setTimeout(() => {
            try {
                const [startX, startY] = win.getPosition();
                const deltaX = posX - startX;
                const deltaY = posY - startY;
                const startTime = Date.now();
                const interval = 20; // 更新間隔 (ms)

                const timer = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    let progress = elapsed / time;
                    if (progress >= 1) {
                        progress = 1;
                    }
                    // easing指定に応じた補間
                    if (easing === 'ease-in-out') {
                        progress = this._easeInOutQuad(progress);
                    }
                    const currentX = Math.round(startX + deltaX * progress) + 0;
                    const currentY = Math.round(startY + deltaY * progress) + 0; // ときどき-0になるので+0
                    if (progress === 1 || !win || win.isDestroyed()) {
                        clearInterval(timer);
                    } else {
                        win.setPosition(currentX, currentY);
                    }
                }, interval);
            } catch (error) {
                console.log(error);
            }
        }, time1);
    }

    /**
     * getPosition(id)
     * 指定されたウィンドウの位置を取得し、{ x: posX, y: posY } の形式で返す。
     */
    getPosition(id) {
        const win = this.windows[id];
        if (!win) {
            console.error(`Window with id ${id} does not exist.`);
            return null;
        }
        const [x, y] = win.getPosition();
        return { x, y };
    }

    /**
     * _calculateBezierPoint(points, t)
     * De Casteljau のアルゴリズムを用いて、制御点配列 points とパラメータ t (0〜1) から
     * ベジエ曲線上の点を計算して返す。
     */
    _calculateBezierPoint(points, t) {
        // 制御点のディープコピー
        let tempPoints = points.map(p => ({ x: p.x, y: p.y }));
        while (tempPoints.length > 1) {
            const newPoints = [];
            for (let i = 0; i < tempPoints.length - 1; i++) {
                const x = (1 - t) * tempPoints[i].x + t * tempPoints[i + 1].x;
                const y = (1 - t) * tempPoints[i].y + t * tempPoints[i + 1].y;
                newPoints.push({ x, y });
            }
            tempPoints = newPoints;
        }
        return tempPoints[0];
    }

    /**
     * moveWindowBezier(id, time1, time, controlPoints, easing)
     * 指定されたウィンドウを、time1 (ms) 後に
     * controlPoints 配列で定義されるベジエ曲線に沿って
     * time (ms) かけて移動させる。
     */
    moveWindowBezier(id, time1, time, controlPoints, easing = 'linear') {
        const win = this.windows[id];
        time1 += this.startTime;
        if (!win) {
            console.error(`Window with id ${id} does not exist.`);
            return;
        }
        // time1 (ms) 後にアニメーションを開始
        setTimeout(() => {
            const startTime = Date.now();
            const interval = 10; // 更新間隔 (ms)

            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                let progress = elapsed / time;
                if (progress >= 1) {
                    progress = 1;
                }
                // easing指定に応じた補間
                if (easing === 'ease-in-out') {
                    progress = this._easeInOutQuad(progress);
                }
                const point = this._calculateBezierPoint(controlPoints, progress);
                win.setPosition(Math.round(point.x), Math.round(point.y));
                if (progress === 1) {
                    clearInterval(timer);
                }
            }, interval);
        }, time1);
    }

    /**
     * _createNotify(id, title, body, settings)
     * デスクトップ通知を行う。
     * settings には通知の詳細設定を記述する。
     */
    _createNotify(id, title, body, settings = {}) {
        const notification = new Notification({ title, body, ...settings, silent: true });
        console.log("notify");
        if (id in this.windows) console.error(`this id ${id} already exists`);
        else this.windows[id] = notification;
    }

    /**
     * notifySetTime(time, title, body, settings)
     * time (ms) 後にデスクトップ通知を行う。
     * settings には通知の詳細設定を記述する。
     * ※集中モードは切ること
     */
    notifySetTime(id, time, title, body, settings = {}) {
        setTimeout(() => {
            console.log('set notify');
            this._createNotify(id, title, body, settings);
            const notification = this.windows[id];
            if (notification) {
                notification.show();
            } else {
                console.error(`this id ${id} does not exist`);
            }
        }, this.startTime + time);
    }

    /**
     * deleteNotifySetTime(id, time)
     * time (ms) 後にデスクトップ通知を閉じる。
     */
    deleteNotifySetTime(id, time) {
        setTimeout(() => {
            this._deleteWindow(id);
        }, this.startTime + time);
    }
}

module.exports = WindowController;
