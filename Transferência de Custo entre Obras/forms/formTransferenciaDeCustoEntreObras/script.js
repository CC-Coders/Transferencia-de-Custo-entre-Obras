var listaProdutos = null;
var htmlListProdutos = null;
const ATIVIDADES = {
    INICIO_0: 0,
    INICIO: 4,
    DEFINE_APROVADOR_DESTINO: 9,
    APROVADOR_DESTINO: 8,
    APROVADOR_ORIGEM: 5,
    DEFINE_APROVADOR_ORIGEM: 10,
    LANCA_TRANSFENCIA: 26,
};
$(document).ready(function () {

    init();
    bindings();

    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();
    if (formMode == "VIEW") {
        loadAtividadesAprovacao();
    }


    if (atividadeAtual == ATIVIDADES.INICIO || atividadeAtual == ATIVIDADES.INICIO_0) {
        loadAtividadeInicio();
    }
    if (atividadeAtual == ATIVIDADES.APROVADOR_DESTINO || atividadeAtual == ATIVIDADES.APROVADOR_ORIGEM) {
        loadAtividadesAprovacao();
    }
});


function init(){
    FLUIGC.calendar('#dataCompetencia');
}
function bindings(){
    $("#motivoTransferencia, #ccustoObraOrigem, #ccustoObraDestino, #textMotivoTransferencia").on("change", function(){
        if ($("#motivoTransferencia").val() != "" && $("#ccustoObraOrigem").val() != "" &&  $("#ccustoObraDestino").val() != "" && $("#textMotivoTransferencia").val() != "") {
            $("#divItensTransferencia").slideDown(1000);   
        }
    });

    $("#btnAdicionarItem").on("click", adicionarLinhaItem);

    $("#btnEnviarSolicitacao").on("click", function(){
        parent.$("#send-process-button").click();
    });
}


// Load atividades
function loadAtividadeInicio(){
    setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    preencheCamposDeObras();

    $('#ccustoObraOrigem').selectize({
        onChange: async function(value, isOnInitialize) {
           var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraOrigem").val(aprovadores.engenherio);
            $("#coordenadorObraOrigem").val(aprovadores.coordenador);
            $("#diretorObraOrigem").val(aprovadores.diretor);
            $("#CODCOLIGADA").val(value.split(" - ")[0]);
            $("#motivoTransferencia").change();
            loadListaItens().then(()=>{
                // Inicia a tabela de itens com a Primeira Linha
                adicionarLinhaItem();
            });
        }
    });
    $('#ccustoObraDestino').selectize({
         onChange: async function(value, isOnInitialize) {
              var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraDestino").val(aprovadores.engenherio);
            $("#coordenadorObraDestino").val(aprovadores.coordenador);
            $("#diretorObraDestino").val(aprovadores.diretor);
            $("#motivoTransferencia").change();
        }
    });
}

function loadAtividadesAprovacao(){
   setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    $("#divItensTransferencia").show();
    $("#divOpcoesAprovacao").show();
    $("#divHistorico").show();

    $("#ccustoObraOrigem, #ccustoObraDestino").addClass("form-control");
    $("#ccustoObraOrigem, #ccustoObraDestino").attr("readonly","readonly");
    
    
    $("#motivoTransferencia, #dataCompetencia, #textMotivoTransferencia").attr("readonly","readonly");

    updateCounterRowsTableItens();
    $("#tableItens>tfoot").hide();


    $("#tableItens>thead>tr>th:last").hide();
    $("#tableItens>tbody>tr:not(:first)").each(function(){
        $(this).find("td:last").hide();
        $(this).find("select").addClass("form-control");
        $(this).find("select").attr("readonly","readonly");
        $(this).find("input").attr("readonly","readonly");
    });

    geraTabelaHistorico();
}


// Validacao
var beforeSendValidate = function(){







    insereLinhaHistorico();
};