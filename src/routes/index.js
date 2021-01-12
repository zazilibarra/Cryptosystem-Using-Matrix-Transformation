const express = require('express');
const router = express.Router();
const app = express();
const matrix = require('matrix-js');
var fs = require("fs"), PNG = require("pngjs").PNG;

app.set('view engine', 'ejs');


router.get("/", (req, res) => {
    var texto = "Palabras";
    var textASCII = [];
    var mod = 256;
    var A = getMatrix(mod);
    var mA = matrix(A);

    // for (let l of texto) {
    //     textASCII.push(l.charCodeAt(0) % mod);
    // }

    // console.log(textASCII);

    fs.createReadStream("./src/public/img/img2.png")
        .pipe(
            new PNG({
                filterType: 4,
            })
        )
        .on("parsed", function () {

            for (var y = 0; y < this.height; y++) {
                // console.log(`y=${y}`);
                for (var x = 0; x < this.width-6; x += 6) {
                    // console.log(`x=${x}`);
                    var R = [], G = [], B = [];

                    for (var i = 0; i < 6; i++) {
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

                    for (var i = 0; i < 6; i++) {
                        var idx = (this.width * y + (x + i)) << 2;

                        this.data[idx] = resR[i][0] % mod;
                        this.data[idx + 1] = resG[i][0] % mod;
                        this.data[idx + 2] = resB[i][0] % mod;

                        // and reduce opacity
                        //this.data[idx + 3] = this.data[idx + 3] >> 1;
                    }
                }
            }

            this.pack().pipe(fs.createWriteStream("./src/public/img/cifrada.png"));
        });

    res.render("home", {
        A: A
    });
});

function getMatrix(mod) {
    var n = 6;
    var k = 3;
    var t = Math.floor(Math.random() * mod-1) + 1; 
    var s = Math.floor(Math.random() * mod-1) + 1;
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