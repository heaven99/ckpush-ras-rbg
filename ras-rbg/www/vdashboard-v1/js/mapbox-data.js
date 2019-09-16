$(document).ready(function () {
    console.log('--- Start mapbox-data process ---');


    // TODO : mag 값을 1.0 으로 처리할 것.
    var userPositionData = {
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
                    "mag": 1.0,
                    "time": 1507425650893,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.15, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994521-2",
                    "mag": 1.0,
                    "time": 1507425650893,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.151, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994519",
                    "mag": 1.0,
                    "time": 1507425289659,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.16, 37.4, 105.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994517",
                    "mag": 1.0,
                    "time": 1507424832518,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.17, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ci38021336",
                    "mag": 1.0,
                    "time": 1507423898710,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.18, 37.4, 7.64]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nn",
                    "mag": 1.0,
                    "time": 1507422626990,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.19, 37.4, 46.41]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994510",
                    "mag": 1.0,
                    "time": 1507422449194,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.20, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 1.0,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.14, 37.4, 614.26]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.14, 37.397, 7.5]
                }
            },
            //sample pangyo user position
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.13, 37.389, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.10, 37.37, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.09, 37.4, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.06, 37.356, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.055, 37.3598, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.067, 37.367, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.067, 37.38, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.07, 37.399, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.089, 37.42, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.04, 37.404, 7.5]
                }
            },
            //sample ehwa.univ user position
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.950136, 37.564529, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.92, 37.566, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.950, 37.554, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.950, 37.554, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.997, 37.584, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.997, 37.584, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.981, 37.577, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.977, 37.564, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.940, 37.577, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.948, 37.569, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.955, 37.5709, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.964, 37.564, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 1.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.9612, 37.555, 7.5]
                }
            },

        ]
    };


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





// TODO : 아래 데이터를 외부의 데이터로 수정한다.
//////////////////////////////////////////////////////////////////////////////////////////////////
    var riskData = {
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
                    "mag": 1.5,
                    "time": 1507425650893,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.15, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994521-2",
                    "mag": 1.5,
                    "time": 1507425650893,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.151, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994519",
                    "mag": 2.0,
                    "time": 1507425289659,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.16, 37.4, 105.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994517",
                    "mag": 3.0,
                    "time": 1507424832518,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.17, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ci38021336",
                    "mag": 4.0,
                    "time": 1507423898710,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.18, 37.4, 7.64]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nn",
                    "mag": 5.0,
                    "time": 1507422626990,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.19, 37.4, 46.41]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994510",
                    "mag": 6.0,
                    "time": 1507422449194,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.20, 37.4, 0.0]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "us2000b2nb",
                    "mag": 7.0,
                    "time": 1507420784440,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.14, 37.4, 614.26]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298",
                    "mag": 8.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.14, 37.397, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 9.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.14, 37.395, 7.5]
                }
            },
            //------------------------------------------------------sample data---------------------------------------
            //#1
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.10, 37.409, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1012, 37.409, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.098, 37.39, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.098, 37.407, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.097, 37.35, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.8,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0967, 37.40, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.09878, 37.405, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.09874, 37.403, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.09877, 37.401, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.09879, 37.406, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.098789, 37.4048, 7.5]
                }
            },
            ////////////////////////////////////
            //#11
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.8,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.098786, 37.4044, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.100029, 37.404139, 7.5]
                }
            },
            //CKSTACK
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 7.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.100039, 37.404101, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 1.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.081220, 37.404134, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.06123, 37.4123, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0456, 37.4798, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.01357, 37.41357, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.112233, 37.445566, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1256, 37.428, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.11, 37.438, 7.5]
                }
            },
            //#21
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.041536, 37.415017, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.041522, 37.41599, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.077389, 37.394840, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 1.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.979988, 37.400815, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 1.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.979996, 37.400804, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.066434, 37.425282, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.066411, 37.425266, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.066413, 37.425268, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0654, 37.4270, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0650, 37.4360, 7.5]
                }
            },
            //#31
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.066445, 37.425503, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.8,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.066442, 37.425502, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.06540, 37.42380, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.072945, 37.399396, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.072944, 37.399388, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.3,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.272941, 37.399394, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.059922, 37.409649, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.059924, 37.409650, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.045107, 37.383014, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.045111, 37.383017, 7.5]
                }
            },
            //#41
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.7,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0452, 37.3834, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.046, 37.385, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0413, 37.4578, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 6.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.042, 37.46, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.077718, 37.387681, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.07773, 37.389, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.7,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.079, 37.38769, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.092247, 37.371123, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.093, 37.372, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.091, 37.4912, 7.5]
                }
            },
            //#51
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.087115, 37.412322, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.087117, 37.41233, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.4,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.087116, 37.41244, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.4,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.113660, 37.397135, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.113666, 37.397140, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1138, 37.399, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 6.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.114, 37.391, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.12, 37.391, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.12, 37.4, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.124, 37.33, 7.5]
                }
            },
            //#61
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.082683, 37.381960, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.8,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0827, 37.382, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.083, 37.383, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0821, 37.3817, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0820, 37.381870, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.0829, 37.3810, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.108213, 37.366107, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1083, 37.367, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1089, 37.37, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [127.1088, 37.361, 7.5]
                }
            },
            //#71
            //��ȭ���� ��ó ����
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 7.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.950136, 37.564529, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.952, 37.566, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.5,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.949, 37.567, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.95368, 37.5615, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 1.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.93, 37.55, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.94123, 37.5678, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.9555, 37.59159, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.951, 37.565, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.8,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.958, 37.566, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.96, 37.561, 7.5]
                }
            },
            //#81
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.942973, 37.561073, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.93, 37.54, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.6,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.943, 37.563, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.9428, 37.5613, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.946575, 37.556163, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.941, 37.551, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 2.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.945, 37.558, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.945, 37.558, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.945, 37.560, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.2,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.948, 37.557, 7.5]
                }
            },
            //���� ����
            //#91
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.9420, 37.563, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 5.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.649264, 37.396416, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 4.4,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.440664, 37.460421, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.4,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.686979, 37.473435, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.743331, 37.496245, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.1,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.628723, 37.466230, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 3.9,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.629, 37.467, 7.5]
                }
            },
            //į�����
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 7.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [104.919704, 11.555736, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 7.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [103.867275, 13.412741, 7.5]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "ak16994298-2",
                    "mag": 7.0,
                    "time": 1507419370097,
                    "felt": null,
                    "tsunami": 0
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [104.844444, 11.553006, 7.5]
                }
            }
        ]
    };


    window.sharedData = {};
    window.sharedData.userPositionData = userPositionData;
    window.sharedData.snsRiskData = snsRiskData;
    window.sharedData.riskData = riskData;
});