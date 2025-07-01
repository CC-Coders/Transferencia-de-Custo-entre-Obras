
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

    var obrasComPermissaoDoUsuario = buscaObrasPorPermissaoDoUsuario(USUARIO);
    $("#ccustoObraOrigem").html(geraHtmlOptions(obrasComPermissaoDoUsuario));

    var todasObras = buscaObrasPorPermissaoDoUsuario(USUARIO, true);
    $("#ccustoObraDestino").html(geraHtmlOptions(todasObras));

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
    
    $("#itemProduto" + "___" + id).html(htmlListProdutos);
    $("#itemProduto" + "___" + id).selectize();

    $("#itemQuantidade" + "___" + id).maskMoney({thousands:'.', decimal:',',});
    $("#itemValorUnit" + "___" + id).maskMoney({thousands:'.', decimal:',', prefix: 'R$'});

    $("#itemQuantidade___" + id + ", #itemValorUnit___" + id).on("change", function(){
        var id = $(this).attr("id").split("___")[1];
        calculaValorTotalItem(id);
        atualizaValorTotal();
    });

    $(".btnRemoverLinhaItem:last").on("click", function(){
        fnWdkRemoveChild($(this).closest("tr")[0]);
        updateCounterRowsTableItens();
        atualizaValorTotal();
    });
    updateCounterRowsTableItens();
}

function calculaValorTotalItem(id){
    var quantidade = moneyToFloat($("#itemQuantidade" + "___" + id).val());
    var valor = moneyToFloat($("#itemValorUnit" + "___" + id).val());
    console.log(quantidade, valor)
    var valorTotal = quantidade * valor;
    console.log(valorTotal)

    $("#itemValorTotal" + "___" + id).val(floatToMoney(valorTotal));
}
function atualizaValorTotal(){
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

    function montaHtmlListaProdutos(listaProdutos){
        var html = "<option></option>";
        for (const produto of listaProdutos) {
            html += `<option value="${produto.VISUAL}">${produto.VISUAL}</option>`;
        }
        return html;
    }
}


function insereLinhaHistorico(){
    var id = wdkAddChild("tableHistorico");
    var usuario = $("#userCode").val();
    var observacao = $("#textObservacao").val();
    if (!observacao && ($("#atividade").val() == ATIVIDADES.INICIO && $("#atividade").val() == ATIVIDADES.INICIO_0)) {
        observacao = $("#textMotivoTransferencia").val();
    }

    var movimentacao = "";
    if ($("#formMode").val() == "ADD") {
        movimentacao = "Inicio";
    }
    else if ($("#descisao").val() == "Aprovar") {
        movimentacao = "Aprovar";
    }
    else if ($("#descisao").val() == "Reprovar") {
        movimentacao = "Reprovar";
    }else{

    }

    $("#idLinha" + "___" + id).val(id);
    $("#dataMovimento" + "___" + id).val(moment().format("YYYY-MM-DD HH:MM"));
    $("#usuario" + "___" + id).val(usuario);
    $("#movimentacao" + "___" + id).val(movimentacao);
    $("#observacao" + "___" + id).val(observacao);
}
function geraTabelaHistorico(){
    $("#tableHistorico>tbody>tr:not(:first)").each(async function(){
        var idLinha = $(this).find(".idLinha").val();
        var dataMovimento = $(this).find(".dataMovimento").val();
        var usuario = $(this).find(".usuario").val();
        var movimentacao = $(this).find(".movimentacao").val();
        var observacao = $(this).find(".observacao").val();


        var html = await gerahtml(usuario, dataMovimento, observacao, movimentacao);
        console.log(html)
        $("#divLinhasHistorico").append(html);
        $(".divImageUser:last").append(await BuscaImagemUsuario(usuario));
    });

    async function gerahtml(usuario, dataMovimento, observacao, movimentacao){
        var nomeUsuario = BuscaNomeUsuario(usuario);

        var  html =
        `<div>
            <div class="card">
                <div class="card-body">
                    <div style="display:flex;">
                        <div class="divImageUser" style="margin-right:20px;"></div>
                        <div>
                            <h3 class="card-title">${nomeUsuario}</h3>
                            <small>${dataMovimento}</small>
                        </div>
                    </div>

                    <p class="card-text">${observacao}</p>
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
            img.width = "40";
            img.height = "40";
            img.src = URL.createObjectURL(blob);
            await img.decode();
            resolve(img);
        });
    }
}