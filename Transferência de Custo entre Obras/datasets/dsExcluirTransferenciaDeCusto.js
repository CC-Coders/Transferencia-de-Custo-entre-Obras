function createDataset(fields, constraints, sortFields) {
    var STATUS_TRANSFENCIA = {
        "EM_APROVACAO": 1,
        "APROVADO": 2,
        "CANCELADO": 3,
        "EXCLUIDO": 4,
    }
    var CODTMV = '1.1.93';

    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["NUMPROCES"]);

        var result = consultaLancamentosDaSolicitacao(constraints.NUMPROCES)[0];
        log.info("consultaLancamentosDaSolicitacao");
        log.dir(result);
        var ID = result.ID;

        var CODCOLIGADA_ORIGEM = result.CODCOLIGADA_ORIGEM
        var IDMOV_ORIGEM = result.IDMOV_ORIGEM;
        excluirMovimento(CODCOLIGADA_ORIGEM, IDMOV_ORIGEM, CODTMV, "fluig");
        
        var CODCOLIGADA_DESTINO = result.CODCOLIGADA_DESTINO;
        var IDMOV_DESTINO = result.IDMOV_DESTINO;
        excluirMovimento(CODCOLIGADA_DESTINO, IDMOV_DESTINO, CODTMV, "fluig");


        atualizaStatusTransferencia(ID, STATUS_TRANSFENCIA.EXCLUIDO);

        return returnDataset("SUCCESS", "", "");
    } catch (erro) {
        if (typeof erro == "object") {
            if (erro.toString()) {
                return returnDataset("ERRO", erro.toString(), null);
            }
            else{
                var mensagem = "";
                var keys = Object.keys(erro);
                for (var i = 0; i < keys.length; i++) {
                    mensagem += (keys[i] + ": " + erro[keys[i]]) + " - ";
                }
                log.info("Erro ao executar Dataset:");
                log.dir(erro);
                log.info(mensagem);
    
                return returnDataset("ERRO", mensagem, null);
            }
        } else {
            return returnDataset("ERRO", erro, null);
        }
    }
}


function consultaLancamentosDaSolicitacao(NUMPROCES){
    try {
        var query = "SELECT ID, ID_SOLICITACAO, STATUS, CODCOLIGADA_ORIGEM, IDMOV_ORIGEM, CODCOLIGADA_DESTINO, IDMOV_DESTINO FROM TRANSFERENCIAS_DE_CUSTO WHERE ID_SOLICITACAO = ?";
        var result = executaQuery(query, [
            {type:"int",value:NUMPROCES}
        ], "/jdbc/CastilhoCustom");
        return result;
    } catch (error) {
        throw error;
    }
}
function atualizaStatusTransferencia(ID, STATUS) {
    try {
        var query = 
        "UPDATE TRANSFERENCIAS_DE_CUSTO SET " +
        "   STATUS = ? "+ //1
        "WHERE ID = ?"; //5

        executeUpdateSemResult(query, [
            { type: "int", value: STATUS },//1
            { type: "int", value: ID },//5
        ]);
    } catch (error) {
        throw error;
    }
}
function excluirMovimento(CODCOLIGADA, IDMOV, CODTMV, USER) {
    try {
        var pUsuario = "fluig",
            pPassword = "flu!g@cc#2018";

        var strXML =
            "<MovCancelMovProcParams> "+
    	 	"   <MovimentosACancelar> "+
	        "       <MovimentosCancelar> "+
	        "       <CodColigada>" + CODCOLIGADA + "</CodColigada>"+
	        "       <CodSistema>T</CodSistema>"+
	        "       <CodTmv>" + CODTMV + "</CodTmv>"+
	        "       <CodUsuarioLogado>" + USER + "</CodUsuarioLogado>"+
	        "       <IdMov>" + IDMOV + "</IdMov>"+
            "       <DataCancelamento>" + getDate() + "</DataCancelamento>"+
            "       <MotivoCancelamento>Movimento cancelado automaticamente pelo FLUIG.</MotivoCancelamento>"+
            "       </MovimentosCancelar>"+
            "   </MovimentosACancelar>"+
            "</MovCancelMovProcParams>";
        log.info("XML = " + strXML);

        var service = ServiceManager.getService("wsProcessRM");
        var serviceHelper = service.getBean();
        var serviceLocator = service.instantiate("com.totvs.WsProcess");
        var wsObj = serviceLocator.getRMIwsProcess();

        var authService = serviceHelper.getBasicAuthenticatedClient(wsObj, "com.totvs.IwsProcess", pUsuario, pPassword);
        var ret = authService.executeWithParams("MovCancelMovProc", strXML);
        console.log(ret)
        if (ret == "1") {
            return true;
        } else {
            throw ret;
        }
    } catch (error) {
        throw error;
    }
}


// Utils
function getConstraints(constraints) {
    var retorno = {};
    if (constraints != null) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            retorno[constraint.fieldName] = constraint.initialValue;
        }
    }
    return retorno;
}
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}
function lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias) {
    try {
        var retornoErro = [];
        for (var i = 0; i < listConstrainstObrigatorias.length; i++) {
            if (constraints[listConstrainstObrigatorias[i]] == null || constraints[listConstrainstObrigatorias[i]] == "" || constraints[listConstrainstObrigatorias[i]] == undefined) {
                retornoErro.push(listConstrainstObrigatorias[i]);
            }
        }

        if (retornoErro.length > 0) {
            throw "Constraints obrigatorias nao informadas (" + retornoErro.join(", ") + ")";
        }
    } catch (error) {
        throw error;
    }
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
function getDate() {
    var dataAtual = new Date();
    var dia = dataAtual.getDate();
    if (dia < 10) {
        dia = "0" + dia;
    }

    var mes = dataAtual.getMonth() + 1; //January is 0!
    if (mes < 10) {
        mes = "0" + mes;
    }

    var ano = dataAtual.getFullYear();

    var today = ano + "-" + mes + "-" + dia;
    return today;
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