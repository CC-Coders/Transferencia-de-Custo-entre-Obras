// Obra Origem e Destino
function extraiAprovadoresDaLista(lista) {
    var engenherio = "";
    var coordenador = "";
    var diretor = "";

    for (const user of lista) {
        if (!engenherio && verificaSeUsuarioPertenceAoGrupo(user.usuarioFLUIG, "Engenheiros")) {
            engenherio = user.usuarioFLUIG;
        }
        else if (!coordenador && verificaSeUsuarioPertenceAoGrupo(user.usuarioFLUIG, "Coordenadores de obras")) {
            coordenador = user.usuarioFLUIG;
        }
        else if (!diretor && verificaSeUsuarioPertenceAoGrupo(user.usuarioFLUIG, "Diretoria")) {
            diretor = user.usuarioFLUIG;
        }
    }


    return { engenherio, coordenador, diretor };
}
function preencheCamposDeObras() {
    var USUARIO = $("#solicitante").val();

    var val = $("#ccustoObraOrigem").val();
    var hasPermissaoGeral = usuarioComPermissaoGeralNasObras();
    var obrasComPermissaoDoUsuario = buscaObrasPorPermissaoDoUsuario(USUARIO,hasPermissaoGeral);
    $("#ccustoObraOrigem").html(geraHtmlOptions(obrasComPermissaoDoUsuario));
    $("#ccustoObraOrigem").val(val);


    var val2 = $("#ccustoObraDestino").val();
    var todasObras = buscaObrasPorPermissaoDoUsuario(USUARIO, true);
    $("#ccustoObraDestino").html(geraHtmlOptions(todasObras));
    $("#ccustoObraDestino").val(val2);


    function geraHtmlOptions(obras) {
        var html = "<option></option>";
        var coligadaAtual = obras[0].NOMEFANTASIA;

        var html2 = "";
        for (const obra of obras) {
            if (coligadaAtual != obra.NOMEFANTASIA) {
                html += `<optgroup label="${coligadaAtual}">${html2}</optgroup>`;
                html2 = "";
                coligadaAtual = obra.NOMEFANTASIA;
            }

            html2 += `<option value="${obra.CODCOLIGADA} - ${obra.CODCCUSTO} - ${obra.perfil}">${obra.CODCCUSTO} - ${obra.perfil}</option>`;
        }
        html += `<optgroup label="${coligadaAtual}">${html2}</optgroup>`;

        return html;
    }
}
function promiseBuscaAprovadoresDaObra(CODCOLIGADA, LOCALESTOQUE, CODTMV, valorTotal) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("verificaAprovador", null, [
            DatasetFactory.createConstraint("paramCodcoligada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
            DatasetFactory.createConstraint("paramLocal", LOCALESTOQUE, LOCALESTOQUE, ConstraintType.MUST),
            DatasetFactory.createConstraint("paramCodTmv", CODTMV, CODTMV, ConstraintType.MUST),
            DatasetFactory.createConstraint("paramValorTotal", valorTotal, valorTotal, ConstraintType.MUST)
        ], null, {

            success: ds => {
                if (ds.columns[0] == "FALHA") {
                    reject(ds.values[0].FALHA);
                }

                resolve(ds.values);
            },
            error: e => {
                reject(e);
            }
        });
    });
}
function marcaEmVerdeAprovados() {
    var aprovadorEngenheiroOrigem = $("#aprovadoEngenheiroObraOrigem").val() == "true";
    if (aprovadorEngenheiroOrigem) {
        $("#engenheiroObraOrigem").css("background-color", "lightgreen");
        $("#engenheiroObraOrigem").css("color", "black");
    }

    var aprovadoCoordenadorObraOrigem = $("#aprovadoCoordenadorObraOrigem").val() == "true";
    if (aprovadoCoordenadorObraOrigem) {
        $("#coordenadorObraOrigem").css("background-color", "lightgreen");
        $("#coordenadorObraOrigem").css("color", "black");
    }

    var aprovadoDiretorObraOrigem = $("#aprovadoDiretorObraOrigem").val() == "true";
    if (aprovadoDiretorObraOrigem) {
        $("#diretorObraOrigem").css("background-color", "lightgreen");
        $("#diretorObraOrigem").css("color", "black");
    }

    var aprovadoEngenheiroObraDestino = $("#aprovadoEngenheiroObraDestino").val() == "true";
    if (aprovadoEngenheiroObraDestino) {
        $("#engenheiroObraDestino").css("background-color", "lightgreen");
        $("#engenheiroObraDestino").css("color", "black");
    }

    var aprovadoCoordenadorObraDestino = $("#aprovadoCoordenadorObraDestino").val() == "true";
    if (aprovadoCoordenadorObraDestino) {
        $("#coordenadorObraDestino").css("background-color", "lightgreen");
        $("#coordenadorObraDestino").css("color", "black");
    }

    var aprovadoDiretorObraDestino = $("#aprovadoDiretorObraDestino").val() == "true";
    if (aprovadoDiretorObraDestino) {
        $("#diretorObraDestino").css("background-color", "lightgreen");
        $("#diretorObraDestino").css("color", "black");
    }
}
function alteraIconesECorDosValores(){
    var isTipoCusto = $("#TRANSFERE_CUSTO").val() == "true";
    var isTipoReceita = $("#TRANSFERE_RECEITA").val() == "true";
    if (isTipoCusto) {
            $("#iconObraDestino").removeClass("iconStonks").addClass("iconNotStonks");
            $("#iconObraOrigem").removeClass("iconNotStonks").addClass("iconStonks");
            $("#valorObraOrigem").attr("style", "color: green !important");
            $("#valorObraDestino").attr("style", "color: red !important");
            $("#titleTipoTransferencia").text("CUSTO");
    }else if(isTipoReceita){
         $("#iconObraOrigem").removeClass("iconStonks").addClass("iconNotStonks");
            $("#iconObraDestino").removeClass("iconNotStonks").addClass("iconStonks");
            $("#valorObraDestino").attr("style", "color: green !important");
            $("#valorObraOrigem").attr("style", "color: red !important");
            $("#titleTipoTransferencia").text("RECEITA");
    }
}
function usuarioComPermissaoGeralNasObras(){
    var ds = DatasetFactory.getDataset("colleagueGroup", null,[
        DatasetFactory.createConstraint("colleagueId", $("#userCode").val(),$("#userCode").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("groupId", "Controladoria","Controladoria", ConstraintType.MUST),
    ],null);

    if (ds.values.length>0) {
        return true;
    }else{
        return false;
    }
}


// Transferencias
function adicionaNovaTransferencia() {
    var id = wdkAddChild("tableTransferencias");

    $("#motivoTransferencia" + "___" + id).on("change", function () {
        var isTipoCusto = listaTiposTransferencia.CUSTO.includes($(this).val());

        var temTipoSelecionado = $("#tableTransferencias>tbody>tr:not(:first)").find(`.motivoTransferencia`).filter(function() {
            return $(this).val();
        }).length > 1;

        if (isTipoCusto && $("#TRANSFERE_RECEITA").val() == "true" && temTipoSelecionado) {
            showMessage("Não é Possível selecionar Tipos de CUSTO e RECEITA em uma mesma Solicitação.","","warning");
            $(this).val("");
            $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text("");
            return;
        }
        if (!isTipoCusto && $("#TRANSFERE_CUSTO").val() == "true" && temTipoSelecionado) {
            showMessage("Não é Possível selecionar Tipos de CUSTO e RECEITA em uma mesma Solicitação.","","warning");
            $(this).val("");
            $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text("");
            return;
        }

        $(this).closest(".panelTransferencia").find(".spanTipoTransferencia").text($(this).val());
        salvaItensDasTransferenciasNoCampoHidden();

        var produtos = carregaListaDeProdutos($(this).val());
        $(this).closest(".panelTransferencia").find(".tableItens").find(".itemProduto").each(function(){
            try {
                $(this)[0].selectize.clear();
                $(this)[0].selectize.clearOptions();
                var control = $(this)[0].selectize;
    
                for (const produto of produtos) {
                    control.addOption({
                        value: produto.VISUAL,
                        text: produto.VISUAL
                    });
                }
            } catch (error) {
                
            }
        });
        
        if (isTipoCusto) {
            $("#TRANSFERE_CUSTO").val("true");
            $("#TRANSFERE_RECEITA").val("");
            alteraIconesECorDosValores();
        }else{
            $("#TRANSFERE_CUSTO").val("");
            $("#TRANSFERE_RECEITA").val("true");
            alteraIconesECorDosValores();
        }

    });
    $(".panelTransferencia:last .panel-heading").on("click", function () {
        $(".panelTransferencia:not(:first)").not($(this).closest(".panelTransferencia")).find(".panel-heading").find(".iconarrow").addClass("flaticon-chevron-up").removeClass("flaticon-chevron-down");
        $(".panelTransferencia:not(:first)").not($(this).closest(".panelTransferencia")).find(".panel-body").slideUp();
        $(this).siblings(".panel-body").slideToggle();
        $(this).find(".iconarrow").toggleClass("flaticon-chevron-up").toggleClass("flaticon-chevron-down");
    });
    $(".btnAdicionarItem:last").on("click", function () {
        criaLinhaItem($(this).closest("table").find("tbody"));
    });

    $(".panelTransferencia:not(:last):not(:first)").find(".panel-body").slideUp();
    $(".panelTransferencia:not(:last):not(:first)").find(".panel-heading").find(".iconarrow").addClass("flaticon-chevron-up").removeClass("flaticon-chevron-down");

    criaTabelaItens($(".panelTransferencia:last").find(".divTabelaItens"));
    criaLinhaItem($(".panelTransferencia:last").find(".divTabelaItens").find("table>tbody"));
}
function criaTabelaItens(target, readonly) {
    var htmlTabela =
        `<table class="table table-bordered table-striped tableItens" style="margin-bottom:0px;">
			<thead>
				<tr>
					<th>#</th>
					<th>Produto</th>
					<th>Descrição</th>
					<th>QNTD</th>
					<th>Valor Unit.</th>
					<th>Valor Total</th>
                    ${!readonly ? "<th></th>" : ""}
				</tr>
			</thead>
			<tbody>
				
			</tbody>
            ${!readonly ?
            `<tfoot>
				    <tr>
    					<td colspan="7">
	    					<div style="text-align: center;">
		    					<button class="btn btn-success btnAdicionarItem">
			    					<i class="flaticon flaticon-add-plus icon-md" aria-hidden="true"></i>
							    </button>
						    </div>
					    </td>
				    </tr>
			    </tfoot>` : ""}
		</table>`;

    $(target).append(htmlTabela);

    $(".btnAdicionarItem:last").on("click", function () {
        criaLinhaItem($(this).closest("table").find("tbody"));
    });
}
function criaLinhaItem(target, values = null, readonly) {
    var itemProduto = values ? values.CODPRODUTO + " - " + values.DESCPRODUTO : "";
    var itemDescricao = values ? values.DESCRICAO : "";
    var itemQuantidade = values ? values.QUANTIDADE : "";
    var itemUN = values ? values.UN : "";
    var itemValorUnit = values ? values.VALOR_UNITARIO : "";
    var itemValorTotal = values ? floatToMoney(moneyToFloat(values.VALOR_UNITARIO) * moneyToFloat(values.QUANTIDADE)) : "";
    var textReadonly = readonly ? "readonly" : "";

    var htmlLinha =
        `<tr>
            <td style="width: 1%;"></td>
            <td style="width: 40%;">
                ${!readonly ?
            `<select type="text" class="itemProduto" autocomplete="off" value="${itemProduto}"></select>` :
            `<input type="text"  class="form-control itemProduto" value="${itemProduto}" ${textReadonly}>`
        }
            </td>
            <td style="width: 20%;">
                <input type="text"   class="form-control itemDescricao" value="${itemDescricao}" ${textReadonly}>
            </td>
            <td style="width: 15%;">
                <div style="display:flex;">
                    <input type="text" class="form-control itemQuantidade" value="${itemQuantidade}" ${textReadonly}>
                    <select type="text" class="form-control itemUN" value="${itemUN}" ${textReadonly} placeholder="UN">
                        <option></option>
                        ${listUnidadesMedida.map(e => `<option ${e == itemUN ? "selected" : ""}>${e}</option>`).join("")}
                    </select>
                </div>
            </td>
            <td style="width: 10%;">
                <input type="text" class="form-control itemValorUnit" value="${itemValorUnit}" ${textReadonly}>
            </td>
            <td style="width: 10%;">
                <input type="text"  class="form-control itemValorTotal" inert value="${itemValorTotal}" readonly>
            </td>
            ${!readonly ?
            `<td style="text-align: center;">
                    <button class="btn btn-danger btnRemoverLinhaItem">
                        <i class="flaticon flaticon-trash icon-md" aria-hidden="true"></i>
                    </button>
                </td>` : ""
        }
        </tr>`;
    $(target).append(htmlLinha);

    updateCounterRowsTableItens($(target).closest("table"));
    if (!readonly) {
        console.log(target)
        loadLinhaItem($(target).find("tr:last"));
    }

    function loadLinhaItem(target) {
        var tipoTransferencia = $(target).closest(".panelTransferencia").find(".motivoTransferencia").val();
        var val = $(target).find(".itemProduto").attr("value");
        $(target).find(".itemProduto").html(carregaListaDeProdutos(tipoTransferencia).map(e=>`<option value="${e.VISUAL}">${e.VISUAL}</option>`));
        $(target).find(".itemProduto").selectize();

        $(target).find(".itemProduto")[0].selectize.setValue(val);

        $(target).find(".itemQuantidade").maskMoney({ thousands: '.', decimal: ',', });
        $(target).find(".itemValorUnit").maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });

        $(target).find(".itemQuantidade, .itemValorUnit").on("change, keyup", function () {
            var row = $(this).closest("tr");
            calculaValorTotalItem(row);
            atualizaValorTotal();
        });

        $(target).find("select, input").on("change", salvaItensDasTransferenciasNoCampoHidden);

        $(".btnRemoverLinhaItem").off("click").on("click", function () {
            $(this).closest("tr").remove();
            updateCounterRowsTableItens($(target).closest("table"));
            atualizaValorTotal();
            salvaItensDasTransferenciasNoCampoHidden();
        });
    }
}
function salvaItensDasTransferenciasNoCampoHidden() {
    $("#tableTransferencias>tbody>tr:not(:first)").each(function () {
        var linhas = [];

        $(this).find(".tableItens>tbody>tr").each(function () {
            var CODPRODUTO = $(this).find(".itemProduto").val().split(" - ")[0];
            var DESCPRODUTO = $(this).find(".itemProduto").val().split(" - ");
            DESCPRODUTO.shift();
            DESCPRODUTO = DESCPRODUTO.join(" - ");
            var DESCRICAO = $(this).find(".itemDescricao").val();
            var QUANTIDADE = $(this).find(".itemQuantidade").val();
            var UN = $(this).find(".itemUN").val();
            var VALOR_UNITARIO = $(this).find(".itemValorUnit").val();

            linhas.push({ CODPRODUTO, DESCPRODUTO, DESCRICAO, QUANTIDADE, UN, VALOR_UNITARIO });
        });

        $(this).find(".listItensTransferencia").val(JSON.stringify(linhas));
    });
}
function carregaTabelaItensDasTransferencias() {
    if ($("#atividade").val() != ATIVIDADES.INICIO) {
        var readonly = true;
    } else {
        var readonly = false;
    }
    $("#tableTransferencias>tbody>tr:not(:first)").each(function () {
        var listItens = JSON.parse($(this).find(".listItensTransferencia").val());
        var divTableItens = $(this).find(".divTabelaItens");

        criaTabelaItens($(divTableItens), readonly);
        for (const item of listItens) {
            criaLinhaItem($(divTableItens).find("table>tbody"), item, readonly);
        }
    });
}
function updateCounterRowsTableItens(target) {
    var counter = 1;
    $(target).find("tbody>tr").each(function () {
        $(this).find("td:first").text(counter);
        counter++;
    });
}
function adicionarLinhaItem() {
    var id = wdkAddChild("tableItens")
    loadLinhaItem(id);
    updateCounterRowsTableItens();
}
function calculaValorTotalItem(tr) {
    var quantidade = moneyToFloat($(tr).find(".itemQuantidade").val());
    var valor = moneyToFloat($(tr).find(".itemValorUnit").val());
    var valorTotal = quantidade * valor;
    $(tr).find(".itemValorTotal").val(floatToMoney(valorTotal));
}
function carregaListaDeProdutos(TIPO_TRANSFERENCIA) {
    if (!TIPO_TRANSFERENCIA) {
        return [];
    }

    var ds = DatasetFactory.getDataset("dsBuscaProdutosTransferenciasDeCusto",null,[
        DatasetFactory.createConstraint("TIPO_TRANSFERENCIA", TIPO_TRANSFERENCIA, TIPO_TRANSFERENCIA, ConstraintType.MUST)
    ],null);

    if (ds.values[0].STATUS != "SUCCESS") {
        showMessage(ds.values[0].MENSAGEM, "", "warning");
        throw ds.values[0].MENSAGEM;
    }

    var produtos = ds.values[0].RESULT;
    if (typeof produtos == "string") {
        produtos = JSON.parse(ds.values[0].RESULT);
    }

    const blacklist = [
        "Serviço Técnico s/ IRRF",
        "Serviços de Terceiros - Mão de Obra Temporária - s/IRRF",
        "Serviços de Terceiros - Mão de Obra Temporária (c/ IRRF 1,0%)",
        "Serviços de terceiros - Apoio Adm/Engenharia - Simples Nacional",
        "Serviços de Análises Técnicas",
        "Serviço de Análise Técnica c/1,5% IRRF",
        "Seguro Diversos",
        "Despesas Diversas",
        "Materiais Diretos - Diversos - 84798999",
        "Imob. Materiais Diversos (Máq. e Eqtos.)",
        "Despesas Diversas - Com Justificativa (RDO/FFCX)",
    ];

    if (TIPO_TRANSFERENCIA == "Insumos") {
        // Filtra produtos do grupo 41 = Serviços
        produtos = produtos.filter((e) => e.CODIGOPRD.substring(0, 2) != "41");
        
        // Filtra os produtos que não estão na blacklist
        produtos = produtos.filter((e) => !blacklist.includes(e.NOMEFANTASIA));
    }
    if (TIPO_TRANSFERENCIA == "Prestação de Serviço") {
        // Filtra os produtos que não estão na blacklist
        produtos = produtos.filter((e) => !blacklist.includes(e.NOMEFANTASIA));
    }

    return produtos;
}

function carregaTabelaTransferenciasMobile(){
    $("#tableTransferencias>tbody>tr:not(:first)").each(function(){
        var tipo = $(this).find(".motivoTransferencia").val();
        var valorTotal = $(this).find(".valorTotalTransferencia").val();
        var Justificativa = $(this).find(".textMotivoTransferencia").val();
        var itens = JSON.parse($(this).find(".listItensTransferencia").val());

        var html = 
        `<div class="panel panel-primary">
            <div class="panel panel-heading">
                <b>Tipo: </b><span>${tipo}</span><br>
            </div>
            <div class="panel-body">
                <div>
                    <b>Valor: </b><span>${valorTotal}</span><br>
                    <b>Justificativa: </b>
                    <p>${Justificativa}</p>
                </div>
                <div>
                    ${geraHTMLItens(itens)}
                </div>
            </div>
        </div>`;

        console.log(html)

        $("#divPanelTransfenreciasMobile").append(html);
        $("#divPanelTransfenreciasMobile").show();
        $("#divPanelTransfenrecias").hide();
    });

    function geraHTMLItens(itens){
        var html = "";
        for (const item of itens) {
            var counter = 1;
            html+=
            `<div style="border:solid 1px black; border-radius:20px; padding:10px;">
                <b>Produto:</b><br>
                <span>${item.CODPRODUTO} - ${item.DESCPRODUTO}</span><br><br>
                
                <b>Descrição:</b><br>
                <span>${item.DESCRICAO}</span><br><br>
                
                <b>Quantidade:</b><br>
                <span>${item.QUANTIDADE} ${item.UN}</span><br><br>
                
                <b>Valor Unitário:</b><br>
                <span>${item.VALOR_UNITARIO}</span><br><br>
                
                <b>Valor Total:</b><br>
                <span>${floatToMoney(moneyToFloat(item.VALOR_UNITARIO) * moneyToFloat(item.QUANTIDADE))}</span>
            </div>`;
            counter++;
        }
        return html;
    }
}


// Historico
async function geraTabelaHistorico() {
    var rows = $("#tableHistorico>tbody>tr:not(:first)").get();

    for (let i = rows.length - 1; i >= 0; i--) {
        var row = $(rows[i]);

        var dataMovimento = $(row).find(".dataMovimento").val();
        var usuario = $(row).find(".usuario").val();
        var movimentacao = $(row).find(".movimentacao").val();
        var observacao = $(row).find(".observacao").val();


        var html = await gerahtml(usuario, dataMovimento, observacao, movimentacao);
        console.log(html)
        $("#divLinhasHistorico").append(html);
        $(".divImageUser:last").append(await BuscaImagemUsuario(usuario));
    }

    async function gerahtml(usuario, dataMovimento, observacao, movimentacao) {
        dataMovimento = dataMovimento.split(" ");
        dataMovimento[0] = dataMovimento[0].split("-").reverse().join("/");
        dataMovimento = dataMovimento.join(" ");

        var nomeUsuario = BuscaNomeUsuario(usuario);

        var html =
            `
            <div class="card">
                <div class="card-body" style="${movimentacao == "Aprovado" ? "border:solid 1px green;" : (movimentacao == "Reprovado" ? "border:solid 1px red;" : "")} ">
                    <div style="display:flex;">
                        <div class="divImageUser" style="margin-right:20px;"></div>
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
            img.classList.add('userImage');
            img.src = URL.createObjectURL(blob);
            await img.decode();
            resolve(img);
        });
    }
}


// Aprovadores
function aprovadoresMatriz(CODDEPTO){
    const coordenadoresMatriz = [
        {CODDEPTO:"1.2.01", NOME:"Presidência",              CODUSUARIO:"padilha"},
        {CODDEPTO:"1.2.02", NOME:"Administração",              CODUSUARIO:"padilha"},
        {CODDEPTO:"1.2.04", NOME:"Contabilidade",            CODUSUARIO:"cris"},
        {CODDEPTO:"1.2.05", NOME:"Informática",              CODUSUARIO:"thiago.senne"},
        {CODDEPTO:"1.2.06", NOME:"Financeiro",               CODUSUARIO:"fernando.jarvorski"},
        {CODDEPTO:"1.2.07", NOME:"Recursos Humanos",         CODUSUARIO:"ellen.virginia"},
        {CODDEPTO:"1.2.09", NOME:"Controladoria",            CODUSUARIO:"glaucio.moraes"},
        {CODDEPTO:"1.2.13", NOME:"Técnica",                  CODUSUARIO:"germano"},
        {CODDEPTO:"1.2.19", NOME:"Segurança / Qualidade",    CODUSUARIO:"alexandre.silva"},
        {CODDEPTO:"1.2.21", NOME:"Compras",                  CODUSUARIO:"thalessa.tomm"},
        {CODDEPTO:"1.2.30", NOME:"Diretoria Administrativa", CODUSUARIO:"padilha"},
        {CODDEPTO:"1.2.31", NOME:"Diretoria Tecnica",        CODUSUARIO:"jerson"},
        {CODDEPTO:"1.2.34", NOME:"Planejamento e Controle",  CODUSUARIO:"glaucio.moraes"},
        {CODDEPTO:"1.2.37", NOME:"Jurídico",                 CODUSUARIO:"rubia.oliveira"},
        {CODDEPTO:"1.2.38", NOME:"Meio Ambiente",            CODUSUARIO:"eder"},
        {CODDEPTO:"1.2.42", NOME:"Diretoria Executiva",      CODUSUARIO:"augusto"},
        {CODDEPTO:"1.2.43", NOME:"Nova Serrinha",            CODUSUARIO:"rodrigo.ramos"},
        {CODDEPTO:"1.2.64", NOME:"Frota Leve",            CODUSUARIO:"thalessa.tomm"},
        {CODDEPTO:"1.2.96", NOME:"Diretoria Planejamento Estratégico",CODUSUARIO:"mario"},
    ];

    var depto = coordenadoresMatriz.find(e=> e.CODDEPTO == CODDEPTO);
    if (depto) {
        return depto.CODUSUARIO;
    }
}


// Utils
function atualizaValorTotal() {
    var valorTotal = 0;

    $(".panelTransferencia:not(:first)").each(function () {
        var valorTotalPorTranferencia = 0;

        $(this).find(".tableItens>tbody").find("tr").each(function () {
            var valorItem = moneyToFloat($(this).find(`.itemValorTotal`).val());
            valorTotal += valorItem;
            valorTotalPorTranferencia += valorItem;
        });

        $(this).find(".spanValorTransferencia").text(floatToMoney(valorTotalPorTranferencia));
        $(this).find("input[name^='valorTotalTransferencia']").val(floatToMoney(valorTotalPorTranferencia));
    });

    $("#valorObraOrigem").val(floatToMoney(valorTotal));
    $("#valorObraDestino").val(floatToMoney(valorTotal));
    $("#valorTotal").val(valorTotal);
}
function consultaDepartamentos(CODCOLIGADA){
    var ds = DatasetFactory.getDataset("GDEPTO",["CODDEPARTAMENTO","NOME"],[
        DatasetFactory.createConstraint("CODCOLIGADA",CODCOLIGADA,CODCOLIGADA,ConstraintType.MUST),
        DatasetFactory.createConstraint("ATIVO","T","T",ConstraintType.MUST),
        DatasetFactory.createConstraint("CODFILIAL","1","1",ConstraintType.MUST),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.01","1.2.01",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.02","1.2.02",ConstraintType.SHOULD),
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
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.42","1.2.42",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.43","1.2.43",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.64","1.2.64",ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODDEPARTAMENTO","1.2.96","1.2.96",ConstraintType.SHOULD),
    ],null);

    if (ds.values.length == 0) {
        return [];
    }

    return ds.values;
}
function geraOptionsDepartamentos(ID, deptos){
    $("#"+ID)[0].selectize.addOption(deptos.map(e=>{return {value:`${e.CODDEPARTAMENTO} - ${e.NOME}`, text:`${e.CODDEPARTAMENTO} - ${e.NOME}`}}));
}

function movimentaAtividadeParaReprovacao() {
    var processId = $("#numProces").val();
    $.ajax({
        url: '/process-management/api/v2/activities?processInstanceId=' + processId + '&active=true',
        type: 'get',
        success: result => {
            var sequence = null;
            var targetState = null;
            var assignee = null

            if ($("#atividade").val() == ATIVIDADES.APROVADOR_ORIGEM) {
                targetState = 9;
                assignee = $("#usuarioAprovadorDestino").val();
                for (const task of result.items) {
                    if (task.state.sequence == ATIVIDADES.APROVADOR_DESTINO) {
                        sequence = task.movementSequence;
                    }
                }
            } else if ($("#atividade").val() == ATIVIDADES.APROVADOR_DESTINO) {
                targetState = 10;
                assignee = $("#usuarioAprovadorOrigem").val();
                for (const task of result.items) {
                    if (task.state.sequence == ATIVIDADES.APROVADOR_ORIGEM) {
                        sequence = task.movementSequence;
                    }
                }
            }

            DatasetFactory.getDataset("dsMovimentaAtividade", null, [
                DatasetFactory.createConstraint("numProces", processId, "", ConstraintType.MUST),
                DatasetFactory.createConstraint("movementSequence", sequence, "", ConstraintType.MUST),
                DatasetFactory.createConstraint("assignee", assignee, "", ConstraintType.MUST),
                DatasetFactory.createConstraint("targetState", targetState, "", ConstraintType.MUST),
            ], null, {
                success: ds => {

                }, error: e => {

                }
            });
        }

    });
}

function getServerURL() {
    var ds = DatasetFactory.getDataset("dsGetServerURL", null, null, null);
    return ds.values[0].URL;
}