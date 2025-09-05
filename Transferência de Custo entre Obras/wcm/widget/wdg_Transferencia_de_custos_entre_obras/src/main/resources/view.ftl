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
    <script
        src="http://desenvolvimento.castilho.com.br:3232/castilho_dev_guide/resources/js/castilho-utils.js"></script>
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

    
    <!-- Swal -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>



    <style>
        #landing {
            height: 100vh;
        }
    </style>


    <div id="dashboard">
        <div style="text-align: center;">
            <h1 style="margin-top: 0px;">
                TRANSFERÊNCIAS DE CUSTO ENTRE OBRAS
                <button class="btn btn-primary" id="cardAprovacoesPendentes"
                    style="position: absolute; right: 40px; top: 20px; border-radius: 20px;">
                    <span class="counter-group">
                        Minhas Aprovações
                        <a href="#" id="counterAprovacaoPendente"
                            class="counter counter-warning pos-right-bottom">10</a>
                    </span>
                </button>
            </h1>
        </div>
        <br>
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
                        <label for="">Coligada</label>
                        <select name="filtroColigadaOrigem" id="filtroColigadaOrigem">
                            <option value="">Todas</option>
                        </select>
                        <br>
                    </div>
                    <div class="col-md-3">
                        <label for="">Obra</label>
                        <select name="filtroCCUSTOOrigem" id="filtroCCUSTOOrigem">
                            <option value="">Todas</option>
                        </select>
                        <br>
                    </div>
                    <div class="col-md-3" style="display: none;">
                        <label for="">Departamento</label>
                        <select name="filtroDepartamentoOrigem" id="filtroDepartamentoOrigem">
                            <option value="">Todos</option>
                        </select>
                        <br>
                    </div>
                    <div class="col-md-3">
                        <label for="">Tipo</label>
                        <select name="filtroTipoTransferencia" id="filtroTipoTransferencia" class="form-control">
                            <option value="">Todos</option>
                            <optgroup label="Transferências de Custo">
                                <option value="Equipamento">Equipamento</option>
                                <option value="Mão de Obra">Mão de Obra</option>
                                <option value="Prestação de Serviço">Prestação de Serviço </option>
                                <option value="Insumos">Insumos</option>
                            </optgroup>
                            <optgroup label="Transferências de Receita">
                                <option value="Receita">Receita</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label for="">STATUS</label>
                        <select name="filtroStatus" id="filtroStatus" class="form-control">
                            <option value="">Todos</option>
                            <option value="1">Em Aprovação</option>
                            <option value="2" selected>Aprovado</option>
                            <option value="3">Cancelado</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                  
                </div>
                <br>
                <div class="row">
                    <div class="col-md-5"></div>
                    <div class="col-md-2" style="text-align: center;">
                        <button class="btn btn-success btn-block" id="btnConsultaTransferencias">Buscar</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6" style="text-align: center;">
                <div class="chartWrapper">
                    <div class="panel-heading">
                        <h3 class="panel-title" style="padding-bottom: 0px;">CUSTO</h3>
                    </div>
                    <div class="row" style="padding: 0px 20px;">
                        <div class="col-md-6">
                            <div class="card card-castilho">
                                <div class="card-body">
                                    <h3 class="card-title">
                                        <h3 class="card-title">
                                            Custo Enviado
                                            <br>
                                            <span id="textValorTotalCustoEnviado"></span>
                                        </h3>
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card card-castilho">
                                <div class="card-body">
                                    <h3 class="card-title">
                                        <h3 class="card-title">
                                            Custo Recebido
                                            <br>
                                            <span id="textValorTotalCustoRecebido"></span>
                                        </h3>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <svg id="chart5" width="250" height="250"></svg>
                        <div id="d3-tooltipchart5" class="d3-tooltip"></div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="chartWrapper">
                                <div class="chartWrapper" style="margin-bottom: 0px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title" style="padding-bottom: 0px;">Custos Enviados por Obra
                                        </h3>
                                    </div>
                                    <div class="" style="padding: 0px;">
                                        <svg id="chart1" width="250" height="250"></svg>
                                        <svg id="legendchart1" width="250" height="50"></svg>
                                    </div>
                                    <div id="d3-tooltipchart1" class="d3-tooltip"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="chartWrapper">
                                <div class="chartWrapper" style="margin-bottom: 0px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title" style="padding-bottom: 0px;">Custos Recebidos por Obra
                                        </h3>
                                    </div>
                                    <div class="" style="padding: 0px;">
                                        <svg id="chart2" width="250" height="250"></svg>
                                        <svg id="legendchart2" width="250" height="50"></svg>
                                    </div>
                                    <div id="d3-tooltipchart2" class="d3-tooltip"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6" style="text-align: center;">
                <div class="chartWrapper">
                    <div class="panel-heading">
                        <h3 class="panel-title" style="padding-bottom: 0px;">RECEITA</h3>
                    </div>
                    <div class="row" style="padding: 0px 20px;">
                        <div class="col-md-6">
                            <div class="card card-castilho">
                                <div class="card-body">
                                    <h3 class="card-title">
                                        Receita Recebida
                                        <br>
                                        <span id="textValorTotalReceitaRecebida"></span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card card-castilho">
                                <div class="card-body">
                                    <h3 class="card-title">
                                        <h3 class="card-title">
                                            Receita Enviada <br>
                                            <span id="textValorTotalReceitaEnviada"></span>
                                        </h3>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <svg id="chart6" width="250" height="250"></svg>
                        <div id="d3-tooltipchart6" class="d3-tooltip"></div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="chartWrapper">
                                <div class="chartWrapper" style="margin-bottom: 0px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title" style="padding-bottom: 0px;">Receitas Recebidas por Obra
                                        </h3>
                                    </div>
                                    <div class="" style="padding: 0px;">
                                        <svg id="chart3" width="250" height="250"></svg>
                                        <svg id="legendchart3" width="250" height="50"></svg>
                                    </div>
                                    <div id="d3-tooltipchart3" class="d3-tooltip"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="chartWrapper">
                                <div class="chartWrapper" style="margin-bottom: 0px;">
                                    <div class="panel-heading">
                                        <h3 class="panel-title" style="padding-bottom: 0px;">Receitas Enviadas por Obra
                                        </h3>
                                    </div>
                                    <div class="" style="padding: 0px;">
                                        <svg id="chart4" width="250" height="250"></svg>
                                        <svg id="legendchart4" width="250" height="50"></svg>
                                    </div>
                                    <div id="d3-tooltipchart4" class="d3-tooltip"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br>



        <div id="tableWraper" class="dashboard">
            <div style="text-align: center;">
                <h2>Transferências</h2>
            </div>
            <table class="table table-hover" id="tableTransferencias">
                <thead>
                    <tr>
                        <th class="alignCenter">SOLICITAÇÂO</th>
                        <th class="alignCenter">TIPO</th>
                        <th class="alignCenter">OBRA ORIGEM</th>
                        <th class="alignCenter">OBRA DESTINO</th>
                        <th class="alignCenter">SOLICITANTE</th>
                        <th class="alignCenter">VALOR</th>
                        <th class="alignCenter">DATA SOLICITAÇÃO</th>
                        <th class="alignCenter">DATA COMPETENCIA</th>
                        <th class="alignCenter">STATUS</th>
                        <th class="alignCenter"></th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </div>
        <div id="landing" class="bg-castilho dashboard" style="display: none;">
            <div style="text-align: center;">
                <h1 style="font-weight: bolder;">Transferência de Custos entre Obras</h1>
            </div>
        </div>
    </div>

    <div id="painelAprovacoes">
        <div class="panel panel-primary">
            <div class="panel-body">
                <div>
                    <h2 style="margin-bottom: 5px;">SOLICITAÇÃO</h2>
                    <hr style="margin-bottom: 10px; margin-top: 0px;">
                    <b>Número: </b><span id="textAprovacaoNumProcess">123456</span><br>
                    <b>Solicitante: </b><span id="textAprovacaoSolicitante">gabriel.persike</span><br>
                    <b>Valor: </b> <span id="textAprovacaoValorTotal">R$ 250,00</span> <br>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <h2 style="margin-bottom: 5px;">ORIGEM <small style="color: white;" id="textAprovacaoTipoOrigem">(redução de custo)</small></h2>
                        <hr style="margin-bottom: 10px; margin-top: 0px;">
                        <b>Obra: </b> <span id="textAprovacaoObraOrigem">1.1.001 - Matriz Curitiba</span><br>
                        <div>
                            <b>Engenheiro: </b><span id="textAprovacaoEngenheiroOrigem">Felipe</span><br>
                            <b>Coordenador: </b><span id="textAprovacaoCoordenadorOrigem">Eduardo</span><br>
                            <b>Diretor: </b><span id="textAprovacaoDiretorOrigem">Augusto</span><br>
                        </div>
                        <br>
                    </div>
                    <div class="col-md-6">
                        <h2 style="margin-bottom: 5px;">DESTINO <small style="color: white;" id="textAprovacaoTipoDestino">(aumento de custo)</small></h2>
                        <hr style="margin-bottom: 10px; margin-top: 0px;">
                        <b>Obra: </b> <span id="textAprovacaoObraDestino">1.2.023 - Obra Toledo II</span><br>
                        <div>
                            <b>Engenheiro: </b><span id="textAprovacaoEngenheiroDestino">Claudio.pecanha</span><br>
                            <b>Coordenador: </b><span id="textAprovacaoCoordenadorDestino">Eduardo</span><br>
                            <b>Diretor: </b><span id="textAprovacaoDiretorDestino">Augusto</span><br>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 style="margin-bottom: 5px;">TRANSFERÊNCIAS</h2>
                    <hr style="margin-bottom: 10px; margin-top: 0px;">
                    <div id="divTransferencias"></div>
                    <br>
                </div>

                <div>
                    <h2 style="margin-bottom: 5px;">HISTÓRICO</h2>
                    <hr style="margin-bottom: 10px; margin-top: 0px;">
                    <div id="divLinhasHistorico"></div>
                </div>

                <div>
                    <label for="textAreaObservacao">Observação:</label>
                    <textarea name="textAreaObservacao" id="textAreaObservacao" class="form-control" rows=4></textarea>
                </div>
                <br>
                <div style="text-align: center;">
                    <button class="btn btn-success" id="btnAprovar" style="margin-right: 10px;">Aprovar</button>
                    <button class="btn btn-danger" id="btnReprovar">Reprovar</button>
                </div>
            </div>
        </div>
    </div>

    <button class="btn btn-primary" id="btnDarkMode"><i class="flaticon flaticon-moon icon-sm"
            aria-hidden="true"></i></button>
</div>