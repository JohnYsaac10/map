<?php
	$cn = odbc_connect("DSNPRODUCCION","sa","sa");
	
	require('../functions.php');
	require('../clases/cliente.class.php');
	$objCliente=new Cliente;
	
	$xml= simplexml_load_file($_POST['archivo']);
	$codigoBanco =$xml->cabecera->codigoBanco; 
	$fechaRecaudacion =$xml->cabecera->fechaRecaudacion; 
	$fechaRecaudacion =str_replace("-","",$fechaRecaudacion);
		
	$aba_institucion= $codigoBanco; ////"000141";
	$fecha= $fechaRecaudacion;
	$tipo=  "2";
	$consulta = $objCliente->mostra_consulta_matricula(array($aba_institucion,$fecha),$tipo);
    echo "<table width=\"470\" border=\"1\">";
	while(odbc_fetch_row($consulta))
		{
		 $Total= utf8_encode(odbc_result($consulta,"Total"));
		 $Tipo= utf8_encode(odbc_result($consulta,"Tipo"));
		 $Estado= utf8_encode(odbc_result($consulta,"Estado"));
		 $Valor= utf8_encode(odbc_result($consulta,"Valor"));
		 
		 if ($Estado=="00") { $Estado="Pagos";	 }else{		 $Estado="Reversos";}
		 	echo "<tr>";
		 		 echo "<td colspan=\"2\">&nbsp;".$Tipo."</td>";
		  	echo "</tr>";
		  	echo "<tr>";
				 echo "<td width=\"91\" >&nbsp;&nbsp;&nbsp;"."Cantidad    :  "."</td>";
				 echo "<td >".$Total."</td>";
			echo "</tr>";
 		    echo "<tr>";
				 echo "<td >&nbsp;&nbsp;&nbsp;"."Valor Total :  "."</td>";
				 echo "<td >".$Valor."</td>";
			echo "</tr>";
 		    echo "<tr>";
  			 	echo "<td >&nbsp;&nbsp;&nbsp;"."Estados     :  "."</td>";
			 	echo "<td >".$Estado."</td>";
		    echo "</tr>";
		 
		 }
 echo "</table>";
 
$buffer="";
$buffer='<?xml version="1.0" encoding="UTF-8" standalone="yes"?> 
          <!--GENERACION DE XML DE CEP SWITCHORM--> 
           <OtrasFormasDePago>'; 
		   $buffer.='<cabecera>'; 
		
		$arr = $xml->children();

		foreach ($arr->children() as $etiqueta => $valor) {
		  $buffer.="<$etiqueta>$valor</$etiqueta>"; 
								}
      		$buffer.='</cabecera>'; 
	  		$buffer.='<declaracionesSRI_IFI>';

	for( $i=0; $i<count($xml->declaracionesSRI_IFI->declaracion); $i++ )
	{	
			$tipoTx =$xml->declaracionesSRI_IFI->declaracion[$i]['tipoTx']; 
			$codigoLogMonitor =$xml->declaracionesSRI_IFI->declaracion[$i]['codigoLogMonitor']; 
			$idEntidad =$xml->declaracionesSRI_IFI->declaracion[$i]['idEntidad']; 
			$codigoFormulario =$xml->declaracionesSRI_IFI->declaracion[$i]['codigoFormulario']; 
			$numeroFormulario =$xml->declaracionesSRI_IFI->declaracion[$i]['numeroFormulario']; 
			$numeroSecuencial =$xml->declaracionesSRI_IFI->declaracion[$i]['numeroSecuencial']; 
			$codigoCabeceraFormulario =$xml->declaracionesSRI_IFI->declaracion[$i]['codigoCabeceraFormulario']; 
			$periodoFiscalDesde =$xml->declaracionesSRI_IFI->declaracion[$i]['periodoFiscalDesde']; 
			$periodoFiscalHasta =$xml->declaracionesSRI_IFI->declaracion[$i]['periodoFiscalHasta']; 
			$fechaDeclaracion =$xml->declaracionesSRI_IFI->declaracion[$i]['fechaDeclaracion']; 
			$fechaMaximaPago =$xml->declaracionesSRI_IFI->declaracion[$i]['fechaMaximaPago']; 
			$numeroRuc =$xml->declaracionesSRI_IFI->declaracion[$i]['numeroRuc']; 								////ruc
			$razonSocial =$xml->declaracionesSRI_IFI->declaracion[$i]['razonSocial']; 
			$codigoImpuesto =$xml->declaracionesSRI_IFI->declaracion[$i]['codigoImpuesto']; 
			$descripcionImpuesto =$xml->declaracionesSRI_IFI->declaracion[$i]['descripcionImpuesto']; 
			$valorDebitar =$xml->declaracionesSRI_IFI->declaracion[$i]['valorDebitar']; 						////valor pagado
			$claseContribuyente =$xml->declaracionesSRI_IFI->declaracion[$i]['claseContribuyente']; 
			$adhesivo =$xml->declaracionesSRI_IFI->declaracion[$i]['adhesivo'];    								////esto es la referencia sw
			$codigoEstructuraOrganizacional =$xml->declaracionesSRI_IFI->declaracion[$i]['codigoEstructuraOrganizacional']; 
			$fechaPago =$xml->declaracionesSRI_IFI->declaracion[$i]['fechaPago']; 
			$estadoDebito =$xml->declaracionesSRI_IFI->declaracion[$i]['estadoDebito']; 
			
			$fechaSW =str_replace("-","",$fechaPago);
			$tipo='010011';
			$producto="0010191011";
			set_time_limit(180);				
			
						$sql="select count (1) as si,lg_sec_adquirente
								from serbas..sb_log 
								where   lg_fecha_trn in ('".$fechaSW."') and lg_type_trn='".$tipo."' and lg_new_cedruc='".$numeroRuc."' and   
								lg_referencia='".$adhesivo."' and RTRIM(LTRIM(SUBSTRING(LG_DAT_FACTURA,6,25)))='".$codigoLogMonitor."' AND lg_producto='".$producto."'  and lg_cod_resultado='01' and lg_indicador_reverso is null
								group by lg_sec_adquirente";
							
						$resultado = odbc_exec($cn,$sql) or die( odbc_errormsg() );
						$OK= utf8_encode(odbc_result($resultado,"si"));
						$secuencial= odbc_result($resultado,"lg_sec_adquirente");
						
						if($OK >1)
						{
	 					 $estadoDebito="NO";
						 echo "<br> Verifique Referencia : ".$adhesivo."      Valor : $ ".$valorDebitar."</br>";
						}
						if($OK==0)
						{
							$estadoDebito="NO";
							echo "<br> No existe : ".$adhesivo."      Valor : $ ".$valorDebitar."</br>";
						}
						
						if($OK==1)
						{
							$sql2="select count(1) as exrev
									from serbas..sb_log 
									where   lg_referencia='".$adhesivo."' and lg_cod_resultado='01' AND SUBSTRING(LG_TYPE_TRN,1,2)='01' 
							and lg_indicador_reverso is not null and lg_sec_adquirente='".$secuencial."'";
						
							$resultado2 = odbc_exec($cn,$sql2) or die( odbc_errormsg() );
							$exrev= utf8_encode(odbc_result($resultado2,"exrev"));
							
							if($exrev==1)
							{
								 $estadoDebito="NO";
								 echo "<br> verifique Reverso : ".$adhesivo."      Valor : $ ".$valorDebitar."</br>";
							}
							
						}
					
			$buffer.='<declaracion tipoTx="'.$tipoTx.'" 
					codigoLogMonitor="'.$codigoLogMonitor.'" 
					idEntidad="'.$idEntidad.'" 
					codigoFormulario="'.$codigoFormulario.'" 
					numeroFormulario="'.$numeroFormulario.'" 
					numeroSecuencial="'.$numeroSecuencial.'" 
					codigoCabeceraFormulario="'.$codigoCabeceraFormulario.'" 
					periodoFiscalDesde="'.$periodoFiscalDesde.'" 
					periodoFiscalHasta="'.$periodoFiscalHasta.'" 
					fechaDeclaracion="'.$fechaDeclaracion.'" 
					fechaMaximaPago="'.$fechaMaximaPago.'" 
					numeroRuc="'.$numeroRuc.'" 
					razonSocial="'.$razonSocial.'" 
					codigoImpuesto="'.$codigoImpuesto.'" 
					descripcionImpuesto="'.$descripcionImpuesto.'" 
					valorDebitar="'.$valorDebitar.'" 
					claseContribuyente="'.$claseContribuyente.'" 
					adhesivo="'.$adhesivo.'" 
					codigoEstructuraOrganizacional="'.$codigoEstructuraOrganizacional.'" 
					fechaPago="'.$fechaPago.'" 
					estadoDebito="'.$estadoDebito.'" />';
	       } 
		  $buffer.='</declaracionesSRI_IFI>'; 
		  $buffer.="</OtrasFormasDePago>"; 
		  $file=fopen(str_replace(".xml","_OUT.XML",$_POST['archivo']),"w+"); 
 			fwrite ($file,$buffer); 
			fclose($file); 
			
		  $arc=str_replace(".xml","_OUT.XML",$_POST['archivo']);
		  $oldfile=$arc;
  		  $newfile="XML/CEP/S".date("Ymd")."/".$arc;
  		  copy ($oldfile, $newfile) or die("Unable to copy ".$oldfile);
		  unlink($oldfile);
		  
		  echo '<br>Se Genero el archivo : ( '.$newfile.' )-VER: <a href="'.$newfile.'">aqui</a>'; 
		
?>