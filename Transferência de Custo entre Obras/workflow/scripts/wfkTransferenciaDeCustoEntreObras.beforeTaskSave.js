var ATIVIDADES = {
    INICIO_0: 0,
    INICIO: 4,
    DEFINE_APROVADOR_DESTINO: 9,
    APROVADOR_DESTINO: 8,
    APROVADOR_ORIGEM: 5,
    DEFINE_APROVADOR_ORIGEM: 10,
    LANCA_TRANSFENCIA: 26,
};

function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    var ATIVIDADE = getValue("WKNumState");

    if (ATIVIDADE == ATIVIDADES.INICIO || ATIVIDADE == ATIVIDADES.INICIO_0) {
        var id = insereNovoRegistro();
        hAPI.setCardValue("ID_TRANSFERENCIAS_DE_CUSTO", id);
        insereItens(id);
        insereHistorico(id);
        hAPI.setCardValue("numProces", getValue("WKNumProces"));
    } else if (ATIVIDADE == ATIVIDADES.APROVADOR_DESTINO) {
        var decisao = hAPI.getCardValue("decisao");
        var is_aprovado = decisao == "Aprovado";
        if (is_aprovado) {
            var aprovador = hAPI.getCardValue("usuarioAprovadorDestino");

            var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
            var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
            var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");


            var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
            var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
            var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");


            if (aprovador == engenheiroObraDestino) {
                // Se aprovador == engenheiro, marca o campo flag do engenheiro como true
                // E define o proximo aprovador
                hAPI.setCardValue("aprovadoEngenheiroObraDestino", "true");
                hAPI.setCardValue("usuarioAprovadorDestino", coordenadorObraDestino);

                // if (aprovador == engenheiroObraDestino) {
                //     // Se o aprovador for o Engenheiro também do destino marca como aprovado e define o próximo aprovador
                //     hAPI.setCardValue("aprovadoEngenheiroObraDestino", "true");
                //     hAPI.setCardValue("usuarioAprovadorDestino", coordenadorObraDestino);
                // }

            } else if (aprovador == coordenadorObraDestino) {
                hAPI.setCardValue("aprovadoCoordenadorObraDestino", "true");
                hAPI.setCardValue("usuarioAprovadorDestino", diretorObraDestino);

                if (coordenadorObraDestino == coordenadorObraOrigem) {
                    hAPI.setCardValue("aprovadoCoordenadorObraOrigem", "true");
                    hAPI.setCardValue("usuarioAprovadorOrigem", diretorObraOrigem);
                }


            } else if (aprovador == diretorObraDestino) {
                hAPI.setCardValue("aprovadoDiretorObraDestino", "true");
                hAPI.setCardValue("aprovadoObraDestino", "true");
                hAPI.setCardValue("usuarioAprovadorDestino", "");


                if (diretorObraOrigem == diretorObraDestino) {
                    hAPI.setCardValue("aprovadoDiretorObraOrigem", "true");
                    hAPI.setCardValue("aprovadoObraOrigem", "true");
                }

            } else {
                throw "Usuário não listado para Aprovações";
            }
        } else {
            hAPI.setCardValue("aprovadoObraOrigem", "Reprovado");
            hAPI.setCardValue("aprovadoObraDestino", "Reprovado");
        }







    } else if (ATIVIDADE == ATIVIDADES.APROVADOR_ORIGEM) {
        var decisao = hAPI.getCardValue("decisao");
        var is_aprovado = decisao == "Aprovado";
        if (is_aprovado) {
            var aprovador = hAPI.getCardValue("usuarioAprovadorOrigem");

            var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
            var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
            var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");


            var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
            var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
            var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");


            if (aprovador == engenheiroObraOrigem) {
                // Se aprovador == engenheiro, marca o campo flag do engenheiro como true
                // E define o proximo aprovador
                hAPI.setCardValue("aprovadoEngenheiroObraOrigem", "true");
                hAPI.setCardValue("usuarioAprovadorOrigem", coordenadorObraOrigem);

                // if (aprovador == engenheiroObraOrigem) {
                //     // Se o aprovador for o Engenheiro também do destino marca como aprovado e define o próximo aprovador
                //     hAPI.setCardValue("aprovadoEngenheiroObraOrigem", "true");
                //     hAPI.setCardValue("usuarioAprovadorOrigem", coordenadorObraOrigem);
                // }

            } else if (aprovador == coordenadorObraOrigem) {
                hAPI.setCardValue("aprovadoCoordenadorObraOrigem", "true");
                hAPI.setCardValue("usuarioAprovadorOrigem", diretorObraOrigem);

                if (coordenadorObraDestino == coordenadorObraOrigem) {
                    hAPI.setCardValue("aprovadoCoordenadorObraDestino", "true");
                    hAPI.setCardValue("usuarioAprovadorDestino", diretorObraDestino);
                }
            } else if (aprovador == diretorObraOrigem) {
                hAPI.setCardValue("aprovadoDiretorObraOrigem", "true");
                hAPI.setCardValue("aprovadoObraOrigem", "true");
                hAPI.setCardValue("usuarioAprovadorOrigem", "");

                if (diretorObraOrigem == diretorObraDestino) {
                    hAPI.setCardValue("aprovadoDiretorObraDestino", "true");
                    hAPI.setCardValue("aprovadoObraDestino", "true");
                }

            } else {
                throw "Usuário não listado para Aprovações";
            }
        } else {
            hAPI.setCardValue("aprovadoObraOrigem", "Reprovado");
            hAPI.setCardValue("aprovadoObraDestino", "Reprovado");
        }
    }
}


function insereNovoRegistro() {
    var numProces = getValue("WKNumProces");
    var CODCOLIGADA_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[0];
    var CCUSTO_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[1];
    var CODCOLIGADA_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[0];
    var CCUSTO_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[1];
    var SOLICITANTE = hAPI.getCardValue("solicitante");

    var VALOR = moneyToFloat(hAPI.getCardValue("valorObraDestino"));
    var OBSERVACAO = hAPI.getCardValue("textMotivoTransferencia");


    var DATA_COMPETENCIA = hAPI.getCardValue("dataCompetencia").split("/").reverse().join("-");


    var query =
        "INSERT INTO TRANSFERENCIAS_DE_CUSTO (" +
        "   ID_SOLICITACAO, " +
        "   CODCOLIGADA_ORIGEM, " +
        "   CCUSTO_ORIGEM, " +
        "   CODCOLIGADA_DESTINO, " +
        "   CCUSTO_DESTINO, " +
        "   SOLICITANTE, " +
        "   VALOR, " +
        "   OBSERVACAO, " +
        "   DATA_SOLICITACAO, " +
        "   DATA_COMPETENCIA, " +
        "   STATUS)" +
        " VALUES " +
        "(?,?,?,?,?,?,?,?,SYSDATETIME(),?,?)";

    return executaUpdate(query, [
        { type: "int", value: numProces },
        { type: "int", value: CODCOLIGADA_ORIGEM },
        { type: "varchar", value: CCUSTO_ORIGEM },
        { type: "int", value: CODCOLIGADA_DESTINO },
        { type: "varchar", value: CCUSTO_DESTINO },
        { type: "varchar", value: SOLICITANTE },
        { type: "float", value: VALOR },
        { type: "varchar", value: OBSERVACAO },
        { type: "date", value: DATA_COMPETENCIA },
        { type: "int", value: "1" },
    ]);
}

function insereItens(ID_PAI) {
    var indices = hAPI.getChildrenIndexes("tableItens");

    for (var i = 0; i < indices.length; i++) {
        var id = indices[i];

        var Produto = hAPI.getCardValue("itemProduto" + "___" + id).split(" - ")[0];
        var Descricao = hAPI.getCardValue("itemDescricao" + "___" + id);
        var Quantidade = hAPI.getCardValue("itemQuantidade" + "___" + id).split(".").join("").replace(",", ".");
        var ValorUnitario = moneyToFloat(hAPI.getCardValue("itemValorUnit" + "___" + id));

        var query =
            "INSERT INTO TRANSFERENCIAS_DE_CUSTO_ITENS (" +
            " ID_TRANSFERENCIA, " +
            " PRODUTO, " +
            " DESCRICAO, " +
            " QUANTIDADE, " +
            " VALOR_UNITARIO) " +
            " VALUES (?,?,?,?,?)";

        executaUpdate(query, [
            { type: "int", value: ID_PAI },
            { type: "varchar", value: Produto },
            { type: "varchar", value: Descricao },
            { type: "float", value: Quantidade },
            { type: "float", value: ValorUnitario }
        ]);
    }
}

function insereHistorico(ID_PAI) {
    var indices = hAPI.getChildrenIndexes("tableItens");
    var ultimoHistorico = indices[indices.length - 1];

    var data = hAPI.getCardValue("dataMovimento" + "___" + ultimoHistorico);
    var usuario = hAPI.getCardValue("usuario" + "___" + ultimoHistorico);
    var movimentacao = hAPI.getCardValue("movimentacao" + "___" + ultimoHistorico);
    var observacao = hAPI.getCardValue("observacao" + "___" + ultimoHistorico);

    var query =
        "INSERT INTO TRANSFERENCIAS_DE_CUSTO_HISTORICO (" +
        "   ID_TRANSFERENCIA, " +
        "   USUARIO, " +
        "   DATA_HISTORICO, " +
        "   OBSERVACAO, " +
        "   DECISAO) " +
        " VALUES " +
        "  (?,?,?,?,?)";

    executaUpdate(query, [
        { type: "int", value: ID_PAI },
        { type: "varchar", value: usuario },
        { type: "varchar", value: data },
        { type: "varchar", value: observacao },
        { type: "varchar", value: movimentacao },
    ]);
}



function executaUpdate(query, constraints) {
    var dataSource = "/jdbc/CastilhoCustom";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);

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

        var rows = stmt.executeUpdate();
        log.info("rows");
        log.dir(rows);

        var rs = stmt.getGeneratedKeys();
        if (rs.next()) {
            var id = parseInt(rs.getInt(1));
            log.info("id");
            log.dir(id);
            return id;
        }

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



// Utils
function moneyToFloat(val) {
    log.info("moneyToFloat init");
    log.info(val);
    if (val.indexOf("R$") > -1) {
        val = val.replace("R$", "");
        val = val.trim();
        log.info("Replace");
        log.info(val);
    }

    val = val.replace(".", "");

    log.info(val);
    val = val.replace(",", ".");
    log.info(val);
    val = parseFloat(val);
    log.info(val);
    if (isNaN(val)) {
        log.info("NAN");
        return 0;
    }
    return val;
}