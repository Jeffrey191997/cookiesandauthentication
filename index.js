const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser")
const port = 3000;
const app = express();
const bcrypt = require("bcrypt");


const connection = mysql.createConnection({
  host: "server2.bsthun.com",
  port: "6105",
  user: "lab_11tlno",
  password: "CvS1YSyOnM5CGJM5",
  database: "lab_todo02_115bwsr"

});



connection.connect();
console.log("Database is connected.");

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/basic/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ? AND password = ?",
		[username, password]
	);
	console.log("DEBUG: /basic/login => " + sql);
	connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows == 0) {
			res.json({
				success: false,
				message: "Login credential is incorrect",
			});
		} else {
			res.json({
				success: true,
				message: "Login credential is correct",
				user: rows[0],
			});
		}
	});
});

app.post("/POST/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ?",
		[username]
	);
	connection.query(sql, [username, password], (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows != 0) {
      bcrypt.compare(password, rows[0].hashed_password).then(function (result) {
        if (result) {
          return res.json({
            success: true,
            message: "Authentication Success"
          });
        } else {
          return res.json({
            success: false,
            message: "Authentication Failed : Wrong Password"
          })
        }
      })
		} else {
			res.json({
				success: false,
				message: "Authentication Failed : There is no user data in database",
			});
		}
	});
});

app.post("/POST/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/i;
    if (!pattern.test(password)) {
        return res.json({
            success: false,
            message:
            "Password must contain at least 8 characters, at least one uppercase, lowercase, and number in the string.",
            });
        } else {
      
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        created_at = date+' '+time;
        updated_at = created_at;
        saltRounds = 10;
        hash = bcrypt.hashSync(password, saltRounds);
        var sql = `INSERT INTO users (username, password, hashed_password, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)`;
        connection.query(sql, [username, password, hash, created_at, updated_at], (err, rows) => {
            if (err) {
            return res.json({
                success: false,
                error: err,
                message: "An error occurred while registering the user.",
            });
            }
            return res.json({
            success: true,
            message: "User registered successfully.",
            });
      });
    }
  });



// Hash 12345678
// const example = async () => {
// 	const salt1 = await bcrypt.genSalt(10);
// 	console.log("Salt #1: ", salt1);
// 	const hash1 = await bcrypt.hash("12345678", salt1);
// 	console.log("Hash #1: ", hash1);

// 	const salt2 = await bcrypt.genSalt(10);
// 	console.log("Salt #2: ", salt2);
// 	const hash2 = await bcrypt.hash("asdf12123", salt1);
// 	console.log("Hash #2: ", hash2);

// 	const valid1 = await bcrypt.compare(
// 		"12345679",
// 		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus2"
// 	);
// 	console.log("Validation #1: ", valid1);

// 	const valid2 = await bcrypt.compare(
// 		"12345679",
// 		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus3" // Modify last charactor a little bit
// 	);
// 	console.log("Validation #2: ", valid2);

// 	const valid3 = await bcrypt.compare(
// 		"asdf12123",
// 		hash2 // Previously hgenerated hash
// 	);
// 	console.log("Validation #3: ", valid3);
// };

// example();


