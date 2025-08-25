function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["TIPO_TRANSFERENCIA"]);


        if (constraints.TIPO_TRANSFERENCIA == "Equipamento") {
            var query = "";
            query += "SELECT TOP 1 WITH TIES ";
            query += "    CODIGOPRD+' - '+NOMEFANTASIA as VISUAL, ";
            query += "    CASE  ";
            query += "        WHEN CHARINDEX(' - ', NOMEFANTASIA) > 0  ";
            query += "        THEN LEFT(NOMEFANTASIA, CHARINDEX(' - ', NOMEFANTASIA) - 1) ";
            query += "        ELSE NOMEFANTASIA ";
            query += "    END AS Prefixo ";
            query += "FROM TPRODUTO ";
            query += "WHERE CODIGOPRD like '10.003%' AND CODCOLPRD = 1 ";
            query += "ORDER BY ROW_NUMBER() OVER ( ";
            query += "    PARTITION BY  ";
            query += "        CASE  ";
            query += "            WHEN CHARINDEX(' - ', NOMEFANTASIA) > 0  ";
            query += "            THEN LEFT(NOMEFANTASIA, CHARINDEX(' - ', NOMEFANTASIA) - 1) ";
            query += "            ELSE NOMEFANTASIA ";
            query += "        END ";
            query += "    ORDER BY    CODIGOPRD+' - '+NOMEFANTASIA ";
            query += ") ";

            
            var retorno = executaQuery(query,[],"/jdbc/FluigRM");
            return returnDataset("SUCCESS","",JSON.stringify(retorno));
        }
        if (constraints.TIPO_TRANSFERENCIA == "Prestação de Serviço") {
            var query = "SELECT CODIGOPRD + ' - ' + NOMEFANTASIA AS VISUAL  ";
            query += " FROM TPRODUTO "
            query += "WHERE  ";
            query += "(NOMEFANTASIA like 'Serviço%' OR CODIGOPRD = '21.001.00002' )";
            query += "AND TPRODUTO.INATIVO = 0 ";
            query += "AND TPRODUTO.ULTIMONIVEL = 1 ";
            query += "AND TPRODUTO.CODCOLPRD = 1 ";
            query += "AND TPRODUTO.CAMPOLIVRE2 = 'S' ";
            var retorno = executaQuery(query, [], "/jdbc/FluigRM");
            return returnDataset("SUCCESS", "", JSON.stringify(retorno));
        }
        if (constraints.TIPO_TRANSFERENCIA == "Mão de Obra") {
            var Produtos = [
                {"VISUAL":"11.006.00098 - Mão de Obra",}
            ]
            return returnDataset("SUCCESS","",JSON.stringify(Produtos));
        }
        if (constraints.TIPO_TRANSFERENCIA == "Insumos") {
            var ds = DatasetFactory.getDataset("BuscaProdutosRM", null, [
                DatasetFactory.createConstraint("CODCOLIGADA", "1", "1", ConstraintType.MUST),
                DatasetFactory.createConstraint("TipoProduto", "OC/OS", "OC/OS", ConstraintType.MUST)
            ], null);

            var Produtos = ds;
            return Produtos;
        }
        if (constraints.TIPO_TRANSFERENCIA == "Receita") {
            var Produtos = [
                {"VISUAL": "11.999.00001 - Receita de Obras"}            
            ];
            return returnDataset("SUCCESS","",JSON.stringify(Produtos));
        }


        return returnDataset("ERROR","Tipo de Transferência inválido para a Consulta de Produtos");

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