// Define Aprovador Obra Origem
function servicetask10(attempt, message) {
    var decisao = hAPI.getCardValue("decisao");
    if (decisao=="") {
        // Se Decisao == "", significar que o Processo foi iniciado e Define o Primeiro Aprovador
        defineProximoAprovador();
        hAPI.setCardValue("decisaoAprovadorObraOrigem", "Aprovação");
        return true;
    }

    if (decisao == "Aprovado") {
        marcaAprovacaoDoAprovador();
        verificaSeAprovadorTambemAprovaPelaDestino();

        var aprovadoTotalmente = verificaSeTotalmenteAprovado();
        if (aprovadoTotalmente) {
            hAPI.setCardValue("decisaoAprovadorObraOrigem", "Aprovado");
            return true;
        }
        else{
            defineProximoAprovador();
            hAPI.setCardValue("decisaoAprovadorObraOrigem", "Aprovação");
            return true;
        }
    }

    if (decisao == "Reprovado" || decisao == "Reprovado Automaticamente") {
        hAPI.setCardValue("decisaoAprovadorObraOrigem", "Reprovado");
        return true;
    }
}

function defineProximoAprovador() {
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
    else if (aprovadoDiretorObraOrigem != "true") {
        var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");
        hAPI.setCardValue("usuarioAprovadorOrigem", diretorObraOrigem);
    } 
    else {
        hAPI.setCardValue("aprovadoObraOrigem", "true");
        hAPI.setCardValue("usuarioAprovadorOrigem", "");
    }

    return hAPI.getCardValue("usuarioAprovadorOrigem");
}
function marcaAprovacaoDoAprovador() {
    var aprovador = hAPI.getCardValue("usuarioAprovadorOrigem");

    var engenheiroObraOrigem = hAPI.getCardValue("engenheiroObraOrigem");
    var coordenadorObraOrigem = hAPI.getCardValue("coordenadorObraOrigem");
    var diretorObraOrigem = hAPI.getCardValue("diretorObraOrigem");

    if (aprovador == engenheiroObraOrigem) {
        hAPI.setCardValue("aprovadoEngenheiroObraOrigem", "true");
    }
    if (aprovador == coordenadorObraOrigem) {
        hAPI.setCardValue("aprovadoCoordenadorObraOrigem", "true");
    }
    if (aprovador == diretorObraOrigem) {
        hAPI.setCardValue("aprovadoDiretorObraOrigem", "true");
    }
}
function verificaSeAprovadorTambemAprovaPelaDestino() {
    var aprovador = hAPI.getCardValue("usuarioAprovadorOrigem");

    var engenheiroObraDestino = hAPI.getCardValue("engenheiroObraDestino");
    var coordenadorObrDestino = hAPI.getCardValue("coordenadorObraDestino");
    var diretorObraOriDestino = hAPI.getCardValue("diretorObraDestino");

    if (aprovador == engenheiroObraDestino) {
        hAPI.setCardValue("aprovadoEngenheiroObraDestino", "true");
    }
    else if (aprovador == coordenadorObrDestino) {
        hAPI.setCardValue("aprovadoCoordenadorObraDestino", "true");
    }
    else if (aprovador == diretorObraOriDestino) {
        hAPI.setCardValue("aprovadoDiretorObraDestino", "true");
    }
}
function verificaSeTotalmenteAprovado(){
    var aprovadoEngenheiroObraOrigem = hAPI.getCardValue("aprovadoEngenheiroObraOrigem");
    var aprovadoCoordenadorObraOrigem = hAPI.getCardValue("aprovadoCoordenadorObraOrigem");
    var aprovadoDiretorObraOrigem = hAPI.getCardValue("aprovadoDiretorObraOrigem");

    if (aprovadoEngenheiroObraOrigem == "true" && aprovadoCoordenadorObraOrigem == "true" && aprovadoDiretorObraOrigem == "true") {        
        return true;
    }

    return false;
}