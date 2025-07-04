dataTableTransferencias = null;
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
        sLast: "Último"
    },
    oAria: {
        sSortAscending: ": Ordenar colunas de forma ascendente",
        sSortDescending: ": Ordenar colunas de forma descendente"
    },
    select: {
        rows: {
            _: "Selecionado %d linhas",
            0: "Nenhuma linha selecionada",
            1: "Selecionado 1 linha"
        }
    },
    buttons: {
        copy: "Copiar para a área de transferência",
        copyTitle: "Cópia bem sucedida",
        copySuccess: {
            1: "Uma linha copiada com sucesso",
            _: "%d linhas copiadas com sucesso"
        }
    }
};

var wdgTransfCusto = SuperWidget.extend({
    init: function () {
        init();
    },
});

function init() {
    GCCUSTO = DatasetFactory.getDataset("GCCUSTO",null,null,null).values;
    initDataTableTransferencias();
    consultaTransferencias();
    $("#filtros>.panel-heading").on("click", () => {
        $("#filtros>.panel-body").slideToggle();
        $("#arrowFiltro").toggleClass("flaticon-chevron-up");
        $("#arrowFiltro").toggleClass("flaticon-chevron-down");
    });

    var date = new Date();
    var mes = date.getMonth() + 1;
    mes = mes < 10 ? "0" + mes : mes;
    var ano = date.getFullYear();
    $("#textPeriodo").text(mes + "/" + ano);

}


function consultaTransferencias() {
    var ds = DatasetFactory.getDataset("dsConsultaTransferenciasDeCusto", null, null, null);
    if (ds.values[0].STATUS != "SUCCESS") {
        showMessage("Erro ao Consultar Trânsferencias: ", ds.values[0].MENSAGEM, "warning");
    }

    var transferencias = JSON.parse(ds.values[0].RESULT);


    dataTableTransferencias.clear().draw();
    for (const row of transferencias) {

        row.DESC_CCUSTO_ORIGEM = findDescCCUSTO(row.CODCOLIGADA_ORIGEM, row.CCUSTO_ORIGEM);
        row.DESC_CCUSTO_DESTINO = findDescCCUSTO(row.CODCOLIGADA_DESTINO, row.CCUSTO_DESTINO);
        
        dataTableTransferencias.row.add(row);
    }
    dataTableTransferencias.draw();

    totalizaCabecalhos(transferencias);


    function totalizaCabecalhos(transferencias){
        var valorTotal = 0;
        var valorPendenteAprovacao = 0;
        for (const row of transferencias) {
            var valor = parseFloat(row.VALOR);
            valorTotal+=valor;
            if (row.STATUS == 1) {
                valorPendenteAprovacao+=valor;
            }
        }

        $("#textValorTotal").text(floatToMoney(valorTotal));
        $("#textValorPendente").text(floatToMoney(valorPendenteAprovacao));
    }
    function findDescCCUSTO(CODCOLIGADA, CODCCUSTO){
        var found = GCCUSTO.find(e=>(e.CODCOLIGADA == CODCOLIGADA && e.CODCCUSTO == CODCCUSTO))
        return found.NOME;
    }
}

function initDataTableTransferencias() {
    dataTableTransferencias = new DataTable("#tableTransferencias", {
        pageLength: 10,
        responsive: true,
        fixedHeader: true,
        // order: [[4, 'desc']],
        columns: [
            {
                class: 'detaisNotaFiscal',
                orderable: false,
                data: null,
                defaultContent: ''
            },
            {
                data: "ID_SOLICITACAO",
            },
            {
                data: "CCUSTO_ORIGEM",
                render:function(data,type,row){
                    return row.CODCOLIGADA_ORIGEM + " - " + row.CCUSTO_ORIGEM + " - " + row.DESC_CCUSTO_ORIGEM;
                },
                class:"nowrap",
                type: "string"
            },
            {
                data: "CCUSTO_DESTINO",
                render:function(data,type,row){
                    return row.CODCOLIGADA_DESTINO + " - " + row.CCUSTO_DESTINO + " - " + row.DESC_CCUSTO_DESTINO;
                },
                class:"nowrap",
                type: "string"
            },
            {
                data: "SOLICITANTE"
            },
            {
                data: "VALOR",
                type: "num",
                className: "dt-left",
                render: function (data, type) {
                    if (type === "sort") {
                        return parseFloat(data);
                    } else {
                        return "<span style='white-space:nowrap;'>" + floatToMoney(data) + "</span>";
                    }
                }
            },
            {
                data: "DATA_SOLICITACAO",
                render: function (data, type) {
                    if (type === "sort") {
                        return moment(data, "YYYY-MM-DD").valueOf();
                    } else {
                        return moment(data, "YYYY-MM-DD").format("DD/MM/YYYY");
                    }
                }
            },
            {
                data: "DATA_COMPETENCIA",
                render: function (data, type) {
                    if (type === "sort") {
                        return moment(data, "YYYY-MM-DD").valueOf();
                    } else {
                        return moment(data, "YYYY-MM-DD").format("DD/MM/YYYY");
                    }
                }
            },
            {
                data: "STATUS",
                render:function(data){
                    if (data == 1) {
                        return "Em andamento";
                    }else{
                        return data;
                    }
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `<button class="btn btn-primary">
                        <i class="flaticon flaticon-view icon-sm" aria-hidden="true"></i>
                    </button>`;
                }
            }
        ],
        language: datatablesLanguage,
        layout: {
            bottomStart: null,
            bottom: "paging",
            bottomEnd: null,
        }
    });

    dataTableTransferencias.on("draw", function () {

    });
}




// Utils
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
function floatToMoney(val) {
    return parseFloat(val).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}
function textToCNPJ(val) {
    if (val.length != 14) {
        throw "Tamanho do CNPJ diferente de 14!";
    }

    return (val[0] + val[1]) + "." + (val[2] + val[3] + val[4]) + "." + (val[5] + val[6] + val[7]) + "/" + (val[8] + val[9] + val[10] + val[11] + "-" + (val[12] + val[13]))
}
function showMessage(title, message, type) {
    FLUIGC.toast({
        title: title,
        message: message,
        type: type
    });
}