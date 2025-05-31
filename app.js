const express = require('express'); 
const fs = require('fs'); 
let intrebari=[{}]
let utilizatori=[{}]
produse = [
    { nume: "Jordan Jumpman", pret: 32, stoc: 50},
    { nume: "Jordan Rare Air", pret: 38, stoc: 50 },
    { nume: "Air Jordan 1 Retro High OG", pret:180, stoc:25},
    { nume: "Jordan Air Rev", pret:275, stoc:10}
];
let incercari={};
let incercarilung={};
let incercaritimestamp = {};
let incercaritimestamplung= {};
let banlist={};
fs.readFile('intrebari.json', (err, data) => {
    if (err) throw err;
    intrebari = JSON.parse(data);
});
fs.readFile('utilizatori.json', (err, data) => {
    if (err) throw err;
    utilizatori = JSON.parse(data);
});
const expressLayouts = require('express-ejs-layouts'); 
const bodyParser = require('body-parser') ;
const sqlite3 = require('sqlite3').verbose();
const dbFile = './cumparaturi.db';
const path = require('path');
const app = express(); 
const port = 6789; 
app.set('view engine', 'ejs');
app.use(expressLayouts); 
app.use(express.static('public'))  
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser=require('cookie-parser');
const session = require('express-session');
app.use(cookieParser());
const cors = require('cors');
app.use(cors());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false}));
app.get('/', (req, res) => {
    res.clearCookie('error');
    const dbPath = path.resolve('cumparaturi.db');
    if (!fs.existsSync(dbPath)) 
    {
        res.render('index', {req: req.cookies['username'],  produse: []});
    }
    else
    {
        const db = new sqlite3.Database(dbPath);
        db.all("SELECT * FROM produse", [], (err, rows) => {
            if (err) {
                return res.status(500).send("eroare select");
            }
            if(rows.length >0)
            {
                res.render('index', {req: req.cookies['username'],  produse: rows});
            }
            else
            {
                res.render('index', {req: req.cookies['username'],  produse: []});
            }
        });
        db.close();
    }
}); 
app.get('/chestionar', (req, res) => { 
    res.clearCookie('error');
    res.render('chestionar', {intrebari: intrebari, reqAuth:req.cookies['username']}); 
});  
app.post('/rezultat-chestionar', (req, res) => { 
    res.clearCookie('error');
    res.render('rezultat-chestionar', {intrebari: intrebari, req: req.body, reqAuth:req.cookies['username']}); 
});  
app.get('/autentificare', (req, res) => {
    res.clearCookie('error');
    res.render('autentificare', {req:req.cookies['error'], reqAuth:req.cookies['username']});
});
app.post('/verificare-autentificare', (req, res) => { 
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.cookies["ban"] || banlist[ip]>Date.now() || banlist[req.body.uname]>Date.now())
    {
        res.status(404).send("esti banned temporar");
    }
    else if(req.body.uname=='admin' && req.body.passwd=='admin')
    {
        req.session.user = {
                username: req.body.uname,
            };
        res.cookie('username', req.body.uname, {httpOnly: true, secure: true, sameSite: 'Strict'});   
        res.clearCookie('error');
        return res.redirect(302, '/admin');
    }
    else
    {
        fs.readFile('utilizatori.json', (err, data) => {
            if (err) throw err;
            let utilizatori=JSON.parse(data);
            for (let i = 0; i < utilizatori.length; i++)
            {
                if(req.body.uname==utilizatori[i].username && req.body.passwd==utilizatori[i].username)
                {
                req.session.user = {
                    username: utilizatori[i].uname,
                    nume: utilizatori[i].lname,
                    prenume: utilizatori[i].fname,
                };
                res.cookie('username', req.body.uname, {httpOnly: true, secure: true, sameSite: 'Strict'}); 
                res.clearCookie('error');
                return res.redirect(302, '/');   
                }
        }
        if(!incercaritimestamp[req.body.uname] || incercaritimestamp[req.body.uname]<=Date.now())
        {
            incercari[req.body.uname] = 0;
        }
        if(!incercaritimestamplung[req.body.uname] || incercaritimestamplung[req.body.uname]<=Date.now())
        {
            incercarilung[req.body.uname] = 0;
        }
        if (!incercari[req.body.uname]) 
        {
            incercari[req.body.uname] = 0;
        }
        if (!incercarilung[req.body.uname]) 
        {
            incercarilung[req.body.uname] = 0;
        }
        ++incercari[req.body.uname];
        ++incercarilung[req.body.uname];
        if(incercari[req.body.uname]==1)
        {
            incercaritimestamp[req.body.uname] = Date.now()+60000;
        }
        if(incercarilung[req.body.uname]==1)
        { 
            incercaritimestamplung[req.body.uname] = Date.now()+600000;
        }
        if(incercari[req.body.uname]>=3)
        {
            res.cookie('ban', '10s', {httpOnly: true, maxAge:10000, secure: true, sameSite: 'Strict'});
            banlist[req.body.uname]=Date.now() +10000;
            incercari[req.body.uname]=0;
            return res.status(404).send("esti banned temporar");
        }
        if(incercarilung[req.body.uname]>=10)
        {
            res.cookie('ban', '100s', {httpOnly: true, maxAge:10000, secure: true, sameSite: 'Strict'});
            banlist[req.body.uname]=Date.now() +100000;
            incercarilung[req.body.uname]=0;
            return res.status(404).send("esti banned temporar");
        }
        if(!incercaritimestamp[ip] ||incercaritimestamp[ip]<=Date.now())
        {
            incercari[ip] = 0;
        }
        if(!incercaritimestamplung[ip] ||incercaritimestamplung[ip]<=Date.now())
        {
            incercarilung[ip] = 0;
        }
        if (!incercari[ip]) 
        {
            incercari[ip] = 0;
        }
        if (!incercarilung[ip]) 
        {
            incercarilung[ip] = 0;
        }
        ++incercari[ip];
        ++incercarilung[ip];
        if(incercari[ip]==1)
        {
                incercaritimestamp[ip] = Date.now()+60000;
        }
        if(incercarilung[ip]==1)
        {    
            incercaritimestamplung[ip] = Date.now()+600000;
        }
        if(incercari[ip]>=3)
        {
            res.cookie('ban', '10s', {httpOnly: true, maxAge:10000, secure: true, sameSite: 'Strict'});
            banlist[ip]=Date.now() +10000;
            incercari[ip]=0;
            return res.status(404).send("esti banned temporar");
        }
        if(incercarilung[ip]>=10)
        {
            res.cookie('ban', '100s', {httpOnly: true,  maxAge:10000, secure: true, sameSite: 'Strict'});
            banlist[ip]=Date.now() +100000;
            incercarilung[ip]=0;
            return res.status(404).send("esti banned temporar");
        }
            res.cookie('error', 'eroare input gol sau parola gresita', {httpOnly: true,  secure: true, sameSite: 'Strict'});
            res.redirect(302, '/autentificare');
    })
}});  
app.post('/delogare',async (req, res) => {
    try
    {
        res.clearCookie('username');
        res.clearCookie('error');
        return res.redirect(302, '/');   
    }
    catch(err)
    {
        throw err;
    }
});
app.get('/creare-bd', (req, res) => {
    const dbPath = path.join(__dirname, 'cumparaturi.db');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).send("eroare db");
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS produse (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nume TEXT NOT NULL,
        pret REAL NOT NULL,
        stoc INTEGER NOT NULL
    )`, (err) => {
        db.close();
        if (err) {
            return res.status(500).send("eroare tabel");
        }
        return res.redirect(302, '/');
    });
});
app.get('/inserare-bd', (req, res) => {
    let db = new sqlite3.Database(dbFile);
    let n = produse.length;
    for (let i = 0; i < produse.length; i++) 
    {
    db.get("SELECT COUNT(*) AS count FROM produse WHERE nume = ?", [produse[i].nume], (err, row) => {
        if (err) {
            db.close();
            return res.status(500).send("eroare select");
        }
        if (row.count === 0) {
            const stmt = db.prepare("INSERT OR IGNORE INTO produse (nume, pret, stoc) VALUES (?, ?, ?)", (err) => {
                if (err) {
                    db.close();
                    return res.status(500).send("eroare prepare");
                }
                stmt.run(produse[i].nume, produse[i].pret, produse[i].stoc, (err) => {
                    if (err) {
                        stmt.finalize();
                        db.close();
                        return res.status(500).send("eroare insert");
                    }
                    stmt.finalize((err) => {
                        n--;
                        if (n === 0) {
                            db.close((err) => {
                            if (err) {
                                 return res.status(500).send("eroare close");
                            }
                            return res.redirect(302, '/');
            });}
                    });
                });
            });
        } 
        else 
        {
            n--;            
            if (n === 0) 
            {
                db.close();
                return res.redirect(302, '/'); 
            }
        }})
    }
});
app.post('/stergere-cos', (req, res)=>{
    req.session.cart.splice(req.body.id, 1);
    res.redirect(302, '/vizualizare-cos');
});
app.post('/inserare-admin-bd', (req, res) => {
    const db = new sqlite3.Database(dbFile, (err) => {
        if (err) {
            return res.status(500).send("eroare db");
        }
    });
    db.get("SELECT COUNT(*) AS count FROM produse WHERE nume = ?", [req.body.nume], (err, row) => {
        if (err) {
            db.close();
            return res.status(500).send("eroare select");
        }
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO produse (nume, pret, stoc) VALUES (?, ?, ?)", (err) => {
                if (err) {
                    db.close();
                    return res.status(500).send("eroare prepare");
                }

                stmt.run(req.body.nume, req.body.pret, req.body.stoc, (err) => {
                    if (err) {
                        stmt.finalize();
                        db.close();
                        return res.status(500).send("eroare insert");
                    }

                    stmt.finalize((err) => {
                        db.close();
                        if (err) {
                            return res.status(500).send("eroare finalize");
                        }
                        return res.redirect(302, '/');
                    });
                });
            });
        } 
        else 
        {
            db.close();
            return res.redirect(302, '/'); 
        }
    });
});
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.username === 'admin') {
        return next(); 
    } 
    else
    {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if(req.cookies["ban"] || banlist[ip]>Date.now())
        {
            res.status(404).send("esti banned temporar");
        }
        else
        {
            if (!incercari[ip]) 
            {
                incercari[ip] = 0;
            }
            ++incercari[ip];
            if(incercari[ip]>=3)
            {
                res.cookie('ban', '10s', {httpOnly: true,  maxAge:10000, secure: true, sameSite: 'Strict'});
                banlist[ip]=Date.now() +10000;
                incercari[ip]=0;
                res.status(404).send("esti banned temporar");
            }
            else
            {
                res.status(404).send("404 nu exista.");
            }
        }
    }
}
app.get('/admin', requireAdmin, (req, res)=>{
    res.clearCookie('error');
    res.render('admin', {reqAuth:req.cookies['username']});
});
app.post('/adaugare-cos', (req, res)=>{
    if (!req.session.cart) {
            req.session.cart = [];
    }  
    if (!req.session.quantity) {
        req.session.quantity = {};
    }
    let ok= req.session.cart.includes(req.body.id);
    if(!ok)
    {
        req.session.cart.push(req.body.id);
        req.session.quantity[req.body.id] = 1; 
    }
    else
    {
        req.session.quantity[req.body.id]++;
    }  
    res.redirect(302, '/');
}
);
app.post('/minus', (req, res)=>{
     if (req.session.quantity[req.body.id] > 1) {
        req.session.quantity[req.body.id]--;
    } else {
        if (req.body.id == 0) {
            req.session.cart.splice(req.body.id, 1); 
            delete req.session.quantity[req.body.id];   
        }
    }
    res.redirect(302, '/vizualizare-cos');
}
);
app.post('/plus', (req, res)=>{
    req.session.quantity[req.body.id]++;
    res.redirect(302, '/vizualizare-cos');
}
);
app.get('/vizualizare-cos', (req, res) => { 
    res.clearCookie('error');
    const dbPath = path.resolve('cumparaturi.db');
    const db = new sqlite3.Database(dbPath);
        db.all("SELECT * FROM produse", [], (err, rows) => {
            if (err) {
                return res.status(500).send("eroare select");
            }
            if(rows.length >0)
            {
                res.render('vizualizare-cos', {reqAuth:req.cookies['username'], reqCart:req.session.cart,  reqQuant:req.session.quantity, prod:rows}); 
            }
        db.close();
})
});  
app.use((req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(!incercaritimestamp[ip] ||incercaritimestamp[ip]<=Date.now())
    {
        incercari[ip] = 0;
    }
    if(req.cookies["ban"] || banlist[ip]>Date.now())
    {
        res.status(404).send("esti banned temporar");
    }
    else
    {
        if (!incercari[ip]) 
        {
            incercari[ip] = 0;
        }
        ++incercari[ip];
        if(incercari[ip]==1)
        {
            incercaritimestamp[ip] = Date.now()+60000;
        }
        if(incercari[ip]>=3)
        {
            res.cookie('ban', '10s', {httpOnly: true, maxAge:10000, secure: true, sameSite: 'Strict'});
            banlist[ip]=Date.now() +10000;
            incercari[ip]=0;
            res.status(404).send("esti banned temporar");
        }
        else
        {
            res.status(404).send("404 nu exista.");
        }
    }
});
app.listen(port, () => 
    console.log(`Serverul rulează la adresa http://localhost: :${port}/`
)); 