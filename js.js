plotDiv = document.getElementById('graph');
var lg = document.getElementById("lolo");
var crearInstanciaButton = document.getElementById("crearInstanciaButton");
function loggerDiv(text) {
    var now = new Date();
    // let string = now.getHours()+':'+now.getMinutes()+':'+now.getMilliseconds();
    let string = now.toTimeString();
    string = string.split(' ')[0];

    lg.innerHTML += `<div> <b>${text}</b> <i> at ${string} </i> </div>`;
    lg.scrollTop = lg.scrollHeight;
}
var paused = false;
var auxiliarEstado = false;
var auxRPM = {};
debug = document.getElementById("debug");
random = document.getElementById("random");
loadFile = document.getElementById("loadFile");
var maxf1 = document.getElementById("maxf1");
var maxf2 = document.getElementById("maxf2");
base = 'http://158.251.88.197:3000/tesis/';
//filename = Math.floor((Math.random() * 100000) + 1);
var filename = 123123;
var f1 = document.querySelector("#f1");
var f2 = document.querySelector("#f2");
let constrains = document.querySelector("#constrains");
let domain = document.querySelector("#domain");
let initPoints = document.querySelector("#initPoints");
let puntosTabla = [];
var getDatos = '';
var pausaInmediata = false;
f1.value = '-(25*(x1-2)^2+(x2-2)^2+(x3-1)^2+(x4-4)^2+(x5-1)^2)'
f2.value = 'x1^2+x2^2+x3^2+x4^2+x5^2+x6^2'
domain.value = 'x1 in [ 0,10];\n' +
    'x2 in [ 0,10];\n' +
    'x3 in [ 1,5];\n' +
    'x4 in [ 0,6];\n' +
    'x5 in [ 1,5];\n' +
    'x6 in [ 0,10];\n' +
    'z1 in [-1e8, 1e8];\n' +
    'z2 in [-1e8, 1e8];'
constrains.value = '-(x1+x2-2) <= 0;\n' +
    '-(-x1-x2+6) <= 0;\n' +
    '-(x1-x2+2) <= 0;\n' +
    '-(-x1+3*x2+2) <= 0;\n' +
    '-(-(x3-3)^2-x4+4) <= 0;\n' +
    '-((x5-3)^2+x6-4) <= 0;'

const Http = new XMLHttpRequest();
const Httpp = new XMLHttpRequest();
const Httppp = new XMLHttpRequest();
var setInstance = '';
var setInstanceByName = '';
var cont = 0;

function concatInstance() {
    let string = "";
    string += 'constants\n\n';
    string += 'variables\n' + domain.value + '\n';
    if (maxf1.checked) {
        f1.value = '-(' + f1.value + ')';
    }
    if (maxf2.checked) {
        f2.value = '-(' + f2.value + ')';
    }
    string += 'constraints\n' + f1.value + ' = z1;\n' + f2.value + ' = z2;\n' + constrains.value + '\nend'
    //console.log(string);
    return string;
}


function setULRS() {
    getDatos = base + 'getDatos/' + filename
    setInstance = base + 'crearInstancia/' + filename;
    setInstanceByName = base + 'crearInstanciaPorNombre/' + filename;
    document.getElementById('download').setAttribute('href', base + 'download/' + filename + '/' + filename);
}

function CrearInstancia(tipo) {
    crearInstanciaButton.disabled = true;
    continuarBien('SEARCH');
    if (random.checked) {
        filename = Math.floor((Math.random() * 1000000) + 1);
    }
    else {
        filename = document.querySelector("#filenameinput").value;
    }
    console.log('Instance name: ' + filename);
    loggerDiv('Creating instance...')

    setULRS();

    console.log(filename);

    if (!debug.checked) {
        if (tipo == 'pornombre') {
            nombreArchivo = document.getElementById("nombreArchivo").value;
            Httpp.open("POST", setInstanceByName);
            Httpp.setRequestHeader("Content-Type", "application/json");
            let data = { nombreArchivo }
            Httpp.send(JSON.stringify(data));
        }
        else {
            string = concatInstance();
            //console.log(string);
            Httpp.open("POST", setInstance);
            Httpp.setRequestHeader("Content-Type", "application/json");
            Httpp.send(JSON.stringify({ string }));
        }
        var aux = false;
        Httpp.onreadystatechange = function () {
            if (Httpp.readyState == 4 && Httpp.status == 200) {
                (function (data) {
                    //console.log("mal");
                    getDatosIniciales();
                    aux = true;
                    crearInstanciaButton.disabled = false;
                })(Httpp.responseText);
                
            }
            console.log(Httpp.status);
            if (Httpp.status == 0 && !aux) {
                loggerDiv('Api is Offline');
                crearInstanciaButton.disabled = false;
            }
        }
    }
    else {
        getDatosIniciales();
    }


}

function test() {
    concatInstance();
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

async function zonaSeleccionada(data) {

    console.log(data);
    comandoEstado('continue');
    Httppp.open("POST", "http://158.251.88.197:3000/tesis/seleccionarZona");
    Httppp.setRequestHeader("Content-Type", "application/json");
    Httppp.send(JSON.stringify(data));
    Httppp.onreadystatechange = function () {
        if (Httppp.readyState == 4 && Httppp.status == 200) {
            (function (data) {
                let message = JSON.parse(data);
                console.log(message);
                loggerDiv(message.message);
            })(Httppp.responseText);
        }
    }
}

function save() {

    comandoEstado('save');

    setTimeout(() => {
        document.getElementById('download').click();
    }, 1000);
}



function getData(data) {
    //console.log(data);

    a = JSON.parse(data);
    let txt = a.respuesta;
    //console.log(txt);

    traces = txt.split('\n');
    traces[1] = traces[1].replace('"', '');
    traces[1] = traces[1].replace('(', '');
    traces[1] = traces[1].replace(')', '');
    traces[1] = traces[1].replace('[', '');
    traces[1] = traces[1].replace(']', '');
    //console.log(traces[1]);
    trace1 = traces[0].split(',');
    trace2 = traces[1].split(',');
    //console.log(traces[0]);

    t1 = limpiarUpper(trace1);
    t2 = limpiar(trace2);
    // console.log(t2);
    // console.log(t1);
    let solution = a.solution;
    let state = a.state;
    //console.log(solution);
    return { t1, t2, solution, state }
}

function limpiarUpper(trace) {
    trace = trace.slice(0, -2);
    x = [];
    y = [];
    sol = [];
    cont = 0;
    for (let i = 0; i < trace.length; i++) {
        const text = trace[i];


        aux = text.split('_');
        sol[i] = aux[1];


        aux[0] = aux[0].replace('"', '');
        aux[0] = aux[0].replace('(', '');
        aux[0] = aux[0].replace(')', '');
        aux[0] = aux[0].replace('[', '');
        aux[0] = aux[0].replace(']', '');
        point = aux[0].split(';');

        if (parseFloat(point[0]) || parseFloat(point[0]) == 0) {
            if (maxf1.checked) {
                x[i] = parseFloat(point[0]) * -1;
            } else {
                x[i] = parseFloat(point[0]);
            }

        }
        if (parseFloat(point[1]) || parseFloat(point[1]) == 0) {
            if (maxf2.checked) {
                y[i] = parseFloat(point[1]) * -1;
            } else {
                y[i] = parseFloat(point[1]);
            }
        }
    }
    let array = { x, y, sol }
    //console.log(array);
    return array;
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

        if (parseFloat(text) || parseFloat(text) == 0) {
            // console.log(i,text);
            // console.log('parsed:'+ parseFloat(text));
            if (cont == 0) {
                if (maxf1.checked) {
                    x[xx] = parseFloat(text) * -1;
                } else {
                    x[xx] = parseFloat(text);
                }
                xx++;
                cont = 1;
            }
            else {
                if (maxf2.checked) {
                    y[yy] = parseFloat(text) * -1;
                } else {
                    y[yy] = parseFloat(text);
                }
                yy++;
                cont = 0;
            }
        }
    }
    let array = { x, y };
    return array;
}

function continuarBien(string) {
    pausaInmediata = false;
    checkState(string + ',AUX');
    auxiliarEstado = true;
}
function comandoEstado(comando) {

    if (comando == 'pause') {
        pausaInmediata = true;
        paused = true;
        checkState('STAND_BY,AUX');
    }
    if (comando == 'continue' || comando == 'rpm_stop') {
        continuarBien('SEARCH');
    }
    if (comando == 'finish') {
        pausaInmediata = false;
        checkState('FINISHED,AUX');
        setTimeout(function () {
            pausaInmediata = true;
        }, 7000);
    }

    Httpp.open("POST", "http://158.251.88.197:3000/tesis/comando");
    Httpp.setRequestHeader("Content-Type", "application/json");
    let data = { comando, filename };
    Httpp.send(JSON.stringify(data));
    Httpp.onreadystatechange = function () {
        if (Httpp.readyState == 4 && Httpp.status == 200) {
            (function (data) {
                let message = JSON.parse(data);
                console.log(message);
                loggerDiv(message.message);


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

function newDivUl(index, data, tipo) {
    pointtable = document.getElementById("pointtable");
    li = pointtable.children[index];
    //console.log(pointtable, li);



    if (tipo == 'value') {
        if (li.children[1]) {
            li.children[1].innerHTML = data;
        }
        else {
            let newdiv = document.createElement("div");
            newdiv.setAttribute("class", "col");
            newdiv.innerHTML = data;
            li.appendChild(newdiv);
        }
    }
    if (tipo == 'image') {
        if (li.children[1]) {
            li.children[1].innerHTML = data;
        }
        else {
            let newdiv = document.createElement("div");
            newdiv.setAttribute("class", "col");
            newdiv.innerHTML = data;
            li.appendChild(newdiv);
        }
    }

}

function project(p, a, b) {

    var atob = { x: b.x - a.x, y: b.y - a.y };
    var atop = { x: p.x - a.x, y: p.y - a.y };
    var len = atob.x * atob.x + atob.y * atob.y;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = Math.min(1, Math.max(0, dot / len));

    dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    let point = {
        x: a.x + atob.x * t,
        y: a.y + atob.y * t
    }
    //console.log('point:' + point.x,point.y);

    return point;
}

function searchSegment(point, data, dataType) {

    for (let i = 0; i < data.x.length - 1; i++) {
        const a = { x: data.x[i], y: data.y[i] };
        const b = { x: data.x[i + 1], y: data.y[i + 1] };
        point.x = parseFloat(point.x);
        point.y = parseFloat(point.y);

        if (dataType == 'x') {
            if (maxf1.checked) {
                if (point.x < a.x && point.x > b.x) {
                    return project(point, a, b);
                }
            }
            if ((!maxf2.checked) || (!maxf2.checked && !maxf1.checked)) {
                if (point.x > a.x && point.x < b.x) {
                    return project(point, a, b);
                }
            }

        }
        else {
            if (point.y < a.y && point.y > b.y) {
                return project(point, a, b);
            }
        }
    }
}


function betweenTwoPoints(point1, point2) {
    //console.log('distancia:');

    //console.log(point1, point2);

    var a = Math.abs(point1.x - point2.x);
    var b = Math.abs(point1.y - point2.y);
    var c = Math.sqrt(a * a + b * b);
    return c;

}

function setValues(array) {
    if (array) {
        pointtable = document.getElementById("pointtable");
        //console.log(pointtable);

        array = array.replace('"', '')
        array = array.split('\n');
        array.splice(array.length - 1, 1);
        // console.log('setvalues');
        // console.log(array);
        // console.log(puntosTabla);
        for (let i = 0; i < array.length - 2; i = i + 3) {
            let point = array[i];
            for (let j = 0; j < puntosTabla.length; j++) {
                let point1 = puntosTabla[j].x + ' ' + puntosTabla[j].y;
                if (point == point1) {
                    let value = array[i + 1];
                    newDivUl(j, value, 'value');
                    let image = array[i + 2];
                    newDivUl(j, image, 'image');
                }
            }
        }
    }
}

function checkState(state) {
    //console.log(state);
    if (!auxiliarEstado) {
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

        paused = false;
        state = state.split(',');
        if (state[0] == 'SEARCH') {
            search.classList.add('actual');
            cont.classList.add('actual');
            rprecision.innerHTML = 'PRECISION: ' + state[1];
        }
        if (state[0] == 'RPM') {
            fsearch.classList.add('actual');
            cont.classList.add('actual');
            rprecision.innerHTML = 'PRECISION: ' + state[1];
        }
        if (state[0] == 'REACHED_PRECISION') {
            rprecision.classList.add('actual');
            rprecision.innerHTML = 'REACHED PRECISION: ' + state[1];
            paused = true;
        }
        if (state[0] == 'STAND_BY') {
            pause.classList.add('actual');
            paused = true;
        }
        if (state[0] == 'FINISHED') {
            finish.classList.add('actual');
            pause.disabled = true;
            cont.disabled = true;
            paused = true;
        }
    }
    else {
        auxiliarEstado = false;
    }





}

function load() {
    let files = loadFile.files
    //console.log(files);
}

function getDatosIniciales() {
    setULRS();
    Http.open("GET", getDatos);
    //console.log(getDatos);

    Http.send();
    Http.onreadystatechange = function () {
        var auxGetDatos = false;
        if (Http.readyState == 4 && Http.status == 200) {
            (function (data) {
                //console.log("datafromgetdatos",data);
                auxGetDatos = true;
                array = getData(data);
                document.cont = 1;
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
                    text: t1.sol,
                    type: 'scatter',
                    hoverinfo: "x+y+text"
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
                layout = {
                    hovermode: 'closest',
                    title: 'Graph',

                };
                Plotly.plot('graph', dataTrace,
                    {},
                    {
                        modeBarButtons:
                            [
                                ['zoom2d'],
                                ['select2d'],
                                ['autoScale2d'],
                                ['pan2d'],
                                ['hoverCompareCartesian'],
                                ['hoverClosestCartesian']
                            ]
                    }
                );
                loggerDiv('Done')
                plotDiv.on('plotly_relayout',
                    function (eventdata) {
                        //console.log(eventdata);
                        if (eventdata['yaxis.range[1]']) {
                            let x = [];
                            let y = [];
                            if (maxf1.checked) {
                                x[0] = eventdata['xaxis.range[0]'] * -1;
                                x[1] = eventdata['xaxis.range[1]'] * -1;
                                let aux = 0;
                                if (x[0] > x[1]) {
                                    aux = x[0];
                                    x[0] = x[1];
                                    x[1] = aux;
                                }
                            } else {
                                x[0] = eventdata['xaxis.range[0]'];
                                x[1] = eventdata['xaxis.range[1]'];
                            }
                            if (maxf2.checked) {
                                y[0] = eventdata['yaxis.range[0]'] * -1;
                                y[1] = eventdata['yaxis.range[1]'] * -1;
                                let aux = 0;
                                if (y[0] > y[1]) {
                                    aux = y[0];
                                    y[0] = y[1];
                                    y[1] = aux;
                                }
                            } else {
                                y[0] = eventdata['yaxis.range[0]'];
                                y[1] = eventdata['yaxis.range[1]'];
                            }

                            let tipo = "zoom_in"
                            let polygon = [[x[0], y[0]], [x[0], y[1]], [x[1], y[1]], [x[1], y[0]]]
                            if (auxRPM.x && auxRPM.y) {
                                if (!inside([auxRPM.x, auxRPM.y], polygon)) {
                                    zonaSeleccionada({ x, y, filename, tipo });
                                    continuarBien('SEARCH');
                                    auxRPM = {};
                                }
                            }
                            else {
                                zonaSeleccionada({ x, y, filename, tipo });
                                continuarBien('SEARCH')
                            }
                        }
                        if (eventdata['xaxis.autorange']) {
                            let tipo = "zoom_out"
                            continuarBien('SEARCH');
                            zonaSeleccionada({ filename, tipo });
                        }
                    });



                Number.prototype.between = function (min, max) {
                    return this >= min && this <= max;
                };


                Plotly.d3.select(".plotly").on('click', function (d, i) {


                    if (paused) {

                        var e = Plotly.d3.event; e.layerX, e.layerY

                        if (Plotly.d3.event.srcElement == '[object SVGRectElement]') {
                            let upper = false;

                            let x = document.getElementById("xvalue").value;
                            let y = document.getElementById("yvalue").value;

                            let point = { x: x, y: y };
                            //console.log('enviado =', point.x, point.y);
                            //console.log(plotDiv.data[0]);


                            let proyectionUpper = searchSegment(point, plotDiv.data[0], 'x');
                            //let proyectionUpperY = searchSegment(point, plotDiv.data[0], 'y');
                            //console.log('proyextion y');
                            //console.log(proyectionUpperY);


                            // let distx = betweenTwoPoints(point,proyectionUpper);
                            // let disty = betweenTwoPoints(point,proyectionUpperY);
                            // //console.log(distx,disty);

                            // if(distx > disty ){
                            //     proyectionUpper = proyectionUpperY;
                            // }
                            console.log('proyectionUpper' + proyectionUpper.x, proyectionUpper.y);

                            let proyectionLower = searchSegment(point, plotDiv.data[1], 'x');
                            console.log('proyectionLower' + proyectionLower.x, proyectionLower.y);
                            console.log('point:' + x, y);

                            let pointFromUpper = getPointFromUpper(x, y, plotDiv.data[0]);

                            let disY = Math.abs(Math.abs(point.y) - Math.abs(proyectionUpper.y));
                            let disX = Math.abs(Math.abs(point.x) - Math.abs(proyectionUpper.x));
                            let axisX = Math.abs(Math.abs(plotDiv.layout.xaxis.range[0]) - Math.abs(plotDiv.layout.xaxis.range[1]));
                            let axisY = Math.abs(Math.abs(plotDiv.layout.yaxis.range[0]) - Math.abs(plotDiv.layout.yaxis.range[1]));

                            // if (disX < axisX * 0.02 && disY < axisY * 0.02)
                            //     upper = true;
                            if (axisX > axisY) {
                                if (axisX * 0.01 > pointFromUpper.lowerDistance)
                                    upper = true;
                                //console.log(upper);

                            }
                            else {
                                if (axisY * 0.01 > pointFromUpper.lowerDistance)
                                    upper = true;
                                //console.log(upper);

                            }


                            if (maxf2.checked) {
                                let aux = proyectionUpper;
                                proyectionUpper = proyectionLower;
                                proyectionLower = aux;
                            }
                            if ((proyectionUpper.y > y && proyectionLower.y < y) || upper) {

                                if (upper) {
                                    if (pointFromUpper.image != '()') {
                                        addPoint(pointFromUpper.x, pointFromUpper.y, 2);
                                        let xx = pointFromUpper.x;
                                        let yy = pointFromUpper.y;

                                        addPointToList(Math.floor(xx * 100) / 100 + ';' + Math.floor(yy * 100) / 100);
                                        newDivUl(puntosTabla.push({ xx, yy }), pointFromUpper.image, 'image');
                                    }
                                }
                                else {
                                    addPoint(x, y, 2);
                                    puntosTabla.push({ x, y });
                                    addPointToList(Math.floor(x * 100) / 100 + ';' + Math.floor(y * 100) / 100);


                                    Httpp.open("POST", "http://158.251.88.197:3000/tesis/focus");
                                    Httpp.setRequestHeader("Content-Type", "application/json");
                                    let data = { x, y, filename };
                                    Httpp.send(JSON.stringify(data));
                                    Httpp.onreadystatechange = function () {
                                        if (Httpp.readyState == 4 && Httpp.status == 200) {
                                            (function (data) {
                                                //console.log(data);
                                                continuarBien('RPM');
                                                auxRPM.x = x;
                                                auxRPM.y = y;
                                                let message = JSON.parse(data);
                                                console.log(message);
                                                loggerDiv(message.message);
                                            })(Httpp.responseText);
                                        }
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

                    if (!pausaInmediata) {
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
                                        y: [t1.y],
                                        text: [t1.sol]
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
                                    if (array.state) {
                                        checkState(array.state);
                                    }
                                    setValues(array.solution);
                                })(Httpp.responseText);
                            }
                        }
                    }
                }, 1500);

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
        if (Http.status == 0 && !auxGetDatos) {
            loggerDiv('Api is Offline');
        }
    }
}

function inside(point, vs) {

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function getPointFromUpper(x, y, data) {
    let lowerDistance = 99999999;
    let point = {};
    for (let i = 0; i < data.x.length; i++) {
        const xx = data.x[i];
        const yy = data.y[i];
        let dist = Math.hypot(Math.abs(x) - Math.abs(xx), Math.abs(y) - Math.abs(yy));
        if (dist < lowerDistance) {
            lowerDistance = dist;
            point.lowerDistance = dist;
            point.x = xx;
            point.y = yy;
            point.image = data.text[i];
        }
    }
    return point;
}






