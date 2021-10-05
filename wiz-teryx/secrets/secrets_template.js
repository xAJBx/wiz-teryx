const alteryx_servers_details = {
    "dev": {
	"admin_email": "", //place dev alteryx server admin email
	"hostname": "", //place dev alteryx server hostname
	"api_credintials": {
	    "admin": {
		"key": "", //place dev alteryx server admin api key
		"secret": "", //place dev alteryx server admin api secret
	    },
	    "studio": {
		"key": "", //place dev alteryx server studio api key
		"secret": "", //place dev alteryx server studio api secret
	    }
	}
    },
    "prod": {
	"admin_email": "", //place prod alteryx server admin email
	"hostname": "", //place prod alteryx server hostname
	"api_credintials": {
	    "admin": {
		"key": "", //place prod alteryx server admin api key
		"secret": "", //place prod alteryx server admin api secret
	    },
	    "studio": {
		"key": "", //place prod alteryx server studio api key
		"secret": "", //place prod alteryx server studio api secret
	    }
	}
    }
}

const app_server_details = {
    "port": "",  //place port number wiz-teryx should serv on localhost
    "root": path.dirname(__dirname) //do not replace ...dynamically grab project root
}



exports.alteryx_servers_details = alteryx_servers_details
exports.app_server_details = app_server_details

