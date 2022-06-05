var H5P = H5P || {};

// vt ja võrdle: https://github.com/h5p/h5p-mini-course/blob/master/scripts/mini-course.js

H5P.HarmonicFunctions = (function ($) {
	/**
	 * Constructor function.
	 */
	function C(options, id) {
		this.$ = $(this);
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
				const response = this.inputCells[i].val();
				console.log("response: ", i, this.inputCells[i].val() );
				if (this.functions[i] === response) {
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
			audio.setAttribute('controls', false);
			const source = document.createElement('source');
			source.src = H5P.getPath(relativeAudioFilePath,self.id)
			audio.appendChild(source);
			$container.append(audio);

			$container.append('<br>')
			$container.append( [
				$('<div>').text("Enter functions:"),
				self.createInputCells(),
				$('<button/>', {
					text: "KONTROLLI",
					id: 'checkButton',
					click: function () {
						console.log("Check", self.options);
						self.checkResponse();
					}
				})
			] );


			// Add image if provided.
			// TODO: use jQuery hide/show perhaps
			if (this.options.notationImage) {
				console.log("Image: ", H5P.getPath(this.options.notationImage.path, this.id));
				$container.append('<img id="notationImage" width="200" style="visibility:hidden" src="' + H5P.getPath(this.options.notationImage.path, this.id) + '">');
			}


			$container.append('<div id="feedbackDiv"></div>');


		} else {
			$container.append('<div>Could not create audio element</div>');
		}


	};

	return C;
})(H5P.jQuery);
