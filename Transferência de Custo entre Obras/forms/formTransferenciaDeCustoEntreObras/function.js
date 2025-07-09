
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
    var obrasComPermissaoDoUsuario = buscaObrasPorPermissaoDoUsuario(USUARIO);
    $("#ccustoObraOrigem").html(geraHtmlOptions(obrasComPermissaoDoUsuario));
    $("#ccustoObraOrigem").val(val);


    var val2 = $("#ccustoObraDestino").val();
    console.log("val2", val2);
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


function adicionarLinhaItem() {
    var id = wdkAddChild("tableItens")
    loadLinhaItem(id);
    updateCounterRowsTableItens();
}
function loadLinhaItem(id) {
    var val = $("#itemProduto" + "___" + id).val();
    $("#itemProduto" + "___" + id).html(htmlListProdutos);
    $("#itemProduto" + "___" + id).val(val);
    $("#itemProduto" + "___" + id).selectize();

    $("#itemQuantidade" + "___" + id).maskMoney({ thousands: '.', decimal: ',', });
    $("#itemValorUnit" + "___" + id).maskMoney({ thousands: '.', decimal: ',', prefix: 'R$' });

    $("#itemQuantidade___" + id + ", #itemValorUnit___" + id).on("change, keyup", function () {
        var id = $(this).attr("id").split("___")[1];
        calculaValorTotalItem(id);
        atualizaValorTotal();
    });


    $(".btnRemoverLinhaItem").off("click").on("click", function () {
        fnWdkRemoveChild($(this).closest("tr")[0]);
        updateCounterRowsTableItens();
        atualizaValorTotal();
    });
}


function calculaValorTotalItem(id) {
    var quantidade = moneyToFloat($("#itemQuantidade" + "___" + id).val());
    var valor = moneyToFloat($("#itemValorUnit" + "___" + id).val());
    console.log(quantidade, valor)
    var valorTotal = quantidade * valor;
    console.log(valorTotal)

    $("#itemValorTotal" + "___" + id).val(floatToMoney(valorTotal));
}
function atualizaValorTotal() {
    var valorTotal = 0;
    $("#tableItens>tbody>tr:not(:first)").each(function () {
        var valorItem = $(this).find(`input[name^="itemValorTotal___"]`).val();
        valorTotal += moneyToFloat(valorItem);
    });

    $("#valorObraOrigem").val("- " + floatToMoney(valorTotal));
    $("#valorObraDestino").val(floatToMoney(valorTotal));
}


function updateCounterRowsTableItens() {
    var counter = 1;
    $("#tableItens>tbody>tr:not(:first)").each(function () {
        $(this).find("td:first").text(counter);
        counter++;
    });
}


async function loadListaItens() {
    listaProdutos = await buscaProdutos($("#CODCOLIGADA").val());
    htmlListProdutos = montaHtmlListaProdutos(listaProdutos);

    function buscaProdutos(CODCOLIGADA) {
        return new Promise((resolve, reject) => {
            DatasetFactory.getDataset("BuscaProdutosRM", null, [
                DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
                DatasetFactory.createConstraint("TipoProduto", "OC/OS", "OC/OS", ConstraintType.MUST)
            ], null, {
                success: (produtos => {
                    resolve(produtos.values);
                }),
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar produtos: ",
                        message: error,
                        type: "warning"
                    });
                    reject();
                }
            });
        });
    }

    function montaHtmlListaProdutos(listaProdutos) {
        var html = "<option></option>";
        for (const produto of listaProdutos) {
            html += `<option value="${produto.VISUAL}">${produto.VISUAL}</option>`;
        }
        return html;
    }
}


function insereLinhaHistorico() {
    var id = wdkAddChild("tableHistorico");
    var usuario = $("#userCode").val();
    var observacao = $("#textObservacao").val();
    var atividadeAtual = $("#atividade").val();

    if (!observacao && ($("#atividade").val() == ATIVIDADES.INICIO && $("#atividade").val() == ATIVIDADES.INICIO_0)) {
        observacao = $("#textMotivoTransferencia").val();
    }

    var movimentacao = "";
    if ($("#formMode").val() == "ADD") {
        movimentacao = "Inicio";
    }
    else if(atividadeAtual == ATIVIDADES.INICIO){
        movimentacao = "Ajuste";
    }
    else if ($("#decisao").val() == "Aprovado") {
        movimentacao = "Aprovado";
    }
    else if ($("#decisao").val() == "Reprovado") {
        movimentacao = "Reprovado";
    } else {

    }

    $("#idLinha" + "___" + id).val(id);
    $("#usuario" + "___" + id).val(usuario);
    $("#movimentacao" + "___" + id).val(movimentacao);
    $("#observacao" + "___" + id).val(observacao);
    $("#dataMovimento" + "___" + id).val(moment().format("YYYY-MM-DD HH:mm"));
}
async function geraTabelaHistorico() {
    var rows = $("#tableHistorico>tbody>tr:not(:first)").get();

    for (let i = rows.length - 1; i >= 0; i--) {
        var row = $(rows[i]);

        var idLinha = $(row).find(".idLinha").val();
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