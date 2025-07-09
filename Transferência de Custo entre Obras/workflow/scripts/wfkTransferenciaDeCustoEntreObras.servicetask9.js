function servicetask9(attempt, message) {
    var aprovador = verificaAprovadoresObraDestino();
    return aprovador;
}

function verificaAprovadoresObraDestino(){
    var valorTotalTransferencia = hAPI.getCardValue("valorTotalTransferencia");

    var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
    var coordenadorObraDestino = hAPI.getCardValue("coordenadorObraDestino");
    var diretorObraDestino = hAPI.getCardValue("diretorObraDestino");


    var aprovadoEngenheiroObraDestino = hAPI.getCardValue("aprovadoEngenheiroObraDestino");
    var aprovadoCoordenadorObraDestino = hAPI.getCardValue("aprovadoCoordenadorObraDestino");
    var aprovadoDiretorObraDestino = hAPI.getCardValue("aprovadoDiretorObraDestino");

    if (aprovadoEngenheiroObraDestino != "true") {
        hAPI.setCardValue("usuarioAprovadorDestino", engenheiroObraDestino);
    }
    else if (aprovadoCoordenadorObraDestino != "true") {
        hAPI.setCardValue("usuarioAprovadorDestino", coordenadorObraDestino);
    }
    else if (valorTotalTransferencia > 2000000 && aprovadoDiretorObraDestino != "true") {
        hAPI.setCardValue("usuarioAprovadorDestino", diretorObraDestino);
    }else{
        hAPI.setCardValue("aprovadoObraDestino", "true");
    }

    return hAPI.getCardValue("usuarioAprovadorDestino");
}