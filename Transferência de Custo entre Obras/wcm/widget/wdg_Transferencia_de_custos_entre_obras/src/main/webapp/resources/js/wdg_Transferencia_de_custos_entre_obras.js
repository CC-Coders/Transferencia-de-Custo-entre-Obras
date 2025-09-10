dataTableTransferencias = null;
transferenciasETL = {};
aprovacoesPendentes = [];
obrasPermissaoUsuario = [];
obrasPermissaoGeral = [];
GCCUSTO = null;
datatablesLanguage = {
    sEmptyTable: "Nenhum registro encontrado",
    sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
    sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
    sInfoFiltered: "(Filtrados de _MAX_ registros)",
    sInfoPostFix: "",
    sInfoThousands: ".",
    sLengthMenu: "_MENU_ resultados por página",
    sLoadingRecords: "Carregando...",
    sProcessing: "Processando...",
    sZeroRecords: "Nenhum registro encontrado",
    sSearch: "Pesquisar",
    oPaginate: {
        sNext: "Próximo",
        sPrevious: "Anterior",
        sFirst: "Primeiro",
        sLast: "Último",
    },
    oAria: {
        sSortAscending: ": Ordenar colunas de forma ascendente",
        sSortDescending: ": Ordenar colunas de forma descendente",
    },
    select: {
        rows: {
            _: "Selecionado %d linhas",
            0: "Nenhuma linha selecionada",
            1: "Selecionado 1 linha",
        },
    },
    buttons: {
        copy: "Copiar para a área de transferência",
        copyTitle: "Cópia bem sucedida",
        copySuccess: {
            1: "Uma linha copiada com sucesso",
            _: "%d linhas copiadas com sucesso",
        },
    },
};

var wdgTransfCusto = SuperWidget.extend({
    init: function () {
        init();
    },
});

function init() {
    if (WCMAPI.isMobileAppMode()) {
        $("#dashboard").hide();
        $("#painelAprovacoes").show();
        asyncBuscaSolicitacoesPendentes(WCMAPI.userCode);
    } else {
        $("#dashboard").show();
        $("#painelAprovacoes").hide();
        toggleDarkMode();
    }

    $('#filtroColigadaOrigem').selectize();
    $('#filtroCCUSTOOrigem').selectize({
        onChange: async function (value, isOnInitialize) {
            if (value == "1.1.001 - Matriz Curitiba") {
                var CODCOLIGADA = $("#filtroColigadaOrigem").val().split(" - ")[0];
                var DEPTO = consultaDepartamentos(CODCOLIGADA);
                geraOptionsDepartamentos("filtroDepartamentoOrigem", DEPTO);
                $("#filtroDepartamentoOrigem").closest("div").show();
            }else{
                $("#filtroDepartamentoOrigem").closest("div").hide();
            }
        }
    });
    $("#filtroDepartamentoOrigem").selectize();
    

    GCCUSTO = DatasetFactory.getDataset("GCCUSTO", null, null, null).values;
    PreencheCamposFiltros();
    initDataTableTransferencias();
    consultaTransferencias();
    alimentaCharts();
    promiseBuscaAprovacoesPendentesProUsuario(WCMAPI.userCode).then((e) => {
        if (e.length == 0) {
            $("#cardAprovacoesPendentes").hide();
        } else {
            $("#cardAprovacoesPendentes").show();
            $("#counterAprovacaoPendente").text(e.length);
        }
    });
    $("#filtros>.panel-heading").on("click", () => {
        $("#filtros>.panel-body").slideToggle();
        $("#arrowFiltro").toggleClass("flaticon-chevron-up");
        $("#arrowFiltro").toggleClass("flaticon-chevron-down");
    });
    $("#cardAprovacoesPendentes").on("click", () => {
        $("#dashboard").hide();
        $("#painelAprovacoes").show();
        asyncBuscaSolicitacoesPendentes(WCMAPI.userCode);
    });

    $("#btnDarkMode").on("click", toggleDarkMode);

    $("#btnConsultaTransferencias").on("click", function () {
        consultaTransferencias();
        alimentaCharts();
    });

    $("#filtroColigadaOrigem").on("change", function () {
        var CODCOLIGADA = $(this).val().split(" - ")[0];
        var obras = obrasPermissaoUsuario.filter((e) => e.CODCOLIGADA == CODCOLIGADA);
        var options = [{value:"",text:"Todos"}];

       obras.forEach((e) => {options.push({value:`${e.CODCCUSTO} - ${e.perfil}`, text:`${e.CODCCUSTO} - ${e.perfil}`})});

        $("#filtroCCUSTOOrigem")[0].selectize.addOption(options);
    });


    var date = new Date();
    var mes = date.getMonth() + 1;
    mes = mes < 10 ? "0" + mes : mes;
    var ano = date.getFullYear();
    $("#textPeriodo").text(mes + "/" + ano);
}

// Datatable
function consultaTransferencias() {
    var ds = DatasetFactory.getDataset("dsConsultaTransferenciasDeCusto", null, buscaFiltros(), null);
    if (ds.values[0].STATUS != "SUCCESS") {
        showMessage("Erro ao Consultar Trânsferencias: ", ds.values[0].MENSAGEM, "warning");
    }
    transferencias = JSON.parse(ds.values[0].RESULT);

    var transferenciasCUSTO = transferencias.filter((e) => e.TRANSFERE_CUSTO == "true");
    var transferenciasCUSTO_ORIGEM = [];
    var transferenciasCUSTO_DESTINO = [];
    for (const row of transferenciasCUSTO) {
        var CCUSTO_ORIGEM = row.CCUSTO_ORIGEM;
        var CODCOLIGADA_ORIGEM = row.CODCOLIGADA_ORIGEM;
        if (($("#filtroCCUSTOOrigem").val() == "" || $("#filtroCCUSTOOrigem").val().split(" - ")[0] == CCUSTO_ORIGEM) && ($("#filtroColigadaOrigem").val() == "" || $("#filtroColigadaOrigem").val().split(" - ")[0] == CODCOLIGADA_ORIGEM)) {
            var found_ORIGEM = obrasPermissaoUsuario.find((e) => e.CODCCUSTO == CCUSTO_ORIGEM);
            if (found_ORIGEM || usuarioComPermissaoGeral()) {
                transferenciasCUSTO_ORIGEM.push(row);
            }
        }

        var CCUSTO_DESTINO = row.CCUSTO_DESTINO;
        var CODCOLIGADA_DESTINO = row.CODCOLIGADA_DESTINO;
        if (($("#filtroCCUSTOOrigem").val() == "" || $("#filtroCCUSTOOrigem").val().split(" - ")[0] == CCUSTO_DESTINO) && ($("#filtroColigadaOrigem").val() == "" || $("#filtroColigadaOrigem").val().split(" - ")[0] == CODCOLIGADA_DESTINO)) {
            var found_DESTINO = obrasPermissaoUsuario.find((e) => e.CODCCUSTO == CCUSTO_DESTINO);
            if (found_DESTINO || usuarioComPermissaoGeral()) {
                transferenciasCUSTO_DESTINO.push(row);
            }
        }
    }
    transferenciasCUSTO = {
        ORIGEM: transferenciasCUSTO_ORIGEM,
        DESTINO: transferenciasCUSTO_DESTINO,
    };

    var transferenciasRECEITA = transferencias.filter((e) => e.TRANSFERE_RECEITA == "true");
    var transferenciasRECEITA_ORIGEM = [];
    var transferenciasRECEITA_DESTINO = [];
    for (const row of transferenciasRECEITA) {
        var CCUSTO_ORIGEM = row.CCUSTO_ORIGEM;
        if ($("#filtroCCUSTOOrigem").val() == "" || $("#filtroCCUSTOOrigem").val().split(" - ")[0] == CCUSTO_ORIGEM) {
            var found_ORIGEM = obrasPermissaoUsuario.find((e) => e.CODCCUSTO == CCUSTO_ORIGEM);
            if (found_ORIGEM ||usuarioComPermissaoGeral()) {
                transferenciasRECEITA_ORIGEM.push(row);
            }
        }

        var CCUSTO_DESTINO = row.CCUSTO_DESTINO;
        if ($("#filtroCCUSTOOrigem").val() == "" || $("#filtroCCUSTOOrigem").val().split(" - ")[0] == CCUSTO_DESTINO) {
            var found_DESTINO = obrasPermissaoUsuario.find((e) => e.CODCCUSTO == CCUSTO_DESTINO);
            if (found_DESTINO || usuarioComPermissaoGeral()) {
                transferenciasRECEITA_DESTINO.push(row);
            }
        }
    }

    transferenciasRECEITA = {
        ORIGEM: transferenciasRECEITA_ORIGEM,
        DESTINO: transferenciasRECEITA_DESTINO,
    };

    transferenciasETL = {
        CUSTO: transferenciasCUSTO,
        RECEITA: transferenciasRECEITA,
    };

    dataTableTransferencias.clear().draw();
    var linhasIncluidas = [];
    for (const tipo of [transferenciasETL.CUSTO.ORIGEM, transferenciasETL.CUSTO.DESTINO, transferenciasETL.RECEITA.ORIGEM, transferenciasETL.RECEITA.DESTINO]) {
        for (const row of tipo) {
            row.DESC_CCUSTO_ORIGEM = findDescCCUSTO(row.CODCOLIGADA_ORIGEM, row.CCUSTO_ORIGEM);
            row.DESC_CCUSTO_DESTINO = findDescCCUSTO(row.CODCOLIGADA_DESTINO, row.CCUSTO_DESTINO);

            var found = linhasIncluidas.find((e) => e == row.ID_TRANSFERENCIA);
            if (!found) {
                dataTableTransferencias.row.add(row);
                linhasIncluidas.push(row.ID_TRANSFERENCIA);
            }
        }
    }
    dataTableTransferencias.draw();

    totalizaCabecalhos(transferenciasCUSTO, transferenciasRECEITA);

    function buscaFiltros() {
        var constraints = [];

        var CODCOLIGADA_ORIGEM = $("#filtroColigadaOrigem").val().split(" - ")[0];
        if (CODCOLIGADA_ORIGEM) {
            constraints.push(DatasetFactory.createConstraint("CODCOLIGADA_ORIGEM", CODCOLIGADA_ORIGEM, CODCOLIGADA_ORIGEM, ConstraintType.MUST));
        }

        var CCUSTO_ORIGEM = $("#filtroCCUSTOOrigem").val().split(" - ")[0];
        if (CCUSTO_ORIGEM) {
            constraints.push(DatasetFactory.createConstraint("CCUSTO_ORIGEM", CCUSTO_ORIGEM, CCUSTO_ORIGEM, ConstraintType.MUST));
        }

        var TIPO = $("#filtroTipoTransferencia").val();
        if (TIPO) {
            constraints.push(DatasetFactory.createConstraint("TIPO", TIPO, TIPO, ConstraintType.MUST));
        }

        var STATUS = $("#filtroStatus").val();
        if (STATUS) {
            constraints.push(DatasetFactory.createConstraint("STATUS", STATUS, STATUS, ConstraintType.MUST));
        }

        var DEPTO = $("#filtroDepartamentoOrigem").val();
        if (DEPTO) {
            constraints.push(DatasetFactory.createConstraint("DEPTO", DEPTO, DEPTO, ConstraintType.MUST));
        }

        return constraints;
    }
    function totalizaCabecalhos(transferenciasCUSTO, transferenciasRECEITA) {
        var valorTotalReceitaEnviada = 0;
        for (const row of transferenciasRECEITA.ORIGEM) {
            var valor = parseFloat(row.VALOR);
            valorTotalReceitaEnviada += valor;
        }

        var valorTotalReceitaRecebida = 0;
        for (const row of transferenciasRECEITA.DESTINO) {
            var valor = parseFloat(row.VALOR);
            valorTotalReceitaRecebida += valor;
        }

        var valorTotalCustoEnviado = 0;
        for (const row of transferenciasCUSTO.ORIGEM) {
            var valor = parseFloat(row.VALOR);
            valorTotalCustoEnviado += valor;
        }

        var valorTotalCustoRecebido = 0;
        for (const row of transferenciasCUSTO.DESTINO) {
            var valor = parseFloat(row.VALOR);
            valorTotalCustoRecebido += valor;
        }

        $("#textValorTotalReceitaRecebida").text(floatToMoney(valorTotalReceitaRecebida));
        $("#textValorTotalReceitaEnviada").text(floatToMoney(valorTotalReceitaEnviada));
        $("#textValorTotalCustoRecebido").text(floatToMoney(valorTotalCustoRecebido));
        $("#textValorTotalCustoEnviado").text(floatToMoney(valorTotalCustoEnviado));
    }
    function findDescCCUSTO(CODCOLIGADA, CODCCUSTO) {
        var found = GCCUSTO.find((e) => e.CODCOLIGADA == CODCOLIGADA && e.CODCCUSTO == CODCCUSTO);
        return found.NOME;
    }
}
function initDataTableTransferencias() {
    dataTableTransferencias = new DataTable("#tableTransferencias", {
        pageLength: 10,
        responsive: true,
        fixedHeader: true,
        columns: [
            {
                data: "ID_SOLICITACAO",
                className: "alignCenter",
                render: function (data) {
                    return `<a style="color: skyblue;text-decoration: underline;" href="/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=${data}" target="_blank">${data}</a>`;
                },
            },
            {
                data: "TIPO",
                className: "alignCenter",
            },
            {
                data: "CCUSTO_ORIGEM",
                className: "alignCenter",
                render: function (data, type, row) {
                    return row.CODCOLIGADA_ORIGEM + " - " + row.CCUSTO_ORIGEM + " - " + row.DESC_CCUSTO_ORIGEM;
                },
                class: "nowrap",
                type: "string",
            },
            {
                data: "CCUSTO_DESTINO",
                className: "alignCenter",
                render: function (data, type, row) {
                    return row.CODCOLIGADA_DESTINO + " - " + row.CCUSTO_DESTINO + " - " + row.DESC_CCUSTO_DESTINO;
                },
                class: "nowrap",
                type: "string",
            },
            {
                data: "SOLICITANTE",
                className: "alignCenter",
            },
            {
                data: "VALOR",
                type: "num",
                className: "alignCenter",
                className: "dt-left",
                render: function (data, type) {
                    if (type === "sort") {
                        return parseFloat(data);
                    } else {
                        return "<span style='white-space:nowrap;'>" + floatToMoney(data) + "</span>";
                    }
                },
            },
            {
                data: "DATA_SOLICITACAO",
                className: "alignCenter",
                render: function (data, type) {
                    if (type === "sort") {
                        return moment(data, "YYYY-MM-DD").valueOf();
                    } else {
                        return moment(data, "YYYY-MM-DD").format("DD/MM/YYYY");
                    }
                },
            },
            {
                data: "DATA_COMPETENCIA",
                className: "alignCenter",
                render: function (data, type) {
                    if (type === "sort") {
                        return moment(data, "YYYY-MM-DD").valueOf();
                    } else {
                        console.log(data);
                        if (!data || data == null || data == "" || data == "null") {
                            return "";
                        }
                        return moment(data, "YYYY-MM-DD").format("DD/MM/YYYY");
                    }
                },
            },
            {
                data: "STATUS",
                className: "alignCenter",
                render: function (data) {
                    if (data == 1) {
                        return "Em andamento";
                    } else if (data == 2) {
                        return "Finalizado";
                    } else if (data == 3) {
                        return "Cancelado";
                    } else {
                        return data;
                    }
                },
            },
            {
                data: null,
                className: "alignCenter",
                orderable: false,
                render: function (data, type, row) {
                    return `<button class="btn btn-default btnDetalhesSolicitacao">
                        <i class="flaticon flaticon-view icon-sm" aria-hidden="true"></i>
                    </button>`;
                },
            },
        ],
        language: datatablesLanguage,
        layout: {
            bottomStart: null,
            bottom: "paging",
            bottomEnd: null,
        },
    });

    dataTableTransferencias.on("draw", function () {
        $(".btnDetalhesSolicitacao")
            .off("click")
            .on("click", function () {
                var tr = $(this).closest("tr");
                var row = dataTableTransferencias.row(tr);
                var data = row.data();
                abreModalTransferencia(data.ID_SOLICITACAO);
            });
    });
}
function abreModalTransferencia(idSolicitacao) {
    var ds = DatasetFactory.getDataset(
        "dsFormTransferenciasDeCustoEntreObras",
        null,
        [
            DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST),
            DatasetFactory.createConstraint("numProces", idSolicitacao, idSolicitacao, ConstraintType.MUST),
        ],
        null
    );

    var formulario = ds.values[0];
    var documentId = formulario["metadata#id"];
    var documentVersion = formulario["metadata#version"];

    var dsItens = DatasetFactory.getDataset(
        "dsFormTransferenciasDeCustoEntreObras",
        null,
        [
            DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST),
            DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST),
            DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST),
            DatasetFactory.createConstraint("tablename", "tableTransferencias", "tableTransferencias", ConstraintType.MUST),
        ],
        null
    );

    var html = `<div class="row">
            <div class="col-md-6">
                <h3><b>Obra Origem</b></h3>
                <h3><b>${formulario.ccustoObraOrigem} ${formulario.ccustoObraOrigem == "1 - 1.1.001 - Matriz Curitiba" ? formulario.departamentoObraOrigem:""}</b></h3>
                <h4><b>Total:</b> ${formulario.valorObraOrigem}</h4>
                <br>

                <b>Engenheiro: </b><span>${formulario.engenheiroObraOrigem}</span><br>
                <b>Coordenador: </b><span>${formulario.coordenadorObraOrigem}</span><br>
                ${formulario.diretorObraOrigem ? `<b>Diretor: </b><span>${formulario.diretorObraOrigem}</span>` : ""}
            </div>
            <div class="col-md-6">
                <h3><b>Obra Destino</b></h3>
                <h3><b>${formulario.ccustoObraDestino} ${formulario.ccustoObraDestino == "1 - 1.1.001 - Matriz Curitiba" ? formulario.departamentoObraDestino:""}</b></h3>
                <h4><b>Total:</b> ${formulario.valorObraDestino}</h4>
                <br>

                <b>Engenheiro: </b><span>${formulario.engenheiroObraDestino}</span><br>
                <b>Coordenador: </b><span>${formulario.coordenadorObraDestino}</span><br>
                ${formulario.diretorObraDestino ? `<b>Diretor: </b><span>${formulario.diretorObraDestino}</span>` : ""}
            </div>
        </div>
        <div>
            ${geraLinhasTransferencias(dsItens.values)}
        </div>`;

    var TRANSFERE_CUSTO = formulario.TRANSFERE_CUSTO;
    var TRANSFERE_RECEITA = formulario.TRANSFERE_RECEITA;

    var title = `Transferência de ${TRANSFERE_CUSTO == "true" ? "Custo" : "Receita"} #${idSolicitacao}`;

    var myModal = FLUIGC.modal(
        {
            title: title,
            content: html,
            id: "fluig-modal",
            size: "full",
            actions: [
                {
                    label: "Fechar",
                    autoClose: true,
                },
            ],
        },
        function (err, data) {
            if (err) {
                // do error handling
            } else {
                // do something with data
            }
        }
    );

    function geraLinhasTransferencias(transferencias) {
        var html = "";
        var counter = 0;

        for (const transferencia of transferencias) {
            var TIPO = transferencia.motivoTransferencia;
            var MOTIVO = transferencia.textMotivoTransferencia;
            var VALOR = transferencia.valorTotalTransferencia;
            var itens = JSON.parse(transferencia.listItensTransferencia);

            counter++;
            html += `<div style="border: solid 1px black;border-radius: 20px;padding: 0px 20px; margin-bottom: 10px;">
                <h3><b>${TIPO}</b></h3>
                <b>Valor Total: </b><span>${VALOR}</span><br>
                <p><b>Motivo: </b>${MOTIVO}</p>
                <table class="table">
                    <thead>
                        <tr>
                            <th style="color:black !important;">#</th>
                            <th style="color:black !important;">Produto</th>
                            <th style="color:black !important;">Descrição</th>
                            <th style="color:black !important;">QNTD</th>
                            <th style="color:black !important;">Valor Unit.</th>
                            <th style="color:black !important;">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${geraLinhasItens(itens)}
                    </tbody>
                </table>

            </div>`;
        }

        return html;
    }
    function geraLinhasItens(itens) {
        var html = "";
        var counter = 0;
        for (const item of itens) {
            var QUANTIDADE = item.QUANTIDADE;
            var VALOR_UNITARIO = item.VALOR_UNITARIO;

            var VALOR_TOTAL = moneyToFloat(QUANTIDADE) * moneyToFloat(VALOR_UNITARIO);

            counter++;
            html += `<tr>
                    <td style="color:black !important;">${counter}</td>
                    <td style="color:black !important;">${item.CODPRODUTO} - ${item.DESCPRODUTO}</td>
                    <td style="color:black !important;">${item.DESCRICAO}</td>
                    <td style="color:black !important;">${item.QUANTIDADE} ${item.UN}</td>
                    <td style="color:black !important;">${item.VALOR_UNITARIO}</td>
                    <td style="color:black !important;">${floatToMoney(VALOR_TOTAL)}</td>
                </tr>`;
        }

        return html;
    }
}

// Charts
function alimentaCharts() {
    var colorsEnvio = ["#9ef01a", "#38b000", "#008000", "#007200", "#004b23"];
    var colorsRecebimento = ["#250902", "#38040e", "#640d14", "#800e13", "#ad2831"];

    // Carrega Envio de Custo
    var envioCustoPorObra = [];
    var index = 0;
    for (const transferencia of transferenciasETL.CUSTO.ORIGEM) {
        var CCustoObraOrigem = transferencia.CCUSTO_ORIGEM;
        var VALOR = parseFloat(transferencia.VALOR);

        var found = envioCustoPorObra.find((e) => {
            return e.CCUSTO == CCustoObraOrigem;
        });
        if (found) {
            found.value += VALOR;
            found.transferencias.push(transferencia);
        } else {
            envioCustoPorObra.push({
                index: index,
                CODCOLIGADA : transferencia.CODCOLIGADA_ORIGEM,
                CCUSTO: CCustoObraOrigem,
                NOME: transferencia.DESC_CCUSTO_ORIGEM,
                label: transferencia.CODCOLIGADA_ORIGEM + " - " +  CCustoObraOrigem + " - " + transferencia.DESC_CCUSTO_ORIGEM,
                value: VALOR,
                transferencias: [transferencia],
            });
            index++;
        }
    }
    envioCustoPorObra = envioCustoPorObra.sort((a, b) => b.value - a.value);
    console.log(envioCustoPorObra);
    loadChart1("chart1", envioCustoPorObra, colorsEnvio);

    // Carrega Recebimento de Custo
    var recebimentoCustoPorObra = [];
    var index = 0;
    for (const transferencia of transferenciasETL.CUSTO.DESTINO) {
        var CCustoObraDestino = transferencia.CCUSTO_DESTINO;
        var VALOR = parseFloat(transferencia.VALOR);
        var found = recebimentoCustoPorObra.find((e) => {
            return e.CCUSTO == CCustoObraDestino;
        });
        if (found) {
            found.value += VALOR;
            found.transferencias.push(transferencia);
        } else {
            recebimentoCustoPorObra.push({
                index: index,
                CODCOLIGADA: transferencia.CODCOLIGADA_DESTINO,
                CCUSTO: CCustoObraDestino,
                NOME: transferencia.DESC_CCUSTO_DESTINO,
                label: transferencia.CODCOLIGADA_DESTINO + " - " + CCustoObraDestino + " - " + transferencia.DESC_CCUSTO_DESTINO,
                value: VALOR,
                transferencias: [transferencia],
            });
            index++;
        }
    }
    recebimentoCustoPorObra = recebimentoCustoPorObra.sort((a, b) => b.value - a.value);
    loadChart1("chart2", recebimentoCustoPorObra, colorsRecebimento);

    // Carrega Envio de Receita
    var envioReceitaPorObra = [];
    var index = 0;
    for (const transferencia of transferenciasETL.RECEITA.ORIGEM) {
        var CCustoObraOrigem = transferencia.CCUSTO_ORIGEM;
        var VALOR = parseFloat(transferencia.VALOR);

        var found = envioReceitaPorObra.find((e) => {
            return e.CCUSTO == CCustoObraOrigem;
        });
        if (found) {
            found.value += VALOR;
            found.transferencias.push(transferencia);
        } else {
            envioReceitaPorObra.push({
                index: index,
                CODCOLIGADA: transferencia.CODCOLIGADA_ORIGEM,
                CCUSTO: CCustoObraOrigem,
                NOME: transferencia.DESC_CCUSTO_ORIGEM,
                label:transferencia.CODCOLIGADA_ORIGEM +" - "+ CCustoObraOrigem + " - " + transferencia.DESC_CCUSTO_ORIGEM,
                value: VALOR,
                transferencias: [transferencia],
            });
        }
    }
    envioReceitaPorObra = envioReceitaPorObra.sort((a, b) => b.value - a.value);
    loadChart1("chart4", envioReceitaPorObra, colorsRecebimento);

    // Carrega Recebimento de Receita
    var recebimentoReceitaPorObra = [];
    var index = 0;

    for (const transferencia of transferenciasETL.RECEITA.DESTINO) {
        var CCustoObraDestino = transferencia.CCUSTO_DESTINO;
        var VALOR = parseFloat(transferencia.VALOR);
        var found = recebimentoReceitaPorObra.find((e) => {
            return e.CCUSTO == CCustoObraDestino;
        });
        if (found) {
            found.value += VALOR;
            found.transferencias.push(transferencia);
        } else {
            recebimentoReceitaPorObra.push({
                index: index,
                CODCOLIGADA: transferencia.CODCOLIGADA_DESTINO,
                CCUSTO: CCustoObraDestino,
                NOME: transferencia.DESC_CCUSTO_DESTINO,
                label:transferencia.CODCOLIGADA_DESTINO + " - " + CCustoObraDestino + " - " + transferencia.DESC_CCUSTO_DESTINO,
                value: VALOR,
                transferencias: [transferencia],
            });
            index++;
        }
    }
    recebimentoReceitaPorObra = recebimentoReceitaPorObra.sort((a, b) => b.value - a.value);
    loadChart1("chart3", recebimentoReceitaPorObra, colorsEnvio);

    var enviosCusto = [];
    for (const obra of envioCustoPorObra) {
        for (const transferencia of obra.transferencias) {
            var data = transferencia.DATA_COMPETENCIA;
            if (!data) {
                data = getDataHoje();
            }
            var [ano, mes, dia] = data.split(" ")[0].split("-");
            var date = new Date(ano, mes - 1, 1);
            enviosCusto.push({ date: date, value: parseFloat(transferencia.VALOR) });
        }
    }
    var groupedEnviosCusto = [];
    for (const row of enviosCusto) {
        var found = groupedEnviosCusto.find((e) => e.date.getTime() == row.date.getTime());
        if (found) {
            found.value += row.value;
        } else {
            groupedEnviosCusto.push(row);
        }
    }
    groupedEnviosCusto = groupedEnviosCusto.sort((a, b) => a.date.getTime() - b.date.getTime());
    groupedEnviosCusto = insereMesesFaltando(groupedEnviosCusto);

    var recebimentoCusto = [];
    for (const obra of recebimentoCustoPorObra) {
        for (const transferencia of obra.transferencias) {
            var data = transferencia.DATA_COMPETENCIA;
            if (!data) {
                data = getDataHoje();
            }
            var [ano, mes, dia] = data.split(" ")[0].split("-");
            var date = new Date(ano, mes - 1, 1);
            recebimentoCusto.push({ date: date, value: parseFloat(transferencia.VALOR) });
        }
    }
    var groupedRecebimentoCusto = [];
    for (const row of recebimentoCusto) {
        var found = groupedRecebimentoCusto.find((e) => e.date.getTime() == row.date.getTime());
        if (found) {
            found.value += row.value;
        } else {
            groupedRecebimentoCusto.push(row);
        }
    }
    groupedRecebimentoCusto = groupedRecebimentoCusto.sort((a, b) => a.date.getTime() - b.date.getTime());
    groupedRecebimentoCusto = insereMesesFaltando(groupedRecebimentoCusto);

    var enviosReceita = [];
    for (const obra of envioReceitaPorObra) {
        for (const transferencia of obra.transferencias) {
            var data = transferencia.DATA_COMPETENCIA;
            if (!data) {
                data = getDataHoje();
            }
            var [ano, mes, dia] = data.split(" ")[0].split("-");
            var date = new Date(ano, mes - 1, 1);
            enviosReceita.push({ date: date, value: parseFloat(transferencia.VALOR) });
        }
    }
    var groupedEnviosReceita = [];
    for (const row of enviosReceita) {
        var found = groupedEnviosReceita.find((e) => e.date.getTime() == row.date.getTime());
        if (found) {
            found.value += row.value;
        } else {
            groupedEnviosReceita.push(row);
        }
    }
    groupedEnviosReceita = groupedEnviosReceita.sort((a, b) => a.date.getTime() - b.date.getTime());

    var recebimentoReceita = [];
    for (const obra of recebimentoReceitaPorObra) {
        for (const transferencia of obra.transferencias) {
            var data = transferencia.DATA_COMPETENCIA;
            if (!data) {
                data = getDataHoje();
            }
            var [ano, mes, dia] = data.split(" ")[0].split("-");
            var date = new Date(ano, mes - 1, 1);
            recebimentoReceita.push({ date: date, value: parseFloat(transferencia.VALOR) });
        }
    }
    var groupedRecebimentoReceita = [];
    for (const row of recebimentoReceita) {
        var found = groupedRecebimentoReceita.find((e) => e.date.getTime() == row.date.getTime());
        if (found) {
            found.value += row.value;
        } else {
            groupedRecebimentoReceita.push(row);
        }
    }
    groupedRecebimentoReceita = groupedRecebimentoReceita.sort((a, b) => a.date.getTime() - b.date.getTime());

    var [minDate, maxDate] = getMinDateEMaxDate(groupedEnviosReceita, groupedRecebimentoReceita, groupedRecebimentoCusto, groupedEnviosCusto);
    console.log("minmax", minDate, maxDate);
    groupedEnviosReceita = insereMesesFaltando(groupedEnviosReceita, minDate, maxDate);
    groupedRecebimentoReceita = insereMesesFaltando(groupedRecebimentoReceita, minDate, maxDate);
    groupedRecebimentoCusto = insereMesesFaltando(groupedRecebimentoCusto, minDate, maxDate);
    groupedEnviosCusto = insereMesesFaltando(groupedEnviosCusto, minDate, maxDate);

    console.log(groupedEnviosCusto);
    console.log(groupedRecebimentoCusto);
    loadMultiLineChart("chart5", [
        { name: "Recebimentos", values: groupedRecebimentoCusto },
        { name: "Envios", values: groupedEnviosCusto },
    ]);
    loadMultiLineChart("chart6", [
        { name: "Envios", values: groupedEnviosReceita },
        { name: "Recebimentos", values: groupedRecebimentoReceita },
    ]);
}
function getMinDateEMaxDate(groupedEnviosReceita, groupedRecebimentoReceita, recebimentoCustoPorObra, envioCustoPorObra) {
    console.log(groupedEnviosReceita.length, groupedRecebimentoReceita.length, recebimentoCustoPorObra.length, envioCustoPorObra.length);
    var minDate = new Date();
    minDate.setDate(1);
    if (groupedEnviosReceita.length > 0) {
        minDate = groupedEnviosReceita[0].date;
    }
    if (groupedRecebimentoReceita.length > 0) {
        minDate = minDate.getTime() > groupedRecebimentoReceita[0].date.getTime() ? groupedRecebimentoReceita[0].date : minDate;
    }
    if (recebimentoCustoPorObra.length > 0) {
        minDate = minDate.getTime() > recebimentoCustoPorObra[0].date.getTime() ? recebimentoCustoPorObra[0].date : minDate;
    }
    if (envioCustoPorObra.length > 0) {
        minDate = minDate.getTime() > envioCustoPorObra[0].date.getTime() ? envioCustoPorObra[0].date : minDate;
    }

    var maxDate = new Date();
    maxDate.setDate(1);

    if (groupedEnviosReceita.length > 0) {
        maxDate = groupedEnviosReceita[groupedEnviosReceita.length - 1].date;
    }
    if (groupedRecebimentoReceita.length > 0) {
        maxDate =
            maxDate.getTime() < groupedRecebimentoReceita[groupedRecebimentoReceita.length - 1].date.getTime()
                ? groupedRecebimentoReceita[groupedRecebimentoReceita.length - 1].date
                : maxDate;
    }
    if (recebimentoCustoPorObra.length > 0) {
        maxDate =
            maxDate.getTime() < recebimentoCustoPorObra[recebimentoCustoPorObra.length - 1].date.getTime()
                ? recebimentoCustoPorObra[recebimentoCustoPorObra.length - 1].date
                : maxDate;
    }
    if (envioCustoPorObra.length > 0) {
        maxDate = maxDate.getTime() < envioCustoPorObra[envioCustoPorObra.length - 1].date.getTime() ? envioCustoPorObra[envioCustoPorObra.length - 1].date : maxDate;
    }

    console.log(minDate, maxDate);
    return [minDate, maxDate];
}
function insereMesesFaltando(dataset, minDate, maxDate) {
    console.log(minDate, maxDate);
    var dataVerificacao = moment(minDate);
    var DataFim = moment(maxDate);
    while (dataVerificacao <= DataFim) {
        var found = dataset.find((e) => moment(e.date).isSame(dataVerificacao, "month"));
        if (!found) {
            dataset.push({ date: dataVerificacao.toDate(), value: 0 });
        }
        dataVerificacao.add(1, "months");
    }
    dataset = dataset.sort((a, b) => a.date.getTime() - b.date.getTime());

    return dataset;
}
function atualizaChartProdutos() {
    var ds = DatasetFactory.getDataset("dsConsultaItensTransferenciasDeCusto", null, null, null);
    if (ds.values[0].STATUS != "SUCCESS") {
        throw ds.values[0].MENSAGEM;
    }

    var itens = JSON.parse(ds.values[0].RESULT);
    itens = itens.map((e) => {
        return {
            label: e.CODIGO_PRODUTO + " - " + e.DESCRICAO_PRODUTO,
            value: e.SOMA,
        };
    });

    console.log(itens);

    loadChart1("chart3", itens);
}
function loadChart1(id, data, colors) {
    if (!data) {
        data = [
            { label: "Obra Toledo II", value: getRandomInt(100) },
            { label: "Obra Estrada da Boiadeira II", value: getRandomInt(100) },
            { label: "Obra Teste", value: getRandomInt(100) },
            { label: "Obra ABCDEF", value: getRandomInt(100) },
        ];
    }

    while (data.length > 5) {
        data.pop();
    }
    const width = $("#" + id)
        .closest("div")
        .width();
    const height = 220;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeDark2);

    if (!colors) {
        colors = ["#ff8000", "#ffa600", "#ffbf00", "#ffd900", "#fff200"];
    }

    // Remove previous chart if exists
    d3.select("#" + id)
        .selectAll("*")
        .remove();

    const svg = d3
        .select("#" + id)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius - 10);

    const arcs = svg.selectAll("arc").data(pie(data)).enter().append("g");

    // Tooltip
    const tooltip = d3.select("#d3-tooltip" + id);

    // Draw slices with mouse events
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colors[d.index])
        .on("mouseover", function (event, d) {
            tooltip
                .style("display", "block")
                .attr("class", "d3-tooltip")
                .style("fill", "black")
                .html(`<strong>${d.data.label}</strong>: ${floatToMoney(d.data.value)}`);

            d3.select(this).attr("stroke", "white").attr("stroke-width", 2);
        })
        .on("mousemove", function (event) {
            var pointer = d3.pointer(event);

            tooltip.style("left", pointer[0] + 60 + "px").style("top", pointer[1] + 100 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this).attr("stroke", null);
        });

    d3.select("#legend" + id)
        .selectAll("*")
        .remove();
    var svgLegendas = d3
        .select("#legend" + id)
        .attr(
            "width",
            $("#legend" + id)
                .closest("div")
                .width()
        )
        .attr("height", 100)
        .append("g")
        .attr("transform", `translate(${20},${0})`);

    var legendHolder = svgLegendas.append("g");
    var legendLeft = legendHolder
        .selectAll(".legend")
        .data(data.slice())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return `translate(${0}, ${i * 20})`;
        });

    legendLeft
        .append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d, i) => colors[i]);

    legendLeft
        .append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .attr("class", "legendText")
        .text(function (d) {
            return d.label.replace("Obra ", "");
        });
}
function loadBarChart() {
    const data = [
        { label: "A", value: 30 },
        { label: "B", value: 80 },
        { label: "C", value: 45 },
        { label: "D", value: 60 },
        { label: "E", value: 20 },
        { label: "F", value: 90 },
        { label: "G", value: 55 },
    ];

    const width = $("#chart4").closest("div").width();
    const height = 220;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const svg = d3.select("#chart4").attr("width", width).attr("height", height);

    const x = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Tooltip div
    const tooltip = d3.select("#d3-tooltip").append("div");

    svg.append("g")
        .attr("fill", "#007bff")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.label))
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => y(0) - y(d.value))
        .attr("width", x.bandwidth())
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block").html(`<strong>${d.label}</strong>: ${d.value}`);
            d3.select(this).attr("fill", "#0056b3");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", event.pageX - 70 + "px").style("top", event.pageY - 300 + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this).attr("fill", "#007bff");
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
}
function loadMultiLineChart(id, datasets, colorList) {
    // Example datasets if not provided
    if (!datasets) {
        datasets = [
            {
                name: "Recebimento",
                values: [
                    { date: new Date(2025, 0, 1), value: 30 },
                    { date: new Date(2025, 1, 1), value: 80 },
                    { date: new Date(2025, 2, 1), value: 45 },
                    { date: new Date(2025, 3, 1), value: 60 },
                    { date: new Date(2025, 4, 1), value: 20 },
                    { date: new Date(2025, 5, 1), value: 90 },
                    { date: new Date(2025, 6, 1), value: 55 },
                ],
            },
            {
                name: "Envio",
                values: [
                    { date: new Date(2025, 0, 1), value: 50 },
                    { date: new Date(2025, 1, 1), value: 60 },
                    { date: new Date(2025, 2, 1), value: 35 },
                    { date: new Date(2025, 3, 1), value: 80 },
                    { date: new Date(2025, 4, 1), value: 40 },
                    { date: new Date(2025, 5, 1), value: 70 },
                    { date: new Date(2025, 6, 1), value: 65 },
                ],
            },
        ];
    }
    console.log("dataset", datasets);
    if (!colorList) colorList = ["#dd0426", "#38b000", "#008000", "#ad2831"];

    // Defensive: ensure all dates are Date objects
    datasets.forEach((serie) => {
        serie.values.forEach((point) => {
            if (!(point.date instanceof Date)) {
                // Try to parse string date (YYYY-MM-DD or similar)
                if (typeof point.date === "string") {
                    let d = new Date(point.date);
                    if (!isNaN(d)) {
                        point.date = d;
                    }
                }
            }
        });
    });

    const width =
        $("#" + id)
            .closest("div")
            .width() || 350;
    const height = 320;
    // Increased left margin for Y axis labels
    const margin = { top: 20, right: 20, bottom: 40, left: 70 };

    d3.select("#" + id)
        .selectAll("*")
        .remove();

    const svg = d3
        .select("#" + id)
        .attr("width", width)
        .attr("height", height);

    // Flatten all values to get global x/y domains
    const allValues = datasets.flatMap((d) => d.values);

    const x = d3
        .scaleTime()
        .domain(d3.extent(allValues, (d) => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(allValues, (d) => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Horizontal grid lines (Y)
    svg.append("g")
        .attr("class", "grid grid-y")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
            d3
                .axisLeft(y)
                .ticks(6)
                .tickSize(-width + margin.left + margin.right)
                .tickFormat("")
        )
        .selectAll("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "2,2");

    // Vertical grid lines (X)
    svg.append("g")
        .attr("class", "grid grid-x")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
            d3
                .axisBottom(x)
                .ticks(6)
                .tickSize(-height + margin.top + margin.bottom)
                .tickFormat("")
        )
        .selectAll("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "2,2");

    // Color scale
    const color = d3
        .scaleOrdinal()
        .domain(datasets.map((d) => d.name))
        .range(colorList);

    // Line generator
    const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.value));

    // Draw lines
    datasets.forEach((serie, i) => {
        svg.append("path").datum(serie.values).attr("fill", "none").attr("stroke", color(serie.name)).attr("stroke-width", 2).attr("d", line);

        // Tooltip div (should exist in your HTML)
        const tooltip = d3.select("#d3-tooltip" + id);

        // Draw points with tooltip
        svg.selectAll(".point-" + i)
            .data(serie.values)
            .join("circle")
            .attr("class", "point-" + i)
            .attr("cx", (d) => x(d.date))
            .attr("cy", (d) => y(d.value))
            .attr("r", 6)
            .attr("fill", color(serie.name))
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block").html(`<strong>${serie.name}</strong><br>${d3.timeFormat("%b/%Y")(d.date)}<br>Valor: ${floatToMoney(d.value)}`);
                d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
            })
            .on("mousemove", function (event) {
                var pointer = d3.pointer(event);
                tooltip.style("left", pointer[0] - 50 + "px").style("top", pointer[1] + 70 + "px");
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
                d3.select(this).attr("stroke", null);
            });
    });

    // 1. Get unique months from your dataset
    const uniqueMonths = Array.from(new Set(allValues.map((d) => d3.timeMonth(d.date).getTime()))).map((t) => new Date(t));

    // 2. Set the ticks to these months, with pt-BR month abbreviations
    const ptBrMonths = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    function ptBrMonthFormat(date) {
        const m = date.getMonth();
        const y = date.getFullYear().toString().slice(-2);
        return ptBrMonths[m] + "/" + y;
    }
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(uniqueMonths).tickFormat(ptBrMonthFormat));

    // Y Axis with money format
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
            d3.axisLeft(y).tickFormat(function (d) {
                return floatToMoney(d).split(",")[0];
            })
        );

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${(width - margin.right) / 2 - 50},${height - 20})`);

    datasets.forEach((serie, i) => {
        const legendRow = legend.append("g").attr("transform", `translate(${i * 120},0)`);
        legendRow.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(serie.name));
        legendRow.append("text").attr("x", 20).attr("y", 12).attr("fill", "#fff").text(serie.name);
    });
}
function loadGroupedBarChart(id, data, groupKeys, colors) {
    // Example data if not provided
    if (!data) {
        data = [
            { group: "A", value1: 30, value2: 50 },
            { group: "B", value1: 80, value2: 35 },
            { group: "C", value1: 45, value2: 60 },
            { group: "D", value1: 60, value2: 40 },
        ];
        groupKeys = ["value1", "value2"];
        colors = ["#38b000", "#a50104"];
    }

    const width = $("#" + id)
        .closest("div")
        .width();
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Remove previous chart if exists
    d3.select("#" + id)
        .selectAll("*")
        .remove();

    const svg = d3
        .select("#" + id)
        .attr("width", width)
        .attr("height", height);

    // X0: group position
    const x0 = d3
        .scaleBand()
        .domain(data.map((d) => d.group))
        .range([margin.left, width - margin.right])
        .paddingInner(0.1);

    // X1: subgroup position within group
    const x1 = d3.scaleBand().domain(groupKeys).range([0, x0.bandwidth()]).padding(0.05);

    // Y: value
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d3.max(groupKeys, (key) => d[key]))])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Color
    const color = d3.scaleOrdinal().domain(groupKeys).range(colors);

    // Tooltip
    const tooltip = d3.select("#d3-tooltip");

    // Draw bars
    svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", (d) => `translate(${x0(d.group)},0)`)
        .selectAll("rect")
        .data((d) => groupKeys.map((key) => ({ key, value: d[key], group: d.group })))
        .join("rect")
        .attr("x", (d) => x1(d.key))
        .attr("y", (d) => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", (d) => y(0) - y(d.value))
        .attr("fill", (d) => color(d.key))
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block").html(`<strong>${d.group}</strong><br>${d.key}: ${d.value}`);
            d3.select(this).attr("fill", d3.rgb(color(d.key)).darker(1));
        })
        .on("mousemove", function (event) {
            tooltip.style("left", event.pageX - 50 + "px").style("top", event.pageY - 40 + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.style("display", "none");
            d3.select(this).attr("fill", color(d.key));
        });

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0));

    // Y Axis
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - margin.right - 100},${margin.top})`);

    groupKeys.forEach((key, i) => {
        const legendRow = legend.append("g").attr("transform", `translate(0,${i * 20})`);
        legendRow.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(key));
        legendRow.append("text").attr("x", 20).attr("y", 12).attr("fill", "#333").text(key);
    });
}

// Filtros
function PreencheCamposFiltros() {
    var USUARIO = WCMAPI.userCode;

    var obrasComPermissaoDoUsuario = buscaObrasPorPermissaoDoUsuario(USUARIO, usuarioComPermissaoGeral());
    var todasObras = buscaObrasPorPermissaoDoUsuario(USUARIO, true);

    var coligadasPermissaoUsuario = [];
    for (const obra of obrasComPermissaoDoUsuario) {
        if (!coligadasPermissaoUsuario.find((e) => e.CODCOLIGADA == obra.CODCOLIGADA)) {
            coligadasPermissaoUsuario.push({ CODCOLIGADA: obra.CODCOLIGADA, NOME: obra.NOMEFANTASIA });
        }
    }

    var coligadas = [];
    for (const obra of todasObras) {
        if (!coligadas.find((e) => e.CODCOLIGADA == obra.CODCOLIGADA)) {
            coligadas.push({ CODCOLIGADA: obra.CODCOLIGADA, NOME: obra.NOMEFANTASIA });
        }
    }

    $("#filtroColigadaOrigem")[0].selectize.addOption(geraOptionsSelectize(coligadasPermissaoUsuario));

    obrasPermissaoGeral = todasObras;
    obrasPermissaoUsuario = obrasComPermissaoDoUsuario;

    function geraOptionsSelectize(coligadas) {
        var options = []

        options.push({value:"",text:"Todas"});
        for (const coligada of coligadas) {
            options.push({value:`${coligada.CODCOLIGADA} - ${coligada.NOME}`,text:`${coligada.CODCOLIGADA} - ${coligada.NOME}`});
        }

        return options;
    }
}
function consultaDepartamentos(CODCOLIGADA){
    var ds = DatasetFactory.getDataset("GDEPTO",["CODDEPARTAMENTO","NOME"],[
        DatasetFactory.createConstraint("CODCOLIGADA",CODCOLIGADA,CODCOLIGADA,ConstraintType.MUST),
        DatasetFactory.createConstraint("ATIVO","T","T",ConstraintType.MUST),
        DatasetFactory.createConstraint("CODFILIAL","1","1",ConstraintType.MUST),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.01","1.2.01",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.04","1.2.04",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.05","1.2.05",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.06","1.2.06",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.07","1.2.07",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.09","1.2.09",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.13","1.2.13",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.19","1.2.19",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.21","1.2.21",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.30","1.2.30",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.31","1.2.31",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.34","1.2.34",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.37","1.2.37",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.38","1.2.38",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.43","1.2.43",ConstraintType.SHOULD),
    ],null);

    if (ds.values.length == 0) {
        return [];
    }

    return ds.values;
}
function geraOptionsDepartamentos(ID, deptos){
    $("#"+ID)[0].selectize.addOption(deptos.map(e=>{return {value:`${e.CODDEPARTAMENTO}`, text:`${e.CODDEPARTAMENTO} - ${e.NOME}`}}));
}

// Aprova Solicitação
function promiseBuscaAprovacoesPendentesProUsuario(userCode) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `/process-management/api/v2/tasks?assignee=${userCode}&status=NOT_COMPLETED&processId=Transferência de Custo entre Obras&page=1&pageSize=1000`,
            success: (retorno) => {
                resolve(retorno.items);
            },
            error: (e) => {
                reject(e);
            },
        });
    });
}
async function asyncBuscaSolicitacoesPendentes(user) {
    var solicitacoes = await promiseBuscaAprovacoesPendentesProUsuario(user);
    var data = await promiseBuscaDadosDaSolicitacao(solicitacoes[0].processInstanceId);

    var movementSequence = solicitacoes[0].movementSequence;
    var atividade = solicitacoes[0].state.sequence;

    $("#btnAprovar")
        .off("click")
        .on("click", function () {
            Swal.fire({
                icon: "info",
                title: "Aprovando, por favor aguarde...",
                showConfirmButton: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            MovimentarProcesso(solicitacoes[0].processInstanceId, "Aprovado", "Aprovado", movementSequence, user);
        });
    $("#btnReprovar")
        .off("click")
        .on("click", function () {
            if ($("#textAreaObservacao").val() == "") {
                showMessage("Necessário informar a Observação para Reprovar!", "", "warning");
                return;
            }

            Swal.fire({
                icon: "info",
                title: "Reprovando, por favor aguarde...",
                showConfirmButton: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            MovimentarProcesso(solicitacoes[0].processInstanceId, "Reprovado", "Reprovado", movementSequence, user);
        });

    preencheFormulario(data);

    async function preencheFormulario(data) {
        // Solicitação
        $("#textAprovacaoNumProcess").text(data.numProces);
        $("#textAprovacaoSolicitante").text(data.solicitante);
        $("#textAprovacaoValorTotal").text(floatToMoney(data.valorTotal));

        // Obra Origem
        $("#textAprovacaoTipoOrigem").text(data.TRANSFERE_CUSTO == "true" ? "(redução de custo)" : "(redução de receita)");
        $("#textAprovacaoObraOrigem").text(data.ccustoObraOrigem);
        $("#textAprovacaoEngenheiroOrigem").text(data.engenheiroObraOrigem);
        $("#textAprovacaoCoordenadorOrigem").text(data.coordenadorObraOrigem);
        $("#textAprovacaoDiretorOrigem").text(data.diretorObraOrigem);

        // Obra Destino
        $("#textAprovacaoTipoDestino").text(data.TRANSFERE_CUSTO == "true" ? "(aumento de custo)" : "(aumento de receita)");
        $("#textAprovacaoObraDestino").text(data.ccustoObraDestino);
        $("#textAprovacaoEngenheiroDestino").text(data.engenheiroObraDestino);
        $("#textAprovacaoCoordenadorDestino").text(data.coordenadorObraDestino);
        $("#textAprovacaoDiretorDestino").text(data.diretorObraDestino);

        var documentId = data["metadata#id"];
        var documentVersion = data["metadata#version"];
        var transferencias = await promiseBuscaTransferencias(documentId, documentVersion);
        preencheTransferencias(transferencias);

        var historico = await promiseBuscaHistorico(documentId, documentVersion);
        console.log(historico);
        geraTabelaHistorico(historico);

        function promiseBuscaTransferencias(documentId, documentVersion) {
            return new Promise((resolve, reject) => {
                DatasetFactory.getDataset(
                    "dsFormTransferenciasDeCustoEntreObras",
                    null,
                    [
                        DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST),
                        DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST),
                        DatasetFactory.createConstraint("tablename", "tableTransferencias", "tableTransferencias", ConstraintType.MUST),
                    ],
                    null,
                    {
                        success: (ds) => {
                            resolve(ds.values);
                        },
                        error: (e) => {
                            reject(e);
                        },
                    }
                );
            });
        }
        function preencheTransferencias(transferencias) {
            var html = "";
            for (const transferencia of transferencias) {
                html += 
                `<div class="panel panel-primary">
                    <div class="panel-heading">
                        <h3 class="panel-title">
                            <div style="display: flex;justify-content: space-between;">
                                <span>${transferencia.motivoTransferencia}</span> 
                                <span>${transferencia.valorTotalTransferencia}</span>
                            </div>
                        </h3>
                    </div>
                    <div class="panel-body" style="background-color: darkgray !important;">
                        <b>Justificativa: </b><p>${transferencia.textMotivoTransferencia}</p>
                        <br/>
                        <div class="row">
                            ${geraHtmlItensTransferencia(transferencia.listItensTransferencia)}
                        </div>
                    </div>
                </div>`;
            }

            $("#divTransferencias").html(html);
        }
        function geraHtmlItensTransferencia(itens) {
            itens = JSON.parse(itens);
            var html = "";
            var counter = 0;
            for (const item of itens) {
                counter++;
                html += 
                `<div class="col-md-3">
                    <div class="card-item">
                        <div style="display: flex;align-items: center;">
                            <div style="margin-right: 21px;">#${counter}</div>
                            <div>
                                <b>${item.CODPRODUTO} - ${item.DESCPRODUTO}</b> <br>
                                <small>${item.QUANTIDADE} ${item.UN} x ${item.VALOR_UNITARIO}</small><br>
                                <span>${item.DESCRICAO}</span><br>
                                <b>${floatToMoney(moneyToFloat(item.QUANTIDADE) * moneyToFloat(item.VALOR_UNITARIO))}</b>
                            </div>
                        </div>
                        <br>
                    </div>
                </div>`;
            }
            return html;
        }

        function promiseBuscaHistorico(documentId, documentVersion) {
            return new Promise((resolve, reject) => {
                DatasetFactory.getDataset(
                    "dsFormTransferenciasDeCustoEntreObras",
                    null,
                    [
                        DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST),
                        DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST),
                        DatasetFactory.createConstraint("tablename", "tableHistorico", "tableHistorico", ConstraintType.MUST),
                    ],
                    null,
                    {
                        success: (ds) => {
                            resolve(ds.values);
                        },
                        error: (e) => {
                            reject(e);
                        },
                    }
                );
            });
        }
        async function geraTabelaHistorico(rows) {
            rows = rows.reverse();
            for (const row of rows) {
                var html = await gerahtml(row.usuario, row.dataMovimento, row.observacao, row.movimentacao);
                $("#divLinhasHistorico").append(html);
                $(".divImageUser:last").append(await BuscaImagemUsuario(row.usuario));
            }

            async function gerahtml(usuario, dataMovimento, observacao, movimentacao) {
                dataMovimento = dataMovimento.split(" ");
                dataMovimento[0] = dataMovimento[0].split("-").reverse().join("/");
                dataMovimento = dataMovimento.join(" ");

                var nomeUsuario = BuscaNomeUsuario(usuario);

                var html = `
            <div class="" style="margin-bottom:10px;">
                <div class="card-item" style="${movimentacao == "Aprovado" ? "border:solid 1px green;" : movimentacao == "Reprovado" ? "border:solid 1px red;" : ""} ">
                    <div style="display:flex;">
                        <div class="divImageUser" style="margin-right:20px; border-radius:50%;"></div>
                        <div>
                            <h3 class="card-title" style="margin-bottom:0px;">${nomeUsuario} <small>${movimentacao}</small></h3>
                            <small>${dataMovimento}</small>
                            <p class="card-text">${observacao}</p>
                        </div>
                    </div>
                </div>
            </div>`;
                return html;
            }

            function BuscaImagemUsuario(usuario) {
                return new Promise(async (resolve, reject) => {
                    const res = await fetch("/api/public/social/image/" + usuario);
                    const blob = await res.blob();
                    const img = new Image();
                    img.width = "60";
                    img.height = "60";
                    img.classList.add("userImage");
                    img.src = URL.createObjectURL(blob);
                    await img.decode();
                    resolve(img);
                });
            }
        }
    }
}
function promiseBuscaDadosDaSolicitacao(NUMPROCES) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset(
            "dsFormTransferenciasDeCustoEntreObras",
            null,
            [
                DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST),
                DatasetFactory.createConstraint("numProces", NUMPROCES, NUMPROCES, ConstraintType.MUST),
            ],
            null,
            {
                success: (ds) => {
                    if (ds.values.length == 0) {
                        reject(`Não foi encontrado nenhum valor para a Solicitação ${NUMPROCES}`);
                    } else {
                        resolve(ds.values[0]);
                    }
                },
                error: (e) => {
                    reject(e);
                },
            }
        );
    });
}
function MovimentarProcesso(NUMPROCES, decisao, atividade, movementSequence, user) {
    $.ajax({
        url: `/process-management/api/v2/requests/${NUMPROCES}/move`,
        type: "POST",
        data: JSON.stringify({
            movementSequence: movementSequence,
            assignee: user,
            asManager: false,
            formFields: {
                decisao: decisao,
                userCode: user,
                textObservacao: $("#textAreaObservacao").val(),
                atividade: atividade,
                formMode: "",
            },
        }),
        options: {
            encoding: "UTF-8",
            mediaType: "application/json",
            useSSL: true,
        },
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
        },
        success: (retorno) => {
            if (decisao == "Reprovado") {
                setTimeout(() => {
                    movimentaOutroLado(NUMPROCES);
                }, 2000);
            } else {
                Swal.close();
                showMessage("Aprovado com sucesso!", "", "success");

                if (WCMAPI.isMobileAppMode()) {
                    asyncBuscaSolicitacoesPendentes(WCMAPI.userCode);
                } else {
                    $("#painelAprovacoes").hide();
                    $("#dashboard").show();
                    promiseBuscaAprovacoesPendentesProUsuario(WCMAPI.userCode).then((e) => {
                        if (e.length == 0) {
                            $("#cardAprovacoesPendentes").hide();
                        } else {
                            $("#cardAprovacoesPendentes").show();
                            $("#counterAprovacaoPendente").text(e.length);
                        }
                    });
                }
            }
        },
        error: (e) => {
            FLUIGC.toast({
                title: "Erro ao movimentar o processo",
                message: e,
                type: "warning",
            });
            Swal.close();
        },
    });

    function movimentaOutroLado(NUMPROCES) {
        $.get({
            url: `/process-management/api/v2/tasks?processInstanceId=${NUMPROCES}&page=1&pageSize=1000&status=NOT_COMPLETED`,
            type: "GET",
            options: {
                encoding: "UTF-8",
                mediaType: "application/json",
                useSSL: true,
            },
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
            },
            success: (data) => {
                console.log(data);
                if (data.items.length > 0) {
                    $.ajax({
                        url: `/process-management/api/v2/requests/${NUMPROCES}/move`,
                        type: "POST",
                        data: JSON.stringify({
                            movementSequence: data.items[0].movementSequence,
                            assignee: data.items[0].assignee.code,
                            asManager: false,
                            formFields: {
                                decisao: "Reprovado Automaticamente",
                            },
                        }),
                        options: {
                            encoding: "UTF-8",
                            mediaType: "application/json",
                            useSSL: true,
                        },
                        headers: {
                            "Content-Type": "application/json;charset=UTF-8",
                        },
                        success: (retorno) => {
                            Swal.close();
                            $("#painelAprovacoes").hide();
                            $("#dashboard").show();
                            showMessage("Reprovado com sucesso!", "", "success");
                            if (WCMAPI.isMobileAppMode()) {
                                asyncBuscaSolicitacoesPendentes(WCMAPI.userCode);
                            } else {
                                $("#painelAprovacoes").hide();
                                $("#dashboard").show();

                                promiseBuscaAprovacoesPendentesProUsuario(WCMAPI.userCode).then((e) => {
                                    if (e.length == 0) {
                                        $("#cardAprovacoesPendentes").hide();
                                    } else {
                                        $("#cardAprovacoesPendentes").show();
                                        $("#counterAprovacaoPendente").text(e.length);
                                    }
                                });
                            }
                        },
                        error: (e) => {
                            console.error(e);
                            Swal.close();
                            $("#painelAprovacoes").hide();
                            $("#dashboard").show();
                            promiseBuscaAprovacoesPendentesProUsuario(WCMAPI.userCode).then((e) => {
                                if (e.length == 0) {
                                    $("#cardAprovacoesPendentes").hide();
                                } else {
                                    $("#cardAprovacoesPendentes").show();
                                    $("#counterAprovacaoPendente").text(e.length);
                                }
                            });
                        },
                    });
                }
            },
        });
    }
}


function usuarioComPermissaoGeral(){
    var ds = DatasetFactory.getDataset("colleagueGroup",null,[
        DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST),
        DatasetFactory.createConstraint("groupId", "Controladoria", "Controladoria", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("groupId", "Administradores TI", "Administradores TI", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("groupId", "Diretoria", "Diretoria", ConstraintType.SHOULD),
    ],null);

    if (ds.values.length==0) {
        return false;
    }
    else{
        return true;
    }
}

// Utils
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function floatToMoney(val) {
    return parseFloat(val).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}
function textToCNPJ(val) {
    if (val.length != 14) {
        throw "Tamanho do CNPJ diferente de 14!";
    }

    return val[0] + val[1] + "." + (val[2] + val[3] + val[4]) + "." + (val[5] + val[6] + val[7]) + "/" + (val[8] + val[9] + val[10] + val[11] + "-" + (val[12] + val[13]));
}
function showMessage(title, message, type) {
    FLUIGC.toast({
        title: title,
        message: message,
        type: type,
    });
}
function moneyToFloat(val) {
    if (val.indexOf("R$") != -1) {
        val = val.replace("R$", "").trim();
    }

    val = parseFloat(val.split(".").join("").replace(",", "."));
    if (isNaN(val)) {
        return 0;
    }
    return val;
}
function getDataHoje(format = "AAAA-MM-DD") {
    //AAAA-MM-DD Formato PadrÃ£o caso nÃ£o seja informado o Formato

    var date = new Date();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }

    if (format.toUpperCase() == "DD/MM/AAAA") {
        return [day, month, year].join("/");
    } else if (format.toUpperCase() == "AAAA-MM-DD") {
        return [year, month, day].join("-");
    } else {
        console.error("Formato da Data invÃ¡lido (" + format.toUpperCase() + ")");
        throw "Formato da Data invÃ¡lido (" + format.toUpperCase() + ")";
    }
}
function toggleDarkMode() {
    $(".wcm-all-content").toggleClass("castilho-dark-mode");
    $(".super-widget").toggleClass("castilho-dark-mode");
    $(".wcm_widget").toggleClass("castilho-dark-mode");
    $("#visualizacaoPagina").toggleClass("castilho-dark-mode");
    $("body").toggleClass("castilho-dark-mode");
}