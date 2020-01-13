<h1 style="text-align:center">Zeiterfassung - PWA - Bachelorarbeit</h1>

Progressive Web App am Beispiel einer Zeiterfassungsanwendung

## Testen der Anwendung (online)

Die Progressive Web App ist unter der Adresse [https://zeiterfassung.moritzellmers.de/](https://zeiterfassung.moritzellmers.de/) erreichbar.
Die API läuft unter der Adresse [https://zeiterfassung.moritzellmers.de/api](https://zeiterfassung.moritzellmers.de/api).

Zu Testzwecken wurden bereits folgende Benutzerkonten angelegt und können sofort genutzt werden:
* Terminal - Personalnummer (PN): 2, PIN: 1111
* Demo Admin – PN: 4, PIN: 2222
* Demo Mitarbeiter – PN: 5, PIN: 3333

Sobald man mit dem Terminal Benutzer eingeloggt ist, gibt es keinen Knopf, mit dem man sich abmelden kann. Da jeder Mitarbeiter Zugriff auf das Terminal haben soll
könnte auch jeder Mitarbeiter das Terminal ausloggen, wenn solch ein Knopf existieren würde. Daher gibt es den etwas umständlicheren Weg, bei dem man die Adresse 
[https://zeiterfassung.moritzellmers.de/logout](https://zeiterfassung.moritzellmers.de/logout) aufrufen muss.

## Testen der Anwendung (lokal)

### Vorraussetzungen
* [node.js / npm](https://nodejs.org/en/)
* [mongodb](https://www.mongodb.com/)

(Entwickelt und getestet mit Windows 10)

### Installation und starten der Anwendung
Schritt 1 ist überflüssig, wenn der Quellcode bereits vorliegt (z.B. gezippte Dateien bereits entpackt).

##### 1. Klone das Git-Repository auf deinen PC and wechsel in den Installationsordner
```bash
git clone https://github.com/mellmers/zeiterfassung.git zeiterfassung && cd zeiterfassung
```
  
Schritt 2 ist überflüssig, wenn der Ordner 'node_modules' unterhalb der Verzeichnisse 'backend' und 'frontend' existieren.

##### 2. Installiere alle Abhängigkeiten
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

##### 3. API starten
```bash
cd backend
npm start
```

Beim ersten Start der API sollte folgende Ausgabe im Terminal erscheinen:
```bash
Benutzer Demo Terminal erfolgreich angelegt.
Benutzer Demo Mitarbeiter erfolgreich angelegt.
Benutzer Demo Admin erfolgreich angelegt.
```

Dies bedeutet, dass die Standard-Benutzer angelegt wurden, mit denen man sich sofort einloggen kann und die Anwendung nutzen kann.
Punkt 5 zeigt eine Liste mit Login-Daten für diese Benutzer.

Bei folgenden Starts sollte folgende Ausgabe erscheinen:
```bash
Die Benutzer wurden bereits erstellt.
```

##### 4. PWA starten
```bash
cd frontend
npm run start:development
```

##### 5. Login
Damit man sich sofort und ohne Registrierung (diese Funktion wurde aus Zeitgründen weggelassen) einloggen kann,
werden beim ersten Start der API folgende Benutzer angelegt:
* Terminal - Personalnummer (PN): 1, PIN: 1234
* Demo Admin – PN: 2, PIN: 1234
* Demo Mitarbeiter – PN: 3, PIN: 1234

## Installation auf einem Webserver
Hier wird beschrieben, wie die Anwendung auf einem Webserver installiert werden könnte.
Für lokale Tests ist dies nicht notwendig. Allerdings muss dabei beachtet werden, dass lokal einige
Funktionen wie Installation, Benachrichtigungen oder Standortermittlung nicht funktionieren,
weil der lokale Webserver kein HTTPS kann.

**Klonen und Abhängigkeiten installieren wie in "Installation und starten der Anwendung" beschrieben.**

#### Api starten
Die NodeJS Anwendung muss mit einem Daemon-Prozessmanager (z.B. [PM2](https://pm2.keymetrics.io/)) oder in einem [Linux-screen](https://wiki.ubuntuusers.de/Screen/) gestartet werden. Damit wird garantiert, dass die Anwendung auch bei geschlossener SSH-Verbindung weiterhin aktiv ist.
```bash
cd backend
pm2 start "npm run start" --name zeiterfassung-backend
# Speichert die Liste der aktiven Prozesse, damit diese bei einem Serverneustart geladen werden
pm2 save
```

#### Frontend
Die Dateien für das Frontend müssen erstellt werden und mit einem Apache oder Nginx ausgeliefert werden.
```bash
cd frontend
npm run build
```

#### Apache Konfiguration (Beispiel)
Abschließend wird eine Apache Konfiguration benötigt, um die Dateien korrekt an den Client ausliefern zu können.

Beispiel:
```bash
<VirtualHost *:80>
    ServerAdmin admin@homepage.com

    ServerName  zeiterfassung.de

    ErrorLog /var/log/apache2/zeiterfassung/error.log
    CustomLog /var/log/apache2/zeiterfassung/access.log combined

    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^/?(.*) https://%{SERVER_NAME}/$1 [R,L]

    RewriteCond %{SERVER_NAME} =zeiterfassung.de
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>

<VirtualHost _default_:443>

    SSLEngine on
    Include /etc/letsencrypt/options-ssl-apache.conf

    ServerAdmin admin@homepage.com

    ServerName zeiterfassung.de

    ErrorLog /var/log/apache2/zeiterfassung/error.log
    CustomLog /var/log/apache2/zeiterfassung/access.log combined

    # Frontend - Serve files
    <Directory /path/to/zeiterfassung/frontend/build/folder>
        AllowOverride All
        Require all granted
    </Directory>

    # Backend Proxy
    ProxyPass /api http://localhost:8100/api
    ProxyPassReverse  /api http://localhost:8100/api
    SSLProxyEngine on
    SSLProxyVerify none
    SSLProxyCheckPeerCN off
    SSLProxyCheckPeerName off
    SSLProxyCheckPeerExpire off

    Alias /.well-known/acme-challenge /var/www/html/.well-known/acme-challenge

    SSLCertificateFile /path/to/letsencrypt/fullchain.pem
    SSLCertificateKeyFile /path/to/letsencrypt/privkey.pem
</VirtualHost>
```


## Frameworks, Datenbank und Tools

### Onsen UI
"The most beautiful and efficient way to develop HTML5 hybrid and mobile web apps." <br/>
Visit [Onsen UI](https://onsen.io/) for more details & documentation.

### Preact
"Fast 3kB alternative to React with the same modern API." <br/>
Visit [Preact](https://preactjs.com/) for more configuration & documentation.

### MongoDB
"The database for modern applications" <br/>
Visit [MongoDB](https://www.mongodb.com/) for more details and documentation.

<br />
<br />

### License
This project is licensed under the MIT license, Copyright (c) 2019 [Moritz Ellmers](https://moritzellmers.de). For more information see [LICENSE.md](https://github.com/mellmers/zeiterfassung/blob/master/LICENSE.md).  
