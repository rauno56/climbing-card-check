# Climbing Card Checker

### Configuration

Both env vars are required:

- `SPREADSHEET_ID`: Google Sheet ID used as the database. Can be extracted from a url of the sheet: `https://docs.google.com/spreadsheets/d/< it's here >/edit#gid=0`
- `GOOGLE_KEY`: Credentials to access the Google Sheets API. See below for creating and storing it in Vercel.

To set the sheet ID:

```
npx vercel env add SPREADSHEET_ID <Sheet ID>
```

### Creating credentials for Google Sheets API

In [Google API Console](https://console.developers.google.com/):

1. Enable Google Sheets API;
2. Under "Credentials" create a service account;
3. Under "Keys" of that service account create a new JSON key;
4. Share the Sheet with the `client_email` of that key. Should look something like `service-account-name@youruser.iam.gserviceaccount.com`;
5. Download the key file to `./key.json` of this folder.
6. Run `./update.secrets` to update the secret in Vercel
