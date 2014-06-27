steal(
'can/component',
'./init.stache!',
'can/model',
'can/util/fixture',
'./uploader.less!', 
'fileupload',
'can/construct/proxy',
function(Component, initView, Model, fixture){
	
	var File = Model.extend({
		create : 'POST /api/files'
	}, {});

	var id = 0;

	fixture.delay = 2000;

	fixture('POST /api/files', function(req){
		var id = id++,
			data = req.data;

		data.isProcessed = true;
		data.id = id;

		return data;
	});

	Component.extend({
		tag : 'rt-uploader',
		template : initView,
		scope : {
			init : function(){
				this.attr('files', []);
			},
			removeUpload : function(file, ev, el){
				var idx = this.files.indexOf(file);
				if(confirm('Are you sure?')){
					this.files.splice(idx, 1);
				};
			}
		},
		helpers : {
			formatByteSize : function(size){
				var i = -1;
				var byteUnits = ['kB', 'MB', 'GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];

				size = size();

				do {
					size = size / 1024;
					i++;
				} while (size > 1024);

				return Math.max(size, 0.1).toFixed(1) + byteUnits[i];
			}
		},
		events : {
			" inserted" : function(){
				this.element.find('.select-files').fileupload({
					dropZone : this.element,
					limitMultiFileUploads : 1,
					url : '/_upload',
					add : this.proxy('fileUploadAdd')
				});
			},
			fileUploadAdd : function(ev, data){
				var uploader = new File({
					filename : data.files[0].name,
					size     : data.files[0].size,
					progress : 0,
					uploadId : (new Date()).getTime()
				}), jqXHR;

				data.uploader = uploader;

				jqXHR = data.submit();

				this._uploads = this._uploads || {};
				this._uploads[uploader.uploadId] = $.proxy(jqXHR.abort, jqXHR);

				this.scope.files.push(uploader);
			},
			".select-files fileuploadprogress" : function(el, ev, data){
				data.uploader.attr('progress', parseInt(data.loaded / data.total * 100, 10));
			},
			".select-files fileuploaddone" : function(el, ev, data){
				var file     = data.uploader,
					uploadId = file.attr('uploadId');

				file.attr({
					progress : 100,
					url : data.location
				});

				file.removeAttr('uploadId');
				file.save();

				delete this._uploads[uploadId];
				delete data.uploader;
			},
			"{scope.files} remove" : function(files, ev, removed, prop){
				var self = this;
				if(typeof prop === 'number'){
					can.each(removed, function(file){
						var uploadId = file.attr('uploadId');
						if(self._uploads[uploadId]){
							self._uploads[uploadId]();
							delete self._uploads[uploadId];
						} else {
							file.destroy();
						}
					});
				}
			},
			"{document} drop" : function(el, ev){
				ev.preventDefault();
			},
			"{document} dragover" : function(el, ev){
				ev.preventDefault();
			}
		}
	});
})