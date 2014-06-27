steal(
'can/component',
'./init.stache!',
'can/model',
'can/util/fixture',
'./uploader.less!', 
'fileupload',
'can/construct/proxy',
function(Component, initView, Model, fixture){
	

	// Model constructor, used to save file metadata
	var File = Model.extend({
		create : 'POST /api/files',
		destroy : 'DELETE /api/files/{id}',
	}, {});


	// Create fixtures for the file metadata
	var id = 0;
	fixture.delay = 2000;
	fixture('POST /api/files', function(req){
		var id = id++,
			data = req.data;

		data.isProcessed = true;
		data.id = id;

		return data;
	});

	fixture('DELETE /api/files/{id}', function(){
		return {}
	})

	Component.extend({
		tag : 'rt-uploader',
		template : initView,
		scope : {
			init : function(){
				// Initialize files as an empty array
				this.attr('files', []);
			},
			// When user clicks the remove file button,
			// just remove it from the list, we'll handle 
			// everything else in the control (`events` object)
			removeUpload : function(file, ev, el){
				var idx = this.files.indexOf(file);
				if(confirm('Are you sure?')){
					this.files.splice(idx, 1);
				};
			}
		},
		helpers : {
			// Pretty format for the file size
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
			// Initialize the fileupload library when the `rt-uploader` element
			// is inserted in the page
			// 
			// `rt-uploader` will be used as a target for the drag and drop of files
			" inserted" : function(){
				this.element.find('.select-files').fileupload({
					dropZone : this.element,
					limitMultiFileUploads : 1,
					url : '/_upload',
					add : this.proxy('fileUploadAdd')
				});
			},
			// When file is uploaded create a new instance of the `File` and 
			// populate it with the data provided by the fileupload lib
			// 
			// `uploadId` is used to so we can grab the uploader and abort
			// the file upload
			// 
			// we save the function that aborts the upload in the object so
			// we can grab it later
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
			// listen to the `fileuploadprogress` event and update the progress 
			".select-files fileuploadprogress" : function(el, ev, data){
				data.uploader.attr('progress', parseInt(data.loaded / data.total * 100, 10));
			},
			// when file is uploaded we will save metadata to a different location
			// this way we can upload the file to a different server (eg. S3)
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
			// when file is removed from the list (user clicked on the remove file button)
			// we iterate through the list of the removed files and check if it has the `uploadId`
			// attribute. If it has, it means that file is still uploading and we cancel the upload
			// otherwise we delete the file
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
			// We prevent the default behavior for the `dragover` and `drop` events on the 
			// document since drag and drop is handled by the file upload component
			"{document} drop" : function(el, ev){
				ev.preventDefault();
			},
			"{document} dragover" : function(el, ev){
				ev.preventDefault();
			}
		}
	});
})