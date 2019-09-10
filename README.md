# ckpush-ras-cnn

## 라이센스 설명 
Copyright(C) 2015-2019 CKSTACK, @author befarde (@email chohs@ckstack.com) <br>
@license commercial use requires a commercial license.<br>

>TODO : 라이센스 관계 처리할 것 , 아래는 샘플
>
/**
 * ckpush-ras-cnn
 * 
 * Copyright(C) 2015-2017 @author befarde (@email chohs@ckstack.com)
 * @license commercial use requires a commercial license.
 * 
 * -----------------------------------------------------------
 * @file :
 * @version : 4.0.0
 * @notes
 *  -Timer 의 종류 
 *    ckpush-time-1sec, ckpush-time-5sec, ckpush-time-10sec,
 *    ckpush-time-1min, ckpush-time-5min, ckpush-time-10min, ckpush-time-1hour
 *  -queue 의 종류
 *  
 */
/////////////////////////////////////////////////////////////////////


## 버전 설명
##### Version 0.1.0 - BLUEGA RTK, 2010 ~ 2011. (for HTML5 Game, C 언어 기반, WebSockets 구현)
> https://www.youtube.com/watch?v=2LevCgi0OjA
######

##### Version 0.5.0 - BLUEGA RTK, 2012.04 ~ (pieos / s1 project, Node.js 기반, 프로세스간 직접적인 real-time communication)
> https://www.youtube.com/watch?v=JdAPX-2DWEk
######


##### Version 1.0.0 - WBF-RAS, 2013.06 ~ (for P1, redis 도입, 간접 real-time communication, 실시간 WEB Dashboard 테스트)
######

##### Version 1.5.0 - p2-ras, 2013.08 ~ (for fanship, static + dynamic event-script, 실시간 text 가반 shell)
> https://www.youtube.com/watch?v=EI7OkgKfXt4
######

##### Version 2.0.0 - p2a-ras, 2014.01 ~ (for P2, all dynamic event-script, 실시간 visual console)
>Socket.io, GCM
######

##### Version 2.1.0 - p2a-ras, 2014.11 ~ (for P2SS, Visual dashboard 및 extension 테스트)
>Socket.io, GCM
> https://www.youtube.com/watch?v=yOKSFg7bKaI
######

##### Version 3.0.0 - ckpush-ras, 2015.04 ~ (for CKPush)
>Socket.io, GCM, APNS, MQTT 

> https://www.youtube.com/watch?v=b9o20kLzJMI 
>
> https://www.youtube.com/watch?v=FLQXN75ZUXk
######

##### Version 4.0.0 - ckpush-ras, 2017.10 ~ (for CKPush)
>WebSockets, MQTT, GCM, APNS
>
>Script : JavaScript 지원 예정.
>
>Windows 기반 Native Developer console 도입 예정.
>
######


##package 구성 (2017.10 릴리즈 기준)
*    "express":     "4.15.4" - 2017.10.09
*    "ws":          "3.1.0"  - 2017.10.09
*    "moment":      "2.18.1" - 2017.10.09
*    "request":     "2.81.0" - 2017.10.09 (Check require)
*    "winston":     "2.3.1"  - 2017.10.09
*    "lodash":      "4.17.4" - 2017.10.09
*    "multiparty":  "4.1.3"  - 2017.10.09 (Check require)
*    "async":       "2.5.0"  - 2017.10.09
*    "redis":       "2.8.0"  - 2017.10.09
*    "backbone" :   "1.2.3"  - 2017.10.09
*    "mysql":       "2.8.0"  - 2017.10.09
*    "mqtt":        "2.4.0"  - 2017.10.09
*    "node-gcm":    "0.11.0" - 2015.07.27 (Check require)
*    "apn":         "1.7.4"  - 2015.07.27 (Check require)


## 프로세스 구성도
>(TODO) 최신버전 수정필요.
![-](https://cloud.githubusercontent.com/assets/2630374/9158615/15937eda-3f55-11e5-959b-40111ab5301e.png)






