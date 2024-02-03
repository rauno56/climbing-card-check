# Climbing Card Checker

```bash
git clone git@github.com:rauno56/climbing-card-check.git
npm ci
```

## Configuration

Both env vars are required:

- `SPREADSHEET_ID`: Google Sheet ID used as the database. Can be extracted from a url of the sheet: `https://docs.google.com/spreadsheets/d/< it's here >/edit#gid=0`
- `GOOGLE_KEY`: Credentials to access the Google Sheets API. See below for creating and storing it in Vercel.

## Running

Once your environment is set up you can run it locally or deploy to Vercel. There's abundance of documentation online for latter. Following has some simplifying steps specific to this app.

#### Local environment

Once `.env ` file is set up, run it locally with `npm start`.

#### Deploying to Vercel

Add the two environment vars to Vercel via the UI. And deploy the app with:

```bash
npx vercel
```

## Creating credentials for Google Sheets API

In [Google API Console](https://console.developers.google.com/):

1. Enable Google Sheets API;
2. Under "Credentials" click "Create Credentials" to create a **Service Account** - no optional permissions or role required;
3. Under "Keys" of that service account create a new JSON key;
4. Download the key file to `./key.json` of this folder;
5. To get the base64 encoding of that file run `node scripts/key.to.env.cjs` and store that to your `.env` file;
5. Share the Sheet with the `client_email` of that key. You'll find that in the key file and it should look something like `service-account-name@youruser.iam.gserviceaccount.com`.
