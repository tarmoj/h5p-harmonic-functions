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

		// now exercises is a list from version 1.1.0
		this.exercises = options.exercises;
		//console.log("Nunmber of exercises: ", this.exercises.length);
		if (this.exercises.length ==0 ) {alert("No exercises defined"); return; }

		// Keep provided id.
		this.id = id;

		this.exerciseIndex = 0;

        this.l10n = $.extend(true, {}, {
            "explanation": "Enter the harmonic functions of the musical excerpt -  T, S, D or M (tonic, subdominant, dominant or mediant)",
            "check": "Check",
            "enterFunctions": "Enter functions",
            "correct": "Correct",
            "wrong": "Wrong",
            "couldNotCreateAudioElement": "Could not create Audio element",
			"selectDictation": "Select dictation",
			"correctAnswerIs": "Correct is: ",
			"youHaveAnswered": "You have already answered",
			"previous": "Previous",
			"next": "Next",
			"euSupportText": "The project is supported by European Social Fund",
			"disclaimerText": "This is not an official H5P.org content type. With any problems please turn to the author tarmo.johannes@muba.edu.ee "
        }, options.l10n);
        
        //this.l10n = options.l10n;

		this.responded = false;

		this.inputCells = [];
		this.functionArray = [];


		// methods  ---------------


		this.loadExercise = (index) => {
			console.log("Load, index", index);
			if (index<0 || index>=this.exercises.length) {
				console.log("exercise index out of rangeg");
				return;
			}

			this.exerciseIndex = index;
			this.functionArray = this.getFunctionArray(index);

			// create new inputCells
			$("#cellContainer").html( this.createInputCells() );

			// set andwered to false and clear feedback
			this.responded = false;
			$("#feedbackDiv").html("");

			// audio
			const audioFile = this.exercises[index].audioFile;
			const relativeAudioFilePath = audioFile[0].path;
			const absolutePath = H5P.getPath(relativeAudioFilePath, this.id);
			console.log("Create audio for: ", absolutePath);

			$("#audioPlayer").attr("src", absolutePath);
			$("#audioPlayer")[0].load();
			//console.log("audio now:", $("#audioPlayer")[0]);

			// load new picture (notation) if present
			const notationImage = this.exercises[index].notationImage;
			if (notationImage) {
				const imagePath = H5P.getPath(notationImage.path, this.id);
				console.log("Image: ", imagePath);
				$("#notationImage").attr("src", imagePath).hide();
				$("#notationImage").trigger("load");
			}
		}

		this.getFunctionArray = (index) => { // functions are given as array by bars, one bar may contain several functions. break into array of arrays (by bar, like [ ["T"], ["T","D"] ]
			const functionBars = this.exercises[index].functions;
			const functionArray = [];
			for (let bar of functionBars) {
				const barArray = [];
				for (let i=0; i<bar.length; i++) { // iterate by letters, test if function, push to array
					const f = bar[i].toUpperCase();
					if (["T","S","D","M"].includes(f)) {
						barArray.push(f);
					}
				}
				functionArray.push(barArray);
			}
			// console.log("FunctionArray: ", functionArray);
			return functionArray;
		}

		this.createInputCells = () =>  {

			// console.log("createInputCells", this);

			this.inputCells = []; // clear
			const functionCount = this.functionArray.flat().length;
			// console.log("functions found:", functionCount);

			//const functions = this.exercises[this.exerciseIndex].functions;

			$inputDiv = $('<div>', {id: "inputDiv"});
			// kas kasutada mingit tabelit ja reastada nt 4 takti ritta? või grid?
			// või lihtsalt 4 takti järel <br />
			let barCounter = 0, i = 0;
			for (let functionBar of this.functionArray) {
				for (let j=0; j<functionBar.length; j++) {
					const $inputCell = $('<input>', {
						id: "inputCell" + i + 1,
						class: "inputCell",
						attr: {index: i, 'aria-label': "function " + (i + 1).toString()},
						keyup: (event) => {
							const index = parseInt(event.target.getAttribute("index"));
							const input = event.target.value;

							//console.log("InputCell, key, index, input", event.key, index, input, /[t,s,d,m,T,S,D,M]/.test(event.key));
							let move = 0;

							if (["t", "s", "d", "m"].includes(event.key.toLowerCase()) && index < functionCount - 1) { // if a function key, move to next
								move = 1;
							} else if (event.key === "ArrowRight" && index < functionCount - 1) {
								move = 1;
							} else if (event.key === "ArrowLeft" && index > 0) {
								move = -1;
							}

							if (move != 0) {
								this.inputCells[index + move].focus();
							}

							if (event.key === 'Enter') {
								//console.log("Enter");
								this.checkResponse();
							}
						}
					});

					if (j===functionBar.length-1) { // if last bar in measure, add a bit bigger right margin, otherwise narrow
						$inputCell.addClass("right-margin");
					}

					//console.log("createInputCells: ", functions[i], $inputCell);
					this.inputCells[i] = $inputCell;
					$inputDiv.append($inputCell);
					i+=1;
				}
				barCounter += 1;
				if (barCounter%4===0) {
					$inputDiv.append("</br>");
				}
			}

			//console.log("inputDiv: ", $inputDiv);

			return $inputDiv;

		}

		this.createMenuRow = () => {
			const $menuDiv = $("<div>", {id: "menuDiv", class: "vertical-center"});
			const $exerciseMenu =   $('<select>', {
				id: "exerciseSelect",
				attr: {'aria-label': this.l10n.selectDictation},
				class: "select",
				change:  (event) => {
					//console.log("option", event.target.selectedIndex, event.target);
					const exerciseIndex = event.target.selectedIndex; //parseInt(event.target.value);
					// console.log("Change", exerciseIndex);
					this.loadExercise(exerciseIndex);
				}
			}) ;
			for (let i= 0; i<this.exercises.length; i++) {
				//console.log("Adding exercise to menu: ", this.exercises[i].title)
				$exerciseMenu.append( $('<option>').text(this.exercises[i].title).val(i) );
			}
			$menuDiv.append([
				$('<span>').text(this.l10n.selectDictation), // TODO: perhaps bigger, bold ors
				$('<button>', {
					id: "backButton",
					class: "button",
					text: "<",
					attr: {'aria-label': this.l10n.previous},
					click: (event) => {
						if (this.exerciseIndex>0) {
							//console.log("Back");
							$("#exerciseSelect")[0].selectedIndex=this.exerciseIndex-1;
							$("#exerciseSelect").trigger("change");
						}
					}
				}),
				$exerciseMenu,
				// vt stiil forward & next: https://www.w3schools.com/howto/howto_css_next_prev.asp
				$('<button>', {
					id: "forwardButton",
					class: "button",
					attr: {'aria-label': this.l10n.next},
					text: ">",
					click: (event) => {
						if (this.exerciseIndex<this.exercises.length-1) {
							//console.log("Forward");
							$("#exerciseSelect")[0].selectedIndex=this.exerciseIndex + 1;
							$("#exerciseSelect").trigger("change");
						}
					}
				}),
			]);
			return $menuDiv;
		};


		this.checkResponse = () => {
			if (this.responded) { alert(this.l10n.youHaveAnswered); return; } // TODO: translation

			this.responded = true;
			let correct = true;
			//let feedBack = "";
			const functions =  this.functionArray.flat(); //this.exercises[this.exerciseIndex].functions;
			for (let i=0; i<functions.length; i++) {
				const response = this.inputCells[i].val().toLowerCase();
				console.log("response: ", i, this.inputCells[i].val() );
				if (functions[i].toLowerCase() === response) {
					//feedBack = this.l10n.correct;
					this.inputCells[i].addClass("greenBorder");
					correct &&= true;
				} else {
					//feedBack = this.l10n.wrong + "! ";
					//feedBack += this.l10n.correctAnswerIs + " " + functions.join(" ");
					correct = false;
                    this.inputCells[i].val(this.inputCells[i].val() + "|" + functions[i]);
					this.inputCells[i].addClass("redBorder");
				}
			}

			const feedBack = correct ?  this.l10n.correct : this.l10n.wrong + "! " + this.l10n.correctAnswerIs + " " + functions.join(" ");

            if (this.exercises[this.exerciseIndex].notationImage) {
				$("#notationImage").show();
				this.trigger("resize");
			}
			console.log(feedBack);
			$("#feedbackDiv").html(feedBack).show().focus(); // focus necessary for screen reader support
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

		$container.append( this.createMenuRow() );

		$container.append($('<div>').text(this.l10n.explanation ));


		// create elements here, fill with content with loadExercise() below

		//audio
		$container.append( $('<audio>', {
			id: "audioPlayer",
			class: "shadow",
			controls: true
		}) );

		$container.append( [
			'<br>',
			$('<div>').text(this.l10n.enterFunctions),

			$('<div>', {id: "cellContainer"}).html( self.createInputCells() ),

			$('<button/>', {
				text: this.l10n.check,
				id: 'checkButton',
				class: 'top-margin h5p-joubelui-button',
				click:  ()  => {
					self.checkResponse();
				}
			}),
			'<br />'
		] );

		$container.append('<div id="feedbackDiv" tabindex="0"></div>'); // tabIndex for making it focusable

		// Add image if provided.

		const $image = $('<img>', {
			id: "notationImage",
			class: "image",
			alt: "notation image",
		}).hide();
		$container.append($image);


		const $disclaimerDiv = $('<div>', {id:"disclaimerDiv"}).html("<br /><small>" + this.l10n.disclaimerText +  "</small>");
		$container.append($disclaimerDiv);

		// const euLogoPath = H5P.getLibraryPath(this.libraryInfo.versionedNameNoSpaces) + "/eu.jpg";
		// console.log("logo path:", euLogoPath);
		// const $euDiv = $('<div>', {id:"euDiv"}).html("<br /><p><small>" + this.l10n.euSupportText +  "</small></p>");
		// $euDiv.append(
		// 	$('<img>', {
		// 		id: "euLogo",
		// 		alt: "The project is supported by EU social Fund",
		// 		width: "200px",
		// 		align: "left",
		// 		src: euLogoPath,
		// 		load: () => this.trigger("resize")
		// 	})
		// );
		//
		// $container.append($euDiv);


		const currentIndex =  $("#exerciseSelect")[0].selectedIndex; // not sure if this is necessary or works at all...
		if (currentIndex>=0 ) {
			this.loadExercise(currentIndex);
		} else {
			this.loadExercise(0);
		}

	};

	return C;
})(H5P.jQuery);
