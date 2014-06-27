
(function () {
	// taking from HTML5 Shiv v3.6.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
	var supportsUnknownElements = false;

	String.prototype.mapJoin = function(){
		return function(){
			return "";
		}
	}

	(function () {
		try {
			var a = document.createElement('a');
			a.innerHTML = '<xyz></xyz>';

			supportsUnknownElements = a.childNodes.length == 1 || (function () {
				// assign a false positive if unable to shiv
				(document.createElement)('a');
				var frag = document.createDocumentFragment();
				return (
					typeof frag.cloneNode == 'undefined' ||
						typeof frag.createDocumentFragment == 'undefined' ||
						typeof frag.createElement == 'undefined'
					);
			}());
		} catch (e) {
			// assign a false positive if detection fails => unable to shiv
			supportsUnknownElements = true;
		}
	}());


	steal.config({
		map: {
			"can/util/util": "can/util/jquery/jquery",
			"jquery/jquery": "jquery",
			'fileupload'           : 'bower_components/blueimp-file-upload/js/jquery.fileupload',
			'jquery.ui.widget'     : 'bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget'
		},
		paths: {
			"jquery": "bower_components/jquery/dist/jquery.js",
			"can/*": "bower_components/canjs/*.js"

		},
		meta: {
			jquery: {
				exports: "jQuery",
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			},
		},
		ext: {
			ejs: "can/view/ejs/system",
			mustache: "can/view/mustache/system",
			stache: "can/view/stache/system"
		},
		bundle: ["components/home","components/bootstrap","components/login","components/jquery-ui"],
		root: {
			toString : function(){
				return "/";
			}
		}
	});
})();


System.buildConfig = {map: {"can/util/util" : "can/util/domless/domless"}};
