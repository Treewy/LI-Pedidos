var token, qtdPedidos = 0, numPedido = 0, situacao = [], situacaoNome;
var chave_api, chave_aplicacao = "7a7134e1-dfc3-4922-b145-eb8b605171aa";
function gerarToken() {
  token = "?chave_api=" + chave_api + "&chave_aplicacao=" + chave_aplicacao;
}

var app = {
  initialize: function() {
    this.bindEvents();
  },
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener("online", this.onDeviceOnline, false);
    document.addEventListener("offline", this.onDeviceOffline, false);
    document.addEventListener("menubutton", this.onMenuPress, false);
    document.addEventListener("backbutton", this.onBackPress, true); 
  },
  onDeviceReady: function() {
    chave_api = window.localStorage.getItem("chave_api");
    gerarToken();
    if($('#login').length) {
      app.pageLogin();
    } else if($('.ultimos-pedidos').length) {
      $('#load-more')[0].addEventListener('touchend', function() {
        qtdPedidos = qtdPedidos - 10;
        if(qtdPedidos <= 0) {
          $('#load-more').remove();
        }
        window.sessionStorage.setItem("qtdPedidos", qtdPedidos);
        app.carregarLista(1);
      }, false);
      app.pageListar();
    } else if($('#infoPedido').length) {
      app.pageInfo();
    }
    if($('header .actions').length) {
      if($('#top-search').length) {
        $('#top-search')[0].addEventListener('touchend', function() {
          search.show();
        }, false);
      }
      $('.action-overflow .spinner-item')[0].addEventListener('touchend', function() {
        about.show();
      }, false);
      $('#top-about')[0].addEventListener('touchend', function() {
        about.show();
      }, false);
      $('.action-overflow .spinner-item')[1].addEventListener('touchend', function() {
        navigator.app.exitApp();
      }, false);
      $('#top-exit')[o].addEventListener('touchend', function() {
        navigator.app.exitApp();
      }, false);
    }
  },
  onDeviceOnline: function() {
  
  },
  onDeviceOffline: function() {
    alert('Dispositivo não conectado à internet');
  },
  onMenuPress: function() {
  
  },
  onBackPress: function() {
    if($('#login').length){
      navigator.app.exitApp();
    } else if ($('.ultimos-pedidos').length) {
      window.location="index.html";
    } else if ($('#infoPedido').length) {
      window.location="ultimosPedidos.html";
    } else {
      navigator.app.backHistory()
    }
  },
  //Paginas
  pageLogin: function() {
   $('#chave_api').val(chave_api);
    $('#send')[0].addEventListener('touchend', function() {
      app.checkLogin();
    }, false);
    $('#sair')[0].addEventListener('touchend', function() {
      window.localStorage.removeItem("chave_api");
      $('#chave_api').val('20bfdd1a-51c4-4996-aedc-e53c132e1779')
    }, false);
    $('.help .show-help')[0].addEventListener('touchend', function() {
      $('.help .show-help i').toggleClass('icon-chevron-down icon-chevron-right');
      $('.help .show-help').toggleClass('active');
      $('.help .help-box').slideToggle();
    }, false);
  },
  pageListar: function() {
    $.get("http://api.lojaintegrada.com.br/api/v1/situacao/" + token, function(data) {
      jQuery.each(data.objects, function(i, e) {
        situacao.push({'id':e.id, 'nome':e.nome});
      });
      qtdPedidos = Number(window.sessionStorage.getItem("qtdPedidos"));
      if(qtdPedidos < 0) {
        qtdPedidos = -1;
        window.sessionStorage.setItem("qtdPedidos", qtdPedidos);
        $('#load-more').remove();
      }
      app.carregarLista();
    }).fail(function(e) {
      alert(e.statusText);
    });
  },
  pageInfo: function() {
    numPedido = window.sessionStorage.getItem("numPedido");
    $.ajax({
      type: 'GET',
      url: "http://api.lojaintegrada.com.br/api/v1/pedido/" + numPedido + token,
      dataType: "jsonp",
      cache: false,
      crossDomain: true,
      processData: true,
      error: function(e) {
        console.log(e);
        alert('Pedido não encontrado');
        window.location="ultimosPedidos.html";
      },
      success: function(data) {
        app.carregarInfo(data);
      }
    });
  },
  //Funcoes Diversas
  checkLogin: function() {
    $('.loading').show();
    window.localStorage.removeItem("chave_api");
    window.localStorage.setItem("chave_api", $('#chave_api').val());
    chave_api = window.localStorage.getItem("chave_api");
    gerarToken();
    $.ajax({
      type: 'GET',
      url: "http://api.lojaintegrada.com.br/api/v1/pedido/search/" + token + "&order_by=-numero&limit=1",
      dataType: "jsonp",
      cache: false,
      crossDomain: true,
      processData: true,
      error: function(e) {
        console.log(e);
        $('.loading').hide();
        alert('Chave API incorreta');
        $('#chave_api').focus();
      },
      success: function(data) {
        if (data.objects.length === 0) {
          window.sessionStorage.setItem("qtdPedidos", -1);
          window.sessionStorage.setItem("totalPedidos", 0);
        } else {
          qtdPedidos = data.objects[0].numero;
          if (qtdPedidos < 10) {
            window.sessionStorage.setItem("qtdPedidos", 0);
          } else {
            window.sessionStorage.setItem("qtdPedidos", Number(qtdPedidos) - 10);
          }
          window.sessionStorage.setItem("totalPedidos", Number(qtdPedidos));
        }
        window.location="ultimosPedidos.html";
      },
      complete: function(data) {
        
      }
    });
  },
  carregarLista: function(fromBt) {
    if(fromBt) {
      var limit = 10;
    } else {
      var limit = 0;
    }
    if (qtdPedidos === -1) {
      $('.ultimos-pedidos').append("<li id='' class='list-item-two-lines'><h3>Sua loja não possui pedidos</h3><p>Faça um pedido de teste para visualizar aqui</p></li>");
    } else {
      $.ajax({
        type: 'GET',
        url: "http://api.lojaintegrada.com.br/api/v1/pedido/search/" + token + "&since_numero=" + qtdPedidos + "&limit=" + limit,
        dataType: "jsonp",
        cache: false,
        crossDomain: true,
        processData: true,
        error: function(e) {
          console.log(e);
        },
        success: function(data) {
          var listItem, loopTime = data.objects.length - 1;
          (function iterate() {
            $.get("http://api.lojaintegrada.com.br/api/v1/pedido/" + data.objects[loopTime].numero + token, function(itemInfo) {
              app.findSituacao(itemInfo.situacao);
              listItem = "<li id='" + itemInfo.numero + "' class='list-item-two-lines selectable'><a href='infoPedido.html' class='action' data-ignore='true'><h3><small>" + moment(itemInfo.data_criacao).format("DD/MM/YY LT") + "</small><span>" + itemInfo.numero + " - " + itemInfo.cliente.nome/*.trunc(22,true)*/ + "</span></h3><p>" + situacaoNome + "<span class='total'>R$ " + itemInfo.valor_total.replace('.', ',') + "</span></p></a></li>";
              $('.ultimos-pedidos').append(listItem);
              $('.ultimos-pedidos li:last-child')[0].addEventListener('touchend', function() {
                window.sessionStorage.setItem("numPedido", $(this).attr('id'));
              }, false);
              loopTime--;
              if (loopTime >= 0) { iterate(); } else if (itemInfo.numero === 1) { $('#load-more').remove(); }
            }).fail(function(e) {
              alert('Falha ao obter o pedido ' + data.objects[loopTime].numero);
            });
          })();
        }
      });
    }
  },
  carregarInfo: function(data) {
    $.get("http://api.lojaintegrada.com.br/api/v1/situacao/" + token, function(dataSituacao) {
      jQuery.each(dataSituacao.objects, function(i, e) {
        situacao.push({'id':e.id, 'nome':e.nome});
      });
      app.findSituacao(data.situacao);
      $('#infoSituacao strong').text(situacaoNome);
      $.get("http://api.lojaintegrada.com.br/api/v1/pagamento/" + token, function(dataPagamento) {
        situacao = [];
        jQuery.each(dataPagamento.objects, function(i, e) {
          situacao.push({'id':e.id, 'nome':e.nome});
        });
        app.findSituacao(data.pagamentos[0].forma_pagamento);
        $('#infoPag strong').text(situacaoNome);
        $('#infoNum strong').text(data.numero);
        $('#infoPagId strong').text(data.pagamentos[0].transacao_id);
        $('#infoEnvio strong').text(data.envios[0].forma_envio.nome);
        $('#infoEnvioId strong').text(data.envios[0].objeto);
        $('#infoEnvioValor strong').text('R$ ' + Number(data.valor_envio).toFixed(2).replace('.', ','));
        $('#infoValor strong').text('R$ ' + Number(data.valor_total).toFixed(2).replace('.', ','));
        $('#infoEndNome strong').text(data.endereco_entrega.nome);
        $('#infoEnd strong').text(data.endereco_entrega.endereco + ', ' + data.endereco_entrega.numero);
        $('#infoCidade strong').text(data.endereco_entrega.bairro + ', ' + data.endereco_entrega.cidade + ' - ' + data.endereco_entrega.estado);
        $('#infoCep strong').text(data.endereco_entrega.cep);
        $('#infoNome strong').text(data.cliente.nome);
        $('#infoCpf strong').text(data.cliente.cpf);
        $('#infoEmail strong').text(data.cliente.email);
        $('#infoTel1 strong').text(data.cliente.telefone_celular);
        $('#infoTel2 strong').text(data.cliente.telefone_principal);
        $('#infoNasc strong').text(moment(data.cliente.data_nascimento).format("DD/MM/YY"));
        $('#infoSexo strong').text(data.cliente.sexo.toUpperCase());
        jQuery.each(data.itens, function(i, e) {
          $('#infoItens').append("<tr><td>" + Number(e.quantidade).toFixed(0) + "</td><td>" + e.nome + "</td><td class='valor'>R$ " + Number(e.preco_venda).toFixed(2).replace('.', ',') + "</td></tr>");
        });
      });
    });
  },
  findSituacao: function(nome) {
    if(nome.nome) {
      situacaoNome = nome.nome;
    } else {
      jQuery.grep(situacao, function(obj) {
        if(nome.replace('/api/v1/situacao/', '').replace('/api/v1/pagamento/', '') == obj.id) {
          situacaoNome = obj.nome;
        }
      });
    }
  },
  findPedido: function() {
    window.sessionStorage.setItem("numPedido", Number($('#search_num').val()));
    window.location="infoPedido.html";
  }
};

/* Modal */
var about = new fries.Dialog({
  selector: '#sobre',
  callbackOk: function () {
    window.location="market://details?id=com.synergyconsulting.lipedidos";
  },
  callbackCancel: function () {
    this.hide();
  }
});
if($('#search').length) {
  var search = new fries.Dialog({
    selector: '#search',
    callbackOk: function () {
      app.findPedido();
    },
    callbackCancel: function () {
      this.hide();
    }
  });
}
  
$(document).ajaxStart(function(event, request, settings) {
  $('.loading').show();
  $('#load-more').hide();
});

$(document).ajaxStop(function(event, request, settings) {
  $('.loading').hide();
  $('#load-more').show();
});

String.prototype.trunc = function(n,useWordBoundary){
  var toLong = this.length>n, s_ = toLong ? this.substr(0,n-1) : this;
  s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
  return toLong ? s_ + '&hellip;' : s_;
};

//window.addEventListener('push', app.initialize();, false);
//window.addEventListener('popstate', app.initialize();, false);