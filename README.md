# ADBIS
Programmering af enkelt funktion til vores eksamensprojekt i ADBIS





## Forklaring af applikation

Applikationen er en del af et større systemdesign, der bl.a. håndterer booking af mødelokaler, frokostordrehåndtering (samt køkken) og automatisk generering af arbejdsopgaver (for tjenere). Denne del af applikationen håndterer booking og automatiks allokering af mødelokaler, samt generering af gængse opgaver for tjenere baseret på informationer fra ordren.

I root endpointet kan bestillingssiden tilgås. Her kan der indtastes oplysninger til en ordre, hvilket vil blive pushet til et SQLite table. Herefter tjekkes der imod en sammenkædningstabel, hvilket (møde)lokaler, der er tilgængelige indenfor det givne tidsinterval med den rette kapacitet.

Dernæst generes der opgaver, defineret i 

## Guide til at opsætning

Følgende dependencies er nødvændige på lokal pc for at kunne køre applikationen. Alle kan installeres med npm.

- Node
- Git
- SQLite3
- Express


1. Efter dependencies er installeret, startes applikation fra root-folderen via Node i terminalen med "node server.js"
2. Den lokalt hostede servere kan tilgås på localhost:3000, hvor du finder bestillingssiden. 
3

