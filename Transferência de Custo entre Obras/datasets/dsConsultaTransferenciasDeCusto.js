function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        // lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["IDMOV"]);

        var query = "";
        query += "SELECT ";
        query += "      ID_SOLICITACAO,  ";
        query += "      CODCOLIGADA_ORIGEM,  ";
        query += "      CCUSTO_ORIGEM,  ";
        query += "      DEPARTAMENTO_ORIGEM,  ";
        query += "      CODCOLIGADA_DESTINO,  ";
        query += "      CCUSTO_DESTINO,  ";
        query += "      DEPARTAMENTO_DESTINO,  ";
        query += "      SOLICITANTE,  ";
        query += "      TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.VALOR,  ";
        query += "      OBSERVACAO,  ";
        query += "      DATA_SOLICITACAO,  ";
        query += "      DATA_COMPETENCIA,  ";
        query += "      TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.TRANSFERE_CUSTO, ";
        query += "	    TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.TRANSFERE_RECEITA, ";
        query += "	    TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.TIPO, ";
        query += "	    TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.ID as ID_TRANSFERENCIA, ";
        query += "      STATUS  ";
        query += "FROM TRANSFERENCIAS_DE_CUSTO ";
        query += "INNER JOIN  TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA ON TRANSFERENCIAS_DE_CUSTO.ID = TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.ID_TRANSFERENCIA ";
        query += "WHERE 1=1 ";

        var queryConstraints = [];

        // Filtro Coligada
        if (constraints.CODCOLIGADA_ORIGEM) {
            if (constraints.CODCOLIGADA_DESTINO) {
                query += "AND ((CODCOLIGADA_ORIGEM = ? AND CODCOLIGADA_DESTINO = ?) OR (CODCOLIGADA_DESTINO = ? AND CODCOLIGADA_ORIGEM = ?)) ";
                queryConstraints.push({type:"int", value: constraints.CODCOLIGADA_ORIGEM});
                queryConstraints.push({type:"int", value: constraints.CODCOLIGADA_DESTINO});
                queryConstraints.push({type:"int", value: constraints.CODCOLIGADA_ORIGEM});
                queryConstraints.push({type:"int", value: constraints.CODCOLIGADA_DESTINO});
            }else{
                query += "AND (CODCOLIGADA_ORIGEM = ? OR  CODCOLIGADA_DESTINO = ?) ";
                queryConstraints.push({type:"int", value: constraints.CODCOLIGADA_ORIGEM});
                queryConstraints.push({type:"int", value: constraints.CODCOLIGADA_ORIGEM});
            }
        }

        // Filtro CCUSTO
        if (constraints.CCUSTO_ORIGEM) {
            query += "AND (CCUSTO_ORIGEM = ? OR CCUSTO_DESTINO = ?) ";
            queryConstraints.push({type:"varchar", value: constraints.CCUSTO_ORIGEM});
            queryConstraints.push({type:"varchar", value: constraints.CCUSTO_ORIGEM});
        }

        // Filtro Departamento
        if (constraints.DEPTO) {
            query += "AND (DEPARTAMENTO_ORIGEM = ? OR DEPARTAMENTO_DESTINO = ?) ";
            queryConstraints.push({type:"varchar", value: constraints.DEPTO});
            queryConstraints.push({type:"varchar", value: constraints.DEPTO});
        }

        // Filtro TIPO
        if (constraints.TIPO) {
            query += "AND (TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA.TIPO = ?) ";
            queryConstraints.push({type:"varchar", value: constraints.TIPO});
        }

        // Filtro Periodo
        if (constraints.DATAINICIO && constraints.DATAFIM) {
            query += "AND ((TRANSFERENCIAS_DE_CUSTO.DATA_COMPETENCIA IS NULL AND TRANSFERENCIAS_DE_CUSTO.DATA_SOLICITACAO BETWEEN CONVERT(datetime, ?, 121) AND CONVERT(datetime, ?, 121)) OR ( TRANSFERENCIAS_DE_CUSTO.DATA_COMPETENCIA IS NOT NULL AND TRANSFERENCIAS_DE_CUSTO.DATA_COMPETENCIA BETWEEN ? AND ?))";
            queryConstraints.push({type:"varchar", value: constraints.DATAINICIO});
            queryConstraints.push({type:"varchar", value: constraints.DATAFIM});
            queryConstraints.push({type:"varchar", value: constraints.DATAINICIO});
            queryConstraints.push({type:"varchar", value: constraints.DATAFIM});
        }

        // Filtro STATUS
        if (constraints.STATUS) {
            query += "AND STATUS in  ("+constraints.STATUS+")";
        }

        var retorno = executaQuery(query, queryConstraints);

        return returnDataset("SUCCESS", "", JSON.stringify(retorno));

    } catch (error) {
        if (typeof error == "object") {
            var mensagem = "";
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem += (keys[i] + ": " + error[keys[i]]) + " - ";
            }
            log.info("Erro ao executar Dataset:");
            log.dir(error);
            log.info(mensagem);

            return returnDataset("ERRO", mensagem, null);
        } else {
            return returnDataset("ERRO", error, null);
        }
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

function executaQuery(query, constraints) {
    try {
        var dataSource = "/jdbc/CastilhoCustom";
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
                linha[rs.getMetaData().getColumnName(j)] = rs.getObject(rs.getMetaData().getColumnName(j)) + "";
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