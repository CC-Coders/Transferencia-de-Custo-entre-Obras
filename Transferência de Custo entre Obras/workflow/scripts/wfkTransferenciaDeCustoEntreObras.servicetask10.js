function servicetask10(attempt, message) {
    var aprovador = verificaAprovadoresObraOrigem();
    return aprovador;
}



function verificaAprovadoresObraOrigem(){
    var valorTotalTransferencia = hAPI.getCardValue("valorTotalTransferencia");

    var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
    var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
    var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");


    var aprovadoEngenheiroObraOrigem = hAPI.getCardValue("aprovadoEngenheiroObraOrigem");
    var aprovadoCoordenadorObraOrigem = hAPI.getCardValue("aprovadoCoordenadorObraOrigem");
    var aprovadoDiretorObraOrigem = hAPI.getCardValue("aprovadoDiretorObraOrigem");

    if (aprovadoEngenheiroObraOrigem != "true") {
        hAPI.setCardValue("usuarioAprovadorOrigem", engenheiroObraOrigem);
    }
    else if (aprovadoCoordenadorObraOrigem != "true") {
        hAPI.setCardValue("usuarioAprovadorOrigem", coordenadorObraOrigem);
    }
    else if (valorTotalTransferencia > 2000000 && aprovadoDiretorObraOrigem != "true") {
        hAPI.setCardValue("usuarioAprovadorOrigem", diretorObraOrigem);
    }else{
        hAPI.setCardValue("aprovadoObraOrigem", "true");
    }

    return   hAPI.getCardValue("usuarioAprovadorOrigem");
}