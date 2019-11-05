plotDiv = document.getElementById('graph');
checkbox = document.getElementById("myCheck");
base = 'http://35.238.27.66:3000/tesis/';
//filename = Math.floor((Math.random() * 100000) + 1);
filename = 3333333;
let f1 = document.querySelector("#f1");
let f2 = document.querySelector("#f2");
let constrains = document.querySelector("#constrains");
let domain = document.querySelector("#domain");
let initPoints = document.querySelector("#initPoints");
let puntosTabla = [];

f1.value = '-(25*(x1-2)^2+(x2-2)^2+(x3-1)^2+(x4-4)^2+(x5-1)^2) = z1'
f2.value = 'x1^2+x2^2+x3^2+x4^2+x5^2+x6^2 = z2'
domain.value = 'x1 in [ 0,10]\n'+
'x2 in [ 0,10]\n'+
'x3 in [ 1,5]\n'+
'x4 in [ 0,6]\n'+
'x5 in [ 1,5]\n'+
'x6 in [ 0,10]\n'+
'z1 in [-1e8, 1e8]\n'+
'z2 in [-1e8, 1e8]'
constrains.value = '-(x1+x2-2) <= 0\n'+
'-(-x1-x2+6) <= 0\n'+
'-(x1-x2+2) <= 0\n'+
'-(-x1+3*x2+2) <= 0\n'+
'-(-(x3-3)^2-x4+4) <= 0\n'+
'-((x5-3)^2+x6-4) <= 0'

const Http = new XMLHttpRequest();
const Httpp = new XMLHttpRequest();
const Httppp = new XMLHttpRequest();
const getDatos = base + 'getDatos/' + filename;
const setInstance = base + 'crearInstancia/' + filename;
const setInstanceByName = base + 'crearInstanciaPorNombre/' + filename;
var cont = 0;

function CrearInstancia(tipo) {
    if (tipo == 'pornombre') {
        nombreArchivo = document.getElementById("nombreArchivo").value;
        Httpp.open("POST", setInstanceByName);
        Httpp.setRequestHeader("Content-Type", "application/json");
        let data = {nombreArchivo}
        Httpp.send(JSON.stringify(data));
    }
    else{
        Httpp.open("GET", setInstance);
        Httpp.send();
    }
    Httpp.onreadystatechange = function () {
        if (Httpp.readyState == 4 && Httpp.status == 200) {
            (function (data) {
                //console.log(data);
                Http.open("GET", getDatos);
                Http.send();
                Http.onreadystatechange = function () {
                    if (Http.readyState == 4 && Http.status == 200) {
                        (function (data) {
                            document.cont = 1;
                            array = getData(data);
                            if (array.state) {
                            checkState(array.state);
                                
                            }
                            t1 = array.t1;
                            t2 = array.t2;
                            var trace1 = {
                                x: t1.x,
                                y: t1.y,
                                name: 'Upper Bound',
                                mode: 'lines',
                                type: 'scatter'
                            };
                            var trace2 = {
                                x: t2.x,
                                y: t2.y,
                                name: 'Lower Bound',
                                mode: 'lines',
                                type: 'scatter'
                            };
                            var trace3 = {
                                x: [],
                                y: [],
                                name: 'Points',
                                mode: 'markers',
                                type: 'scatter'
                            };
                            var trace4 = {
                                x: [],
                                y: [],
                                name: 'Selection',
                                mode: 'lines',
                                type: 'scatter'
                            };
                            var trace5 = {
                                x: [],
                                y: [],
                                name: 'Selection2',
                                mode: 'lines',
                                type: 'scatter'
                            };
                            dataTrace = [trace1, trace2, trace3, trace4, trace5];
                            Plotly.plot('graph', dataTrace,
                                {},
                                {
                                    modeBarButtons:
                                        [
                                            ['zoom2d'],
                                            ['zoomIn2d'],
                                            ['zoomOut2d'],
                                            ['autoScale2d'],
                                            ['select2d'],
                                            ['toImage'],
                                            ['pan2d'],
                                            ['toggleHover']
                                        ]
                                }
                            );

                            plotDiv.on('plotly_relayout',
                                function (eventdata) {
                                    console.log(eventdata);
                                    if (eventdata['yaxis.range[1]']) {
                                        let x = [];
                                        let y = [];
                                        x[0] = eventdata['xaxis.range[0]'];
                                        x[1] = eventdata['xaxis.range[1]'];
                                        y[0] = eventdata['yaxis.range[0]'];
                                        y[1] = eventdata['yaxis.range[1]'];
                                        let tipo = "zoom_in"
                                        zonaSeleccionada({ x, y, filename, tipo });
                                    }
                                    if (eventdata['xaxis.autorange']) {
                                        let tipo = "zoom_out"
                                        zonaSeleccionada({ filename, tipo });
                                    }
                                });



                            Number.prototype.between = function (min, max) {
                                return this >= min && this <= max;
                            };


                            Plotly.d3.select(".plotly").on('click', function (d, i) {


                                var e = Plotly.d3.event; e.layerX, e.layerY
                                
                                if(Plotly.d3.event.srcElement == '[object SVGRectElement]'){
                                    let upper = false;

                                    let x = document.getElementById("xvalue").value;
                                    let y = document.getElementById("yvalue").value;

                                    let point = {x:x,y:y};
                                    console.log('enviado =' + point.x,point.y);

                                    let proyectionUpper = searchSegment(point,plotDiv.data[0],'x');
                                    let proyectionUpperY = searchSegment(point,plotDiv.data[0],'y');
                                    console.log('proyextion y');
                                    console.log(proyectionUpperY);
                                    
                                    
                                    let distx = betweenTwoPoints(point,proyectionUpper);
                                    let disty = betweenTwoPoints(point,proyectionUpperY);
                                    console.log(distx,disty);
                                    
                                    if(distx > disty ){
                                        proyectionUpper = proyectionUpperY;
                                    }
                                    console.log('proyectionUpper'+proyectionUpper.x,proyectionUpper.y);
                                    
                                    let proyectionLower = searchSegment(point,plotDiv.data[1]);
                                    console.log('proyectionLower'+proyectionLower.x,proyectionLower.y);

                                    let disY = Math.abs(Math.abs(point.y) - Math.abs(proyectionUpper.y));
                                    let disX = Math.abs(Math.abs(point.x) - Math.abs(proyectionUpper.x));
                                    let axisX = Math.abs(Math.abs(plotDiv.layout.xaxis.range[0]) - Math.abs(plotDiv.layout.xaxis.range[1]));
                                    let axisY = Math.abs(Math.abs(plotDiv.layout.yaxis.range[0]) - Math.abs(plotDiv.layout.yaxis.range[1]));


                                    if(disX < axisX*0.02 && disY < axisY * 0.02)
                                    upper = true;
                                    
                                    console.log(upper);
                                    

                                    if( (proyectionUpper.y > y && proyectionLower.y < y ) || upper){
                                        
                                    if (upper) {
                                        x = proyectionUpper.x;
                                        y = proyectionUpper.y;

                                        addPoint(x, y, 2);
                                        
                                        addPointToList(Math.floor(x * 100) / 100 + ';' + Math.floor(y * 100) / 100);
                                        
                                        Httpp.open("POST", "http://35.238.27.66:3000/tesis/getSolution");
                                        Httpp.setRequestHeader("Content-Type", "application/json");
                                        let data = { x, y, filename };
                                        Httpp.send(JSON.stringify(data));
                                        Httpp.onreadystatechange = function () {
                                            if (Httpp.readyState == 4 && Httpp.status == 200) {
                                                (function (data) {
                                                    console.log('holas');
                                                    
                                                    console.log(data);
                                                })(Httpp.responseText);
                                            }
                                        }
                                    }
                                    else {
                                        addPoint(x, y, 2);
                                        addPointToList(Math.floor(x * 100) / 100 + ';' + Math.floor(y * 100) / 100);

                                        Httpp.open("POST", "http://35.238.27.66:3000/tesis/focus");
                                        Httpp.setRequestHeader("Content-Type", "application/json");
                                        let data = { x, y, filename };
                                        Httpp.send(JSON.stringify(data));
                                        Httpp.onreadystatechange = function () {
                                            if (Httpp.readyState == 4 && Httpp.status == 200) {
                                                (function (data) {
                                                    console.log(data);
                                                })(Httpp.responseText);
                                            }
                                        }
                                    }

                                }
                            }

                            });

                            Plotly.d3.select(".plotly").on('mousemove', function (d, i) {
                                var e = Plotly.d3.event;
                                var bg = document.getElementsByClassName('bg')[0];
                                var x = ((e.layerX - bg.attributes['x'].value) / (bg.attributes['width'].value)) * (plotDiv.layout.xaxis.range[1] - plotDiv.layout.xaxis.range[0]) + plotDiv.layout.xaxis.range[0];
                                var y = ((e.layerY - bg.attributes['y'].value) / (bg.attributes['height'].value)) * (plotDiv.layout.yaxis.range[0] - plotDiv.layout.yaxis.range[1]) + plotDiv.layout.yaxis.range[1]
                                if (x.between(plotDiv.layout.xaxis.range[0], plotDiv.layout.xaxis.range[1]) &&
                                    y.between(plotDiv.layout.yaxis.range[0], plotDiv.layout.yaxis.range[1])) {
                                    document.getElementById("xvalue").value = x;
                                    document.getElementById("yvalue").value = y;

                                }

                            });



                            setInterval(function () {
                                let pause = document.querySelector("#pause");
                                if(!pause.disabled){
                                    Httpp.open("GET", getDatos);
                                Httpp.send();
                                Httpp.onreadystatechange = function () {
                                    if (Httpp.readyState == 4 && Httpp.status == 200) {
                                        (function (data) {
                                            //console.log(data);
                                            array = getData(data);
                                            //document.getElementById("solution").value = array.solution;
                                            t1 = array.t1;
                                            t2 = array.t2;
                                            var updateObj = {
                                                x: [t1.x],
                                                y: [t1.y]
                                            };
                                            Plotly.restyle('graph', updateObj, [0]);
                                            var updateObj = {
                                                x: [t2.x],
                                                y: [t2.y]
                                            };
                                            Plotly.restyle('graph', updateObj, [1]);

                                            //console.log(plotDiv);

                                            // xb = document.getElementById("xb").value
                                            // xt = document.getElementById("xt").value
                                            // yb = document.getElementById("yb").value
                                            // yt = document.getElementById("yt").value
                                            checkState(array.state);
                                            setValues(array.solution);
                                        })(Httpp.responseText);
                                    }
                                }
                                }
                            }, 3000);

                            plotDiv.on('plotly_selected', (eventData) => {
                                console.log(plotDiv.data[3].x);
                                plotDiv.data[3].x = [];
                                plotDiv.data[3].y = [];
                                plotDiv.data[4].x = [];
                                plotDiv.data[4].y = [];

                                //Plotly.d3.selectAll('.select-line,.select-outline-1,.select-outline-2')
                                //.style('stroke', 'red');
                                lines = Plotly.d3.selectAll('.select-line,.select-outline-1,.select-outline-2');

                                //console.log(eventData.range);
                                eventData.range.filename = filename;
                                eventData.range.tipo = "zoom_in";
                                zonaSeleccionada(eventData.range);
                                let x0 = eventData.range.x[0];
                                let x1 = eventData.range.x[1];
                                let y0 = eventData.range.y[0];
                                let y1 = eventData.range.y[1];
                                addPoint(x0, y0, 3);
                                addPoint(x0, y1, 3);
                                addPoint(x1, y1, 3);
                                addPoint(x0, y0, 4);
                                addPoint(x1, y0, 4);
                                addPoint(x1, y1, 4);

                                // document.getElementById("xb").value = eventData.range.x[0];
                                // document.getElementById("xt").value = eventData.range.x[1];
                                // document.getElementById("yb").value = eventData.range.y[0];
                                // document.getElementById("yt").value = eventData.range.y[1];

                            });

                        })(Http.responseText);
                    }
                }
            })(Httpp.responseText);
        }
    }
}


function addPoint(x, y, trace) {
    Plotly.extendTraces(plotDiv, {
        x: [
            [x]
        ],
        y: [
            [y]
        ]
    }, [trace]);
}

function zonaSeleccionada(data) {

    // xmlhttp.open("POST", "http://35.238.27.66:3000/tesis/seleccionarZona");
    // xmlhttp.setRequestHeader("Content-Type", "application/json");
    // xmlhttp.send(JSON.stringify(hola));

    Httppp.open("POST", "http://35.238.27.66:3000/tesis/seleccionarZona");
    Httppp.setRequestHeader("Content-Type", "application/json");
    Httppp.send(JSON.stringify(data));
    Httppp.onreadystatechange = function () {
        if (Httppp.readyState == 4 && Httppp.status == 200) {
            (function (data) {
                console.log(data);
            })(Httppp.responseText);
        }
    }
}


// Http.open("GET", getDatos);
// Http.send();
// Http.onreadystatechange = function () {
//     if (Http.readyState == 4 && Http.status == 200) {
//         (function (data) {
//             document.cont = 1;
//             array = getData(data);
//             t1 = array.t1;
//             t2 = array.t2;
//             Plotly.plot('graph', [{
//                 name: 'Lower Bound',
//                 x: t1.x,
//                 y: t1.y
//             }, {
//                 name: 'Upper Bound',
//                 x: t2.x,
//                 y: t2.y,
//             }])

//             setInterval(function () {
//                 Httpp.open("GET", getDatos);
//                 Httpp.send();
//                 Httpp.onreadystatechange = function () {
//                     if (Httpp.readyState == 4 && Httpp.status == 200) {
//                         (function (data) {
//                             array = getData(data);
//                             t1 = array.t1;
//                             t2 = array.t2;
//                             var updateObj = {
//                                 x: [t1.x],
//                                 y: [t1.y]
//                             };
//                             console.log(updateObj.y);
//                             Plotly.restyle('graph', updateObj, [0]);
//                             var updateObj = {
//                                 x: [t2.x],
//                                 y: [t2.y]
//                             };
//                             Plotly.restyle('graph', updateObj, [1]);
//                         })(Httpp.responseText);
//                     }
//                 }


//             }, 1500);

//         })(Http.responseText);
//     }
// }





function getData(data) {
    a = JSON.parse(data);
    let txt = a.respuesta;
    traces = txt.split('\n');
    trace1 = traces[0].split(',');
    trace2 = traces[1].split(',');
    t1 = limpiar(trace1);
    t2 = limpiar(trace2);
    let solution = a.solution;
    let state = a.state;
    console.log(solution);
    return { t1, t2, solution, state }
}

function limpiar(trace) {
    x = [];
    y = [];
    cont = 0;
    xx = 0;
    yy = 0;
    for (let i = 0; i < trace.length; i++) {
        let text = trace[i];
        text = text.replace('"', '');
        text = text.replace('(', '');
        text = text.replace(')', '');
        text = text.replace('[', '');
        text = text.replace(']', '');
        if (parseFloat(text)) {
            if (cont == 0) {
                x[xx] = parseFloat(text);
                xx++;
                cont = 1;
            }
            else {
                y[yy] = parseFloat(text);
                yy++;
                cont = 0;
            }
        }
    }
    let array = { x, y };
    return array;
}
function comandoEstado(comando) {
    Httpp.open("POST", "http://35.238.27.66:3000/tesis/comando");
    Httpp.setRequestHeader("Content-Type", "application/json");
    let data = { comando, filename };
    Httpp.send(JSON.stringify(data));
    Httpp.onreadystatechange = function () {
        if (Httpp.readyState == 4 && Httpp.status == 200) {
            (function (data) {
                console.log(data);
            })(Httpp.responseText);
        }
    }
}

function addPointToList(point) {
    pointtable = document.getElementById("pointtable");
    newlistitem = document.createElement("li");
    newlistitem.setAttribute("class", "table-row");
    newdiv = document.createElement("div");
    newdiv.setAttribute("class", "col");
    newdiv.innerHTML = point;

    pointtable.appendChild(newlistitem);
    newlistitem.appendChild(newdiv);
}


function fixdown(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
}

function newDivUl(index,data,tipo) {
    pointtable = document.getElementById("pointtable");
    li = pointtable.children[index+1];
      

    if(tipo == 'value'){
        if(li.children[1]){
            li.children[1].innerHTML = data;
        }
        else{
            let newdiv = document.createElement("div");
            newdiv.setAttribute("class", "col");
            newdiv.innerHTML = data;
            li.appendChild(newdiv);
        }
    }
    if(tipo == 'image'){
        if(li.children[2]){
            li.children[2].innerHTML = data;
        }
        else{
            let newdiv = document.createElement("div");
            newdiv.setAttribute("class", "col");
            newdiv.innerHTML = data;
            li.appendChild(newdiv);
        }
    }
    
}

function project( p, a, b ) {
    
    var atob = { x: b.x - a.x, y: b.y - a.y };
    var atop = { x: p.x - a.x, y: p.y - a.y };
    var len = atob.x * atob.x + atob.y * atob.y;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = Math.min( 1, Math.max( 0, dot / len ) );

    dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );
    let point =  {
        x: a.x + atob.x * t,
        y: a.y + atob.y * t
    }
    console.log('point:' + point.x,point.y);
    
    return point;
}

function searchSegment(point,data,dataType){
    
    for (let i = 0; i < data.x.length-1; i++) {
        const a = {x:data.x[i],y:data.y[i]};
        const b = {x:data.x[i+1],y:data.y[i+1]};
        if(dataType == 'x'){
            if(point.x > a.x && point.x < b.x){
                return project(point,a,b);
            }
        }
        else{
            if(point.y < a.y && point.y > b.y){
                return project(point,a,b);
            }
        }
    }
}


function betweenTwoPoints(point1,point2){
    console.log('distancia:');
    
    console.log(point1,point2);
    
    var a = Math.abs(point1.x - point2.x);
    var b = Math.abs(point1.y - point2.y);
    var c = Math.sqrt( a*a + b*b );
    return c;

}

function setValues(array) {
    if(array){
        array = array.split('\n');
        console.log('setvalues');
        console.log(array);
        
        
        for (let i = 0; i < array.length-1; i=i+2) {
            const value = array[i];
            newDivUl(i/2,value,'value');
            const image = array[i+1];
            newDivUl(i/2,image,'image');
        }
    }
}

function checkState(state) {
    let search = document.querySelector("#search");
    let fsearch = document.querySelector("#fsearch");
    let rprecision = document.querySelector("#rpresicion");
    let cont = document.querySelector("#continue");
    let pause = document.querySelector("#pause");
    let finish = document.querySelector("#finish");


    search.classList.remove('actual');
    fsearch.classList.remove('actual');
    rprecision.classList.remove('actual');
    cont.classList.remove('actual');
    pause.classList.remove('actual');
    finish.classList.remove('actual');


    state = state.split(',');
    if (state[0] == 'SEARCH') {
        search.classList.add('actual');
        cont.classList.add('actual');
        rprecision.innerHTML = 'PRESICION: ' + state[1];
    }
    if (state[0] == 'FOCUS_SEARCH') {
        fsearch.classList.add('actual');
        cont.classList.add('actual');
        rprecision.innerHTML = 'PRESICION: ' + state[1];
    }
    if (state[0] == 'REACHED_PRECISION') {
        rprecision.classList.add('actual');
        rprecision.innerHTML = 'REACHED PRECISION: ' + state[1];
    }
    if (state[0] == 'STAND_BY') {
        pause.classList.add('actual');
    }
    if (state[0] == 'FINISHED') {
        finish.classList.add('actual');
        pause.disabled = true;
        cont.disabled = true;
    }
    
    
}





