# Enface biometric authentication (browser widget)

![](https://lh3.googleusercontent.com/C6975GR-Hv9vpPYVvQFUQ2_ywxhfKHnUulJJjqX_9feNEXFnTNdTWqu_s4-tbeCopVc6caNfq7NlMxpzmiGt8GnM0h3n-LUzwTbAgWmReW8YeDthTOWlwKflMJHSxkg4L6t5TOYB860zwmwOq-r8tPBcWj3pkW56CA3Wijv1aZ9p6BAG8nks3Z16EdCTj-CRj7JRyiya5flD5N-tadQxA9PK1_e7gVlrpW57p0mxyEB8pEQ3sltTZ1MZGMBGVMM7DpuSiV-X7nGqN2MB0mxi8d93Ztnt3dGHvKhy5lRI0McBLS8chPSei0Nwjm0QgbpqiMpesGSGVuG6q_o5tcoe27-YCFl5iQFYGqfzo6oFbszv7GGBmH2vqoTadxPupGEiHX_pbJMbVlRkTl_8Bwak1mEnx4IgHrBhyOOyljwX0wATguhBaAEKCDrbTPH8oUXdQJtwB71uR8dVVFJtF9u6vlSAg_WHEzivQFgp8KPoWpuUUJgY9zuYkvSs97sBeEkIKulIHAsIp0RNjg7y3pPiT5Hw41R7ulGBb5WA3SSRkIzbBbVYduMojNgkUkLtwSJMhGn4YyF6ucnPPofqeCKGmRIoz7h3ZiGqyJGZb_cJXxxJ4Tq9g2sVHxqnuQTUP5fFRbeq2vGG22HoFkjhGgNIVchpRNFmYw=w108-h150-no)

Enface offers biometric authorization feature for any websites (or apps) using [Enface application](https://apps.apple.com/us/app/enface/id1464761858 "Enface application") and neural networks face recognition engine. Our authentication process is based on strong cryptographic algorithms combined with biometric user's data.

To enable our solution you should pass the following steps:

- Integrate the [EnfaceAuth library](https://github.com/safead/enface-auth-node "EnfaceAuth library") with your backend.
- Setup frontend widget on your website or application, using instructions below.

## Installation

### npm

```bash
npm i --save enface-auth-widget
```

### yarn

```bash
yarn add enface-auth-widget
```

## Usage

ES2015 module import:
```js
import { EnfaceAuthWidget } from "enface-auth-widget";
```
CommonJS module require:
```js
const { EnfaceAuthWidget } = require("enface-auth-widget");
```

### Initialization:
```js
new EnfaceAuthWidget({

  url: <string>,
  buttonHolderId: <string>
  debug: <boolean> // debug logs

  onUserAuthInfo() {
    // get user's session token, session id, cookie etc.
  },

  onChangeState(isActive, isInitialCheck) {
    // status of biometric signin for current user.
  },

  onAuthorized(token) {
    // user succesfully authorized
  },

  onFailed() {
    // user authorization failed
  },

});
 ```
### EnfaceAuthWidget parameters and callbacks (all functions can be asynchronous):

`url <string>`

Full [EnfaceAuth library](https://github.com/safead/enface-auth-node "EnfaceAuth library") backend URL. If backend mode is "WebSockets", this variable should looks like ws(s)://yourdomain.com:12345, where "12345" is the listening port of EnfaceAuth library. If backend mode is "HTTP/S" this variable should looks like http(s)://yourdomain.com

`buttonHolderId: <string>`

Upon creation Enface Widget will look for the element with corresponding "id" on the page and attach "onClick" handler with biometric actions. If "onUserAuthInfo" callback returns any data (user is currently logged in) - the enable/disable actions will be performed, authorization chain will be started instead.

`onUserAuthInfo(): <string>`

Return current user authorization data (token, session id, cookie etc.) if any. The returned value will be processed in "onUserValidate" callback of [EnfaceAuth library](https://github.com/safead/enface-auth-node "EnfaceAuth library") and must definetly identify the user. If current user is guest, return an empty string, null or nothing at all.

`onChangeState(isActive, isInitialCheck)`

This function is used to determine current state of biometric signin (turned ON/OFF). The only task of this callback is to correctly visualize your interface parts to let the user manipulate biometric signin state - show a button with appropriate caption, checkbox etc. See example below.

`onAuthorized(token)`

This function will be called on successfull user authorization. "onUserTokenByBioId" method of [EnfaceAuth library](https://github.com/safead/enface-auth-node "EnfaceAuth library") should send a valid user session data in incoming "token" variable (token, session id, cookie etc). Javascript should use this data to initialize authorized session for current user.

`onFailed : <string>`

This function will be called on biometric authorization failure. Show any messages or dialogs to notify the user about the failure.

### Here is how EnfaceAuthWidget is integrated at our own React frontend.

We are widely using hooks in the frontend application, so we put "useAuthWidget" at signin page and in the settings component, where the switcher "Turn biometric signin ON/OF" is placed.
```js
export const SignInPage = () => {

  useAuthWidget();

  /* the rest of SignInPage component's code*/
}
```
```js
export const TopBar = () => {

  useAuthWidget();

  /* the rest of TopBar component's code*/
}
```
Here is full "useAuthWidget" hook code:
```js
const useAuthWidget = () => {

  const { history } = useReactRouter();

  useEffect(() => {
    new EnfaceAuthWidget({
      url: 'https://enface-api-server.herokuapp.com',
      buttonHolderId: 'enfaceWidgetButtonHolder',

      onUserAuthInfo() {
        // return current session token
        return sessionStorage.getItem('token');
      },

      onChangeState(isActive, isInitialCheck) {
        // if "isInitialCheck" is true - this is just initialization check and no messages should be shown to the user
        const statusElem = document.getElementById('enfaceWidgetButtonHolder');
        // changing interface elements regarding the biometric state
        statusElem && (statusElem.innerHTML = `${isActive ? 'Disable' : 'Enable'} biometric sign in`);
        isInitialCheck || dialog.show({
          caption: 'Operation succeed',
          message: `Your biometric signin is now ${isActive ? 'enabled' : 'disabled'}`,
          buttons: ['I got it'],
        });
      },

      onAuthorized(token) {
        // use the "token" variable to initialize authorized session
        sessionStorage.setItem('token', token);
        history.push(paths.PATH_ROOT);
      },

      onFailed() {
        dialog.show({
          caption: 'Biometric signin failed',
          message: "We don't know you or biometric signin is turned off in your profile settings. Please sign in using email & password and enable biometric authorization in the members are.",
          buttons: ['I got it'],
        });
      },

    });
  }, []);
};
```
