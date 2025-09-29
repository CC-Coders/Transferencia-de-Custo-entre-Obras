var ATIVIDADES = {
    INICIO_0: 0,
    INICIO: 4,
    DEFINE_APROVADOR_DESTINO: 9,
    APROVADOR_DESTINO: 8,
    APROVADOR_ORIGEM: 5,
    DEFINE_APROVADOR_ORIGEM: 10,
    LANCA_TRANSFENCIA: 26,
    CONTROLADORIA: 73,
    FIM: 28,
};

var STATUS_TRANSFENCIA = {
    "EM_APROVACAO": 1,
    "APROVADO": 2,
    "CANCELADO": 3,
    "EXCLUIDO": 4,
}

function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    var ATIVIDADE = getValue("WKNumState");
    var formMode = hAPI.getCardValue("formMode");

    if (ATIVIDADE == ATIVIDADES.INICIO && formMode == "ADD") {
        // Se for Inicio da Solicitação

        // Insere nova Linha na tabela de Transferencias
        var id = insereNovoRegistro();

        // Salva o ID da Transferencia no campo ID_TRANSFERENCIAS_DE_CUSTO
        hAPI.setCardValue("ID_TRANSFERENCIAS_DE_CUSTO", id);

        // Insere as Transferencias, Itens e Historico com o ID da Transferencia como Chave Estrangeira
        insereTransferencias(id);
        insereHistorico(id);

        // Salva Número da Solicitação no Processo
        hAPI.setCardValue("numProces", getValue("WKNumProces"));
        hAPI.setCardValue("solicitacao", getValue("WKNumProces"));
    }
    else if (ATIVIDADE == ATIVIDADES.INICIO) {
        // Se for Atividade Inico mas o Processo já está criado
        // Atualiza os Dados da Transferencia nas Tabelas
        atualizaTransferencia();
    }
    else if (ATIVIDADE == ATIVIDADES.APROVADOR_DESTINO || ATIVIDADE == ATIVIDADES.APROVADOR_ORIGEM) {
        var decisao = hAPI.getCardValue("decisao");

        // Se Aprovado verifica aprovadores em Comum entre as Obras e realiza a Aprovação Cruzada
        if (decisao == "Aprovado") {
            if (ATIVIDADE == ATIVIDADES.APROVADOR_DESTINO) {
                verificaSeAprovadorTambemAprovaObraOrigem();
            }
            else if (ATIVIDADE == ATIVIDADES.APROVADOR_ORIGEM) {
                verificaSeAprovadorTambemAprovaObraDestino();
            }
        }

        // Se reprovado marca a Reprovacao nas Duas Obras para Retornar ao Inicio
        if (decisao == "Reprovado") {
            hAPI.setCardValue("aprovadoObraOrigem", "Reprovado");
            hAPI.setCardValue("aprovadoObraDestino", "Reprovado");
            notificaReprovacaoPorWhatsApp();
        }

        // Se NÂO Reprovado Automaticamente, insere o Historio na Tabela
        // Caso seja Reprovado Automaticamente significa que a Atividade só foi enviada para Frente automaticamente, sem ação do usuário
        if (decisao != "Reprovado Automaticamente") {
            insereHistorico(hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO"));
        }
    }
}


// Verifica Aprovadores em comum entre Obra Origem e Destino
function verificaSeAprovadorTambemAprovaObraDestino() {
    var aprovador = hAPI.getCardValue("usuarioAprovadorOrigem");

    var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
    var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
    var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");

    // Verifica se o Usuario Aprovador, tambem é aprovador na Obra Destino
    // Se sim, aprova tambem na outra obra
    if (aprovador == engenheiroObraDestino) {
        hAPI.setCardValue("aprovadoEngenheiroObraDestino", "true");
    }
    if (aprovador == coordenadorObraDestino) {
        hAPI.setCardValue("aprovadoCoordenadorObraDestino", "true");
    }
    if (aprovador == diretorObraDestino) {
        hAPI.setCardValue("aprovadoDiretorObraDestino", "true");
    }
}
function verificaSeAprovadorTambemAprovaObraOrigem() {
    var aprovador = hAPI.getCardValue("usuarioAprovadorDestino");

    var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
    var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
    var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");


    if (aprovador == engenheiroObraOrigem) {
        // Se o aprovador for o Engenheiro também do destino marca como aprovado
        hAPI.setCardValue("aprovadoEngenheiroObraOrigem", "true");
    }
    if (aprovador == coordenadorObraOrigem) {
        hAPI.setCardValue("aprovadoCoordenadorObraOrigem", "true");
    }
    if (aprovador == diretorObraOrigem) {
        hAPI.setCardValue("aprovadoDiretorObraOrigem", "true");
        hAPI.setCardValue("aprovadoObraOrigem", "true");
    }
}


// Operações Tabelas de Transferencias Castilho_Custom
function insereNovoRegistro() {
    var numProces = getValue("WKNumProces");
    var CODCOLIGADA_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[0];
    var CCUSTO_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[1];
    var CODDEPTO_ORIGEM = hAPI.getCardValue("departamentoObraOrigem").split(" - ")[0];
    if (CODDEPTO_ORIGEM == "") {
        CODDEPTO_ORIGEM = "1.3.01";
    }

    var CODCOLIGADA_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[0];
    var CCUSTO_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[1];
    var CODDEPTO_DESTINO = hAPI.getCardValue("departamentoObraDestino").split(" - ")[0];
    if (CODDEPTO_DESTINO == "") {
        CODDEPTO_DESTINO = "1.3.01";
    }
    
    var SOLICITANTE = hAPI.getCardValue("solicitante");
    var VALOR = moneyToFloat(hAPI.getCardValue("valorObraDestino"));

    var query =
        "INSERT INTO TRANSFERENCIAS_DE_CUSTO (" +
        "   ID_SOLICITACAO, " +//1
        "   CODCOLIGADA_ORIGEM, " +//2
        "   CCUSTO_ORIGEM, " +//3
        "   DEPARTAMENTO_ORIGEM, " +//4
        "   CODCOLIGADA_DESTINO, " +//5
        "   CCUSTO_DESTINO, " +//6
        "   DEPARTAMENTO_DESTINO, " +//7
        "   SOLICITANTE, " +//8
        "   VALOR, " +//9
        "   DATA_SOLICITACAO, " +
        "   STATUS)" +//10
        " OUTPUT Inserted.ID "+
        " VALUES " +
        "(?,?,?,?,?,?,?,?,?,SYSDATETIME(),?)";

    return executeInsert(query, [
        { type: "int", value: numProces }, // 1
        { type: "int", value: CODCOLIGADA_ORIGEM }, // 2
        { type: "varchar", value: CCUSTO_ORIGEM }, // 3
        { type: "varchar", value: CODDEPTO_ORIGEM }, // 4
        { type: "int", value: CODCOLIGADA_DESTINO }, // 5
        { type: "varchar", value: CCUSTO_DESTINO }, // 6
        { type: "varchar", value: CODDEPTO_DESTINO }, // 7
        { type: "varchar", value: SOLICITANTE }, // 8
        { type: "float", value: VALOR }, // 9
        { type: "int", value: STATUS_TRANSFENCIA.EM_APROVACAO }, // 10
    ]);
}
function atualizaTransferencia() {
    var id = hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO");

    var CODCOLIGADA_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[0];
    var CCUSTO_ORIGEM = hAPI.getCardValue("ccustoObraOrigem").split(" - ")[1];
    var CODCOLIGADA_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[0];
    var CCUSTO_DESTINO = hAPI.getCardValue("ccustoObraDestino").split(" - ")[1];

    var VALOR = moneyToFloat(hAPI.getCardValue("valorObraDestino"));

    var query = "UPDATE TRANSFERENCIAS_DE_CUSTO SET ";
    query += " CODCOLIGADA_ORIGEM = ?,";
    query += " CCUSTO_ORIGEM = ?,";
    query += " CODCOLIGADA_DESTINO = ?,";
    query += " CCUSTO_DESTINO = ?,";
    query += " VALOR = ? ";
    query += " WHERE ID = ?";

    executeUpdate(query, [
        { type: "int", value: CODCOLIGADA_ORIGEM },
        { type: "varchar", value: CCUSTO_ORIGEM },
        { type: "int", value: CODCOLIGADA_DESTINO },
        { type: "varchar", value: CCUSTO_DESTINO },
        { type: "float", value: VALOR },
        { type: "int", value: id },
    ]);


    var query = "DELETE FROM TRANSFERENCIAS_DE_CUSTO_ITENS WHERE ID_TRANSFERENCIA IN (SELECT ID FROM TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA WHERE ID_TRANSFERENCIA = ?)";
    executeUpdate(query, [{ type: "int", value: id }]);

    var query = "DELETE FROM TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA WHERE ID_TRANSFERENCIA = ?";
    executeUpdate(query, [{ type: "int", value: id }]);

    insereTransferencias(id);
    insereHistorico(id);
}
function insereTransferencias(ID_PAI) {
    var indices = hAPI.getChildrenIndexes("tableTransferencias");

    for (var i = 0; i < indices.length; i++) {
        var id = indices[i];

        var tipo = hAPI.getCardValue("motivoTransferencia" + "___" + id);
        var motivo = hAPI.getCardValue("textMotivoTransferencia" + "___" + id);
        var valor = moneyToFloat(hAPI.getCardValue("valorTotalTransferencia" + "___" + id));
        var itens = JSON.parse(hAPI.getCardValue("listItensTransferencia" + "___" + id));

        var TRANSFERE_CUSTO = hAPI.getCardValue("TRANSFERE_CUSTO") == "true" ? 1 : 0;
        var TRANSFERE_RECEITA = hAPI.getCardValue("TRANSFERE_RECEITA") == "true" ? 1 : 0;

        var query = "INSERT INTO TRANSFERENCIAS_DE_CUSTO_TRANSFERENCIA (ID_TRANSFERENCIA, TIPO, VALOR, JUSTIFICATIVA, TRANSFERE_CUSTO, TRANSFERE_RECEITA) OUTPUT Inserted.ID  VALUES (?,?,?,?,?,?)";

        var ID_TRANSFERENCIA = executeInsert(query, [
            { type: "int", value: ID_PAI },
            { type: "varchar", value: tipo },
            { type: "varchar", value: valor },
            { type: "varchar", value: motivo },
            { type: "int", value: TRANSFERE_CUSTO },
            { type: "int", value: TRANSFERE_RECEITA },
        ]);

        for (var j = 0; j < itens.length; j++) {
            var item = itens[j];
            insereItem(ID_TRANSFERENCIA, item);
        }
    }
}
function insereItem(ID_TRANSFERENCIA, item) {
    var query =
        "INSERT INTO TRANSFERENCIAS_DE_CUSTO_ITENS (" +
        " ID_TRANSFERENCIA, " +
        " CODIGO_PRODUTO, " +
        " DESCRICAO_PRODUTO, " +
        " DESCRICAO, " +
        " QUANTIDADE, " +
        " UNIDADE, " +
        " VALOR_UNITARIO) " +
        " VALUES (?,?,?,?,?,?,?)";

    executeInsert(query, [
        { type: "int", value: ID_TRANSFERENCIA },
        { type: "varchar", value: item.CODPRODUTO },
        { type: "varchar", value: item.DESCPRODUTO },
        { type: "varchar", value: item.DESCRICAO },
        { type: "float", value: moneyToFloat(item.QUANTIDADE) },
        { type: "varchar", value: item.UN },
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

    executeInsert(query, [
        { type: "int", value: ID_PAI },
        { type: "varchar", value: usuario },
        { type: "varchar", value: data },
        { type: "varchar", value: observacao },
        { type: "varchar", value: movimentacao },
    ]);
}



//Notifica
function notificaReprovacaoPorWhatsApp() {
    var mensagem = "";
    mensagem += "Sua Solicitação de *Transferência de Custo* foi *Reprovada*!";
    mensagem += "\n\n";
    mensagem += "*Obra Origem*\n";
    mensagem += hAPI.getCardValue("ccustoObraOrigem");
    mensagem += "\n\n";
    mensagem += "*Obra Destino*\n";
    mensagem += hAPI.getCardValue("ccustoObraDestino");
    mensagem += "\n\n";
    mensagem += "*Valor*: " + hAPI.getCardValue("valorObraOrigem") + "\n";
    mensagem += "\n\n";

    mensagem += "*Aprovador*: " + hAPI.getCardValue("userCode") + "\n";
    mensagem += "*Justificativa*: " + hAPI.getCardValue("textObservacao") + "\n";

    mensagem += "\n";
    mensagem += "Acesse o Fluig para mais informações.";
    sendNotifiWhatsApp(mensagem, hAPI.getCardValue("solicitante"));
}
function sendNotifiWhatsApp(mensagem, user){
    var ds = DatasetFactory.getDataset("dsEnviaMensagemWhatsApp", null,[
        DatasetFactory.createConstraint("message", mensagem, mensagem, ConstraintType.MUST),
        DatasetFactory.createConstraint("user",user, user, ConstraintType.MUST),
    ],null);

    // if (ds.getValue(0,"STATUS") != "success") {
    //     log.error("whatsApp API: " + ds.getValue(0,"MENSAGEM"));
    // }
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
function getDateNow() {
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


    var dateTime = [ano, mes, dia].join("-");
    return dateTime
}
function executeInsert(query, constraints) {
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

        log.info("wfkTransferenciaDeCustoEntreObras.beforeTaskSave: executandoQuery"+query.length)

       var hasResultSet = stmt.execute();
        if (hasResultSet) {
            var rs = stmt.getResultSet();
            if (rs.next()) {
                var id = rs.getInt(1);
                log.info("id");
                log.dir(id);
                return id;
            }
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
function executeUpdate(query, constraints) {
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
function FormataValorParaMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}