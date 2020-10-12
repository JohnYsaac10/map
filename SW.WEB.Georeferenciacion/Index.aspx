<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="SW.WEB.Georeferenciacion.Index" %>

<!DOCTYPE html>
<html>

<head>
    <title>Facilito | Geolocation</title>
    <link rel="shortcut icon" href="/favicon.ico" />
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <link rel="stylesheet" href="public/bootstrap/css/bootstrap-select.min.css?1" />
    <link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css?1"/>
    <link rel="stylesheet" href="public/css/georef.css?10"/>
	<style>
	    .gm-style-iw 
		    {
			    width: 160px !important;
		        padding:7px;
			    background-color: #fff; 
		        box-shadow: 0px;
			    border: 0px;
		    }
	    #iw-container .iw-title 
        {
           width: auto!important; 
    
	    }


        @media (max-width: 991px) { 
            .tbLocation {display: none;}
            .btn-warning, .btn-success{display: inline !important;}
        }

        .btn-float{
            position: absolute;
        }

        .bf-first {
            top: 5%;
            left: 5%;

        }

        .bf-second {
            top: 12%;
            left: 5%;
        }

        .wrap-select {
            display: inline-block;
            position: absolute;
            top: 19%;
            left: 5%;
        }
    </style>
</head>

<body>
    <div id="mapFacilito"></div>

    <div class="tbLocation">
            <div class="col-lg-12">
                <label class="lb-text-responsive">Seleccione su AgenciaX</label>


                <select id="cmbProvincia" name="cmbFilter" data-size="10"></select>
                <select id="cmbCiudad" name="cmbFilter" data-size="10"></select>
                <select id="cmbSector" name="cmbFilter" data-size="10"></select>
                <select id="cmbAgencia" name="cmbFilter" data-size="10"></select>

            
			    <button id="btnUbicarme" type="button" class="btn btn-warning" title="UBICARME">
				    <i class="fas fa-location-arrow"></i>
			    </button>
			    <button id="btnRestart" type="button" class="btn btn-success" title="REINICIAR">
				    <i class="fa fa-undo"></i>
			    </button>
		    </div>
    </div>
    
    <script src="public/js/all.js"></script>
    <script src="public/js/jquery.min.js"></script>
    <script src="public/bootstrap/js/bootstrap.js"></script>
    <script src="public/bootstrap/js/bootstrap-select.min.js"></script>
    <script src="public/js/georef.js?41"></script>

    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAd70Yj9q_B39oh7xTkMUV30TSlbeyc448&callback=initMap"></script>
    
</body>

</html>