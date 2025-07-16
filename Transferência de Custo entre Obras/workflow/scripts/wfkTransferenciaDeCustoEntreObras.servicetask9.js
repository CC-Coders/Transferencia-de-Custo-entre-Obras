function servicetask9(attempt, message) {
    var aprovador = verificaAprovadoresObraDestino();
    return aprovador;
}

function verificaAprovadoresObraDestino(){
    var valorTotalTransferencia = hAPI.getCardValue("valorTotal");

    var aprovadoEngenheiroObraDestino = hAPI.getCardValue("aprovadoEngenheiroObraDestino");
    var aprovadoCoordenadorObraDestino = hAPI.getCardValue("aprovadoCoordenadorObraDestino");
    var aprovadoDiretorObraDestino = hAPI.getCardValue("aprovadoDiretorObraDestino");

    var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
    var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
    var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");

    if (aprovadoEngenheiroObraDestino != "true" && engenheiroObraDestino != hAPI.getCardValue("engenheiroObraOrigem")) {
        hAPI.setCardValue("usuarioAprovadorDestino", engenheiroObraDestino);
    }
    else if (aprovadoCoordenadorObraDestino != "true" && coordenadorObraDestino != hAPI.getCardValue("coordenadorObraOrigem")) {
        hAPI.setCardValue("usuarioAprovadorDestino", coordenadorObraDestino);
    }
    else if (valorTotalTransferencia > 250000 && diretorObraDestino != "true" && diretorObraDestino != hAPI.getCardValue("diretorObraOrigem")) {
        hAPI.setCardValue("usuarioAprovadorDestino", diretorObraDestino);
    }
    else{
        hAPI.setCardValue("aprovadoObraDestino", "true");
        hAPI.setCardValue("usuarioAprovadorDestino", "");
    }

    return hAPI.getCardValue("usuarioAprovadorDestino");
}