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


    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();
    if (formMode == "VIEW") {
        loadAtividadesAprovacao();
    }

    init();
    bindings();


    if (atividadeAtual == ATIVIDADES.INICIO_0) {
        loadAtividadeInicio();
    } else if (atividadeAtual == ATIVIDADES.INICIO) {
        loadAtividadeAjuste();
        marcaEmVerdeAprovados();
    }
    if (atividadeAtual == ATIVIDADES.APROVADOR_DESTINO || atividadeAtual == ATIVIDADES.APROVADOR_ORIGEM) {
        loadAtividadesAprovacao();
    }
});


function init() {
    FLUIGC.calendar('#dataCompetencia');
}
function bindings() {
    $("#motivoTransferencia, #ccustoObraOrigem, #ccustoObraDestino, #textMotivoTransferencia").on("change", function () {
        if ($("#motivoTransferencia").val() != "" && $("#ccustoObraOrigem").val() != "" && $("#ccustoObraDestino").val() != "" && $("#textMotivoTransferencia").val() != "") {
            $("#divItensTransferencia").slideDown(1000);
        }
    });

    $("#btnAdicionarItem").on("click", adicionarLinhaItem);

    $("#btnEnviarSolicitacao").on("click", function () {
        parent.$("#send-process-button").click();
    });
    $("#btnAprovar").on("click", function () {
        $("#decisao").val("Aprovado");
        parent.$("#send-process-button").click();
    });
    $("#btnReprovar").on("click", function () {
        $("#decisao").val("Reprovado");
        $("#aprovadoObraOrigem").val("Reprovado");
        $("#aprovadoObraDestino").val("Reprovado");
        parent.$("#send-process-button").click();
    });
}


// Load atividades
function loadAtividadeInicio() {
    setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    preencheCamposDeObras();

    $('#ccustoObraOrigem').selectize({
        onChange: async function (value, isOnInitialize) {
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraOrigem").val(aprovadores.engenherio);
            $("#coordenadorObraOrigem").val(aprovadores.coordenador);
            $("#diretorObraOrigem").val(aprovadores.diretor);
            $("#CODCOLIGADA").val(value.split(" - ")[0]);
            $("#motivoTransferencia").change();
            loadListaItens().then(() => {
                // Inicia a tabela de itens com a Primeira Linha
                adicionarLinhaItem();
            });
        }
    });
    $('#ccustoObraDestino').selectize({
        onChange: async function (value, isOnInitialize) {
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraDestino").val(aprovadores.engenherio);
            $("#coordenadorObraDestino").val(aprovadores.coordenador);
            $("#diretorObraDestino").val(aprovadores.diretor);
            $("#motivoTransferencia").change();
        }
    });

    $("input[autocomplete]").attr("autocomplete", "off");

}

function loadAtividadeAjuste() {
    setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    $("#divItensTransferencia").show();
    $("#divHistorico").show();
    $("#divObservacaoAprovacao").show();


    updateCounterRowsTableItens();

    geraTabelaHistorico();
    marcaEmVerdeAprovados();

    preencheCamposDeObras();
    loadListaItens().then(() => {
        $("#tableItens>tbody>tr:not(:first)").each(function () {
            var id = $(this).find("input[name^='itemDescricao___']").attr("id").split("___")[1];
            loadLinhaItem(id);
        });

    })


    $('#ccustoObraOrigem').selectize({
        onChange: async function (value, isOnInitialize) {
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraOrigem").val(aprovadores.engenherio);
            $("#coordenadorObraOrigem").val(aprovadores.coordenador);
            $("#diretorObraOrigem").val(aprovadores.diretor);
            $("#CODCOLIGADA").val(value.split(" - ")[0]);
            $("#motivoTransferencia").change();
            loadListaItens().then(() => {
                // Inicia a tabela de itens com a Primeira Linha
                adicionarLinhaItem();
            });
        }
    });
    $('#ccustoObraDestino').selectize({
        onChange: async function (value, isOnInitialize) {
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraDestino").val(aprovadores.engenherio);
            $("#coordenadorObraDestino").val(aprovadores.coordenador);
            $("#diretorObraDestino").val(aprovadores.diretor);
            $("#motivoTransferencia").change();
        }
    });

    $("input[autocomplete]").attr("autocomplete", "off");

    limpaDadosAprovacao();

    function limpaDadosAprovacao() {
        $("#aprovadoEngenheiroObraDestino").val("");
        $("#aprovadoCoordenadorObraDestino").val("");
        $("#aprovadoDiretorObraDestino").val("");

        $("#aprovadoEngenheiroObraOrigem").val("");
        $("#aprovadoCoordenadorObraOrigem").val("");
        $("#aprovadoDiretorObraOrigem").val("");

        $("#usuarioAprovadorDestino").val("");
        $("#usuarioAprovadorOrigem").val("");

        $("#aprovadoObraDestino").val("");
        $("#aprovadoObraOrigem").val("");

        $("#decisao").val();
    }
}


function loadAtividadesAprovacao() {
    setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    $("#divItensTransferencia").show();
    $("#divOpcoesAprovacao").show();
    $("#divObservacaoAprovacao").show();
    $("#divHistorico").show();

    $("#ccustoObraOrigem, #ccustoObraDestino").addClass("form-control");
    $("#ccustoObraOrigem, #ccustoObraDestino").attr("readonly", "readonly");


    $("#motivoTransferencia, #dataCompetencia, #textMotivoTransferencia").attr("readonly", "readonly");

    updateCounterRowsTableItens();
    $("#tableItens>tfoot").hide();


    $("#tableItens>thead>tr>th:last").hide();
    $("#tableItens>tbody>tr:not(:first)").each(function () {
        $(this).find("td:last").hide();
        $(this).find("select").addClass("form-control");
        $(this).find("select").attr("readonly", "readonly");
        $(this).find("input").attr("readonly", "readonly");
    });

    geraTabelaHistorico();
    marcaEmVerdeAprovados();
}


// Validacao
var beforeSendValidate = function () {
    var valida = true;


    const atividadeAtual = $("#atividade").val();
    if (atividadeAtual == ATIVIDADES.INICIO || atividadeAtual == ATIVIDADES.INICIO_0) {
        valida = validaPreenchimentoForm();
    }

    if (atividadeAtual == ATIVIDADES.APROVADOR_DESTINO || atividadeAtual == ATIVIDADES.APROVADOR_ORIGEM) {
        if ($("#decisao").val() == "Reprovado" && $("#textObservacao").val() == "") {
            valida = false;
            throw "Necessário informar o motivo da Decisão.";
        }
    }

    if (valida === true) {
        insereLinhaHistorico();

        if ($("#decisao").val() == "Reprovado") {
            movimentaAtividadeParaReprovacao();
        }
        return true;
    } else {
        throw "<ul>" + valida + "</ul>";
        return false;
    }
};

function validaPreenchimentoForm() {
    var retorno = [];

    if ($("#motivoTransferencia").val() == "") {
        retorno.push("Informar motivo da Transferência.");
    }
    if ($("#dataCompetencia").val() == "") {
        retorno.push("Informar a Data de Competência.");
    }
    if ($("#textMotivoTransferencia").val() == "") {
        retorno.push("Informar motivo da Transferência.");
    }

    if (retorno.length == 0) {
        return true;
    } else {
        return retorno.map(e => `<li>${e}</li>`).join("");
    }
}




function movimentaAtividadeParaReprovacao() {
    var processId = $("#numProces").val();
    $.ajax({
        url: '/process-management/api/v2/activities?processInstanceId=' + processId + '&active=true',
        type: 'get',
        success: result => {
            for (const task of result.items) {
                if (task.state.sequence == ATIVIDADES.APROVADOR_DESTINO) {
                    var sequence = task.movementSequence;

                    DatasetFactory.getDataset("dsMovimentaAtividade", null, [
                        DatasetFactory.createConstraint("numProces", processId, "", ConstraintType.MUST),
                        DatasetFactory.createConstraint("movementSequence", sequence, "", ConstraintType.MUST),
                        DatasetFactory.createConstraint("assignee", $("#usuarioAprovadorDestino").val(), "", ConstraintType.MUST),
                        DatasetFactory.createConstraint("targetState", 37, "", ConstraintType.MUST),
                    ], null, {
                        success: ds => {

                        }, error: e => {

                        }
                    });
                }
            }
        }
    })
}