const express = require('express')
const app = express()
const bodyParser = require("body-parser")

const secrets = require("./secrets/secrets")



const port = secrets.app_server_details.port

app.get('/', (req, res) => {
    res.send("Welcome to wiz-teryx's splash page!!!")
})


const RunPyRoute = require("./routes/run_py")
const AlteryxMigrate = require("./routes/alteryx_migrate")

app.use(bodyParser.json())
app.use("/run_py",RunPyRoute)
app.use("/alteryx_migrate", AlteryxMigrate)



app.listen(port, () => {
    console.log(`listening a http://localhost:${port}`)    
})


