using System;
using System.Web.Services;
using System.Xml;
using Newtonsoft.Json;
using System.Collections;   

using SW.WEB.Negocio.FacilitoSwitch;

namespace SW.WEB.Georeferenciacion
{
    public partial class Index : System.Web.UI.Page
    {
        public static NegocioFacilito NegFac = new NegocioFacilito();
        public static Entidades.FacilitoSwitch.DataResult Result;

        protected void Page_Load(object sender, EventArgs e)
        {

        }


        [WebMethod]
        public static string ObtenerProvincias()
        {
            string JsonResult = "";
            Result = NegFac.ProcesarGeoreferenciacion(1, "");

            if (Result.Data != null && Result.Data != "")
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(Result.Data);

                JsonResult = JsonConvert.SerializeXmlNode(doc);
            }

            return JsonResult;
        }

        [WebMethod]
        public static string ObtenerSector()
        {
            string JsonResult = "";
            Result = NegFac.ProcesarGeoreferenciacion(5, "");

            if (Result.Data != null && Result.Data != "")
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(Result.Data);

                JsonResult = JsonConvert.SerializeXmlNode(doc);
            }

            return JsonResult;
        }

        

        [WebMethod]
        public static string ObtenerCiudades(string strIdState)
        {
            string JsonResult = "";
            Result = NegFac.ProcesarGeoreferenciacion(2, strIdState);

            if (Result.Data != null && Result.Data != "")
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(Result.Data);

                JsonResult = JsonConvert.SerializeXmlNode(doc);
            }

            return JsonResult;
        }


        [WebMethod]
        public static string ObtenerAgencias(int intTipo, string strIdentidad)
        {
            string JsonResult = "";
            Result = NegFac.ProcesarGeoreferenciacion(intTipo, strIdentidad);

            if (Result.Data != null && Result.Data != "")
            {
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(Result.Data);

                JsonResult = JsonConvert.SerializeXmlNode(doc);
            }

            return JsonResult;
        }

    }
}