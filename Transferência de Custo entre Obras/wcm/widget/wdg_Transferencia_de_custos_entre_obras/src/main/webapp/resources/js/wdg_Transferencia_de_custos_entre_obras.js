dataTableTransferencias = null;
aprovacoesPendentes = [];
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
    if (WCMAPI.isMobileAppMode()) {
        $("#dashboard").hide();
        $("#painelAprovacoes").show();
    }else{
        $("#dashboard").show();
        $("#painelAprovacoes").hide();
        toggleDarkMode();
    }

    GCCUSTO = DatasetFactory.getDataset("GCCUSTO", null, null, null).values;
    initDataTableTransferencias();
    consultaTransferencias();
    alimentaCharts();
    atualizaChartProdutos();
    buscaAprovacoesPendentesProUsuario("felipe").then(e=>{
        $("#counterAprovacaoPendente").text(e.length);
    });
    $("#filtros>.panel-heading").on("click", () => {
        $("#filtros>.panel-body").slideToggle();
        $("#arrowFiltro").toggleClass("flaticon-chevron-up");
        $("#arrowFiltro").toggleClass("flaticon-chevron-down");
    });
    $("#cardAprovacoesPendentes").on("click", ()=>{
        $("#dashboard").hide();
        $("#painelAprovacoes").show();
    });

    $("#btnDarkMode").on("click", toggleDarkMode);

    // loadBarChart();
    loadGroupedBarChart("chart4");

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

    transferencias = JSON.parse(ds.values[0].RESULT);


    dataTableTransferencias.clear().draw();
    for (const row of transferencias) {
        row.DESC_CCUSTO_ORIGEM = findDescCCUSTO(row.CODCOLIGADA_ORIGEM, row.CCUSTO_ORIGEM);
        row.DESC_CCUSTO_DESTINO = findDescCCUSTO(row.CODCOLIGADA_DESTINO, row.CCUSTO_DESTINO);

        dataTableTransferencias.row.add(row);
    }
    dataTableTransferencias.draw();

    totalizaCabecalhos(transferencias);


    function totalizaCabecalhos(transferencias) {
        var valorTotal = 0;
        var valorPendenteAprovacao = 0;
        for (const row of transferencias) {
            var valor = parseFloat(row.VALOR);
            valorTotal += valor;
            if (row.STATUS == 1) {
                valorPendenteAprovacao += valor;
            }
        }

        $("#textValorTotal").text(floatToMoney(valorTotal));
        $("#textValorPendente").text(floatToMoney(valorPendenteAprovacao));
    }
    function findDescCCUSTO(CODCOLIGADA, CODCCUSTO) {
        var found = GCCUSTO.find(e => (e.CODCOLIGADA == CODCOLIGADA && e.CODCCUSTO == CODCCUSTO))
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
                render: function (data, type, row) {
                    return row.CODCOLIGADA_ORIGEM + " - " + row.CCUSTO_ORIGEM + " - " + row.DESC_CCUSTO_ORIGEM;
                },
                class: "nowrap",
                type: "string"
            },
            {
                data: "CCUSTO_DESTINO",
                render: function (data, type, row) {
                    return row.CODCOLIGADA_DESTINO + " - " + row.CCUSTO_DESTINO + " - " + row.DESC_CCUSTO_DESTINO;
                },
                class: "nowrap",
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
                render: function (data) {
                    if (data == 1) {
                        return "Em andamento";
                    }
                    else if (data == 2) {
                        return "Finalizado";
                    }
                    else if (data == 3) {
                        return "Cancelado";
                    }
                    else {
                        return data;
                    }
                }
            },
            {
                data: null,
                orderable: false,
                render: function (data, type, row) {
                    return `<button class="btn btn-default btnDetalhesSolicitacao">
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
        $(".btnDetalhesSolicitacao").off("click").on("click", function () {
            var tr = $(this).closest('tr');
            var row = dataTableTransferencias.row(tr);
            var data = row.data()
            abreModalTransferencia(data.ID_SOLICITACAO);
        });
    });
}

function atualizaChartProdutos() {
    var ds = DatasetFactory.getDataset("dsConsultaItensTransferenciasDeCusto", null, null, null)
    if (ds.values[0].STATUS != "SUCCESS") {
        throw ds.values[0].MENSAGEM;
    }

    var itens = JSON.parse(ds.values[0].RESULT);
    itens = itens.map(e => {
        return {
            label: e.CODIGO_PRODUTO + " - " + e.DESCRICAO_PRODUTO,
            value: e.SOMA
        }
    });

    console.log(itens);

    loadChart1("chart3", itens);

}
function loadChart1(id, data, colors) {
    if (!data) {
        data = [
            { label: 'Obra Toledo II', value: getRandomInt(100) },
            { label: 'Obra Estrada da Boiadeira II', value: getRandomInt(100) },
            { label: 'Obra Teste', value: getRandomInt(100) },
            { label: 'Obra ABCDEF', value: getRandomInt(100) }
        ];
    }

    const width = $("#" + id).closest("div").width();
    const height = 220;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeDark2);

    if (!colors) {
        colors = [
            "#ff8000",
            "#ffa600",
            "#ffbf00",
            "#ffd900",
            "#fff200",
        ]
    }

    // Remove previous chart if exists
    d3.select("#" + id).selectAll("*").remove();

    const svg = d3.select("#" + id)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

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
        .attr("fill", (d, i) => colors[d.index])
        .on("mouseover", function (event, d) {
            tooltip
                .style("display", "block")
                .style("fill", "black")
                .html(`<strong>${d.data.label}</strong>: ${floatToMoney(d.data.value)}`);

            d3.select(this).attr("stroke", "white").attr("stroke-width", 2);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX - 70) + "px")
                .style("top", (event.pageY - 300) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this).attr("stroke", null);
        });



    d3.select("#legend" + id).selectAll("*").remove();
    var svgLegendas = d3.select("#legend" + id)
        .attr("width", $("#legend" + id).closest("div").width())
        .attr("height", 100)
        .append("g")
        .attr("transform", `translate(${20},${0})`);



    var legendHolder = svgLegendas.append('g');
    var legendLeft = legendHolder.selectAll(".legend")
        .data(data.slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return `translate(${0}, ${((i * 20))})`; });


    legendLeft.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d, i) => { console.log(d, i); return colors[i] });

    legendLeft.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .attr("class", "legendText")
        .text(function (d) { return d.label.replace("Obra ", ""); });


}
function loadBarChart() {
    const data = [
        { label: "A", value: 30 },
        { label: "B", value: 80 },
        { label: "C", value: 45 },
        { label: "D", value: 60 },
        { label: "E", value: 20 },
        { label: "F", value: 90 },
        { label: "G", value: 55 }
    ];

    const width = $("#chart4").closest("div").width();
    const height = 220;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

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
        .on("mouseover", function (event, d) {
            tooltip
                .style("display", "block")
                .html(`<strong>${d.label}</strong>: ${d.value}`);
            d3.select(this).attr("fill", "#0056b3");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX - 70) + "px")
                .style("top", (event.pageY - 300) + "px");
        })
        .on("mouseout", function () {
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
function loadMultiLineChart(id, datasets, colorList) {
    // Example datasets if not provided
    if (!datasets) {
        datasets = [
            {
                name: "Série 1",
                values: [
                    { date: new Date(2025, 0, 1), value: 30 },
                    { date: new Date(2025, 1, 1), value: 80 },
                    { date: new Date(2025, 2, 1), value: 45 },
                    { date: new Date(2025, 3, 1), value: 60 },
                    { date: new Date(2025, 4, 1), value: 20 },
                    { date: new Date(2025, 5, 1), value: 90 },
                    { date: new Date(2025, 6, 1), value: 55 }
                ]
            },
            {
                name: "Série 2",
                values: [
                    { date: new Date(2025, 0, 1), value: 50 },
                    { date: new Date(2025, 1, 1), value: 60 },
                    { date: new Date(2025, 2, 1), value: 35 },
                    { date: new Date(2025, 3, 1), value: 80 },
                    { date: new Date(2025, 4, 1), value: 40 },
                    { date: new Date(2025, 5, 1), value: 70 },
                    { date: new Date(2025, 6, 1), value: 65 }
                ]
            }
        ];
    }
    if (!colorList) colorList = ["#008000", "#dd0426", "#38b000", "#ad2831"];

    // Defensive: ensure all dates are Date objects
    datasets.forEach(serie => {
        serie.values.forEach(point => {
            if (!(point.date instanceof Date)) {
                // Try to parse string date (YYYY-MM-DD or similar)
                if (typeof point.date === 'string') {
                    let d = new Date(point.date);
                    if (!isNaN(d)) {
                        point.date = d;
                    }
                }
            }
        });
    });

    const width = $("#" + id).closest("div").width() || 350;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    d3.select("#" + id).selectAll("*").remove();

    const svg = d3.select("#" + id)
        .attr("width", width)
        .attr("height", height);

    // Flatten all values to get global x/y domains
    const allValues = datasets.flatMap(d => d.values);

    const x = d3.scaleTime()
        .domain(d3.extent(allValues, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(allValues, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    // Horizontal grid lines (Y)
    svg.append("g")
        .attr("class", "grid grid-y")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
            d3.axisLeft(y)
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
            d3.axisBottom(x)
                .ticks(6)
                .tickSize(-height + margin.top + margin.bottom)
                .tickFormat("")
        )
        .selectAll("line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "2,2");

    // Color scale
    const color = d3.scaleOrdinal()
        .domain(datasets.map(d => d.name))
        .range(colorList);

    // Line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    // Draw lines
    datasets.forEach((serie, i) => {
        svg.append("path")
            .datum(serie.values)
            .attr("fill", "none")
            .attr("stroke", color(serie.name))
            .attr("stroke-width", 2)
            .attr("d", line);

        // Draw points
        svg.selectAll(".point-" + i)
            .data(serie.values)
            .join("circle")
            .attr("class", "point-" + i)
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .attr("fill", color(serie.name));
    });

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b/%y")));

    // Y Axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100},${margin.top})`);

    datasets.forEach((serie, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0,${i * 20})`);
        legendRow.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(serie.name));
        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("fill", "#333")
            .text(serie.name);
    });
}
function loadGroupedBarChart(id, data, groupKeys, colors) { 
    // Example data if not provided
    if (!data) {
        data = [
            { group: "A", value1: 30, value2: 50 },
            { group: "B", value1: 80, value2: 35 },
            { group: "C", value1: 45, value2: 60 },
            { group: "D", value1: 60, value2: 40 }
        ];
        groupKeys = ["value1", "value2"];
        colors = ["#38b000", "#a50104"];
    }

    const width = $("#" + id).closest("div").width();
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Remove previous chart if exists
    d3.select("#" + id).selectAll("*").remove();

    const svg = d3.select("#" + id)
        .attr("width", width)
        .attr("height", height);

    // X0: group position
    const x0 = d3.scaleBand()
        .domain(data.map(d => d.group))
        .range([margin.left, width - margin.right])
        .paddingInner(0.1);

    // X1: subgroup position within group
    const x1 = d3.scaleBand()
        .domain(groupKeys)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    // Y: value
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(groupKeys, key => d[key]))]).nice()
        .range([height - margin.bottom, margin.top]);

    // Color
    const color = d3.scaleOrdinal()
        .domain(groupKeys)
        .range(colors);

    // Tooltip
    const tooltip = d3.select("#d3-tooltip");

    // Draw bars
    svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x0(d.group)},0)`)
        .selectAll("rect")
        .data(d => groupKeys.map(key => ({ key, value: d[key], group: d.group })))
        .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", function (event, d) {
            tooltip
                .style("display", "block")
                .html(`<strong>${d.group}</strong><br>${d.key}: ${d.value}`);
            d3.select(this).attr("fill", d3.rgb(color(d.key)).darker(1));
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX - 50) + "px")
                .style("top", (event.pageY - 40) + "px");
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
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100},${margin.top})`);

    groupKeys.forEach((key, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0,${i * 20})`);
        legendRow.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(key));
        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("fill", "#333")
            .text(key);
    });
}

function alimentaCharts() {
    var recebimentoAcumuladoPorObra = [];
    var envioAcumuladoPorObra = [];

    for (const transferencia of transferencias) {
        var CCustoObraOrigem = transferencia.CCUSTO_ORIGEM;
        var VALOR = parseFloat(transferencia.VALOR);

        var found = envioAcumuladoPorObra.find(e => { return e.CCUSTO == CCustoObraOrigem; });
        if (found) {
            found.value += VALOR;
        }
        else {
            envioAcumuladoPorObra.push({
                CCUSTO: CCustoObraOrigem,
                NOME: transferencia.DESC_CCUSTO_ORIGEM,
                label: CCustoObraOrigem + " - " + transferencia.DESC_CCUSTO_ORIGEM,
                value: VALOR,
            });
        }


        var CCustoObraDestino = transferencia.CCUSTO_DESTINO;
        var found = recebimentoAcumuladoPorObra.find(e => { return e.CCUSTO == CCustoObraDestino; });
        if (found) {
            found.value += VALOR;
        }
        else {
            recebimentoAcumuladoPorObra.push({
                CCUSTO: CCustoObraDestino,
                NOME: transferencia.DESC_CCUSTO_DESTINO,
                label: CCustoObraDestino + " - " + transferencia.DESC_CCUSTO_DESTINO,
                value: VALOR,
            });
        }
    }

    envioAcumuladoPorObra = envioAcumuladoPorObra.sort((a, b) => b.value - a.value);
    while (envioAcumuladoPorObra.length > 5) {
        envioAcumuladoPorObra.pop();
    }
    var index = 0;
    for (const item of envioAcumuladoPorObra) {
        item.index = index;
        index++;
    }


    recebimentoAcumuladoPorObra = recebimentoAcumuladoPorObra.sort((a, b) => b.value - a.value);
    while (recebimentoAcumuladoPorObra.length > 5) {
        recebimentoAcumuladoPorObra.pop();
    }
    var index = 0;
    for (const item of recebimentoAcumuladoPorObra) {
        item.index = index;
        index++;
    }


    console.log(envioAcumuladoPorObra)
    console.log(recebimentoAcumuladoPorObra)


    var colorsEnvio = [
        "#9ef01a",
        "#38b000",
        "#008000",
        "#007200",
        "#004b23",
    ];
    var colorsRecebimento = [
        "#250902",
        "#38040e",
        "#640d14",
        "#800e13",
        "#ad2831",
    ];
    loadChart1("chart1", envioAcumuladoPorObra, colorsEnvio);
    loadChart1("chart2", recebimentoAcumuladoPorObra, colorsRecebimento);
    loadMultiLineChart("chart5");
}
function abreModalTransferencia(idSolicitacao) {
    var ds = DatasetFactory.getDataset("dsTransferenciaDeCustoEntreObras", null, [
        DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST),
        DatasetFactory.createConstraint("numProces", idSolicitacao, idSolicitacao, ConstraintType.MUST),
    ], null);


    var formulario = ds.values[0];
    var documentId = formulario["metadata#id"];
    var documentVersion = formulario["metadata#version"];

    var dsItens = DatasetFactory.getDataset("dsTransferenciaDeCustoEntreObras", null, [
        DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST),
        DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST),
        DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST),
        DatasetFactory.createConstraint("tablename", "tableItens", "tableItens", ConstraintType.MUST),
    ], null);
    console.log(dsItens)





    var html =
        `<div class="row">
        <div class="col-md-6">
            <h3>Obra Origem</h3>
            <h3>${formulario.ccustoObraOrigem}</h3>
            <h4>Redução de Custo: ${formulario.valorObraOrigem}</h4>
            <br>

            <b>Engenheiro: </b><span>${formulario.engenheiroObraOrigem}</span>
            <b>Coordenador: </b><span>${formulario.coordenadorObraOrigem}</span>
            <b>Diretor: </b><span>${formulario.diretorObraOrigem}</span>
        </div>
        <div class="col-md-6">
            <h3>Obra Destino</h3>
            <h3>${formulario.ccustoObraDestino}</h3>
            <h4>Redução de Custo: ${formulario.valorObraDestino}</h4>
            <br>

            <b>Engenheiro: </b><span>${formulario.engenheiroObraDestino}</span>
            <b>Coordenador: </b><span>${formulario.coordenadorObraDestino}</span>
            <b>Diretor: </b><span>${formulario.diretorObraDestino}</span>
        </div>
    </div>
    <div>
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
                ${geraLinhasItens(dsItens.values)}
            </tbody>
        </table
    </div>`;





    var myModal = FLUIGC.modal({
        title: 'Transferência de Custo #' + idSolicitacao,
        content: html,
        id: 'fluig-modal',
        size: 'full',
        actions: [{
            'label': 'Close',
            'autoClose': true
        }]
    }, function (err, data) {
        if (err) {
            // do error handling
        } else {
            // do something with data
        }
    });



    function geraLinhasItens(itens) {
        var html = "";
        var counter = 0;
        for (const item of itens) {
            counter++;
            html +=
                `<tr>
                <td style="color:black !important;">${counter}</td>
                <td style="color:black !important;">${item.itemProduto}</td>
                <td style="color:black !important;">${item.itemDescricao}</td>
                <td style="color:black !important;">${item.itemQuantidade}</td>
                <td style="color:black !important;">${item.itemValorUnit}</td>
                <td style="color:black !important;">${item.itemValorTotal}</td>
            </tr>`;
        }

        return html;
    }
}

function buscaAprovacoesPendentesProUsuario(userCode){
    return new Promise((resolve, reject)=>{
        $.ajax({
            type:"GET",
            url:`/process-management/api/v2/tasks?assignee=${userCode}&status=NOT_COMPLETED&processId=Transfer%C3%AAncia%20de%20Custo%20entre%20Obras&page=1&pageSize=1000`,
            success:retorno=>{
                resolve(retorno.items);
            },
            error:e=>{
                reject(e);
            }
        });
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



function toggleDarkMode() {
    $(".wcm-all-content").toggleClass("castilho-dark-mode");
    $(".super-widget").toggleClass("castilho-dark-mode");
    $(".wcm_widget").toggleClass("castilho-dark-mode");
    $("#visualizacaoPagina").toggleClass("castilho-dark-mode");
    $("body").toggleClass("castilho-dark-mode")
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
