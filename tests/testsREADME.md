## Guide til Kørsel af Testfiler

For at køre testfiler er der nogle nødvendige trin, som skal følges. Serveren skal ikke køre lokalt samtidigt.

### Installation af Jest
1. Først skal Jest test frameworket installeres som en udviklingsafhængighed. Dette gøres via npm (Node Package Manager) med følgende kommando i terminalen:

```
npm install --save-dev jest
```

2. Evt. opret script i package.json:

```
"scripts": {
  "test": "jest"
}
```

3. Gå til tests mappen i root og kør nedenstående:

```
npm run test
```

4. Vurdér resultater i terminalen.