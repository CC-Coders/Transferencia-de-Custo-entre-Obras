function servicetask10(attempt, message) {
    var aprovador = verificaAprovadoresObraOrigem();
    return aprovador;
}



function verificaAprovadoresObraOrigem() {
    var valorTotalTransferencia = hAPI.getCardValue("valorTotal");

    var aprovadoEngenheiroObraOrigem = hAPI.getCardValue("aprovadoEngenheiroObraOrigem");
    var aprovadoCoordenadorObraOrigem = hAPI.getCardValue("aprovadoCoordenadorObraOrigem");
    var aprovadoDiretorObraOrigem = hAPI.getCardValue("aprovadoDiretorObraOrigem");

    if (aprovadoEngenheiroObraOrigem != "true") {
        var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
        hAPI.setCardValue("usuarioAprovadorOrigem", engenheiroObraOrigem);
    }
    else if (aprovadoCoordenadorObraOrigem != "true") {
        var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
        hAPI.setCardValue("usuarioAprovadorOrigem", coordenadorObraOrigem);
    }
    else if (valorTotalTransferencia > 250000 && aprovadoDiretorObraOrigem != "true") {
        var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");
        hAPI.setCardValue("usuarioAprovadorOrigem", diretorObraOrigem);
    } 
    else {
        hAPI.setCardValue("aprovadoObraOrigem", "true");
        hAPI.setCardValue("usuarioAprovadorOrigem", "");
    }

    return hAPI.getCardValue("usuarioAprovadorOrigem");
}