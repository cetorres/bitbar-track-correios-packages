#!/usr/bin/env /usr/local/bin/node

/* jshint esversion: 6 */

/*
 * <bitbar.title>Track Brazilian Post Office (Correios) packages</bitbar.title>
 * <bitbar.version>v1.0</bitbar.version>
 * <bitbar.author>Carlos E. Torres</bitbar.author>
 * <bitbar.author.github>cetorres</bitbar.author.github>
 * <bitbar.desc>EN: Track Brazilian Post Office (Correios) packages. PT: Rastreie encomendas dos Correios.</bitbar.desc>
 * <bitbar.abouturl>https://github.com/cetorres/bitbar-track-correios-packages</bitbar.abouturl>
 * <bitbar.image>https://raw.githubusercontent.com/cetorres/bitbar-track-correios-packages/master/screenshot.png</bitbar.image>
 * <bitbar.dependencies>node</bitbar.dependencies>
 */

// Enter the track code here.
// Informe o código de rastreio aqui.
var code = ""; // Ex.: AA123456789BR

// Don't change anything else below this line.
// Não altere mais nada a partir desta linha.
const https = require('https');
var url = "https://wsmobile.correios.com.br/service/rest/rastro/rastroMobile/FALECONOSC/7KMJ6FISA4/L/T/" + code + "/101";

var refreshMenu = function() {
    console.log("---");
    console.log("Atualizar | refresh=true");
}

var aboutMenu = function() {
    console.log('---');
    console.log('by Carlos E. Torres | href=http://cetorres.com');
}

const toTitleCase = (phrase) => {    
    return phrase ? phrase
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') : "";
};

https.get(url, (res) => {

    res.setEncoding('utf-8');
    var responseString = '';

    res.on('data', function(data) {
        responseString += data;
    });

    res.on('end', function() {       
        var responseObject = JSON.parse(responseString);
        var nomeObjeto = responseObject.objeto[0].nome != undefined ? responseObject.objeto[0].nome : "OBJETO";
        var eventos = responseObject.objeto[0].evento;

        if (nomeObjeto != "" && eventos.length == 0) {
            console.log("📦 | color=yellow");
            console.log("---");
            console.log(nomeObjeto + "\n");
            console.log("Código: " + code)
            console.log("---");
            console.log("Sem eventos no momento.");            
        }
        else if (nomeObjeto == "" && eventos.length == 0) {
            console.log("📦 | color=yellow");
            console.log("---");
            console.log("Sem eventos no momento."); 
        }
        else if (nomeObjeto != "" && eventos.length > 0) {
            var header = eventos.filter(evento => evento.tipo == "PO")[0];

            console.log("📦 " + eventos.length);
            console.log("---");            
            console.log(nomeObjeto + "\n");
            console.log("Código: " + code);
            console.log('Postado em: ' + (header == undefined ? eventos[0].dataPostagem : header.postagem.datapostagem));

            eventos.forEach(evento => {                
                console.log("---");
                console.log(evento.data + " - " + evento.hora + "\n");                 
                if (evento.tipo == "RO") {            
                    console.log(evento.descricao.trim() + ".\n");                                
                    console.log("De: " + toTitleCase(evento.unidade.tipounidade) + " em " + toTitleCase(evento.unidade.cidade) + "\n");   
                    console.log("Para: " + toTitleCase(evento.destino[0].local) + " em " + toTitleCase(evento.destino[0].cidade));
                } 
                else {
                    console.log(evento.descricao.trim() + ".\n");
                    if (evento.detalhe != undefined) {
                        console.log(evento.detalhe.trim() + ".\n");                                
                    }
                    console.log("De: " + toTitleCase(evento.unidade.tipounidade) + " em " + toTitleCase(evento.unidade.cidade) + "\n"); 
                    if (evento.postagem != undefined) {
                        console.log("Para: " + toTitleCase(evento.postagem.destinatario));
                    }
                }               
            });

            console.log("---");
            console.log("Ver online | href=" + url);            
        }

        refreshMenu();
        aboutMenu();  
    });

})
.on('error', (e) => {
    console.log('✖︎ | color=red');
    console.log('---');
    console.log('Erro ao ler dados do serviço dos Correios.\n' + e);
    refreshMenu();
    aboutMenu();
});
