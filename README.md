# ADBIS
Programmering af enkelt funktion til vores eksamensprojekt i ADBIS

## Forklaring af applikation

Applikationen er en del af et større systemdesign, der bl.a. håndterer booking af mødelokaler, frokostordrehåndtering (samt køkken) og automatisk generering af arbejdsopgaver (for tjenere). Denne del af applikationen håndterer booking og automatiks allokering af mødelokaler, samt generering af gængse opgaver for tjenere baseret på informationer fra ordren.

I root endpointet kan bestillingssiden tilgås. Her kan der indtastes oplysninger til en ordre, hvilket vil blive pushet til et SQLite table. Herefter tjekkes der imod en associationstabel, hvilket (møde)lokaler, der ikke er bookede inden for det givne tidsinterval, som også har den rette kapacitet.

Dernæst generes der opgaver, defineret i 

## Guide til at opsætning

Følgende dependencies er nødvændige på lokal pc for at kunne køre applikationen. Alle kan installeres med npm.

- Node
- Git
- SQLite3
- Express

1.     Klon repository'et eller download kildekoden.
2.     Åbn en terminal eller kommandoprompt, og naviger til projektmappen.
3.     Kør kommandoen "npm install" for at installere de nødvendige afhængigheder.
4.     Kør kommandoen "node server.js" for at starte serveren.
5.     Åbn en webbrowser, og gå til "http://localhost:3000" eller tryk åp linket i terminalen for at få adgang til applikationen.

## Funktionatlitet

* For at lægge en ordre, indtasten efterspurgte oplysninger.
* Herefter kan man med "Admin Links" i bunden navigere til fx opgaver.
* Da der ikke er inkluderet socket i denne app, skal siden genindlæses for at vise ændringer i databasen.