
$(function ()
{
    runLoadingGeo();   

    $("#btnReset").click(function ()
    {
        //runLoadingGeo();
        window.open('Index.aspx', '_blank');
    });
});

function runLoadingGeo()
{
    $("#divInfo").show();

    setTimeout(function ()
    {
        window.open('Index.aspx', '_blank');
        $("#divInfo").hide();
    }, 2500);
}