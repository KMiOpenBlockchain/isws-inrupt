# isws-inrupt
 
This is a small library that has functions for the demonstrator to login a person into their Solid pod and read and write files/content from the demonstrator to their pod through [https://broker.pod.inrupt.com](https://broker.pod.inrupt.com). 

(UPDATE: broker.pod.inrupt.com stopped working with a CORS error - noticed on 12th Oct 2022. This library has now been changed to have the oidc issuer info passed down into the login function, rather than have it be hardcoded in the code base as it was for the ISWS 2022 demo. This makes it more generically useful for us and we are using it in other demos we are playing with, with a different webid/pod provider.)
 
It is based on the Inrupt tutorials on how to login to a Solid pod, [https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-browser/](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-browser/), and how to read/write files to a pod, [https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/).

To modify this code and build your own libary file instance please:

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

* Copy the distribution library file (dist/inruptlib.js) into your web app code base. There will be an 'Inrupt' object exported that you can then reference in your main webpage javascript code to call the methods of this libaray.

## Main Library methods used by ISWS 2022/2023 Demonstrators 

The login function currently takes four paramenters, the fourth being an optional handler function it will call, before returning to the redirect page.

```
function startSolidLogin(oidcIssuerUrl, clientNameString, redirectURL, handler) 
```

Example Use:
```
Inrupt.startSolidLogin(oidcIssuerUrl, "ISWS Summer School Demo - 2023", window.location.href);
```

This function will call back to the passed redirectURL, usually the page it is called from, and be picked up by the function 'finishSolidLogin()', which it expects to find on the redirect page.

***
```
Inrupt.readFileFromPod(fileURL)
```
Code snippet example:
```
const fileURL = document.getElementById("validateRDFInputURL").value;
const file = await Inrupt.readFileFromPod(fileURL);
let reader = new FileReader();
reader.readAsText(file);
reader.onload = function() {
  const inputarea = document.getElementById('validateRDFInputArea');
  inputarea.value = reader.result;
};
```

***
```
writeFileToPod(file, targetFileURL)
```
Code snippet example:

From File
```
try {
  const podUrl = document.getElementById("PodURL").value;
  const file = document.getElementById('fileoftriples').files[0];
  if (file) {
    const filePodURL = podUrl+file.name;
    await Inrupt.writeFileToPod(file, `${filePodURL}`);
    const solidFileURLField = document.getElementById("solidFileURL").value = filePodURL;
  }
} catch (error) {
  console.log(error);
  alert(error.message);
}
```

OR from local input via Blob
```
let filename = title.replace(/[^\-a-z0-9]/gi, '_').toLowerCase();
filename = filename+'.jsonld';
const pathToStore = document.getElementById("PodURL").value+filename;
const filetype = 'text/plain'; // must be this or fails - no idea why
const blob = new Blob([data], { type: filetype });
const file = new File([blob], filename, { type: filetype });

const fileurl = await Inrupt.writeFileToPod(file, pathToStore);
```

***
```
loadFolderContentList(podFolderURL)
```
Code snippet example:
```
try {
  const podUrl = document.getElementById("PodURL").value;
  const allFolderArray = await Inrupt.loadFolderContentList(podUrl);

  const filesArea = document.getElementById("filesArea");
  let allFiles = ""
  allFolderArray.forEach(function(filename) {
    allFiles += filename+'\n';
  });

  filesArea.value = allFiles;
} catch (error) {
  console.log(error);
  alert(error.message);
}
```
