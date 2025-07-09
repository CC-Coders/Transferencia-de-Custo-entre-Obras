function servicetask26(attempt, message) {
    atualizaStatusTransferencia(2);
}


function atualizaStatusTransferencia(STATUS){
    var id = hAPI.getCardValue("ID_TRANSFERENCIAS_DE_CUSTO");

    var query = "UPDATE TRANSFERENCIAS_DE_CUSTO SET STATUS = ? WHERE ID = ?";
    executaUpdate(query, [
        {type:"int", value:STATUS},
        {type:"int", value:id},
    ]);
}