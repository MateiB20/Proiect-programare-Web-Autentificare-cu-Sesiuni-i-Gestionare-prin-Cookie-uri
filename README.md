Acest proiect presupune crearea unei aplicații web simple care include funcționalități ca:
* Simularea unui sistem de logare pentru utilizatori.
* Simularea unui coș de cumpărături.
* Control acces.
* Bannare.
* Simulare de chestionare.

Tehnologii folosite:
* HTML: pentru crearea structurii paginilor web.
* CSS: pentru stilizarea și aspectul vizual al paginii.
* EJS – motor de template pentru generarea dinamică a paginilor HTML.
* JSON – pentru stocarea locală a datelor legate de utilizatori.

Funcționalități principale:
* Simulare logare: Utilizatoriise pot loga la un cont existent. Datele utilizatorilor sunt validate pentru a preveni introducerea incorectă de informații care nu apar în JSON-ul cu conturi.
* Coș de cumpărături: Utilizatorii pot alege din produsele din baza de date și le pot adăuga în coș. Fiecare produs va avea o opțiune de adăugare, iar coșul va afișa produsele adăugate împreună cu cantitatea în /vizualizare-cos.
* Adminul poate adăuga produse noi
* Control acces + middleware
  * Accesul la rute legate de coș este permis doar dacă utilizatorul este logat.
  * Dacă utilizatorul încearcă să acceseze o pagină care nu există → pagina de Eroare 404 (renderizată cu EJS).  
  * Dacă utilizatorul încearcă să acceseze o resursă protejată (ex: panou admin) fără permisiuni → mesaj.
      * Middleware care verifică dacă username-ul și parola sunt corecte
* Bannare IP / username
  * Dacă un utilizator face 3 încercări eșuate de login într-un minut/ 10 în 10 minute → blocare temporară  pe acel IP/username 
  * Bannarea se stochează într-un cookie și local (memorie server).
  Simulare chestionar + primire notă
* Pagina de chestionar (disponibilă și pentru utilizatori nelogați).
  * Întrebări afișate dintr-un fișier JSON (renderizate cu EJS).
  * La trimiterea răspunsurilor, se calculează nota și se afișează un mesaj (cu EJS).

Acest proiect reprezintă o aplicație web care simulează funcționalități esențiale ale unei platforme de e-commerce, punând accent pe autentificare, controlul accesului și gestionarea coșului de cumpărături. Proiectul include și măsuri de securitate de bază, precum protecția împotriva atacurilor de tip XSS (Cross-Site Scripting), prin escaparea datelor afișate în paginile generate cu EJS, și protecția împotriva SQL Injection, prin utilizarea de interogări parametrizate (prepared statements). De asemenea, proiectul implementează bune practici de securitate la nivel de sesiune, folosind cookie-uri cu atribute HttpOnly, Secure și SameSite.
