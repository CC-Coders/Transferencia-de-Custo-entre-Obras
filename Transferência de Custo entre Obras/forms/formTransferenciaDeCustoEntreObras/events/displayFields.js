var ATIVIDADES ={     
    INICIO_0:0,
    INICIO:4,
    DEFINE_APROVADOR_DESTINO:9,
    APROVADOR_DESTINO:8,
    APROVADOR_ORIGEM:5,
    DEFINE_APROVADOR_ORIGEM:10,
    LANCA_TRANSFENCIA:26,
}



function displayFields(form,customHTML){
    var ATIVIDADE = getValue("WKNumState");
    var USUARIO = getValue("WKUser");
    var dataHoje = getDateNow();

    form.setValue("formMode", form.getFormMode());
    form.setValue("userCode", USUARIO);
    form.setValue("atividade", ATIVIDADE);

    form.setValue("dateSolicitacao", dataHoje);
    form.setValue("dataSolicitacao", dataHoje.split("-").reverse().join("/"));

    if (ATIVIDADE == ATIVIDADES.INICIO || ATIVIDADE == ATIVIDADES.INICIO_0) {
        form.setValue("solicitante", USUARIO);
        form.setValue("dataCompetencia", dataHoje.split("-").reverse().join("/"));
    }


    form.setValue("textObservacao","");
    form.setValue("decisao","");
}




// Utils
function getDateNow(){
    var date = new Date();

    var dia = date.getDate();
    dia = dia < 10 ? "0" + dia : dia;
    
    var mes = date.getMonth() + 1;
    mes = mes < 10 ? "0" + mes : mes;

    var ano = date.getFullYear();

    return ano + "-" + mes + "-" + dia;
}