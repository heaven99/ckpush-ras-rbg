$(document).ready(function () {
    console.log('--- Start mapbox-data process ---');

    //
    // // TODO : mag 값을 1.0 으로 처리할 것.
    // var userPositionData = {
    //     "type": "FeatureCollection",
    //     "crs": {
    //         "type": "name",
    //         "properties": {
    //             "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    //         }
    //     },
    //     "features": [
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994521",
    //                 "mag": 1.0,
    //                 "time": 1507425650893,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.15, 37.4, 0.0]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994521-2",
    //                 "mag": 1.0,
    //                 "time": 1507425650893,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.151, 37.4, 0.0]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994519",
    //                 "mag": 1.0,
    //                 "time": 1507425289659,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.16, 37.4, 105.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994517",
    //                 "mag": 1.0,
    //                 "time": 1507424832518,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.17, 37.4, 0.0]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ci38021336",
    //                 "mag": 1.0,
    //                 "time": 1507423898710,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.18, 37.4, 7.64]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "us2000b2nn",
    //                 "mag": 1.0,
    //                 "time": 1507422626990,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.19, 37.4, 46.41]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994510",
    //                 "mag": 1.0,
    //                 "time": 1507422449194,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.20, 37.4, 0.0]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "us2000b2nb",
    //                 "mag": 1.0,
    //                 "time": 1507420784440,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.14, 37.4, 614.26]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.14, 37.397, 7.5]
    //             }
    //         },
    //         //sample pangyo user position
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.13, 37.389, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.10, 37.37, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.09, 37.4, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.06, 37.356, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.055, 37.3598, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.067, 37.367, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.067, 37.38, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.07, 37.399, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.089, 37.42, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [127.04, 37.404, 7.5]
    //             }
    //         },
    //         //sample ehwa.univ user position
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.950136, 37.564529, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.92, 37.566, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.950, 37.554, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.950, 37.554, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.997, 37.584, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.997, 37.584, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.981, 37.577, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.977, 37.564, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.940, 37.577, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.948, 37.569, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.955, 37.5709, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.964, 37.564, 7.5]
    //             }
    //         },
    //         {
    //             "type": "Feature",
    //             "properties": {
    //                 "id": "ak16994298",
    //                 "mag": 1.0,
    //                 "time": 1507419370097,
    //                 "felt": null,
    //                 "tsunami": 0
    //             },
    //             "geometry": {
    //                 "type": "Point",
    //                 "coordinates": [126.9612, 37.555, 7.5]
    //             }
    //         },
    //
    //     ]
    // };


// mag 값을 1,0 ~4.0 까지 처리할 것
    var snsRiskData = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994521",
                    "rtype" : "폭우",
                    "mag": 1.0,
                    "time": 1507425650893,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.15, 37.41, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994521-2",
                    "mag": 2.0,
                    "time": 1507425650893,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.151, 37.41, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994519",
                    "mag": 3.0,
                    "time": 1507425289659,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.16, 37.41, 105.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994517",
                    "mag": 4.0,
                    "time": 1507424832518,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.17, 37.41, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ci38021336",
                    "mag": 2.5,
                    "time": 1507423898710,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.18, 37.41, 7.64]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nn",
                    "mag": 1.5,
                    "time": 1507422626990,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.19, 37.41, 46.41]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994510",
                    "mag": 3.5,
                    "time": 1507422449194,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.20, 37.41, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 1.5,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.14, 37.41, 614.26]
                }
            },
            //sample data pangyo snsriskdata
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 3.3,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.091, 37.421, 614.26]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 1.5,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1297, 37.3878, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 2.5,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.094, 37.398, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 4.0,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.06333, 37.382, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 3.8,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.04, 37.40, 7.5]
                }
            },
            //sample data ehwa.univ snsriskdata
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 2.3,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.9599, 37.561, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 1.9,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.951, 37.554, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 3.3,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.942, 37.5799, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 2.4,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.918, 37.564, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 1.5,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.978, 37.5663, 7.5]
                }
            },
        ]
    };


    window.sharedData = {};
    // window.sharedData.userPositionData = userPositionData;
    window.sharedData.snsRiskData = snsRiskData;

    console.log('--- End mapbox-data process ---');

//////////////////////////////////////////////////////////////////////////////////////////////////
//     var risk_element = {
//         "type": "Feature",
//         "properties": {
//             "id": "ak16994521",
//             "rtype" : "폭우",
//             "mag": 4.0,
//             "time": 1507425650893,
//             "felt": null,
//             "tsunami": 0
//         },
//         "geometry": {
//             "type": "Point",
//             "coordinates": [127.15, 37.4, 0.0]
//         }
//     };
//
//
//
//     var riskData = {
//         "type": "FeatureCollection",
//         "crs": {
//             "type": "name",
//             "properties": {
//                 "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
//             }
//         },
//         "features": []
//     };
//
//     $.ajax({
//         url : '/rbg/api/algo/list',
//         method : 'GET',
//         dataType : 'json'
//     }).done(function (json) {
//         // console.log('result=', json);
//         console.log('ajax success');
//
//         var data = json.data;
//
//
//         // TEST
//         data[0][0] = 127.15;
//         data[0][1] = 37.41;
//         for (var i = 0; i < data.length - 1; i++) {
//             riskData.features[i] = {
//                 "type": "Feature",
//                 "properties": {
//                     "id": "ak" + i,
//                     "rtype" : "폭우",
//                     "mag": 4.0,
//                     "time": 1507425650893,
//                     "felt": null,
//                     "tsunami": 0
//                 },
//                 "geometry": {
//                     "type": "Point",
//                     //"coordinates": [127.15, 37.41, 0.0]
//                     "coordinates": [parseFloat(data[i][0]), parseFloat(data[i][1]), 0.0]
//                 }
//             };
//         }
//
//         window.sharedData.riskData = riskData;
//
//         // TODO
//         window.map.addSource('risk-data', {
//             "type": "geojson",
//             "data": window.sharedData.riskData            // set variable (Network 로 변경할 것)
//         });
//
//
//
//     }).fail(function (xhr, stauts, error) {
//         console.log('--- error ajx');
//     });

});