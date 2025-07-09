function createDataset(fields, constraints, sortFields) {
    try {
        var constraints = getConstraints(constraints);
        lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, ["numProces","movementSequence", "assignee", "targetState"]);


        sleep(20000);
        var movimenta = movimentaAtividades(constraints.numProces, constraints.movementSequence, constraints.assignee, constraints.targetState);
        log.info("movimenta");
        log.dir(movimenta);
        return returnDataset("SUCCESS", "",movimenta);


    } catch (error) {
        if (typeof error == "object") {
            var mensagem = "";
            var keys = Object.keys(error);
            for (var i = 0; i < keys.length; i++) {
                mensagem += (keys[i] + ": " + error[keys[i]]) + " - ";
            }
            log.info("Erro ao executar Dataset:");
            log.dir(error);
            log.info(mensagem);

            return returnDataset("ERRO", mensagem, null);
        } else {
            return returnDataset("ERRO", error, null);
        }
    }
}

function movimentaAtividades(numProces, movementSequence, assignee, targetState) {
    var clientService = fluigAPI.getAuthorizeClientService();
    var data = {
        companyId: getValue("WKCompany") + '',
        serviceCode: 'ServicoFluig',
        endpoint: '/process-management/api/v2/requests/'+numProces+'/move',
        method: 'post',
        params: {
            "movementSequence": movementSequence+"",
            "assignee": assignee+"",
            "targetState": targetState+"",
            "targetAssignee": "fluig",
            "subProcessTargetState": "0",
            "comment": "Tarefa reprovada automaticamente.",
            "asManager": true,
            "formFields": {
                "aprovadoObraDestino":"Reprovado",
                "aprovadoObraOrigem":"Reprovado",
            }
        },
        options: {
            encoding: 'UTF-8',
            mediaType: 'application/json',
            useSSL: true
        },
        headers: {
            "Content-Type": 'application/json;charset=UTF-8'
        }
    }


    var vo = clientService.invoke(JSON.stringify(data));

    if (vo.getResult() == null || vo.getResult().isEmpty()) {
        throw new Exception("Retorno está vazio");
    } else {
        return vo.getResult();
    }
}


// Utils
function getConstraints(constraints) {
    var retorno = {};
    if (constraints != null) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            retorno[constraint.fieldName] = constraint.initialValue;
        }
    }
    return retorno;
}
function returnDataset(STATUS, MENSAGEM, RESULT) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("STATUS");
    dataset.addColumn("MENSAGEM");
    dataset.addColumn("RESULT");
    dataset.addRow([STATUS, MENSAGEM, RESULT]);
    return dataset;
}
function lancaErroSeConstraintsObrigatoriasNaoInformadas(constraints, listConstrainstObrigatorias) {
    try {
        var retornoErro = [];
        for (var i = 0; i < listConstrainstObrigatorias.length; i++) {
            if (constraints[listConstrainstObrigatorias[i]] == null || constraints[listConstrainstObrigatorias[i]] == "" || constraints[listConstrainstObrigatorias[i]] == undefined) {
                retornoErro.push(listConstrainstObrigatorias[i]);
            }
        }

        if (retornoErro.length > 0) {
            throw "Constraints obrigatorias nao informadas (" + retornoErro.join(", ") + ")";
        }
    } catch (error) {
        throw error;
    }
}

function sleep(ms) {
    java.lang.Thread.sleep(ms);
}