var mapFacilito = null;
var geocoder = null;
var markers = [];
var infoWindow = null;
var miUbicacion = null;

var isFound = true;
var isFirst = true;

var tCity = null;
var tState = null;
var tAgency = null;

var isCity = false;
var isState = false;
var isAgency = false;

var miProvincia = null;
var miCiudad = null;

var globalCenter = null;
var mkrMyLocation = null;

var isClicked = false;
var isChanged = false;

var sectores = null;

var intZoomPais = 7;
var intZoomProv = 9;
var intZoomCiud = 12;
var strPath = '';

var latEnviada = false;
var lonEnviada = false;

/**Obtiene la latitud enviada por parametro query */
function getLat() {
    const defaultLat = -2.1709979

    try {
        var lat = new URL(document.URL).searchParams.get('lat')
        console.log('latitud', lat)

        if (lat === null || lat === undefined || isNaN(lat))
            return defaultLat;

        latEnviada = true;
        return Number(lat);
    } catch (e) {
        return defaultLat;
    }
}

/**Obtiene la longitud enviada por parametro query */
function getLon() {
    const defaultLat = -79.92235920000002

    try {
        var lat = new URL(document.URL).searchParams.get('lon')
        console.log('longitud', lat)

        if (lat === null || lat === undefined || isNaN(lat))
            return defaultLat;

        lonEnviada = true;
        return Number(lat);
    } catch (e) {
        return defaultLat;
    }
}

function initMap() {
    geocoder = new google.maps.Geocoder;

    globalCenter = {
        lat: getLat(),
        lng: getLon()//-79.92235920000002
    }
    mapFacilito = new google.maps.Map(document.getElementById('mapFacilito'),
        {
            center:
            {
                lat: getLat(),
                lng: getLon()//-79.92235920000002
            },
            zoom: 7,
            gestureHandling: 'greedy',
            mapTypeControl: true,
            mapTypeControlOptions:
            {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            zoomControl: true,
            zoomControlOptions:
            {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions:
            {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            }
        });

    infoWindow = new google.maps.InfoWindow(
        {
            map: mapFacilito
        });

    //var trafficLayer = new google.maps.TrafficLayer();
    //trafficLayer.setMap(mapFacilito);

    //var ctaLayer = new google.maps.KmlLayer({
    //    //url: 'http://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml',
    //    url: 'http://localhost:51720/public/fronteras/test.kml',
    //    //url: 'public/fronteras/provincias.kml',
    //    //url: 'http://localhost:51720/public/fronteras/provincias.kml',
    //    map: mapFacilito
    //});

    google.maps.event.addListener(mapFacilito, 'click', function () {
        infoWindow.close();
    });

    if (latEnviada && lonEnviada) {
        autoCentrarMarcador();
    }
}


$(function () {


    //history.pushState(null, "", ".");
    $("#cmbProvincia").append("<option class='' value='0'>- PROVINCIA -</option>");
    $("#cmbCiudad").append("<option class='' provincia='' value=''>- CIUDAD -</option>");
    $("#cmbAgencia").append("<option class='' value=''>- AGENCIA -</option>");
    $("#cmbSector").append("<option class='' value=''>- SECTOR -</option>");

    $('#cmbProvincia').selectpicker({ liveSearch: true });
    $('#cmbCiudad').selectpicker({ liveSearch: true });
    $('#cmbAgencia').selectpicker({ liveSearch: true });
    $('#cmbSector').selectpicker({ liveSearch: true });

    getMyCity();
    getSector();



    $("#btnCloseMo").on("click", function () {
        $(".modal").modal("hide");
    });

    $("#btnRestart").click(function () {
        goCiudad();

    });

    $("#cmbAgencia").change(function () {
        isChanged = true;
        var this_ = this;

        try {
            var found = markers.find(function (el, idx) {
                return el.id == $(this_).val();
            });

            if (!isClicked) {
                new google.maps.event.trigger(found, 'click');
            }

            isClicked = false;

            if (this.value !== '') {
                var position = $.parseJSON(this.value);

                mapFacilito.setCenter(position);

                autoCentrarMarcador();
            }
            else {
                goCiudad();
            }

            $('#cmbAgencia').selectpicker('refresh');
        }
        catch (e) {
            console.log(e);
        }
    });

});
$("#btnUbicarme").on("click", function () {

    ubicarme();

});

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    //infoWindow.setPosition(pos);
    //infoWindow.setContent(browserHasGeolocation ? 'The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    console.log(browserHasGeolocation ? 'The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
}


function autoCentrarMarcador() {
    var intZoomFac = mapFacilito.getZoom();

    if (intZoomFac < 13) {
        mapFacilito.setZoom(13);
        setTimeout(function () {
            mapFacilito.setZoom(16);
        }, 200);
    }
    else if (intZoomFac > 19) {
        mapFacilito.setZoom(19);
        setTimeout(function () {
            mapFacilito.setZoom(16);
        }, 200);
    }
    else {
        mapFacilito.setZoom(16);
    }
}


function goCiudad() {
    var strCiudad = "";
    var strProvincia = "";

    var intProvinciaIdx = $('#cmbProvincia').prop('selectedIndex');
    var intCiudadIdx = $('#cmbCiudad').prop('selectedIndex');

    if (intProvinciaIdx > 0) {
        strProvincia = $('#cmbProvincia option:selected').text();
    }

    if (intCiudadIdx > 0) {
        strCiudad = $('#cmbCiudad option:selected').text();
    }
    var strIDProvincia = $('#cmbProvincia').val();
    var strIDCiudad = $('#cmbCiudad').val();
    var strIDAgencia = $('#cmbAgencia').val();

    if (strIDProvincia === '' && strIDCiudad === '') // PAIS
    {
        mapFacilito.setZoom(intZoomPais);
    }
    else if (strIDProvincia === '' && strIDCiudad !== '') //  CIUDAD
    {
        mapFacilito.setZoom(intZoomCiud);
    }
    else if (strIDProvincia !== '' && strIDCiudad !== '') // CIUDAD
    {
        mapFacilito.setZoom(intZoomCiud);
    }
    else if (strIDProvincia !== '' && strIDCiudad === '') // PROVINCIA
    {
        mapFacilito.setZoom(intZoomProv);
        setTimeout(function () {
            mapFacilito.setZoom(intZoomProv + 1);
        }, 450);
    }
    else {
        mapFacilito.setZoom(7);
    }

    geocodeAddress(strCiudad, strProvincia);
}


function geocodeAddress(strCiudad, strProvincia) {
    var strAddress = (strCiudad !== "" ? (strCiudad + ', ') : strProvincia) + (strProvincia !== "" ? (strProvincia + ', ') : "") + 'ECUADOR';

    strAddress = 'ECUADOR' + (strProvincia !== "" ? (', ' + strProvincia) : (strCiudad !== "" ? (', ' + strCiudad) : ""))
        + (strCiudad !== "" ? (', ' + strCiudad) : "");

    console.log(strAddress);

    geocoder.geocode(
        {
            'address': strAddress.toLowerCase(),
        },
        function (results, status) {
            if (status === 'OK') {
                var objGeoLocation = results[0].geometry.location;

                var objLocation = {
                    lat: objGeoLocation.lat(),
                    lng: objGeoLocation.lng()
                };

                mapFacilito.setCenter(objLocation);

                var marker = new google.maps.Marker(
                    {
                        map: mapFacilito,
                        position: objLocation,
                        title: strCiudad
                    });

                markers.push(marker);

                if ($("#cmbCiudad").val() !== '') {
                    getAgencias(4, $("#cmbCiudad").val());
                }
                else {
                    getAgencias(3, $("#cmbProvincia").val());
                }
            }
            else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
}


function getProvincias() {
    isState = false;
    var objApiRest = new goRestPOST("Index.aspx/ObtenerProvincias", new Object());

    objApiRest.extractData(function (_resultContent, status) {
        if (status === 200) {
            $("#cmbProvincia").html(null);
            $("#cmbProvincia").append("<option class='' value='0'>- PROVINCIA -</option>");

            var resp = $.parseJSON(_resultContent.d);

            if (resp.Datos !== null && resp.Datos !== '') {
                ciudades = resp.Datos.Table;

                $.each(ciudades, function (_key, _value) {
                    $("#cmbProvincia").append("<option class='' value='" + this.IDProvincia + "'>" + this.Provincia + "</option>");
                });

                //$('#cmbProvincia').selectpicker({ liveSearch: true });
                $('#cmbProvincia').selectpicker('refresh');
                isState = true;
            }
        }
        else {
            console.log(_resultContent.message);
        }
    });
}
function getSector() {
    isState = false;
    var objApiRest = new goRestPOST("Index.aspx/ObtenerSector", new Object());

    objApiRest.extractData(function (_resultContent, status) {
        if (status === 200) {
            $("#cmbSector").html(null);
            $("#cmbSector").append("<option class='' value=''>- SECTOR -</option>");

            var resp = $.parseJSON(_resultContent.d);

            if (resp.Datos !== null && resp.Datos !== '') {
                sectores = resp.Datos.Table;

                $.each(sectores, function (_key, _value) {

                    $("#cmbSector").append("<option class='' value='" + this.IDSector + "'>" + this.Sector + "</option>");

                });


                $('#cmbSector').selectpicker('refresh');
                isState = true;
            }
        }
        else {
            console.log(_resultContent.message);
        }
    });
}

function getCiudades(strIdState) {
    var objState = new Object();
    objState.strIdState = strIdState;

    isCity = false;
    var objApiRest = new goRestPOST("Index.aspx/ObtenerCiudades", objState);

    objApiRest.extractData(function (_resultContent, status) {
        if (status === 200) {
            $("#cmbCiudad").html(null);
            $("#cmbCiudad").append("<option class='' provincia='' value=''>- CIUDAD -</option>");

            var resp = $.parseJSON(_resultContent.d);
            if (resp.Datos !== null && resp.Datos !== '') {
                lstCiudades = resp.Datos.Table;

                $.each(lstCiudades, function (_key, _value) {
                });

                if ($.isArray(lstCiudades)) {
                    $.each(lstCiudades, function (_key, _value) {
                        $("#cmbCiudad").append("<option class='' provincia='" + this.Provincia + "'  value='" + this.IDCiudad + "'>" + this.Ciudad + "</option>");
                    });
                }
                else {
                    $("#cmbCiudad").append("<option class='' provincia='" + lstCiudades.Provincia +
                        "'  value='" + lstCiudades.IDCiudad +
                        "'>" + lstCiudades.Ciudad + "</option>");
                }

                $('#cmbCiudad').selectpicker('refresh');
                isCity = true;
            }
        }
        else {
            console.log(_resultContent.message);
        }
    });

}


function getAgencias(intTipo, strIdentidad) {
    deleteMarkers();

    var objGeorref = new Object();
    objGeorref.intTipo = intTipo;
    objGeorref.strIdentidad = strIdentidad;

    isAgency = false;
    var objApiRest = new goRestPOST("Index.aspx/ObtenerAgencias", objGeorref);

    objApiRest.extractData(function (_resultContent, status) {
        if (status === 200) {
            var i = 0;
            $("#cmbAgencia").html('');
            $("#cmbAgencia").append("<option class='' value=''>- AGENCIA -</option>");

            var lstAgencias = $.parseJSON(_resultContent.d);
            if (lstAgencias.Datos != null) {
                lstAgencias = lstAgencias.Datos.Table;
                if ($.isArray(lstAgencias)) {
                    $.each(lstAgencias, function (_key, _value) {
                        addMarker(this, i++);

                        $("#cmbAgencia").append("<option class='' value='" + this.Ubicacion + "'>" + this.Direccion + "</option>");

                    });
                }
                else {
                    addMarker(lstAgencias, i++);
                    $("#cmbAgencia").append("<option class='' value='" + lstAgencias.Ubicacion + "'>" + lstAgencias.Direccion + "</option>");
                }

                isAgency = true;
            }
            $('#cmbAgencia').selectpicker('refresh');


        }
        else {
            console.log(_resultContent, 3000);
        }
    });
}


function ubicarme() {


    if (navigator.geolocation) {
        try {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);


                geocoder.geocode(
                    {
                        'latLng': latlng
                    }, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            var posicion = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };

                            if (mkrMyLocation !== null) {
                                mkrMyLocation.setMap(null);
                            }

                            mkrMyLocation = new google.maps.Marker(
                                {
                                    position: posicion,
                                    map: mapFacilito
                                });

                            infoWindow.setPosition(posicion);

                            var strMyInfo = "";




                            if (miCiudad !== null) {
                                strMyInfo += '<tr><td>Provincia:     </td><td><b>' + miProvincia + '</b></td></tr>';
                                strMyInfo += '<tr><td>Ciudad:     </td><td><b>' + miCiudad + '</b></td></tr>';

                            }

                            strMyInfo = '<table id="">' +
                                '<tr><td colspan="2">Ud. Está Aquí</td></tr>' + strMyInfo +
                                '</table>';

                            infoWindow.setContent(strMyInfo);
                            infoWindow.open(mapFacilito, mkrMyLocation);

                            mapFacilito.setCenter(posicion);

                            autoCentrarMarcador();

                            markers.push(mkrMyLocation);
                            miUbicacion = posicion;


                            mkrMyLocation.setAnimation(google.maps.Animation.BOUNCE);
                            window.setTimeout(function () {
                                if (mkrMyLocation.getAnimation() !== null) {
                                    mkrMyLocation.setAnimation(null);
                                }
                            }, 2500);

                            $("#tbInfoGeo").parent().parent().parent().parent().css('border', 'solid 3px blue')
                            $("#tbInfoGeo").parent().parent().parent().parent().css('border-radius', '15px')

                            $("#tbInfoGeo").parent().parent().parent().css('border', 'solid 3px red');
                        }
                        else {
                            console.log("Geocoder failed due to: " + status);
                        }
                    });

            },
                function (failure) {
                    console.log(failure);
                    handleLocationError(true, infoWindow, globalCenter);
                });
        }
        catch (e) {
            console.log(e);
            $("#cmbCiudad").val("").change();
        }
    }
    else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, globalCenter);
    }

}


function getMyCity() {
    if (navigator.geolocation) {
        try {
            navigator.geolocation.getCurrentPosition(function (posicion) {
                var latlng = new google.maps.LatLng(posicion.coords.latitude, posicion.coords.longitude);

                geocoder.geocode(
                    {
                        'latLng': latlng
                    }, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var objGooEstado = getDireccionTipoData(results[0], 'administrative_area_level_1');
                                var objGooCiudad = getDireccionTipoData(results[0], 'locality');

                                getProvincias();

                                if (objGooEstado !== null) {
                                    tState = setInterval(
                                        function () {
                                            if (isState) {
                                                isState = false;

                                                miProvincia = objGooEstado.short_name.toUpperCase();

                                                var objProvincia = $('#cmbProvincia option').filter(function () {
                                                    return $(this).html() === objGooEstado.short_name.toUpperCase();
                                                });

                                                $('#cmbProvincia').val(objProvincia.val()).change();
                                                $('#cmbProvincia').selectpicker('refresh');

                                                $("#cmbProvincia").change(function () {
                                                    getCiudades($(this).val());

                                                    tCity = setInterval(
                                                        function () {
                                                            if (isCity) {
                                                                isCity = false;
                                                                goCiudad();
                                                                clearInterval(tCity)
                                                                tCity = null;
                                                            }
                                                        }, 100);
                                                });

                                                clearInterval(tState);
                                                tState = null;
                                            }
                                        }, 200);
                                }
                                else {
                                    //OPTIMIZAR ESTO 1
                                    tState = setInterval(
                                        function () {
                                            if (isState) {
                                                isState = false;

                                                $("#cmbProvincia").change(function () {
                                                    getCiudades($(this).val());

                                                    tCity = setInterval(
                                                        function () {
                                                            if (isCity) {
                                                                isCity = false;
                                                                goCiudad();
                                                                clearInterval(tCity)
                                                                tCity = null;
                                                            }
                                                        }, 100);
                                                });

                                                clearInterval(tState);
                                                tState = null;
                                            }
                                        }, 200);
                                }


                                if (objGooEstado !== null && tState !== null) {
                                    tCity = setInterval(
                                        function () {
                                            // Espero que el timer de Provincias termine
                                            if (tState == null) {
                                                getCiudades($('#cmbProvincia').val());

                                                clearInterval(tCity);
                                                tCity = null;

                                                // Ciudad desde Google
                                                if (objGooCiudad !== null) {
                                                    tCity = setInterval(
                                                        function () {
                                                            if (isCity) {
                                                                isCity = false;
                                                                miCiudad = objGooCiudad.short_name.toUpperCase();

                                                                var objCiudad = $('#cmbCiudad option').filter(function () {
                                                                    return $(this).html() === objGooCiudad.short_name.toUpperCase();
                                                                });

                                                                $('#cmbCiudad').val(objCiudad.val()).change();
                                                                $('#cmbCiudad').selectpicker('refresh');

                                                                $("#cmbCiudad").change(function () {
                                                                    goCiudad();
                                                                });

                                                                clearInterval(tCity);
                                                                tCity = null;
                                                            }
                                                        }, 200);
                                                }
                                                else {
                                                    isCity = false;

                                                    $("#cmbCiudad").change(function () {
                                                        goCiudad();
                                                    });
                                                }
                                            }
                                        }, 200);
                                }
                                else {
                                    getCiudades('');

                                    //OPTIMIZAR ESTO 2
                                    tCity = setInterval(
                                        function () {
                                            if (isCity) {
                                                isCity = false;

                                                clearInterval(tCity);
                                                tCity = null;

                                                $("#cmbCiudad").change(function () {
                                                    goCiudad();
                                                });
                                            }
                                        }, 200);
                                }

                                if (tCity !== null) {
                                    tAgency = setInterval(
                                        function () {
                                            if (tCity === null) {
                                                getAgencias(4, $('#cmbCiudad').val());
                                                clearInterval(tAgency);
                                                tAgency = null;

                                                //Si hay ciudad automática hago Zoom
                                                getZoomAgencia();
                                            }
                                        }, 200);
                                }
                                else {
                                    getAgencias(4, $('#cmbCiudad').val());
                                    tAgency = setInterval(
                                        function () {
                                            if (isAgency) {
                                                isAgency = false;
                                                clearInterval(tAgency);
                                                tAgency = null;

                                                getZoomAgencia();
                                            }
                                        }, 200);
                                }
                            }
                            else {
                                console.log("No results found");
                            }
                        }
                        else {
                            console.log("Geocoder failed due to: " + status);
                        }
                    });
            },
                function (failure) {
                    handleLocationError(true, infoWindow, globalCenter);

                    getProvincias();
                    getCiudades("");
                    getAgencias(3, "");

                    $("#cmbProvincia").change(function () {
                        getCiudades($(this).val());

                        tCity = setInterval(
                            function () {
                                if (isCity) {
                                    isCity = false;
                                    goCiudad();
                                    clearInterval(tCity)
                                    tCity = null;
                                }
                            }, 100);
                    });


                    $("#cmbCiudad").change(function () {
                        goCiudad();
                    });

                });
        }
        catch (e) {
            console.log(e);
            $("#cmbAgencia").val("").change();
        }
    }
    else {
        $("#cmbCiudad").change(function () {
            goCiudad();
        });

        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, globalCenter);
    }
}
$("#cmbSector").change(function () {
    if ($("#cmbCiudad").val() != '' && $("#cmbCiudad").val() != null) {
        getAgencias(6, $(this).val() + '|' + $("#cmbCiudad").val());
        getZoomProvincia();
    }

});

function getZoomProvincia() {

    mapFacilito.setZoom(8);

    setTimeout(function () {
        mapFacilito.setZoom(9);
    }, 200);

    setTimeout(function () {
        mapFacilito.setZoom(10);
    }, 300);

    setTimeout(function () {
        mapFacilito.setZoom(11);
    }, 400);

    setTimeout(function () {
        mapFacilito.setZoom(12);
    }, 500);
}


function getZoomAgencia() {

    mapFacilito.setZoom(8);

    setTimeout(function () {
        mapFacilito.setZoom(9);
    }, 200);

    setTimeout(function () {
        mapFacilito.setZoom(10);
    }, 300);

    setTimeout(function () {
        mapFacilito.setZoom(11);
    }, 400);

    setTimeout(function () {
        mapFacilito.setZoom(12);
    }, 500);
}


function getDireccionTipoData(data, filter) {
    for (var i = 0; i < data.address_components.length; i++) {
        for (var b = 0; b < data.address_components[i].types.length; b++) {
            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
            if (data.address_components[i].types[b] === filter) {
                //this is the object you are looking for
                return data.address_components[i];
            }
        }
    }
    return null;
}

function imagenDownload(intTipo, nombre) {




}


function addMarker(mark, i) {


    var img = new Image();
    var ext1 = 'JPG';
    var ext = 'jpg';
    //var link = 'http://192.168.14.113:9110/SW.WEB.FacilitoSwitch/Archivos/';
    //var link2 = 'https://inhc1.facilito.com.ec/ENTIDADES/';


    //img.src = link + mark.Codigo + '_Establecimiento.' + ext + '?2';
    //$.ajax({
    //    url: img.src,
    //    type: 'HEAD',
    //    error: function () {
    //        //file not exists
    //        img.src = link + mark.Codigo + '_Establecimiento.' + ext1 + '?2';

    //    },
    //    success: function () {
    //        //file exists
    //    }
    //});
    //// img.src = 'public/agencias/' + mark.Codigo + '.jpg?2';
    // img.src = link + mark.Codigo + '_Establecimiento.' + ext1 + '?2';
    var intTipo = 9;
    var nombre = mark.Codigo + '_Establecimiento.' + ext;

    var objPosition = $.parseJSON(mark.Ubicacion);

    window.setTimeout(function () {
        var imagen = {
            url: 'public/img/' + mark.TipoEntidad + '.png?2',
            scaledSize: new google.maps.Size(37, 50)
        };

        var marker = new google.maps.Marker(
            {
                position: objPosition,
                icon: imagen,
                animation: google.maps.Animation.DROP,
                map: mapFacilito,
                id: mark.Ubicacion
            });

        marker.addListener('click', function toggleBounce() {

            isAgency = false;
            isClicked = true;
            setAnimation(this);

            if (mapFacilito.getZoom() === 16) {
                mapFacilito.setZoom(mapFacilito.getZoom() - 1);
            }

            window.setTimeout(function () {
                mapFacilito.setCenter(objPosition);

                if (mapFacilito.getZoom() < 16) {
                    mapFacilito.setZoom(16);
                }
            }, 250);

            var hora = '-----';

            if (mark.Horario) {
                hora = mark.Horario.replace(/,/g, '<br />');
            }
            // var strPath = img.src;
            //   var strPath = 'public/agencias/' + mark.Codigo + '.jpg?2';

            var intTipo = 9;
            var objGeorref = new Object();
            objGeorref.intTipo = intTipo;
            objGeorref.strIdentidad = nombre;
            var content = "";

            var objApiRest = new goRestPOST("Index.aspx/ObtenerImg", objGeorref);
            strPath = "";
            objApiRest.extractData(function (_resultContent, status) {
                if (status === 200) {
                    strPath = "data:image/jpg;base64," + _resultContent.d;
                }
                else {
                    strPath = "";
                }
                var content = '<div id="iw-container">' +
                    '<div class="iw-title">' + mark.Institucion + '</div>' +
                    '<div class="iw-content">' +
                    '<div class="iw-subTitle">' + mark.DireccionInf + '</div>' +
                    '<div id="divImg" class="shine">' +
                    '<img class="zoom" src="' + strPath + '" alt="" height="60" width="80" id="imgAgencia" ' +
                    'onerror="this.height=\'60\'; this.width=\'60\'; this.src=\'public/agencias/_' + mark.TipoEntidad + '.png?4\'; $(this).removeClass(\'zoom\').addClass(\'zoom2\')">' +
                    '</div>' +
                    '<b>HORARIOS DE ATENCIÓN:</b><br/>' + hora + '<br/>' +
                    '</div>';
                infoWindow.setContent(content);
            });



            infoWindow.open(mapFacilito, this);
            $('div.gm-style-iw').removeClass('gm-style-iw');

            if (!isChanged) {
                $("#cmbAgencia").val(mark.Ubicacion).change();
                $('#cmbAgencia').selectpicker('refresh');
            }

            isChanged = false;

            // Reference to the DIV that wraps the bottom of infowindow
            ///* Since this div is in a position prior to .gm-div style-iw.
            // * We use jQuery and create a iwBackground variable,
            // * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
            //*/
            var iwBackground = iwOuter.prev();

            // Removes background shadow DIV
            iwBackground.children(':nth-child(2)').css({ 'display': 'none' });

            // Removes white background DIV
            iwBackground.children(':nth-child(4)').css({ 'display': 'none' });

            // Moves the shadow of the arrow 76px to the left margin.
            iwBackground.children(':nth-child(1)').attr('style', function (i, s) { return s + 'left: 76px !important;' });

            // Moves the arrow 76px to the left margin.
            iwBackground.children(':nth-child(3)').attr('style', function (i, s) { return s + 'left: 76px !important;' });

            // Changes the desired tail shadow color.
            iwBackground.children(':nth-child(3)').find('div').children().css({ 'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index': '1' });

            // Reference to the div that groups the close button elements.
            var iwCloseBtn = iwOuter.next();

            // Apply the desired effect to the close button
            iwCloseBtn.css(
                {
                    opacity: '1',
                    right: '60px',
                    top: '20px',
                    border: '1px solid rgba(72, 181, 233, 1)',
                    'border-radius': '8px',
                    //'box-shadow': '0 0 1px rgba(72, 181, 233, 1)',
                    height: '15px',
                    width: '15px'
                });

            // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
            if ($('.iw-content').height() < 140) {
                $('.iw-bottom-gradient').css({ display: 'none' });
            }

            var iwCloseIcon = $('.gm-ui-hover-effect img');
            iwCloseIcon.css({ margin: '0px 0px' });

            // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
            iwCloseBtn.mouseout(function () {
                $(this).css({ opacity: '1' });
            });

            $("#divImg").removeClass('shineE');

            setTimeout(function () {
                $("#divImg").addClass('shineE');

                setTimeout(function () {
                    $("#divImg").removeClass('shineE');

                    setTimeout(function () {
                        $("#divImg").addClass('shineE');
                    }, 100);
                }, 450);
            }, 1500);

        });

        markers.push(marker);
    }, 250);

}


function setAnimation(markr) {
    if (markr.getAnimation() !== null) {
        markr.setAnimation(null);
    }
    else {
        markr.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function () {
            if (markr.getAnimation() !== null) {
                markr.setAnimation(null);
            }
        }, 2500);
    }
}


function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}


function deleteMarkers() {
    setMapOnAll(null);
    markers = [];
}


var goRestPOST = function (path, parameters) {
    this._path = path;
    this._parameters = parameters;
    this._resultContent = {};

    this.extractData = function (callback) {
        $.ajax({
            type: "POST",
            url: this._path,
            data: objectToJsonAjax(this._parameters),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            timeout: 3600000,
            success: function (msg) {
                this._resultContent = msg;
                callback(this._resultContent, 200);
            },
            error: function (xhr, status) {
                this._resultContent = {};

                if (xhr.status === 422) {
                    var errores = '';
                    errors = xhr.responseJSON;

                    $.each(errors.errors, function (key, value) {
                        errores += value[0] + "\n";
                    });

                    if (errores.trim() !== "") {
                        this._resultContent = { message: errores, code: 422 };
                    }
                }
                else {
                    if (xhr.status === '404' || xhr.status === '0') {
                        this._resultContent = { message: "Status: " + xhr.status + "<br/>Message: SERVICIO NO DISPONIBLE", code: 404 };
                    }
                    else {
                        this._resultContent = { message: "Status: " + xhr.status + "<br/>Error de procesamiento: " + xhr.responseText, code: xhr.status };
                    }
                }

                callback(this._resultContent, xhr.status);
            }
        });
    };
};


function objectToJsonAjax(objDataSend) {
    try {
        if (objDataSend instanceof Object) {
            var strJSON = JSON.stringify(objDataSend);
            return strJSON.replace(/\"([^(\")"]+)\":/g, "$1:");
        }
    }
    catch (e) {
        console.log(e.message);
    }

    return objDataSend;
}


var goRestPOSTFiles = function (strPath, objFormData) {
    var strSessionID_LS = localStorage.getItem("strOpSessionId");
    var strSessionID_SS = sessionStorage.getItem("strOpSessionId");

    if (strSessionID_LS !== strSessionID_SS) {
        window.open("about:blank", "_self");
    }
    else {
        this._path = strPath;
        this._parameters = objFormData;
        this._resultContent = {};

        this.extractData = function (callback) {
            $.ajax({
                type: 'post',
                url: this._path,
                data: this._parameters,
                processData: false,
                contentType: false,
                success: function (msg) {
                    this._resultContent = msg;
                    callback(this._resultContent, 200);
                },
                error: function (xhr, status) {
                    this._resultContent = {};

                    if (xhr.status === 422) {
                        var errores = '';
                        errors = xhr.responseJSON;

                        $.each(errors.errors, function (key, value) {
                            errores += value[0] + "\n";
                        });

                        if (errores.trim() !== "") {
                            this._resultContent = { message: errores, code: xhr.status };
                        }
                    }
                    else {
                        if (xhr.status === 404 || xhr.status === 0) {
                            this._resultContent = { message: "Status: " + xhr.status + "<br/>Message: SERVICIO NO DISPONIBLE", code: xhr.status };
                        }
                        else {
                            var strMsgError = '';

                            if (typeof xhr.responseText === 'string' && xhr.responseText.indexOf('<title>') >= 0) {
                                try {
                                    strMsgError = $(xhr.responseText).closest("title").eq(0).html().replace('&lt;', '<').replace('&gt;', '>');
                                }
                                catch (e) {
                                    console.log(e);
                                }
                            }

                            if (strMsgError === '') {
                                strMsgError = xhr.responseText;
                            }

                            this._resultContent = { message: "Status: " + xhr.status + "<br/>Error de procesamiento: " + strMsgError, code: xhr.status };
                        }
                    }

                    callback(this._resultContent, xhr.status);
                }
            });
        }
    }
}

