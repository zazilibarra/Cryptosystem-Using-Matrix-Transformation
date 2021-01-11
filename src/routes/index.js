const express = require('express');
const router = express.Router();
const app = express();
const matrix = require('matrix-js');
var fs = require("fs"), PNG = require("pngjs").PNG;

app.set('view engine', 'ejs');

router.get("/", (req, res) => {
    var a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    var A = matrix(a);

    fs.createReadStream("./src/public/img/images.png")
        .pipe(
            new PNG({
                filterType: 4,
            })
        )
        .on("parsed", function () {
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var idx = (this.width * y + x) << 2;

                    // invert color
                    this.data[idx] = 255 - this.data[idx];
                    this.data[idx + 1] = 255 - this.data[idx + 1];
                    this.data[idx + 2] = 255 - this.data[idx + 2];

                    // and reduce opacity
                    this.data[idx + 3] = this.data[idx + 3] >> 1;
                }
            }

            this.pack().pipe(fs.createWriteStream("out.png"));
        });

    res.render("home", { data: a });
});

module.exports = router;