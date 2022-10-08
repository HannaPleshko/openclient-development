

## What's changing
---------------
Extracted Keep specific code into its own package


## Why?
-------
Developing multiple middleware layers (EWS, IMAP, JMAP, etc.)

Reuse of Keep component layer (Managers, Keep "model" structures)


## What is it?
-------------
Package is a Loopback component (requires a Loopback Application)

It will appear under node_modules as @hcllabs/openclientkeepcomponent


## What is included in the package?
-----------------------------------
Code specific to communicating with Keep apis

 - Keep*Manager classes (e.g. KeepMessageManager, KeepCalendarManager)
 - Pim* classes (e.g. PimItem, PimMessage, PimCalendar)
 - KeepTransportManager
 - Services: keep-pim.service, keep-core.service
 - Datasources: keep-pim.datasource, keep-core.datasource
 


## Where is it stored?
-------------------
Stored as an npm package in Azure


Azure setup and access - https://dev.azure.com/HCLLabs/Project%20Keep/_wiki/wikis/Project-Keep.wiki/1/Initial-setup

Package Registry url - https://dev.azure.com/HCLLabs/Project%20Keep/_packaging?_a=feed&feed=Platform-Services

We store it in the Platform-Services feed.

### Add .npmrc file to project
In order to do an npm install (on this repo), first follow these instructions for creating an Azure token, and updating your .npmrc file: [Updating .npmrc](https://dev.azure.com/HCLLabs/Project%20Keep/_packaging?_a=connect&feed=Platform-Services).

When you navigate to the url, select "npm" in the list.  When you navigate to that page, choose the "Windows" tab if you're on a windows machine, 
otherwise choose "Other" and follow the instructions.

Note that in the azure.com article, the .npmrc will have a registry= entry. When making that change to your .npmrc, use @hcllabs:registry= instead.


### Update token in user-level (home directory on mac) .npmrc file
Add a .npmrc file to your $HOME directory (on mac)

Paste the following in the .npmrc at $HOME:

```
; begin auth token
//pkgs.dev.azure.com/HCLLabs/fb2aa10e-fc82-4a7f-ada9-ebe4e35cb27f/_packaging/Platform-Services/npm/registry/:username=HCLLabs
//pkgs.dev.azure.com/HCLLabs/fb2aa10e-fc82-4a7f-ada9-ebe4e35cb27f/_packaging/Platform-Services/npm/registry/:_password=> [BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
//pkgs.dev.azure.com/HCLLabs/fb2aa10e-fc82-4a7f-ada9-ebe4e35cb27f/_packaging/Platform-Services/npm/registry/:email=npm requires email to be set but doesn't use the value
//pkgs.dev.azure.com/HCLLabs/fb2aa10e-fc82-4a7f-ada9-ebe4e35cb27f/_packaging/Platform-Services/npm/:username=HCLLabs
//pkgs.dev.azure.com/HCLLabs/fb2aa10e-fc82-4a7f-ada9-ebe4e35cb27f/_packaging/Platform-Services/npm/:_password=[BASE64_ENCODED_PERSONAL_ACCESS_TOKEN]
//pkgs.dev.azure.com/HCLLabs/fb2aa10e-fc82-4a7f-ada9-ebe4e35cb27f/_packaging/Platform-Services/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
```


### Get an azure personal access token
[Azure personal access token](https://dev.azure.com/HCLLabs/_usersSettings/tokens)
Access should be "read" for build and "read and write" for package.

Copy the token

Base64 encode the token using this script (enter the personal access token at the PAT prompt):
```
node -e "require('readline') .createInterface({input:process.stdin,output:process.stdout,historySize:0}) .question('PAT> ',p => { b64=Buffer.from(p.trim()).toString('base64');console.log(b64);process.exit(); })"
```

In your .npmrc file, replace both [BASE64_ENCODED_PERSONAL_ACCESS_TOKEN] with your base64 encoded personal access token
You do not need to replace the "npm requires email to be set...." verbage

Execute 
`npm install` to install event-sdk in your node_modules


## How do I access it?
-------------------
In consuming application, update package.json dependency with
```
    "@hcllabs/openclientkeepcomponent": "<version number....e.g. ^1.0.4>"
```

After instantiating your Loopback application, add the following

```
    app.component(OpenClientKeepComponent);
    OpenClientKeepComponent.keepOptions = new OpenClientKeepOptionsProvider();
```

Where Open/ClientKeepOptionsProvider is a class in your consuming app that implements the OpenClientKeepOptions interface from the openclientkeepcomponent component.


## How does this affect development?
----------------------------------
Another git repository 

https://github01.hclpnp.com/hcl-labs/openclient-keepcomponent

Another vscode with the openclient-keepcomponent extracted

```
// Initialize github environment
git init 
```

```
// Add remote
git remote add origin git@github01.hclpnp.com:hcl-labs/openclient-keepcomponent.git
```


## How do I publish a new version of the openclientkeepcomponent?
--------------------------------------------------------------
Update the version number in package.json. 
 
 - Run the clean script
 - Run the build script to compile the code

As long as your .npmrc references the azure hcllabs registry....

From your local openclientkeepcomponent directory (where git repo is downloaded to....whatever you named it), run
```
npm publish
```

It currently includes the component source, but the source can be removed with a .npmignore file (similar to .gitignore)


## How do I test my changes to the openclientkeepcomponent before pushing a PR?
------------------------------------------------------------------------------
I use yalc

To install yalc (globally):
```
npm i yalc -g
```

yalc adds a .yalc directory under your home directory

To publish to the local registry, from the parent of your openclientkeepcomponent directory (where git repo is downloaded to):
```
yalc publish
```

From your consuming app:
```
yalc add @hcllabs/openclientkeepcomponent
```

It will update package.json like:
```
    "@hcllabs/openclientkeepcomponent": "file:<path to component in local yalc registry>"
```

After you have added @hcllabs/openclientkeepcomponent to the consuming app, if you update the openclientkeepcomponent, just use the push option on the publish command to have the changes pushed out to your consuming app:
```
yalc publish --push
```

### Other yalc commands

Remove published packages from your local repo
```
yalc installations clean
```

Remove the reference to the package from your project
```
yalc remove @hcllabs/openclientkeepcomponent
```


## Development best practices
--------------------------
This section is a cookbook for how to develop code in this split package architecture.  It is important that we are careful to follow these best practices to minimize impact to other team members when we make changes to dependent code.  This is most relevant if you need to make any changes to the keep component, but be aware that ews, imap, jmap and other packages that depend on the keep component will have to be kept in sync with the keep component moving forward.

### Making changes to the keep component

Follow these steps for making code changes to the keep component.

1. Pull the latest from development in your openclient-keepcomponent repository
1. Create a new branch based on development in which to do your work
1. Increment the version in package.json
1. Make your local code changes
1. (Optional) Run the following to clear out any existing versions published through yalc.  This step is typically not necessary, but is good to know if you run into issues where your changes are not showing iup in your ews-middleware repository.
    ```
    yalc installations clean @hcllabs/openclientkeepcomponent
    ```
1. From the root of your openclient-keepcomponent repo, run the following command to clean, build and publish your package using yalc.  This will also push the changes to dependent repositories.
    ```
    yalc publish --push
    ```

### Testing your changes

Once you have updated your keep component package, you need to test running it with the ews client (or other clients).  Follow these steps to test your keep component changes before submitting a PR.  Note that the steps are written for ews-middleware, but the same concepts will apply to imap, jmap and other middleware implemenations.

1. Switch to your ews-middleware repository.  Merge with development if needed.
1. Do a clean
    ```
    npm run clean
    ```
1. (Optional) Issue this yalc command to clear any existing yalc references from your project.  This step is not necessary if you have not yet added the dependency with yalc or if you are just testing an incremental update that was pushed via the `yalc publish --push` step.
    ```
    yalc remove @hcllabs/openclientkeepcomponent
    ```
1. (Optional) Remove your node_modules directory to clear any dependencies.  This is not always necessary, but should be done if you are having problems seeing changes you made to the keep component in your ews-middleware application.
1. Use yalc to add your locally built keep component package to your project.  This must be done at least once in your ews-middleware repository
    ```
    yalc add @hcllabs/openclientkeepcomponent
    ```
1. Run the following command to make sure your dependencies are up to date
    ```
    npm clean-install
    ```
1. Rebuild your ews-middleware project and verify there are no errors
    ```
    npm run build
    ```
1. Test/verify your changes

> **Note:** Not all the steps above are necessary. If you are having any issues not seeing changes you made to the keep component in your ews-middleware project, then it is advised to execute all of the steps.

> **Note:**  If you need to make more changes to the keep component, iterate on steps 4-6 of the first list, then steps 2-8 of the second list.

### Submitting and Publishing a new keep component version

Once you have finished testing your keep component changes, submit a PR in the openclient-keepcomponent repository.  Once the PR is merged, switch to your openclient-keepcomponent repository and do the following:

1. Switch to the development branch and do a pull to make sure you have the latest
1. Do a clean:
    ```
    npm run clean
    ```
1. Publish the new version of the keep component npm module to the private npm registry:
    ```
    npm publish
    ```
1. Post a message to the Open Client Team channel to inform the team that a new version has been posted.

### Integrating the new version into ews-middleware

Once the new version of the keep component is published, there's still work to be done.  We must make any updates to ews-middleware (and other consuming apps) needed to work with the new keep component version that was published.  Follow these steps to do this:

1. Make sure you are running with the latest ews-middleware code (merge changes from development)
1. Do a clean on your ews-middleware repository:
    ```
    npm run clean
    ```
1. Remove any yalc reference from your package:
    ```
    yalc remove @hcllabs/openclientkeepcomponent
    ```
1. Delete your node_modules directory
1. Update the version of the keep component in package.json to match the new version you just published.
1. Reload all project dependencies:
    ```
    npm install
    ```
1. Build the ews-middleware project and verify there are no errors:
    ```
    npm run build
    ```
1. Test your changes.  Run unit tests and Postman tests.  Submit a PR with your changes.
