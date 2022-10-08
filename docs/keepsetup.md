<!--- This was commented out because it does not work well. 
# Running Keep Without Domino
    
These instructions allow you to run Keep locally without a Domino Server so that EWS middleware can use it. 

1. Save the following in a file named `startkeepmac.sh` on your machine:
	```
	#!/bin/bash
	# MacOS Keep Starter file

	# Stop previous running Keep server
	lsof -i tcp:8880 | awk 'NR!=1 {print $2}' | xargs kill -9 
	lsof -i tcp:8889 | awk 'NR!=1 {print $2}' | xargs kill -9 

	# Keep locations - update as needed - leave the TLS stuff empty if you don't have it
	export KEEPJAR=$HOME/Library/Application\ Support/HCL\ Notes\ Data/keep/projectkeep.jar
	export LOG_DIR=$HOME/Library/Application\ Support/HCL\ Notes\ Data/keep
	# export TLSFile=some.pfx
	# export TLSPassword=password
	# Delete old logs - comment out if you don't like it
	rm "$LOG_DIR/*.log"
	# Don't change anything below unless you are sure what you are doing
	# Java files places unfortunately troublesome, so we link some
	cd /Applications/HCL\ Notes.app/jre/Contents/Home/lib/ext
	export SRCDIR="../../../../../Contents/MacOS/jvm/lib/ext"
	if [ ! -f njempcl.jar ]; then
		ln -s $SRCDIR/njempcl.jar .
		echo "Linked njempcl.jar"
	fi
	if [ ! -f Notes.jar ]; then
		ln -s $SRCDIR/Notes.jar .
		echo "Linked Notes.jar"
	fi
	if [ ! -f websvc.jar ]; then
		ln -s $SRCDIR/websvc.jar .
		echo "Linked websvc.jar"
	fi

	# Local Keep Server
	export JwtDuration=360
	export JwtMaxDuration=360
	export DEBUG=true
	export PATH=/Applications/HCL\ Notes.app/Contents/MacOS:$PATH
	export JAVA_HOME=/Applications/HCL\ Notes.app/jre/Contents/Home
	export GodMode=true
	export DYLD_LIBRARY_PATH=/Applications/HCL\ Notes.app/Contents/MacOS
	export LD_LIBRARY_PATH=/Applications/HCL\ Notes.app/Contents/MacOS
	echo $LD_LIBRARY_PATH ..
	cd $HOME/Library/Application\ Support/HCL\ Notes\ Data
	/Applications/HCL\ Notes.app/jre/Contents/Home/bin/java -jar "$KEEPJAR" &
	osascript -e "tell application \"Terminal\" to do script \"tail -f '$LOG_DIR/projectkeep.log'\""
	echo "\n\n\n Shutdown:"
	read -p "Press enter to shut down local KEEP"
	curl --max-time 10 --location --request \
	POST 'http://localhost:8889/shutdown' \
	--header 'Content-Type: application/json' \
	--data '{"shutdownkey" : "The End is near!!"}'
	cd ~
	echo Done!
	```
1. Open a terminal window to the directory where you saved it and issue chmod +x to make it executable. 
1. Get the projectkeep.jar from https://git.cwp.pnp-hcl.com/Innovation-General/domino-keep/releases and put it in your notes data directory under a directory called keep.
1. Start your Notes client, goto File > Security > User Security...
1. Check "Don't prompt for a password from other Notes-based programs (reduces security)" and click OK
1. From the terminal window, run the `startkeepmac.sh`. On first run the database KeepConfig.nsf gets created if it does not exist. It contains one local user John Doe who is not active. 
1. Open the newly created KeepConfig.nsf in the Notes client and look for the User entry “John Doe” to set him to active. His password is password. His mail database is called "DemoMail.nsf". Change this if you want. 
1. Create the mail database for John Doe. From the Notes client, File > Application > New...
	For the Notes Appplication location:
	- Server: `local`
	- File Name: `DemoMail.nsf`  (or whatever is set for John Doe in KeepConfig.nsf )

	For the Template:
	- Server: `local`
	- Template: `Mail(R11.0.1)`

	Click OK.
1. In the terminal window where Keep is running hit enter to shut it down. Always do this to shutdown Keep cleanly or you may get an error attempting to access your Notes id file.
1. Restart Keep using the `startkeepmac.sh` command
	
--->
# Keep/Domino Setup in a Docker Container

The following instuction are for setting up Keep to run in a local Docker Container with a Domino Server so that Open Client middleware can use it. This may be desirable over running Keep without a Domino Server since certain Keep funcationality only works when running with Domino. The Domino server in the container is a secondary server of the frascati.projectkeep.io Domino server. This allows it to replicate with frascati.projectkeep.io so that mail can be sent and received. 

If you run multiple version of Domino, you should create different volumes for each Domino version. 

1. Create a Docker volume, name it something like domino_keep, domino12_keep, etc. 
	```
	docker volume create <volume_name>
	```
	You can list the volume using:
	```
	docker volume ls
	```
1. If your secondary server has not been setup, have Stephan Wissel setup a secondary server id file for you. The name of your secondary server will be referenced in these instructions as `<sec-server>`.

1. Edit your /etc/host file and add host name `<sec-server>.projectkeep.io` to map to localhost (127.0.0.1). 

1. Copy the docker-compose.yml and docker-compose.env files from this docs directory into a new directory. 

	Note: The docker-compose.yml and docker-compose.env are copies of the docker-compose-secondary.yml and sample.env from keep github with some modifications.  If the deployment is not successful, you will want to check that the files have not changed and potentially new and different configuration information may be needed.  The docker-compose-secondary.yml and sample.env files are located here: https://github01.hclpnp.com/stephan-wissel/domino-keep/tree/develop/docs/resources

1. Download the id file for your server into the new directory along with the docker-compose.yml and docker-compose.env.  
	```
	https://projectcastle.io/servers/<sec-server>.id
	```
1. Rename the <sec-server>.id to be server.id
1. Modify the values in docker-compose.env for your secondary server.

	These are the values you'll typically change, replacing `<sec-server>` (e.g. valentino) with the name of your secondary server, `<volume_name>` with the name of the volume that will contain the domino configuration (e.g. domino12_keep), and `<path_for_keep_image>` with the correct keep docker image (e.g. docker.hcllabs.net/hclcom/projectkeep-r12:latest)
	``` 
	# The server you setup
	SERVERSETUP_NETWORK_HOSTNAME=<sec-server>.projectkeep.io
	SERVERSETUP_SERVER_NAME=<sec-server>.projectkeep.io/ProjectKeep
	# Container info
	CONTAINER_IMAGE=<path_for_keep_image>
	CONTAINER_NAME=<label you want to give the created docker container e.g. valentino12_keep0927_20210707>
	CONTAINER_NAME_DEBUG=keep_debug_container_not_used
	CONTAINER_HOSTNAME=<sec-server>.projectkeep.io
	CONTAINER_VOLUMES=<volume_name>
	``` 

1. Copy docker-compose.env to .env (in the same directory).  This will make the .env be a hidden file.  Whenever you need to upgrade keep you'll modify docker-compose.env and copy and replace the .env with the new entry.
1. Run 
	``` 
	docker-compose up
	```

	Note: docker-compose is installed with docker desktop on windows and mac.  If you're running on linux you will need to follow google to follow the instructions to install it there.

1. Verify the container was deployed....
  - First check that you can get to localhost:8880.  If you can get to it, you do not need to continue verification
  - If you cannot get to localhost:8880, from another command prompt, run the following to attach a shell to your container
  	```
  	docker exec -it <container name> /bin/bash
  	```
  - ```
  	cd /local/notesdata/IBM_TECHNICAL_SUPPORT
	```
  - ```
  	cat console.log
	```
	If there are only a couple of lines in the console.log, the domino setup did not complete.

  - To complete the domino setup, 
  	- ```
		cd to /loca/notedata
		rm server.id
		exit
		```
	- Restart the docker container
		```
		docker container <docker container name> restart
		```
	- Attach a shell to the container again and monitor /local/notesdata/IBM_TECHNICAL_SUPPORT/console.log to verify the config has continued.  It may take a while (10-15 minutes).  If nothing is changing in the console.log, check that the docker-compose.yml and docker-compose.env do not need to be updated with changes from keep github.




## USE DOCKER-COMPOSE DESCRIBED ABOVE.  THIS IS THE OLD WAY OF CONFIGURING KEEP KEPT HERE FOR REFERENCE.  IT MIGHT BE REFERRED TO AS THE opendockercompatible VERSION.

Open a terminal window and run docker with the version of Domino you want to configure. The docker images for Domino are:
   - Domino 11: docker.hcllabs.net/hclcom/domino:11.0.1
   - Domino 12: docker.hcllabs.net/domino-opendockercompatible:daily  - These are daily Domino 12 build. You can also pick a specific build tag if needed.

   Use the following command replacing `<sec-server>` with the name of your secondary server, `<volume_name>` with the name of the volume that will contain the domino configuration, and `<path_for_Domino_image>` with the correct Domino docker image above:
	```
	docker run -it -e "ServerName=<sec-server>.projectkeep.io" \
		-e "isFirstServer=false" \
		-e "ServerIDFile=https://projectcastle.io/servers/<sec-server>.id" \
		-e "OtherDirectoryServerAddress=frascati.projectkeep.io" \
		-e "OtherDirectoryServerName=frascati.projectkeep.io " \
		-h <sec-server>.projectkeep.io \
		-p 81:80 \
		-p 1352:1352 \
		-p 8880:8880 \
		-p 8889:8889 \
		-p 8890:8890 \
		-v <volume_name>:/local/notesdata \
		--stop-timeout=60 \
		--name <sec-server> \
		docker.hcllabs.net/<path_for_Domino_image>
	```
	It will populate the docker volume, so Domino can startup fully configured. Once this has been completed. Stop the container in the docker dashboard and wait for Domino to shutdown (see the terminal window). Now delete the container. 

	Note that the above command assumes/requires that your server's id file is available to be downloaded from `https://projectcastle.io/servers/<sec-server>.id`.  If it is not, your setup will not run correctly.

1. Next you will create the container you will use for testing. Use the following command replacing `<sec-server>` with the name of your secondary server, `<volume_name>` with the name of the volume containing the Domino configuration, `<domino_version>` with the version of Domion (r11 or r12), and `<tag-for-keep-version>` with the version of keep you want to use. The keep docker image must be pushed to the docker.hcllabs.net repo. You can use the VS Code Docker plugin to view the avaliable keep images on docker.hcllabs.net:
	```
	docker run -it \
		-h <sec-server>.projectkeep.io \
		-p 81:80 \
		-p 1352:1352 \
		-p 8880:8880 \
		-p 8889:8889 \
		-p 8890:8890 \
		-p 8000:8000 \
		-v <volume_name>:/local/notesdata \
		--stop-timeout=60 \
		--name <sec-server> \
		docker.hcllabs.net/hclcom/projectkeep-<domino_version>:<tag-for-keep-version>
	```
When your container is running, Open Client middleware will, by default, use it since the Keep URL defaults to `http://localhost:8880`. Do not run your container and a local Keep at the same time. 

## Create a test user and mail database
1. It is best to keep the mail databases in a mail directory. From the Keep/Domino container in your Docker Dashboard, open a CLI prompt, switch to /local/notesdata, and `mkdir mail`. 
1. Open the Names.nsf file on your docker Domino image. In your Notes client hit CMD-O and type in the name of your server (`<sec-server>.projectkeep.io`) in the "Look in" field and click Open.
1. Select Keep's Directory which is the names.nsf file and click Open.
1. From here you can add users for your Domino. The best thing to do is to copy the settings from another user. For example if you want to have a user name called "TestA SecServer":
	- For user name set it to:
		```
		TestA SecServer/ProjectKeep
		TestA SecServer
		```
	- Set a password in the Internet password field. 
	- Mail System: `Notes`
	- Domain: `Keep`
	- Mail Server: `<sec-server>.projectkeep.io/ProjectKeep`
	- Mail File: `mail/testaSecServer.nsf`
	- Internet Address: `testa.secserver@quattro.rocks`   (Note: Always use a domain of quattro.rocks so you can send mail for external systems to this user)
1. From the Notes client, File > Application > New...
1. For the Notes Appplication location:
	- Server: `<sec-server>.projectkeep.io/ProjectKeep`
	- File Name: `mail/testaSecServer.nsf`  (same as the mail file you sepecified in the user's names.nsf entry)

	For the Template:
	- Server: `<sec-server>.projectkeep.io/ProjectKeep`
	- Template: `Mail(R11.0.1)`

	Click OK.
1. From the Notes client, CMD-O and open the mail file you just created and File > Application > Access Control...
1. Click Add and add the user (`TestA SecServer/ProjectKeep`). Set the User type to Person and Access to Manager, Check Delete documents, then click OK. 

Use this user when testing your change during development. 

# Enable iNotes
If you need iNotes access to the Domino mail databases:
1. Open a command prompt in the container
2. cd /local/notesdata
3. Edit the notes.ini file:
	```
	nano notes.ini
	```
4. Add http to the servertasks entry and save the change to notes.ini
5. Restart the container

You can assess a database using http://<server_name>:81/mail/<mail_db>.nsf


# Using the Keep Swagger API
1. In a broswer open http://localhost:8880/
1. Click on Core OpenAPI and set the server to Local Preview Server. 
1. Under the Authentication section use the Get JWT Session API to verify you can authenticate with John Doe. Copy the returned JWT Token
1. You can go back to http://locahost:8880/ and click on PIM OpenAPI.
1. Set the server to Local Test Server.
1. Click Authorize and paste the JWT in the value and click Authorize. 
1. You can now use the website to issue most Keep APIs. 

# Using the Keep Postman collections
1. Download the latest Keep Postman Collections at https://github01.hclpnp.com/stephan-wissel/domino-keep/tree/develop/keep-core/src/test/postman/collections/pim-v1 and import them into Postman
1. Download the Keep Postman Environment from https://github01.hclpnp.com/stephan-wissel/domino-keep/tree/develop/keep-core/src/test/postman/environments/pim-v1 and import it into Postman
1. Set the environment to "KEEP Dev" and edit the settings to set the user and password. You can now use the Postman collections to run Keep APIs against your local installation. 

