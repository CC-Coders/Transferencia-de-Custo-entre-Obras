function servicetask26(attempt, message) {
    try {
        updateDataCompetencia();
        atualizaStatusTransferencia(STATUS_TRANSFENCIA.APROVADO);

        var CODCOLIGADA_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[0];
        var CODCCUSTO_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[1];
        var NOMECCUSTO_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[2];

        var CODCOLIGADA_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[0];
        var CODCCUSTO_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[1];
        var NOMECCUSTO_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[2];

        var PRODUTOS = getProdutos(CODCOLIGADA_ORIGEM, CODCOLIGADA_DESTINO);
        var CUSTO_OU_RECEITA = hAPI.getCardValue("TRANSFERE_CUSTO") == "true" ? "CUSTO":"RECEITA";


        // Lanca ajuste para Obra Origem
        // Se for TRANSFERE_CUSTO, então a Obra Origem, recebe o PRODUTO AUMENTA_RESULTADO, pois está enviando o CUSTO
        // Porém, se for TRANSFERE_RECEITA, então a Obra Origem, recebe o PRODUTO DIMINUI_RESULTADO, pois está enviando a RECEITA
        var PRODUTO_ORIGEM = hAPI.getCardValue("TRANSFERE_CUSTO") == "true" ? PRODUTOS[CUSTO_OU_RECEITA].AUMENTA_RESULTADO : PRODUTOS[CUSTO_OU_RECEITA].DIMINUI_RESULTADO;
        var idmov = geraMovimentos(CODCOLIGADA_ORIGEM, CODCCUSTO_ORIGEM, CODCOLIGADA_DESTINO, NOMECCUSTO_ORIGEM, PRODUTO_ORIGEM);
        hAPI.setCardValue("IDMOV_ORIGEM", idmov);


        // Lanca ajuste para Obra Destino
        // Se for TRANSFERE_CUSTO, então a Obra Destino, recebe o PRODUTO DIMINUI_RESULTADO, pois está recebendo CUSTO
        // Porém, se for TRANSFERE_RECEITA, então a Obra Destino, recebe o PRODUTO AUMENTA_RESULTADO, pois está recebendo a RECEITA
        var PRODUTO_DESTINO = hAPI.getCardValue("TRANSFERE_CUSTO") == "true" ? PRODUTOS[CUSTO_OU_RECEITA].DIMINUI_RESULTADO : PRODUTOS[CUSTO_OU_RECEITA].AUMENTA_RESULTADO;
        var idmov = geraMovimentos(CODCOLIGADA_DESTINO, CODCCUSTO_DESTINO, CODCOLIGADA_ORIGEM, NOMECCUSTO_DESTINO, PRODUTO_DESTINO);
        hAPI.setCardValue("IDMOV_DESTINO", idmov);


    
        if (CODCOLIGADA_ORIGEM != CODCOLIGADA_DESTINO) {
            // Se Coligada de Origem for Diferente de Destino, informa a Controladoria
            EnviaEmail("contabilidade@castilho.com.br; control@castilho.com.br; informatica@castilho.com.br; padilha@castilho.com.br");
        }
    } catch (error) {
        log.error(error);
        throw error;
    }
}

// Gera 1.1.93
function getProdutos(CODCOLIGADA_ORIGEM, CODCOLIGADA_DESTINO) {
    if (CODCOLIGADA_ORIGEM == CODCOLIGADA_DESTINO) {
        // Se transferencia entre Centro de Custo
        var PRODUTOS = {
            CUSTO:{
                AUMENTA_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00110",
                    CODIGOPRD: "11.006.00110",
                    DESCPRD: "Ajustes gerenciais (+)",
                },
                DIMINUI_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00111",
                    CODIGOPRD: "11.006.00111",
                    DESCPRD: "Ajustes gerenciais (-)",
                }
            }, 
            RECEITA:{
                AUMENTA_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00108",
                    CODIGOPRD: "11.006.00108",
                    DESCPRD: "Recebimentos (+)",
                },
                DIMINUI_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00109",
                    CODIGOPRD: "11.006.00109",
                    DESCPRD: "Recebimentos (-)",
                }
            }
        }
        return PRODUTOS;
    } else {
        // Se Transferencia entre Coligadas
        var PRODUTOS = {
            CUSTO:{
                AUMENTA_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00160",
                    CODIGOPRD: "11.006.00158",
                    DESCPRD: "Ajuste entre coligadas (+)",
                },
                DIMINUI_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00161",
                    CODIGOPRD: "11.006.00159",
                    DESCPRD: "Ajuste entre coligadas (-)",
                }
            },
            RECEITA:{
                AUMENTA_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00108",
                    CODIGOPRD: "11.006.00108",
                    DESCPRD: "Recebimentos (+)",
                },
                  DIMINUI_RESULTADO: {
                    CODIGOPRD_COLIGADA1: "11.006.00109",
                    CODIGOPRD: "11.006.00109",
                    DESCPRD: "Recebimentos (-)",
                }
            }
        }
        return PRODUTOS;
    }
}
function buscaIdDoProduto(CODCOLIGADA, CODIGOPRD) {
    var query = "SELECT IDPRD, CODIGOPRD, NOMEFANTASIA FROM TPRODUTO WHERE CODCOLPRD = ? AND CODIGOPRD = ?";

    return executaQuery(query, [
        { type: "int", value: CODCOLIGADA },
        { type: "varchar", value: CODIGOPRD },
    ], "/jdbc/FluigRM");
}
function buscaLocalEstoquePorNome(CODCOLIGADA, CODFILIAL, NOME) {
    var ds = DatasetFactory.getDataset("LocalRM", null, [
        DatasetFactory.createConstraint("clg", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("cdFl", CODFILIAL, CODFILIAL, ConstraintType.MUST),
    ], null);

    for (var i = 0; i < ds.values.length; i++) {
        var nomeLocalEstoque = ds.getValue(i, "nome");
        if (NOME == nomeLocalEstoque || (NOME == "Obra VLI Manutenção" && nomeLocalEstoque == "Obra VLI Paulista")) {
            return ds.getValue(i, "codloc");
        }
    }
}

function geraMovimentos(CODCOLIGADA, CODCCUSTO, CODCOLIGADA_FORNECEDOR, NOMECCUSTO, PRODUTO) {
    var CODLOC = buscaLocalEstoquePorNome(CODCOLIGADA, 1, NOMECCUSTO);
    log.info("CODLOC")
    log.info(CODLOC)
    var CNPJColigadaFornecedor = buscaCNPJDaColigada(CODCOLIGADA_FORNECEDOR);
    log.info("CNPJColigadaFornecedor")
    log.info(CNPJColigadaFornecedor)
    var fornecedor = buscaCodigoFornecedor(CODCOLIGADA, CNPJColigadaFornecedor);
    var CODCOLCFO = fornecedor[0];
    var CODCFO = fornecedor[1];
    log.info("CODCFO")
    log.info(CODCFO)

    var xml = montaXML(CODCOLIGADA, CODLOC, CODCOLCFO, CODCFO, PRODUTO, CODCCUSTO);

    var idmov = ImportaMovimento(CODCOLIGADA, xml);
    log.info("Movimentos inseridos: " + idmov);
    return idmov;

}
function montaXML(CODCOLIGADA, CODLOC, CODCOLCFO, CODCFO, PRODUTO, CODCCUSTO) {
    var URLFluig = getServerURL() + "/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + getValue("WKNumProces");

    var xml = "";
    xml += "<MovMovimento>";
    xml += "    <TMOV>";
    xml += "        <CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
    xml += "        <IDMOV>-1</IDMOV>";
    xml += "        <NUMEROMOV>-1</NUMEROMOV> ";
    xml += "        <CODFILIAL>1</CODFILIAL>";
    xml += "        <CODLOC>" + CODLOC + "</CODLOC>";
    xml += "        <CODTMV>1.1.93</CODTMV>";
    xml += "        <TIPO>A</TIPO>";
    xml += "        <STATUS>A</STATUS>";
    xml += "        <DATAEMISSAO>" + getDateNow() + "</DATAEMISSAO>";
    xml += "        <DATASAIDA>" + getDateNow() + "</DATASAIDA>";
    xml += "        <CODMOEVALORLIQUIDO>R$</CODMOEVALORLIQUIDO>";
    xml += "        <INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>";
    xml += "        <CODCOLIGADA1>" + CODCOLIGADA + "</CODCOLIGADA1>";
    xml += "        <CODCFO>" + CODCFO + "</CODCFO>";
    xml += "        <CODCFOAUX>" + CODCFO + "</CODCFOAUX>";
    xml += "        <CODCOLCFO>" + CODCOLCFO + "</CODCOLCFO>";
    xml += "        <CODCPG>001</CODCPG>";
    xml += "    </TMOV>";



    var CODIGOPRD = CODCOLIGADA == 1 ?  PRODUTO.CODIGOPRD_COLIGADA1: PRODUTO.CODIGOPRD;
    var DESCPRODUTO = PRODUTO.DESCPRD;
    var IDPRD = buscaIdDoProduto(CODCOLIGADA, CODIGOPRD)[0].IDPRD;

    // var DESCITEM = item.DescricaoItem;
    var QUANTIDADE = 1;
    var VALORUNIT = moneyToFloat(hAPI.getCardValue("valorObraDestino")).toString().replace(".", ",");
    var CODUND = "UN";

    xml += "<TITMMOV>";
    xml += "    <CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
    xml += "    <IDMOV>-1</IDMOV>";
    xml += "    <CODLOC>" + CODLOC + "</CODLOC>";
    xml += "    <NSEQITMMOV>1</NSEQITMMOV>";
    xml += "    <NUMEROSEQUENCIAL>1</NUMEROSEQUENCIAL>";
    xml += "    <IDPRD>" + IDPRD + "</IDPRD>";
    xml += "    <CODIGOPRD>" + CODIGOPRD + "</CODIGOPRD>";
    xml += "    <NOMEFANTASIA>" + DESCPRODUTO + "</NOMEFANTASIA>";
    xml += "    <QUANTIDADE>" + QUANTIDADE + "</QUANTIDADE>";
    xml += "    <PRECOUNITARIO>" + VALORUNIT + "</PRECOUNITARIO>";
    xml += "    <CODUND>" + CODUND + "</CODUND>";
    xml += "    <VALORUNITARIO>" + VALORUNIT + "</VALORUNITARIO>";
    // xml += "    <HISTORICOCURTO>" + DESCITEM + "</HISTORICOCURTO>";
    xml += "    <INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>";
    xml += "    <IDMOVHST>-1</IDMOVHST>";
    xml += "    <CODCOLIGADA1>" + CODCOLIGADA + "</CODCOLIGADA1>";
    xml += "    <NSEQITMMOV1>1</NSEQITMMOV1>";
    xml += "</TITMMOV>"


    xml += "<TITMMOVRATCCU>";
    xml += "    <CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
    xml += "    <IDMOV>-1</IDMOV>";
    xml += "    <NSEQITMMOV>1</NSEQITMMOV>";
    xml += "    <CODCCUSTO>" + CODCCUSTO + "</CODCCUSTO>";
    xml += "    <PERCENTUAL>100</PERCENTUAL>";
    xml += "    <IDMOVRATCCU>-1</IDMOVRATCCU>";
    xml += "</TITMMOVRATCCU>";


    xml += "<TITMMOVRATDEP>";
    xml += "    <CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
    xml += "    <IDMOV>-1</IDMOV>";
    xml += "    <NSEQITMMOV>1</NSEQITMMOV>";
    xml += "    <CODFILIAL>1</CODFILIAL>";
    xml += "    <CODDEPARTAMENTO>1.3.01</CODDEPARTAMENTO>";
    xml += "    <PERCENTUAL>100</PERCENTUAL>";
    xml += "</TITMMOVRATDEP>";


    xml += "<TMOVCOMPL>";
    xml += "    <CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA> ";
    xml += "    <IDMOV>-1</IDMOV>";
    xml += "    <FLUIG>" + URLFluig + "</FLUIG>";
    xml += "</TMOVCOMPL>";
    xml += "</MovMovimento> ";

    xml = xml.split("&").join("&amp;");
    log.info("XML: " + xml);

    return xml;
}

function buscaCodigoFornecedor(CODCOLIGADA, CGCCFO) {
    var FCFO = DatasetFactory.getDataset("FCFO", null, [
        DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("CGCCFO", CGCCFO, CGCCFO, ConstraintType.MUST),
    ], null);
    if (FCFO.values.length > 0) {
        return [CODCOLIGADA, FCFO.getValue(0, "CODCFO")];
    }

    var FCFO = DatasetFactory.getDataset("FCFO", null, [
        DatasetFactory.createConstraint("CODCOLIGADA", 0, 0, ConstraintType.MUST),
        DatasetFactory.createConstraint("CGCCFO", CGCCFO, CGCCFO, ConstraintType.MUST),
    ], null);
    if (FCFO.values.length > 0) {
        return [0, FCFO.getValue(0, "CODCFO")];
    }
}
function buscaCNPJDaColigada(CODCOLIGADA) {
    var ds = DatasetFactory.getDataset("Coligadas", null, [
        DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST)
    ], null);
    return ds.getValue(0, "CGC");
}

function ImportaMovimento(CODCOLIGADA, xml) {
    var ds = DatasetFactory.getDataset("ImportaMovRM", null, [
        DatasetFactory.createConstraint("xmlMov", xml, xml, ConstraintType.MUST),
        DatasetFactory.createConstraint("codColigada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST)
    ], null);

    if (!ds || ds == "" || ds == null) {
        return [false, "Houve um erro na comunicação com o webservice. Tente novamente!"];
    }
    else {
        if (ds.values[0][0] == "false") {
            throw "Erro ao gerar movimento. Favor entrar em contato com o administrador do sistema. Mensagem: " + ds.values[0][1];
        }
        else if (ds.values[0][0] == "true") {
            return ds.values[0][2];
        }
    }
}


function EnviaEmail(emails) {
    var CorpoEmail = "";
    CorpoEmail += "Olá, <br>";
    CorpoEmail += "Segue abaixo as informações das Transferência de "+(hAPI.getCardValue("TRANSFERE_CUSTO") == "true" ? "CUSTO":"RECEITA")+" entre Coligadas<br>";
    CorpoEmail += "<br>";
    CorpoEmail += "<h4>OBRA ORIGEM</h4>";
    CorpoEmail += "<b>Coligada: </b><span>" + hAPI.getCardValue("ccustoObraOrigem").split(" - ")[0] + "</span><br>";
    CorpoEmail += "<b>Centro de Custo: </b><span>" + hAPI.getCardValue("ccustoObraOrigem") + "</span><br>";
    CorpoEmail += "<br>";
    CorpoEmail += "<h4>OBRA DESTINO</h4>";
    CorpoEmail += "<b>Coligada: </b><span>" + hAPI.getCardValue("ccustoObraDestino").split(" - ")[0] + "</span><br>";
    CorpoEmail += "<b>Centro de Custo: </b><span>" + hAPI.getCardValue("ccustoObraDestino") + "</span><br>";
    CorpoEmail += "<br>";
    CorpoEmail += "<b>Valor: </b><span>" + FormataValorParaMoeda(parseFloat(hAPI.getCardValue("valorTotal"))) + "</span><br>";
    CorpoEmail += "<b>Data Competência: </b><span>" + getDateNow().split("-").reverse().join("/") + "</span><br>";
    CorpoEmail += "<br>";
    CorpoEmail += "Para mais informações, <a href='http://fluig.castilho.com.br:1010/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + getValue("WKNumProces") + "'>clique aqui</a>.";

    var url = 'http://fluig.castilho.com.br:1010';//Prod
    // var url = 'http://homologacao.castilho.com.br:2020';//Homolog

    var data = {
        "to": emails,
        from: "fluig@construtoracastilho.com.br", //Prod
        "subject": "Transferência de "+(hAPI.getCardValue("TRANSFERE_CUSTO") == "true" ? "CUSTO":"RECEITA")+" entre Coligadas - #" + getValue("WKNumProces"), //   subject
        "templateId": "TPL_PADRAO_CASTILHO", // Email template Id previously registered
        "dialectId": "pt_BR", //Email dialect , if not informed receives pt_BR , email dialect ("pt_BR", "en_US", "es")
        "param": {
            "CORPO_EMAIL": CorpoEmail,
            "SERVER_URL": url,
            "TENANT_ID": "1"
        }
    };


    var clientService = fluigAPI.getAuthorizeClientService();
    var data = {
        companyId: getValue("WKCompany") + '',
        serviceCode: 'ServicoFluig',
        endpoint: '/api/public/alert/customEmailSender',
        method: 'post',
        params: data,
        options: {
            encoding: 'UTF-8',
            mediaType: 'application/json',
            useSSL: true
        },
        headers: {
            "Content-Type": 'application/json;charset=UTF-8'
        }
    };


    var vo = clientService.invoke(JSON.stringify(data));

    if (vo.getResult() == null || vo.getResult().isEmpty()) {
        throw new Exception("Retorno está vazio");
    } else {
        return vo.getResult();
    }
}




function atualizaStatusTransferencia(STATUS) {
    var id = hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO");

    var query = "UPDATE TRANSFERENCIAS_DE_CUSTO SET STATUS = ? WHERE ID = ?";
    executeUpdateSemResult(query, [
        { type: "int", value: STATUS },
        { type: "int", value: id },
    ]);
}
function updateDataCompetencia(){
    var date = getDateNow();
    var id = hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO");

    var query =
        "UPDATE TRANSFERENCIAS_DE_CUSTO " +
        "   SET DATA_COMPETENCIA = ? " +
        "   WHERE ID = ? ";

    return executeUpdateSemResult(query, [
        { type: "varchar", value: date },
        { type: "int", value: id },
    ]);
}


// Utils
function getServerURL() {
    var ds = DatasetFactory.getDataset("dsGetServerURL", null, null, null);
    return ds.getValue(0, "URL");
}
function executaQuery(query, constraints, dataSorce) {
    try {
        var dataSource = dataSorce;
        var ic = new javax.naming.InitialContext();
        var ds = ic.lookup(dataSource);

        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(query);

        var counter = 1;
        for (var i = 0; i < constraints.length; i++) {
            var val = constraints[i];
            if (val.type == "int") {
                stmt.setInt(counter, val.value);
            }
            else if (val.type == "float") {
                stmt.setFloat(counter, val.value);
            }
            else if (val.type == "date") {
                stmt.setString(counter, val.value);
            }
            else if (val.type == "datetime") {
                stmt.setString(counter, val.value);
            } else {
                stmt.setString(counter, val.value);
            }
            counter++;
        }

        var rs = stmt.executeQuery();
        var columnCount = rs.getMetaData().getColumnCount();
        var retorno = [];

        while (rs.next()) {
            var linha = {};
            for (var j = 1; j < columnCount + 1; j++) {
                linha[rs.getMetaData().getColumnName(j)] = rs.getObject(rs.getMetaData().getColumnName(j)).toString() + "";
            }
            retorno.push(linha);
        }

        return retorno;

    } catch (e) {
        log.error("ERRO==============> " + e.message);
        throw e;
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
}
function executeUpdateSemResult(query, constraints) {
    var dataSource = "/jdbc/CastilhoCustom";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);

    log.info("wfkTransferenciaDeCustoEntreObras.beforeTaskSave: executandoQuery");
    log.info(query);
    try {
        var conn = ds.getConnection();
        var stmt = conn.prepareStatement(query, Packages.java.sql.Statement.RETURN_GENERATED_KEYS);

        var counter = 1;
        for (var i = 0; i < constraints.length; i++) {
            var val = constraints[i];
            if (val.type == "int") {
                stmt.setInt(counter, val.value);
            }
            else if (val.type == "float") {
                stmt.setFloat(counter, val.value);
            }
            else if (val.type == "date") {
                stmt.setString(counter, val.value);
            }
            else if (val.type == "datetime") {
                stmt.setString(counter, val.value);
            } else {
                stmt.setString(counter, val.value);
            }
            counter++;
        }

        log.info("wfkTransferenciaDeCustoEntreObras.beforeTaskSave: executandoQuery"+constraints.length)

       stmt.execute();


    } catch (e) {
        log.error("ERRO==============> " + e.message);
        throw e;
    } finally {
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
}