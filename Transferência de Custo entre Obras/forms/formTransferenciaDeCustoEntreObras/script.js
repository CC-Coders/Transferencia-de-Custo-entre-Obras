var listaProdutos = null;
var htmlListProdutos = null;
var listUnidadesMedida = ["H","KG","L","M","M2","M3","DIA","MÊS","PC","SC","T","UN"];
const ATIVIDADES = {
    INICIO_0: 0,
    INICIO: 4,
    DEFINE_APROVADOR_DESTINO: 9,
    APROVADOR_DESTINO: 8,
    APROVADOR_ORIGEM: 5,
    DEFINE_APROVADOR_ORIGEM: 10,
    LANCA_TRANSFENCIA: 26,
    FIM: 28,
};
const listaTiposTransferencia = {
    CUSTO:[
        "Equipamento",
        "Mão de Obra",
        "Prestação de Serviço",
        "Insumos",
    ],
    RECEITA:[
        "Receita"
    ],
}


$(document).ready(function () {
    const atividadeAtual = $("#atividade").val();
    const formMode = $("#formMode").val();
    
    init();
    bindings();

    if (formMode == "VIEW") {
        loadAtividadesAprovacao();

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
        loadAtividadesAprovacao();
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
        if (atividadeAtual == ATIVIDADES.APROVADOR_ORIGEM) {
            aprovaObraOrigem();
        }
        else if (atividadeAtual == ATIVIDADES.APROVADOR_DESTINO) {
            aprovaObraDestino();
        }

        parent.$("#send-process-button").click();

        function aprovaObraOrigem() {
            var aprovador = $("#usuarioAprovadorOrigem").val();
            var engenheiroObraOrigem = $("#engenheiroObraOrigem").val();
            var coordenadorObraOrigem = $("#coordenadorObraOrigem").val();
            var diretorObraOrigem = $("#diretorObraOrigem").val();

            if (aprovador == engenheiroObraOrigem) {
                $("#aprovadoEngenheiroObraOrigem").val("true");
            } 
            else if (aprovador == coordenadorObraOrigem) {
                $("#aprovadoCoordenadorObraOrigem").val("true");
            }
            else if (aprovador == diretorObraOrigem) {
                $("#aprovadoDiretorObraOrigem").val("true");
            }
        }
        function aprovaObraDestino() {
            var aprovador = $("#usuarioAprovadorDestino").val();
            var engenheiroObraDestino = $("#engenheiroObraDestino").val();
            var coordenadorObrDestino = $("#coordenadorObraDestino").val();
            var diretorObraOriDestino = $("#diretorObraDestino").val();

            if (aprovador == engenheiroObraDestino) {
                $("#aprovadoEngenheiroObraDestino").val("true");
            } 
            else if (aprovador == coordenadorObrDestino) {
                $("#aprovadoCoordenadorObraDestino").val("true");
            }
            else if (aprovador == diretorObraOriDestino) {
                $("#aprovadoDiretorObraDestino").val("true");
            }
        }
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
            var perfil = value.split(" - ")[2];
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra(CODCOLIGADA, perfil, "1.1.02", "9999999999999"));
            $("#engenheiroObraOrigem").val(aprovadores.engenherio);
            $("#coordenadorObraOrigem").val(aprovadores.coordenador);
            $("#diretorObraOrigem").val(aprovadores.diretor);
            $("#CODCOLIGADA").val(value.split(" - ")[0]);
            $("#motivoTransferencia").change();
            loadListaItens().then(() => {
                // Inicia a tabela de itens com a Primeira Linha
                adicionaNovaTransferencia();
            });
        }
    });
    $('#ccustoObraDestino').selectize({
        onChange: async function (value, isOnInitialize) {
            var CODCOLIGADA = value.split(" - ")[0];
            var perfil = value.split(" - ")[2];
            var aprovadores = extraiAprovadoresDaLista(await promiseBuscaAprovadoresDaObra(CODCOLIGADA, perfil, "1.1.02", "9999999999999"));
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
    alteraIconesECorDosValores();
    preencheCamposDeObras();
    loadListaItens().then(() => {
        updateCounterRowsTableItens();
        carregaTabelaItensDasTransferencias();

        $(".panelTransferencia:last>.panel-heading").click();

        $(".motivoTransferencia").each(function () {
            var val = $(this).val() ? $(this).val() : $(this).text();
            $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text(val);
        });
        $(".valorTotalTransferencia").each(function () {
            var val = $(this).val() ? $(this).val() : $(this).text();
            $(this).closest(".panelTransferencia").find(".spanValorTransferencia").text(val);
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

    escondeDiretoresSeValorNoLimiteDoCoordenador();
    geraTabelaHistorico();
    marcaEmVerdeAprovados();
}


// Validacao
var beforeSendValidate = function () {
    var valida = true;

    const atividadeAtual = $("#atividade").val();
    if (atividadeAtual == ATIVIDADES.INICIO || atividadeAtual == ATIVIDADES.INICIO_0) {
        valida = validaPreenchimentoForm();
        if (valida) {
            var valorTotal = parseFloat($("#valorTotal").val());
            if (valorTotal < 200000) {
                $("#diretorObraOrigem, #diretorObraDestino").val("");
            }
        }
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

    if ($("#ccustoObraOrigem").val() == $("#ccustoObraDestino").val()) {
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