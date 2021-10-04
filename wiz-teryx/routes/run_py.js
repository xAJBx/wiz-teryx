const express = require('express')
const router = express.Router()
const {PythonShell} = require('python-shell')

const secrets = require("../secrets/secrets")

// @desc  assumption is that the py_scripts dirrectory is one dirrectory back and in "py_scripts"
function get_py_script_dir_path(current_dir){
    current_path_array = current_dir.split("\\")
    current_path_array.pop()
    root_path_array = current_path_array
    
    root_path_array.push('py_scripts')
    py_script_dir = root_path_array

    
    return py_script_dir.join('\\')
}


// @route  GET /run_py
// @desc   runs python script in py_scripts
// @access eventually private
router.get('', (req, res) => {
    console.log('in run_py!!')
    console.log(req.body)
    // Python script and arguments must be provided
    const {script, args} = req.body
    // split arguments into an array
    args_array = args.split(',')
    // set options for python script
    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        //scriptPath: get_py_script_dir_path(__dirname), //If you are having python_test.py script in same folder, then it's optional.
	scriptPath: secrets.app_server_details.root + "/py_scripts/", // builds py_scripts dirrectory from project root path
        args: [args_array[0]] //An argument which can be accessed in the script using sys.argv[1]
    };

    console.log(`Running python script: ${script} with argument ${args_array[0]}`) 
    PythonShell.run(script,options,function(err, result){
	if(err) throw err
	res.send(result.toString())
    })
})

module.exports = router







