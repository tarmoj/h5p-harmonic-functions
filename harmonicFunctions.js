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

		// now exercises is a list from version 1.1.0
		this.exerises = options.exercises;
		console.log("Nunmber of exercises: ", this.exerises.length);
		if (this.exerises.length ==0 ) {alert("No exercises defined"); return; }

		// Keep provided id.
		this.id = id;

		this.exerciseIndex = 0;

		// TODO: create menu, set active exercise etc
        
        this.l10n = $.extend(true, {}, {
            "explanation": "Enter the harmonic functions of the musical excerpt -  T, S, D or M (tonic, subdominant, dominant or mediant)",
            "check": "Check",
            "enterFunctions": "Enter functions",
            "correct": "Correct",
            "wrong": "Wrong",
            "couldNotCreateAudioElement": "Could not create Audio element",
			"selectDictation": "Select dictation"
        }, options.l10n);
        
        //this.l10n = options.l10n;
        
        
        


		this.responded = false;
		this.feedBack = "";

		this.inputCells = [];

		this.createInputCells = () =>  {

			console.log("createInputCells", this);

			this.inputCells = []; // clear -  not sure if it

			const functions = this.exerises[this.exerciseIndex].functions;

			$inputDiv = $('<div>', {id: "inputDiv", class: ""});
			// kas kasutada mingit tabelit ja reastada nt 4 takti ritta? või grid?
			for (let i = 0; i < functions.length; i++) {
				const $inputCell = $('<input>', {
					id: "inputCell" + i + 1,
					class: "inputCell",
					// TODO: aria-label, jump to next cell?
                    attr: {index: i, 'aria-label': "function "+(i+1).toString() },
                    keyup: (event) => {
                        const index = parseInt(event.target.getAttribute("index"));
                        const input = event.target.value;
                        const functionCount = functions.length;
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
                
				console.log("createInputCells: ", functions[i], $inputCell);
				this.inputCells[i] = $inputCell;
				$inputDiv.append($inputCell);
			}

			console.log("inputDiv: ", $inputDiv);

			return $inputDiv;

		}

		this.createMenuRow = () => {
			const $menuDiv = $("<div>", {id: "menuDiv", class: "vertical-center"});
			const $exerciseMenu =   $('<select>', {
				id: "exerciseSelect",
				class: "select",
				change:  (event) => {
					const exerciseTitle = event.target.value;
					console.log("Change", exerciseTitle);
					// load new exercise... // we need function this.loadExercise() that us cakked from attach and here...
				}
			}) ;
			for (let exercise of this.exerises) {
				console.log("Adding exercise to menu: ", exercise.title)
				$exerciseMenu.append( $('<option>').text(exercise.title).val(exercise.title) );
			}
			$menuDiv.append([
				$('<span>').text(this.l10n.selectDictation), // TODO: perhaps bigger, bold ors
				$('<button>', {
					id: "backButton",
					class: "button",
					text: "<",
					click: (event) => {
						if (this.exerciseIndex>0) {
							this.exerciseIndex -= 1;
							console.log("Exerise index: ", this.exerciseIndex);
							// TODO: reload new
						}
					}
				}),
				$exerciseMenu,
				$('<button>', {
					id: "forwardButton",
					class: "button",
					text: ">",
					click: (event) => {
						if (this.exerciseIndex<this.exerises.length-1) {
							this.exerciseIndex += 1;
							console.log("Exerise index: ", this.exerciseIndex);
							// TODO: reload new
						}
					}
				}),
			]); // append also buttons later
			return $menuDiv;
		};


		this.checkResponse = () => {
			this.responded = true;
			let correct = true;
			const functions = this.exerises[this.exerciseIndex].functions;
			for (let i=0; i<functions.length; i++) {
				const response = this.inputCells[i].val().toLowerCase();
				console.log("response: ", i, this.inputCells[i].val() );
				if (functions[i].toLowerCase() === response) {
					feedBack = this.l10n.correct;
					this.inputCells[i].addClass("greenBorder");
				} else {
					feedBack = this.l10n.wrong;
					correct = false;
                    this.inputCells[i].val(this.inputCells[i].val() + "|" + functions[i]);
					this.inputCells[i].addClass("redBorder");
				}
			}


			console.log(feedBack);
			$("#feedbackDiv").html(feedBack).show();
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

		$container.append( this.createMenuRow );

		$container.append($('<div>').text(this.l10n.explanation ));

		const audioFile = this.exerises[this.exerciseIndex].audioFile;

		//audio
		if (audioFile.length>0) {

            // there were  Play/Stop buttons before, no need, use audio element for playback

			// TODO: create audio element with jQuery? Is it easier?
			const relativeAudioFilePath = audioFile[0].path;
			console.log("Create audio for: ", relativeAudioFilePath);
			const audio= document.createElement('AUDIO');
			audio.setAttribute("id", "audioPlayer");
			audio.setAttribute('controls', true);
			audio.className = "shadow";
			const source = document.createElement('source');
			source.src = H5P.getPath(relativeAudioFilePath,self.id)
			audio.appendChild(source);
			$container.append(audio);

			$container.append( [
                '<br>',    
				$('<div>').text(this.l10n.enterFunctions),
				self.createInputCells(),
				$('<button/>', {
					text: this.l10n.check,
					id: 'checkButton',
                    class: 'button',
					click:  ()  => {
						self.checkResponse();
					}
				}),
                '<br />'
			] );


			// Add image if provided.
			const notationImage = this.exerises[this.exerciseIndex].notationImage;
			if (notationImage) {
                const imagePath = H5P.getPath(notationImage.path, this.id);
				console.log("Image: ", imagePath);
                const $image = $('<img>', {
                    id: "notationImage",
                    class: "image",
                    alt: "notation image",
                    src: imagePath,   
                }).hide();
                $container.append($image);
			}


			$container.append('<div id="feedbackDiv"></div>');


		} else {
			$container.append($('<div>').text(this.l10n.couldNotCreateAudioElement) );
		}

	};

	return C;
})(H5P.jQuery);
