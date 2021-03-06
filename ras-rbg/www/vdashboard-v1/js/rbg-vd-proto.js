$(document).ready(function () {
    console.log('--- Start app process ---');

    $('body').on('click', '[data-ma-action]', function (e) {
        e.preventDefault();

        var $this = $(this);
        var action = $(this).data('ma-action');

        switch (action) {
            case 'send-cmd':
                var cmd = $('#map-cmd').val();
                var select = $('#map-select').val();
                console.log('select:' + select.toUpperCase());
                console.log('send-cmd:' + cmd.toUpperCase());

                if (select.toUpperCase() === "GEO LEVEL") {
                    window.map.zoomTo(cmd, {duration: 3000});
                }
                else if (select.toUpperCase() === "GEO POSITION") {
                    if (cmd.toUpperCase() === "GO EWHA") {
                        window.map.flyTo({
                            center: [126.96, 37.5571177715]
                        });
                    }
                    else if (cmd.toUpperCase() === "GO PANGYO") {
                        window.map.flyTo({
                            // 분당 : center: [127.15, 37.4]
                            center: [127.13, 37.4]
                        });
                    }
                }
                else if (select.toUpperCase() === "RISK TYPE") {
                    if (cmd.toUpperCase() === "ADD RISK") {
                        map.addLayer({
                            "id": "risk-data-point",
                            "type": "circle",
                            "source": "risk-data",
                            "minzoom": 11,
                            "paint": {
                                //
                                // Size circle radius by earthquake magnitude and zoom level
                                //
                                "circle-radius": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    10, [
                                        "interpolate",
                                        ["linear"],
                                        ["get", "mag"],
                                        1, 3,
                                        9, 30
                                    ],
                                    16, [
                                        "interpolate",
                                        ["linear"],
                                        ["get", "mag"],
                                        1, 20,
                                        9, 100
                                    ]
                                ],
                                //
                                // Color circle by earthquake magnitude
                                //
                                "circle-color": [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "mag"],
                                    1, "rgba(33,102,172,0)",
                                    2, "rgb(103,169,207)",
                                    3, "rgb(209,229,240)",
                                    4, "rgb(253,219,199)",
                                    5, "rgb(239,138,98)",
                                    6, "rgb(178,24,43)",
                                    7, "rgb(255,50,50)",
                                    8, "rgb(255,100,100)",
                                    9, "rgb(255,150,150)"
                                ],
                                "circle-stroke-color": "red",
                                "circle-stroke-width": 0,
                                //
                                // Transition from heatmap to circle layer by zoom level
                                // zoom 이 높으면 투명도를 늘리고 zoom 이 낮으면 투명도를 줄인다.,
                                "circle-opacity": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    8, 1,
                                    15, 0
                                ]
                            }
                        }, 'waterway-label');
                    }
                    //
                    // USER GPS DATA
                    //
                    else if (cmd.toUpperCase() === "ADD USER GPS") {
                        map.addLayer({
                            "id": "user-position-point",
                            "type": "circle",
                            "source": "user-position",
                            "minzoom": 8,
                            "paint": {
                                //
                                // Size circle radius by earthquake magnitude and zoom level
                                //
                                "circle-radius": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    10, [
                                        "interpolate",
                                        ["linear"],
                                        ["get", "mag"],
                                        1, 3,
                                        9, 30
                                    ],
                                    16, [
                                        "interpolate",
                                        ["linear"],
                                        ["get", "mag"],
                                        1, 20,
                                        9, 100
                                    ]
                                ],
                                //
                                // Color circle by earthquake magnitude
                                //
                                "circle-color": [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "mag"],
                                    1, "rgba(33,102,172,0)",
                                    2, "rgb(103,169,207)",
                                    3, "rgb(209,229,240)",
                                    4, "rgb(253,219,199)",
                                    5, "rgb(239,138,98)",
                                    6, "rgb(178,24,43)",
                                    7, "rgb(255,50,50)",
                                    8, "rgb(255,100,100)",
                                    9, "rgb(255,150,150)"
                                ],
                                "circle-stroke-color": "white",
                                "circle-stroke-width": 2,
                                //
                                // Transition from heatmap to circle layer by zoom level
                                // zoom 이 높으면 투명도를 늘리고 zoom 이 낮으면 투명도를 줄인다.,
                                "circle-opacity": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    8, 1,
                                    15, 1
                                ]
                            }
                        }, 'waterway-label');
                    }
                    //
                    // SNS RISK DATA
                    //
                    else if (cmd.toUpperCase() === "ADD SNS RISK") {
                        map.addLayer({
                            "id": "sns-risk-point",
                            "type": "circle",
                            "source": "sns-risk-data",
                            "minzoom": 8,
                            "paint": {
                                //
                                // Size circle radius by earthquake magnitude and zoom level
                                //
                                "circle-radius": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    10, [
                                        "interpolate",
                                        ["linear"],
                                        ["get", "mag"],
                                        1, 3,
                                        9, 30
                                    ],
                                    16, [
                                        "interpolate",
                                        ["linear"],
                                        ["get", "mag"],
                                        1, 20,
                                        9, 100
                                    ]
                                ],
                                //
                                // Color circle by earthquake magnitude
                                //
                                "circle-color": [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "mag"],
                                    1, "rgba(250,244,192,0)",
                                    2, "rgb(250,237,125)",
                                    3, "rgb(229,216,92)",
                                    4, "rgb(255,228,0)"
                                ],
                                "circle-stroke-color": "yellow",
                                "circle-stroke-width": 2,
                                //
                                // Transition from heatmap to circle layer by zoom level
                                // zoom 이 높으면 투명도를 늘리고 zoom 이 낮으면 투명도를 줄인다.,
                                "circle-opacity": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    8, 1,
                                    15, 1
                                ]
                            }
                        }, 'waterway-label');
                    }
                    //
                    // ADD Heatmap
                    //
                    else if (cmd.toUpperCase() === "ADD HEATMAP") {
                        // INFO : heat map 을 그린다.
                        map.addLayer({
                            "id": "risk-data-heat",
                            "type": "heatmap",
                            "source": "risk-data",
                            "maxzoom": 18,
                            "paint": {
                                //
                                // Increase the heatmap weight based on frequency and property magnitude
                                //
                                "heatmap-weight": [
                                    "interpolate",
                                    ["linear"],
                                    ["get", "mag"],
                                    0, 0.1,
                                    9, 1
                                ],
                                // TODO: CHECK
                                // Increase the heatmap color weight weight by zoom level
                                // heatmap-intensity is a multiplier on top of heatmap-weight
                                //
                                "heatmap-intensity": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    0, 1,
                                    18, 9
                                ],
                                //
                                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                                // Begin color ramp at 0-stop with a 0-transparancy color
                                // to create a blur-like effect.
                                //
                                "heatmap-color": [
                                    "interpolate",
                                    ["linear"],
                                    ["heatmap-density"],
                                    0, "rgba(33,102,172,0)",
                                    0.2, "rgb(103,169,207)",
                                    0.4, "rgb(209,229,240)",
                                    0.6, "rgb(253,219,199)",
                                    0.8, "rgb(239,138,98)",
                                    1, "rgb(178,24,43)"
                                ],
                                //
                                // TODO : linear 로 진행하다보니 zoom 이 낮을 때 너무 크다.  (따라서, zoom 이 높을 때는 좀 크게 표현하는 방식이 낮다
                                // Adjust the heatmap radius by zoom level
                                // -16 레벨에서 최대크기를 갖는다.
                                "heatmap-radius": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    8, 10,
                                    16, 200
                                ],
                                //
                                // Transition from heatmap to circle layer by zoom level
                                // -16 레벨에서는 히트맵이 사라지고, 10에서는 최대화
                                "heatmap-opacity": [
                                    "interpolate",
                                    ["linear"],
                                    ["zoom"],
                                    10, 0.7,
                                    16, 0.4
                                ],
                            }
                        }, 'waterway-label');
                    }
                }

                break;



                // $.ajax({
                //     // url: "/device/rs232/" + $('#rs232-cmd').val() + '?ca=' + (Math.random() * 10000000000),
                //     url: "/device/rs232/" + $('#rs232-cmd').val(),
                //     context: document.body
                // }).success(function(result) {
                //     //$( this ).addClass( "done" );
                //     //console.log('RS232 SEND:' + JSON.stringify(result));
                //     console.log('RS232 SEND:' + result.cmd);
                //     // var htmlCert = result.cert.replace(/\n/g, "<br>");
                //     //
                //     $('#device-send').html(result.cmd);
                //     //
                // });
                // break;

            case 'cerate-cert':
                console.log('create-cert:');
                // TODO : half, mac address;
                var reqParam = '/half/66:11:22:33:44:55';

                $.ajax({
                    url: "/device/create" + reqParam,
                    context: document.body
                }).success(function(result) {
                    //$( this ).addClass( "done" );
                    console.log('create ok:' + JSON.stringify(result));
                    var htmlCert = result.cert.replace(/\n/g, "<br>");

                    $('#device-cert').html(htmlCert);

                });
                break;


            case 'verify-cert':
                console.log('verify-cert:');
                break;


            case 'download-cert':
                console.log('download-cert:');
                break;


            /*-------------------------------------------
                Sidebar & Chat Open/Close
            ---------------------------------------------*/
            case 'sidebar-open':
                var target = $this.data('ma-target');
                var backdrop = '<div data-ma-action="sidebar-close" class="ma-backdrop" />';

                $('body').addClass('sidebar-toggled');
                $('#header, #header-alt, #main').append(backdrop);
                $this.addClass('toggled');
                $(target).addClass('toggled');

                break;

            case 'sidebar-close':
                $('body').removeClass('sidebar-toggled');
                $('.ma-backdrop').remove();
                $('.sidebar, .ma-trigger').removeClass('toggled')

                break;


            /*-------------------------------------------
                Mainmenu Submenu Toggle
            ---------------------------------------------*/
            case 'submenu-toggle':
                $this.next().slideToggle(200);
                $this.parent().toggleClass('toggled');

                break;


            /*-------------------------------------------
                Top Search Open/Close
            ---------------------------------------------*/
            //Open
            case 'search-open':
                $('#header').addClass('search-toggled');
                $('#top-search-wrap input').focus();

                break;

            //Close
            case 'search-close':
                $('#header').removeClass('search-toggled');

                break;


            /*-------------------------------------------
                Header Notification Clear
            ---------------------------------------------*/
            case 'clear-notification':
                var x = $this.closest('.list-group');
                var y = x.find('.list-group-item');
                var z = y.size();

                $this.parent().fadeOut();

                x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
                x.find('.grid-loading').fadeIn(1500);


                var w = 0;
                y.each(function(){
                    var z = $(this);
                    setTimeout(function(){
                        z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
                            z.remove();
                        });
                    }, w+=150);
                })

                //Popup empty message
                setTimeout(function(){
                    $('#notifications').addClass('empty');
                }, (z*150)+200);

                break;


            /*-------------------------------------------
                Fullscreen Browsing
            ---------------------------------------------*/
            case 'fullscreen':
                //Launch
                function launchIntoFullscreen(element) {
                    if(element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if(element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if(element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if(element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                }

                //Exit
                function exitFullscreen() {

                    if(document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if(document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if(document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }

                launchIntoFullscreen(document.documentElement);

                break;


            /*-------------------------------------------
                Clear Local Storage
            ---------------------------------------------*/
            case 'clear-localstorage':
                swal({
                    title: "Are you sure?",
                    text: "All your saved localStorage values will be removed",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false
                }, function(){
                    localStorage.clear();
                    swal("Done!", "localStorage is cleared", "success");
                });

                break;


            /*-------------------------------------------
                Print
            ---------------------------------------------*/
            case 'print':

                window.print();

                break;


            /*-------------------------------------------
                Login Window Switch
            ---------------------------------------------*/
            case 'login-switch':
                var loginblock = $this.data('ma-block');
                var loginParent = $this.closest('.lc-block');

                loginParent.removeClass('toggled');

                setTimeout(function(){
                    $(loginblock).addClass('toggled');
                });

                break;


            /*-------------------------------------------
                Profile Edit/Edit Cancel
            ---------------------------------------------*/
            //Edit
            case 'profile-edit':
                $this.closest('.pmb-block').toggleClass('toggled');

                break;

            case 'profile-edit-cancel':
                $(this).closest('.pmb-block').removeClass('toggled');

                break;


            /*-------------------------------------------
                Action Header Open/Close
            ---------------------------------------------*/
            //Open
            case 'action-header-open':
                ahParent = $this.closest('.action-header').find('.ah-search');

                ahParent.fadeIn(300);
                ahParent.find('.ahs-input').focus();

                break;

            //Close
            case 'action-header-close':
                ahParent.fadeOut(300);
                setTimeout(function(){
                    ahParent.find('.ahs-input').val('');
                }, 350);

                break;


            /*-------------------------------------------
                Wall Comment Open/Close
            ---------------------------------------------*/
            //Open
            case 'wall-comment-open':
                if(!($this).closest('.wic-form').hasClass('toggled')) {
                    $this.closest('.wic-form').addClass('toggled');
                }

                break;

            //Close
            case 'wall-comment-close':
                $this.closest('.wic-form').find('textarea').val('');
                $this.closest('.wic-form').removeClass('toggled');

                break;


            /*-------------------------------------------
                Todo Form Open/Close
            ---------------------------------------------*/
            //Open
            case 'todo-form-open':
                $this.closest('.t-add').addClass('toggled');

                break;

            //Close
            case 'todo-form-close':
                $this.closest('.t-add').removeClass('toggled');
                $this.closest('.t-add').find('textarea').val('');

                break;
        }
    });
});

$(document).ready(function () {
    /*-------------------------------------------
        Sparkline
    ---------------------------------------------*/
    function sparklineBar(id, values, height, barWidth, barColor, barSpacing) {
        $('.'+id).sparkline(values, {
            type: 'bar',
            height: height,
            barWidth: barWidth,
            barColor: barColor,
            barSpacing: barSpacing
        })
    }

    function sparklineLine(id, values, width, height, lineColor, fillColor, lineWidth, maxSpotColor, minSpotColor, spotColor, spotRadius, hSpotColor, hLineColor) {
        $('.'+id).sparkline(values, {
            type: 'line',
            width: width,
            height: height,
            lineColor: lineColor,
            fillColor: fillColor,
            lineWidth: lineWidth,
            maxSpotColor: maxSpotColor,
            minSpotColor: minSpotColor,
            spotColor: spotColor,
            spotRadius: spotRadius,
            highlightSpotColor: hSpotColor,
            highlightLineColor: hLineColor
        });
    }

    function sparklinePie(id, values, width, height, sliceColors) {
        $('.'+id).sparkline(values, {
            type: 'pie',
            width: width,
            height: height,
            sliceColors: sliceColors,
            offset: 0,
            borderWidth: 0
        });
    }

    // Mini Chart - Bar Chart 1
    if ($('.stats-bar')[0]) {
        sparklineBar('stats-bar', [6,4,8,6,5,6,7,8,3,5,9,5,8,4], '35px', 3, '#d6d8d9', 2);
    }

    // Mini Chart - Bar Chart 2
    if ($('.stats-bar-2')[0]) {
        sparklineBar('stats-bar-2', [4,7,6,2,5,3,8,6,6,4,8,6,5,8], '35px', 3, '#d6d8d9', 2);
    }

    // Mini Chart - Line Chart 1
    if ($('.stats-line')[0]) {
        sparklineLine('stats-line', [9,4,6,5,6,4,5,7,9,3,6,5], 68, 35, '#fff', 'rgba(0,0,0,0)', 1.25, '#d6d8d9', '#d6d8d9', '#d6d8d9', 3, '#fff', '#d6d8d9');
    }

    // Mini Chart - Line Chart 2
    if ($('.stats-line-2')[0]) {
        sparklineLine('stats-line-2', [5,6,3,9,7,5,4,6,5,6,4,9], 68, 35, '#fff', 'rgba(0,0,0,0)', 1.25, '#d6d8d9', '#d6d8d9', '#d6d8d9', 3, '#fff', '#d6d8d9');
    }

    // Mini Chart - Pie Chart 1
    if ($('.stats-pie')[0]) {
        sparklinePie('stats-pie', [20, 35, 30, 5], 45, 45, ['#fff', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']);
    }

    // Dash Widget Line Chart
    if ($('.dash-widget-visits')[0]) {
        sparklineLine('dash-widget-visits', [9,4,6,5,6,4,5,7,9,3,6,5], '100%', '70px', 'rgba(255,255,255,0.7)', 'rgba(0,0,0,0)', 1, 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.4)', 5, 'rgba(255,255,255,0.4)', '#fff');
    }


    /*-------------------------------------------
        Easy Pie Charts
    ---------------------------------------------*/
    function easyPieChart(id, trackColor, scaleColor, barColor, lineWidth, lineCap, size) {
        $('.'+id).easyPieChart({
            trackColor: trackColor,
            scaleColor: scaleColor,
            barColor: barColor,
            lineWidth: lineWidth,
            lineCap: lineCap,
            size: size
        });
    }

    // Main Pie Chart
    if ($('.main-pie')[0]) {
        easyPieChart('main-pie', 'rgba(0,0,0,0.2)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 2, 'butt', 148);
    }

    // Others
    if ($('.sub-pie-1')[0]) {
        easyPieChart('sub-pie-1', 'rgba(0,0,0,0.2)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 2, 'butt', 95);
    }

    if ($('.sub-pie-2')[0]) {
        easyPieChart('sub-pie-2', 'rgba(0,0,0,0.2)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 2, 'butt', 95);
    }
});

$(window).load(function(){

    /*-------------------------------------------
        Welcome Message
    ---------------------------------------------*/
    function notify(message, type){
        $.growl({
            message: message
        },{
            type: type,
            allow_dismiss: false,
            label: 'Cancel',
            className: 'btn-xs btn-inverse',
            placement: {
                from: 'bottom',
                align: 'left'
            },
            delay: 2500,
            animate: {
                    enter: 'animated fadeInUp',
                    exit: 'animated fadeOutDown'
            },
            offset: {
                x: 30,
                y: 30
            }
        });
    };
    
    setTimeout(function () {
        if (!$('.login-content')[0]) {
            notify('Welcome back Mallinda Hollaway', 'default');
        }
    }, 1000)
});
$(document).ready(function(){
    

    /*----------------------------------------------
        Make some random data for Flot Line Chart
     ----------------------------------------------*/
    var data1 = [[1,60], [2,30], [3,50], [4,100], [5,10], [6,90], [7,85]];
    var data2 = [[1,20], [2,90], [3,60], [4,40], [5,100], [6,25], [7,65]];
    var data3 = [[1,100], [2,20], [3,60], [4,90], [5,80], [6,10], [7,5]];
    
    // Create an Array push the data + Draw the bars

    var barData = [
        {
            label: 'Tokyo',
            data: data1,
            color: '#dbdddd'
        },
        {
            label: 'Seoul',
            data: data2,
            color: '#636c72'
        },
        {
            label: 'Beijing',
            data: data3,
            color: '#3e4a51'
        }
    ]
    

    /*---------------------------------
        Let's create the chart
     ---------------------------------*/
    if ($('#bar-chart')[0]) {
        $.plot($("#bar-chart"), barData, {
            series: {
                bars: {
                    show: true,
                    barWidth: 0.05,
                    order: 1,
                    fill: 1
                }
            },
            grid : {
                    borderWidth: 1,
                    borderColor: '#333c42',
                    show : true,
                    hoverable : true,
                    clickable : true
            },

            yaxis: {
                tickColor: '#333c42',
                tickDecimals: 0,
                font :{
                    lineHeight: 13,
                    style: "normal",
                    color: "#9f9f9f",
                },
                shadowSize: 0
            },

            xaxis: {
                tickColor: '#333c42',
                tickDecimals: 0,
                font :{
                    lineHeight: 13,
                    style: "normal",
                    color: "#9f9f9f"
                },
                shadowSize: 0
            },

            legend:{
                container: '.flc-bar',
                backgroundOpacity: 0.5,
                noColumns: 0,
                backgroundColor: "white",
                lineWidth: 0
            }
        });
    }
    

    /*---------------------------------
        Tooltips for Flot Charts
     ---------------------------------*/
    if ($(".flot-chart")[0]) {
        $(".flot-chart").bind("plothover", function (event, pos, item) {
            if (item) {
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);
                $(".flot-tooltip").html(item.series.label + " of " + x + " = " + y).css({top: item.pageY+5, left: item.pageX+5}).show();
            }
            else {
                $(".flot-tooltip").hide();
            }
        });
        
        $("<div class='flot-tooltip' class='chart-tooltip'></div>").appendTo("body");
    }
});
$(document).ready(function(){

    /*-----------------------------------------
        Make some random data for the Chart
     -----------------------------------------*/
    var d1 = [];
    for (var i = 0; i <= 10; i += 1) {
        d1.push([i, parseInt(Math.random() * 30)]);
    }
    var d2 = [];
    for (var i = 0; i <= 20; i += 1) {
        d2.push([i, parseInt(Math.random() * 30)]);
    }
    var d3 = [];
    for (var i = 0; i <= 10; i += 1) {
        d3.push([i, parseInt(Math.random() * 30)]);
    }


    /*---------------------------------
        Chart Options
     ---------------------------------*/
    var options = {
        series: {
            shadowSize: 0,
            curvedLines: { //This is a third party plugin to make curved lines
                apply: true,
                active: true,
                monotonicFit: true
            },
            lines: {
                show: false,
                lineWidth: 0,
            },
        },
        grid: {
            borderWidth: 0,
            labelMargin:10,
            hoverable: true,
            clickable: true,
            mouseActiveRadius:6,

        },
        xaxis: {
            tickDecimals: 0,
            ticks: false
        },

        yaxis: {
            tickDecimals: 0,
            ticks: false
        },

        legend: {
            show: false
        }
    };


    /*---------------------------------
        Let's create the chart
     ---------------------------------*/
    if ($("#curved-line-chart")[0]) {
        $.plot($("#curved-line-chart"), [
            {data: d1, lines: { show: true, fill: 0.98 }, label: 'Product 1', stack: true, color: '#1f292f' },
            {data: d3, lines: { show: true, fill: 0.98 }, label: 'Product 2', stack: true, color: '#dbdddd' }
        ], options);
    }


    /*---------------------------------
        Tooltips for Flot Charts
     ---------------------------------*/
    if ($(".flot-chart")[0]) {
        $(".flot-chart").bind("plothover", function (event, pos, item) {
            if (item) {
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);
                $(".flot-tooltip").html(item.series.label + " of " + x + " = " + y).css({top: item.pageY+5, left: item.pageX+5}).show();
            }
            else {
                $(".flot-tooltip").hide();
            }
        });

        $("<div class='flot-tooltip' class='chart-tooltip'></div>").appendTo("body");
    }
});

$(document).ready(function(){

    /*---------------------------------
        Make some random data
     ---------------------------------*/
    var data = [];
    var totalPoints = 300;
    var updateInterval = 30;
    
    function getRandomData() {
        if (data.length > 0)
            data = data.slice(1);

        while (data.length < totalPoints) {
    
            var prev = data.length > 0 ? data[data.length - 1] : 50,
                y = prev + Math.random() * 10 - 5;
            if (y < 0) {
                y = 0;
            } else if (y > 90) {
                y = 90;
            }

            data.push(y);
        }

        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }

        return res;
    }


    /*---------------------------------
        Create Chart
     ---------------------------------*/
    if ($('#dynamic-chart')[0]) {
        var plot = $.plot("#dynamic-chart", [ getRandomData() ], {
            series: {
                label: "Server Process Data",
                lines: {
                    show: true,
                    lineWidth: 0.2,
                    fill: 0.6
                },
    
                color: '#fff',
                shadowSize: 0,
            },
            yaxis: {
                min: 0,
                max: 100,
                tickColor: '#333c42',
                font :{
                    lineHeight: 13,
                    style: "normal",
                    color: "#9f9f9f",
                },
                shadowSize: 0,
    
            },
            xaxis: {
                tickColor: '#333c42',
                show: true,
                font :{
                    lineHeight: 13,
                    style: "normal",
                    color: "#9f9f9f",
                },
                shadowSize: 0,
                min: 0,
                max: 250
            },
            grid: {
                borderWidth: 1,
                borderColor: '#333c42',
                labelMargin:10,
                hoverable: true,
                clickable: true,
                mouseActiveRadius:6,
            },
            legend:{
                container: '.flc-dynamic',
                backgroundOpacity: 0.5,
                noColumns: 0,
                backgroundColor: "white",
                lineWidth: 0
            }
        });



        /*---------------------------------
            Update
         ---------------------------------*/
        function update() {
            plot.setData([getRandomData()]);
            // Since the axes don't change, we don't need to call plot.setupGrid()

            plot.draw();
            setTimeout(update, updateInterval);
        }
        update();
    }
});
$(document).ready(function(){

    /*---------------------------------------------------
        Make some random data for Recent Items chart
    ---------------------------------------------------*/
    var data = [];
    var totalPoints = 100;

    function getRandomData() {
        if (data.length > 0)
            data = data.slice(1);

        while (data.length < totalPoints) {

            var prev = data.length > 0 ? data[data.length - 1] : 50,
                y = prev + Math.random() * 10 - 5;
            if (y < 0) {
                y = 0;
            } else if (y > 90) {
                y = 90;
            }

            data.push(y);
        }

        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }

        return res;
    }

    /*---------------------------------------------------
        Make some random data for Flot Line Chart
    ---------------------------------------------------*/
    var d1 = [];
    for (var i = 0; i <= 10; i += 1) {
        d1.push([i, parseInt(Math.random() * 30)]);
    }
    var d2 = [];
    for (var i = 0; i <= 20; i += 1) {
        d2.push([i, parseInt(Math.random() * 30)]);
    }
    var d3 = [];
    for (var i = 0; i <= 10; i += 1) {
        d3.push([i, parseInt(Math.random() * 30)]);
    }

    /*---------------------------------
        Chart Options
    ---------------------------------*/
    var options = {
        series: {
            shadowSize: 0,
            lines: {
                show: false,
                lineWidth: 0,
            },
        },
        grid: {
            borderWidth: 0,
            labelMargin:10,
            hoverable: true,
            clickable: true,
            mouseActiveRadius:6,

        },
        xaxis: {
            tickDecimals: 0,
            ticks: false
        },

        yaxis: {
            tickDecimals: 0,
            ticks: false
        },

        legend: {
            show: false
        }
    };


    /*---------------------------------
        Regular Line Chart
    ---------------------------------*/
    if ($("#line-chart")[0]) {
        $.plot($("#line-chart"), [
            {data: d1, lines: { show: true, fill: 0.98 }, label: 'Product 1', stack: true, color: '#1f292f' },
            {data: d3, lines: { show: true, fill: 0.98 }, label: 'Product 2', stack: true, color: '#dbdddd' }
        ], options);
    }


    /*---------------------------------
        Recent Items Table Chart
    ---------------------------------*/
    if ($("#recent-items-chart")[0]) {
        $.plot($("#recent-items-chart"), [
            {data: getRandomData(), lines: { show: true, fill: 0.1 }, label: 'Items', stack: true, color: '#dbdddd' },
        ], options);
    }


    /*---------------------------------
        Tooltips for Flot Charts
    ---------------------------------*/
    if ($(".flot-chart")[0]) {
        $(".flot-chart").bind("plothover", function (event, pos, item) {
            if (item) {
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);
                $(".flot-tooltip").html(item.series.label + " of " + x + " = " + y).css({top: item.pageY+5, left: item.pageX+5}).show();
            }
            else {
                $(".flot-tooltip").hide();
            }
        });

        $("<div class='flot-tooltip' class='chart-tooltip'></div>").appendTo("body");
    }
});

$(document).ready(function(){
    var pieData = [
        {data: 1, color: '#dbdddd', label: 'Toyota'},
        {data: 2, color: '#636c72', label: 'Nissan'},
        {data: 3, color: '#3e4a51', label: 'Hyundai'},
        {data: 4, color: '#1f292f', label: 'Scion'},
        {data: 4, color: '#ffffff', label: 'Daihatsu'},
    ]


    /*---------------------------------
        Pie Chart
    ---------------------------------*/
    if($('#pie-chart')[0]){
        $.plot('#pie-chart', pieData, {
            series: {
                pie: {
                    show: true,
                    stroke: {
                        width: 0,
                    },
                },
            },
            legend: {
                container: '.flc-pie',
                backgroundOpacity: 0.5,
                noColumns: 0,
                backgroundColor: "white",
                lineWidth: 0
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false,
                cssClass: 'flot-tooltip'
            }

        });
    }


    /*---------------------------------
        Donut Chart
    ---------------------------------*/
    if($('#donut-chart')[0]){
        $.plot('#donut-chart', pieData, {
            series: {
                pie: {
                    innerRadius: 0.5,
                    show: true,
                    stroke: {
                        width: 0,
                        color: '#2b343a'
                    },
                },
            },
            legend: {
                container: '.flc-donut',
                backgroundOpacity: 0.5,
                noColumns: 0,
                backgroundColor: "white",
                lineWidth: 0
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false,
                cssClass: 'flot-tooltip'
            }
        });
    }
});

/*----------------------------------------------------------
    Detect Mobile Browser
-----------------------------------------------------------*/
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
   $('html').addClass('ismobile');
}

$(window).load(function () {
    /*-----------------------------------------------------------
        Page Loader
     -----------------------------------------------------------*/
    if($('.page-loader')[0]) {
        setTimeout (function () {
            $('.page-loader').fadeOut();
        }, 500);

    }
})

$(document).ready(function(){

    /*----------------------------------------------------------
        Scrollbar
    -----------------------------------------------------------*/
    function scrollBar(selector, theme, mousewheelaxis) {
        $(selector).mCustomScrollbar({
            theme: theme,
            scrollInertia: 100,
            axis:'mousewheelaxis',
            mouseWheel: {
                enable: true,
                axis: mousewheelaxis,
                preventDefault: true
            }
        });
    }

    if (!$('html').hasClass('ismobile')) {
        //On Custom Class
        if ($('.c-overflow')[0]) {
            scrollBar('.c-overflow', 'minimal-dark', 'y');
        }
    }

    /*----------------------------------------------------------
        Dropdown Menu
    -----------------------------------------------------------*/
    if($('.dropdown')[0]) {
  	   //Propagate
    	$('body').on('click', '.dropdown.open .dropdown-menu', function(e){
    	    e.stopPropagation();
    	});

    	$('.dropdown').on('shown.bs.dropdown', function (e) {
    	    if($(this).attr('data-animation')) {
        		$animArray = [];
        		$animation = $(this).data('animation');
        		$animArray = $animation.split(',');
        		$animationIn = 'animated '+$animArray[0];
        		$animationOut = 'animated '+ $animArray[1];
        		$animationDuration = ''
        		if(!$animArray[2]) {
        		    $animationDuration = 500; //if duration is not defined, default is set to 500ms
        		}
        		else {
        		    $animationDuration = $animArray[2];
        		}

        		$(this).find('.dropdown-menu').removeClass($animationOut)
        		$(this).find('.dropdown-menu').addClass($animationIn);
    	    }
    	});

	     $('.dropdown').on('hide.bs.dropdown', function (e) {
    	    if($(this).attr('data-animation')) {
        		e.preventDefault();
        		$this = $(this);
        		$dropdownMenu = $this.find('.dropdown-menu');

        		$dropdownMenu.addClass($animationOut);
        		setTimeout(function(){
        		    $this.removeClass('open')

        		}, $animationDuration);
        	}
        });
      }


    /*----------------------------------------------------------
        Calendar Widget
    -----------------------------------------------------------*/
    if($('#calendar-widget')[0]) {
        (function(){
            $('#calendar-widget #cw-body').fullCalendar({
		        contentHeight: 'auto',
		        theme: true,
                header: {
                    right: '',
                    center: 'prev, title, next',
                    left: ''
                },
                defaultDate: '2014-06-12',
                editable: true,
                events: [
                    {
                        title: 'All Day',
                        start: '2014-06-01',
                    },
                    {
                        title: 'Long Event',
                        start: '2014-06-07',
                        end: '2014-06-10',
                    },
                    {
                        id: 999,
                        title: 'Repeat',
                        start: '2014-06-09',
                    },
                    {
                        id: 999,
                        title: 'Repeat',
                        start: '2014-06-16',
                    },
                    {
                        title: 'Meet',
                        start: '2014-06-12',
                        end: '2014-06-12',
                    },
                    {
                        title: 'Lunch',
                        start: '2014-06-12',
                    },
                    {
                        title: 'Birthday',
                        start: '2014-06-13',
                    },
                    {
                        title: 'Google',
                        url: 'http://google.com/',
                        start: '2014-06-28',
                    }
                ]
            });

            //Display Current Date as Calendar widget header
            var mYear = moment().format('YYYY');
            var mDay = moment().format('dddd, MMM D');
            $('#calendar-widget .cwh-year').html(mYear);
            $('#calendar-widget .cwh-day').html(mDay);
        })();
    }


    /*----------------------------------------------------------
        Weather Widget
    -----------------------------------------------------------*/
    if ($('#weather-widget')[0]) {
        $.simpleWeather({
            location: 'Austin, TX',
            woeid: '',
            unit: 'f',
            success: function(weather) {
                html = '<div class="weather-status">'+weather.temp+'&deg;'+weather.units.temp+'</div>';
                html += '<ul class="weather-info"><li>'+weather.city+', '+weather.region+'</li>';
                html += '<li class="currently">'+weather.currently+'</li></ul>';
                html += '<div class="weather-icon wi-'+weather.code+'"></div>';
                html += '<div class="dw-footer"><div class="weather-list tomorrow">';
                html += '<span class="weather-list-icon wi-'+weather.forecast[2].code+'"></span><span>'+weather.forecast[1].high+'/'+weather.forecast[1].low+'</span><span>'+weather.forecast[1].text+'</span>';
                html += '</div>';
                html += '<div class="weather-list after-tomorrow">';
                html += '<span class="weather-list-icon wi-'+weather.forecast[2].code+'"></span><span>'+weather.forecast[2].high+'/'+weather.forecast[2].low+'</span><span>'+weather.forecast[2].text+'</span>';
                html += '</div></div>';
                $("#weather-widget").html(html);
            },
            error: function(error) {
                $("#weather-widget").html('<p>'+error+'</p>');
            }
        });
    }


    /*----------------------------------------------------------
         Auto Size Textare
    -----------------------------------------------------------*/
    if ($('.auto-size')[0]) {
	     autosize($('.auto-size'));
    }


    /*----------------------------------------------------------
        Text Field
    -----------------------------------------------------------*/
    //Add blue animated border and remove with condition when focus and blur
    if($('.fg-line')[0]) {
        $('body').on('focus', '.fg-line .form-control', function(){
            $(this).closest('.fg-line').addClass('fg-toggled');
        })

        $('body').on('blur', '.form-control', function(){
            var p = $(this).closest('.form-group, .input-group');
            var i = p.find('.form-control').val();

            if (p.hasClass('fg-float')) {
                if (i.length == 0) {
                    $(this).closest('.fg-line').removeClass('fg-toggled');
                }
            }
            else {
                $(this).closest('.fg-line').removeClass('fg-toggled');
            }
        });
    }

    //Add blue border for pre-valued fg-flot text feilds
    if($('.fg-float')[0]) {
        $('.fg-float .form-control').each(function(){
            var i = $(this).val();

            if (!i.length == 0) {
                $(this).closest('.fg-line').addClass('fg-toggled');
            }

        });
    }


    /*----------------------------------------------------------
        Audio and Video Player
    -----------------------------------------------------------*/
    if($('audio, video')[0]) {
        $('video,audio').mediaelementplayer();
    }


    /*----------------------------------------------------------
        Chosen
    -----------------------------------------------------------*/
    if($('.chosen')[0]) {
        $('.chosen').chosen({
            width: '100%',
            allow_single_deselect: true
        });
    }


    /*----------------------------------------------------------
        NoUiSlider (Input Slider)
    -----------------------------------------------------------*/
    //Basic
    if ($('#input-slider')[0]) {
        var slider = document.getElementById ('input-slider');

        noUiSlider.create (slider, {
            start: [20],
            connect: 'lower',
            range: {
                'min': 0,
                'max': 100
            }
        });
    }

    //Range
    if ($('#input-slider-range')[0]) {
        var sliderRange = document.getElementById ('input-slider-range');

        noUiSlider.create (sliderRange, {
            start: [40, 70],
            connect: true,
            range: {
                'min': 0,
                'max': 100
            }
        });
    }

    //Range with value
    if($('#input-slider-value')[0]) {
        var sliderRangeValue = document.getElementById('input-slider-value');

        noUiSlider.create(sliderRangeValue, {
            start: [10, 50],
            connect: true,
            range: {
                'min': 0,
                'max': 100
            }
        });

        sliderRangeValue.noUiSlider.on('update', function( values, handle ) {
            document.getElementById('input-slider-value-output').innerHTML = values[handle];
        });
    }


    /*----------------------------------------------------------
        Input Mask
    -----------------------------------------------------------*/
    if ($('input-mask')[0]) {
        $('.input-mask').mask();
    }


    /*----------------------------------------------------------
        Farbtastic Color Picker
    -----------------------------------------------------------*/
    if ($('.color-picker')[0]) {
	    $('.color-picker').each(function(){
            var colorOutput = $(this).closest('.cp-container').find('.cp-value');
            $(this).farbtastic(colorOutput);
        });
    }


    /*-----------------------------------------------------------
        Summernote HTML Editor
    -----------------------------------------------------------*/
    if ($('.html-editor')[0]) {
	   $('.html-editor').summernote({
            height: 150
        });
    }

    if($('.html-editor-click')[0]) {
        //Edit
        $('body').on('click', '.hec-button', function(){
            $('.html-editor-click').summernote({
                focus: true
            });
            $('.hec-save').show();
        })

        //Save
        $('body').on('click', '.hec-save', function(){
            $('.html-editor-click').code();
            $('.html-editor-click').destroy();
            $('.hec-save').hide();
        });
    }

    //Air Mode
    if($('.html-editor-airmod')[0]) {
        $('.html-editor-airmod').summernote({
            airMode: true
        });
    }


    /*-----------------------------------------------------------
        Date Time Picker
    -----------------------------------------------------------*/
    //Date Time Picker
    if ($('.date-time-picker')[0]) {
	   $('.date-time-picker').datetimepicker();
    }

    //Time
    if ($('.time-picker')[0]) {
    	$('.time-picker').datetimepicker({
    	    format: 'LT'
    	});
    }

    //Date
    if ($('.date-picker')[0]) {
    	$('.date-picker').datetimepicker({
    	    format: 'DD/MM/YYYY'
    	});
    }

    $('.date-picker').on('dp.hide', function(){
        $(this).closest('.dtp-container').removeClass('fg-toggled');
        $(this).blur();
    })


    /*-----------------------------------------------------------
        Form Wizard
    -----------------------------------------------------------*/
    if ($('.form-wizard-basic')[0]) {
    	$('.form-wizard-basic').bootstrapWizard({
    	    tabClass: 'fw-nav',
            'nextSelector': '.next',
            'previousSelector': '.previous'
    	});
    }


    /*-----------------------------------------------------------
        Waves
    -----------------------------------------------------------*/
    (function(){
         Waves.attach('.btn:not(.btn-icon):not(.btn-float)');
         Waves.attach('.btn-icon, .btn-float', ['waves-circle', 'waves-float']);
        Waves.init();
    })();


    /*----------------------------------------------------------
        Lightbox
    -----------------------------------------------------------*/
    if ($('.lightbox')[0]) {
        $('.lightbox').lightGallery({
            enableTouch: true
        });
    }


    /*-----------------------------------------------------------
        Link prevent
    -----------------------------------------------------------*/
    $('body').on('click', '.a-prevent', function(e){
        e.preventDefault();
    });


    /*----------------------------------------------------------
        Bootstrap Accordion Fix
    -----------------------------------------------------------*/
    if ($('.collapse')[0]) {

        //Add active class for opened items
        $('.collapse').on('show.bs.collapse', function (e) {
            $(this).closest('.panel').find('.panel-heading').addClass('active');
        });

        $('.collapse').on('hide.bs.collapse', function (e) {
            $(this).closest('.panel').find('.panel-heading').removeClass('active');
        });

        //Add active class for pre opened items
        $('.collapse.in').each(function(){
            $(this).closest('.panel').find('.panel-heading').addClass('active');
        });
    }


    /*-----------------------------------------------------------
        Tooltips
    -----------------------------------------------------------*/
    if ($('[data-toggle="tooltip"]')[0]) {
        $('[data-toggle="tooltip"]').tooltip();
    }


    /*-----------------------------------------------------------
        Popover
    -----------------------------------------------------------*/
    if ($('[data-toggle="popover"]')[0]) {
        $('[data-toggle="popover"]').popover();
    }


    /*-----------------------------------------------------------
        IE 9 Placeholder
    -----------------------------------------------------------*/
    if($('html').hasClass('ie9')) {
        $('input, textarea').placeholder({
            customClass: 'ie9-placeholder'
        });
    }


    /*-----------------------------------------------------------
        Typeahead Auto Complete
    -----------------------------------------------------------*/
     if($('.typeahead')[0]) {

          var statesArray = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
            'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
            'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
            'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
            'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
            'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
            'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
            'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
            'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
          ];
        var states = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: statesArray
        });

        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
          name: 'states',
          source: states
        });
    }

    /*-----------------------------------------------------------
        Dropzone Uploader
    -----------------------------------------------------------*/
    if($('.dropzone')[0]) {
        Dropzone.autoDiscover = false;
        $('#dropzone-upload').dropzone({
            url: "/file/post",
            addRemoveLinks: true

        });
    }


    console.log('--- End app process ---');
});
