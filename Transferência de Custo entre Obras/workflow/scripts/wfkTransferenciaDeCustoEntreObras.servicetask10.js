function servicetask10(attempt, message) {
    verificaAprovadoresObraOrigem();
}



function verificaAprovadoresObraOrigem(){
    var valorTotalTransferencia = hAPI.getCardValue("valorTotalTransferencia");

    var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
    var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
    var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");


    var aprovadoEngenheiroObraOrigem = hAPI.getCardValue("aprovadoEngenheiroObraOrigem");
    var aprovadoCoordenadorObraOrigem = hAPI.getCardValue("aprovadoCoordenadorObraOrigem");
    var aprovadoDiretorObraOrigem = hAPI.getCardValue("aprovadoDiretorObraOrigem");

    if (aprovadoEngenheiroObraOrigem != "Sim") {
        hAPI.setCardValue("usuarioAprovadorOrigem", engenheiroObraOrigem);
    }
    else if (aprovadoCoordenadorObraOrigem != "Sim") {
        hAPI.setCardValue("usuarioAprovadorOrigem", coordenadorObraOrigem);
    }
    else if (valorTotalTransferencia > 2000000 && aprovadoDiretorObraOrigem != "Sim") {
        hAPI.setCardValue("usuarioAprovadorOrigem", diretorObraOrigem);
    }else{
        hAPI.setCardValue("aprovadoObraOrigem", "Sim");
    }
}