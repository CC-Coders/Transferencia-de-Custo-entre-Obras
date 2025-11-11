async function downloadResumo(){
    const env = getServerURL() == "http://fluig.castilho.com.br:1010" ? "PRODUCAO" : "DESENVOLVIMENTO"; 
    const documentIdConfig = {
        PRODUCAO:1914251,
        DESENVOLVIMENTO:29953
    };

    var documentId = documentIdConfig[env];
    var file = await asyncPreencheDocumentoComDadosDoFormulario(documentId);
    saveAs(file, `TransferênciaDeCustoEntreEmpresas_${$("#solicitacao").val()}.docx`);
}


function exportSheet(data){
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transferências");
    XLSX.writeFile(workbook, "Presidents.xlsx", { compression: true });

}

function getData(){
    var itens = [
        {"A1":"<b>Obra Origem</b>", "A2":"*Obra Destino*"},
        {"A1":$("#ccustoObraOrigem").val(), "A2":$("#ccustoObraDestino").val()},
    ];


    itens.push({A1:"",A2:""});




    $("#tableTransferencias>tbody>tr:not(:first)").each(function(){
        console.log($(this).find(".listItensTransferencia").val());
        var JSONItens = JSON.parse($(this).find(".listItensTransferencia").val());
        var tipo = $(this).find(".motivoTransferencia").val();
        var valorTotal = $(this).find(".valorTotalTransferencia").val();
        var justificativa = $(this).find(".textMotivoTransferencia").val();

        itens.push({A1:"Tipo: " + tipo,A2:"Valor Total: "+valorTotal});        
        itens.push({A1:"Produto",A2:"Descrição",A3:"Quantidade",A4:"Valor Unitário",A5:"Valor Total"});
        for (const item of JSONItens) {
            itens.push({A1:item.DESCPRODUTO,A2:item.DESCRICAO,A3:item.QUANTIDADE + item.UN, A4:item.VALOR_UNITARIO, A5:floatToMoney(moneyToFloat(item.VALOR_UNITARIO) * moneyToFloat(item.QUANTIDADE))});
        }
        itens.push({A1:"Justificativa: " +justificativa ,A2:""});
        itens.push({A1:"",A2:""});
        itens.push({A1:"",A2:""});
    });

    return itens;
}
function getData2(){
    var transferencias = [];


    $("#tableTransferencias>tbody>tr:not(:first)").each(function(){
        var TIPO = $(this).find(".motivoTransferencia").val();
        var JUSTIFICATIVA = $(this).find(".textMotivoTransferencia").val();
        var VALOR_TOTAL = $(this).find(".valorTotalTransferencia").val();
        var items = JSON.parse($(this).find(".listItensTransferencia").val());
        var Itens = items.map(e=> ({
            ...e,
            VALOR_TOTAL:floatToMoney(moneyToFloat(e.QUANTIDADE) * moneyToFloat(e.VALOR_UNITARIO))
        }));

        transferencias.push({TIPO, VALOR_TOTAL, Itens, JUSTIFICATIVA});
    });


    return {
        EMPRESA_ORIGEM:getNomeColigada($("#CODCOLIGADA_ORIGEM").val()),
        OBRA_ORIGEM:$("#ccustoObraOrigem").val(),
        EMPRESA_DESTINO:getNomeColigada($("#CODCOLIGADA_DESTINO").val()),
        OBRA_DESTINO:$("#ccustoObraDestino").val(),
        TOTAL: floatToMoney($("#valorTotal").val()),
        Transferencias:transferencias
    }

}




async function asyncPreencheDocumentoComDadosDoFormulario(documentId) {
    var url = await promiseBuscaDownloadUrlDocumentoNoFLuig(documentId);
    var file = await geraFileFromURL(url);
    var pdf = await carregaFileProDocxTemplatereEPreencheOsValores_retornaFile(file);
    return pdf;

    function geraFileFromURL(url) {
        return new Promise((resolve, reject) => {
            PizZipUtils.getBinaryContent(url, function (error, content) {
                if (error) {
                    reject(error);
                }
                resolve(content);
            });
        });
    }
    async function carregaFileProDocxTemplatereEPreencheOsValores_retornaFile(content) {
        const zip = new PizZip(content);
        const doc = new window.docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            syntax: {
                changeDelimiterPrefix: "$",
            },
        });
        doc.render(getData2());
        var file = doc.toBlob();
        var file = new File([file], "file.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        return file;
    }
}





function getNomeColigada(CODCOLIGADA){
    var ds = DatasetFactory.getDataset("Coligadas",["NOMEFANTASIA"],[
        DatasetFactory.createConstraint("CODCOLIGADA",CODCOLIGADA,CODCOLIGADA,ConstraintType.MUST)
    ],null)
    return ds.values[0].NOMEFANTASIA;
}