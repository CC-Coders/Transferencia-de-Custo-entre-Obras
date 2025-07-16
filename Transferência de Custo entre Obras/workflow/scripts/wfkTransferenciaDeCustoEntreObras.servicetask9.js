function servicetask9(attempt, message) {
    var aprovador = verificaAprovadoresObraDestino();
    return aprovador;
}

function verificaAprovadoresObraDestino(){
    var valorTotalTransferencia = hAPI.getCardValue("valorTotal");

    var aprovadoEngenheiroObraDestino = hAPI.getCardValue("aprovadoEngenheiroObraDestino");
    var aprovadoCoordenadorObraDestino = hAPI.getCardValue("aprovadoCoordenadorObraDestino");
    var aprovadoDiretorObraDestino = hAPI.getCardValue("aprovadoDiretorObraDestino");

    if (aprovadoEngenheiroObraDestino != "true") {
        var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
        hAPI.setCardValue("usuarioAprovadorDestino", engenheiroObraDestino);
    }
    else if (aprovadoCoordenadorObraDestino != "true") {
        var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
        hAPI.setCardValue("usuarioAprovadorDestino", coordenadorObraDestino);
    }
    else if (valorTotalTransferencia > 250000 && aprovadoDiretorObraDestino != "true") {
        var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");
        hAPI.setCardValue("usuarioAprovadorDestino", diretorObraDestino);
    }
    else{
        hAPI.setCardValue("aprovadoObraDestino", "true");
        hAPI.setCardValue("usuarioAprovadorDestino", "");
    }

    return hAPI.getCardValue("usuarioAprovadorDestino");
}