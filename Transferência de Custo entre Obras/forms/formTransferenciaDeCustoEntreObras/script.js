var listUnidadesMedida = ["H", "KG", "L", "M", "M2", "M3", "DIA", "MÊS", "PC", "SC", "T", "UN"];
const ATIVIDADES = {
    INICIO_0: 0,
    INICIO: 4,
    DEFINE_APROVADOR_DESTINO: 9,
    APROVADOR_DESTINO: 8,
    APROVADOR_ORIGEM: 5,
    DEFINE_APROVADOR_ORIGEM: 10,
    LANCA_TRANSFENCIA: 26,
    CONTROLADORIA: 73,
    FIM: 28,
};
const listaTiposTransferencia = {
    CUSTO: [
        "Equipamento",
        "Mão de Obra",
        "Prestação de Serviço",
        "Insumos",
    ],
    RECEITA: [
        "Receita"
    ],
}


$(document).ready(function () {
    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();

    init();
    bindings();

    if (formMode == "VIEW") {
        loadAtividadeAprovacao();

        if (atividadeAtual == ATIVIDADES.FIM) {
            $("#spanIDMOV_ORIGEM").text("Identificador: " + $("#IDMOV_ORIGEM").val());
            $("#spanIDMOV_DESTINO").text("Identificador: " + $("#IDMOV_DESTINO").val());
        }
        $("#divObservacaoAprovacao, #divOpcoesAprovacao").hide();
        return;
    }

    if (atividadeAtual == ATIVIDADES.INICIO_0) {
        loadAtividadeInicio();
    }
    else if (atividadeAtual == ATIVIDADES.INICIO) {
        loadAtividadeAjuste();
        marcaEmVerdeAprovados();
    }
    else if (atividadeAtual == ATIVIDADES.APROVADOR_DESTINO || atividadeAtual == ATIVIDADES.APROVADOR_ORIGEM) {
        loadAtividadeAprovacao();
    }
});


function init() {
    FLUIGC.calendar('#dataCompetencia');
}
function bindings() {
    $(".panelTransferencia .panel-heading").on("click", function () {
        $(".panelTransferencia .panel-heading").not(this).siblings(".panel-body").slideUp();
        $(".panelTransferencia .panel-heading").not(this).find(".iconarrow").addClass("flaticon-chevron-up").removeClass("flaticon-chevron-down");
        $(this).siblings(".panel-body").slideToggle();
        $(this).find(".iconarrow").toggleClass("flaticon-chevron-up").toggleClass("flaticon-chevron-down");
    });
    $("#btnAdicionarTransferencia").on("click", function () {
        adicionaNovaTransferencia();
    });
    $("#btnEnviarSolicitacao").on("click", function () {
        parent.$("#send-process-button").click();
    });
    $("#btnAprovar").on("click", function () {
        $("#decisao").val("Aprovado");
        const atividadeAtual = $("#atividade").val();


        parent.$("#send-process-button").click();


    });
    $("#btnReprovar").on("click", function () {
        $("#decisao").val("Reprovado");
        $("#aprovadoObraOrigem").val("Reprovado");
        $("#aprovadoObraDestino").val("Reprovado");
        parent.$("#send-process-button").click();
    });
    $(".panelColapse>.panel-heading").on("click", function () {
        $(this).siblings(".panel-body").slideToggle();
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
            var CODCOLIGADA = value.split(" - ")[0];
            var CODCCUSTO = value.split(" - ")[1];
            var perfil = value.split(" - ")[2];

            $("#CODCOLIGADA").val(value.split(" - ")[0]);
            $("#motivoTransferencia").change();

            $("#CODCOLIGADA_ORIGEM").val(CODCOLIGADA);
            $("#CODCCUSTO_ORIGEM").val(CODCCUSTO);

            if (perfil == "Matriz Curitiba") {
                var deptos = consultaDepartamentos(CODCOLIGADA);
                geraOptionsDepartamentos("departamentoObraOrigem", deptos);
                $("#departamentoObraOrigem").closest(".row").show();
                $("#engenheiroObraOrigem").closest("div").hide();
            } else {
                var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra(CODCOLIGADA, perfil, "1.1.02", "9999999999999"));
                $("#engenheiroObraOrigem").val(aprovadores.engenherio);
                $("#coordenadorObraOrigem").val(aprovadores.coordenador);
                $("#diretorObraOrigem").val(aprovadores.diretor);
                $("#departamentoObraOrigem").closest(".row").hide();
                $("#engenheiroObraOrigem").closest("div").show();
                $("#departamentoObraOrigem").val("1.3.01");

                if (CODCOLIGADA != 1 || CODCCUSTO.substring(0, 3) != "1.2") {
                    $("#engenheiroObraOrigem").val("fernando.ribeiro");
                    $("#coordenadorObraOrigem").val("fernando.ribeiro");
                    $("#diretorObraOrigem").val("fernando.ribeiro");
                }
            }
        }
    });
    $('#ccustoObraDestino').selectize({
        onChange: async function (value, isOnInitialize) {
            var CODCOLIGADA = value.split(" - ")[0];
            var CODCCUSTO = value.split(" - ")[1];
            var perfil = value.split(" - ")[2];

            $("#motivoTransferencia").change();

            $("#CODCOLIGADA_DESTINO").val(CODCOLIGADA);
            $("#CODCCUSTO_DESTINO").val(CODCCUSTO);

            if (perfil == "Matriz Curitiba") {
                var deptos = consultaDepartamentos(CODCOLIGADA);
                geraOptionsDepartamentos("departamentoObraDestino", deptos);
                $("#departamentoObraDestino").closest(".row").show();
                $("#engenheiroObraDestino").closest("div").hide();
            } else {
                var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra(CODCOLIGADA, perfil, "1.1.02", "9999999999999"));
                $("#engenheiroObraDestino").val(aprovadores.engenherio);
                $("#coordenadorObraDestino").val(aprovadores.coordenador);
                $("#diretorObraDestino").val(aprovadores.diretor);
                $("#departamentoObraDestino").closest(".row").hide();
                $("#engenheiroObraDestino").closest("div").show();
                $("#departamentoObraDestino").val("1.3.01");

                if (CODCOLIGADA != 1 || CODCCUSTO.substring(0, 3) != "1.2") {
                    $("#engenheiroObraDestino").val("gabriel.persike");
                    $("#coordenadorObraDestino").val("gabriel.persike");
                    $("#diretorObraDestino").val("gabriel.persike");
                }
            }
        }
    });

    $("#departamentoObraOrigem").selectize({
        onChange: async function (value, isOnInitialize) {
            var CODDEPTO = value.split(" - ")[0];
            var coordenador = aprovadoresMatriz(CODDEPTO);
            $("#coordenadorObraOrigem").val(coordenador);
            $("#diretorObraOrigem").val("padilha");
        }
    });
    $("#departamentoObraDestino").selectize({
        onChange: async function (value, isOnInitialize) {
            var CODDEPTO = value.split(" - ")[0];
            var coordenador = aprovadoresMatriz(CODDEPTO);
            $("#coordenadorObraDestino").val(coordenador);
            $("#diretorObraDestino").val("padilha");
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
    alteraIconesECorDosValores();
    preencheCamposDeObras();
    updateCounterRowsTableItens();
    carregaTabelaItensDasTransferencias();

    $(".panelTransferencia:last>.panel-heading").click();

    $(".motivoTransferencia:not(:first)").each(function () {
        var val = $(this).val() ? $(this).val() : $(this).text();
        $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text(val);
    });
    $(".valorTotalTransferencia").each(function () {
        var val = $(this).val() ? $(this).val() : $(this).text();
        $(this).closest(".panelTransferencia").find(".spanValorTransferencia").text(val);
    });

    $('#ccustoObraOrigem').selectize({
        onChange: async function (value, isOnInitialize) {
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra("1", value.split(" - ")[2], "1.1.02", "9999999999999"));
            $("#engenheiroObraOrigem").val(aprovadores.engenherio);
            $("#coordenadorObraOrigem").val(aprovadores.coordenador);
            $("#diretorObraOrigem").val(aprovadores.diretor);
            $("#CODCOLIGADA").val(value.split(" - ")[0]);
            $("#motivoTransferencia").change();
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
        $("#decisaoAprovadorObraOrigem, #decisaoAprovadorObraDestino").val("");
    }
}
function loadAtividadeAprovacao() {
    setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    $("#divItensTransferencia").show();
    $("#divOpcoesAprovacao").show();
    $("#divObservacaoAprovacao").show();
    $("#divHistorico").show();

    $("#ccustoObraOrigem, #ccustoObraDestino").addClass("form-control");
    $("#ccustoObraOrigem, #ccustoObraDestino").attr("readonly", "readonly");


    var DEPTO_DESTINO = $("#departamentoObraDestino").val() ? $("#departamentoObraDestino").val() : $("#departamentoObraDestino").text().split(" - ")[0].trim();
    if (DEPTO_DESTINO != "1.3.01" && DEPTO_DESTINO != "" && DEPTO_DESTINO != null) {
        $("#departamentoObraDestino").closest(".row").show();
        $("#departamentoObraDestino").addClass("form-control");
        $("#departamentoObraDestino").attr("readonly", "readonly");

        if ($("#engenheiroObraDestino").val() == "") {
            $("#engenheiroObraDestino").closest("div").hide();
        }
    }

    var DEPTO_ORIGEM = $("#departamentoObraOrigem").val() ? $("#departamentoObraOrigem").val() : $("#departamentoObraOrigem").text().split(" - ")[0].trim();
    if (DEPTO_ORIGEM != "1.3.01" && DEPTO_ORIGEM != "" && DEPTO_ORIGEM != null) {
        $("#departamentoObraOrigem").closest(".row").show();
        $("#departamentoObraOrigem").addClass("form-control");
        $("#departamentoObraOrigem").attr("readonly", "readonly");

        if ($("#engenheiroObraOrigem").val() == "") {
            $("#engenheiroObraOrigem").closest("div").hide();
        }
    }

    $("#dataCompetencia").attr("readonly", "readonly");

    updateCounterRowsTableItens();
    carregaTabelaItensDasTransferencias();
    alteraIconesECorDosValores();
    $(".panelTransferencia:last>.panel-heading").click();

    $(".motivoTransferencia").each(function () {
        var val = $(this).val() ? $(this).val() : $(this).text();
        $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text(val);
    });
    $(".valorTotalTransferencia").each(function () {
        var val = $(this).val() ? $(this).val() : $(this).text();
        $(this).closest(".panelTransferencia").find(".spanValorTransferencia").text(val);
    });

    $(".btnRemoverTransferencia").hide();

    $(".textMotivoTransferencia, .motivoTransferencia").attr("readonly", "readonly");
    $("#btnAdicionarTransferencia").hide();

    geraTabelaHistorico();
    marcaEmVerdeAprovados();

    if ($("#isMobile").val() == "true") {
        carregaTabelaTransferenciasMobile();
    }
}
function loadAtividadeControladoria() {
    setTimeout(() => {
        $("#header, #main, #footer").show("fade", 1500);
    }, 1000);

    $("#divItensTransferencia").show();
    $("#divOpcoesAprovacao").show();
    $("#divObservacaoAprovacao").show();
    $("#divHistorico").show();

    $("#ccustoObraOrigem, #ccustoObraDestino").addClass("form-control");
    $("#ccustoObraOrigem, #ccustoObraDestino").attr("readonly", "readonly");


    var DEPTO_DESTINO = $("#departamentoObraDestino").val() ? $("#departamentoObraDestino").val() : $("#departamentoObraDestino").text().split(" - ")[0].trim();
    if (DEPTO_DESTINO != "1.3.01" && DEPTO_DESTINO != "" && DEPTO_DESTINO != null) {
        $("#departamentoObraDestino").closest(".row").show();
        $("#departamentoObraDestino").addClass("form-control");
        $("#departamentoObraDestino").attr("readonly", "readonly");

        if ($("#engenheiroObraDestino").val() == "") {
            $("#engenheiroObraDestino").closest("div").hide();
        }
    }

    var DEPTO_ORIGEM = $("#departamentoObraOrigem").val() ? $("#departamentoObraOrigem").val() : $("#departamentoObraOrigem").text().split(" - ")[0].trim();
    if (DEPTO_ORIGEM != "1.3.01" && DEPTO_ORIGEM != "" && DEPTO_ORIGEM != null) {
        $("#departamentoObraOrigem").closest(".row").show();
        $("#departamentoObraOrigem").addClass("form-control");
        $("#departamentoObraOrigem").attr("readonly", "readonly");

        if ($("#engenheiroObraOrigem").val() == "") {
            $("#engenheiroObraOrigem").closest("div").hide();
        }
    }

    $("#dataCompetencia").attr("readonly", "readonly");

    updateCounterRowsTableItens();
    carregaTabelaItensDasTransferencias();
    alteraIconesECorDosValores();
    $(".panelTransferencia:last>.panel-heading").click();

    $(".motivoTransferencia").each(function () {
        var val = $(this).val() ? $(this).val() : $(this).text();
        $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text(val);
    });
    $(".valorTotalTransferencia").each(function () {
        var val = $(this).val() ? $(this).val() : $(this).text();
        $(this).closest(".panelTransferencia").find(".spanValorTransferencia").text(val);
    });

    $(".btnRemoverTransferencia").hide();

    $(".textMotivoTransferencia, .motivoTransferencia").attr("readonly", "readonly");
    $("#btnAdicionarTransferencia").hide();

    geraTabelaHistorico();
    marcaEmVerdeAprovados();

    if ($("#isMobile").val() == "true") {
        carregaTabelaTransferenciasMobile();
    }
}


// Validacao
var beforeSendValidate = function () {
    var valida = true;

    const atividadeAtual = $("#atividade").val();
    if (atividadeAtual == ATIVIDADES.INICIO || atividadeAtual == ATIVIDADES.INICIO_0) {
        valida = validaPreenchimentoForm();
    }

    if (atividadeAtual == ATIVIDADES.APROVADOR_DESTINO || atividadeAtual == ATIVIDADES.APROVADOR_ORIGEM) {
        if ($("#decisao").val() == "") {
            valida = false;
            throw "Necessário selecionar a Aprovação.";
        }

        if ($("#decisao").val() == "Reprovado" && $("#textObservacao").val() == "") {
            valida = false;
            throw "Necessário informar o motivo da Decisão.";
        }
    }

    if (valida === true) {
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

    if ($("#ccustoObraOrigem").val() == "") {
        retorno.push("Informar a Obra de Origem.");
    }
    if ($("#ccustoObraDestino").val() == "") {
        retorno.push("Informar a Obra de Destino.");
    }

    if ($("#ccustoObraOrigem").val() == $("#ccustoObraDestino").val() && $("#ccustoObraDestino").val() != "1.1.001") {
        retorno.push("Não é possível fazer Transferência entre o Mesmo Centro de Custo");
    }

    var rows = $("#tableTransferencias>tbody>tr:not(:first)");
    if (rows.length == 0) {
        retorno.push("Necessário incluir pelo menos uma transferência");
    }


    var counter = 1;
    for (const row of rows) {
        if ($(row).find(".motivoTransferencia").val() == "") {
            retorno.push("Informar o Tipo da Transferência " + counter);
        }

        if ($(row).find(".textMotivoTransferencia").val() == "") {
            retorno.push("Informar a Justificativa da Transferência " + counter);
        }


        var rowsItens = $(row).find(".tableItens>tbody>tr");
        if (rowsItens.length == 0) {
            retorno.push("Necessário incluir pelo menos um Item na Transferêcia " + counter);
        }

        var counterItem = 1;
        for (const rowItem of rowsItens) {
            if ($(rowItem).find(".itemProduto").val() == "") {
                retorno.push(`Informar o "Produto" do Item ${counterItem} na Transferência ${counter}`);
            }
            if ($(rowItem).find(".itemDescricao").val() == "") {
                retorno.push(`Informar a "Descrição" do Item ${counterItem} na Transferência ${counter}`);
            }
            if ($(rowItem).find(".itemQuantidade").val() == "") {
                retorno.push(`Informar a "Quantidade" do Item ${counterItem} na Transferência ${counter}`);
            }
            if ($(rowItem).find(".itemUN").val() == "") {
                retorno.push(`Informar a "Unidade de Medida" do Item ${counterItem} na Transferência ${counter}`);
            }
            if ($(rowItem).find(".itemValorUnit").val() == "") {
                retorno.push(`Informar o "Valor Unitário" do Item ${counterItem} na Transferência ${counter}`);
            }
            counterItem++;
        }


        counter++;
    }


    if ($("#dataCompetencia").val() == "") {
        retorno.push("Informar a Data de Competência.");
    }


    if (retorno.length == 0) {
        return true;
    } else {
        return retorno.map(e => `<li>${e}</li>`).join("");
    }
}