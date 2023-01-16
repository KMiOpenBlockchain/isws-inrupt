/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2021 KMi, The Open University UK                                 *
*                                                                                *
* Permission is hereby granted, free of charge, to any person obtaining          *
* a copy of this software and associated documentation files (the "Software"),   *
* to deal in the Software without restriction, including without limitation      *
* the rights to use, copy, modify, merge, publish, distribute, sublicense,       *
* and/or sell copies of the Software, and to permit persons to whom the Software *
* is furnished to do so, subject to the following conditions:                    *
*                                                                                *
* The above copyright notice and this permission notice shall be included in     *
* all copies or substantial portions of the Software.                            *
*                                                                                *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL        *
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER     *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN      *
* THE SOFTWARE.                                                                  *
*                                                                                *
**********************************************************************************/

// reading / writing data to Inrupt Solid
import {
    addStringNoLocale,
  	addUrl,
  	createSolidDataset,
  	createThing,
	getFile,
	getContentType,
	overwriteFile,
	saveFileInContainer,
	getSourceUrl,
	getSolidDataset,
	getThingAll,
	getThing,
 	getStringNoLocale,
	getUrlAll,
    getPodUrlAll,
	getContainedResourceUrlAll,
  	saveSolidDatasetAt,
	setThing,
	removeThing,
    FetchError,
} from "@inrupt/solid-client";

// ACL related
import {
	getSolidDatasetWithAcl,
	hasResourceAcl,
	getResourceAcl,
	getFileWithAcl,
	hasAcl
} from "@inrupt/solid-client";

// Logging in to Inrupt Solid
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";

import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

let session = null;

/**
 * Start Login Process. Call login() function.
 */
export function startSolidLogin(oidcIssuerUrl, clientNameString) {
	return login({
		oidcIssuer: oidcIssuerUrl,
		redirectUrl: window.location.href,
		clientName: clientNameString
	});
}

/**
 * logout of your pod session
 */
export function solidLogout() {
	getDefaultSession().logout();
	session = null;
	disableSolidButtons();
}

/**
 * 1b. Login Redirect.
 * When redirected after login, call handleIncomingRedirect() function to
 * finish the login process by retrieving session information.
 */
async function finishSolidLogin() {
	await handleIncomingRedirect({ restorePreviousSession : true });
	session = getDefaultSession();

	if (session.info.isLoggedIn) {
		//console.log(session);
		try {
			document.getElementById("solidpod").textContent = session.info.webId;
			enableSolidButtons();

		} catch (error) {
			console.log(error);
		}
	}
}

/**
 * Return the current session object.
 */
export function getSession() {
	return session;
}


// The example has the login redirect back to the index.html.
// finishLogin() calls the function to process login information.
// If the function is called when not part of the login redirect, the function is a no-op.
finishSolidLogin();

/**
 * If no filetype set against a file but the browser, check the file ending and return an appropriate one.
 */
export function getFileType(file) {
	// can't have a blank file type - really upsets Solid
	let filetype = file.type;
	if (filetype == "") {
		const lastIndex = file.name.lastIndexOf('.');
		const fileend = file.name.slice(lastIndex + 1);
		if (fileend == 'ttl') {
			filetype = 'text/turtle';
		} else if (fileend == 'nt' || fileend == 'n3') {
			filetype = 'application/n-triples';
		} else {
			filetype = 'text/plain';
		}
	}
	return filetype;
}

/**
 * Read a File from the given fileURL.
 */
// https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/resource_file.html
export async function readFileFromPod(fileURL) {
	//console.log("Reading file: "+fileURL);
	try {
		// file is a Blob (see https://developer.mozilla.org/docs/Web/API/Blob)
		const file = await getFile(
		  fileURL,               // File in Pod to Read
		  { fetch: fetch }       // fetch from authenticated session
		);

		//alert(`Fetched a ${getContentType(file)} file from ${getSourceUrl(file)}`);

		return file;
	} catch (error) {
		throw error;
	}
}

/**
 * Upload File to the targetFileURL.
 * If the targetFileURL exists, overwrite the file.
 * If the targetFileURL does not exist, create the file at the location.
 */
 // https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/resource_file.html
export async function writeFileToPod(file, targetFileURL) {

	let filetype = getFileType(file);

	try {
		const savedFile = await overwriteFile(
			targetFileURL,                              // URL for the file.
			file,                                       // File
			{ contentType: filetype, fetch: fetch }    // mimetype if known, fetch from the authenticated session
    	);

    	//console.log(`File saved at ${getSourceUrl(savedFile)}`);
    	return getSourceUrl(savedFile);

	} catch (error) {
		console.log(error);
		throw error;
	}
}

// Read a Dataset from the targetURL.
export async function readDatasetFromPod(targetURL) {
	try {
		const fetchedData = await getSolidDataset(targetURL, { fetch: fetch });

		let items = getThingAll(fetchedData);
		let content="";
		for (let i = 0; i < items.length; i++) {
			let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
			if (item !== null) {
				content += item + "\n";
			}
		}

		return content;
	} catch (error) {
		console.log(error.message);
		throw error;
	}
}

// Write the given rdf data to the currently logged in Solid pod.
export async function writeDatasetToPod(pathToStore, title, data) {

  	let myData = createSolidDataset();
	try {

		let titleobj = createThing({name: title});
		titleobj = addUrl(titleobj, RDF.type, AS.Article);
		titleobj = addStringNoLocale(titleobj, SCHEMA_INRUPT.name, data);
		myData = setThing(myData, titleobj);

		// Save the SolidDataset
		let savedDataset = await saveSolidDatasetAt(
			pathToStore,
			myData,
			{ fetch: fetch }
		);

    	//console.log(`Data saved at ${getSourceUrl(savedDataset)}`);
    	return getSourceUrl(savedDataset);

	} catch (error) {
		console.log(error.message);
		throw error;
	}
}

/**
 * Fetch the file/dataset list for the given folder url
 * @param podFolderURL, the solid pod folder url to fetch file listing for. Note: must end in a '/'
 * @return an array of the items in the folder
 */
export async function loadFolderContentList(podFolderURL) {

	try {
		if (podFolderURL == "" || podFolderURL == null) {
			alert("Please enter a Solid pod url first");
			return;
		}

		//const allFolder = await getSolidDataset("https://pod.inrupt.com/michellebachler/", { fetch: fetch });
		const allFolder = await getSolidDatasetWithAcl(podFolderURL, { fetch: fetch });
		//console.log(allFolder)

		const allFolderArray = getContainedResourceUrlAll(allFolder);
		//console.log(allFolderArray);

		return allFolderArray;

	} catch (error) {
		console.log(error);
		throw error;
	}
}
