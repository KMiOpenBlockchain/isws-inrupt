# isws2022-inrupt
 inrupt code library for the ISWS 2022 demonstrator 
 
This is a small library that has functions for the demonstrator to login a person into their Solid pod and read and write files/content from the demonstrator to their pod through [https://broker.pod.inrupt.com](https://broker.pod.inrupt.com).
 
It is based on the Inrupt tutorials on how to login to a Solid pod, [https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-browser/](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-browser/), and how to read/write files to a pod, [https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/).

A compiled copy of this library is included in the isws2022-deomstator code base, but if you wish to modify this code and build your own copy please:

* Download the course code into a local folder.
* Install the node modules for the package:
```
npm install
```
* Modify the source file /src/inruptlib.js
* Rebuild the library - using webpack:

```
npm run build
```
This will result in a new inruptlib.js file being created in a 'dist' folder.

* Copy the distribution libaray file (dist/inruptlib.js) into your web app code base.

