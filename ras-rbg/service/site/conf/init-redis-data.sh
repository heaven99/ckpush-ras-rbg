#!/bin/bash

echo
echo "RAS Global Data 구성"
redis-cli -n 5 -r 1 hset config.global.datas _ras_apps '["global", "console", "jeilfeed"]'
redis-cli -n 5 -r 1 hset config.global.datas _ras_label 'RAS Global Data'
redis-cli -n 5 -r 1 hset config.global.datas _ras_app_console_title '관리콘솔 (console)'
redis-cli -n 5 -r 1 hset config.global.datas _ras_app_global_title '시스템 글로벌 구성 (global)'
redis-cli -n 5 -r 1 hset config.global.datas _ras_app_jeilfeed_title '제일사료'
redis-cli -n 5 -r 1 hset config.global.datas _ras_image 'images/ras-system-config.png'


echo
echo "RAS Global cronjob 구성"
redis-cli -n 5 -r 1 hset config.global.cronjob _ras_label '스케줄링 처리'
redis-cli -n 5 -r 1 hset config.global.cronjob _ras_image 'images/ras-crontab.png'
redis-cli -n 5 -r 1 hset config.global.cronjob '1minute * * 0' 'ras-minute-event'
#redis-cli -n 5 -r 1 hset config.global.cronjob 'usage * * *' 'ras-system-usage'
#redis-cli -n 5 -r 1 hset config.global.cronjob 'group-device * * *' 'ras-group-device-data'

echo
echo "RAS Global event-map 구성"
redis-cli -n 5 -r 1 hset config.global.event-map _ras_label '이벤트 맵 - 공용'
redis-cli -n 5 -r 1 hset config.global.event-map _ras_image 'images/ras-event-map.png'
redis-cli -n 5 -r 1 hset config.global.event-map ras-minute-event '$PHP ras-noaction.php'
#redis-cli -n 5 -r 1 hset config.global.event-map ras-system-usage '$PHP ras-usage.php'
#redis-cli -n 5 -r 1 hset config.global.event-map ras-group-device-data_ '$PHP device/smart-device-data.php'
#redis-cli -n 5 -r 1 hset config.global.event-map ras-group-device-data '$PHP ras-noaction.php'

echo
echo "RAS console event-map 구성"
redis-cli -n 5 -r 1 hset config.console.event-map connected '$NODE console/ras-connected-console.js'
redis-cli -n 5 -r 1 hset config.console.event-map disconnected '$NODE ras-noaction.js'
redis-cli -n 5 -r 1 hset config.console.event-map hash-edit '$NODE console/ras-hash-edit.js'
redis-cli -n 5 -r 1 hset config.console.event-map _ras_label 'RAS Developer Console'
redis-cli -n 5 -r 1 hset config.console.event-map hash-remove '$NODE console/ras-hash-remove.js'
redis-cli -n 5 -r 1 hset config.console.event-map hash-remove-key '$NODE console/ras-hash-remove-key.js'
redis-cli -n 5 -r 1 hset config.console.event-map hash-add-key '$NODE console/ras-hash-add-key.js'
#redis-cli -n 5 -r 1 hset config.console.event-map ckpush-gcm-apns-send '$PHP sample-send.php'
#redis-cli -n 5 -r 1 hset config.console.event-map ckpush-gcm-apns-remove '$PHP ras-gcm-remove.php'


echo
echo "Visual Dashboard"
redis-cli -n 5 -r 1 hset config.console.event-map del-widget '$NODE consolevd/ras-del-widget.js'
redis-cli -n 5 -r 1 hset config.console.event-map add-widget '$NODE consolevd/ras-add-widget.js'
redis-cli -n 5 -r 1 hset config.console.event-map swap-panel '$NODE consolevd/ras-swap-panel.js'
redis-cli -n 5 -r 1 hset config.console.event-map gridster '$NODE consolevd/ras-gridster-widget.js'
redis-cli -n 5 -r 1 hset config.console.event-map cam-position '$NODE consolevd/ras-cam-position-widget.js'
redis-cli -n 5 -r 1 hset config.console.event-map start-drone '$NODE consolevd/ras-drone-demo-start.js'
redis-cli -n 5 -r 1 hset config.console.event-map move-drone '$NODE consolevd/ras-drone-demo-move.js'



echo
echo "제일사료 event-map 구성"
redis-cli -n 5 -r 1 hset config.jeilfeed.event-map fcm-test '$NODE ras-fcm-test.js'
redis-cli -n 5 -r 1 hset config.jeilfeed.event-map _ras_label '제일사료 이벤트 맵'


echo
echo "Terminal widget 구성"
redis-cli -n 5 -r 1 hset widget.console.terminal _ras_label '명령어 터미널'
redis-cli -n 5 -r 1 hset widget.console.terminal _ras_image 'images/ras-terminal.png'

echo
echo "기능 상세보기 구성"
redis-cli -n 5 -r 1 hset widget.console.tech1 _ras_label '실시간 서버 기능 상세 보기'
redis-cli -n 5 -r 1 hset widget.console.tech1 _ras_image 'images/ras-tech-notes.png'

echo
echo "시스템 상태 구성"
redis-cli -n 5 -r 1 hset ui.console.usage-1 _ras_label '시스템 상태'





#echo
#echo "백오피스 이벤트 맵"
#redis-cli -n 5 -r 1 hset config.backoffice.event-map _ras_label '백오피스 이벤트 맵'
#redis-cli -n 5 -r 1 hset config.backoffice.event-map ckpush-gcm-apns-send '$PHP sample-send.php'
#redis-cli -n 5 -r 1 hset config.backoffice.event-map ckpush-gcm-apns-send_ '$PHP ras-gcm-send.php'
#redis-cli -n 5 -r 1 hset config.backoffice.event-map ras-gcm-callback '$PHP ras-gcm-callback.php'

echo
echo "실시간 로드 제어"
redis-cli -n 5 -r 1 hset config.global.load-controls _ras_label 'RAS 실시간 로드 제어'
redis-cli -n 5 -r 1 hset config.global.load-controls lc-a 0.3
redis-cli -n 5 -r 1 hset config.global.load-controls lc-b 0.5
redis-cli -n 5 -r 1 hset config.global.load-controls lc-min 1
redis-cli -n 5 -r 1 hset config.global.load-controls lc-max 60
redis-cli -n 5 -r 1 hset config.global.load-controls load-in 0
redis-cli -n 5 -r 1 hset config.global.load-controls load-out 0


