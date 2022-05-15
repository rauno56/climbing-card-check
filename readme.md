# Checker

### Creating credentials for Google Sheets API

In [Google API Console](https://console.developers.google.com/):

1. Enable Google Sheets API;
2. Under "Credentials" create a service account;
3. Under "Keys" of that service account create a new JSON key;
4. Share the Sheet with the `client_email` of that key. Should look something like `service-account-name@youruser.iam.gserviceaccount.com`;
5. Download the key file to `./key.json` of this folder.
