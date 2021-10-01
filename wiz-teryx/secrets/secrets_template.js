const alteryx_servers_details = {
    "dev": {
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
    "port": ""  //place port number wiz-teryx should serv on localhost
}



exports.alteryx_servers_details = alteryx_servers_details
exports.app_server_details = app_server_details

