const { app, BrowserWindow, screen, session, desktopCapturer } = require('electron');
const windowController = require('./WindowController');

const startTime = 3000;

app.whenReady().then(() => {
    // 事前準備
    const primaryDisplay = screen.getPrimaryDisplay();
    const screenWidth = primaryDisplay.workAreaSize.width;
    const screenHeight = primaryDisplay.workAreaSize.height;
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
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
    wc.createSetTime(1, 0, "1_intro/intro", 800, 450);
    wc.deleteSetTime(1, 13300);

    // イントロの楽器のみびびる時間 ← びびるって意味わからんけどGitHub Copilotが出したのが面白すぎるのでそのまま
    (() => {
        const introStartTime = 12600;
        const frameWindowIds = [];
        const velocity = 1 / 40;
        const offset = 600;
        const windowSize = 300;
        const yoko_time = (screenHeight + offset * 2) / velocity;
        const tate_time = (screenWidth + offset * 2) / velocity;
        // 初期化
        for (let y = -offset; y <= screenHeight + offset; y += windowSize-1) {
            const x = 0;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            wc.createSetTime(id, introStartTime, "blank", windowSize, windowSize, x, y);
            wc.moveWindow(id, introStartTime, tate_time, x, y + screenHeight + offset);
            frameWindowIds.push(id);
        }
        for (let y = -offset; y <= screenHeight + offset; y += windowSize-1) {
            const x = screenWidth - windowSize;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            wc.createSetTime(id, introStartTime, "blank", windowSize, windowSize, x, y);
            wc.moveWindow(id, introStartTime, tate_time, x, y - screenHeight - offset);
            frameWindowIds.push(id);
        }
        upper_characters = ["blank", "blank", "1_intro/saku", "1_intro/double_colon", "1_intro/tu", "1_intro/ku", "1_intro/tu", "1_intro/ku"];
        for (let x = -offset; x <= screenWidth + offset; x += windowSize-1) {
            const y = 0;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            const html = upper_characters.shift() ?? "blank";
            wc.createSetTime(id, introStartTime, html, windowSize, windowSize, x, y);
            wc.moveWindow(id, introStartTime, yoko_time, x + screenWidth + offset, y);
            frameWindowIds.push(id);
        }
        lower_characters = ["blank", "blank", "blank", "blank", "1_intro/defer_ri", "1_intro/defer_me", "1_intro/defer_double_colon", "1_intro/defer_koe"];
        for (let x = -offset; x <= screenWidth + offset; x += windowSize-1) {
            const y = screenHeight - windowSize;
            let id = frameWindowIds[frameWindowIds.length - 1] ?? 10001; id++;
            const html = lower_characters.shift() ?? "blank";
            wc.createSetTime(id, introStartTime, html, windowSize, windowSize, x, y);
            wc.moveWindow(id, introStartTime, yoko_time, x - screenWidth - offset, y);
            frameWindowIds.push(id);
        }
        for (let i = 0; i < frameWindowIds.length; i++) {
            const id = frameWindowIds[i];
            wc.deleteSetTime(id, 23600);
        }
    })();

    // 1番目 1
    const AmeroStartTime = 24400;
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
    const AmeromoveDuration = 360;
    const AmeromoveDuration2 = 160;
    const AmerowindowPosOffset = 100;
    for (let i = 0; i < AmeroLyrics.length; i++) {
        const lyrics = AmeroLyrics[i];
        const displayTime = AmeroStartTime + i * AmeroDuration - AmeromoveDuration;
        wc.createSetTime(30000 + i * 10 + 1, displayTime - AmerowindowCreateTimeOffset, "2_Amero/char", 
            AmeroWindowHeight * 2,
            AmeroWindowHeight,
            screenWidth / 2 - AmeroWindowHeight * 4.5,
            - AmeroWindowHeight - AmerowindowPosOffset, false, {}, { char: lyrics[0] });
        wc.moveWindow(30000 + i * 10 + 1, displayTime, AmeromoveDuration, screenWidth / 2 - AmeroWindowHeight * 4.5, screenHeight / 2 - AmeroWindowHeight / 2, 'ease-in-out');
        wc.moveWindow(30000 + i * 10 + 1, displayTime + AmeromoveDuration, AmeromoveDuration2, screenWidth / 2 - AmeroWindowHeight * 4.5, screenHeight / 2 - AmeroWindowHeight / 2);
        wc.createSetTime(30000 + i * 10 + 2, displayTime - AmerowindowCreateTimeOffset, "2_Amero/char", 
            AmeroWindowHeight * 4,
            AmeroWindowHeight,
            screenWidth / 2 - AmeroWindowHeight * 2.5,
            - AmeroWindowHeight - AmerowindowPosOffset, false, {}, { char: lyrics[1] });
        wc.moveWindow(30000 + i * 10 + 2, displayTime, AmeromoveDuration, screenWidth / 2 - AmeroWindowHeight * 2.5, screenHeight / 2 - AmeroWindowHeight / 2, 'ease-in-out');
        wc.moveWindow(30000 + i * 10 + 2, displayTime + AmeromoveDuration, AmeromoveDuration2, screenWidth / 2 - AmeroWindowHeight * 2.5, screenHeight / 2 - AmeroWindowHeight / 2);
        wc.createSetTime(30000 + i * 10 + 3, displayTime - AmerowindowCreateTimeOffset, "2_Amero/char", 
            AmeroWindowHeight * 3,
            AmeroWindowHeight,
            screenWidth / 2 + AmeroWindowHeight * 1.5,
            - AmeroWindowHeight - AmerowindowPosOffset, false, {}, { char: lyrics[2] });
        wc.moveWindow(30000 + i * 10 + 3, displayTime, AmeromoveDuration, screenWidth / 2 + AmeroWindowHeight * 1.5, screenHeight / 2 - AmeroWindowHeight / 2, 'ease-in-out');
        wc.moveWindow(30000 + i * 10 + 3, displayTime + AmeromoveDuration, AmeromoveDuration2, screenWidth / 2 + AmeroWindowHeight * 1.5, screenHeight / 2 - AmeroWindowHeight / 2);
        wc.deleteSetTime(30000 + i * 10 + 1, displayTime + (AmeroLyrics.length - i + 2) * AmeroDuration);
    }
    const scale_factor = 0.97;
    for (let i = 0; i < AmeroLyrics.length; i++) {
        for (let j = 0; j < 4; j++){
            const displayTime = (AmeroLyrics.length + j / 4) * AmeroDuration;
            setTimeout(() => {
                const scale = Math.pow(scale_factor, (i * 4 + j + 1));
                const windowWidth = Math.round(screenWidth * scale);
                const windowHeight = Math.round(screenHeight * scale);
                console.log(screenWidth, screenHeight, scale);
                wc.createSetTime(40000 + i * 10 + + j +  1, displayTime, "nest", windowWidth, windowHeight, 0, 0, false, { center: true });
            }, AmeroStartTime + i * AmeroDuration);
        }
    }

    wc.deletePositiveWindows(48000);

    // どちゃキック
    wc.createSetTime(-1, 52100, "3_kick/kick", screenWidth, screenHeight, 0, 0, false, { fullscreen: true, alwaysOnTop: true });
});

process.on('uncaughtException', (error) => {
    console.error('Error:', error);
});