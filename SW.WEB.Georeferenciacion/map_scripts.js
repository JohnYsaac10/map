

$( document ).ready(function() {
    var result = [
        {id:1, value: "hola"},
        {id:2, value: "a todos"},
        {id:3, value: "los muchachos"}
    ]
    
    
    var $dropdown = $("#cmbProvincia");
    $.each(result, function() {
        $dropdown.append($("<option />").val(this.id).text(this.value));
    });
    
    $("#btn-pluss-wrapper").trigger("hover");
});