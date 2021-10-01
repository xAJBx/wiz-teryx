const express = require('express')
const router = express.Router()
const oauthSignature = require('oauth-signature')
const axios = require('axios');
const secrets = require("../secrets/secrets")


Gallery = function(apiLocation, apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiLocation = apiLocation;

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
	    console.log(recurce_count)
	}
	
	console.log('====postRunWorkflow local vars====\n',
		    `type= ${type}\n`,
		    `url= ${url}\n`,
		    `params= ${JSON.stringify(params)}\n`,
		    '==================\n')

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
		    console.log(error)
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
	    console.log(recurce_count)
	}
	
	console.log('====getMigratableWorkflows local vars====\n',
		    `type= ${type}\n`,
		    `url= ${url}\n`,
		    `params= ${JSON.stringify(params)}\n`,
		    '==================\n')

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
	    console.log(recurce_count)
	}
	
	console.log('====getDownloadMigratableWorkflows local vars====\n',
		    `type= ${type}\n`,
		    `url= ${url}\n`,
		    `params= ${JSON.stringify(params)}\n`,
		    '==================\n')

	//call
	let config = {
	    method: type,
	    url: url,
	    responseType: 'blob',
	    headers: {
		'Authorization': `OAuth oauth_consumer_key="${params.oauth_consumer_key}",oauth_signature_method="${params.oauth_signature_method}",oauth_signature="${params.oauth_signature}",oauth_timestamp="${params.oauth_timestamp}",oauth_nonce="${params.oauth_nonce}"`
	    }
	};
	
	return axios(config).then((response)=>{
	    return response
	}).catch(error => console.log(error))
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
	return oauthSignature.generate(httpMethod, url, parameters, secret, null)//, { encodeSignature: false})
    };

};


// @route GET/alteryx_migrate
// @desc migrates flagged alteryx workflows on dev to prod
// @access Admin Key/Secret
router.get('', (req, res)=> {
    console.log('in alteryx_migrate!')
 
    admin_gallery = new Gallery(`http://${secrets.alteryx_servers_details.dev.hostname}/gallery/api/admin/v1`,
			  secrets.alteryx_servers_details.dev.api_credintials.admin.key,
			 secrets.alteryx_servers_details.dev.api_credintials.admin.secret)

    // 1. get workflows that are migratable
    admin_gallery.getMigratableWorkflows().then(ans=>{
	// 2. loop through arrayed return
	ans.forEach(element => {
	    console.log(element)
	    admin_gallery.getDownloadMigratableWorkflows(element.id).then(ans=>{
		// 3. post to prod server TODO...
		try {
		    console.log(ans)//ans.data is blob
		    res.send('done')
		} catch (err){
		    console.error(err)
		    res.send(err)
		}
	    }).catch(error => res.send(error))
	})
    })
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


//Simplified Oauth 2.0 Tutorial - Example with Node.js
