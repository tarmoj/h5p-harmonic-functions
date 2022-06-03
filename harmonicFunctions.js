var H5P = H5P || {};

// vt ja võrdle: https://github.com/h5p/h5p-mini-course/blob/master/scripts/mini-course.js

H5P.HarmonicFunctions = (function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    this.$ = $(this);
    // Extend defaults with provided options
	
	// options: {functions, audioFile, notationImage}

	this.options = options;
	// Keep provided id.
    this.id = id;
	
	this.responded =  false;
	this.feedBack = "";
	
	
  };
  
  
  function checkResponse (correctFunctions) {
	    // this is very temporary and simplified version!
		this.responded = true;
		const responseString = document.getElementById("responseString").value.toLowerCase();
		const functionString = correctFunctions.replaceAll(",", "").replace(/ /g, "").toLowerCase();
		console.log("Check response:", responseString, functionString);
		let feedBack = "";
		if (responseString===functionString) {
			feedBack = "Õige!";
		} else {
			feedBack = "Vale! Õige on: " + functionString;
		}
		console.log(feedBack);
		//$("#feedbackDiv").html = feedBack; // does not work 
		document.getElementById("feedbackDiv").innerHTML = feedBack; 
		document.getElementById("notationImage").style.visibility = "visible";
  }
  
  
  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var self = this;
    // Set class on container to identify it as a greeting card
    // container.  Allows for styling later.
	$container.addClass("h5p-harmonicfunctions");
	
    
	
	$container.append('<h1>Funktsioonid</h1>');
   
   
    //audio
    if (self.options.audioFile.length>0) {
		
		$container.append($('<button/>', {
			text: "MÄNGI", //set text 1 to 10
			id: 'startButton',
			click: function () { document.getElementById("audioPlayer").play();   } 
			
			}
		));
		
		$container.append($('<button/>', {
			text: "STOP", //set text 1 to 10
			id: 'stopButton',
			click: function () {
				console.log("Stop");
				//$("#audioPlayer").pause();  //$(...).pause is not a function
				const audioPlayer = document.getElementById("audioPlayer");
				audioPlayer.pause();
				audioPlayer.currentTime = 0;
				
			} 
			
			}
		));	
		
		// TODO: create audio element with jQuery? Is it easier?
        const relativeAudioFilePath = self.options.audioFile[0].path;
        console.log("Create audio for: ", relativeAudioFilePath);
        const audio= document.createElement('AUDIO');
        audio.setAttribute("id", "audioPlayer");
        audio.setAttribute('controls', true);
        const source = document.createElement('source');
        source.src = H5P.getPath(relativeAudioFilePath,self.id)
        audio.appendChild(source);
        $container.append(audio);
		
		$container.append('<br>')
		$container.append('<div class="greeting-tex"> Sisetage funktioonid (nt: ts ts dt) <input type="text" id="responseString"/></div>');
		
		$container.append($('<button/>', {
			text: "KONTROLLI", 
			id: 'checkButton',
			click: function () {
				console.log("Check", self.options);
				checkResponse(self.options.functions);				
			} 
			
		}));		
		
		// Add image if provided.
		if (this.options.notationImage) {
			console.log("Image: ", H5P.getPath(this.options.notationImage.path, this.id));
			$container.append('<img id="notationImage" width="200" style="visibility:hidden" src="' + H5P.getPath(this.options.notationImage.path, this.id) + '">');
		}
		
		
		$container.append('<div id="feedbackDiv"></div>');	
		
		
    } else {
		$container.apped('<div>Audio elementi ei õnnestunud luua</div>');
	}
 	
    
  };

  return C;
})(H5P.jQuery);
