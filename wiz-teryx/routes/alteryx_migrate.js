const express = require('express')
const router = express.Router()
const oauthSignature = require('oauth-signature')
const axios = require('axios');
const secrets = require("../secrets/secrets")
const fs = require('fs')
const FormData = require('form-data')
const util = require('util')


Gallery = function(apiLocation, apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiLocation = apiLocation;

    // @desc          toggles migration flag on source server
    // @author        AJB
    // @created_date  2021_10_15
    this.toggleMigrationFlag = async function (appid){
	let type = "PUT"
	let url = `${this.apiLocation}/workflows/migratable/${appid}/`
	let params = buildOauthParams(this.apiKey)
	params.oauth_signature = generateSignature(type, url, params, this.apiSecret)

	let recurce_count = 0
	while(params.oauth_signature.includes('+') && recurce_count < 100){
	    params.oauth_signature = generateSignature(type, url, params, this.apiSecret)
	    recurce_count += 1
	}

	console.log('====toggleMigrationFlag local vars====\n',
		    `type= ${type}\n`,
		    `url= ${url}\n`,
		    `params= ${JSON.stringify(params)}\n`,
	          '==================\n')

	let config = {
	    method: type,
	    url: url,
	    headers: {
		'Authorization': `OAuth oauth_consumer_key="${params.oauth_consumer_key}",oauth_signature_method="${params.oauth_signature_method}",oauth_signature="${params.oauth_signature}",oauth_timestamp="${params.oauth_timestamp}",oauth_nonce="${params.oauth_nonce}"`
	    }
	};
	
	function async_wraper (){
	    return axios(config)
		.then(function (response) {
		    return response //.data
		})
		.catch(function (error) {
		    return error
		});
	}
	return await async_wraper()
    }

    // @desc          runs designated workflow by ap id passed in the header
    // @author        AJB
    // @created_date  2021_09_30
    this.postRunWorkflow = async function (appid){
	let type = "POST"
	let url = `${this.apiLocation}/workflows/${appid}/jobs/`
	let params = buildOauthParams(this.apiKey)
	params.oauth_signature = generateSignature(type, url, params, this.apiSecret)

	let recurce_count = 0
	while(params.oauth_signature.includes('+') && recurce_count < 100){
	    params.oauth_signature = generateSignature(type, url, params, this.apiSecret)
	    recurce_count += 1
	}
	
	//console.log('====postRunWorkflow local vars====\n',
	//	    `type= ${type}\n`,
	//	    `url= ${url}\n`,
	//	    `params= ${JSON.stringify(params)}\n`,
	//          '==================\n')

	//call
	let config = {
	    method: type,
	    url: url,
	    headers: {
		'Authorization': `OAuth oauth_consumer_key="${params.oauth_consumer_key}",oauth_signature_method="${params.oauth_signature_method}",oauth_signature="${params.oauth_signature}",oauth_timestamp="${params.oauth_timestamp}",oauth_nonce="${params.oauth_nonce}"`
	    }
	};

	function async_wraper (){
	   return axios(config)
		.then(function (response) {
		    return response.data
		})
		.catch(function (error) {
		    return error
		});
	}
	return async_wraper()
    }


    // @desc          queries admin alteryx REST endpoint to get an array of migratable workflow objects
    // @author        AJB
    // @created_date  2021_09_23
    this.getMigratableWorkflows = async function (){
	let type = "GET"
	let url = `${this.apiLocation}/workflows/migratable/`
	let params = buildOauthParams(this.apiKey)
	params.oauth_signature = generateSignature(type, url, params, this.apiSecret)

	let recurce_count = 0
	while(params.oauth_signature.includes('+') && recurce_count < 100){
	    params.oauth_signature = generateSignature(type, url, params, this.apiSecret)
	    recurce_count += 1
	}
	
	//console.log('====getMigratableWorkflows local vars====\n',
	//	    `type= ${type}\n`,
	//	    `url= ${url}\n`,
	//	    `params= ${JSON.stringify(params)}\n`,
	//	    '==================\n')

	//call
	let config = {
	    method: type,
	    url: url,
	    headers: {
		'Authorization': `OAuth oauth_consumer_key="${params.oauth_consumer_key}",oauth_signature_method="${params.oauth_signature_method}",oauth_signature="${params.oauth_signature}",oauth_timestamp="${params.oauth_timestamp}",oauth_nonce="${params.oauth_nonce}"`
	    }
	};

	function async_wraper (){
	   return axios(config)
		.then(function (response) {
		    return response.data
		})
		.catch(function (error) {
		    return error
		});
	}
	return async_wraper()
    }


    // @desc          Downloads workflow from Alteryx server param is workflow identifier on server
    // @author        AJB
    // @created_date  2021_09_23
    this.getDownloadMigratableWorkflows = function (workflow_id){
	let type = "GET"
	let url = `${this.apiLocation}/${workflow_id}/package/`
	let params = buildOauthParams(this.apiKey)
	params.oauth_signature = generateSignature(type, url, params, this.apiSecret)

	let recurce_count = 0
	while(params.oauth_signature.includes('+') && recurce_count < 100){
	    params.oauth_signature = generateSignature(type, url, params, this.apiSecret)
	    recurce_count += 1
	}
	
	//console.log('====getDownloadMigratableWorkflows local vars====\n',
	//	    `type= ${type}\n`,
	//	    `url= ${url}\n`,
	//	    `params= ${JSON.stringify(params)}\n`,
	//	    '==================\n')



	//path to drop alteryx file currently being migrated
	const writer = fs.createWriteStream(`${secrets.app_server_details.root}/migration_stage/file.yxzp`)
	//axios config parameters
	let config = {
	    method: type,
	    url: url,
	    responseType: 'stream',
	    headers: {
		'Authorization': `OAuth oauth_consumer_key="${params.oauth_consumer_key}",oauth_signature_method="${params.oauth_signature_method}",oauth_signature="${params.oauth_signature}",oauth_timestamp="${params.oauth_timestamp}",oauth_nonce="${params.oauth_nonce}"`
	    }
	};
	//make call to server and write file to stage dirrectory
	return axios(config).then((response)=>{
	    return [new Promise((resolve, reject) => {
		response.data.pipe(writer);
		let error = null;
		writer.on('error', err => {
		    error = err;
		    writer.close();
		    reject(err);
		});
		writer.on('close', () => {
		    if (!error) {
			resolve(true);
		    }
		    //no need to call the reject here, as it will have been called in the
		    //'error' stream;
		})
	    }), response, workflow_id]
	}).catch(error => console.log(error))
    }


    // @desc          Will post workflow to target server, does not validate workflow, public = false, worker tag = 0
    // @author        AJB
    // @created_date  2021_10_05
    this.postWorkflowToTarget = function(download_response){
	const sourceId = download_response[2] // position 2 will always have the sourceId
	const filename = download_response[1].headers['content-disposition'].match(/\".+?\"/g)[0].replace('"','').replace('"','')
	
	var data = new FormData();
	data.append('file', fs.createReadStream(`${secrets.app_server_details.root}/migration_stage/file.yxzp`))//${filename}`))
	data.append('name', filename)
	data.append('owner', secrets.alteryx_servers_details.prod.admin_email)
	data.append('validate', 'true')
	data.append('isPublic', 'false')
	data.append('sourceId', sourceId)
	data.append('workerTag', '')
	data.append('canDownload', 'true')

	let type = "POST"
	let url = `${this.apiLocation}/workflows/` // perposly left out closing } ... was being included as string character
	let params = buildOauthParams(this.apiKey)
	params.oauth_signature = generateSignature(type, url, params, this.apiSecret)
	
	let recurce_count = 0
	while(params.oauth_signature.includes('+') && recurce_count < 100){
	    params.oauth_signature = generateSignature(type, url, params, this.apiSecret)
	    recurce_count += 1
	}
	
	//console.log('====postWorkflowToTarget local vars====\n',
	//	    `type= ${type}\n`,
	//	    `url= ${url}\n`,
	//	    `params= ${JSON.stringify(params)}\n`,
	//	    '==================\n')

	let config = {
	    method: type,
	    url: url,
	    headers: {
		'Authorization': `OAuth oauth_consumer_key="${params.oauth_consumer_key}",oauth_signature_method="${params.oauth_signature_method}",oauth_signature="${params.oauth_signature}",oauth_timestamp="${params.oauth_timestamp}",oauth_nonce="${params.oauth_nonce}"`,
		...data.getHeaders()
	    },
	    data : data
	};


	//console.log(config)
	return axios(config)
	    .then(function (response) {
		return response.data
	    })
	    .catch(function (error) {
		console.log(error);
	    });	
    }

    

    

    let buildOauthParams = function(apiKey){
	return {
            oauth_consumer_key: apiKey,
	    oauth_nonce: Math.floor(Math.random() * 1e9).toString(),
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: Math.floor(new Date().getTime()/1000).toString(),
            oauth_version: "1.0"
	};
    };


    let generateSignature = function(httpMethod, url, parameters, secret) {
	return oauthSignature.generate(httpMethod, url, parameters, secret, null)
    };
};




async function callRun_py(download_response){
    let data = JSON.stringify({"script":"alteryx_workflow_fileshare_migration.py","args":`${secrets.alteryx_servers_details.dev.hostname};${secrets.alteryx_servers_details.prod.hostname}`});


    let end_function = false
    
    console.log('here')
    

    
    let config = {
	method: 'get',
	url: `http://localhost:${secrets.app_server_details.port}/run_py`,
	headers: { 
	    'Content-Type': 'application/json'
	},
	data : data
    };
    //console.log(data)
    let re = await axios(config)
	.then(function (response) {
	    //console.log(JSON.stringify(response.data));
	    return response
	})
	.catch(function (error) {
	    console.log(error);
	    return error
	});
       
    download_response.push(re)
    return await re
}


// @route GET /alteryx_migrate/:target_destination
// @desc migrates flagged alteryx workflows on dev to target destination
// @access Admin Key/Secret
router.get('/:target_hostname', async (req, res)=> {
    try{
    console.log('in alteryx_migrate!')
    target = req.params.target_hostname
    
    admin_dev_gallery = new Gallery(`http://${secrets.alteryx_servers_details.dev.hostname}/gallery/api/admin/v1`,
				    secrets.alteryx_servers_details.dev.api_credintials.admin.key,
				    secrets.alteryx_servers_details.dev.api_credintials.admin.secret)
    
    if(target === secrets.alteryx_servers_details.prod.hostname){
	admin_prod_gallery = new Gallery(`http://${secrets.alteryx_servers_details.prod.hostname}/gallery/api/admin/v1`,
					 secrets.alteryx_servers_details.prod.api_credintials.admin.key,
					 secrets.alteryx_servers_details.prod.api_credintials.admin.secret)
    }
    async function main(admin_dev_gallery){
	let prod_workflowIds = await {'ids': []}
	try{
	    // 1. get workflows that are migratable
	    let workflow_obj_array = await admin_dev_gallery.getMigratableWorkflows()
	    // 2. loop through arrayed return
	    // no workflows to migrate condition
	    if (workflow_obj_array.length === 0){
		return 'no workflows to migrate'
	    }
	    for (i = 0; i < workflow_obj_array.length; i++){
		let downloaded_workflow = await admin_dev_gallery.getDownloadMigratableWorkflows(workflow_obj_array[i].id)
		let py_script_complete = await callRun_py(downloaded_workflow)
		// 3. push to prod
		let prod_workflowId = await admin_prod_gallery.postWorkflowToTarget(downloaded_workflow) 
		console.log(prod_workflowId)
		prod_workflowIds['ids'].push(prod_workflowId)
		// 4. toggle migration flag on source server
		let toggle_data = await admin_dev_gallery.toggleMigrationFlag(workflow_obj_array[i].id)
	    }
	}catch(err){
		console.log(err)
	}
	return prod_workflowIds			   
    }
	const data = await main(admin_dev_gallery)
	res.send(data)
    }catch(err){
	console.log(err)
	res.send('server err')
    }
})


// @route  POST /alteryx_migrate/runworkflow/:app_id
// @desc   Triggers provided app_id workflow to run 
// @access Studio Key/Secret
router.post('/run_workflow/:app_id', (req, res)=> {
    console.log('in run_workflow!!!')
    subscription_gallery = new Gallery(`http://${secrets.dev.hostname}/gallery/api/v1`,
			  secrets.studio.key,
				       secrets.studio.secret)
    subscription_gallery.postRunWorkflow(req.params.app_id).then(ans=>res.send(ans)).catch(err=>res.send(err))
})











module.exports = router



