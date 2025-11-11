<div id="wdgTransfCusto_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide"
    data-params="wdgTransfCusto.instance()">

    <!-- Jquery -->
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

    <!-- Fluig -->
    <link rel="stylesheet"
        href="/style-guide/css/fluig-style-guide.min.css" />
    <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
    <link rel="stylesheet" type="text/css"
        href="/style-guide/css/fluig-style-guide-ratingstars.min.css">
    <script
        src="/style-guide/js/fluig-style-guide-ratingstars.min.js"></script>



    <!-- Datatables -->
    <link rel="stylesheet" href="//cdn.datatables.net/2.3.1/css/dataTables.dataTables.min.css" />
    <script src="//cdn.datatables.net/2.3.1/js/dataTables.min.js"></script>

    

    <script src="https://cdn.datatables.net/buttons/3.2.5/js/dataTables.buttons.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.2.5/js/buttons.dataTables.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.2.5/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.2.5/js/buttons.print.min.js"></script>


    <!-- Castilho Dev Guide -->
    <script
        src="/castilho_dev_guide/resources/js/castilho-consultas-rm.js"></script>
    <script
        src="/castilho_dev_guide/resources/js/castilho-utils.js"></script>
    <link rel="stylesheet"
        href="/castilho_dev_guide/resources/css/castilho_dev_guide.css" />
    <link rel="stylesheet"
        href="/castilho_dev_guide/resources/css/castilho-cards.css" />

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
                        <div class="row">
                            <div class="col-md-6">
                                <label for="">Data Início</label>
                                <input type="text" name="filtroDataInicio" id="filtroDataInicio" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label for="">Data Fim</label>
                                <input type="text" name="filtroDataFim" id="filtroDataFim" class="form-control">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3" style="display: none;">
                        <label for="">Departamento</label>
                        <select name="filtroDepartamentoOrigem" id="filtroDepartamentoOrigem">
                            <option value="">Todos</option>
                        </select>
                        <br>
                    </div>
                    <div class="col-md-3">
                        <label for="filtroColigadaDestino">Coligada Destino</label>
                        <select name="filtroColigadaDestino" id="filtroColigadaDestino">
                            <option value="">Todas</option>
                        </select>
                        <br>
                    </div>
                    <div class="col-md-6">
                        <label for="">STATUS</label>
                        <div>
                            <label style="margin-right: 20px;" for="filtroStatusAprovacao"><input type="checkbox" name="filtroStatusAprovacao" class="filtroStatus" id="filtroStatusAprovacao" value="1">Em Aprovação</label>
                            <label style="margin-right: 20px;" for="filtroStatusAprovado"><input type="checkbox" name="filtroStatusAprovado" class="filtroStatus" id="filtroStatusAprovado" value="2" checked>Finalizado</label>
                            <label style="margin-right: 20px;" for="filtroStatusCancelado"><input type="checkbox" name="filtroStatusCancelado" class="filtroStatus" id="filtroStatusCancelado" value="3">Cancelado</label>
                            <label style="margin-right: 20px;" for="filtroStatusExcluido"><input type="checkbox" name="filtroStatusExcluido" class="filtroStatus" id="filtroStatusExcluido" value="4">Excluído</label>
                        </div>
                    </div>
                </div>
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
                            <div class="card card-castilho card-castilho-success">
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
                            <div class="card card-castilho card-castilho-error">
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
                            <div class="card card-castilho card-castilho-success">
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
                            <div class="card card-castilho card-castilho-error">
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
        <button class="btn btn-primary" id="btnDarkMode"><i class="flaticon flaticon-moon icon-sm"
        aria-hidden="true"></i></button>
    </div>

    <div id="painelAprovacoes">
        <button class="btn btn-primary" id="btnVoltar">Voltar</button>
        <div class="panel panel-primary" style="margin-bottom: 0px;">
            <div class="panel-body">
                <div>
                    <h2 style="margin-bottom: 5px;">SOLICITAÇÃO</h2>
                    <hr style="margin-bottom: 10px; margin-top: 0px;">
                    <b>Número: </b><span id="textAprovacaoNumProcess"></span><br>
                    <b>Solicitante: </b><span id="textAprovacaoSolicitante"></span><br>
                    <b>Valor: </b> <span id="textAprovacaoValorTotal"></span> <br>
                </div>
                <br>
                <div class="row flexRow">
                    <div class="col-md-5">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">ORIGEM <small style="color: white;" id="textAprovacaoTipoOrigem">(redução de custo)</small></h3>
                            </div>
                            <div class="panel-body" style="background-color: darkgray !important;">
                                <h2 id="textAprovacaoObraOrigem" style="margin-top: 0px;"></h2><br>
                                <div>
                                    <b>Engenheiro: </b><span id="textAprovacaoEngenheiroOrigem"></span><br>
                                    <b>Coordenador: </b><span id="textAprovacaoCoordenadorOrigem"></span><br>
                                    <b>Diretor: </b><span id="textAprovacaoDiretorOrigem"></span><br>
                                </div>
                            </div>
                        </div>
                    </div>
        			<div class="col-md-2">
						<div style="height: 100%;display: flex;align-items: center;justify-content: center;flex-direction: column;">
							<h1 style="margin-bottom: 0px;margin-top: 0px;" id="titleTipoTransferencia"></h1>
							<h1 style="margin-bottom: 0px;margin-top: 0px;" id="titleValorTransferencia"></h1>
							<i class="fluigicon fluigicon-arrow-right icon-thumbnail-lg" aria-hidden="true"></i>
						</div>
					</div>
                    <div class="col-md-5">
                        <div class="panel panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">DESTINO <small style="color: white;" id="textAprovacaoTipoDestino">(aumento de custo)</small></h3>
                            </div>
                            <div class="panel-body" style="background-color: darkgray !important;">
                               <h2 id="textAprovacaoObraDestino" style="margin-top: 0px;"></h2><br>
                                <div>
                                    <b>Engenheiro: </b><span id="textAprovacaoEngenheiroDestino"></span><br>
                                    <b>Coordenador: </b><span id="textAprovacaoCoordenadorDestino"></span><br>
                                    <b>Diretor: </b><span id="textAprovacaoDiretorDestino"></span><br>
                                </div>
                            </div>
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
        <div id="divPaginacao" style="text-align: center;">
            <i class="fluigicon fluigicon-pointer-left icon-xl" aria-hidden="true" id="controlPaginacaoBackward"></i>
            <div id="textPaginacao">1 / 10</div>
            <i class="fluigicon fluigicon-pointer-right icon-xl" aria-hidden="true" id="controlPaginacaoForward"></i>
        </div>
    </div>


</div>