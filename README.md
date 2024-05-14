# ADBIS
Programmering af enkelt funktion til vores eksamensprojekt i ADBIS

## Forklaring af applikation

Applikationen er en del af et større systemdesign, der bl.a. håndterer booking af mødelokaler, ordrehåndtering (samt køkken) og automatisk generering af arbejdsopgaver (for tjenere). Denne del af applikationen håndterer booking, allokering af mødelokaler, samt generering af gængse opgaver for tjenere baseret på informationer fra ordren og angivent tidsforbrug.

I root endpointet kan bestillingssiden tilgås. Her kan der indtastes oplysninger til en ordre, hvilket vil blive indsat i en SQLite table. Herefter tjekkes der imod en associationstabel, hvilket (møde)lokaler, der ikke er bookede inden for det givne tidsinterval, som også har den rette kapacitet. Hertil oprettes opgaver til tjenerne, der kan markeres færdige på "/tasks", ved at trykke på checkboxene (cirklerne) eller swipe dem til siden.

## Guide til at opsætning

Følgende dependencies er nødvændige for at kunne køre applikationen. Alle kan installeres med npm.

- Node
- Git
- SQLite3
- Express

1.     Klon repository'et eller download kildekoden.
2.     Åbn en terminal eller kommandoprompt, og naviger til projektmappen.
3.     Kør kommandoen "npm install" for at installere de nødvendige afhængigheder.
4.     Kør kommandoen "node server.js" for at starte serveren.
5.     Åbn en webbrowser, og gå til "http://localhost:3000" eller tryk på linket i terminalen for at få adgang til applikationen.

## Funktionatlitet

* For at lægge en ordre, indtasten efterspurgte oplysninger på "http://localhost:3000/" og der trkkes på "Opret ordre".
* Herefter kan man med "Admin Links" i menuen i navigationsbjælken og se generet information på diverse endpoints.
* Da der ikke er inkluderet socket i denne app, skal andre endpoints genindlæses for at vise ændringer i databasen, som hvis du fx placerer en ny ordre.

## OBS
* Databasen kan blive fyldt op, hvis der ikke er flere ledige lokaler for dagen. Hvis det er tilfældet, så uncomment nedenstående linjer i "root/sql/create_tables.sql" (fjern de 2 streger ved hver linje eller marker teksten og brug "ctrl + k + u") og genstart server.js. Det sletter alle tabeller ved genstart.

```
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS rooms;
-- DROP TABLE IF EXISTS orderRoom;
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS orderTasks;
```