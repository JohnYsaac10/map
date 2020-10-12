<?php
$cn = odbc_connect("DSNPRODUCCION", "sa", "sa");

require('../functions.php');
require('../clases/cliente.class.php');
$objCliente = new Cliente;

$xml = simplexml_load_file($_POST['archivo']);
///$xml= simplexml_load_file("RISE-132-03102012-OFP.XML");
$codigoBanco = $xml->cabecera->codigoBanco;
$fechaRecaudacion = $xml->cabecera->fechaRecaudacion;
$fechaRecaudacion = str_replace("/", "", $fechaRecaudacion);

$dd1 = substr($fechaRecaudacion, 0, 2);
$mm1 = substr($fechaRecaudacion, 2, 2);
$yyyy1 = substr($fechaRecaudacion, 4, 4);
$fechaSW1 = $yyyy1 . $mm1 . $dd1;

$aba_institucion = $codigoBanco;
$fecha = $fechaSW1;
$tipo =  "3";

$consulta = $objCliente->mostra_consulta_matricula(array($aba_institucion, $fecha), $tipo);
echo "<table width=\"470\" border=\"1\">";
while (odbc_fetch_row($consulta)) {
	$Total = utf8_encode(odbc_result($consulta, "Total"));
	$Tipo = utf8_encode(odbc_result($consulta, "Tipo"));
	$Estado = utf8_encode(odbc_result($consulta, "Estado"));
	$Valor = utf8_encode(odbc_result($consulta, "Valor"));

	if ($Estado == "00") {
		$Estado = "Pagos";
	} else {
		$Estado = "Reversos";
	}
	echo "<tr>";
	echo "<td colspan=\"2\">&nbsp;" . $Tipo . "</td>";
	echo "</tr>";
	echo "<tr>";
	echo "<td width=\"91\" >&nbsp;&nbsp;&nbsp;" . "Cantidad    :  " . "</td>";
	echo "<td >" . $Total . "</td>";
	echo "</tr>";
	echo "<tr>";
	echo "<td >&nbsp;&nbsp;&nbsp;" . "Valor Total :  " . "</td>";
	echo "<td >" . $Valor . "</td>";
	echo "</tr>";
	echo "<tr>";
	echo "<td >&nbsp;&nbsp;&nbsp;" . "Estados     :  " . "</td>";
	echo "<td >" . $Estado . "</td>";
	echo "</tr>";
}
echo "</table>";

$buffer = "";
$noexiste = "";
$noexiste = array();
$buffer = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?> 
          <!--GENERACION DE XML DE RICE SWITCHORM--> 
           <recaudacionDeuda>';
$buffer .= '<cabecera>';
$arr = $xml->children();

foreach ($arr->children() as $etiqueta => $valor) {
	$buffer .= "<$etiqueta>$valor</$etiqueta>";
}
$buffer .= '</cabecera>';
$buffer .= '<detalleRecaudacion>';

foreach ($xml->children() as $child) {
	if ($child->count() > 0) {
		foreach ($child as $child2) {
			if ($child->getName() == 'detalleRecaudacion') {
				set_time_limit(80);
				$estadoDebito = $child2['estadoDebito'];
				$fechaPago = $child2['fechaPago'];
				$valorDebitar = $child2['valorDebitar'];
				$codTranSRI = $child2['codTranSRI'];
				$codTranIFI = $child2['codTranIFI'];
				$numCompSRI = $child2['numCompSRI'];
				$tipoTx = $child2['tipoTx'];
				$codTranIFIRev = $child2['codTranIFIRev'];

				$buffer .= '<' . $child2->getName() . ' 
											estadoDebito="' . $estadoDebito . '" 
											fechaPago="' . $fechaPago . '" 
											valorDebitar="' . $valorDebitar . '" 
											codTranSRI="' . $codTranSRI . '" 
											codTranIFI="' . $codTranIFI . '" 	
											numCompSRI="' . $numCompSRI . '" 
											tipoTx="' . $tipoTx . '" 
											codTranIFIRev="' . $codTranIFIRev . '">';
				$i = 0;

				foreach ($child2 as $child3) {
					$i++;
					$valor = $child3['valor'];
					$id = $child3['id'];

					if ($i == 1) {
						$valorReferencia = $valor;
					}
					if ($i == 2) {
						if ($valor == 'A_LA_FECHA') {
							$tipo = "010207";
						} elseif ($valor == 'GLOBAL') {
							$tipo = "010107";
						}
						///echo "$i.$valor.$tipo.$valorReferencia.$fechaSW1 <br>";

						$producto = "0010011007";


						$sql = "select count (1) as si,lg_sec_adquirente
													from serbas..sb_log 
													where   lg_fecha_compensa in ('" . $fechaSW1 . "') and lg_type_trn='" . $tipo . "' and  
													lg_referencia='" . $valorReferencia . "' and convert(numeric,lg_numero_factura)= '" . $numCompSRI . "' 
													and lg_producto='" . $producto . "'  and lg_cod_resultado='00' and lg_indicador_reverso is null
													group by lg_sec_adquirente";


						$resultado = odbc_exec($cn, $sql) or die(odbc_errormsg());
						$OK = utf8_encode(odbc_result($resultado, "si"));
						$secuencial = odbc_result($resultado, "lg_sec_adquirente");

						if ($OK > 1) {
							$estadoDebito = "NO";
							echo "<br> Verifique Referencia : " . $valorReferencia . "      Valor : $ " . $valorDebitar . "</br>";
						}
						if ($OK == 0) {
							$estadoDebito = "NO";
							echo "<br> No existe : " . $valorReferencia . "      Valor : $ " . $valorDebitar . "</br>";
						}

						if ($OK == 1) {
							$sql2 = "select count(1) as exrev
																from serbas..sb_log 
																where   lg_fecha_compensa in ('" . $fechaSW1 . "') and
																		lg_referencia='" . $valorReferencia . "' and lg_cod_resultado='00' AND SUBSTRING(LG_TYPE_TRN,1,2)='01' 
														and lg_indicador_reverso is not null and lg_sec_adquirente='" . $secuencial . "'";

							$resultado2 = odbc_exec($cn, $sql2) or die(odbc_errormsg());
							$exrev = utf8_encode(odbc_result($resultado2, "exrev"));

							if ($exrev == 1) {
								$estadoDebito = "NO";
								echo "<br> Verifique Reverso : " . $valorReferencia . "      Valor : $ " . $valorDebitar . "</br>";
							}
						}
					} ///cierre if

					$buffer .= '<' . $child3->getName() . ' 
																valor="' . $valor . '" 	id="' . $id . '"/>';
				}
				$buffer .= '</' . $child2->getName() . '>';
			}
		}
	}
}
$buffer .= '</detalleRecaudacion>';
$buffer .= "</recaudacionDeuda>";
/*
				$file=fopen(str_replace(".xml","_OUT.XML","peterRISE-132-03102012-OFP.XML"),"w+"); 
				fwrite ($file,$buffer); 
				fclose($file); 
		  	*/

$file = fopen(str_replace(".xml", "_OUT.XML", $_POST['archivo']), "w+");
fwrite($file, $buffer);
fclose($file);

$arc = str_replace(".xml", "_OUT.XML", $_POST['archivo']);
$oldfile = $arc;
$newfile = "XML/RICE/C" . date("Ymd") . "/" . $arc;
copy($oldfile, $newfile) or die("Unable to copy " . $oldfile);
unlink($oldfile);

echo '<br>Se Genero el archivo : ( ' . $newfile . ' )-VER: <a href="' . $newfile . '">aqui</a>';
