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
        insereTransferencias(id);
        insereHistorico(id);
        hAPI.setCardValue("numProces", getValue("WKNumProces"));
        hAPI.setCardValue("solicitacao", getValue("WKNumProces"));

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
        insereHistorico(hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO"));

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
        insereHistorico(hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO"));

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

function insereTransferencias(ID_PAI) {
    var indices = hAPI.getChildrenIndexes("tableTransferencias");

    for (var i = 0; i < indices.length; i++) {
        var id = indices[i];

        var tipo = hAPI.getCardValue("motivoTransferencia" + "___" + id);
        var motivo = hAPI.getCardValue("textMotivoTransferencia" + "___" + id);
        var valor = moneyToFloat(hAPI.getCardValue("valorTotalTransferencia" + "___" + id));
        var itens = JSON.parse(hAPI.getCardValue("listItensTransferencia" + "___" + id));

        var query = "INSERT INTO TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA (ID_TRANSFERENCIA, TIPO, VALOR, JUSTIFICATIVA, TRANSFERE_CUSTO, TRANSFERE_RECEITA) VALUES (?,?,?,?,?,?)";

        var ID_TRANSFERENCIA = executaUpdate(query, [
            { type: "int", value: ID_PAI },
            { type: "varchar", value: tipo },
            { type: "varchar", value: valor },
            { type: "varchar", value: motivo },
            { type: "int", value: 1 },
            { type: "int", value: 0 },
        ]);

        for (var j = 0; j < itens.length; j++) {
            var item = itens[j];
            insereItem(ID_TRANSFERENCIA, item);
        }
    }  
}

function insereItem(ID_TRANSFERENCIA, item){
        var query =
            "INSERT INTO TRANSFERENCIAS_DE_CUSTO_ITENS (" +
            " ID_TRANSFERENCIA, " +
            " CODIGO_PRODUTO, " +
            " DESCRICAO_PRODUTO, " +
            " DESCRICAO, " +
            " QUANTIDADE, " +
            " VALOR_UNITARIO) " +
            " VALUES (?,?,?,?,?,?)";

        executaUpdate(query, [
            { type: "int", value: ID_TRANSFERENCIA },
            { type: "varchar", value: item.CODPRODUTO },
            { type: "varchar", value: item.DESCPRODUTO },
            { type: "varchar", value: item.DESCRICAO },
            { type: "float", value: moneyToFloat(item.QUANTIDADE)},
            { type: "float", value: moneyToFloat(item.VALOR_UNITARIO) }
        ]);
}

function insereHistorico(ID_PAI) {
    var usuario = hAPI.getCardValue("userCode");
    var observacao = hAPI.getCardValue("textObservacao");
    var atividadeAtual = hAPI.getCardValue("atividade");
    var data = getDateTimeNow();


    var movimentacao = "";
    var decisao = hAPI.getCardValue("decisao");
    var formMode = hAPI.getCardValue("formMode");
    if (formMode == "ADD") {
        movimentacao = "Inicio";
    }
    else if (atividadeAtual == ATIVIDADES.INICIO) {
        movimentacao = "Ajuste";
    }
    else if (decisao == "Aprovado") {
        movimentacao = "Aprovado";
    }
    else if (decisao == "Reprovado") {
        movimentacao = "Reprovado";
    } else {

    }

    var linha = new java.util.HashMap();
    linha.put("usuario", usuario);
    linha.put("movimentacao", movimentacao);
    linha.put("observacao", observacao);
    linha.put("dataMovimento", data);
    hAPI.addCardChild("tableHistorico", linha);

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
    if (val.indexOf("R$") > -1) {
        val = val.replace("R$", "");
        val = val.trim();
    }

    val = val.replace(".", "");
    val = val.replace(",", ".");
    val = parseFloat(val);
    if (isNaN(val)) {
        return 0;
    }
    return val;
}
function getDateTimeNow() {
    var date = new Date();
    var dia = date.getDate();
    if (dia < 10) {
        dia = "0" + dia;
    }
    var mes = date.getMonth() + 1;
    if (mes < 10) {
        mes = "0" + mes;
    }

    var ano = date.getFullYear();

    var hora = date.getHours();
    if (hora < 10) {
        hora = "0" + hora;
    }

    var minutos = date.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }

    var dateTime = [ano, mes, dia].join("-") + " " + hora + ":" + minutos;
    return dateTime
}