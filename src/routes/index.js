const express = require('express');
const router = express.Router();
const app = express();
const matrix = require('matrix-js');
var fs = require("fs"), PNG = require("pngjs").PNG;

app.set('view engine', 'ejs');

router.get("/", (req, res) => {
    res.render("home");
});

router.post("/encriptar", (req, res) => {
    var tmp_path = req.files.image.path;
    // Ruta donde colocaremos las imagenes
    var target_path = './src/img/img.png';
    var mod = 256;
    var n = 4;
    var t = Math.floor(Math.random() * mod ) + 1;
    var s = Math.floor(Math.random() * mod ) + 1;
    var A = getMatrix(mod, n, s, t);
    var mA = matrix(A);

    // Comprobamos que el fichero es de tipo imagen
    if (req.files.image.type.indexOf('image') == -1) {
        res.send('El fichero que deseas subir no es una imagen');
    }
    else {
        // Movemos el fichero temporal tmp_path al directorio que hemos elegido en target_path
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // Eliminamos el fichero temporal
            fs.unlink(tmp_path, function () {
                if (err) throw err;

                fs.createReadStream(target_path)
                    .pipe(
                        new PNG({
                            filterType: 4,
                        })
                    )
                    .on("parsed", function () {
                        for (var y = 0; y < this.height; y++) {
                            for (var x = 0; x < this.width; x += n) {
                                var R = [], G = [], B = [];

                                for (var i = 0; i < n; i++) {
                                    var idx = (this.width * y + (x + i)) << 2;

                                    R.push([this.data[idx]]);
                                    G.push([this.data[idx + 1]]);
                                    B.push([this.data[idx + 2]]);
                                }

                                if(R.length < n){
                                    console.log("menos")

                                }

                                R = matrix(R);
                                G = matrix(G);
                                B = matrix(B);

                                var resR = mA.prod(R);
                                var resG = mA.prod(G);
                                var resB = mA.prod(B);

                                for (var i = 0; i < n; i++) {
                                    var idx = (this.width * y + (x + i)) << 2;

                                    this.data[idx] = resR[i][0] % mod;
                                    this.data[idx + 1] = resG[i][0] % mod;
                                    this.data[idx + 2] = resB[i][0] % mod;
                                }
                            }
                        }

                        this.pack().pipe(fs.createWriteStream("./public/cifrada.png"));

                        res.render("result-img", {
                            A: A,
                            img: "/cifrada.png",
                            seed: s,
                            t: t
                        });
                    });
            });
        });
    }
});

router.post("/desencriptar", (req, res) => {
    var tmp_path = req.files.image.path;
    // Ruta donde colocaremos las imagenes
    var target_path = './src/img/img.png';
    var mod = 256;
    var n = 4;
    var s = req.body.seed;
    var t = req.body.t;
    var A = getMatrix(mod, n, s, t);
    var mA = matrix(A);

    // Comprobamos que el fichero es de tipo imagen
    if (req.files.image.type.indexOf('image') == -1) {
        res.send('El fichero que deseas subir no es una imagen');
    }
    else {
        // Movemos el fichero temporal tmp_path al directorio que hemos elegido en target_path
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            // Eliminamos el fichero temporal
            fs.unlink(tmp_path, function () {
                if (err) throw err;

                fs.createReadStream(target_path)
                    .pipe(
                        new PNG({
                            filterType: 4,
                        })
                    )
                    .on("parsed", function () {
                        for (var y = 0; y < this.height; y++) {
                            for (var x = 0; x < this.width - n; x += n) {
                                var R = [], G = [], B = [];

                                for (var i = 0; i < n; i++) {
                                    var idx = (this.width * y + (x + i)) << 2;

                                    R.push([this.data[idx]]);
                                    G.push([this.data[idx + 1]]);
                                    B.push([this.data[idx + 2]]);
                                }

                                R = matrix(R);
                                G = matrix(G);
                                B = matrix(B);

                                var resR = mA.prod(R);
                                var resG = mA.prod(G);
                                var resB = mA.prod(B);

                                for (var i = 0; i < n; i++) {
                                    var idx = (this.width * y + (x + i)) << 2;

                                    this.data[idx] = resR[i][0] % mod;
                                    this.data[idx + 1] = resG[i][0] % mod;
                                    this.data[idx + 2] = resB[i][0] % mod;
                                }
                            }
                        }

                        this.pack().pipe(fs.createWriteStream("./public/descifrada.png"));

                        res.render("result-img", {
                            A: A,
                            img: "/descifrada.png",
                            seed: s,
                            t: t
                        });
                    });
            });
        });
    }
});

router.post("/text", (req, res) => {
    var texto = req.body.text;
    var textEncript = [];
    var mod = 95;
    var n = 4;
    var A = getMatrix(mod, n);
    var mA = matrix(A);

    for (var x = 0; x < texto.length; x += n) {
        var R = [];

        for (var i = 0; i < n; i++) {
            var idx = (n * x) + i;

            R.push([(texto.charCodeAt(idx) - 32) % mod]);
        }
        console.log(R);

        R = matrix(R);

        var resR = mA.prod(R);

        for (var i = 0; i < n; i++) {
            var idx = (n * x) + i;

            textEncript[idx] = R[i][0] % mod;
        }
    }

    res.render("result-text", {
        A: A,
        text: textEncript
    });
});

function getMatrix(mod, n, s, t) {
    var k = 3;
    var a11 = [], a22 = [], a12 = [], a21 = [], I = [], A = [];

    for (let i = 0; i < n / 2; i++) {
        a11[i] = new Array(n / 2);
        a22[i] = new Array(n / 2);
        a12[i] = new Array(n / 2);
        a21[i] = new Array(n / 2);
        I[i] = new Array(n / 2);

        for (let j = 0; j < n / 2; j++) {
            I[i][j] = i == j ? 1 : 0;

            let m = (i) * (n / 2) + (j);
            a11[i][j] = (s * (Math.pow(t, m))) % mod;

            a22[i][j] = mod - a11[i][j];

            a12[i][j] = (k * (I[i][j] - a11[i][j])) % mod;
            if (a12[i][j] < 0)
                a12[i][j] = mod + a12[i][j];

            a21[i][j] = ((1 / k) * (I[i][j] + a11[i][j])) % mod;
            let aux = 1;
            while (a21[i][j] % 1 != 0) {
                a21[i][j] = (((I[i][j] + a11[i][j]) + (mod * aux)) / k) % mod;
                aux++;
            }
        }
    }

    var A11 = matrix(a11);
    var A1 = A11.merge.right(a12);
    A1 = matrix(A1);
    var A21 = matrix(a21);
    var A2 = A21.merge.right(a22);

    A = A1.merge.bottom(A2);

    return A;
}

module.exports = router;