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
    toggleDarkMode();
    GCCUSTO = DatasetFactory.getDataset("GCCUSTO",null,null,null).values;
    initDataTableTransferencias();
    consultaTransferencias();
    $("#filtros>.panel-heading").on("click", () => {
        $("#filtros>.panel-body").slideToggle();
        $("#arrowFiltro").toggleClass("flaticon-chevron-up");
        $("#arrowFiltro").toggleClass("flaticon-chevron-down");
    });

    $("#btnDarkMode").on("click", toggleDarkMode);

    loadChart1("chart1");
    loadChart1("chart2");
    loadChart1("chart3");
    loadBarChart();

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
                    }
                    else if(data == 2){
                        return "Finalizado";
                    }
                    else{
                        return data;
                    }
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `<button class="btn btn-default">
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


function loadChart1(id){
    const data = [
        { label: 'Obra Toledo II', value: getRandomInt(100) },
        { label: 'Obra Estrada da Boiadeira II', value: getRandomInt(100) },
        { label: 'Obra Teste', value: getRandomInt(100) },
        { label: 'Obra ABCDEF', value: getRandomInt(100) }
    ];

    const width = 350;
    const height = 220;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeSet1);

    // Remove previous chart if exists
    d3.select("#" + id).selectAll("*").remove();

    const svg = d3.select("#" + id)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2-60},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 10);

    const arcs = svg.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g");

    // Tooltip
    const tooltip = d3.select("#d3-tooltip");
    // Draw slices with mouse events
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i))
        .on("mouseover", function(event, d) {
            tooltip
                .style("display", "block")
                .style("fill", "black")
                .html(`<strong>${d.data.label}</strong>: ${d.data.value}`);

            d3.select(this).attr("stroke", "white").attr("stroke-width", 2);
        })
        .on("mousemove", function(event) {
            tooltip
            .style("left", (event.pageX - 70) + "px")
            .style("top", (event.pageY - 300) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
            d3.select(this).attr("stroke", null);
        });


  

        var legendHolder = svg.append('g');

        var legendLeft = legendHolder.selectAll(".legend")
        .data(data.slice())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(120," + ((i * 20)  -(height/2) + 20) + ")"; });

            
        legendLeft.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d,i)=>color(i));

        legendLeft.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style('fill', 'white')
        .text(function(d) { return d.label.replace("Obra ",""); });


}
function loadBarChart(){
 const data = [
        {label: "A", value: 30},
        {label: "B", value: 80},
        {label: "C", value: 45},
        {label: "D", value: 60},
        {label: "E", value: 20},
        {label: "F", value: 90},
        {label: "G", value: 55}
    ];

    const width = 350;
    const height = 220;
    const margin = {top: 10, right: 10, bottom: 10, left:10};

    const svg = d3.select("#chart4")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    // Tooltip div
    const tooltip = d3.select("#d3-tooltip");

    svg.append("g")
        .attr("fill", "#007bff")
        .selectAll("rect")
        .data(data)
        .join("rect")
            .attr("x", d => x(d.label))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth())
            .on("mouseover", function(event, d) {
                tooltip
                    .style("display", "block")
                    .html(`<strong>${d.label}</strong>: ${d.value}`);
                d3.select(this).attr("fill", "#0056b3");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX-70) + "px")
                    .style("top", (event.pageY-300) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
                d3.select(this).attr("fill", "#007bff");
            });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
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


function toggleDarkMode(){
    $(".wcm-all-content").toggleClass("castilho-dark-mode");
    $(".super-widget").toggleClass("castilho-dark-mode");
    $(".wcm_widget").toggleClass("castilho-dark-mode");
    $("#visualizacaoPagina").toggleClass("castilho-dark-mode");
    $("body").toggleClass("castilho-dark-mode")
}


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
