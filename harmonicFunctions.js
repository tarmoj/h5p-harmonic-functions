var H5P = H5P || {};

// vt ja võrdle: https://github.com/h5p/h5p-mini-course/blob/master/scripts/mini-course.js

H5P.HarmonicFunctions = (function ($) {
	/**
	 * Constructor function.
	 */
	function C(options, id) {
		this.$ = $(this);
        const self = this;
		// Extend defaults with provided options

		// options: {functions , audioFile, notationImage} kirj
		// functions comes as a list of strings -  functins by measures. One measure can contain several functions like ["T", "SD", "T"]

		this.options = options;
		this.functions = options.functions;
		console.log("Options", this.options);
		// Keep provided id.
		this.id = id;

		this.responded = false;
		this.feedBack = "";

		this.inputCells = [];

		this.createInputCells = () =>  {

			console.log("createInputCells", this);

			this.inputCells = []; // clear -  not sure if it

			$inputDiv = $('<div>', {id: "inputDiv", class: ""});
			// kas kasutada mingit tabelit ja reastada nt 4 takti ritta? või grid?
			for (let i = 0; i < this.functions.length; i++) {
				const $inputCell = $('<input>', {
					id: "inputCell" + i + 1,
					class: "inputCell",
					// TODO: aria-label, jump to next cell?
                    attr: {index: i, 'aria-label': "function "+(i+1).toString() },
                    keyup: (event) => {
                        const index = parseInt(event.target.getAttribute("index"));
                        const input = event.target.value;
                        const functionCount = this.functions.length;
                        console.log("InputCell, key, index, input", event.key, index, input, /[t,s,d,m,T,S,D,M]/.test(event.key) );
                        let result = true;
                        let move = 0;

                        if ( ["t","s","d","m"].includes(event.key.toLowerCase()) && index<functionCount-1 ) { // if a function key, move to next
                           move = 1;
                        } else if (event.key==="ArrowRight" && index<functionCount-1) {
                            move = 1;
                        } else if (event.key==="ArrowLeft" && index>0) {
                            move = -1;
                        }

                        if (move!=0) {
                            this.inputCells[index+move].focus();
                        }

                        if (event.key==='Enter') {
                            console.log("Enter");
                            this.checkResponse();
                        }
                    }
                });
                
				console.log("createInputCells: ", this.functions[i], $inputCell);
				this.inputCells[i] = $inputCell;
				$inputDiv.append($inputCell);
			}

			console.log("inputDiv: ", $inputDiv);

			return $inputDiv;

		}

		this.checkResponse = () => {
			this.responded = true;
			let correct = true;
			for (let i=0; i<this.functions.length; i++) {
				const response = this.inputCells[i].val().toLocaleLowerCase();
				console.log("response: ", i, this.inputCells[i].val() );
				if (this.functions[i].toLocaleLowerCase() === response) {
					feedBack = "Õige!";
					this.inputCells[i].addClass("greenBorder");
				} else {
					feedBack = "Vale!";
					correct = false;
					this.inputCells[i].addClass("redBorder");
				}
			}


			console.log(feedBack);
			$("#feedbackDiv").html(feedBack).show();
			//$("#feedbackDiv").show();
			//document.getElementById("feedbackDiv").innerHTML = feedBack;
			//document.getElementById("notationImage").style.visibility = "visible";
            $("#notationImage").show();
            this.trigger("resize");
		}

	}



	/**
	 * Attach function called by H5P framework to insert H5P content into
	 * page
	 *
	 * @param {jQuery} $container
	 */
	C.prototype.attach = function ($container) {
		const self = this;
		// Set class on container to identify it as a greeting card
		// container.  Allows for styling later.
		$container.addClass("h5p-harmonic-functions");

		$container.append('<div>Explanation</div>');


		//audio
		if (self.options.audioFile.length>0) {
            
            
            // there were  Play/Stop buttons before, no need, use audio element for playback

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

			$container.append( [
                '<br>',    
				$('<div>').text("Enter functions:"),
				self.createInputCells(),
				$('<button/>', {
					text: "KONTROLLI",
					id: 'checkButton',
                    class: 'button',
					click:  ()  => {
						console.log("Check", self.options);
						self.checkResponse();
					}
				}),
                '<div />'
			] );


			// Add image if provided.
			// TODO: use jQuery hide/show perhaps
            // TODO: get parent width f
			if (this.options.notationImage) {
                const imagePath = H5P.getPath(this.options.notationImage.path, this.id);
				console.log("Image: ", imagePath);
                const $image = $('<img>', {
                    id: "notationImage",
                    class: "image",
                    alt: "notation image",
                    src: imagePath,
                    //width: "90%",
                    //load: () => self.trigger('resize')// to resize iframe // does not make sense, since hidden first
                    
                }).hide();
                $container.append($image);
// 				$container.append('<img id="notationImage" width="200" style="visibility:hidden" src="' + H5P.getPath(this.options.notationImage.path, this.id) + '">');
			}


			$container.append('<div id="feedbackDiv"></div>');


		} else {
			$container.append('<div>Could not create audio element</div>');
		}


	};

	return C;
})(H5P.jQuery);
