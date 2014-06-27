module.exports = function(grunt) {

	grunt.initConfig({
		connect: {
			server: {
				options: {
					port: 9001,
					middleware : function(connect, options, middlewares){
						middlewares.unshift(function(req, res, next){
							var url = req.url,
								method = req.method;

							console.log('fooo bar', url, method)
							if(method.toLowerCase() === 'post' && req.url === '/_upload'){
								res.writeHead(200, { 'Content-Type': 'application/json'});
								res.end('{}');
							} else {
								next();
							}
							
						});
						return middlewares
					}
				}
			}
		}
	});

	grunt.registerTask('default', ['connect:server:keepalive']);

	grunt.loadNpmTasks('grunt-contrib-connect');

};