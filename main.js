const { app, screen, session, desktopCapturer, Menu } = require('electron');
const windowController = require('./WindowController');
const os = require("os");

const startTime = 6000;
Menu.setApplicationMenu(false);  // 軽くなるが、演出と相談

app.whenReady().then(() => {
    // 事前準備
    const primaryDisplay = screen.getPrimaryDisplay();
    const screenWidth = primaryDisplay.workAreaSize.width;
    const screenHeight = primaryDisplay.workAreaSize.height;
    app.setAppUserModelId('fwrite.program'); // 通知のために https://www.electronjs.org/docs/latest/api/app#appsetappusermodelidid-windows
    session.defaultSession.setDisplayMediaRequestHandler((r, callback) => {
        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
            callback({ video: sources[0] })
        })
    })

    // 始まり
    const wc = new windowController(startTime);
    setTimeout(() => {
        wc._createWindow(0, "audio", 800, 450, 0, 0);
    }, startTime);

    // イントロの声がなっている時間
    wc.createSetTime(2, -3000, "1_intro/caution", 400, 300, 0, 0, false, { center: true });
    wc.deleteSetTime(2, -1000);
    wc.createSetTime(1, 0, "1_intro/intro", 800, 450, 0, 0, false, { center: true });
    wc.deleteSetTime(1, 13300);

    // イントロの楽器のみびびる時間 ← びびるって意味わからんけどGitHub Copilotが出したのが面白すぎるのでそのまま
    (() => {
        const introStartTime = 12600;
        const frameWindowIds = [];
        const velocity = 1 / 40;
        const offset = 350;
        const windowSize = 300;
        const yoko_time = (screenHeight + offset * 2) / velocity;
        const tate_time = (screenWidth + offset * 2) / velocity;
        // 初期化
        for (let y = -offset; y <= screenHeight + offset; y += windowSize - 20) {
            const x = -10;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            wc.createSetTime(id, introStartTime, "blank", windowSize, windowSize, x, y, true);
            wc.moveWindow(id, introStartTime, tate_time, x, y + screenHeight + offset);
            frameWindowIds.push(id);
        }
        for (let y = -offset; y <= screenHeight + offset; y += windowSize - 20) {
            const x = screenWidth - windowSize + 10;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            wc.createSetTime(id, introStartTime, "blank", windowSize, windowSize, x, y, true);
            wc.moveWindow(id, introStartTime, tate_time, x, y - screenHeight - offset);
            frameWindowIds.push(id);
        }
        upper_characters = ["blank", "1_intro/saku", "1_intro/double_colon", "1_intro/tu", "1_intro/ku", "1_intro/tu", "1_intro/ku"];
        for (let x = -offset; x <= screenWidth + offset; x += windowSize - 20) {
            const y = 0;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            const html = upper_characters.shift() ?? "blank";
            wc.createSetTime(id, introStartTime, html, windowSize, windowSize, x, y, true);
            wc.moveWindow(id, introStartTime, yoko_time, x + screenWidth + offset, y);
            frameWindowIds.push(id);
        }
        lower_characters = ["blank", "blank", "blank", "blank", "1_intro/defer_koe", "1_intro/defer_double_colon", "1_intro/defer_ri", "1_intro/defer_me"];
        for (let x = -offset; x <= screenWidth + offset; x += windowSize - 20) {
            const y = screenHeight - windowSize + 10;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            const html = lower_characters.shift() ?? "blank";
            wc.createSetTime(id, introStartTime, html, windowSize, windowSize, x, y, true);
            wc.moveWindow(id, introStartTime, yoko_time, x - screenWidth - offset, y);
            frameWindowIds.push(id);
        }
        for (let i = 0; i < frameWindowIds.length; i++) {
            const id = frameWindowIds[i];
            wc.deleteSetTime(id, 23600);
        }
    })();

    // 1番目 1
    const AmeroStartTime = 24520;
    const AmeroWindowHeight = 200;
    // 2文字、4文字、3文字分のwindowを作成
    const AmeroLyrics = [
        ["肥大", "していく", "緩衝"],
        ["塵芥", "めいた", "感情"],
        ["臨界", "点で", "干渉"],
        ["意外", "性は", "無いの"],
        ["期待", "は生物", "学上"],
        ["人界", "戦術", "対象"],
        ["未体", "験の", "愛も"],
        ["意外", "性は", "排除"],
    ]
    const AmeroDuration = 1472;
    const AmerowindowCreateTimeOffset = 200;
    const AmeromoveDuration = 350;
    const AmeromoveDuration2 = 160;
    const AmerowindowPosOffset = 100;
    for (let i = 0; i < AmeroLyrics.length; i++) {
        const lyrics = AmeroLyrics[i];
        const displayTime = AmeroStartTime + i * AmeroDuration - AmeromoveDuration;
        wc.createSetTime(30000 + i * 10 + 1, displayTime - AmerowindowCreateTimeOffset, "2_Amero/char",
            AmeroWindowHeight * 2,
            AmeroWindowHeight * 1.02,
            screenWidth / 2 - AmeroWindowHeight * 4.5,
            - AmeroWindowHeight - AmerowindowPosOffset, false, {}, { char: lyrics[0] });
        wc.moveWindow(30000 + i * 10 + 1, displayTime, AmeromoveDuration, screenWidth / 2 - AmeroWindowHeight * 4.5, screenHeight / 2 - AmeroWindowHeight / 2, 'ease-in-out');
        wc.moveWindow(30000 + i * 10 + 1, displayTime + AmeromoveDuration, AmeromoveDuration2, screenWidth / 2 - AmeroWindowHeight * 4.5, screenHeight / 2 - AmeroWindowHeight / 2 - 7);
        wc.createSetTime(30000 + i * 10 + 2, displayTime - AmerowindowCreateTimeOffset, "2_Amero/char",
            AmeroWindowHeight * 4,
            AmeroWindowHeight * 0.92,
            screenWidth / 2 - AmeroWindowHeight * 2.5,
            - AmeroWindowHeight - AmerowindowPosOffset, false, {}, { char: lyrics[1] });
        wc.moveWindow(30000 + i * 10 + 2, displayTime, AmeromoveDuration, screenWidth / 2 - AmeroWindowHeight * 2.5, screenHeight / 2 - AmeroWindowHeight / 2, 'ease-in-out');
        wc.moveWindow(30000 + i * 10 + 2, displayTime + AmeromoveDuration, AmeromoveDuration2, screenWidth / 2 - AmeroWindowHeight * 2.5, screenHeight / 2 - AmeroWindowHeight / 2);
        wc.createSetTime(30000 + i * 10 + 3, displayTime - AmerowindowCreateTimeOffset, "2_Amero/char",
            AmeroWindowHeight * 3,
            AmeroWindowHeight * 1.05,
            screenWidth / 2 + AmeroWindowHeight * 1.5,
            - AmeroWindowHeight - AmerowindowPosOffset, false, {}, { char: lyrics[2] });
        wc.moveWindow(30000 + i * 10 + 3, displayTime, AmeromoveDuration, screenWidth / 2 + AmeroWindowHeight * 1.5, screenHeight / 2 - AmeroWindowHeight / 2, 'ease-in-out');
        wc.moveWindow(30000 + i * 10 + 3, displayTime + AmeromoveDuration, AmeromoveDuration2, screenWidth / 2 + AmeroWindowHeight * 1.5, screenHeight / 2 - AmeroWindowHeight / 2 + 8);
        wc.deleteSetTime(30000 + i * 10 + 1, displayTime + (AmeroLyrics.length - i + 2) * AmeroDuration);
    }
    // 1番目 2
    const scale_factor = 0.97;
    for (let i = 0; i < AmeroLyrics.length; i++) {
        for (let j = 0; j < 4; j++) {
            const displayTime = (AmeroLyrics.length - 2 + j / 4) * AmeroDuration - 10;
            setTimeout(() => {
                const scale = Math.pow(scale_factor, (i * 4 + j + 1));
                const windowWidth = Math.round(screenWidth * scale);
                const windowHeight = Math.round(screenHeight * scale);
                console.log(screenWidth, screenHeight, scale);
                wc.createSetTime(40000 + i * 10 + + j + 1, displayTime, "nest", windowWidth, windowHeight, 0, 0, false, { center: true });
            }, AmeroStartTime + (i + 2) * AmeroDuration);
        }
    }
    wc.createSetTime(41001, AmeroStartTime + AmeroLyrics.length * AmeroDuration, "2_Amero/ticket", 600, 600 * 951 / 1920, 50, screenHeight - 300, false, { alwaysOnTop: true, transparent: true });
    wc.createSetTime(41004, AmeroStartTime + (AmeroLyrics.length + 1) * AmeroDuration, "2_Amero/ball", 300, 300, screenWidth - 360, screenHeight - 320, false, { alwaysOnTop: true });
    wc.createSetTime(41002, AmeroStartTime + (AmeroLyrics.length + 2) * AmeroDuration, "2_Amero/disgust", 400, 400, 150, 50, false, { alwaysOnTop: true });
    wc.createSetTime(41006, AmeroStartTime + (AmeroLyrics.length + 3) * AmeroDuration - 60, "2_Amero/textbook_1", 600, 600 * 2339 / 1654, screenWidth - 480, -110, false, { alwaysOnTop: true });
    wc.createSetTime(41007, AmeroStartTime + (AmeroLyrics.length + 3) * AmeroDuration - 20, "2_Amero/textbook_2", 600, 600 * 2339 / 1654, screenWidth - 460, -80, false, { alwaysOnTop: true });
    wc.createSetTime(41008, AmeroStartTime + (AmeroLyrics.length + 3) * AmeroDuration + 60, "2_Amero/textbook_3", 600, 600 * 2339 / 1654, screenWidth - 440, -50, false, { alwaysOnTop: true });
    // info
    const infoWindowID = 42000;
    wc.createSetTime(infoWindowID, AmeroStartTime + (AmeroLyrics.length + 4) * AmeroDuration, "2_Amero/info", 270, 180, 360, screenHeight - 480, true, { alwaysOnTop: true });
    let infoIntervalId;
    setTimeout(() => {
        infoIntervalId = setInterval(() => {
            const mainWindow = wc.windows[infoWindowID];
            if (!mainWindow || mainWindow.isDestroyed()) {
                clearInterval(infoIntervalId);
                return;
            }

            mainWindow.webContents.send("system-info", {
                platform: os.platform(),
                cpuUsage: os.loadavg()[0],
                totalMem: os.totalmem(),
                freeMem: os.freemem(),
                uptime: os.uptime()
            });
        }, 500);
    }, AmeroStartTime + (AmeroLyrics.length + 2) * AmeroDuration);
    wc.createSetTime(41003, AmeroStartTime + (AmeroLyrics.length + 5) * AmeroDuration, "2_Amero/eye", 250, 250, screenWidth - 600, 150, false, { alwaysOnTop: true });
    wc.createSetTime(41009, AmeroStartTime + (AmeroLyrics.length + 6) * AmeroDuration - 90, "2_Amero/photo_1", 220, 220 * 3204 / 4032, 660, 250, false, { alwaysOnTop: true });
    wc.createSetTime(41010, AmeroStartTime + (AmeroLyrics.length + 6) * AmeroDuration - 40, "2_Amero/photo_2", 220, 220 * 3204 / 4032, 665, 270, false, { alwaysOnTop: true });
    wc.createSetTime(41011, AmeroStartTime + (AmeroLyrics.length + 6) * AmeroDuration + 10, "2_Amero/photo_3", 220, 220 * 3204 / 4032, 670, 290, false, { alwaysOnTop: true });
    wc.createSetTime(41012, AmeroStartTime + (AmeroLyrics.length + 7) * AmeroDuration - 10, "2_Amero/earth", 500, 500 * 500 / 900, screenWidth - 1210, screenHeight - 200, false, { alwaysOnTop: true });
    wc.createSetTime(41013, AmeroStartTime + (AmeroLyrics.length + 7) * AmeroDuration - 10, "2_Amero/news", 180, 180, screenWidth - 1100, -10, false, { alwaysOnTop: true });

    wc.deletePositiveWindows(48000, 29);

    wc.notifySetTime(50001, 50000, "Lyrics", "君の心臓に読点を");
    wc.deleteNotifySetTime(50001, 52000);

    let intervalId; // setIntervalのIDを保持

    // 50秒後にsetIntervalを開始


    // どちゃキック
    wc.createSetTime(-1, 52100, "3_kick/kick", screenWidth, screenHeight, 0, 0, false, { fullscreen: true, alwaysOnTop: true });
});

process.on('uncaughtException', (error) => {
    console.error('Error:', error);
});