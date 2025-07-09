<!-- <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body> -->
<div id="wdgTransfCusto_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
    data-params="wdgTransfCusto.instance()">

    <!-- Jquery -->
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

    <!-- Fluig -->
    <link rel="stylesheet"
        href="http://desenvolvimento.castilho.com.br:3232//style-guide/css/fluig-style-guide.min.css" />
    <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
    <link rel="stylesheet" type="text/css"
        href="http://desenvolvimento.castilho.com.br:3232/style-guide/css/fluig-style-guide-ratingstars.min.css">
    <script
        src="http://desenvolvimento.castilho.com.br:3232/style-guide/js/fluig-style-guide-ratingstars.min.js"></script>



    <!-- Datatables -->
    <link rel="stylesheet" href="//cdn.datatables.net/2.3.1/css/dataTables.dataTables.min.css" />
    <script src="//cdn.datatables.net/2.3.1/js/dataTables.min.js"></script>


    <!-- Castilho Dev Guide -->
    <script
        src="http://desenvolvimento.castilho.com.br:3232/castilho_dev_guide/resources/js/castilho-consultas-rm.js"></script>
    <link rel="stylesheet"
        href="http://desenvolvimento.castilho.com.br:3232/castilho_dev_guide/resources/css/castilho_dev_guide.css" />
    <link rel="stylesheet"
        href="http://desenvolvimento.castilho.com.br:3232/castilho_dev_guide/resources/css/castilho-cards.css" />

    <!-- Fontawesome -->
    <script src="https://kit.fontawesome.com/28d06c1f1f.js" crossorigin="anonymous"></script>

    <!-- selectize -->
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/css/selectize.default.min.css"
        integrity="sha512-pTaEn+6gF1IeWv3W1+7X7eM60TFu/agjgoHmYhAfLEU8Phuf6JKiiE8YmsNC0aCgQv4192s4Vai8YZ6VNM6vyQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/js/selectize.min.js"
        integrity="sha512-IOebNkvA/HZjMM7MxL0NYeLYEalloZ8ckak+NDtOViP7oiYzG5vn6WVXyrJDiJPhl4yRdmNAG49iuLmhkUdVsQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>


    <!-- Chart -->
    <script src="https://d3js.org/d3.v7.min.js"></script>


    <style>
        #landing {
            height: 100vh;
        }
    </style>

    <div style="text-align: center;">
        <h1>TRANSFERÊNCIAS DE CUSTO ENTRE OBRAS</h1>
    </div>

    <div>
        <div class="row flexRow">
            <div class="col-md-3">
                <div class="card card-castilho">
                    <div class="card-body">
                        <h3 class="card-title">
                            Valor Total
                            <br>
                            <span id="textValorTotal"></span>
                        </h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card card-castilho">
                    <div class="card-body">
                        <h3 class="card-title">
                            <h3 class="card-title">
                                Pendente Aprovação <br>
                                <span id="textValorPendente"></span>
                            </h3>
                        </h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card card-castilho">
                    <div class="card-body">
                        <h3 class="card-title">
                            <h3 class="card-title">
                                Pendente Aprovação R$12.345,67
                            </h3>
                        </h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card card-castilho"
                    style="background-color: #58595b !important; height: 80%; background: #58595b; color: white !important;">
                    <div class="card-body"
                        style="background-color: #58595b; display: flex; justify-content: center; align-items: center;">
                        <h3 class="card-title">
                            <span class="counter-group">
                                Minhas Aprovações
                                <a href="#" class="counter counter-warning pos-right-bottom">10</a>
                            </span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div>
        <div class="row">
            <div class="col-md-3" style="text-align: center;">
                <div class="chartWrapper">
                    <div class="panel panel-primary">
                        <div class="panel-heading">
                            <h3 class="panel-title">Obras com maior Envio de Custo</h3>
                        </div>
                    </div>
                    <svg id="chart1" width="250" height="250"></svg>
                    <div id="d3-tooltip"></div>
                </div>

            </div>
            <div class="col-md-3" style="text-align: center;">
                <div class="chartWrapper">

                    <div class="panel panel-primary">
                        <div class="panel-heading">
                            <h3 class="panel-title">Obras com maior Recebimento de Custo</h3>
                        </div>
                    </div>
                    <svg id="chart2" width="250" height="250"></svg>
                </div>
            </div>
            <div class="col-md-3" style="text-align: center;">
                <div class="chartWrapper">

                    <div class="panel panel-primary">
                        <div class="panel-heading">
                            <h3 class="panel-title">Produtos com maior Valor Transferido</h3>
                        </div>
                    </div>
                    <svg id="chart3" width="250" height="250"></svg>
                </div>
            </div>
            <div class="col-md-3" style="text-align: center;">
                <div class="chartWrapper">

                    <div class="panel panel-primary">
                        <div class="panel-heading">
                            <h3 class="panel-title">Produtos com maior Valor Transferido</h3>
                        </div>
                    </div>
                    <svg id="chart4" width="250" height="250"></svg>
                </div>
            </div>
        </div>
    </div>
    <br>

    <div id="tableWraper">
        <div style="text-align: center;">
            <h2>Transferências</h2>
        </div>

        <table class="table" id="tableTransferencias">
            <thead>
                <tr>
                    <th>Solicitação</th>
                    <th>Obra Origem</th>
                    <th>Obra Destino</th>
                    <th>Solicitante</th>
                    <th>Valor</th>
                    <th>Data Solicitação</th>
                    <th>Data Competencia</th>
                    <th>STATUS</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
    </div>

    <div class="row">
        <div class="col-md-12" style="text-align: center;">
            <div style="display: flex;     justify-content: center;">
                <div style="margin-right: 40px;">
                    <button class="btn btn-primary">
                        <i class="flaticon flaticon-arrow-left icon-md" aria-hidden="true"></i>
                    </button>
                </div>
                <div>
                    <b id="textPeriodo">Período</b>
                    <select name="" id="" class="form-control" style="text-align: center !important;">
                        <option value="">Competencia</option>
                        <option value="">Trimestre</option>
                        <option value="">Ano</option>
                    </select>
                </div>
                <div style="margin-left: 40px;">
                    <button class="btn btn-primary">
                        <i class="flaticon flaticon-arrow-right icon-md" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div id="landing" class="bg-castilho" style="display: none;">
        <div style="text-align: center;">
            <h1 style="font-weight: bolder;">Transferência de Custos entre Obras</h1>
        </div>
    </div>


    <div id="filtros" class="panel panel-primary" style="border-radius: 25px;">
        <div class="panel-heading" style="text-align: center;border-radius: 20px;">
            <h3 class="" style="font-weight: bolder; margin: 0px;">
                <i class="flaticon flaticon-chevron-up icon-sm" aria-hidden="true" id="arrowFiltro"></i>
                FILTROS
            </h3>
        </div>
        <div class="panel-body" style="display: none; border-radius: 20px;">
            <div class="row">
                <div class="col-md-3">
                    <label for="">Coligada Obra Origem</label>
                    <select name="" id="" class="form-control"></select>
                    <br>
                </div>
                <div class="col-md-3">
                    <label for="">C. Custo Obra Origem</label>
                    <select name="" id="" class="form-control"></select>
                    <br>
                </div>
                <div class="col-md-3">
                    <label for="">Coligada Obra Destino</label>
                    <select name="" id="" class="form-control"></select>
                    <br>
                </div>
                <div class="col-md-3">
                    <label for="">C. Custo Obra Destino</label>
                    <select name="" id="" class="form-control"></select>
                    <br>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3">
                    <label for="">Tipo</label>
                    <select name="" id="" class="form-control"></select>
                </div>
                <div class="col-md-3">
                    <label for="">STATUS</label>
                    <select name="" id="" class="form-control"></select>
                </div>
            </div>
        </div>
    </div>

    <button class="btn btn-primary" id="btnDarkMode"><i class="flaticon flaticon-moon icon-sm"
            aria-hidden="true"></i></button>
</div>

<!-- </body>

</html> -->