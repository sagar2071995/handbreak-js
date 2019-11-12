// sudo apt-get remove --autoremove handbrake-gtk handbrake-cli
// sudo add-apt-repository --remove ppa:stebbins/handbrake-releases
var fs = require('fs');
var url = require('url');
var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
const hbjs = require('handbrake-js')
const Hapi = require("hapi");

const server = new Hapi.server({
   "host":"localhost",
   "port":3000
});

const init = async ()=>{
   var DOWNLOAD_DIR = './downloads/';
   var file_url = 'http://d1wjq3lf1mpgat.cloudfront.net/1571209327071.webm'
   await server.start();
   console.log("Listening at:",server.info.uri);
   var options = {
      host: url.parse(file_url).host,
      port: 80,
      path: url.parse(file_url).pathname
    };
    var file_name = url.parse(file_url).pathname.split('/').pop();
    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
    await http.get(options, function(res) {
      res.on('data', function(data) {
        file.write(data);
      }).on('end', function() {
        file.end();
         hbjs.spawn({
         input: './downloads/'+file_name,
         output : file_name.split('.')[0]+'.mp4',
         preset : 'Universal'
        })
        .on('progress', progress => {
            // console.log("Progress:",progress);
         })
         .on('complete', (comp) => {
            // console.log("Completed:",comp);
            fs.unlinkSync('./downloads/'+file_name)
         });
      });
    });
}
process.on('unhandledRejection',(err)=>{
   console.log(err);
   process.exit(1);
});

init();
