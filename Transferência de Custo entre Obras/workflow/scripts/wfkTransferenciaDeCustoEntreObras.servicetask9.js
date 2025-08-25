// Define Aprovador Obra Destino
function servicetask9(attempt, message) {
    var decisao = hAPI.getCardValue("decisao");
    if (decisao=="") {
        // Se Decisao == "", significar que o Processo foi iniciado e Define o Primeiro Aprovador
        defineProximoAprovador();
        hAPI.setCardValue("decisaoAprovadorObraDestino", "Aprovação");
        if (hAPI.getCardValue("usuarioAprovadorDestino") == "") {
            hAPI.setCardValue("usuarioAprovadorDestino", "gabriel.persike");
        }
        return true;
    }

    if (decisao == "Aprovado") {
        marcaAprovacaoDoAprovador();
        var aprovadoTotalmente = verificaSeTotalmenteAprovado();
        if (aprovadoTotalmente) {
            hAPI.setCardValue("decisaoAprovadorObraDestino", "Aprovado");
            return true;
        }
        else{
            defineProximoAprovador();
            hAPI.setCardValue("decisaoAprovadorObraDestino", "Aprovação");
            return true;
        }
    }

    if (decisao == "Reprovado" || decisao == "Reprovado Automaticamente") {
        hAPI.setCardValue("decisaoAprovadorObraDestino", "Reprovado");
        return true;
    }
}

function defineProximoAprovador(){
    var valorTotalTransferencia = parseFloat(hAPI.getCardValue("valorTotal"));

    // Verifica quais níveis já aprovaram
    var isAprovadoPeloEngenheiro = hAPI.getCardValue("aprovadoEngenheiroObraDestino") == "true";
    var isAprovadoCoordenador = hAPI.getCardValue("aprovadoCoordenadorObraDestino") == "true";
    var isAprovadoDiretor = hAPI.getCardValue("aprovadoDiretorObraDestino") == "true";

    // Verifica casos que o nível de Aprovação é o mesmo na Origem e Destino
    var mesmoEngenheiroOrigemDestino = hAPI.getCardValue("engenheiroObraDestino") == hAPI.getCardValue("engenheiroObraOrigem");
    var mesmoCoordenadorOrigemDestino = hAPI.getCardValue("coordenadorObraDestino") == hAPI.getCardValue("coordenadorObraOrigem");
    var mesmoDiretorOrigemDestino = hAPI.getCardValue("diretorObraDestino") == hAPI.getCardValue("diretorObraOrigem");


    // Caso o Aprovador também Aprova na Obra Origem, não defini ele como Aprovador na Destino para não ocorrer aprovações Duplicadas
    if (!isAprovadoPeloEngenheiro && !mesmoEngenheiroOrigemDestino) {
        hAPI.setCardValue("usuarioAprovadorDestino", hAPI.getCardValue("engenheiroObraDestino"));
        return;
    }
    if (!isAprovadoCoordenador && !mesmoCoordenadorOrigemDestino) {
        hAPI.setCardValue("usuarioAprovadorDestino", hAPI.getCardValue("coordenadorObraDestino"));
        return;
    }
    if (valorTotalTransferencia > 250000 && !isAprovadoDiretor && !mesmoDiretorOrigemDestino) {
        hAPI.setCardValue("usuarioAprovadorDestino", hAPI.getCardValue("diretorObraDestino"));
        return;
    }
}
function marcaAprovacaoDoAprovador() {
    var aprovador = hAPI.getCardValue("usuarioAprovadorDestino");

    var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
    var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
    var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");

    if (aprovador == engenheiroObraDestino) {
        hAPI.setCardValue("aprovadoEngenheiroObraDestino","true");
    }
    if (aprovador == coordenadorObraDestino) {
        hAPI.setCardValue("aprovadoCoordenadorObraDestino","true");
    }
    if (aprovador == diretorObraDestino) {
        hAPI.setCardValue("aprovadoDiretorObraDestino","true");
    }
}
function verificaSeTotalmenteAprovado(){
    var valorTotalTransferencia = parseFloat(hAPI.getCardValue("valorTotal"));

    // Verifica casos que o nível de Aprovação é o mesmo na Origem e Destino
    var mesmoEngenheiroOrigemDestino = hAPI.getCardValue("engenheiroObraDestino") == hAPI.getCardValue("engenheiroObraOrigem");
    var mesmoCoordenadorOrigemDestino = hAPI.getCardValue("coordenadorObraDestino") == hAPI.getCardValue("coordenadorObraOrigem");
    var mesmoDiretorOrigemDestino = hAPI.getCardValue("diretorObraDestino") == hAPI.getCardValue("diretorObraOrigem");

    var isAprovadoEngenheiro = hAPI.getCardValue("aprovadoEngenheiroObraDestino") == "true";
    var isAprovadoCoordenador = hAPI.getCardValue("aprovadoCoordenadorObraDestino") == "true";
    var isAprovadoDiretor = hAPI.getCardValue("aprovadoDiretorObraDestino") == "true";

    log.info("verificaSeTotalmenteAprovado: Init");
    log.info("verificaSeTotalmenteAprovado: " + hAPI.getCardValue("aprovadoEngenheiroObraDestino"));
    log.info("verificaSeTotalmenteAprovado: " + isAprovadoEngenheiro);

    if ((isAprovadoEngenheiro || mesmoEngenheiroOrigemDestino) && (isAprovadoCoordenador || mesmoCoordenadorOrigemDestino)) {
        log.info("verificaSeTotalmenteAprovado: enge e coord aprovado");
        if ((isAprovadoDiretor || mesmoDiretorOrigemDestino) || valorTotalTransferencia < 250000) {
            log.info("verificaSeTotalmenteAprovado: dir aprovado");
            return true;
        }
    }

    return false;
}